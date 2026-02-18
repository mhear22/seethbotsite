const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'build-info.json');
const envBuildCount = Number.parseInt(
  process.env.BUILD_COUNT || process.env.BUILD_NUMBER || '',
  10
);
let buildCount = Number.isInteger(envBuildCount) && envBuildCount > 0 ? envBuildCount : 1;

// Fallback for local/non-Docker builds where BUILD_COUNT is not provided.
if (buildCount === 1 && fs.existsSync(outputPath)) {
  try {
    const existingInfo = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
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
