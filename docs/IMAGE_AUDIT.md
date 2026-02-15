# Image Audit

Image optimization is handled automatically by `vite-plugin-imagemin` during builds (PNG optipng level 7, JPEG mozjpeg quality 80, SVG svgo).

## Current Images

| Image | Size | Notes |
|-------|------|-------|
| orlando-roommate-cat.png | 3.4M | HIGH PRIORITY - needs WebP conversion or lossy compression |
| zai-key-expiration.png | 117K | Optimized (was 775K) |
| tomodachi-life.png | 6.4K | Optimized (was 86K) |
| goose.png | 23K | Acceptable |
| favicon.png | 99B | Fine |
| favicon.svg | 764B | Fine |

## Next Steps

- Convert `orlando-roommate-cat.png` to WebP (biggest win)
- Add `srcset` for responsive images
- Add lazy loading for below-fold images
