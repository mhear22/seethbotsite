const fs = require('fs');
const path = require('path');

// Read existing build info to preserve build count
const outputPath = path.join(__dirname, '..', 'build-info.json');
let buildCount = 1;

if (fs.existsSync(outputPath)) {
  try {
    const existingInfo = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    // Preserve the build count from the existing file (set by update-build-info.sh)
    buildCount = existingInfo.buildCount || 1;
  } catch (err) {
    console.warn('Could not read existing build-info.json, starting count from 1');
  }
}

// Generate build time file
const buildTime = new Date().toISOString();
const buildInfo = {
  buildTime,
  gitHash: process.env.GIT_HASH || 'dev',
  gitBranch: process.env.GIT_BRANCH || 'main',
  version: require('../package.json').version,
  buildCount
};

fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log('✅ Build info generated:', buildTime, `(#${buildCount})`);
