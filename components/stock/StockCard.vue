<script setup lang="ts">
import { computed } from 'vue'

interface Stock {
  name: string
  avatar: string
  price: number
  coolnessScore: number
  shares: number
}

interface Props {
  stock: Stock
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [stock: Stock]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

const formatEmoji = (emoji: string): string => {
  const customEmojiMatch = emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/)
  if (customEmojiMatch) {
    const emojiId = customEmojiMatch[2]
    const isAnimated = emoji.startsWith('<a:')
    const extension = isAnimated ? 'gif' : 'png'
    return `<img src="https://cdn.discordapp.com/emojis/${emojiId}.${extension}" class="emoji" alt="emoji" loading="lazy" />`
  }
  return emoji
}

const priceTrend = computed(() => {
  const diff = props.stock.price - (props.stock.coolnessScore / 10)
  if (diff > 0) return 'up'
  if (diff < 0) return 'down'
  return 'same'
})
</script>

<template>
  <div
    class="stock-card"
    :class="{ active }"
    @click="$emit('select', stock)"
  >
    <div class="stock-header">
      <span class="stock-avatar" v-html="formatEmoji(stock.avatar)"></span>
      <span class="stock-name">{{ stock.name }}</span>
    </div>
    <div class="stock-price">{{ formatCurrency(stock.price) }}</div>
    <div class="stock-info">
      <span>{{ stock.shares }} shares</span>
      <span :class="priceTrend">
        {{ priceTrend === 'up' ? '↑' : priceTrend === 'down' ? '↓' : '=' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.stock-card {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stock-card.active {
  border-color: #ff6b9d;
  background: rgba(255, 107, 157, 0.1);
}

body.dark .stock-card {
  background: rgba(60, 64, 72, 0.9);
}

body.dark .stock-card.active {
  background: rgba(232, 94, 144, 0.1);
  border-color: #e85e90;
}

.stock-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.stock-avatar {
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stock-avatar .emoji {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.stock-name {
  font-weight: bold;
  color: #333;
  flex: 1;
}

body.dark .stock-name {
  color: #e2e8f0;
}

.stock-price {
  font-size: 20px;
  font-weight: bold;
  color: #48bb78;
  margin-bottom: 8px;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

body.dark .stock-info {
  color: #aaa;
}

.stock-info .up {
  color: #48bb78;
}

.stock-info .down {
  color: #ff6b6b;
}
</style>
