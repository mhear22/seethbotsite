<script setup lang="ts">
import { computed } from 'vue'

interface PricePoint {
  timestamp: number
  price: number
}

interface Props {
  history: PricePoint[]
}

const props = defineProps<Props>()

const chartSvg = computed(() => {
  if (!props.history || props.history.length < 2) return ''

  const prices = props.history.map(h => h.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const width = 300
  const height = 100
  const padding = 5

  let points = ''
  props.history.forEach((point, index) => {
    const x = padding + (index / (props.history.length - 1)) * (width - padding * 2)
    const normalizedPrice = (point.price - minPrice) / priceRange
    const y = height - padding - normalizedPrice * (height - padding * 2)
    points += `${x},${y} `
  })

  const color = props.history[props.history.length - 1].price >= props.history[0].price ? '#48bb78' : '#ff6b6b'
  const lastPoint = points.trim().split(' ').pop() || '0,0'
  const [lastX, lastY] = lastPoint.split(',')

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline
        points="${points.trim()}"
        fill="none"
        stroke="${color}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="${lastX}"
        cy="${lastY}"
        r="4"
        fill="${color}"
      />
    </svg>
  `
})
</script>

<template>
  <div class="chart-container" v-html="chartSvg"></div>
</template>

<style scoped>
.chart-container {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  overflow: hidden;
}

.chart-container svg {
  width: 100%;
  height: auto;
}
</style>
