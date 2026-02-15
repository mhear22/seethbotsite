# Component Naming Conventions

## Summary

| Type | Format | Example |
|------|--------|---------|
| Vue Component | PascalCase | `UserProfile.vue` |
| Utility file | kebab-case | `format-date.ts` |
| Composable file | `use-` prefix, kebab-case | `use-timer.ts` |
| Store file | kebab-case, `-store` suffix | `ticket-store.ts` |
| Constant file | UPPER_SNAKE | `GAME_CONSTANTS.ts` |
| CSS class | kebab-case | `.user-profile` |

## Details

**Vue Components** - PascalCase in filenames, imports, and templates:
```vue
import UserProfile from '@/components/UserProfile.vue'
<UserProfile />
```

**Utility functions** - camelCase: `formatDate()`, `calculateRank()`, `validateEmail()`

**Stores** - `useEntityStore` pattern: `useTicketStore()`, `useFishingStore()`

**Composables** - `useFeature` pattern: `useTimer()`, `useClicker()`

**Constants** - UPPER_SNAKE_CASE: `MAX_FISHING_TIME`, `API_BASE_URL`

**Controllers/Routes** (backend) - kebab-case with suffix: `ticket-controller.ts`, `ticket-routes.ts`

## Principles

- Be descriptive but concise
- Avoid abbreviations (unless widely understood: `api`, `url`, `id`)
- One clear purpose per file
- Follow Vue's official style guide for components

See: [Vue Style Guide](https://vuejs.org/style-guide/)
