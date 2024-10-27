# Project Context Generator

This tool generates an XML file containing a structured overview of your project, including its file tree, file contents, and project information. It's particularly useful for documenting project structure, creating project snapshots, or preparing project context for analysis.

## Features

- Generates a complete project structure in XML format
- Configurable file inclusion/exclusion
- File tree visualization
- Package.json information extraction
- Interactive path preview for easy configuration

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

```bash
ts-node index.ts <target-directory>
```
OR
```bash
npm run start <target-directory>
```

Example:
```bash
ts-node index.ts ../marketing-intern
```

### Process

1. The tool will first show a preview of all available paths in your project
2. Use this preview to configure which files you want to include by updating the `includedPaths` array in the code
3. Run the tool again to generate the final context file
4. The output will be saved as `project-context.xml` in your current directory

### Configuration

The tool uses three main configuration arrays:

1. `excludedFromFileTree`: Controls what appears in the file tree visualization
```typescript
const excludedFromFileTree = [
  'node_modules',
  '.git',
  'dist',
  '.nuxt',
  // ...
];
```

2. `ignoredPaths`: Files and directories to always exclude from processing
```typescript
const ignoredPaths = [
  'node_modules',
  '.git',
  'dist',
  // ...
];
```

3. `includedPaths`: Specific files and directories to include
```typescript
const includedPaths = [
  'src',              // Include all files in src directory
  'package.json',          // Include specific files
  'configs/**/*.ts',       // Include TypeScript files in configs directory
];
```

### Path Patterns

For `includedPaths`, you can use different patterns:
- `'src/**/*'` - Include all files in src directory and subdirectories
- `'src/*.ts'` - Include all TypeScript files directly in src directory
- `'package.json'` - Include a specific file

For `ignoredPaths` and `excludedFromFileTree`, just use the directory or file name:
- `'.nuxt'` - Excludes the .nuxt directory and all its contents
- `'node_modules'` - Excludes the node_modules directory

## Output

The tool generates a `project-context.xml` file with the following structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<projectContext>
  <projectInfo>
    <!-- Package.json information -->
  </projectInfo>
  <fileTree>
    <!-- Visual representation of project structure -->
  </fileTree>
  <fileContents>
    <!-- Contents of included files -->
  </fileContents>
</projectContext>
```

## Error Handling

- The tool provides warnings for inaccessible files or directories
- Continues processing even if individual files fail
- Verifies target directory existence before processing
- Safely handles missing package.json

## Tips

1. Start with an empty `includedPaths` array to see all available files
2. Use the preview to select specific files you want to include
3. Add common build and temp directories to `ignoredPaths`
4. Keep `node_modules` and other large directories in `ignoredPaths` for better performance
5. Use specific patterns in `includedPaths` to include only relevant files

## Limitations

- Large projects might generate large XML files
- Binary files are not supported
- Symbolic links are not followed