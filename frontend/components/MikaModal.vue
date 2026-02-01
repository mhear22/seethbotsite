<script setup lang="ts">
defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}
</script>

<template>
  <div class="mika-modal" :class="{ active: isOpen }" @click.self="close">
    <div class="mika-modal-box">
      <div class="emoji">🌸</div>
      <h1>Hi there!</h1>
      <button class="cute-btn" @click="close">Close</button>
    </div>
  </div>
</template>
