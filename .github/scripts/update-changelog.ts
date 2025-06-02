import fs from 'node:fs';
import path from 'node:path';

// Function to get current UTC date in YYYY-MM-DD format
function getCurrentUTCDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Function to extract version information from JSON file
function extractVersion(filePath: string): string {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return getCurrentUTCDate();
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content) as { info?: { version?: string } };

    return json.info?.version ?? getCurrentUTCDate();
  } catch (error) {
    console.error(`Error reading version from ${filePath}:`, error);
    return getCurrentUTCDate();
  }
}

// Function to generate new CHANGELOG entry
function generateChangelogEntry(v1Version: string, v3Version: string, date: string): string {
  return `## [${date}] - SDK Update

### OpenAPI Spec Versions
- apiv1: ${v1Version}
- apiv3: ${v3Version}

### Changes
- Reflected the latest version of OpenAPI specifications
- Regenerated SDK code
- Code formatting with Biome

`;
}

// Main process
function main(): void {
  try {
    // Set file paths
    const v1Path = path.resolve('tmp/openapi-v1.json');
    const v3Path = path.resolve('tmp/openapi-v3.json');
    const changelogPath = path.resolve('CHANGELOG.md');

    // Get current UTC date
    const currentDate = getCurrentUTCDate();

    // Extract version information
    const v1Version = extractVersion(v1Path);
    const v3Version = extractVersion(v3Path);

    // Generate new entry
    const newEntry = generateChangelogEntry(v1Version, v3Version, currentDate);

    // Update CHANGELOG
    let existingContent = '';
    if (fs.existsSync(changelogPath)) {
      existingContent = fs.readFileSync(changelogPath, 'utf8');
    }

    // Combine new entry with existing content
    const updatedContent = newEntry + existingContent;

    // Save CHANGELOG
    fs.writeFileSync(changelogPath, updatedContent, 'utf8');
    console.log('CHANGELOG.md has been updated successfully.');
  } catch (error) {
    console.error('Error updating CHANGELOG:', error);
    process.exit(1);
  }
}

// Execute the script
main();
