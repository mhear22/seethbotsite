# Code Style Standards

This document defines code style standards and best practices for TypeScript, JavaScript, and Vue.js development.

## General Principles

1. **Readability first:** Code is read more than written
2. **Consistency:** Follow existing patterns unless there's a clear reason to deviate
3. **Simplicity:** Avoid clever code; favor explicit over implicit
4. **Self-documenting:** Names and structure should explain intent

## TypeScript Best Practices

### Type Definitions

```typescript
// Prefer explicit types for public APIs
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
}

// Use type aliases for union types
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

// Use enums only when values have semantic meaning
enum RankLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
  Expert = 3
}
```

### Type Safety

```typescript
// Avoid `any` - use unknown for dynamic data
function processUserData(data: unknown): User {
  if (isValidUser(data)) {
    return data as User
  }
  throw new Error('Invalid user data')
}

// Use readonly for immutable data
interface Config {
  readonly apiEndpoint: string
  readonly maxRetries: number
}

// Use const assertions for literal types
const COLORS = ['red', 'green', 'blue'] as const
type Color = typeof COLORS[number] // 'red' | 'green' | 'blue'
```

### Null and Undefined Handling

```typescript
// Use optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Anonymous'

// Explicitly handle null/undefined in function signatures
function getTicket(id: string | undefined): Ticket | null {
  if (!id) return null
  // ...
}

// Use discriminated unions for handling different states
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

## Vue Composition API Patterns

### Composables

```typescript
// Prefer composition functions over mixins
// Use composables/composables/use-timer.ts
export function useTimer(interval = 1000) {
  const elapsed = ref(0)
  let timer: number | null = null

  const start = () => {
    if (timer) return
    timer = window.setInterval(() => {
      elapsed.value++
    }, interval)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  return { elapsed, start, stop }
}
```

### Script Setup Syntax

```vue
<script setup lang="ts">
// Import types and composables at the top
import type { User } from '@/types'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user-store'

// Props with TypeScript
interface Props {
  userId: string
  showDetails?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

// Emits with TypeScript
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
}
const emit = defineEmits<Emits>()

// Reactive state
const user = ref<User | null>(null)
const loading = ref(false)

// Computed properties
const displayName = computed(() => {
  return user.value?.name ?? 'Unknown User'
})

// Lifecycle hooks
onMounted(async () => {
  await fetchUser()
})

// Methods
async function fetchUser() {
  loading.value = true
  try {
    const userStore = useUserStore()
    user.value = await userStore.getUserById(props.userId)
  } finally {
    loading.value = false
  }
}
</script>
```

### Component Patterns

```vue
<script setup lang="ts">
// Single responsibility: one clear purpose
// Prefer composition over inheritance
// Use computed for derived state
// Use methods for actions
// Use watchers for side effects

// Good: Computed for derived values
const fullName = computed(() => {
  return `${user.value.firstName} ${user.value.lastName}`
})

// Good: Method for actions
async function saveUser() {
  await userStore.updateUser(user.value)
  emit('saved', user.value)
}

// Good: Watcher for side effects
watch(currentPage, (newPage) => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
```

### Template Best Practices

```vue
<template>
  <!-- Use v-if for conditional rendering -->
  <div v-if="loading" class="loading">
    Loading...
  </div>

  <!-- Use v-show for toggling visibility (keeps element in DOM) -->
  <div v-show="showDetails" class="details">
    {{ userDetails }}
  </div>

  <!-- Use :class for dynamic classes -->
  <div
    :class="[
      'user-card',
      { 'user-card--active': isActive },
      `user-card--${user.role}`
    ]"
  >
    {{ user.name }}
  </div>

  <!-- Use :style sparingly; prefer classes -->
  <div :style="{ color: textColor }">
    Important text
  </div>

  <!-- Use v-for with :key -->
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      class="list-item"
    >
      {{ item.name }}
    </li>
  </ul>

  <!-- Event modifiers -->
  <button @click.stop="handleClick">
    Click me
  </button>

  <!-- Form handling -->
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.email" type="email" />
    <button type="submit">Submit</button>
  </form>
</template>
```

## JavaScript Best Practices

### Variable Declaration

```javascript
// Use const by default, let when reassignment is needed
const API_URL = 'https://api.example.com'
let currentPage = 1

// Never use var

// Destructure for clarity
const { name, email, role } = user

// Use default values in destructuring
const { timeout = 5000 } = options
```

### Functions

```javascript
// Prefer arrow functions for callbacks
users.map(user => user.name)

// Use named functions for better stack traces
function calculateRank(xp) {
  return Math.floor(xp / 1000)
}

// Default parameters
function greet(name = 'Guest') {
  return `Hello, ${name}!`
}

// Rest and spread
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}

const newSettings = { ...defaultSettings, ...userSettings }
```

### Async/Await

```javascript
// Prefer async/await over callbacks
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// Parallel operations
async function fetchDashboard() {
  const [users, tickets, stats] = await Promise.all([
    fetchUsers(),
    fetchTickets(),
    fetchStats()
  ])

  return { users, tickets, stats }
}
```

### Error Handling

```javascript
// Always handle errors in async functions
async function updateUser(id, updates) {
  try {
    const response = await api.updateUser(id, updates)
    return response.data
  } catch (error) {
    // Log and re-throw for caller to handle
    console.error(`Failed to update user ${id}:`, error)
    throw new Error('Update failed')
  }
}

// Provide meaningful error messages
throw new Error(`User with ID ${userId} not found`)
```

## CSS/SCSS Best Practices

### Naming

```scss
// Use BEM-like naming for components
.user-card {
  &__name {
    font-weight: bold;
  }

  &__email {
    color: gray;
  }

  &--active {
    border: 2px solid blue;
  }
}
```

### Organization

```scss
// Use SCSS variables for consistency
$primary-color: #3498db;
$border-radius: 4px;

// Mixins for reusable patterns
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.component {
  @include flex-center;
}
```

### Component Scoped Styles

```vue
<style scoped lang="scss">
// Use scoped styles to avoid global conflicts
.ticket-card {
  padding: 1rem;
  border-radius: $border-radius;

  &__status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
}
</style>
```

## Code Formatting

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### Linting

- Use ESLint for JavaScript/TypeScript
- Use Stylelint for CSS/SCSS
- Run linters before committing
- Fix auto-fixable issues automatically

## Comments and Documentation

### When to Comment

```typescript
// Good: Explain WHY, not WHAT
// We use exponential backoff to prevent overwhelming the API during errors
const retryDelay = Math.min(1000 * Math.pow(2, attempt), 30000)

// Good: Document complex logic
/**
 * Calculates the user's rank based on XP and bonus achievements.
 * This formula accounts for diminishing returns at higher levels.
 */
function calculateRank(xp: number, bonusPoints: number): number {
  // ...
}

// Bad: Redundant comments
// Set user name to John
user.name = 'John'
```

### JSDoc for Public APIs

```typescript
/**
 * Fetches a ticket by its ID
 * @param id - The ticket ID
 * @returns The ticket data or null if not found
 * @throws {Error} When the API request fails
 */
async function getTicket(id: string): Promise<Ticket | null> {
  // ...
}
```

## Performance Considerations

### Reactivity

```typescript
// Use shallowRef for large objects that don't need deep reactivity
const largeDataset = shallowRef<DataType[]>([])

// Use computed for expensive calculations (cached)
const filteredItems = computed(() => {
  return items.value.filter(item => item.active)
})

// Debounce user input
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const debouncedSearch = useDebounceFn(() => {
  // Perform search
}, 300)
```

### Lazy Loading

```typescript
// Lazy load components
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

// Lazy load routes
const routes = [
  {
    path: '/admin',
    component: () => import('@/pages/Admin.vue')
  }
]
```

## Security Best Practices

```typescript
// Sanitize user input
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(userInput)

// Never trust client-side data
function validateTicketId(id: unknown): string {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error('Invalid ticket ID')
  }
  return id
}

// Use environment variables for secrets
const API_KEY = import.meta.env.VITE_API_KEY
```

## Testing Considerations

```typescript
// Write testable code
// Pure functions are easier to test
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}

// Dependency injection for testability
function sendNotification(
  message: string,
  service: NotificationService = defaultService
) {
  service.send(message)
}
```

## Anti-Patterns to Avoid

### Don't

```typescript
// ❌ Deep nesting
if (user) {
  if (user.profile) {
    if (user.profile.settings) {
      // Do something
    }
  }
}

// ✅ Early returns
if (!user?.profile?.settings) return
// Do something

// ❌ Magic numbers
const timeout = 15000

// ✅ Named constants
const API_TIMEOUT_MS = 15000

// ❌ Side effects in computed
const displayName = computed(() => {
  console.log('Calculating name') // Side effect!
  return user.value.name
})

// ❌ Using this.$refs directly
const inputRef = ref<HTMLInputElement>()
inputRef.value?.focus() // Use ref instead
```

## Code Review Checklist

Before submitting code:

- [ ] Code follows naming conventions
- [ ] Functions have clear names and single responsibility
- [ ] Types are properly defined (TypeScript)
- [ ] No console.log statements left in production code
- [ ] Error handling is in place for async operations
- [ ] No hardcoded values (use constants or config)
- [ ] Component props and emits are properly typed
- [ ] Styles are scoped where appropriate
- [ ] Code is formatted with Prettier
- [ ] Linter passes without warnings

## References

- [Vue Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
