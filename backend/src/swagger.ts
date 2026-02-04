import fs from 'fs';
import path from 'path';

// Load the pre-generated OpenAPI spec from disk
// This spec is generated at build time by scripts/generate-openapi.js
const OPENAPI_PATH = path.join(__dirname, '../dist/openapi.json');

let swaggerSpec: any;

try {
  const specContent = fs.readFileSync(OPENAPI_PATH, 'utf-8');
  swaggerSpec = JSON.parse(specContent);
} catch (error) {
  console.error('Failed to load OpenAPI spec:', error);
  // Fallback to an empty spec if the file doesn't exist
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Seethbot API',
      version: '1.0.0',
      description: 'API documentation (spec not loaded)'
    },
    paths: {}
  };
}

export { swaggerSpec };
