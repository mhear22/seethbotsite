<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
    <div class="api-docs-container">
      <div class="api-docs-header">
        <h1>📚 API Documentation</h1>
        <p>Interactive API documentation and testing interface</p>
        <button
          @click="refreshDocs"
          class="refresh-btn"
          :disabled="loading"
        >
          {{ loading ? '🔄 Refreshing...' : '🔄 Refresh' }}
        </button>
      </div>
      <div class="api-docs-iframe-wrapper">
        <iframe
          ref="iframeRef"
          :src="apiDocsUrl"
          class="api-docs-iframe"
          title="API Documentation"
          @load="loading = false"
        ></iframe>
        <div v-if="loading" class="api-docs-loading">
          <div class="spinner"></div>
          <p>Loading API documentation...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-docs-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
}

.api-docs-container {
  max-width: 1400px;
  margin: 0 auto;
}

.api-docs-header {
  text-align: center;
  margin-bottom: 30px;
}

.api-docs-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: #2d3748;
}

.api-docs-header p {
  color: #718096;
  margin: 0 0 20px 0;
}

.refresh-btn {
  padding: 10px 24px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
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

.api-docs-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #4a5568;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
.dark .api-docs-page {
  background: #1a202c;
}

.dark .api-docs-header h1 {
  color: #e2e8f0;
}

.dark .api-docs-header p {
  color: #a0aec0;
}

.dark .api-docs-iframe-wrapper {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .api-docs-loading {
  color: #cbd5e0;
}

.dark .spinner {
  border-color: #4a5568;
  border-top-color: #4299e1;
}
</style>
