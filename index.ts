// index.ts
// This script generates a project context file (project-context.xml) that contains information about the project, the git repository, the file tree, and the contents of all files in the project.
// this file can be used to provide context to a language model about the project
// you can run this script with ts-node index.ts /path/to/your/project

import * as fs from 'fs';
import * as path from 'path';

// Get target directory from command line argument, default to current directory
const targetDir = process.argv[2] || '.';
const absoluteTargetDir = path.resolve(targetDir);

const excludedFromFileTree: string[] = [
  '.nuxt',
  '.git',
  '.output',
  'node_modules',
];

// these will always be excluded from the context
const ignoredPaths = [
  '.nuxt',
  '.output',
  'yarn.lock',
  'node_modules',
  '.git',

];

// Included Paths (uncomment the ones you want to include)
const includedPaths: string[] = [
  // 'tsconfig.json',
  // 'app.vue',


  // 'components
  // 'components/**/*',
  // 'components/AppFooter.vue',
  // 'components/CampaignBrief.vue',
  // 'components/CampaignBriefReadOnly.vue',
  'components/CampaignContentOutputs.vue',
  'components/CampaignContentTable.vue',
  // 'components/ConfirmDialog.vue',
  'components/ContentProjectSetup.vue',
  'components/ContentProjectSetupReadOnly.vue',
  // 'components/ContentSelectionButtons.vue',
  // 'components/ContentSelectionModal.vue',
  'components/ContentTable.vue',
  'components/ContentValidation.vue',
  'components/CreateViewContent.vue',
  // 'components/ExampleCard.vue',
  // 'components/FieldCard.vue',
  // 'components/FinalContent.vue',
  // 'components/HelloWorld.vue',
  'components/ProjectSetupHistory.vue',
  // 'components/SelectedContentTag.vue',
  // 'components/SubtypeSettingsHistory.vue',
  // 'components/TooltipButton.vue',
  // 'components/contentSettingsDialog.vue',
  // 'components/navBar.vue',
  // 'components/navDrawer.vue',
  // 'components/psActionInputs.vue',
  // 'components/psActionSelection.vue',
  // 'components/psContentTypeSelection.vue',
  // 'components/psOptionalProjectConfig.vue',
  // 'components/psOutlineSelection.vue',
  // 'components/psReviewSettings.vue',
  // 'components/psSubTypeSelection.vue',

  // 'db.ts',
  // 'db.ts',

  // 'nuxt.config.ts',
  // 'nuxt.config.ts',

  // 'package.json',
  // 'package.json',

  // 'pages
  // 'pages/**/*',
  // 'pages/Campaign/**/*',
  // 'pages/Campaign/[id].vue',
  // 'pages/Campaign/index.vue',
  // 'pages/Content/**/*',
  // 'pages/Content/[id].vue',
  // 'pages/Content/index.vue',
  // 'pages/ContentList.vue',
  // 'pages/ContentSettings.vue',
  // 'pages/index.vue',

  // 'plugins
  // 'plugins/**/*',
  // 'plugins/vuetify.ts',

  // 'queues
  // 'queues/**/*',
  // 'queues/queue.ts',

  // 'server
  // 'server/**/*',
  // 'server/api/**/*',
  // 'server/api/blog-metadata/**/*',
  'server/api/blog-metadata/get-by-org.get.ts',
  // 'server/api/campaign/**/*',
  // 'server/api/campaign/[id]/**/*',
  'server/api/campaign/[id]/assets.get.ts',
  // 'server/api/campaign/[id]/create-asset.ts',
  // 'server/api/campaign/[id]/delete.ts',
  // 'server/api/campaign/[id]/generate-asset-brief.ts',
  // 'server/api/campaign/[id]/update.ts',
  // 'server/api/campaign/create.ts',
  // 'server/api/campaign/get-by-org.get.ts',
  // 'server/api/campaign_asset/**/*',
  // 'server/api/campaign_asset/[id]/**/*',
  // 'server/api/campaign_asset/[id]/delete.ts',
  // 'server/api/campaign_asset/[id]/update.ts',
  // 'server/api/campaign-job/**/*',
  // 'server/api/campaign-job/[id].get.ts',
  // 'server/api/content-output/**/*',
  'server/api/content-output/[id].get.ts',
  // 'server/api/content-output/[id]/**/*',
  // 'server/api/content-output/[id]/blog-metadata.get.ts',
  // 'server/api/content-output/[id]/confirm-validations.ts',
  'server/api/content-output/[id]/project-setup.get.ts',
  // 'server/api/content-output/[id]/subtype-settings-history.get.ts',
  'server/api/content-output/[id]/validations.get.ts',
  // 'server/api/content-output/get-by-org.get.ts',
  // 'server/api/content-output/initialize.ts',
  // 'server/api/content-output/update.ts',
  // 'server/api/content-subtype/**/*',
  // 'server/api/content-subtype/create.ts',
  // 'server/api/content-subtype/delete.ts',
  // 'server/api/content-subtype/get-by-org.get.ts',
  // 'server/api/content-subtype/update.ts',
  // 'server/api/example/**/*',
  // 'server/api/example/create.ts',
  // 'server/api/example/delete.ts',
  // 'server/api/example/get-by-org.get.ts',
  // 'server/api/example/get-by-subtype.get.ts',
  // 'server/api/example/update.ts',
  // 'server/api/hello.ts',
  // 'server/api/organization/**/*',
  // 'server/api/user/**/*',
  // 'server/api/user/get-by-org.get.ts',
  // 'server/api/user/get-id.get.ts',
  // 'server/api/validation/**/*',
  // 'server/api/validation/[id]/**/*',
  // 'server/api/validation/[id]/update.ts',
  // 'server/api/validation/get-by-org.get.ts',
  // 'server/database.ts',
  // 'server/db/**/*',
  'server/db/blogMetadatas.ts',
  // 'server/db/campaigns.ts',
  // 'server/db/campaignJobs.ts',
  'server/db/contentOutputs.ts',
  // 'server/db/contentSubtypes.ts',
  // 'server/db/examples.ts',
  'server/db/projectSetups.ts',
  // 'server/db/stepOutputs.ts',
  // 'server/db/subtypeSettingsHistory.ts',
  // 'server/db/tokenUsages.ts',
  // 'server/db/users.ts',
  // 'server/db/utils/**/*',
  // 'server/db/utils/hashJson.ts',
  'server/db/validations.ts',
  // 'server/middleware/**/*',
  // 'server/middleware/log.ts',
  // 'server/tsconfig.json',

  // 'services
  // 'services/**/*',
  'services/apiClient.ts',

  // 'stores
  // 'stores/**/*',
  // 'stores/index.ts',
  'stores/userdata.ts',

  // 'tsconfig.json',
  // 'tsconfig.json',

  // 'types
  // 'types/**/*',
  // 'types/actionTypes.ts',
  'types/backendTypes.ts',
  // 'types/contentTypes.ts',
  'types/frontendTypes.ts',
  // 'types/inputFieldTypes.ts',

  // 'worker
  // 'worker/**/*',
  // 'worker/.DS_Store',
  // 'worker/index.ts',
  // 'worker/src/**/*',
  // 'worker/src/.DS_Store',
  // 'worker/src/config.ts',
  // 'worker/src/contentOperations.ts',
  // 'worker/src/dataAccess.ts',
  // 'worker/src/fieldValidation.ts',
  // 'worker/src/fileService.ts',
  // 'worker/src/llm.ts',
  // 'worker/src/llmTypes.ts',
  // 'worker/src/promptGenerators/**/*',
  // 'worker/src/promptGenerators/SnippetsProcessors/**/*',
  // 'worker/src/promptGenerators/SnippetsProcessors/OutlineProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/actionProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/additionalInstructionsProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/campaignAssetListProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/campaignProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/contentProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/contextProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/exampleProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/guidelineProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/seoPhraseProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/systemPromptProcessor.ts',
  // 'worker/src/promptGenerators/SnippetsProcessors/targetAudienceProcessor.ts',
  // 'worker/src/promptGenerators/blogOutlinePromptGenerator.ts',
  // 'worker/src/promptGenerators/blogPostPromptGenerator.ts',
  // 'worker/src/promptGenerators/campaignAssetBriefPromptGenerator.ts',
  // 'worker/src/promptGenerators/socialMediaPromptGenerator.ts',
  // 'worker/src/recipeExecutor.ts',
  // 'worker/src/recipeLoader.ts',
  // 'worker/src/recipeTypes.ts',
  // 'worker/src/recipes/**/*',
  // 'worker/src/recipes/blogPostRecipe.ts',
  // 'worker/src/recipes/blog_outline.ts',
  // 'worker/src/recipes/blog_post.ts',
  // 'worker/src/recipes/campaign_asset_brief.ts',
  // 'worker/src/recipes/guidelinesRecipe.ts',
  // 'worker/src/recipes/linkedin_post.ts',
  // 'worker/src/recipes/nativishImprovementInputRecipe.ts',
  // 'worker/src/recipes/nativishScreenshotRecipe.ts',
  // 'worker/src/recipes/twitterIdeasRecipe.ts',
  // 'worker/src/recipes/twitter_post.ts',
  // 'worker/src/stepExecutors/**/*',
  // 'worker/src/stepExecutors/assetBriefReconstructionStepExecutor.ts',
  // 'worker/src/stepExecutors/cliSelectionStepExecutor.ts',
  // 'worker/src/stepExecutors/jsonParseStepExecutor.ts',
  // 'worker/src/stepExecutors/llmStepExecutor.ts',
  // 'worker/src/stepExecutors/nativishAPIStepExecutor.ts',
  // 'worker/src/stepExecutors/nativishHtmlRenderStepExecutor.ts',
  // 'worker/src/stepExecutors/screenshotGenerator.ts',
  // 'worker/src/stepExecutors/userValidationStepExecutor.ts',
  // 'worker/src/validationHandler.ts',
];

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

function getProjectInfo(): string {
  try {
    const packageJsonPath = path.join(absoluteTargetDir, 'package.json');
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
    const error = err as Error;
    console.error('Error reading package.json:', error.message);
    return '<projectInfo><error>Unable to read package.json</error></projectInfo>';
  }
}

function shouldIncludePath(filePath: string): boolean {
  const relativePath = path.relative(absoluteTargetDir, filePath);

  if (ignoredPaths.some(ignorePath => relativePath.startsWith(ignorePath))) {
    return false;
  }

  if (includedPaths.length > 0) {
    const shouldInclude = includedPaths.some(includePath =>
      relativePath === includePath || includePath.startsWith(relativePath + path.sep)
    );
    return shouldInclude;
  }

  // if no included paths are specified, include do not include anything. Can be changed by returning true
  return false;
}

function generateFileTree(dir: string, prefix: string = ''): string {
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

      if (excludedFromFileTree.some(excludedPath => relativePath.startsWith(excludedPath))) return;

      try {
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        
        if (stats.isDirectory()) {
          result += `${prefix}${isLast ? '└── ' : '├── '}${file}/\n`;
          result += generateFileTree(filePath, `${prefix}${isLast ? '    ' : '│   '}`);
        } else {
          result += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
        }
      } catch (err) {
        const error = err as Error;
        console.warn(`Warning: Unable to access ${filePath}: ${error.message}`);
      }
    });
  } catch (err) {
    const error = err as Error;
    console.warn(`Warning: Error reading directory ${dir}: ${error.message}`);
  }
  return result;
}

function getAllAvailablePaths(dir: string): Set<string> {
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

        if (ignoredPaths.some(ignorePath => relativePath.startsWith(ignorePath))) {
          continue;
        }

        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            paths.add(`'${relativePath}/**/*',`);
            traverse(fullPath);
          } else {
            paths.add(`'${relativePath}',`);
          }
        } catch (err) {
          const error = err as Error;
          console.warn(`Warning: Unable to access ${fullPath}: ${error.message}`);
        }
      }
    } catch (err) {
      const error = err as Error;
      console.warn(`Warning: Error reading directory ${currentDir}: ${error.message}`);
    }
  }

  traverse(dir);
  return paths;
}

function previewAvailablePaths(): void {
  console.log('\nAvailable paths in', absoluteTargetDir);
  console.log('\nCopy this into your includedPaths array and uncomment the ones you want:\n');
  console.log('const includedPaths: string[] = [');

  const allPaths = Array.from(getAllAvailablePaths(absoluteTargetDir));
  const groupedPaths = allPaths.reduce((acc, currentPath) => {
    const directory = currentPath.split('/')[0];
    if (!acc[directory]) {
      acc[directory] = [];
    }
    acc[directory].push(currentPath);
    return acc;
  }, {} as Record<string, string[]>);

  Object.entries(groupedPaths).sort().forEach(([directory, paths]) => {
    console.log(`\n  // ${directory}`);
    paths.sort().forEach(path => {
      console.log(`  // ${path}`);
    });
  });

  console.log('];');
}

function generateProjectContext(): void {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<projectContext>
  ${getProjectInfo()}
  <fileTree>
    <![CDATA[
${generateFileTree(absoluteTargetDir)}
    ]]>
  </fileTree>
  <fileContents>
    ${getFileContents()}
  </fileContents>
</projectContext>`;

  const outputPath = path.join(process.cwd(), 'project-context.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');
  console.log(`Project context has been generated in ${outputPath}`);
}

function getFileContents(): string {
  let result = '';
  function processDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: Directory does not exist: ${dir}`);
      return;
    }

    console.log(`Processing directory: ${dir}`);
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(absoluteTargetDir, filePath);

        if (!shouldIncludePath(filePath)) {
          continue;
        }

        try {
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            console.log(`Entering directory: ${relativePath}`);
            processDirectory(filePath);
          } else {
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              result += `
                <file>
                  <path>${escapeXml(relativePath)}</path>
                  <content><![CDATA[${content}]]></content>
                </file>
              `;
              console.log(`Added ${relativePath} to context.`);
            } catch (err) {
              const error = err as Error;
              console.warn(`Warning: Unable to read file ${relativePath}: ${error.message}`);
            }
          }
        } catch (err) {
          const error = err as Error;
          console.warn(`Warning: Unable to access ${filePath}: ${error.message}`);
        }
      }
    } catch (err) {
      const error = err as Error;
      console.warn(`Warning: Error reading directory ${dir}: ${error.message}`);
    }
  }

  processDirectory(absoluteTargetDir);
  return result;
}

// Main execution
if (!fs.existsSync(absoluteTargetDir)) {
  console.error(`Error: Target directory does not exist: ${absoluteTargetDir}`);
  process.exit(1);
}

// Preview available paths
previewAvailablePaths();
console.log('\nGenerating context file...');
generateProjectContext();