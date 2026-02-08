# Component Naming Conventions

This document defines naming conventions for components, utilities, and other code elements to ensure consistency across the codebase.

## Vue Components

### Component Files
- **Format:** PascalCase
- **Pattern:** `DescriptiveName.vue`
- **Examples:**
  - `UserProfile.vue`
  - `FishingGame.vue`
  - `TicketList.vue`
  - `CharacterCard.vue`

### Component Registration
- **Global components:** PascalCase (matches filename)
- **Local components:** PascalCase in imports and templates

```vue
<script setup>
// Import
import UserProfile from '@/components/UserProfile.vue'
</script>

<template>
  <!-- Usage -->
  <UserProfile />
</template>
```

## Utilities

### Utility Files
- **Format:** lowercase with hyphens
- **Pattern:** `descriptive-name.js` or `descriptive-name.ts`
- **Examples:**
  - `format-date.js`
  - `calculate-rank.js`
  - `validate-input.js`

### Utility Functions
- **Format:** camelCase
- **Pattern:** `descriptiveFunction`
- **Examples:**
  - `formatDate()`
  - `calculateRank()`
  - `validateEmail()`

## Stores (Pinia)

### Store Files
- **Format:** lowercase with hyphens, `-store` suffix
- **Pattern:** `entity-store.js` or `entity-store.ts`
- **Examples:**
  - `ticket-store.js`
  - `fishing-store.js`
  - `user-store.js`

### Store Names
- **Format:** camelCase with `use` prefix
- **Pattern:** `useEntityStore`
- **Examples:**
  - `useTicketStore()`
  - `useFishingStore()`
  - `useUserStore()`

## Composables

### Composable Files
- **Format:** lowercase with hyphens, `use-` prefix
- **Pattern:** `use-descriptive-feature.js` or `use-descriptive-feature.ts`
- **Examples:**
  - `use-timer.js`
  - `use-clicker.js`
  - `use-local-storage.js`

### Composable Names
- **Format:** camelCase with `use` prefix
- **Pattern:** `useDescriptiveFeature`
- **Examples:**
  - `useTimer()`
  - `useClicker()`
  - `useLocalStorage()`

## API/Backend

### Route Files
- **Format:** lowercase with hyphens, `-routes` suffix
- **Examples:**
  - `ticket-routes.js`
  - `user-routes.js`

### Controller Files
- **Format:** lowercase with hyphens, `-controller` suffix
- **Examples:**
  - `ticket-controller.js`
  - `user-controller.js`

## Constants

### Constant Files
- **Format:** `CONSTANTS.js` (uppercase)
- **Examples:**
  - `GAME_CONSTANTS.js`
  - `API_CONSTANTS.js`

### Constant Names
- **Format:** UPPER_SNAKE_CASE
- **Examples:**
  - `MAX_FISHING_TIME`
  - `DEFAULT_RANK_THRESHOLD`
  - `API_BASE_URL`

## CSS/SCSS

### Class Names
- **Format:** kebab-case
- **Pattern:** `descriptive-class-name`
- **Examples:**
  - `.user-profile`
  - `.ticket-list-item`
  - `.game-button`

### CSS Modules
- **Format:** camelCase for module object properties
- **Examples:**
  - `styles.userProfile`
  - `styles.ticketList`

## File Naming Best Practices

1. **Be descriptive:** Names should clearly describe what the file/component does
2. **Keep it short:** Avoid overly verbose names, but don't sacrifice clarity
3. **Use consistent patterns:** Follow the conventions established above
4. **Avoid abbreviations:** Unless widely understood (e.g., `api`, `url`)
5. **Single responsibility:** Each file should have one clear purpose

## Examples by Type

| Type | Example | Pattern |
|------|---------|---------|
| Vue Component | `UserProfile.vue` | PascalCase |
| Utility | `format-date.js` | lowercase-hyphen |
| Composable | `use-timer.js` | use-kebab-case |
| Store | `ticket-store.js` | lowercase-hyphen-store |
| Constant | `GAME_CONSTANTS.js` | UPPER_SNAKE |
| CSS Class | `.user-profile` | kebab-case |

## Why These Conventions?

- **PascalCase for components:** Matches Vue's official style guide and distinguishes components from regular files
- **lowercase-hyphen for utilities:** Follows web standards for file naming and keeps URLs clean
- **camelCase for functions:** JavaScript/TypeScript standard convention
- **UPPER_SNAKE for constants:** Clearly indicates constant values
- **Consistent prefixes:** `use-` for composables and `-store` for stores makes file discovery easier

## References

- [Vue Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Style Guide](https://typescript-eslint.io/rules/)
