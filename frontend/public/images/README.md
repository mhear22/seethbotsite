# Optimized Images

This directory contains source images that will be automatically processed into multiple sizes and formats.

## How It Works

Place your source images (PNG, JPG, JPEG) in this directory (or subdirectories).

When you run `npm run build` or `npm run generate:images`, the image generator will:

1. Read all images from this directory
2. Generate 4 sizes: 320w, 640w, 1024w, 1920w
3. Convert to WebP and AVIF formats
4. Save optimized images to `public/assets/images/resized/`

## Directory Structure

```
public/
├── images/              # Source images (place yours here)
│   └── hero.png
└── assets/
    └── images/
        └── resized/     # Generated images (auto-created)
            └── hero-320.webp
            └── hero-640.webp
            └── hero-1024.webp
            └── hero-1920.webp
            └── hero-320.avif
            └── hero-640.avif
            └── hero-1024.avif
            └── hero-1920.avif
```

## Usage in Vue Components

```vue
<script setup lang="ts">
import OptimizedImage from '@/components/shared/ui/OptimizedImage.vue'
</script>

<template>
  <OptimizedImage
    src="/images/hero.png"
    alt="Hero image"
    :width="1920"
    :height="1080"
  />
</template>
```

## Props

- `src` (required): Path to source image (relative to `/public/images/`)
- `alt` (required): Alt text for accessibility
- `sizes` (optional): Responsive sizes string, default: `"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
- `width` (optional): Image width in pixels
- `height` (optional): Image height in pixels
- `lazy` (optional): Enable lazy loading, default: `true`
- `quality` (optional): Image quality (1-100), default: `85`

## Manual Image Generation

To regenerate images without a full build:

```bash
npm run generate:images
```

## Supported Formats

Input formats: PNG, JPG, JPEG
Output formats: WebP, AVIF

Browsers will automatically choose the best supported format (AVIF → WebP → fallback).
