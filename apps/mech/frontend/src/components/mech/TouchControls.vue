<template>
  <!-- Only ever rendered on touch devices; desktop never sees this. -->
  <div v-if="isTouch" class="touch-controls" aria-hidden="true">
    <!-- Look zone: drag anywhere on the right side to aim the camera. -->
    <div
      class="tc-look-zone"
      @touchstart.prevent="onLookStart"
      @touchmove.prevent="onLookMove"
      @touchend.prevent="onLookEnd"
      @touchcancel.prevent="onLookEnd"
    ></div>

    <!-- Movement joystick (bottom-left). -->
    <div
      class="tc-move-zone"
      @touchstart.prevent="onMoveStart"
      @touchmove.prevent="onMoveMove"
      @touchend.prevent="onMoveEnd"
      @touchcancel.prevent="onMoveEnd"
    >
      <div class="tc-stick-base" :class="{ active: moveTouchId !== null }">
        <div class="tc-stick-knob" :style="knobStyle"></div>
      </div>
    </div>

    <!-- Action buttons (bottom-right). -->
    <div class="tc-actions">
      <button
        class="tc-btn fire-l"
        @touchstart.prevent="press('shootLeft')"
        @touchend.prevent="release('shootLeft')"
        @touchcancel.prevent="release('shootLeft')"
      >L</button>
      <button
        class="tc-btn fire-r"
        @touchstart.prevent="press('shootRight')"
        @touchend.prevent="release('shootRight')"
        @touchcancel.prevent="release('shootRight')"
      >R</button>
      <button
        class="tc-btn jump"
        @touchstart.prevent="press('jump')"
        @touchend.prevent="release('jump')"
        @touchcancel.prevent="release('jump')"
      >▲</button>
      <button
        class="tc-btn dash"
        @touchstart.prevent="press('dash')"
        @touchend.prevent="release('dash')"
        @touchcancel.prevent="release('dash')"
      >»</button>
      <button
        v-if="context === 'story'"
        class="tc-btn interact"
        @touchstart.prevent="onInteractDown"
        @touchend.prevent="onInteractUp"
        @touchcancel.prevent="onInteractUp"
      >E</button>
      <button
        v-else
        class="tc-btn ability"
        @touchstart.prevent="press('useAbility')"
        @touchend.prevent="release('useAbility')"
        @touchcancel.prevent="release('useAbility')"
      >E</button>
      <!-- Rack ability (smoke / repair / shield / jump-jets) — a separate verb
           from boost (E) so it can't be triggered by holding sprint. -->
      <button
        class="tc-btn rack"
        @touchstart.prevent="press('useRackAbility')"
        @touchend.prevent="release('useRackAbility')"
        @touchcancel.prevent="release('useRackAbility')"
      >Q</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useIsTouch } from '../../composables/useIsTouch'
import type { InputManager, VirtualButton } from '../../lib/battle/InputManager'

const props = defineProps<{
  /** The scene's InputManager to drive (null while the scene isn't ready). */
  input: InputManager | null
  /** Which control set to show. Story shows an Interact (E) button; battle shows Ability. */
  context: 'story' | 'battle'
}>()

const isTouch = useIsTouch()

// --- Movement joystick ---
const STICK_RADIUS = 52 // px of travel for full deflection
const moveTouchId = ref<number | null>(null)
const moveOrigin = { x: 0, y: 0 }
const knob = ref({ x: 0, y: 0 }) // visual knob offset (px)

const knobStyle = computed(() => ({
  transform: `translate(${knob.value.x}px, ${knob.value.y}px)`,
}))

function touchById(list: TouchList, id: number): Touch | null {
  for (let i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i]
  return null
}

function onMoveStart(e: TouchEvent) {
  if (moveTouchId.value !== null) return
  const t = e.changedTouches[0]
  moveTouchId.value = t.identifier
  moveOrigin.x = t.clientX
  moveOrigin.y = t.clientY
  updateMove(t)
}

function onMoveMove(e: TouchEvent) {
  if (moveTouchId.value === null) return
  const t = touchById(e.touches, moveTouchId.value)
  if (t) updateMove(t)
}

function updateMove(t: Touch) {
  let dx = t.clientX - moveOrigin.x
  let dy = t.clientY - moveOrigin.y
  const len = Math.hypot(dx, dy)
  if (len > STICK_RADIUS) {
    dx = (dx / len) * STICK_RADIUS
    dy = (dy / len) * STICK_RADIUS
  }
  knob.value = { x: dx, y: dy }
  // Game axes: +x = strafe right, +y = forward (screen-up is negative dy).
  props.input?.setVirtualMove(dx / STICK_RADIUS, -dy / STICK_RADIUS)
}

function onMoveEnd(e: TouchEvent) {
  if (moveTouchId.value === null) return
  // Only end if the tracked finger lifted.
  if (touchById(e.touches, moveTouchId.value)) return
  moveTouchId.value = null
  knob.value = { x: 0, y: 0 }
  props.input?.setVirtualMove(0, 0)
}

// --- Look drag ---
const LOOK_SCALE = 1.3
const lookTouchId = ref<number | null>(null)
const lookLast = { x: 0, y: 0 }

function onLookStart(e: TouchEvent) {
  if (lookTouchId.value !== null) return
  const t = e.changedTouches[0]
  lookTouchId.value = t.identifier
  lookLast.x = t.clientX
  lookLast.y = t.clientY
}

function onLookMove(e: TouchEvent) {
  if (lookTouchId.value === null) return
  const t = touchById(e.touches, lookTouchId.value)
  if (!t) return
  const dx = t.clientX - lookLast.x
  const dy = t.clientY - lookLast.y
  lookLast.x = t.clientX
  lookLast.y = t.clientY
  props.input?.addVirtualLook(dx * LOOK_SCALE, dy * LOOK_SCALE)
}

function onLookEnd(e: TouchEvent) {
  if (lookTouchId.value === null) return
  if (touchById(e.touches, lookTouchId.value)) return
  lookTouchId.value = null
}

// --- Action buttons ---
function press(name: VirtualButton) {
  props.input?.setVirtualButton(name, true)
}
function release(name: VirtualButton) {
  props.input?.setVirtualButton(name, false)
}

// Story "Interact": fire a real E keydown/keyup so the page's quest-giver
// handler (window keydown 'KeyE') and the in-engine E action both respond.
function dispatchKey(type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code: 'KeyE', key: 'e', bubbles: true }))
}
function onInteractDown() {
  dispatchKey('keydown')
}
function onInteractUp() {
  dispatchKey('keyup')
}

// Safety: if the input target swaps or the component unmounts, drop all held input.
watch(() => props.input, (_next, prev) => prev?.clearVirtualInput())
onUnmounted(() => props.input?.clearVirtualInput())
</script>

<style scoped>
.touch-controls {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none; /* only the control zones below capture touches */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

/* Look zone covers the right ~62% so the left thumb owns movement. */
.tc-look-zone {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 38%;
  pointer-events: auto;
  touch-action: none;
}

.tc-move-zone {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40%;
  height: 55%;
  pointer-events: auto;
  touch-action: none;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0 0 max(22px, env(safe-area-inset-bottom)) max(22px, env(safe-area-inset-left));
}

.tc-stick-base {
  position: relative;
  width: 124px;
  height: 124px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.28);
  background: rgba(20, 26, 40, 0.32);
  transition: background 0.15s, border-color 0.15s;
}
.tc-stick-base.active {
  background: rgba(40, 60, 100, 0.42);
  border-color: rgba(255, 213, 79, 0.55);
}
.tc-stick-knob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
  border-radius: 50%;
  background: rgba(210, 224, 255, 0.55);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.tc-actions {
  position: absolute;
  right: max(22px, env(safe-area-inset-right));
  bottom: max(22px, env(safe-area-inset-bottom));
  width: 200px;
  height: 200px;
  pointer-events: none;
}
.tc-btn {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(30, 41, 59, 0.55);
  color: #e8eefc;
  font-size: 1.25rem;
  font-weight: 700;
  pointer-events: auto;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
.tc-btn:active {
  background: rgba(59, 130, 246, 0.6);
  transform: scale(0.94);
}
/* Cluster: two fire buttons up top, utility row below. */
.tc-btn.fire-r { right: 0; bottom: 96px; width: 76px; height: 76px; background: rgba(194, 54, 47, 0.55); }
.tc-btn.fire-l { right: 92px; bottom: 70px; background: rgba(194, 54, 47, 0.42); }
.tc-btn.jump { right: 8px; bottom: 8px; }
.tc-btn.dash { right: 84px; bottom: 0; }
.tc-btn.interact,
.tc-btn.ability { right: 150px; bottom: 36px; background: rgba(216, 163, 43, 0.5); }
.tc-btn.rack { right: 150px; bottom: 108px; background: rgba(72, 148, 194, 0.5); }
</style>
