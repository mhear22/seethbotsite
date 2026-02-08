# Generated Optimized Images

This directory contains automatically generated optimized images. **Do not edit these files directly.**

## Files here are created by:

`npm run generate:images`

Or automatically during `npm run build`

## Format

Files are named: `{basename}-{size}.{format}`

- Sizes: 320, 640, 1024, 1920
- Formats: webp, avif

Example: `hero-1024.webp`

## Clean up

To regenerate all images, delete this directory and run:

```bash
rm -rf public/assets/images/resized/*
npm run generate:images
```
