# AGENTS.md - Seethbot Site Development Documentation

*This document captures the current architecture and development learnings for mald.mikahear.es - a playful, interactive personal website.*

## Project Overview

**Project:** mald.mikahear.es
**Type:** Single-page application (SPA) with multiple routes
**Tech Stack:** Vue 3 + TypeScript + Vite + Vue Router + Pinia
**Deployment:** Git → GitHub → Docker/Nginx
**Status:** ✅ Live and operational

---

## Current Architecture (2026-02-01)

### Tech Stack
- **Framework:** Vue 3 (Composition API)
- **Language:** TypeScript
- **Build System:** Vite 5.0
- **State Management:** Pinia (Setup Store pattern)
- **Routing:** Vue Router 4.6
- **Component Style:** Single File Components (.vue)

### Project Structure

```
/var/home/mika/Documents/git/seethbotsite/
├── index.html              # Entry HTML (minimal, loads main.ts)
├── main.ts                 # Application entry point
├── App.vue                 # Root component
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies
├── styles.css              # Global styles
│
├── components/             # Vue Single File Components
│   ├── HomePage.vue        # Main landing page
│   ├── GirlModePage.vue    # Girl mode route
│   ├── GenderPage.vue      # Gender selection page
│   ├── AboutPage.vue       # About page
│   ├── RankingsPage.vue    # Rankings leaderboard page
│   ├── CatsPage.vue        # Cat pictures page
│   ├── StockMarket.vue     # Stock market game
│   ├── MoviePage.vue       # Movie night coordinator
│   ├── MovieResults.vue    # Movie voting results
│   ├── MovieSuggestions.vue # Movie suggestions
│   ├── MovieVoting.vue     # Movie voting interface
│   ├── MainApp.vue         # Main app layout
│   ├── Tachometer.vue      # Mold meter gauge
│   ├── RankingsPanel.vue   # Rankings panel component
│   ├── CatPanel.vue        # Cat picture panel
│   ├── FeedPanel.vue       # Live feeds panel
│   ├── QuoteSection.vue    # Quote display
│   ├── MikaModal.vue       # Modal for Mika button
│   ├── ConfirmationModal.vue # Confirmation dialog
│   ├── ControlButtons.vue  # Control button group
│   ├── DigitalGoose.vue    # Goose character
│   ├── GenderPicker.vue    # Gender selection UI
│   ├── EmojiRenderer.vue   # Emoji display
│   ├── ClickCounter.vue    # Click counter component
│   └── Router.vue          # Router component
│
├── stores/                 # Pinia stores
│   └── useAppStore.ts      # Main application store
│
├── composables/            # Reusable composition functions
│   ├── useAudio.ts         # Audio playback logic
│   ├── useCat.ts           # Cat API integration
│   ├── useRankings.ts      # Rankings data fetching
│   └── usePanels.ts        # Panel state management
│
├── router/                 # Vue Router configuration
│   └── index.ts            # Route definitions
│
├── server/                 # Backend server (Node.js)
│   └── src/
│       └── db.ts           # Database logic
│
├── dist/                   # Build output (production)
│   ├── index.html          # Built HTML
│   └── assets/             # Built CSS/JS
│
├── public/                 # Static assets
└── utils/                  # Utility functions
```

---

## Migration History

### First Migration: Vanilla JS → Vue 3 CDN (2026-01-29)
- Migrated from vanilla JavaScript to Vue 3 Composition API
- Used CDN-based Vue (no build step)
- Introduced reactive state management with `ref()` and `computed()`
- Replaced manual DOM manipulation with Vue directives

**Key Learnings from First Migration:**
- Vue's reactivity system automatically updates DOM
- `@click` directive cleaner than `addEventListener`
- `:class` binding provides declarative conditional rendering
- `v-for` directive handles list rendering with proper DOM diffing

### Second Migration: CDN → Vite + TypeScript (2026-01-30+)
- Migrated from CDN-based Vue to Vite build system
- Added TypeScript for type safety
- Converted all components to Single File Components (.vue)
- Introduced Pinia for centralized state management
- Added Vue Router for multi-page routing
- Extracted composables for reusable logic

**Benefits of Second Migration:**
- ✅ TypeScript type safety
- ✅ Hot Module Replacement (HMR) in dev
- ✅ Optimized production builds
- ✅ Scoped CSS in components
- ✅ Better code organization
- ✅ Proper state management with Pinia

---

## Application Features

### Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Main landing page with tachometer |
| `/girl` | GirlModePage | Girl mode easter egg |
| `/gender` | GenderPage | Gender selection interface |
| `/about` | AboutPage | About page |
| `/rankings` | RankingsPage | Coolness rankings leaderboard |
| `/cats` | CatsPage | Random cat pictures |
| `/stocks` | StockMarket | Stock market simulation game |
| `/movies` | MoviePage | Movie night voting system |

### Core Features

#### 1. Mold Meter (Tachometer)
- Interactive gauge responding to "fart" button
- Randomized values (0-100%)
- Volume-based audio feedback
- Spring bounce animations
- **Location:** `components/Tachometer.vue`

#### 2. Coolness Rankings
- Real-time leaderboard fetched from API
- Current user highlighted
- Trend indicators (up/down/neutral)
- Refreshes every 30 seconds
- **Location:** `components/RankingsPage.vue`, `composables/useRankings.ts`

#### 3. Random Cats
- Fetches random cat images from API
- Lazy loading with loading states
- New cat on button click
- **Location:** `components/CatsPage.vue`, `composables/useCat.ts`

#### 4. Movie Night System
- Suggestion submission
- Preferential voting (ranked choice)
- Results visualization
- End voting controls
- **Location:** `components/MoviePage.vue`, `MovieSuggestions.vue`, `MovieVoting.vue`, `MovieResults.vue`

#### 5. Stock Market Game
- Database-persisted money/stocks
- Buy/sell simulation
- Price fluctuations
- **Location:** `components/StockMarket.vue`

#### 6. Audio System
- Fart sounds with reverb
- Button click sounds
- Background music toggle
- Volume control based on tachometer value
- **Location:** `composables/useAudio.ts`
- **Files:** `fart-with-reverb.mp3`, `button-sound.mp3`, `newMusic.mp3`

#### 7. Dark Mode
- Theme toggle (light/dark)
- Smooth transitions
- Gradient backgrounds change
  - Light mode: Peach/coral gradient (#ffecd2 → #fcb69f)
  - Dark mode: Forest green gradient (#1a5c2a → #2d5a3d)
- **Location:** `stores/useAppStore.ts`, `App.vue`

#### 8. Floating Hearts Animation
- Random heart emojis float across screen
- Staggered animations
- Automatic cleanup to prevent memory leaks
- Created every 500ms
- **Location:** `App.vue:22`, `stores/useAppStore.ts:96`

---

## State Management with Pinia

### Main Store: `useAppStore`

**State:**
- `darkMode` - Dark mode toggle
- `musicPlaying` - Music playback state
- `currentQuoteIndex` - Current quote index
- `tachValue` - Tachometer value (0-100)
- `fartClicked` - Fart button click state
- `fartExploded` - Explosion animation state
- `mikaModalOpen` - Mika modal visibility
- `confirmationOpen` - Confirmation modal visibility
- `currentRoute` - Current route name
- `quotes` - Array of inspirational quotes

**Composables (integrated into store):**
- `panels` - Panel open/close state (from `usePanels`)
- `catImage` / `catLoading` - Cat image state (from `useCat`)
- `rankings` / `rankingsLoading` - Rankings data (from `useRankings`)

**Actions:**
- `toggleDarkMode()` - Toggle dark mode
- `toggleMusic()` - Toggle background music
- `togglePanel(panelName)` - Toggle panel visibility
- `nextQuote()` - Cycle to next quote
- `nextCat()` - Fetch new cat image
- `onFart()` - Handle fart button click
- `onTurnMe()` - Handle "turn me into a girl" button
- `closeConfirmation()` - Close confirmation modal
- `closeMikaModal()` - Close Mika modal
- `createHeart()` - Create floating heart element
- `loadRankings()` - Fetch rankings from API
- `getTrendClass(trend)` - Get CSS class for trend indicator

---

## Composables Pattern

### useAudio
**Purpose:** Audio playback logic
**Exports:**
- `playSound(elementId, options)` - Play audio element
- `playFart(volume)` - Play fart sound with volume
- `toggleMusic(playing)` - Toggle background music

### useCat
**Purpose:** Cat API integration
**Exports:**
- `catImage` - Current cat image URL
- `catLoading` - Loading state
- `fetchNewCat()` - Fetch new random cat

### useRankings
**Purpose:** Rankings data fetching
**Exports:**
- `rankings` - Rankings array
- `loading` - Loading state
- `loadRankings()` - Fetch rankings from API
- `getTrendClass(trend)` - Get trend CSS class

### usePanels
**Purpose:** Panel state management
**Exports:**
- `panels` - Panel open/close state object
- `togglePanel(panelName)` - Toggle specific panel

---

## Component Architecture

### Setup Store Pattern (Pinia)

The project uses Pinia's **Setup Store** pattern (similar to Composition API):

```typescript
export const useAppStore = defineStore('app', () => {
  // State (using ref)
  const darkMode = ref(false)

  // Getters (using computed)
  const currentQuote = computed(() => quotes.value[currentQuoteIndex.value])

  // Actions (regular functions)
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
  }

  // Return public API
  return {
    darkMode,
    currentQuote,
    toggleDarkMode
  }
})
```

### Single File Components (.vue)

All components follow the `<script setup>` pattern:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/useAppStore'

const store = useAppStore()
const localState = ref('')

// Props
defineProps<{
  title: string
}>()

// Emits
const emit = defineEmits<{
  click: [value: string]
}>()
</script>

<template>
  <div>{{ store.currentQuote }}</div>
</template>

<style scoped>
/* Component-specific styles */
</style>
```

---

## Development Workflow

### Development Server
```bash
npm run dev
```
- Starts Vite dev server on `http://localhost:3000`
- Hot Module Replacement (HMR) enabled
- TypeScript compilation in watch mode

### Production Build
```bash
npm run build
```
- Creates optimized production build in `dist/`
- Minifies and bundles all assets
- Outputs:
  - `dist/index.html`
  - `dist/assets/*.css`
  - `dist/assets/*.js`

### Preview Production Build
```bash
npm run preview
```
- Serves the `dist/` folder locally
- Test production build before deployment

---

## Git Management Best Practices

### Always .gitignore
```
node_modules/
dist/
.env
*.log
.DS_Store
```

### Common Commands
```bash
# Remove files from git tracking (without deleting)
git rm -r --cached node_modules/

# Check status before committing
git status

# Commit changes
git add .
git commit -m "feat: Add movie voting system"
git push
```

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
refactor: Refactor code
docs: Update documentation
style: Format code
test: Add tests
chore: Update dependencies
```

---

## CSS Animations

### Spring Bounce Animation
```css
@keyframes springBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-15px) scale(1.05); }
  50% { transform: translateY(0) scale(1.02); }
  75% { transform: translateY(-5px) scale(1.01); }
}
```

**Usage:** Buttons, cards, interactive elements
**Lesson:** Multi-keyframe spring animations feel more natural than linear ease-in-out

### Floating Hearts
```javascript
const createHeart = () => {
  const heart = document.createElement('div')
  heart.className = 'heart'
  heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)]
  heart.style.left = Math.random() * 100 + 'vw'
  heart.style.animationDuration = (Math.random() * 3 + 3) + 's'
  document.body.appendChild(heart)

  // CRITICAL: Clean up DOM to prevent memory leaks
  setTimeout(() => heart.remove(), 6000)
}
```

**Lesson:** Always clean up dynamically created DOM elements to prevent memory leaks

---

## Performance Considerations

### Good Practices
- ✅ CSS animations (GPU accelerated)
- ✅ Vue's reactive system (optimized DOM updates)
- ✅ Vite's code splitting
- ✅ Lazy loading routes
- ✅ Minimal re-renders with computed properties

### Areas for Improvement
1. **Large audio files**
   - `newMusic.mp3` = 7MB
   - **Fix:** Compress to OGG/Opus or use streaming
   - **Target:** <1MB for background music

2. **Image optimization**
   - Cat images loaded at full resolution
   - **Fix:** Add responsive images with `srcset`

3. **API polling**
   - Rankings refresh every 30 seconds
   - **Fix:** Use WebSocket for real-time updates

---

## Testing Checklist

Before deploying:

- [ ] Test all routes (/, /girl, /gender, /about, /rankings, /cats, /stocks, /movies)
- [ ] Test audio behavior (no autoplay on page load)
- [ ] Test dark mode toggle
- [ ] Test tachometer fart button
- [ ] Test rankings refresh
- [ ] Test cat image loading
- [ ] Test movie voting flow
- [ ] Test on mobile (responsive design)
- [ ] Check console for errors
- [ ] Run `npm run build` successfully
- [ ] Preview production build with `npm run preview`

---

## Deployment

### Current Setup
1. **Local:** `/var/home/mika/Documents/git/seethbotsite/`
2. **Remote:** `github.com/mhear22/seethbotsite.git`
3. **Web Server:** Nginx (serving from `dist/`)
4. **Container:** Docker

### Build & Deploy Workflow
```bash
# Build production assets
npm run build

# Deploy to server
# (Docker/Nginx automatically serves from dist/)
```

---

## Future Improvements

### High Priority
1. **Mobile responsive design** - Add media queries for mobile screens
2. **Audio compression** - Reduce newMusic.mp3 file size (currently 7MB)
3. **Error handling** - Add error boundaries and fallbacks

### Medium Priority
4. **WebSocket integration** - Real-time rankings updates
5. **LocalStorage** - Persist user preferences (dark mode, volume)
6. **TypeScript strict mode** - Enable strict type checking
7. **Unit tests** - Add Vitest for component testing

### Low Priority
8. **Progressive Web App (PWA)** - Offline support
9. **Accessibility (a11y)** - ARIA labels, keyboard navigation
10. **Analytics** - Track feature usage
11. **Internationalization (i18n)** - Multi-language support

---

## Key Learnings

### ✅ What Works Well
- **Vite build system** - Fast dev server, optimized builds
- **TypeScript** - Catch errors at compile time
- **Pinia Setup Stores** - Clean, composable state management
- **Vue Router** - Easy multi-page navigation
- **Composables pattern** - Reusable logic across components
- **Single File Components** - Scoped styles, clear structure

### ⚠️ What to Watch Out For
- **Missing dependencies** - Always check package.json matches imports
- **Audio autoplay** - Browsers block autoplay, use user interaction
- **Memory leaks** - Clean up event listeners and DOM elements
- **Large assets** - Compress media files before deployment
- **Type safety** - Use TypeScript interfaces for API responses

### 💡 Pro Tips
1. Use `git rm -r --cached` to untrack files without deleting them
2. Always clean up dynamically created DOM elements (setTimeout + remove())
3. Use Chrome DevTools Lighthouse for performance checks
4. Pinia Setup Stores are easier to understand than Options Stores
5. Composables should be pure functions without side effects
6. Use `<script setup>` for cleaner component code
7. Enable Vite's HMR for instant feedback during development
8. Use TypeScript `interface` for props/emits definitions
9. Test on mobile early - mobile restrictions are stricter
10. Keep components small and focused (single responsibility)

---

## Contact & Documentation

- **Repo:** github.com/mhear22/seethbotsite
- **Live Site:** mald.mikahear.es
- **Main Docs:** This file (`AGENTS.md`)
- **Migration Docs:** `VUE_MIGRATION.md`, `MIGRATION_COMPLETE.md`
- **Deployment Docs:** `DEPLOYMENT.md`
- **Movie Feature Docs:** `MOVIE_NIGHT_FEATURE.md`

---

*Last Updated: 2026-02-01*
*Version: 3.0 (Vite + TypeScript + Pinia)*
