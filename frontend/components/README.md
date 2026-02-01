# Vue.js Components

This directory contains all the reusable Vue.js components for mald.mikahear.es.

## Components

### 1. RankingsPanel.js
**Purpose:** Displays coolness rankings leaderboard
**Props:**
- `isOpen` (Boolean) - Panel visibility
- `rankings` (Array) - List of ranking objects

**Emits:**
- `toggle` - Fired when close button clicked

**Example:**
```javascript
<RankingsPanel
  :is-open="rankingsOpen"
  :rankings="rankings"
  @toggle="toggleRankings"
/>
```

---

### 2. CatPanel.js
**Purpose:** Displays random cat images with refresh button
**Props:**
- `isOpen` (Boolean) - Panel visibility
- `catImage` (String) - Current cat image URL

**Emits:**
- `toggle` - Fired when close button clicked
- `new-cat` - Fired when "New Cat" button clicked

**Example:**
```javascript
<CatPanel
  :is-open="catOpen"
  :cat-image="currentCatImage"
  @toggle="toggleCat"
  @new-cat="nextCat"
/>
```

---

### 3. Tachometer.js
**Purpose:** Mold meter gauge with fart button
**Props:**
- `value` (Number) - Current percentage value
- `needleAngle` (Number) - Needle rotation angle
- `clicked` (Boolean) - Disable state
- `exploded` (Boolean) - Particle explosion state

**Emits:**
- `fart` - Fired when fart button clicked

**Example:**
```javascript
<Tachometer
  :value="tachValue"
  :needle-angle="needleAngle"
  :clicked="fartClicked"
  :exploded="fartExploded"
  @fart="onFart"
/>
```

---

### 4. FeedPanel.js
**Purpose:** Displays live feeds (weather radar, YouTube, Twitter)
**Props:**
- `isOpen` (Boolean) - Panel visibility

**Emits:**
- `toggle` - Fired when close button clicked

**Example:**
```javascript
<FeedPanel
  :is-open="feedOpen"
  @toggle="toggleFeed"
/>
```

---

### 5. QuoteSection.js
**Purpose:** Displays inspirational quote
**Props:**
- `currentQuote` (String) - Current quote text

**Emits:**
- `next-quote` - Fired when quote is clicked

**Example:**
```javascript
<QuoteSection
  :current-quote="currentQuote"
  @next-quote="nextQuote"
/>
```

---

### 6. MikaModal.js
**Purpose:** Blank modal for Mika button
**Props:**
- `isOpen` (Boolean) - Modal visibility

**Emits:**
- `close` - Fired when close button clicked or backdrop clicked

**Example:**
```javascript
<MikaModal
  :is-open="mikaModalOpen"
  @close="closeMikaModal"
/>
```

---

### 7. ConfirmationModal.js
**Purpose:** "Turn me into a girl" confirmation modal
**Props:**
- `isOpen` (Boolean) - Modal visibility

**Emits:**
- `close` - Fired when "Go back" button clicked or backdrop clicked

**Example:**
```javascript
<ConfirmationModal
  :is-open="confirmationOpen"
  @close="closeConfirmation"
/>
```

---

### 8. ControlButtons.js
**Purpose:** All control buttons (rankings, dark mode, music, feeds, Mika)
**Props:**
- `darkMode` (Boolean) - Dark mode state
- `musicPlaying` (Boolean) - Music playing state

**Emits:**
- `toggle-rankings` - Toggle rankings panel
- `toggle-dark` - Toggle dark mode
- `toggle-music` - Toggle music
- `toggle-feed` - Toggle feeds panel
- `toggle-mika` - Toggle Mika modal

**Example:**
```javascript
<ControlButtons
  :dark-mode="darkMode"
  :music-playing="musicPlaying"
  @toggle-rankings="toggleRankings"
  @toggle-dark="toggleDarkMode"
  @toggle-music="toggleMusic"
  @toggle-feed="toggleFeed"
  @toggle-mika="openMikaModal"
/>
```

---

## Adding New Components

### Step 1: Create Component File
```javascript
// components/MyComponent.js
export const MyComponent = {
  template: `
    <div class="my-component">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  `,
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: 'Default description'
    }
  }
};
```

### Step 2: Import in Main App
```javascript
import { MyComponent } from './components/MyComponent.js';

createApp({
  components: {
    MyComponent
  }
});
```

### Step 3: Use in Template
```javascript
template: \`
  <MyComponent
    title="My Component"
    description="This is my new component"
  />
\`
```

---

## Component Guidelines

### Props
- Always define prop types
- Mark required props with `required: true`
- Provide sensible defaults where possible
- Use descriptive names

### Emits
- Emit events with descriptive names
- Use kebab-case for event names
- Document all emitted events

### Styling
- Keep styles in main `index.html` for CDN setup
- Use semantic class names
- Follow BEM-like naming if needed

### Accessibility
- Use semantic HTML elements
- Add proper ARIA labels where needed
- Ensure keyboard navigation works

---

## Benefits of Component Architecture

✅ **Modular** - Each component is self-contained
✅ **Reusable** - Components can be used multiple times
✅ **Maintainable** - Easier to find and fix issues
✅ **Testable** - Components can be tested independently
✅ **Collaboration** - Multiple developers can work on different components
✅ **Clear contracts** - Props and emits define clear interfaces

---

## File Structure

```
components/
├── README.md              # This file
├── RankingsPanel.js       # Coolness rankings panel
├── CatPanel.js            # Random cats panel
├── Tachometer.js          # Mold meter gauge
├── FeedPanel.js           # Live feeds panel
├── QuoteSection.js        # Quote display
├── MikaModal.js           # Mika modal
├── ConfirmationModal.js    # Girl transformation confirmation
└── ControlButtons.js      # All control buttons
```

---

## Future Improvements

### Possible Enhancements:
1. **Scoped CSS** - Extract component styles to individual files
2. **TypeScript** - Add type definitions for better IDE support
3. **Composition API** - Convert to `setup()` function for better reactivity
4. **Testing** - Add unit tests for each component
5. **Storybook** - Visual component playground

### Migration Path:
- Move to Vite build setup for full component features
- Use `.vue` single-file components
- Add CSS modules or scoped styles
- Implement prop validation

---

*Last Updated: 2026-01-29*
