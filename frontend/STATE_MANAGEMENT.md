# State Management

## Pattern

Three layers, in order of data flow:

1. **Repositories** (`frontend/repositories/`) - API calls using `openapi-fetch` with generated types
2. **Pinia Stores** (`frontend/stores/`) - Global/shared state; call repositories
3. **Components** - Consume stores; never call APIs directly

```typescript
// Good: component uses store
const ticketsStore = useTicketsStore()
await ticketsStore.loadTickets()

// Bad: direct API call in component
const response = await fetch('/api/tickets')
```

## When to Use Pinia vs Composables

**Pinia stores** - shared across multiple components, server-persisted data, app-wide settings:
- `useAuthStore` - authentication, sessions, profile
- `useAppStore` - theme, audio, UI state
- `useRankingsStore` - leaderboard data
- `useTicketsStore` - tickets CRUD

**Composables** - local/reusable logic, UI interactions, no global state needed:
- `useFavorites` - localStorage favorites
- `useAudio` - audio controls
- `useCat` - cat image fetching
- `usePanels` - panel visibility
- `useKeyboardShortcuts` - keyboard handling

## Store Pattern

All stores use the Setup Store pattern:

```typescript
export const useXxxStore = defineStore('xxx', () => {
  // State
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const count = computed(() => data.value.length)

  // Actions
  const load = async () => {
    loading.value = true
    try {
      data.value = await xxxRepository.getAll()
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, count, load }
})
```

## Thin Composable Wrappers (Deprecated)

`useAuth` and `useRankings` are thin wrappers around their stores for backward compatibility. For new code, use the stores directly.
