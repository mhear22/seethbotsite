# Code Style Standards

## Principles

- Readability first - code is read more than written
- Consistency - follow existing patterns
- Simplicity - favor explicit over implicit
- Self-documenting names and structure

## TypeScript

```typescript
// Prefer explicit types for public APIs
interface User {
  id: string
  name: string
  role: 'admin' | 'user' | 'moderator'
}

// Use type aliases for unions
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

// Avoid `any` - use `unknown` for dynamic data
function processData(data: unknown): User { ... }

// Use optional chaining and nullish coalescing
const name = user?.profile?.name ?? 'Anonymous'

// Discriminated unions for async state
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

// Named constants, not magic numbers
const API_TIMEOUT_MS = 15000

// Early returns over deep nesting
if (!user?.profile?.settings) return
```

## Vue Components (`<script setup lang="ts">`)

```vue
<script setup lang="ts">
import type { User } from '@/types'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user-store'

interface Props {
  userId: string
  showDetails?: boolean
}
const props = withDefaults(defineProps<Props>(), { showDetails: false })
const emit = defineEmits<{ (e: 'update', value: string): void }>()

const user = ref<User | null>(null)
const loading = ref(false)
const displayName = computed(() => user.value?.name ?? 'Unknown')

onMounted(async () => { await fetchUser() })

async function fetchUser() {
  loading.value = true
  try {
    user.value = await useUserStore().getUserById(props.userId)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
/* BEM-like naming */
.user-card {
  &__name { font-weight: bold; }
  &--active { border: 2px solid blue; }
}
</style>
```

## Template

```vue
<template>
  <!-- v-if for conditional rendering, v-show for toggling -->
  <div v-if="loading">Loading...</div>
  <div v-show="showDetails">{{ details }}</div>

  <!-- Dynamic classes -->
  <div :class="['card', { 'card--active': isActive }]">...</div>

  <!-- v-for always with :key -->
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>

  <!-- Event modifiers -->
  <button @click.stop="handle">Click</button>
  <form @submit.prevent="submit">...</form>
</template>
```

## JavaScript

```javascript
// const by default, let when reassignment needed, never var
const API_URL = 'https://api.example.com'
let currentPage = 1

// Destructuring
const { name, email } = user
const { timeout = 5000 } = options

// Async/await with error handling
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// Parallel operations
const [users, tickets] = await Promise.all([fetchUsers(), fetchTickets()])
```

## Composables

```typescript
export function useTimer(interval = 1000) {
  const elapsed = ref(0)
  let timer: number | null = null

  const start = () => {
    if (timer) return
    timer = window.setInterval(() => { elapsed.value++ }, interval)
  }

  const stop = () => {
    if (timer) { clearInterval(timer); timer = null }
  }

  onUnmounted(stop)
  return { elapsed, start, stop }
}
```

## Comments

```typescript
// Good: explain WHY, not WHAT
// Exponential backoff to avoid overwhelming API during errors
const retryDelay = Math.min(1000 * Math.pow(2, attempt), 30000)

// Bad: restates the code
// Set user name to John
user.name = 'John'
```

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] No `console.log` in production code
- [ ] Error handling for async operations
- [ ] No hardcoded values (use constants)
- [ ] Props and emits properly typed
- [ ] Styles scoped where appropriate
- [ ] No `any` types

See: [Vue Style Guide](https://vuejs.org/style-guide/), [TypeScript ESLint](https://typescript-eslint.io/rules/)
