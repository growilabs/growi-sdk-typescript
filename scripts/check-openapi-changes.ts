import fs from 'node:fs';
import path from 'node:path';

const OPENAPI_VERSIONS = ['v1', 'v3'] as const;
const CACHE_DIR = '.openapi-cache';
const TMP_DIR = 'tmp';

const hasChanges = (): boolean => {
  // Track if there are changes in any version
  let hasAnyChanges = false;

  for (const version of OPENAPI_VERSIONS) {
    const cacheFilePath = path.join(CACHE_DIR, `openapi-${version}.json`);
    const tmpFilePath = path.join(TMP_DIR, `openapi-${version}.json`);

    // If cache file doesn't exist, consider it as a change
    if (!fs.existsSync(cacheFilePath)) {
      hasAnyChanges = true;
      continue;
    }

    // Load and compare cache file with temporary file
    const cachedSpec = fs.readFileSync(cacheFilePath, 'utf-8');
    const downloadedSpec = fs.readFileSync(tmpFilePath, 'utf-8');

    // If content differs, consider it as a change
    if (cachedSpec !== downloadedSpec) {
      hasAnyChanges = true;
    }
  }

  return hasAnyChanges;
};

// Output whether changes exist to standard output
console.log(hasChanges().toString());
