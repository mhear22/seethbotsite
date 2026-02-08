<script setup lang="ts">
interface Props {
  src: string
  alt: string
  sizes?: string
  width?: number
  height?: number
  lazy?: boolean
  quality?: number
}

const props = withDefaults(defineProps<Props>(), {
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  lazy: true,
  quality: 85
})

// Generate srcset based on available sizes
const generateSrcset = (basePath: string): string => {
  const sizes = [320, 640, 1024, 1920]
  return sizes
    .map(size => `${basePath}-${size}.webp ${size}w`)
    .join(', ')
}

// Remove file extension and add resized path
const getBasePath = (src: string): string => {
  const parts = src.split('/')
  const filename = parts[parts.length - 1]
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  return `/assets/images/resized/${nameWithoutExt}`
}

const basePath = getBasePath(props.src)
const webpSrcset = generateSrcset(basePath)
const fallbackSrc = `${basePath}-640.webp` // Fallback for browsers that don't support srcset
</script>

<template>
  <picture>
    <!-- AVIF source with fallback -->
    <source
      type="image/avif"
      :srcset="webpSrcset.replace(/\.webp/g, '.avif')"
      :sizes="sizes"
    />
    <!-- WebP source -->
    <source
      type="image/webp"
      :srcset="webpSrcset"
      :sizes="sizes"
    />
    <!-- Fallback image -->
    <img
      :src="fallbackSrc"
      :srcset="webpSrcset"
      :sizes="sizes"
      :loading="lazy ? 'lazy' : 'eager'"
      :alt="alt"
      :width="width"
      :height="height"
      decoding="async"
    />
  </picture>
</template>

<style scoped>
img {
  max-width: 100%;
  height: auto;
  display: block;
}

picture {
  display: block;
}
</style>
