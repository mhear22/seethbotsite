# Testing Guide

This directory contains automated tests for both frontend and backend components.

## Frontend Tests

Frontend tests use **Vitest** with **@vue/test-utils**.

### Prerequisites

Install test dependencies:

```bash
cd frontend
npm install
```

### Running Tests

Run all tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

### Test Structure

```
frontend/tests/
├── setup.ts              # Global test setup (mocks for localStorage, fetch, etc.)
├── components/           # Vue component tests
│   ├── FavoriteButton.test.ts
│   └── Modal.test.ts
└── composables/          # Vue composables tests
    ├── useQuote.test.ts
    └── useFavorites.test.ts
```

### Writing Component Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title'
      }
    })
    expect(wrapper.find('h1').text()).toBe('Test Title')
  })
})
```

### Writing Composable Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMyComposable } from '@/composables/useMyComposable'

describe('useMyComposable', () => {
  it('should work correctly', () => {
    const { value, action } = useMyComposable()
    expect(value.value).toBe('initial')
  })
})
```

## Backend Tests

Backend tests use **Jest** with **Supertest** for API testing.

### Prerequisites

Install test dependencies:

```bash
cd backend
npm install
```

### Running Tests

Run all tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Test Structure

```
backend/tests/
├── setup.ts              # Global test setup (test databases, etc.)
├── api/                  # API endpoint tests
│   ├── health.test.ts
│   ├── clicks.test.ts
│   ├── tickets.test.ts
│   └── points.test.ts
├── integration/          # Integration tests
│   └── user-flows.test.ts
├── auth.test.ts          # Authentication tests
├── db.test.ts            # Database tests
├── middleware.test.ts     # Middleware tests
└── tokenLimiter.test.ts  # Rate limiting tests
```

### Writing API Tests

```typescript
import request from 'supertest'
import { createTestApp } from '../helpers'

describe('My API', () => {
  let app: Express

  beforeAll(() => {
    app = createTestApp()
  })

  it('should return data', async () => {
    const response = await request(app)
      .get('/api/my-endpoint')
      .expect(200)
    expect(response.body).toHaveProperty('data')
  })
})
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
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
      - run: cd backend && npm ci && npm run test
      - run: cd frontend && npm ci && npm run test
```

### Pre-commit Hooks

Using Husky and lint-staged:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,js}": "npm run test -- --related"
  }
}
```

## Best Practices

### 1. Test Isolation

Each test should be independent:
- Clean up after each test
- Use fresh data for each test
- Don't rely on test order

### 2. Descriptive Test Names

Use clear, descriptive test names:

```typescript
it('should return 404 when user is not found') // Good
it('user not found') // Vague
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should add points to user', async () => {
  // Arrange
  const userId = 'test-user'

  // Act
  const response = await addPoints(userId, 10)

  // Assert
  expect(response.points).toBe(10)
})
```

### 4. Mock External Dependencies

Mock external APIs, databases, and services:

```typescript
vi.mock('@/repositories/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' })
}))
```

### 5. Test Happy Path and Error Cases

```typescript
describe('POST /api/users', () => {
  it('should create user with valid data')
  it('should return 400 with missing email')
  it('should return 400 with invalid email format')
  it('should return 409 with duplicate email')
})
```

### 6. Use Test Coverage

Aim for:
- Critical paths: 100%
- Utility functions: 100%
- Complex logic: 80%+
- Overall: 70%+

### 7. Integration Tests

Test complete user flows:

```typescript
describe('Registration Flow', () => {
  it('should register, login, and access protected route')
})
```

## Troubleshooting

### Frontend Tests

**Issue:** Tests fail with "localStorage is not defined"

**Solution:** Ensure `setupFiles` is configured in `vitest.config.ts`

**Issue:** Component reactivity not working

**Solution:** Use `nextTick()` to wait for Vue updates:

```typescript
await wrapper.vm.$nextTick()
```

### Backend Tests

**Issue:** Tests fail with "database locked"

**Solution:** Ensure each test uses a separate test database

**Issue:** Port conflicts

**Solution:** Use different ports for tests (configured in `tests/setup.ts`)

## Coverage Reports

View coverage reports:

- Backend: `backend/coverage/index.html`
- Frontend: `frontend/coverage/index.html`

## Contributing

When adding new features:
1. Write tests first (TDD) or alongside code
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation
