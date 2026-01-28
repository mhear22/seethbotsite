# AGENTS.md - Seethbot Site Development Learnings

*This document captures insights and learnings from developing mald.mikahear.es - a playful, interactive personal website.*

## Project Overview

**Project:** mald.mikahear.es
**Type:** Single-page interactive personal website
**Tech Stack:** HTML, CSS (inline), Vanilla JavaScript
**Deployment:** Git → GitHub → Nginx (auto-sync via cron script)
**Status:** ✅ Live and operational

---

## Core Features

### 1. Main Container & Aesthetics
- **Floating container** with glassmorphism effect (rgba(255, 255, 255, 0.9))
- **Gradient backgrounds:** 
  - Light mode: Peach/coral gradient (#ffecd2 → #fcb69f)
  - Dark mode: Forest green gradient (#1a5c2a → #2d5a3d)
- **Animated elements:**
  - Floating container (gentle vertical bobbing)
  - Sparkle emojis with staggered animations
  - Bouncing main emoji

**Key Learning:** Smooth CSS transitions (0.2-0.3s with cubic-bezier) create premium feel without jarring movement.

---

### 2. Coolness Rankings Panel
- **Purpose:** Display a playful leaderboard
- **Features:**
  - Collapsible panel (slide-out animation)
  - Current user highlighted in pink
  - Animated hover effects (scale + spring bounce)
  - Dynamic score updates with bounce animation

**Technical Details:**
```css
.rank-item:hover {
    background: rgba(255, 107, 157, 0.2);
    transform: scale(1.02);
    animation: springBounce 0.3s ease;
}
```

**Lesson Learned:** Panel toggle states need careful coordinate calculation. `transform: translateX(-260px)` with `overflow: hidden` ensures smooth slide without reflow.

---

### 3. Mold Meter (Tachometer Gauge)
- **Purpose:** Interactive gauge that responds to "fart" button
- **Visuals:**
  - Circular gauge with gradient dial (#90EE90 → #32CD32)
  - Animated needle with continuous swing animation
  - Tick marks (major and minor)
- **Interactivity:**
  - "💨 Fart!" button triggers randomized value (0-100%)
  - Needle snaps to random angle
  - Spring bounce animation on value update

**Technical Implementation:**
```javascript
const randomAngle = -90 + (Math.random() * 180);
needle.style.transform = `rotate(${randomAngle}deg)`;
```

**Lesson Learned:** Continuous animation (`needleSwing` infinite) conflicts with state updates. Solution: Separate CSS animation from inline style transforms. Apply infinite animation only as fallback, use inline transforms for state.

---

### 4. Audio System
**Files:**
- `fart-with-reverb.mp3` (52KB)
- `button-sound.mp3` (196KB)
- `newMusic.mp3` (7MB - large, consider compression)

**Critical Issues Fixed:**
1. **Autoplay blocking:** Browsers block audio autoplay without user interaction.
2. **Infinite looping:** Original audio tags had `loop autoplay` causing continuous playback on page load.
3. **Solution:**
   - Remove `autoplay` and `loop` from `<audio>` tags
   - Use JavaScript to play on user interaction (button clicks)
   - Music toggle button for manual control

**Key Code:**
```html
<!-- BEFORE (BAD) - caused infinite audio on page load -->
<audio id="fartSound" src="fart-with-reverb.mp3" loop autoplay></audio>

<!-- AFTER (GOOD) - user-controlled only -->
<audio id="fartSound" src="fart-with-reverb.mp3" preload="auto"></audio>
```

**Lesson Learned:** 
- Never use `autoplay` on audio elements unless explicitly required
- Always handle browser autoplay restrictions with graceful fallbacks
- Test on mobile (autoplay restrictions are stricter)

---

### 5. Dark Mode Toggle
- **Implementation:** Toggle CSS class on `<body>` element
- **Smooth transitions:** All elements use `transition: background 0.5s ease`
- **State management:** Simple boolean flag (`let darkMode = false`)
- **Icon updates:** 🌙 (sun/moon toggle)

**Code Pattern:**
```javascript
darkMode = !darkMode;
document.body.classList.toggle('dark', darkMode);
this.textContent = darkMode ? '🌙' : '☀️';
```

**Lesson Learned:** CSS class toggling is more maintainable than inline style injection. Allows centralized theme management.

---

### 6. Quote System
- **Data:** Array of inspirational quotes
- **Interactivity:** "💬 New Quote" button cycles through array
- **Animation:** Spring bounce on quote update
- **Fixed header:** Top bar with quote text

**Lesson Learned:** Modular quote array allows easy expansion. Consider fetching from external API for dynamic content.

---

### 7. Live Feeds Panel
- **Purpose:** Display external content (weather radar, YouTube, Twitter)
- **Components:**
  - Collapsible panel (slide from right)
  - Iframe embedding for radar and video
  - Link to X/Twitter profile
- **Sources:**
  - BOM Queensland radar: `https://www.bom.gov.au/products/IDR064.loop.gif`
  - YouTube embed (Rick Roll): `https://www.youtube.com/embed/dQw4w9WgXcQ`
  - BOM Twitter: `@BOM_Qld`

**Issues Encountered:**
- X/Twitter embeds require iframe with specific dimensions
- Weather radar GIF loops continuously (as intended)

**Lesson Learned:** Use `preload="lazy"` on iframes to improve initial page load.

---

### 8. Game Boy Emulator (Mock)
- **Implementation:** Simple canvas-based mock
- **Features:**
  - Title screen ("POKEMON EMERALD")
  - D-pad controls (▲◄▼►)
  - Simple character movement
  - ROM URL configured (Pokemon Emerald backup from S3)

**Known Issues:**
- Currently a **mock/simulation**, not a real emulator
- ROM URL requires authentication tokens (AWS S3 signed URLs)
- Controls only click (no keyboard support)
- "LOADING..." screen persists until first interaction

**Technical Notes:**
```javascript
// ROM URL structure
const romUrl = 'https://ajones-nasbackup.s3.ap-southeast-2.amazonaws.com/...';

// Mock game state
let emulatorState = {
    running: false,
    screen: 'title',
    player: { x: 240, y: 220, facing: 'right' }
};
```

**Future Improvements:**
- Integrate actual EmulatorJS library
- Add keyboard event listeners
- Implement ROM loading via File API
- Save/load game state

---

## Technical Learnings

### CSS Animations

#### Spring Physics
```css
@keyframes springBounce {
    0%, 100% { transform: translateY(0) scale(1); }
    25% { transform: translateY(-15px) scale(1.05); }
    50% { transform: translateY(0) scale(1.02); }
    75% { transform: translateY(-5px) scale(1.01); }
}
```

**Insight:** Multi-keyframe spring animations feel more natural than linear ease-in-out. Use for buttons, cards, and interactive elements.

#### Floating Hearts
```javascript
function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
}
setInterval(createHeart, 500);
```

**Insight:** 
- Randomize position and duration for organic feel
- **Always clean up DOM elements** (setTimeout + remove()) to prevent memory leaks
- 500ms interval = 2 elements per second (balanced for performance)

---

### Performance Considerations

#### What's Good:
- CSS animations (GPU accelerated)
- Minimal DOM manipulation
- Efficient class toggling for themes

#### What Needs Improvement:
1. **Large audio files:**
   - `newMusic.mp3` = 7MB
   - **Fix:** Compress to OGG/Opus or use streaming
   - **Target:** <1MB for background music

2. **No lazy loading:**
   - All iframes load immediately
   - **Fix:** Add `loading="lazy"` attribute

3. **Inline CSS:**
   - 25KB+ of CSS in `<head>`
   - **Fix:** Extract to separate `styles.css` file for caching

---

### Git Management

#### Common Mistakes Fixed

**1. Pushing node_modules**
```bash
# PROBLEM: Committed 279,257 files from node_modules/
# CAUSE: No .gitignore file

# SOLUTION: 
echo "node_modules/" >> .gitignore
git rm -r --cached node_modules/  # Remove from tracking only
git commit -m "Add .gitignore and remove node_modules"
git push
```

**Key Command:** `git rm -r --cached` removes files from git tracking **without deleting from disk**.

**2. Secrets in git**
```bash
# PROBLEM: GitHub PAT in package.json
{
  "repository": {
    "url": "git+https://github_pat_TOKEN@github.com/user/repo.git"
  }
}

# SOLUTION: Remove secret and use credential helpers
git config credential.helper store
git push  # Will prompt for credentials once
```

**Lesson Learned:** Never commit API keys, tokens, or secrets. Use environment variables or credential helpers.

---

### Deployment Workflow

#### Current Setup
1. **Local:** `/home/seethbotsite/`
2. **Remote:** `github.com/mhear22/seethbotsite.git`
3. **Sync Script:** `/home/sync-nginx-git.sh`
4. **Web Server:** Nginx (auto-synced via cron)

#### Sync Script Logic
```bash
#!/bin/bash
REPO_DIR="/home/seethbotsite"
PAT_FILE="/home/pat.txt"

cd "$REPO_DIR" || exit 1

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit and push
git add .
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
git push https://$(cat "$PAT_FILE")@github.com/mhear22/seethbotsite.git
```

**Lesson Learned:** 
- Auto-commit scripts should check for changes first
- Timestamped commits provide history context
- Use credential files for automated pushes (but **don't commit the file**)

---

## Known Issues & Bugs

### 1. Audio Autoplay (RESOLVED ✅)
- **Issue:** Audio playing continuously on page load
- **Cause:** `loop autoplay` attributes on `<audio>` tags
- **Fix:** Removed both attributes, audio now user-triggered only

### 2. Mobile Responsiveness
- **Issue:** Panels and buttons may overlap on small screens
- **Status:** Not tested on mobile
- **Fix Needed:** Add media queries for `< 768px` breakpoints

### 3. Emulator Functionality
- **Issue:** Emulator is a mock, doesn't actually play games
- **Status:** Intentional prototype
- **Fix:** Integrate EmulatorJS library or actual Game Boy Advance emulator

### 4. Large Asset Sizes
- **Issue:** `newMusic.mp3` is 7MB
- **Impact:** Slow initial load
- **Fix:** Compress to Opus format, target <1MB

---

## Future Improvements

### High Priority
1. **Audio compression** - Convert to Opus/Ogg, reduce file size
2. **Mobile responsive** - Add media queries and touch targets
3. **Lazy loading** - Add `loading="lazy"` to iframes
4. **Extract CSS** - Move inline styles to separate file

### Medium Priority
5. **Real emulator** - Integrate EmulatorJS library
6. **Keyboard controls** - Add arrow key support for emulator
7. **LocalStorage** - Save user preferences (dark mode, volume)
8. **Quote API** - Fetch quotes from external source

### Low Priority (Nice to Have)
9. **Particle effects** - More sophisticated physics (matter.js)
10. **User profiles** - Allow customizing rankings panel
11. **Music playlist** - Multiple tracks with shuffle
12. **PWA** - Progressive web app features (offline support)

---

## Development Guidelines

### When Making Changes

1. **Test audio behavior:**
   - Ensure no autoplay on page load
   - Test play/pause functionality
   - Verify volume control works

2. **Check git status:**
   - Run `git status` before committing
   - Verify `node_modules/` is ignored
   - Check for secrets in code

3. **Test responsive design:**
   - Open DevTools device emulator
   - Test mobile widths (375px, 414px)
   - Check panel overlap issues

4. **Performance check:**
   - Use Lighthouse in Chrome DevTools
   - Target: 90+ on Performance, Accessibility, Best Practices

---

## File Structure

```
/home/seethbotsite/
├── .gitignore              # Git ignore rules
├── .git/                  # Git repository
├── index.html             # Main HTML (29KB)
├── script.js              # Main JavaScript (12KB)
├── package.json           # Node.js dependencies
├── package-lock.json      # Dependency lock file
├── 50x.html              # Custom error page
├── node_modules/          # Dependencies (git-ignored)
├── fart-with-reverb.mp3   # Audio effect (52KB)
├── button-sound.mp3       # Button click sound (196KB)
└── newMusic.mp3           # Background music (7MB) ⚠️ Large file
```

---

## Key Takeaways

### ✅ What Worked Well
- CSS spring animations create delightful interactions
- Dark mode via class toggling is clean and maintainable
- Git sync script works reliably for deployment
- Collapsible panels provide good UX without clutter

### ⚠️ What to Watch Out For
- **Audio autoplay:** Browsers block it by default - always use user interaction triggers
- **Large assets:** Compress media files before deployment
- **node_modules:** Always .gitignore this directory
- **Secrets:** Never commit API keys or tokens

### 💡 Pro Tips
1. Use `git rm -r --cached` to untrack files without deleting them
2. Test autoplay behavior on mobile - restrictions are stricter
3. Spring animations feel better than linear easing for buttons
4. Always clean up DOM elements (setTimeout + remove())
5. Use Chrome DevTools Lighthouse for performance checks

---

## Contact & Support

- **Repo:** github.com/mhear22/seethbotsite
- **Live Site:** mald.mikahear.es
- **Git Sync:** `/home/sync-nginx-git.sh`
- **Docs Location:** This file (`AGENTS.md`)

---

*Last Updated: 2026-01-29*
*Version: 1.0*
