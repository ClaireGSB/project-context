// src/index.ts
import * as fs from 'fs';
import * as path from 'path';
import { ensureConfigExists, updateIncludedPaths, readConfig } from './config';

function normalizePath(p: string): string {
  return path.normalize(p);
}

// Get command line arguments
const args = process.argv.slice(2);
const reset = args[0] === 'reset';
const targetDir = path.resolve(reset ? args[1] : args[0]);
const absoluteTargetDir = path.resolve(targetDir);

function escapeXml(unsafe: string): string {
  if (unsafe === undefined) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
    return c;
  });
}

function getAllAvailablePaths(dir: string, config: { ignored_paths: string[] }): string[] {
  const paths = new Set<string>();
  
  function traverse(currentDir: string) {
    try {
      if (!fs.existsSync(currentDir)) {
        console.warn(`Warning: Directory does not exist: ${currentDir}`);
        return;
      }

      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const relativePath = path.relative(absoluteTargetDir, fullPath);

        if (config.ignored_paths.some(ignorePath => relativePath.startsWith(ignorePath))) {
          continue;
        }

        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            traverse(fullPath);
          } else {
            paths.add(relativePath);
          }
        } catch (err) {
          console.warn(`Warning: Unable to access ${fullPath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (err) {
      console.warn(`Warning: Error reading directory ${currentDir}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  traverse(dir);
  return Array.from(paths).sort();
}

function getProjectInfo(targetDir: string): string {
  try {
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.warn('Warning: package.json not found in target directory');
      return '<projectInfo><warning>No package.json found</warning></projectInfo>';
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    let info = '<projectInfo>\n';

    if (packageJson.name) info += `  <name>${escapeXml(packageJson.name)}</name>\n`;
    if (packageJson.description) info += `  <description>${escapeXml(packageJson.description)}</description>\n`;
    if (packageJson.version) info += `  <version>${escapeXml(packageJson.version)}</version>\n`;

    if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
      info += '  <dependencies>\n';
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        info += `    <dependency>
      <name>${escapeXml(name)}</name>
      <version>${escapeXml(version as string)}</version>
    </dependency>\n`;
      });
      info += '  </dependencies>\n';
    }

    info += '</projectInfo>';
    return info;
  } catch (err) {
    console.error('Error reading package.json:', err instanceof Error ? err.message : String(err));
    return '<projectInfo><error>Unable to read package.json</error></projectInfo>';
  }
}

function generateFileTree(dir: string, config: { excluded_from_file_tree: string[] }, prefix: string = ''): string {
  let result = '';
  try {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: Directory does not exist: ${dir}`);
      return result;
    }

    const files = fs.readdirSync(dir);
    files.forEach((file, index) => {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(absoluteTargetDir, filePath);

      if (config.excluded_from_file_tree.some(excludedPath => relativePath.startsWith(excludedPath))) {
        return;
      }

      try {
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        
        if (stats.isDirectory()) {
          result += `${prefix}${isLast ? '└── ' : '├── '}${file}/\n`;
          result += generateFileTree(filePath, config, `${prefix}${isLast ? '    ' : '│   '}`);
        } else {
          result += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
        }
      } catch (err) {
        console.warn(`Warning: Unable to access ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  } catch (err) {
    console.warn(`Warning: Error reading directory ${dir}: ${err instanceof Error ? err.message : String(err)}`);
  }
  return result;
}

function getFileContents(config: { included_paths: string[] }): string {
  let result = '';
  
  for (const includedPath of config.included_paths) {
    const filePath = path.join(absoluteTargetDir, includedPath);
    
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        result += `
          <file>
            <path>${escapeXml(includedPath)}</path>
            <content><![CDATA[${content}]]></content>
          </file>
        `;
        console.log(`Added ${includedPath} to context.`);
      }
    } catch (err) {
      console.warn(`Warning: Unable to read file ${includedPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return result;
}

function generateProjectContext(config: { excluded_from_file_tree: string[], included_paths: string[] }): void {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<projectContext>
  ${getProjectInfo(absoluteTargetDir)}
  <fileTree>
    <![CDATA[
${generateFileTree(absoluteTargetDir, config)}
    ]]>
  </fileTree>
  <fileContents>
    ${getFileContents(config)}
  </fileContents>
</projectContext>`;

  // const outputPath = path.join(process.cwd(), 'project-context.xml');
  const outputPath = path.join(absoluteTargetDir, 'project-context.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');
  console.log(`Project context has been generated in ${outputPath}`);
}

// Main execution
if (!fs.existsSync(absoluteTargetDir)) {
  console.error(`Error: Target directory does not exist: ${absoluteTargetDir}`);
  process.exit(1);
}

// Get or create config file
const configPath = ensureConfigExists(targetDir, []);
const config = readConfig(configPath);

// Get all available paths
const allPaths = getAllAvailablePaths(absoluteTargetDir, config);

// Update the config file with new paths
updateIncludedPaths(configPath, allPaths, reset);

// Read the updated config
const updatedConfig = readConfig(configPath);

// Generate the XML context file using the config
generateProjectContext(updatedConfig);

console.log(`\nConfig file ${reset ? 'reset' : 'updated'} successfully at ${configPath}`);
