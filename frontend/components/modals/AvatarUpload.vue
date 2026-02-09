<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  initialUrl?: string
  isBanner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialUrl: '',
  isBanner: false
})

const emit = defineEmits<{
  change: [url: string]
}>()

const isDragging = ref(false)
const isUploading = ref(false)
const previewUrl = ref(props.initialUrl)
const errorMessage = ref('')

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const uploadLabel = computed(() => {
  if (props.isBanner) {
    return previewUrl.value ? 'Change Banner' : 'Upload Banner'
  }
  return previewUrl.value ? 'Change Avatar' : 'Upload Avatar'
})

const fileInput = ref<HTMLInputElement | null>(null)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  await processFile(file)
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const file = files[0]
  await processFile(file)
}

const processFile = async (file: File) => {
  errorMessage.value = ''

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'Please select a JPG, PNG, or WebP image'
    return
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Image must be less than 2MB'
    return
  }

  // Compress and upload
  isUploading.value = true

  try {
    const compressedUrl = await compressImage(file)
    previewUrl.value = compressedUrl
    emit('change', compressedUrl)
  } catch (error) {
    console.error('Error processing image:', error)
    errorMessage.value = 'Failed to process image'
  } finally {
    isUploading.value = false
  }
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Calculate dimensions
      let width = img.width
      let height = img.height

      if (props.isBanner) {
        // Banner: max 1200x300
        const maxWidth = 1200
        const maxHeight = 300

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      } else {
        // Avatar: max 400x400
        const maxSize = 400

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        // Make it square for avatar
        const size = Math.min(width, height)
        width = size
        height = size
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      const quality = 0.85
      const format = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'

      resolve(canvas.toDataURL(format, quality))
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const removeImage = () => {
  previewUrl.value = ''
  errorMessage.value = ''
  emit('change', '')
}
</script>

<template>
  <div class="avatar-upload">
    <div
      :class="[
        'upload-area',
        { 'is-dragging': isDragging, 'is-uploading': isUploading }
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="ALLOWED_TYPES.join(',')"
        @change="handleFileSelect"
        style="display: none"
      />

      <!-- Preview -->
      <div v-if="previewUrl" class="preview-container">
        <img
          v-if="isBanner"
          :src="previewUrl"
          alt="Banner preview"
          class="banner-preview"
        />
        <img
          v-else
          :src="previewUrl"
          alt="Avatar preview"
          class="avatar-preview"
        />
        <button
          class="remove-btn"
          @click="removeImage"
          title="Remove image"
        >
          &times;
        </button>
      </div>

      <!-- Upload prompt -->
      <div v-else class="upload-prompt">
        <div class="upload-icon">
          {{ isBanner ? '🖼️' : '👤' }}
        </div>
        <p class="upload-text">
          Drag and drop an image here, or
          <button class="upload-btn" @click="triggerFileInput">
            browse
          </button>
        </p>
        <p class="upload-hint">
          JPG, PNG, or WebP • Max 2MB
          <template v-if="isBanner">• Recommended 1200x300</template>
          <template v-else>• Will be cropped to square</template>
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isUploading" class="upload-overlay">
        <div class="spinner"></div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Or use URL -->
    <div v-if="!previewUrl" class="url-input-section">
      <label class="url-label">Or use an image URL:</label>
      <div class="url-input-group">
        <input
          v-model="previewUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="url-input"
          @input="emit('change', previewUrl)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed var(--border-color, #e2e8f0);
  border-radius: 12px;
  background: var(--bg-secondary, #f7fafc);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  overflow: hidden;
}

.upload-area.is-dragging {
  border-color: var(--accent, #8b5cf6);
  background: var(--accent-light, rgba(139, 92, 246, 0.1));
}

.upload-area.is-uploading {
  pointer-events: none;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.banner-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

.upload-prompt {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  margin: 0 0 8px 0;
  color: var(--text-primary, #2d3748);
}

.upload-btn {
  background: none;
  border: none;
  color: var(--accent, #8b5cf6);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.upload-btn:hover {
  color: var(--accent-hover, #7c3aed);
}

.upload-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-tertiary, #718096);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color, #e2e8f0);
  border-top-color: var(--accent, #8b5cf6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  font-size: 14px;
}

.url-input-section {
  margin-top: 16px;
}

.url-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #2d3748);
}

.url-input-group {
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #2d3748);
}

.url-input:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}

/* Dark mode */
.dark .upload-area {
  border-color: var(--border-color, #4a5568);
  background: var(--bg-secondary, #2d3748);
}

.dark .upload-area.is-dragging {
  background: rgba(139, 92, 246, 0.1);
}

.dark .upload-text {
  color: var(--text-primary, #e2e8f0);
}

.dark .upload-hint {
  color: var(--text-tertiary, #a0aec0);
}

.dark .upload-overlay {
  background: rgba(45, 55, 72, 0.8);
}

.dark .url-label {
  color: var(--text-primary, #e2e8f0);
}

.dark .url-input {
  background: var(--bg-secondary, #2d3748);
  border-color: var(--border-color, #4a5568);
  color: var(--text-primary, #e2e8f0);
}

.dark .url-input:focus {
  border-color: var(--accent, #8b5cf6);
}
</style>
