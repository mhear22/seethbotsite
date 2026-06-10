<template>
  <div class="api-docs-loading">
    <div class="spinner"></div>
    <p>Loading API documentation...</p>
  </div>
</template>

<style scoped>
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

.dark .api-docs-loading {
  color: #cbd5e0;
}

.dark .spinner {
  border-color: #4a5568;
  border-top-color: #4299e1;
}
</style>
