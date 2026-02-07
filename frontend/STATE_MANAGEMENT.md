# State Management Guide

This document describes the standardized state management patterns used in this application.

## Overview

We use two complementary patterns for state management:

1. **Pinia Stores** - For global/shared state
2. **Composables** - For local/component state and reusable logic

## When to Use Pinia Stores

Use Pinia stores when the state needs to be:
- **Shared across multiple components** (e.g., user auth, global settings)
- **Persisted centrally** (e.g., application settings, theme preferences)
- **Accessed from anywhere** in the application
- **Reactively shared** across the entire app

### Examples of Store State:
- User authentication (useAuthStore)
- Application settings (useAppStore)
- Rankings data (useRankingsStore)
- Tickets data (useTicketsStore)
- Global application state (theme, language, etc.)

## When to Use Composables

Use composables when the state is:
- **Local to a component** or small group of components
- **Reusable logic** that doesn't need global state
- **UI interactions** that are component-specific
- **Client-side only** state (no server persistence needed)

### Examples of Composable State:
- Component-specific UI state (modals, forms, filters)
- Reusable logic wrappers around stores
- Client-side utilities (localStorage helpers)
- Form validation logic
- UI interactions (keyboard shortcuts, drag-and-drop)

## Store Organization

### Available Stores

1. **useAuthStore** (`stores/useAuthStore.ts`)
   - User authentication state
   - Session management
   - Profile operations

2. **useAppStore** (`stores/useAppStore.ts`)
   - Global application settings
   - Theme and appearance
   - Audio and media controls
   - Composes other stores for convenience

3. **useRankingsStore** (`stores/useRankingsStore.ts`)
   - Rankings data
   - Loading states
   - Trend calculations

4. **useTicketsStore** (`stores/useTicketsStore.ts`)
   - Tickets data and CRUD operations
   - Ticket statistics
   - Filter and search state

### Store Structure

All stores follow the same pattern:

```typescript
export const useXxxStore = defineStore('xxx', () => {
  // State
  const xxx = ref<T>(initialValue)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters (computed properties)
  const computedValue = computed(() => ...)

  // Actions (methods)
  const doSomething = async () => {
    loading.value = true
    try {
      // logic here
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    // Expose state, getters, and actions
    xxx,
    loading,
    error,
    computedValue,
    doSomething
  }
})
```

## Composable Organization

### Thin Wrappers (Deprecated but maintained for compatibility)

Some composables exist as thin wrappers around stores for backward compatibility:
- `useAuth` - Wraps useAuthStore
- `useRankings` - Wraps useRankingsStore

**For new code**, use the stores directly.

### Feature-specific Composables

Composables for reusable, component-specific logic:
- `useFavorites` - LocalStorage-based favorites management
- `useAudio` - Audio controls and playback
- `useCat` - Cat image fetching
- `usePanels` - Panel visibility state
- `useLanguage` - Language and localization
- `useTheme` - Theme management (can use store in future)
- `useKeyboardShortcuts` - Keyboard shortcut handling

## Best Practices

### For Stores

✅ **DO:**
- Keep stores focused on a single domain (auth, tickets, rankings, etc.)
- Use async/await with try/catch for error handling
- Maintain consistent loading/error states
- Use computed properties for derived state
- Document exported types and interfaces

❌ **DON'T:**
- Mix unrelated state in one store
- Make direct API calls from components (use repositories/stores)
- Duplicate state across multiple stores
- Use stores for purely local component state

### For Components

✅ **DO:**
- Use stores for shared/global state
- Use `ref` and `computed` for local component state
- Destructure what you need from stores
- Create local refs for form inputs and UI state

```vue
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()

// Local component state
const showModal = ref(false)
const formData = ref({ name: '' })

// Access store state
const user = authStore.user
</script>
```

❌ **DON'T:**
- Make direct `fetch()` calls from components
- Duplicate store state in local variables
- Mix unrelated concerns (e.g., local form state + global auth)
- Create stores for single-component use

### For API Calls

All API calls should go through:
1. **Repositories** (`frontend/repositories/*.ts`) - Data access layer
2. **Stores** (`frontend/stores/*.ts`) - State management layer
3. **Components** - Consume stores, never call APIs directly

**Example:**
```typescript
// ✅ GOOD - Component uses store
const ticketsStore = useTicketsStore()
await ticketsStore.loadTickets()

// ❌ BAD - Component makes direct API call
const response = await fetch('/api/tickets')
```

## Migration Guide

If you're updating existing code:

### From Direct API Calls to Stores

**Before:**
```typescript
const tickets = ref<Ticket[]>([])
const loading = ref(false)

const loadTickets = async () => {
  loading.value = true
  const response = await fetch('/api/tickets')
  tickets.value = await response.json()
  loading.value = false
}
```

**After:**
```typescript
const ticketsStore = useTicketsStore()
const tickets = computed(() => ticketsStore.tickets)
const loading = computed(() => ticketsStore.loading)

const loadTickets = async () => {
  await ticketsStore.loadTickets()
}
```

### From Local State to Stores

**Before:**
```typescript
const user = ref<User | null>(null)
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', ...)
  user.value = response.user
}
```

**After:**
```typescript
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const login = authStore.login // Store action
```

## Summary

| Pattern | Use Case | Examples |
|---------|-----------|----------|
| **Pinia Store** | Global/shared state, API data, app settings | Auth, Tickets, Rankings, App Settings |
| **Composable** | Local component state, reusable logic, UI interactions | Form state, modals, localStorage helpers |
| **Repository** | API data access layer | `ticketsRepository`, `generalRepository` |
| **Direct fetch** | ❌ Never use in components (use stores instead) | - |

## Questions?

Refer to existing store implementations in `frontend/stores/` for examples.
