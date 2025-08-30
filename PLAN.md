

# PLAN.MD

### **Title: Fix: Normalize File Paths for Windows Compatibility**

**Goal:** Modify the application to use the correct path separator for the host operating system (`\` for Windows, `/` for others) to ensure consistent and reliable behavior across platforms.

### **Description**

Currently, the tool exclusively generates and expects file paths with forward slashes (`/`). This creates a poor user experience on Windows, where the native path separator is a backslash (`\`).

A Windows user reports that after the tool generates the configuration, the paths in `included_paths` do not work. If the user manually changes the slashes to backslashes (`\`), the tool works for one run. However, on the next run, the tool overwrites their changes, reverting the paths to forward slashes (`/`) and breaking the configuration again.

The new behavior will ensure that all paths are generated and compared using the operating system's native path separator. This will make the tool work seamlessly on Windows without requiring manual user intervention.

### **Summary Checklist**

- [x] Create a path normalization utility function.
- [x] Update path generation logic in `src/index.ts` to use the new utility.
- [x] Update path comparison logic in `src/config.ts` to ensure consistency.
- [ ] Verify that paths used for reading file contents in `src/index.ts` are correctly resolved.

### **Detailed Implementation Steps**

#### 1. Create a Path Normalization Utility

*   **Objective:** To create a single, reliable function that converts any given path string into the correct format for the current operating system.
*   **Task:** This logic can be added to `src/index.ts` since it's a small, self-contained function. We will use Node's built-in `path.normalize()` method which is designed for this purpose.

*   **Code Snippet (`src/index.ts`):**
    This function will be used to ensure paths are consistent.

    ```typescript
    // src/index.ts

    // ... (imports)

    // Add this helper function near the top
    function normalizePath(p: string): string {
      return path.normalize(p);
    }

    // ... (rest of the file)
    ```

#### 2. Update Path Generation (`getAllAvailablePaths`)

*   **Objective:** Ensure that all file paths generated and saved to the `.project-context.toml` file use the OS-specific separator.
*   **Task:** Modify the `getAllAvailablePaths` function in `src/index.ts` to normalize the `relativePath` before adding it to the `paths` set.

*   **Code Snippet (`src/index.ts`):**

    ```typescript
    // In function getAllAvailablePaths(dir: string, config: { ignored_paths: string[] }): string[]

    // ...
    const fullPath = path.join(currentDir, file);
    let relativePath = path.relative(absoluteTargetDir, fullPath); // Use let instead of const

    if (config.ignored_paths.some(ignorePath => relativePath.startsWith(ignorePath))) {
      continue;
    }

    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        traverse(fullPath);
      } else {
        // Normalize the path before adding it
        paths.add(normalizePath(relativePath));
      }
    // ...
    ```

#### 3. Update Path Comparison Logic (`updateIncludedPaths`)

*   **Objective:** To prevent the tool from incorrectly commenting out user-selected paths on Windows. Both the paths read from the config and the newly scanned paths must be in the same format before comparison.
*   **Task:** In `src/config.ts`, normalize the paths from the existing config and the new paths before comparing them.

*   **Code Snippet (`src/config.ts`):**

    ```typescript
    // src/config.ts
    import * as path from 'path'; // Add this import

    // ...

    // In function updateIncludedPaths(configPath: string, newPaths: string[], reset: boolean = false)

    // ...
    // Get currently uncommented paths and normalize them for comparison
    const uncommentedPaths = new Set((config.included_paths || []).map(p => path.normalize(p)));

    // Generate new paths (ensure they are also normalized, though they should be from getAllAvailablePaths)
    const newPathLines = newPaths.map((p, idx) => {
        const normalizedP = path.normalize(p);
        const shouldComment = reset || !uncommentedPaths.has(normalizedP);
        const line = `  ${shouldComment ? '# ' : ''}"${p.replace(/\\/g, '\\\\')}"`; // Escape backslashes for TOML string
        return line + (idx < newPaths.length - 1 ? ',' : '');
    });
    // ...
    ```
    **Note:** When writing to the TOML file, backslashes must be escaped (e.g., `src\\index.ts`). The `replace` method handles this.

#### 4. Ensure Correct File Content Resolution

*   **Objective:** Confirm that the paths from `included_paths` are correctly resolved by `path.join` when reading file contents.
*   **Task:** `path.join` is generally robust and handles mixed separators. No major changes are expected here, but it's a key part of the process to verify during testing. The existing code in `getFileContents` should work correctly as `path.join(absoluteTargetDir, includedPath)` will resolve the path properly on any OS.

