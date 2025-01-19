# Project Context Generator

A tool that generates an XML file containing information about your project's structure and contents. This is particularly useful for:
- Providing project context to Language Models
- Creating project documentation
- Sharing project structure with team members

## Features

- Generates a file tree visualization of your project
- Creates XML output with selected file contents
- Configurable via TOML file
- Preserves your selection of which files to include
- Handles special characters and XML escaping

## Setup

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install
```

## Usage

The tool uses a `.project-context.toml` configuration file in your target project directory. If it doesn't exist, it will be created automatically with default settings.

### Usage

#### Method 1: Using bash/zsh alias (Recommended)

1. Add these aliases to your `~/.bashrc` or `~/.zshrc`:
```bash
alias project-context='function _project_context() { npm run --prefix /absolute/path/to/project-context-generator start "$(pwd)"; }; _project_context'
alias project-context-reset='function _project_context_reset() { npm run --prefix /absolute/path/to/project-context-generator start:reset "$(pwd)"; }; _project_context_reset'
```

2. Replace `/absolute/path/to/project-context-generator` with the actual path where you installed this tool
3. Source your rc file (`source ~/.bashrc` or `source ~/.zshrc`) or restart your terminal

Then you can run from any project directory:
```bash
project-context         # Update preserving uncommented paths
project-context-reset   # Reset all paths to commented out
```

The tool will:
1. Create `.project-context.toml` in your current directory if it doesn't exist
2. Generate or update the list of files (commented/uncommented based on existing config)
3. Create `project-context.xml` in your current directory

#### Method 2: Direct npm usage

If you prefer not using aliases, you can still run:
```bash
# Update project context preserving your previous file selections
npm run --prefix /path/to/project-context-generator start /path/to/your/project

# Reset project context (all files will be commented out)
npm run --prefix /path/to/project-context-generator start:reset /path/to/your/project
```

### Configuration

#### Empty included_paths

If `included_paths` is an empty array in your config:
- The file tree will still be generated
- The project structure will be shown
- No file contents will be included in the XML output

This is useful when you only want to see the project structure without any file contents.

The `.project-context.toml` file in your project directory controls what gets included in the output:

```toml
# Files/directories to exclude from tree visualization
excluded_from_file_tree = [
  ".nuxt",
  ".git",
  ".output",
  "node_modules"
]

# Files/directories to completely ignore
ignored_paths = [
  ".nuxt",
  ".output",
  "yarn.lock",
  "node_modules",
  ".git"
]

# Paths to include in XML content
included_paths = [
  # Files commented out won't be included in the XML output
  # "app.vue",
  # "components/MyComponent.vue",
  "types/index.ts"  # This file will be included
]
```

### Output

The tool generates a `project-context.xml` file in your current directory with:
- Project information from package.json
- A visual file tree representation
- Contents of included files (specified in .project-context.toml)

Example output structure:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<projectContext>
  <projectInfo>
    <name>your-project-name</name>
    <description>Your project description</description>
    <version>1.0.0</version>
    <!-- Dependencies information -->
  </projectInfo>
  <fileTree>
    <!-- Visual representation of project structure -->
  </fileTree>
  <fileContents>
    <!-- Contents of included files -->
  </fileContents>
</projectContext>
```

## Tips

1. Start with all paths commented out and gradually uncomment the ones you want to include
2. Use the reset command if you want to start fresh with all paths commented
3. The tool preserves your uncommented paths when updating, even if new files are added to the project
4. XML-unsafe characters are automatically escaped in the output

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache-2.0
