import { promises as fs } from 'node:fs';
import * as path from 'node:path';

/**
 * Compare the contents of two files
 * @param file1Path - Path to the first file
 * @param file2Path - Path to the second file
 * @returns true if the file contents are different
 */
async function hasFileChanged(file1Path: string, file2Path: string): Promise<boolean> {
  try {
    const content1 = await fs.readFile(file1Path, 'utf8');
    const content2 = await fs.readFile(file2Path, 'utf8');
    return content1 !== content2;
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, consider it as changed
      return true;
    }
    throw error;
  }
}

/**
 * Create directory if it doesn't exist and copy file
 * @param srcPath - Source file path
 * @param destPath - Destination file path
 */
async function copyFile(srcPath: string, destPath: string): Promise<void> {
  const destDir = path.dirname(destPath);
  try {
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(srcPath, destPath);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
    throw error;
  }
}

// Main process
async function main(): Promise<void> {
  try {
    const v1New = 'tmp/openapi-v1.json';
    const v3New = 'tmp/openapi-v3.json';
    const v1Cache = '.openapi-cache/openapi-v1.json';
    const v3Cache = '.openapi-cache/openapi-v3.json';

    // Check if new specification files exist
    try {
      await fs.access(v1New);
      await fs.access(v3New);
    } catch (error) {
      throw new Error('New specification files not found');
    }

    // Check for changes
    const v1Changed = await hasFileChanged(v1New, v1Cache);
    const v3Changed = await hasFileChanged(v3New, v3Cache);

    const hasChanges = v1Changed || v3Changed;

    if (hasChanges) {
      // If there are changes, copy files
      await copyFile(v1New, v1Cache);
      await copyFile(v3New, v3Cache);
    }

    // Output the result to stdout
    console.log(hasChanges ? 'true' : 'false');
    process.exit(0); // Always exit with 0 for successful execution
  } catch (error) {
    // Output error message to stderr
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred');
    }
    process.exit(1); // Exit with 1 for errors
  }
}

// Execute the script
void main();
