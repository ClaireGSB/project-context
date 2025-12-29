// src/config.ts
import * as fs from 'fs';
import * as path from 'path';
import * as TOML from 'toml';

export interface ProjectConfig {
  excluded_from_file_tree: string[];
  ignored_paths: string[];
  included_paths: string[];
  use_gitignore: boolean;
  gitignore_paths: string[];
}

const DEFAULT_GITIGNORE_PATHS = ['.gitignore'];

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
  use_gitignore: true,
  gitignore_paths: DEFAULT_GITIGNORE_PATHS,
};

function applyConfigDefaults(config: Partial<ProjectConfig>): ProjectConfig {
  return {
    excluded_from_file_tree: config.excluded_from_file_tree ?? DEFAULT_CONFIG.excluded_from_file_tree,
    ignored_paths: config.ignored_paths ?? DEFAULT_CONFIG.ignored_paths,
    included_paths: config.included_paths ?? [],
    use_gitignore: config.use_gitignore ?? DEFAULT_CONFIG.use_gitignore,
    gitignore_paths: config.gitignore_paths ?? DEFAULT_CONFIG.gitignore_paths,
  };
}

export function getConfigPath(targetDir: string): string {
  return path.join(targetDir, '.project-context.toml');
}

export function createConfigFile(configPath: string, includedPaths: string[]): void {
  const configContent = `# Gitignore integration
use_gitignore = ${DEFAULT_CONFIG.use_gitignore}
gitignore_paths = [
  ${DEFAULT_CONFIG.gitignore_paths.map(p => `"${p}"`).join(',\n  ')}
]

# Files/directories to exclude from tree visualization
excluded_from_file_tree = [
  ${DEFAULT_CONFIG.excluded_from_file_tree.map(p => `"${p}"`).join(',\n  ')}
]

# Paths to skip for file contents (still shown in tree)
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
  const parsed = TOML.parse(content) as Partial<ProjectConfig>;
  return applyConfigDefaults(parsed);
}

function parseGitignoreContent(content: string): string[] {
  const patterns: string[] = [];
  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    patterns.push(line);
  }

  return patterns;
}

export function readGitignorePatterns(targetDir: string, gitignorePaths: string[]): string[] {
  const patterns: string[] = [];
  const seen = new Set<string>();

  for (const gitignorePath of gitignorePaths) {
    const fullPath = path.join(targetDir, gitignorePath);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const pattern of parseGitignoreContent(content)) {
      if (!seen.has(pattern)) {
        seen.add(pattern);
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

function parseTomlString(line: string): string | null {
  const match = line.match(/"((?:\\.|[^"\\])*)"/);
  if (!match) {
    return null;
  }
  return match[1].replace(/\\\\/g, '\\').replace(/\\"/g, '"');
}

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function mergeGitignoreIntoIgnoredPaths(configPath: string, patterns: string[]): boolean {
  if (patterns.length === 0) {
    return false;
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  const lines = configContent.split('\n');

  const startIndex = lines.findIndex(line => line.trim() === 'ignored_paths = [');
  if (startIndex === -1) {
    console.error('Could not find ignored_paths section in config');
    return false;
  }

  const endIndex = lines.findIndex((line, i) => i > startIndex && line.trim() === ']');
  if (endIndex === -1) {
    console.error('Could not find end of ignored_paths section');
    return false;
  }

  const existingPatterns = new Set<string>();
  for (let i = startIndex + 1; i < endIndex; i++) {
    const parsed = parseTomlString(lines[i]);
    if (parsed) {
      existingPatterns.add(parsed);
    }
  }

  const missingPatterns = patterns.filter(pattern => !existingPatterns.has(pattern));
  if (missingPatterns.length === 0) {
    return false;
  }

  const hasExistingEntries = existingPatterns.size > 0;
  const newLines = missingPatterns.map((pattern, index) => {
    const needsComma = index < missingPatterns.length - 1 || hasExistingEntries;
    return `  "${escapeTomlString(pattern)}"${needsComma ? ',' : ''}`;
  });
  lines.splice(startIndex + 1, 0, ...newLines);

  fs.writeFileSync(configPath, lines.join('\n'), 'utf-8');
  console.log(`Merged ${missingPatterns.length} gitignore pattern(s) into ignored_paths`);
  return true;
}

export function updateIncludedPaths(configPath: string, newPaths: string[], reset: boolean = false): void {
  let config: ProjectConfig;
  
  try {
    config = readConfig(configPath);
  } catch (err) {
    console.error(`Error reading config: ${err}`);
    return;
  }

  // Get currently uncommented paths and normalize them for comparison
  const uncommentedPaths = new Set((config.included_paths || []).map(p => path.normalize(p)));

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

  // Generate new paths (ensure they are also normalized, though they should be from getAllAvailablePaths)
  const newPathLines = newPaths.map((p, idx) => {
    const normalizedP = path.normalize(p);
    const shouldComment = reset || !uncommentedPaths.has(normalizedP);
    const line = `  ${shouldComment ? '# ' : ''}"${p.replace(/\\/g, '\\\\')}"`; // Escape backslashes for TOML string
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
