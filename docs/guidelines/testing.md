# Testing Guidelines

## Philosophy

- Test behavior, not implementation
- Test pyramid: more unit tests, fewer integration, fewer e2e
- Tests should be fast, independent, and maintainable

## Tools

- **Frontend:** Vitest + @vue/test-utils + Playwright (e2e)
- **Backend:** Jest + Supertest

## Coverage Goals

| Area | Target |
|------|--------|
| Critical paths (auth, mutations) | 100% |
| Utility functions | 100% |
| Overall | 70%+ |

## Patterns

### Component Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketCard from '@/components/TicketCard.vue'

const mockTicket = { id: '1', title: 'Test', status: 'open' }

describe('TicketCard', () => {
  it('renders ticket info', () => {
    const wrapper = mount(TicketCard, { props: { ticket: mockTicket } })
    expect(wrapper.text()).toContain('Test')
    expect(wrapper.find('.ticket-card--open').exists()).toBe(true)
  })

  it('emits update on button click', async () => {
    const wrapper = mount(TicketCard, { props: { ticket: mockTicket } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update')).toHaveLength(1)
  })
})
```

### Composable Test

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '@/composables/use-timer'

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.restoreAllMocks())

  it('increments elapsed', () => {
    const { elapsed, start } = useTimer()
    start()
    vi.advanceTimersByTime(1000)
    expect(elapsed.value).toBe(1)
  })
})
```

### API Test (Backend)

```typescript
import request from 'supertest'
import app from '@/app'

describe('GET /api/tickets', () => {
  it('returns list', async () => {
    const response = await request(app).get('/api/tickets').expect(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})
```

### Store Integration Test

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useTicketStore } from '@/stores/ticket-store'
import * as api from '@/services/api'

vi.mock('@/services/api')

describe('Ticket Store', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks() })

  it('fetches and stores tickets', async () => {
    vi.mocked(api.getTickets).mockResolvedValue({ data: [{ id: '1' }] })
    const store = useTicketStore()
    await store.fetchTickets()
    expect(store.tickets).toHaveLength(1)
  })
})
```

## Best Practices

- Descriptive names: `'returns 404 when user not found'` not `'works'`
- One concern per test
- Clean up after each test (mocks, timers, DOM)
- Use fixtures for reusable test data
- Mock external APIs and services
- For Vue reactivity: `await wrapper.vm.$nextTick()`

## Running Tests

```bash
# Frontend
cd frontend && npm run test
cd frontend && npm run test:coverage

# Backend
cd backend && npm run test
cd backend && npm run test:coverage
```
