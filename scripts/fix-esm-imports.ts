import fs from 'node:fs';
import path from 'node:path';

/**
 * Script to automatically fix ESM import extensions after orval generation
 */
function fixEsmImports(dir = './src/generated'): void {
  /**
   * Recursively process directories to find TypeScript/JavaScript files
   */
  function processDirectory(dirPath: string): void {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
        fixFileImports(fullPath);
      }
    }
  }

  /**
   * Fix import statements in a single file by adding .js extensions
   */
  function fixFileImports(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add .js extension to relative imports (skip if already has .js)
    const newContent = content.replace(/from ['"](\.[^'"]*?)['"]/g, (match: string, importPath: string): string => {
      if (importPath.endsWith('.js')) {
        return match; // Keep as is if already has .js extension
      }
      modified = true;
      return `from '${importPath}.js'`;
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed imports in ${filePath}`);
    }
  }

  if (fs.existsSync(dir)) {
    processDirectory(dir);
    console.log('🎉 All ESM imports fixed!');
  } else {
    console.log(`❌ Directory ${dir} not found`);
  }
}

// Run the script
fixEsmImports();
