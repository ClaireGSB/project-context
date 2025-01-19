// src/config.ts
import * as fs from 'fs';
import * as path from 'path';
import * as TOML from 'toml';

export interface ProjectConfig {
  excluded_from_file_tree: string[];
  ignored_paths: string[];
  included_paths: string[];
}

const DEFAULT_CONFIG: Omit<ProjectConfig, 'included_paths'> = {
  excluded_from_file_tree: [
    '.nuxt',
    '.git',
    '.output',
    'node_modules',
    ".project-context.toml",
    "build",
    "dist",
  ],
  ignored_paths: [
    '.nuxt',
    '.output',
    'yarn.lock',
    'node_modules',
    '.git',
    ".project-context.toml",
    "build",
    "dist",
  ],
};

export function getConfigPath(targetDir: string): string {
  return path.join(targetDir, '.project-context.toml');
}

export function createConfigFile(configPath: string, includedPaths: string[]): void {
  const configContent = `# Files/directories to exclude from tree visualization
excluded_from_file_tree = [
  ${DEFAULT_CONFIG.excluded_from_file_tree.map(p => `"${p}"`).join(',\n  ')}
]

# Files/directories to completely ignore
ignored_paths = [
  ${DEFAULT_CONFIG.ignored_paths.map(p => `"${p}"`).join(',\n  ')}
]

# Paths to include in XML content
included_paths = [
  ${includedPaths.map(p => `# "${p}"`).join(',\n  ')}
]`;

  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log(`Created new config file at ${configPath}`);
}

export function readConfig(configPath: string): ProjectConfig {
  const content = fs.readFileSync(configPath, 'utf-8');
  return TOML.parse(content) as ProjectConfig;
}

export function updateIncludedPaths(configPath: string, newPaths: string[], reset: boolean = false): void {
  let config: ProjectConfig;
  
  try {
    config = readConfig(configPath);
  } catch (err) {
    console.error(`Error reading config: ${err}`);
    return;
  }

  // Get currently uncommented paths
  const uncommentedPaths = new Set(config.included_paths || []);

  // Update included_paths section
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const lines = configContent.split('\n');
  
  // Find the included_paths section
  const startIndex = lines.findIndex(line => line.trim() === 'included_paths = [');
  if (startIndex === -1) {
    console.error('Could not find included_paths section in config');
    return;
  }

  // Find the end of the section
  const endIndex = lines.findIndex((line, i) => i > startIndex && line.trim() === ']');
  if (endIndex === -1) {
    console.error('Could not find end of included_paths section');
    return;
  }

  // Generate new paths
  const newPathLines = newPaths.map((p, idx) => {
    const shouldComment = reset || !uncommentedPaths.has(p);
    const line = `  ${shouldComment ? '# ' : ''}"${p}"`;
    return line + (idx < newPaths.length - 1 ? ',' : '');
  });

  // Replace the section
  const updatedContent = [
    ...lines.slice(0, startIndex + 1),
    ...newPathLines,
    ...lines.slice(endIndex)
  ].join('\n');

  fs.writeFileSync(configPath, updatedContent, 'utf-8');
  console.log(`Updated included paths in ${configPath}`);
}

export function ensureConfigExists(targetDir: string, paths: string[]): string {
  const configPath = getConfigPath(targetDir);
  if (!fs.existsSync(configPath)) {
    createConfigFile(configPath, paths);
  }
  return configPath;
}
