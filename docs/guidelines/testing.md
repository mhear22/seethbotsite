# Testing Guidelines

This document defines testing standards, patterns, and coverage goals for the project.

## Testing Philosophy

1. **Test behavior, not implementation:** Focus on what the code does, not how it does it
2. **Test pyramid:** More unit tests, fewer integration tests, even fewer e2e tests
3. **Fast feedback:** Unit tests should run in seconds, not minutes
4. **Maintainability:** Tests should be easy to read and update

## Test Types

### Unit Tests

Test individual functions, components, and modules in isolation.

**When to use:**
- Pure functions
- Component logic
- Utility functions
- Composables

**Tools:** Vitest, Vue Test Utils

### Integration Tests

Test how multiple units work together.

**When to use:**
- API endpoints
- Store actions with effects
- Component interactions with stores
- Database operations

**Tools:** Vitest, Supertest

### End-to-End (E2E) Tests

Test complete user flows through the application.

**When to use:**
- Critical user journeys
- Multi-step workflows
- Authentication flows
- Payment/transaction flows

**Tools:** Playwright, Cypress

## Coverage Goals

| Metric | Target | Notes |
|--------|--------|-------|
| Overall Coverage | 80% | Minimum acceptable |
| Critical Paths | 100% | Auth, payments, data mutations |
| Utility Functions | 100% | Pure functions are cheap to test |
| Components | 75% | Focus on logic, not rendering |
| API Routes | 80% | Success and error cases |

## Testing Tools Setup

### Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.d.ts'
      ]
    }
  }
})
```

## Unit Testing Patterns

### Pure Functions

```typescript
// utils/calculate-rank.ts
export function calculateRank(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100))
}

// tests/unit/calculate-rank.test.ts
import { describe, it, expect } from 'vitest'
import { calculateRank } from '@/utils/calculate-rank'

describe('calculateRank', () => {
  it('returns 0 for 0 XP', () => {
    expect(calculateRank(0)).toBe(0)
  })

  it('returns 1 for 100 XP', () => {
    expect(calculateRank(100)).toBe(1)
  })

  it('returns 3 for 900 XP', () => {
    expect(calculateRank(900)).toBe(3)
  })

  it('handles non-integer XP', () => {
    expect(calculateRank(150.5)).toBe(1)
  })

  it('returns 0 for negative XP', () => {
    expect(calculateRank(-100)).toBe(0)
  })
})
```

### Composables

```typescript
// composables/use-timer.ts
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

  return { elapsed, start, stop }
}

// tests/unit/use-timer.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '@/composables/use-timer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with 0 elapsed time', () => {
    const { elapsed } = useTimer()
    expect(elapsed.value).toBe(0)
  })

  it('increments elapsed time', () => {
    const { elapsed, start } = useTimer()
    start()
    vi.advanceTimersByTime(1000)
    expect(elapsed.value).toBe(1)
  })

  it('stops incrementing when stopped', () => {
    const { elapsed, start, stop } = useTimer()
    start()
    vi.advanceTimersByTime(1000)
    stop()
    vi.advanceTimersByTime(1000)
    expect(elapsed.value).toBe(1)
  })

  it('does not start multiple timers', () => {
    const { elapsed, start } = useTimer()
    start()
    start()
    vi.advanceTimersByTime(1000)
    expect(elapsed.value).toBe(1)
  })
})
```

### Vue Components

```vue
<!-- components/TicketCard.vue -->
<script setup lang="ts">
const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  (e: 'update', ticket: Ticket): void
  (e: 'delete', id: string): void
}>()

function handleUpdate() {
  emit('update', props.ticket)
}

function handleDelete() {
  emit('delete', props.ticket.id)
}
</script>

<template>
  <div class="ticket-card" :class="`ticket-card--${ticket.status}`">
    <h3>{{ ticket.title }}</h3>
    <p>{{ ticket.description }}</p>
    <div class="ticket-card__actions">
      <button @click="handleUpdate">Update</button>
      <button @click="handleDelete">Delete</button>
    </div>
  </div>
</template>

<!-- tests/unit/TicketCard.test.ts -->
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketCard from '@/components/TicketCard.vue'

describe('TicketCard', () => {
  const mockTicket = {
    id: '1',
    title: 'Test Ticket',
    description: 'Test description',
    status: 'open'
  }

  it('renders ticket information', () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    expect(wrapper.text()).toContain('Test Ticket')
    expect(wrapper.text()).toContain('Test description')
  })

  it('applies status class', () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    expect(wrapper.find('.ticket-card--open').exists()).toBe(true)
  })

  it('emits update event on button click', async () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update')).toHaveLength(1)
    expect(wrapper.emitted('update')![0]).toEqual([mockTicket])
  })

  it('emits delete event with ticket id', async () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual(['1'])
  })
})
```

## Integration Testing Patterns

### Pinia Stores

```typescript
// stores/ticket-store.ts
export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)

  async function fetchTickets() {
    loading.value = true
    try {
      const response = await api.getTickets()
      tickets.value = response.data
    } finally {
      loading.value = false
    }
  }

  return { tickets, loading, fetchTickets }
})

// tests/integration/ticket-store.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTicketStore } from '@/stores/ticket-store'
import * as api from '@/services/api'

vi.mock('@/services/api')

describe('Ticket Store (Integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches and stores tickets', async () => {
    const mockTickets = [
      { id: '1', title: 'Ticket 1' },
      { id: '2', title: 'Ticket 2' }
    ]
    vi.mocked(api.getTickets).mockResolvedValue({ data: mockTickets })

    const store = useTicketStore()
    await store.fetchTickets()

    expect(store.tickets).toEqual(mockTickets)
    expect(store.loading).toBe(false)
    expect(api.getTickets).toHaveBeenCalledTimes(1)
  })

  it('handles API errors', async () => {
    vi.mocked(api.getTickets).mockRejectedValue(new Error('API Error'))

    const store = useTicketStore()
    await store.fetchTickets()

    expect(store.tickets).toEqual([])
    expect(store.loading).toBe(false)
  })
})
```

### API Endpoints

```typescript
// tests/integration/ticket-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '@/app'

describe('Ticket API', () => {
  let authToken: string

  beforeAll(async () => {
    // Setup auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
    authToken = response.body.token
  })

  describe('GET /api/tickets', () => {
    it('returns list of tickets', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    it('requires authentication', async () => {
      const response = await request(app).get('/api/tickets')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/tickets', () => {
    it('creates a new ticket', async () => {
      const newTicket = {
        title: 'Test Ticket',
        description: 'Test description'
      }

      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTicket)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject(newTicket)
    })

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(response.status).toBe(400)
    })
  })
})
```

## E2E Testing Patterns

### Playwright Tests

```typescript
// tests/e2e/ticket-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Ticket Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('creates and views a ticket', async ({ page }) => {
    // Navigate to tickets
    await page.click('text=Tickets')

    // Create ticket
    await page.click('text=New Ticket')
    await page.fill('[name="title"]', 'E2E Test Ticket')
    await page.fill('[name="description"]', 'This is an automated test')
    await page.click('button[type="submit"]')

    // Verify ticket created
    await expect(page.locator('text=E2E Test Ticket')).toBeVisible()
  })

  test('updates ticket status', async ({ page }) => {
    await page.goto('/tickets')

    // Click on first ticket
    await page.click('.ticket-card:first-child')

    // Change status
    await page.selectOption('select[name="status"]', 'in_progress')
    await page.click('button[type="submit"]')

    // Verify status updated
    await expect(page.locator('.ticket-status')).toHaveText('In Progress')
  })
})
```

## Test Data Management

### Fixtures

```typescript
// tests/fixtures/tickets.ts
export const ticketFixtures = {
  open: {
    id: '1',
    title: 'Open Ticket',
    description: 'Description',
    status: 'open' as const
  },
  inProgress: {
    id: '2',
    title: 'In Progress Ticket',
    description: 'Description',
    status: 'in_progress' as const
  },
  resolved: {
    id: '3',
    title: 'Resolved Ticket',
    description: 'Description',
    status: 'resolved' as const
  }
}

// Usage in tests
import { ticketFixtures } from '@/tests/fixtures/tickets'

it('handles resolved tickets', () => {
  const wrapper = mount(TicketCard, {
    props: { ticket: ticketFixtures.resolved }
  })
  // ...
})
```

### Mock Functions

```typescript
// tests/mocks/api.ts
export const mockApi = {
  getTickets: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn()
}

// In tests
import { mockApi } from '@/tests/mocks/api'

vi.mock('@/services/api', () => ({
  default: mockApi
}))

it('uses mocked API', async () => {
  mockApi.getTickets.mockResolvedValue({ data: [] })
  // ...
})
```

## Best Practices

### DO

```typescript
// ✅ Test behavior, not implementation
it('displays error message when API fails', async () => {
  vi.mocked(api.getTickets).mockRejectedValue(new Error('API Error'))
  const wrapper = mount(TicketList)
  await wrapper.vm.loadTickets()
  expect(wrapper.find('.error-message').exists()).toBe(true)
})

// ✅ Use descriptive test names
it('returns 0 rank for users with less than 100 XP', () => {
  expect(calculateRank(50)).toBe(0)
})

// ✅ Test edge cases
it('handles empty array', () => {
  expect(filterActive([])).toEqual([])
})

it('handles null input gracefully', () => {
  expect(safeParse(null)).toBeNull()
})
```

### DON'T

```typescript
// ❌ Test internal implementation
it('calls useState with initial value', () => {
  // Tests how component works, not what it does
})

// ❌ Vague test names
it('works correctly', () => {
  // What does it do?
})

// ❌ Testing multiple things in one test
it('handles success, error, and loading states', () => {
  // Split into separate tests
})

// ❌ Not cleaning up
afterEach(() => {
  // Clear mocks, timers, DOM
})
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run coverage
npm test:coverage

# Run specific file
npm test -- ticket.test.ts

# Run only unit tests
npm test:unit

# Run only e2e tests
npm test:e2e
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test:coverage
      - uses: codecov/codecov-action@v3
```

## When to Write Tests

1. **Before coding** (TDD): For complex business logic
2. **While coding**: As you implement features
3. **After coding**: When fixing bugs (write regression tests)
4. **Before refactoring**: Ensure current behavior is captured

## Test Maintenance

- Keep tests simple and readable
- Remove obsolete tests
- Update tests when requirements change
- Review test failures before committing
- Keep test data in fixtures

## Common Testing Pitfalls

1. **Testing implementation details**: Tests break when code changes without behavior changes
2. **Over-mocking**: Tests don't catch real integration issues
3. **Fragile selectors**: UI tests break when class names change
4. **Testing third-party code**: Don't test Vue or browser APIs
5. **Async timing issues**: Use proper async/await and waiting

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
