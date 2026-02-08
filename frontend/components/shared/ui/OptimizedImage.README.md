# OptimizedImage Component

A Vue 3 component for serving responsive, optimized images with automatic format selection (AVIF → WebP → fallback) and lazy loading.

## Features

- **Automatic srcset generation**: Creates responsive image sets at multiple breakpoints
- **Modern format support**: Serves AVIF and WebP with graceful fallbacks
- **Lazy loading**: Built-in lazy loading for better performance
- **TypeScript support**: Full TypeScript type safety
- **Accessibility**: Proper alt text and semantic HTML structure

## Installation

The component is located at `frontend/components/shared/ui/OptimizedImage.vue`.

## Usage

### Basic Usage

```vue
<script setup lang="ts">
import OptimizedImage from '@/components/shared/ui/OptimizedImage.vue'
</script>

<template>
  <OptimizedImage
    src="/images/hero.png"
    alt="Hero banner showing our product"
  />
</template>
```

### With Dimensions

```vue
<OptimizedImage
  src="/images/hero.png"
  alt="Hero banner"
  :width="1920"
  :height="1080"
/>
```

### Custom Responsive Sizes

```vue
<OptimizedImage
  src="/images/gallery-item.jpg"
  alt="Gallery photo"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px"
/>
```

### Eager Loading (Above the Fold)

```vue
<OptimizedImage
  src="/images/hero.png"
  alt="Hero banner"
  :lazy="false"
  priority
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Path to source image (relative to `/public/images/`) |
| `alt` | `string` | **required** | Alt text for accessibility |
| `sizes` | `string` | `"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` | Responsive sizes string |
| `width` | `number` | `undefined` | Image width in pixels |
| `height` | `number` | `undefined` | Image height in pixels |
| `lazy` | `boolean` | `true` | Enable lazy loading |
| `quality` | `number` | `85` | Image quality (1-100) |

## Image Generation

The component expects pre-generated images in multiple sizes and formats. To generate them:

```bash
npm run generate:images
```

This will:
1. Read images from `public/images/`
2. Generate sizes: 320w, 640w, 1024w, 1920w
3. Convert to WebP and AVIF formats
4. Save to `public/assets/images/resized/`

See `public/images/README.md` for full details.

## File Naming Convention

Generated files follow this pattern: `{basename}-{size}.{format}`

Examples:
- `hero-320.webp`
- `hero-640.avif`
- `hero-1024.webp`

The component automatically constructs these paths from the source image filename.

## Browser Support

- **Modern browsers**: Will receive AVIF (smallest file size, best quality)
- **Good support**: Will receive WebP (good compression, wide support)
- **Fallback**: Will receive WebP with srcset support

All browsers receive a working image with automatic fallback chain.

## Performance Benefits

1. **Smaller file sizes**: AVIF can be 30-50% smaller than JPEG/WebP
2. **Responsive serving**: Only download the size needed for the viewport
3. **Lazy loading**: Images load only when needed
4. **Modern formats**: Better compression ratios mean faster page loads

## Example: Responsive Image Gallery

```vue
<script setup lang="ts">
import OptimizedImage from '@/components/shared/ui/OptimizedImage.vue'

const gallery = [
  { id: 1, src: '/images/photo1.jpg', alt: 'Sunset at the beach' },
  { id: 2, src: '/images/photo2.jpg', alt: 'Mountain landscape' },
  { id: 3, src: '/images/photo3.jpg', alt: 'City skyline' }
]
</script>

<template>
  <div class="gallery">
    <figure v-for="item in gallery" :key="item.id" class="gallery-item">
      <OptimizedImage
        :src="item.src"
        :alt="item.alt"
        sizes="(max-width: 600px) 100vw, 33vw"
      />
      <figcaption>{{ item.alt }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.gallery-item {
  margin: 0;
}

gallery-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
```

## Accessibility

- Always provide meaningful `alt` text
- Use `width` and `height` to prevent layout shift
- Consider `:lazy="false"` for above-the-fold images
- Ensure adequate color contrast for surrounding content
