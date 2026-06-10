<script setup lang="ts">
interface Props {
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div class="api-docs-header">
    <h1>📚 API Documentation</h1>
    <p>Interactive API documentation and testing interface</p>
    <button
      @click="emit('refresh')"
      class="refresh-btn"
      :disabled="props.loading"
    >
      {{ props.loading ? '🔄 Refreshing...' : '🔄 Refresh' }}
    </button>
  </div>
</template>

<style scoped>
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
</style>
