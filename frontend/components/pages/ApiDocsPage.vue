<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ApiDocsHeader from './ApiDocsHeader.vue'
import ApiDocsLoadingOverlay from './ApiDocsLoadingOverlay.vue'

const apiDocsUrl = ref('/api-docs/')
const loading = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const refreshDocs = () => {
  loading.value = true
  if (iframeRef.value) {
    iframeRef.value.src = iframeRef.value.src
  }
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// Auto-refresh on mount
onMounted(() => {
  refreshDocs()
})
</script>

<template>
  <div class="api-docs-page">
    <ApiDocsHeader :loading="loading" @refresh="refreshDocs" />
    <div class="api-docs-iframe-wrapper">
      <iframe
        ref="iframeRef"
        :src="apiDocsUrl"
        class="api-docs-iframe"
        title="API Documentation"
        @load="loading = false"
      ></iframe>
      <ApiDocsLoadingOverlay v-if="loading" />
    </div>
  </div>
</template>

<style scoped>
.api-docs-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
}

.api-docs-iframe-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 250px);
  min-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.api-docs-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

/* Dark mode */
.dark .api-docs-page {
  background: #1a202c;
}

.dark .api-docs-iframe-wrapper {
  background: #2d3748;
  border-color: #4a5568;
}
</style>
