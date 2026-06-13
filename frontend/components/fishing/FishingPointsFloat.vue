<template>
  <transition-group name="float" tag="div" class="float-layer">
    <div v-for="f in floats" :key="f.id" class="float-item" :class="{ 'reduced-motion': reducedMotion }">
      +{{ f.points }}
    </div>
  </transition-group>
</template>

<script setup lang="ts">
defineProps<{
  floats: { id: number; points: number }[]
  reducedMotion: boolean
}>()
</script>

<style scoped>
.float-layer {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1090;
  pointer-events: none;
}

.float-item {
  font-size: 34px;
  font-weight: 900;
  color: #fcd34d;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  text-align: center;
  animation: floatUp 1.2s ease-out forwards;
}

@keyframes floatUp {
  0% { opacity: 0; transform: translateY(20px) scale(0.6); }
  20% { opacity: 1; transform: translateY(0) scale(1.1); }
  100% { opacity: 0; transform: translateY(-90px) scale(1); }
}

.float-item.reduced-motion {
  animation: floatFade 1.2s ease-out forwards;
}

@keyframes floatFade {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
