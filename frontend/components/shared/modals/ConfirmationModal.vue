<script setup lang="ts">
defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
}
</script>

<template>
  <div class="confirmation" :class="{ active: isOpen }" @click.self="close" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
    <div class="confirmation-box">
      <div class="emoji" aria-hidden="true">💕</div>
      <h1 id="confirmation-title">So you want to be a girl?</h1>
      <p>You could totally be a girl if you wanted. No matter who you are or what you've been through, don't let anything stop you from living as your best self!</p>
      <p>✨ You are valid no matter who you are ✨</p>
      <div class="button-row">
        <button class="cute-btn" @click="close" aria-label="Cancel and return to previous page">Go back</button>
        <button class="cute-btn" @click="confirm" aria-label="Confirm and switch to girl mode" style="background: linear-gradient(45deg, #ff6b9d, #ff8a80);">Yes! Turn me into a girl! 💕</button>
      </div>
    </div>
  </div>
</template>
