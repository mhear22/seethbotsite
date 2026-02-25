#!/usr/bin/env node
/**
 * Generate responsive images in multiple sizes and formats
 *
 * This script:
 * 1. Reads image files from public/images/
 * 2. Generates sizes: 320w, 640w, 1024w, 1920w
 * 3. Converts to WebP and AVIF formats
 * 4. Saves to public/assets/images/resized/
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const SOURCE_DIR = path.join(__dirname, '../public/images')
const OUTPUT_DIR = path.join(__dirname, '../public/assets/images/resized')
const SIZES = [320, 640, 1024, 1920]
const FORMATS = ['webp']
const QUALITY = 85

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
    log(`Created directory: ${dirPath}`, colors.blue)
  }
}

async function getImageFiles(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Recursively get images from subdirectories
      const subDirFiles = await getImageFiles(fullPath)
      files.push(...subDirFiles)
    } else if (entry.isFile()) {
      const ext = entry.name.toLowerCase()
      if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
        files.push(fullPath)
      }
    }
  }

  return files
}

async function processImage(inputPath) {
  const relativePath = path.relative(SOURCE_DIR, inputPath)
  const baseName = path.basename(inputPath, path.extname(inputPath))
  const subDir = path.dirname(relativePath)

  // Create output subdirectory if needed
  const outputSubDir = path.join(OUTPUT_DIR, subDir)
  await ensureDir(outputSubDir)

  log(`Processing: ${relativePath}`, colors.yellow)

  try {
    // Get original image dimensions
    const metadata = await sharp(inputPath).metadata()
    const originalWidth = metadata.width

    for (const size of SIZES) {
      // Skip if requested size is larger than original
      if (size > originalWidth) {
        log(`  Skipping ${size}px (larger than original ${originalWidth}px)`, colors.reset)
        continue
      }

      // Resize and convert to each format
      for (const format of FORMATS) {
        const outputPath = path.join(outputSubDir, `${baseName}-${size}.${format}`)

        // Check if file already exists
        try {
          await fs.access(outputPath)
          log(`  ✓ ${format}/${size}px (exists)`, colors.green)
          continue
        } catch {
          // File doesn't exist, generate it
        }

        await sharp(inputPath)
          .resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toFormat(format, {
            quality: QUALITY,
            effort: format === 'avif' ? 6 : 4 // Higher effort for AVIF
          })
          .toFile(outputPath)

        const stats = await fs.stat(outputPath)
        const sizeKB = (stats.size / 1024).toFixed(1)
        log(`  ✓ Generated ${format}/${size}px (${sizeKB} KB)`, colors.green)
      }
    }
  } catch (error) {
    log(`  ✗ Error: ${error.message}`, colors.red)
  }
}

async function generateImages() {
  const startTime = Date.now()

  log('\n========================================', colors.blue)
  log('  Optimized Image Generator', colors.blue)
  log('========================================\n', colors.blue)

  // Ensure output directory exists
  await ensureDir(OUTPUT_DIR)

  // Get all image files
  let imageFiles
  try {
    imageFiles = await getImageFiles(SOURCE_DIR)
  } catch (error) {
    log(`Error reading source directory: ${error.message}`, colors.red)
    log(`\nHint: Create ${SOURCE_DIR} and place your images there.`, colors.yellow)
    process.exit(1)
  }

  if (imageFiles.length === 0) {
    log(`No images found in ${SOURCE_DIR}`, colors.yellow)
    log('Place your source images in public/images/ and run again.\n', colors.yellow)
    return
  }

  log(`Found ${imageFiles.length} image(s)\n`, colors.blue)

  // Process each image
  for (const imageFile of imageFiles) {
    await processImage(imageFile)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  log(`\n✓ Complete! Processed ${imageFiles.length} image(s) in ${elapsed}s\n`, colors.green)
}

// Run the generator
generateImages().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, colors.red)
  console.error(error)
  process.exit(1)
})
