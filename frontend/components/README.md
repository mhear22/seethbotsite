# Vue.js Components

This directory contains all the reusable Vue.js components for mald.mikahear.es.

## Directory Structure

```
components/
├── README.md              # This file
├── pages/                 # Route-level page components
│   ├── AboutPage.vue
│   ├── CatsPage.vue
│   ├── ClocksPage.vue
│   ├── CountdownPage.vue
│   ├── GenderPage.vue
│   ├── GirlModePage.vue
│   ├── HomePage.vue
│   ├── MoviePage.vue
│   ├── MusicPage.vue
│   ├── RankingsPage.vue
│   ├── StockMarket.vue
│   └── TicketsPage.vue
│
├── panels/                # Floating/dockable panels
│   ├── CatPanel.vue
│   ├── DigitalGoose.vue
│   ├── FeedPanel.vue
│   ├── RankingsPanel.vue
│   └── TachometerContent.vue
│
└── shared/                # Shared/reusable components
    ├── core/             # Core app layout components
    │   ├── MainApp.vue   # Main app container
    │   ├── Router.vue    # Navigation router
    │   └── AppFooter.vue # Site footer
    │
    ├── modals/           # Modal components
    │   ├── ConfirmationModal.vue
    │   ├── MikaModal.vue
    │   └── ModalContainer.vue
    │
    ├── ui/               # UI widgets and controls
    │   ├── ControlButtons.vue
    │   ├── EmojiRenderer.vue
    │   ├── FeedContent.vue
    │   ├── GenderPicker.vue
    │   └── QuoteSection.vue
    │
    └── movies/           # Movie-related components
        ├── MovieResults.vue
        ├── MovieSuggestions.vue
        └── MovieVoting.vue
```

## Component Categories

### Pages (`pages/`)
Route-level components that represent full pages. Each page is accessible via a route in the router.

### Panels (`panels/`)
Floating, dockable components that can be toggled on/off. Panels are positioned at screen edges and can be hidden.

### Shared (`shared/`)
Reusable components used across multiple pages and panels.

#### Core (`shared/core/`)
- **MainApp.vue**: Main application layout container
- **Router.vue**: Navigation system with dropdown menus
- **AppFooter.vue**: Site footer with links and info

#### Modals (`shared/modals/`)
- **ModalContainer.vue**: Generic modal container for docked panels
- **MikaModal.vue**: Blank modal for Mika button
- **ConfirmationModal.vue**: Confirmation dialog for actions

#### UI (`shared/ui/`)
- **ControlButtons.vue**: All control buttons (rankings, dark mode, music, feeds, Mika)
- **EmojiRenderer.vue**: Renders emojis with custom styling
- **FeedContent.vue**: Feed panel content wrapper
- **GenderPicker.vue**: Gender detection picker form
- **QuoteSection.vue**: Displays inspirational quotes

#### Movies (`shared/movies/`)
- **MovieSuggestions.vue**: Movie suggestion form
- **MovieVoting.vue**: Movie voting interface
- **MovieResults.vue**: Movie voting results display

## Adding New Components

### Step 1: Choose the Right Category

- Is it a full page? → Put it in `pages/`
- Is it a floating/dockable panel? → Put it in `panels/`
- Is it reusable across multiple places? → Put it in the appropriate `shared/` subdirectory

### Step 2: Create the Component File

```vue
<script setup lang="ts">
import { ref } from 'vue'

// Define props
interface Props {
  title: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: 'Default description'
})

// Define emits
const emit = defineEmits<{
  click: []
}>()

// Component logic
const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<style scoped>
.my-component {
  padding: 1rem;
  background: var(--panel-bg);
  border-radius: 8px;
}
</style>
```

### Step 3: Import Where Needed

```vue
<script setup lang="ts">
import MyComponent from './path/to/MyComponent.vue'
</script>

<template>
  <MyComponent
    title="My Component"
    description="This is my new component"
    @click="handleClick"
  />
</template>
```

## Component Guidelines

### Props
- Always define prop types with TypeScript interfaces
- Use `withDefaults()` for optional props with defaults
- Use descriptive names

### Emits
- Use TypeScript for type-safe emits
- Emit events with descriptive names
- Use kebab-case for event names

### Styling
- Use `<style scoped>` for component-specific styles
- Reference CSS variables for theming (e.g., `var(--panel-bg)`)
- Follow existing naming conventions

### TypeScript
- Use `<script setup lang="ts">` for all components
- Export interfaces used by other components
- Use `defineProps<Interface>()` for prop types
- Use `defineEmits<{ eventName: [] }>()` for emit types

## Benefits of This Structure

✅ **Organized** - Components are grouped by purpose
✅ **Scalable** - Easy to find and add components
✅ **Maintainable** - Clear separation of concerns
✅ **Type-Safe** - TypeScript prevents many errors
✅ **Reusable** - Shared components can be used anywhere

---

*Last Updated: 2026-02-05*
