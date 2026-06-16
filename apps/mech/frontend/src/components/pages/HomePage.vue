<template>
  <div class="home-screen">
    <!-- Idle mech rotating gently behind the menu (decorative, non-interactive) -->
    <div class="home-bg" aria-hidden="true">
      <MechPreview3D :loadout="idleLoadout" />
    </div>
    <div class="home-vignette" aria-hidden="true"></div>

    <!-- Settings (gear, top-right) — opens the shared modal in-place -->
    <button class="home-gear" type="button" title="Settings" @click="isSettingsOpen = true">⚙</button>
    <GameSettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />

    <div class="home-content">
      <div class="home-logo">
        <span class="logo-line">THE MECH</span>
        <span class="logo-line accent">APP</span>
      </div>
      <p class="home-tagline">A walking disaster with a heart of gold.</p>

      <nav class="home-menu" aria-label="Main menu">
        <button v-if="hasSave" class="menu-entry continue" @click="continueStory">
          <span class="entry-title">▶ CONTINUE</span>
          <span class="entry-sub">Pick up your story run</span>
        </button>

        <button class="menu-entry" @click="goStory">
          <span class="entry-title">🏘 STORY MODE</span>
          <span class="entry-sub">Roam, help (or wreck) the towns</span>
        </button>

        <button class="menu-entry" @click="goBuildBattle">
          <span class="entry-title">⚔ BUILD &amp; BATTLE</span>
          <span class="entry-sub">Forge a mech, then fight</span>
        </button>

        <button class="menu-entry subtle" @click="isSettingsOpen = true">
          <span class="entry-title">⚙ SETTINGS</span>
        </button>
      </nav>

      <p class="home-footer">v1 · all data saved locally</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MechPreview3D from '../mech/MechPreview3D.vue'
import GameSettingsModal from '../mech/GameSettingsModal.vue'
import { useStoryMode, buildStarterLoadout } from '../../composables/useStoryMode'

const router = useRouter()
const story = useStoryMode()

// Whether a saved story run exists — drives the optional "Continue" entry.
const hasSave = ref(story.hasSavedRun())
const isSettingsOpen = ref(false)
// A throwaway starter loadout purely for the decorative background preview.
const idleLoadout = buildStarterLoadout()

/** Jump straight back into the saved run (StoryModePage auto-continues on this query). */
function continueStory() {
  router.push({ name: 'mech-story', query: { start: 'continue' } })
}

/** Story intro (New / Continue chooser). */
function goStory() {
  router.push({ name: 'mech-story' })
}

/** Build & Battle starts in the workshop (per design: tinker first, then fight). */
function goBuildBattle() {
  router.push({ name: 'mech-builder' })
}
</script>

<style scoped>
.home-screen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(circle at 50% 35%, #1b2a4a 0%, #0b1220 70%, #060a14 100%);
  color: #e8eefc;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Decorative 3D background — non-interactive, dimmed so the menu reads clearly. */
.home-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  filter: saturate(0.7);
}
.home-bg :deep(.preview-controls) {
  display: none; /* hide the orbit/reset buttons; this is ambiance only */
}
.home-bg :deep(.loading-overlay) {
  display: none;
}
.home-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 45%, transparent 30%, rgba(6, 10, 20, 0.7) 100%);
}

.home-gear {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 3;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #cfe0ff;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.home-gear:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: rotate(40deg);
}

.home-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.home-logo {
  display: flex;
  flex-direction: column;
  line-height: 0.92;
  letter-spacing: 0.14em;
  font-weight: 800;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
}
.logo-line {
  font-size: clamp(2.6rem, 8vw, 5rem);
}
.logo-line.accent {
  color: #ffd54f;
  text-shadow: 0 0 24px rgba(255, 179, 0, 0.45);
}

.home-tagline {
  margin: 14px 0 30px;
  font-style: italic;
  color: #aebbd6;
  font-size: clamp(0.95rem, 2.2vw, 1.2rem);
}

.home-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(440px, 92vw);
}

.menu-entry {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(40, 56, 92, 0.85), rgba(26, 38, 66, 0.85));
  color: #e8eefc;
  cursor: pointer;
  text-align: left;
  transition: transform 0.12s ease, border-color 0.12s, background 0.12s;
}
.menu-entry:hover {
  transform: translateX(6px);
  border-color: rgba(255, 213, 79, 0.7);
  background: linear-gradient(180deg, rgba(52, 72, 116, 0.95), rgba(34, 50, 86, 0.95));
}
.menu-entry .entry-title {
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.menu-entry .entry-sub {
  font-size: 0.85rem;
  color: #9fb0d2;
}
.menu-entry.continue {
  border-color: rgba(255, 213, 79, 0.6);
  background: linear-gradient(180deg, rgba(78, 64, 24, 0.9), rgba(52, 42, 14, 0.9));
}
.menu-entry.continue .entry-title {
  color: #ffd54f;
}
.menu-entry.subtle {
  background: rgba(255, 255, 255, 0.05);
}
.menu-entry.subtle .entry-title {
  font-size: 1rem;
  font-weight: 600;
}

.home-footer {
  margin-top: 28px;
  font-size: 0.78rem;
  color: #6b7a98;
  letter-spacing: 0.05em;
}
</style>
