<script setup lang="ts">
defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="feed-content-wrapper">
    <div class="feed-content">
      <div class="feed-section">
        <h4>🐦 Brisbane Radar</h4>
        <p>Live weather radar for Brisbane area</p>
        <iframe src="https://www.bom.gov.au/products/IDR064.loop.gif"></iframe>
      </div>
      <div class="feed-section">
        <h4>🚂 Subway Surfers (YT)</h4>
        <p>Autoplay gameplay video</p>
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"></iframe>
      </div>
      <div class="feed-section">
        <h4>🐦 BOM Queensland (X)</h4>
        <p>Latest weather alerts from Bureau of Meteorology</p>
        <a href="https://x.com/BOM_Qld" target="_blank" style="color: #666; font-size: 12px; display: block; margin-top: 5px;">@BOM_Qld on X/Twitter →</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-content-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  margin-top: -2px;
}

.dark .feed-content-wrapper {
  background: rgba(40, 44, 52, 0.95);
}

.feed-content {
  padding: 15px;
  overflow-y: auto;
  max-height: 400px;
}

.feed-section {
  margin-bottom: 20px;
  transition: transform 0.2s ease;
}

.feed-section:hover {
  transform: scale(1.005);
}

.feed-section h4 {
  color: #ff6b9d;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.dark .feed-section h4 {
  color: #ffb6c1;
}

.feed-section iframe {
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 10px;
}

.feed-section p {
  font-size: 12px;
  color: #666;
  margin: 5px 0 0 0;
  line-height: 1.4;
}

.dark .feed-section p {
  color: #aaa;
}

.feed-section a {
  transition: color 0.2s ease;
}

.feed-section a:hover {
  color: #ff6b9d;
}

.dark .feed-section a:hover {
  color: #ffb6c1;
}
</style>
