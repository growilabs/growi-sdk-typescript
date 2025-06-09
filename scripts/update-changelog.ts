import fs from 'node:fs';
import path from 'node:path';

const OPENAPI_VERSIONS = ['v1', 'v3'] as const;
const TMP_DIR = 'tmp';
const CHANGELOG_PATH = 'CHANGELOG.md';

/**
 * Extract version information from OpenAPI specification
 * @param version OpenAPI version (v1 or v3)
 * @returns Version information (current date if not available in the spec)
 */
const extractVersion = (version: (typeof OPENAPI_VERSIONS)[number]): string => {
  const filePath = path.join(TMP_DIR, `openapi-${version}.json`);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const spec = JSON.parse(content);

    // Get version information from info.version
    if (spec.info?.version) {
      return spec.info.version;
    }
  } catch (error) {
    console.error(`Error reading ${version} spec:`, error);
  }

  // Use current date if version information is not available
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Update the CHANGELOG
 * @param v1Version Version information for v1
 * @param v3Version Version information for v3
 */
const updateChangelog = (v1Version: string, v3Version: string): void => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Content for the new entry
  const newEntry = `## [${dateStr}] - SDK Update

- OpenAPI Spec v1: ${v1Version}
- OpenAPI Spec v3: ${v3Version}

---
`;

  try {
    // Load existing CHANGELOG (empty string if it doesn't exist)
    const existingContent = fs.existsSync(CHANGELOG_PATH) ? fs.readFileSync(CHANGELOG_PATH, 'utf-8') : '';

    // Add new entry at the beginning
    const updatedContent = newEntry + existingContent;

    // Write to file
    fs.writeFileSync(CHANGELOG_PATH, updatedContent, 'utf-8');

    console.log('Successfully updated CHANGELOG.md');
  } catch (error) {
    console.error('Error updating CHANGELOG:', error);
    process.exit(1);
  }
};

// Main process
const main = (): void => {
  const v1Version = extractVersion('v1');
  const v3Version = extractVersion('v3');
  updateChangelog(v1Version, v3Version);
};

main();
