# Testing Guide

## Running Tests

```bash
# Frontend (Vitest + @vue/test-utils)
cd frontend
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report (output: frontend/coverage/)

# Backend (Jest + Supertest)
cd backend
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report (output: backend/coverage/)
```

## Test Structure

```
frontend/tests/
├── setup.ts              # Global mocks (localStorage, fetch, etc.)
├── components/           # Vue component tests
└── composables/          # Composable tests

backend/tests/
├── setup.ts              # Test database setup
├── api/                  # API endpoint tests
├── integration/          # Integration tests (user flows)
├── auth.test.ts
├── db.test.ts
├── middleware.test.ts
└── tokenLimiter.test.ts
```

## Writing Tests

### Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, { props: { title: 'Test' } })
    expect(wrapper.find('h1').text()).toBe('Test')
  })
})
```

### API Test

```typescript
import request from 'supertest'
import { createTestApp } from '../helpers'

describe('My API', () => {
  it('returns data', async () => {
    const response = await request(app).get('/api/my-endpoint').expect(200)
    expect(response.body).toHaveProperty('data')
  })
})
```

## Best Practices

- Test behavior, not implementation (what it does, not how)
- One assertion per test, descriptive names (`'returns 404 when user not found'`)
- Arrange-Act-Assert pattern
- Mock external dependencies (`vi.mock(...)`)
- Test both happy path and error cases
- Use `nextTick()` for Vue reactivity: `await wrapper.vm.$nextTick()`

## Coverage Goals

- Critical paths (auth, data mutations): 100%
- Utility functions: 100%
- Overall: 70%+

## Common Issues

**Frontend:** `localStorage is not defined` → ensure `setupFiles` is configured in `vitest.config.ts`

**Backend:** `database locked` → each test needs a separate test database; `port conflicts` → configure different ports in `tests/setup.ts`
