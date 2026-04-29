<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ userFriendlyTitle }}</h2>
      <p class="error-message">{{ userFriendlyMessage }}</p>
      <div class="error-actions">
        <button @click="retry" class="btn btn-primary">Try Again</button>
        <button @click="goHome" class="btn btn-secondary">Go Home</button>
      </div>
      <details v-if="showDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  showDetails?: boolean
}>()

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

// Map technical errors to user-friendly messages
const errorMap: Record<string, { title: string; message: string }> = {
  'Network Error': {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.'
  },
  '401': {
    title: 'Authentication Required',
    message: 'You need to be logged in to access this page.'
  },
  '403': {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this content.'
  },
  '404': {
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist or has been moved.'
  },
  '500': {
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified.'
  },
  'default': {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.'
  }
}

const userFriendlyTitle = ref('Something Went Wrong')
const userFriendlyMessage = ref('An unexpected error occurred. Please try again.')

onErrorCaptured((error: Error) => {
  hasError.value = true
  errorMessage.value = error.message
  errorDetails.value = `${error.name}: ${error.message}\n\nStack: ${error.stack}`

  // Map error to user-friendly message
  const errorKey = Object.keys(errorMap).find(key => 
    error.message.includes(key) || error.message.includes(errorMap[key].title)
  )
  
  const mapped = errorKey ? errorMap[errorKey] : errorMap.default
  userFriendlyTitle.value = mapped.title
  userFriendlyMessage.value = mapped.message

  // Log error for debugging
  console.error('Error captured by boundary:', error)

  // Return false to prevent the error from propagating further
  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
}

function goHome() {
  hasError.value = false
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.error-content {
  max-width: 500px;
  text-align: center;
  background: rgba(30, 30, 50, 0.8);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
}

.error-message {
  color: #a5b4fc;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #5558e3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.3);
}

.error-details {
  text-align: left;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.error-details summary {
  color: #a5b4fc;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.error-details pre {
  color: #e5e7eb;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
