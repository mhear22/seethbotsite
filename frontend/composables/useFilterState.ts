import { ref, computed, reactive, type Ref, type ComputedRef } from 'vue'

export interface FilterConfig<T> {
  items: Ref<T[]> | ComputedRef<T[]>
  filterFn: (item: T, filters: Record<string, any>) => boolean
  searchFn?: (item: T, query: string) => boolean
}

export function useFilterState<T>(config: FilterConfig<T>) {
  const filters = reactive<Record<string, any>>({})
  const searchQuery = ref('')

  /**
   * Default search function that searches all string properties
   */
  const defaultSearchFn = (item: T, query: string): boolean => {
    if (!query) return true

    const lowerQuery = query.toLowerCase()
    return Object.values(item as any).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery)
      }
      return false
    })
  }

  /**
   * Filtered items based on current filters and search query
   */
  const filtered = computed(() => {
    let result = config.items.value

    // Apply filters
    const hasFilters = Object.keys(filters).some(key => {
      const value = filters[key]
      return value !== '' && value !== null && value !== undefined
    })

    if (hasFilters) {
      result = result.filter(item => config.filterFn(item, filters))
    }

    // Apply search
    if (searchQuery.value) {
      const searchFn = config.searchFn || defaultSearchFn
      result = result.filter(item => searchFn(item, searchQuery.value))
    }

    return result
  })

  /**
   * Set a filter value
   */
  const setFilter = (key: string, value: any) => {
    filters[key] = value
  }

  /**
   * Set multiple filter values
   */
  const setFilters = (newFilters: Record<string, any>) => {
    Object.assign(filters, newFilters)
  }

  /**
   * Clear a single filter
   */
  const clearFilter = (key: string) => {
    delete filters[key]
  }

  /**
   * Clear all filters and search query
   */
  const clearAll = () => {
    Object.keys(filters).forEach(key => delete filters[key])
    searchQuery.value = ''
  }

  /**
   * Clear only filters (keep search query)
   */
  const clearFilters = () => {
    Object.keys(filters).forEach(key => delete filters[key])
  }

  /**
   * Clear only search query (keep filters)
   */
  const clearSearch = () => {
    searchQuery.value = ''
  }

  /**
   * Count of active filters (non-empty values)
   */
  const activeFilterCount = computed(() => {
    const filterCount = Object.keys(filters).filter(key => {
      const value = filters[key]
      return value !== '' && value !== null && value !== undefined
    }).length

    const searchCount = searchQuery.value ? 1 : 0
    return filterCount + searchCount
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  /**
   * Check if a specific filter is active
   */
  const isFilterActive = (key: string) => {
    const value = filters[key]
    return value !== '' && value !== null && value !== undefined
  }

  /**
   * Get the current value of a filter
   */
  const getFilter = (key: string) => {
    return filters[key]
  }

  /**
   * Count of filtered items
   */
  const filteredCount = computed(() => filtered.value.length)

  /**
   * Count of total items
   */
  const totalCount = computed(() => config.items.value.length)

  return {
    filters,
    searchQuery,
    filtered,
    filteredCount,
    totalCount,
    activeFilterCount,
    hasActiveFilters,
    setFilter,
    setFilters,
    clearFilter,
    clearFilters,
    clearSearch,
    clearAll,
    isFilterActive,
    getFilter
  }
}
