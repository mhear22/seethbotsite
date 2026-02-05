<script setup lang="ts">
import { computed } from 'vue'
import { parseEmoji, type DiscordEmoji } from '../../../utils/emoji'

const props = defineProps<{
  emoji: string
  size?: number
}>()

const parsed = computed<DiscordEmoji>(() => parseEmoji(props.emoji))

const imageSize = computed(() => {
  return props.size || 32
})
</script>

<template>
  <!-- Discord custom emoji (static or animated) -->
  <img
    v-if="parsed.type === 'discord_static' || parsed.type === 'discord_animated'"
    :src="parsed.url"
    :alt="parsed.name"
    class="discord-emoji"
    :style="{ width: `${imageSize}px`, height: `${imageSize}px` }"
    loading="lazy"
  />

  <!-- Goose emoji - render as image -->
  <img
    v-else-if="emoji === '🪿'"
    src="/goose.png"
    alt="goose"
    class="goose-emoji"
    :style="{ width: `${imageSize}px`, height: `${imageSize}px` }"
    loading="lazy"
  />

  <!-- Regular unicode emoji -->
  <span v-else class="unicode-emoji" :style="{ fontSize: `${imageSize}px` }">
    {{ emoji }}
  </span>
</template>

<style scoped>
.discord-emoji {
  display: inline-block;
  vertical-align: middle;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  object-fit: contain;
}

.goose-emoji {
  display: inline-block;
  vertical-align: middle;
  object-fit: contain;
  border-radius: 8px;
}

.unicode-emoji {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}
</style>
