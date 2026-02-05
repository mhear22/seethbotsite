<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'

interface TicketFormProps {
  title: string
  description: string
  type?: 'feature' | 'bug' | 'feedback'
  priority?: 'high' | 'medium' | 'low'
  tags?: string
  category?: string
  isEditing?: boolean
  loading?: boolean
  estimatedWaitTimeMinutes?: number | null
  sampleSize?: number
}

const props = withDefaults(defineProps<TicketFormProps>(), {
  isEditing: false,
  loading: false,
  estimatedWaitTimeMinutes: null,
  sampleSize: 0
})

const emit = defineEmits<{
  'update:title': [value: string]
  'update:description': [value: string]
  'update:type': [value: 'feature' | 'bug' | 'feedback']
  'update:priority': [value: 'high' | 'medium' | 'low']
  'update:tags': [value: string]
  'update:category': [value: string]
  submit: []
  cancel: []
}>()

// Local state bound to props
const localTitle = computed({
  get: () => props.title,
  set: (value: string) => emit('update:title', value)
})

const localDescription = computed({
  get: () => props.description,
  set: (value: string) => emit('update:description', value)
})

const localType = computed({
  get: () => props.type || 'feature',
  set: (value: 'feature' | 'bug' | 'feedback') => emit('update:type', value)
})

const localPriority = computed({
  get: () => props.priority || 'medium',
  set: (value: 'high' | 'medium' | 'low') => emit('update:priority', value)
})

const localTags = computed({
  get: () => props.tags || '',
  set: (value: string) => emit('update:tags', value)
})

const localCategory = computed({
  get: () => props.category || '',
  set: (value: string) => emit('update:category', value)
})

// Available categories for autocomplete
const availableCategories = ref<string[]>([])

// Load available categories
const loadCategories = async () => {
  try {
    const response = await fetch('/api/tickets/categories')
    if (response.ok) {
      const data = await response.json()
      availableCategories.value = data.categories.map((c: any) => c.name)
    }
  } catch (err) {
    console.warn('Failed to load categories:', err)
  }
}

onMounted(() => {
  loadCategories()
})

const isFormValid = computed(() => {
  return props.title.trim() !== ''
})

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}

// Handle Ctrl+Enter to submit
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}

// Format wait time for display
const formatWaitTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`
  } else {
    const days = Math.floor(minutes / 1440)
    const hours = Math.round((minutes % 1440) / 60)
    if (hours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`
    }
    return `${days} day${days > 1 ? 's' : ''} ${hours}h`
  }
}
</script>

<template>
  <div class="ticket-form-content">
    <div class="form-group">
      <label for="ticket-title">Title</label>
      <input
        id="ticket-title"
        v-model="localTitle"
        type="text"
        placeholder="Brief summary of your ticket..."
        :disabled="loading"
        @keydown="handleKeyDown"
      />
    </div>

    <div class="form-group">
      <label for="ticket-description">Description</label>
      <textarea
        id="ticket-description"
        v-model="localDescription"
        placeholder="Detailed description of your request..."
        rows="6"
        :disabled="loading"
        @keydown="handleKeyDown"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="ticket-type">Type</label>
      <select
        id="ticket-type"
        v-model="localType"
        :disabled="loading"
      >
        <option value="feature">✨ Feature Request</option>
        <option value="bug">🐛 Bug Report</option>
        <option value="feedback">💬 Feedback</option>
      </select>
    </div>

    <div class="form-group">
      <label for="ticket-priority">Priority</label>
      <select
        id="ticket-priority"
        v-model="localPriority"
        :disabled="loading"
      >
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>
    </div>

    <div class="form-group">
      <label for="ticket-tags">Tags (comma-separated)</label>
      <input
        id="ticket-tags"
        v-model="localTags"
        type="text"
        placeholder="e.g., ui, bug, performance"
        :disabled="loading"
      />
    </div>

    <div class="form-group">
      <label for="ticket-category">Category</label>
      <input
        id="ticket-category"
        v-model="localCategory"
        type="text"
        list="category-list"
        placeholder="e.g., User Interface, Backend, Performance"
        :disabled="loading"
      />
      <datalist id="category-list">
        <option v-for="cat in availableCategories" :key="cat" :value="cat" />
      </datalist>
    </div>

    <div class="form-actions">
      <button
        v-if="isEditing"
        @click="handleCancel"
        class="btn btn-cancel"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="handleSubmit"
        class="btn btn-submit"
        :disabled="loading || !isFormValid"
      >
        {{ loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit Ticket') }}
      </button>
    </div>

    <div class="form-hint">
      💡 Tip: Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit quickly
    </div>

    <div v-if="!isEditing && estimatedWaitTimeMinutes !== null" class="estimated-wait-time">
      <span class="wait-icon">⏱️</span>
      <span class="wait-text">
        Estimated wait time: <strong>{{ formatWaitTime(estimatedWaitTimeMinutes) }}</strong>
        <span class="wait-subtext">(based on {{ sampleSize }} completed tickets)</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticket-form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
  color: #2d3748;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-group select {
  cursor: pointer;
  background: white;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: #4299e1;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.btn-submit:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: #cbd5e0;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #a0aec0;
  transform: translateY(-1px);
}

.form-hint {
  font-size: 13px;
  color: #718096;
  text-align: center;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.form-hint kbd {
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.estimated-wait-time {
  margin-top: 8px;
  padding: 12px 14px;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #c6f6d5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wait-icon {
  font-size: 18px;
}

.wait-text {
  font-size: 14px;
  color: #22543d;
  flex: 1;
}

.wait-text strong {
  color: #2f855a;
  font-weight: 600;
}

.wait-subtext {
  font-size: 12px;
  color: #276749;
  opacity: 0.8;
}

/* Dark mode */
.dark .form-group label {
  color: #cbd5e0;
}

.dark .form-group input,
.dark .form-group textarea,
.dark .form-group select {
  background: #1a202c;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .form-group input:focus,
.dark .form-group textarea:focus,
.dark .form-group select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.dark .form-group input:disabled,
.dark .form-group textarea:disabled,
.dark .form-group select:disabled {
  background: #2d3748;
  color: #718096;
}

.dark .form-hint {
  background: #2d3748;
  border-color: #4a5568;
  color: #a0aec0;
}

.dark .form-hint kbd {
  background: #1a202c;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .estimated-wait-time {
  background: #22543d;
  border-color: #276749;
}

.dark .wait-text {
  color: #c6f6d5;
}

.dark .wait-text strong {
  color: #68d391;
}

.dark .wait-subtext {
  color: #9ae6b4;
}
</style>
