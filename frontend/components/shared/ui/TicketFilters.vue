<script setup lang="ts">
import { computed, ref } from 'vue'

interface FilterOptions {
  value: string
  label: string
}

interface TicketFiltersProps {
  modelValue: {
    searchQuery: string
    filterStatus: string
    filterType: string
    filterPriority: string
    filterTag: string
    filterCategory: string
  }
  statusOptions?: FilterOptions[]
  typeOptions?: FilterOptions[]
  priorityOptions?: FilterOptions[]
}

const props = withDefaults(defineProps<TicketFiltersProps>(), {
  statusOptions: () => [
    { value: 'pending', label: '⏳ Pending' },
    { value: 'in-progress', label: '🔄 In Progress' },
    { value: 'completed', label: '✅ Complete' }
  ],
  typeOptions: () => [
    { value: 'feature', label: '✨ Feature' },
    { value: 'bug', label: '🐛 Bug' },
    { value: 'feedback', label: '💬 Feedback' }
  ],
  priorityOptions: () => [
    { value: 'high', label: '🔴 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' }
  ]
})

const emit = defineEmits<{
  'update:modelValue': [value: {
    searchQuery: string
    filterStatus: string
    filterType: string
    filterPriority: string
    filterTag: string
    filterCategory: string
  }]
}>()

// Local state with two-way binding
const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Individual filter helpers for two-way binding
const searchQuery = computed({
  get: () => filters.value.searchQuery,
  set: (value) => emit('update:modelValue', { ...filters.value, searchQuery: value })
})

const filterStatus = computed({
  get: () => filters.value.filterStatus,
  set: (value) => emit('update:modelValue', { ...filters.value, filterStatus: value })
})

const filterType = computed({
  get: () => filters.value.filterType,
  set: (value) => emit('update:modelValue', { ...filters.value, filterType: value })
})

const filterPriority = computed({
  get: () => filters.value.filterPriority,
  set: (value) => emit('update:modelValue', { ...filters.value, filterPriority: value })
})

const filterTag = computed({
  get: () => filters.value.filterTag,
  set: (value) => emit('update:modelValue', { ...filters.value, filterTag: value })
})

const filterCategory = computed({
  get: () => filters.value.filterCategory,
  set: (value) => emit('update:modelValue', { ...filters.value, filterCategory: value })
})

// Toggle functions for multi-select filters
const toggleType = (value: string) => {
  emit('update:modelValue', {
    ...filters.value,
    filterType: filterType.value === value ? '' : value
  })
}

const togglePriority = (value: string) => {
  emit('update:modelValue', {
    ...filters.value,
    filterPriority: filterPriority.value === value ? '' : value
  })
}

const clearSearch = () => {
  emit('update:modelValue', { ...filters.value, searchQuery: '' })
}

const clearTag = () => {
  emit('update:modelValue', { ...filters.value, filterTag: '' })
}

const clearCategory = () => {
  emit('update:modelValue', { ...filters.value, filterCategory: '' })
}

// Search input ref for parent component to focus
const searchInputRef = ref<HTMLInputElement | null>(null)

// Expose the search input ref to parent
defineExpose({
  searchInputRef
})
</script>

<template>
  <div class="ticket-filters">
    <!-- Search Box -->
    <div class="search-box">
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Search tickets... (press / to focus)"
        class="search-input"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="search-clear"
        title="Clear search"
      >
        ✕
      </button>
    </div>

    <!-- Status Filters -->
    <div class="filter-group-title">Status</div>
    <div class="filter-chips">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        @click="filterStatus = option.value"
        :class="['filter-chip', { active: filterStatus === option.value }]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Type Filters -->
    <div class="filter-group-title">Type</div>
    <div class="filter-chips">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        @click="toggleType(option.value)"
        :class="['filter-chip', { active: filterType === option.value }]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Priority Filters -->
    <div class="filter-group-title">Priority</div>
    <div class="filter-chips">
      <button
        v-for="option in priorityOptions"
        :key="option.value"
        @click="togglePriority(option.value)"
        :class="['filter-chip', { active: filterPriority === option.value }]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Tag Filter -->
    <div class="filter-group-title">Tags</div>
    <div class="filter-chips">
      <input
        v-model="filterTag"
        type="text"
        placeholder="🏷️ Filter by tag..."
        class="filter-input"
      />
      <button
        v-if="filterTag"
        @click="clearTag"
        class="filter-clear"
        title="Clear tag filter"
      >
        ✕
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-group-title">Category</div>
    <div class="filter-chips">
      <input
        v-model="filterCategory"
        type="text"
        placeholder="📁 Filter by category..."
        class="filter-input"
      />
      <button
        v-if="filterCategory"
        @click="clearCategory"
        class="filter-clear"
        title="Clear category filter"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.ticket-filters {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

/* Search box styles */
.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #4a5568;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #48bb78;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
}

.search-clear:hover {
  background: #38a169;
  transform: translateY(-50%) scale(1.1);
}

/* Filter group title styles */
.filter-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  margin: 16px 0 8px 0;
}

.filter-group-title:first-of-type {
  margin-top: 0;
}

/* Filter chips */
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 6px 14px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
  transform: translateY(-1px);
}

.filter-chip.active {
  border-color: #4299e1;
  background: #ebf8ff;
  color: #2b6cb0;
  font-weight: 600;
}

/* Filter input styles */
.filter-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  background: white;
  min-width: 150px;
}

.filter-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
}

.filter-clear {
  padding: 4px 8px;
  background: #cbd5e0;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-clear:hover {
  background: #a0aec0;
}

/* Dark mode */
.dark .ticket-filters {
  background: rgba(40, 44, 52, 0.95);
  border-color: #4a5568;
}

.dark .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
  font-weight: 500;
}

.dark .search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.dark .search-input::placeholder {
  color: #718096;
}

.dark .search-clear {
  background: #38a169;
  color: white;
}

.dark .search-clear:hover {
  background: #48bb78;
}

.dark .filter-group-title {
  color: #a0aec0;
}

.dark .filter-chip {
  background: #2d3748;
  border-color: #4a5568;
  color: #cbd5e0;
}

.dark .filter-chip:hover {
  border-color: #718096;
  background: #4a5568;
}

.dark .filter-chip.active {
  border-color: #4299e1;
  background: #2a4365;
  color: #90cdf4;
}

.dark .filter-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .filter-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.dark .filter-clear {
  background: #4a5568;
}

.dark .filter-clear:hover {
  background: #718096;
}
</style>
