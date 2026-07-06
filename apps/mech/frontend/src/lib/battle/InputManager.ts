// Input management for battle controls
export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  shootLeft: boolean   // Right mouse button (fires left arm)
  shootRight: boolean  // Left mouse button (fires right arm)
  dash: boolean
  useAbility: boolean       // E key (boost — the 3× sprint / thrust pool)
  useRackAbility: boolean   // Q key (rack ability: smoke / repair / shield / etc.)
  mouseX: number
  mouseY: number
}

/** Virtual action buttons a touch/gamepad overlay can drive. */
export type VirtualButton = 'shootLeft' | 'shootRight' | 'jump' | 'dash' | 'useAbility' | 'useRackAbility'

export class InputManager {
  private keys: Map<string, boolean> = new Map()
  private mouseButtons: Map<number, boolean> = new Map()
  private mouseMovement = { x: 0.0, y: 0.0 }
  private mouseAccumulator = { x: 0.0, y: 0.0 } // Accumulated raw movement

  // --- Virtual input (on-screen touch controls / gamepad) ---
  // These default to neutral so on desktop, where nothing drives them, the
  // physical keyboard/mouse/pointer-lock path is completely unchanged.
  private virtualMove = { x: 0, y: 0 }      // joystick vector: x = strafe (+right), y = +forward
  private virtualLook = { x: 0, y: 0 }      // look delta accumulated this frame (no pointer lock needed)
  private virtualButtons: Map<VirtualButton, boolean> = new Map()
  private static readonly MOVE_DEADZONE = 0.35

  private canvas: HTMLCanvasElement
  /**
   * When false the manager stops reading keyboard/mouse input AND will not
   * re-acquire pointer lock on click — used while a UI menu/overlay is open so
   * the cursor stays free to click menu items. Re-enable with setInteractive(true).
   */
  private interactive = true
  private keyBindings: {
    forward: string
    backward: string
    left: string
    right: string
    jump: string
    dash: string
  }

  // Store bound handlers for cleanup
  private handleKeyDown: (e: KeyboardEvent) => void
  private handleKeyUp: (e: KeyboardEvent) => void
  private handleMouseDown: (e: MouseEvent) => void
  private handleMouseUp: (e: MouseEvent) => void
  private handleMouseMove: (e: MouseEvent) => void
  private handlePointerLockChange: () => void

  constructor(canvas: HTMLCanvasElement, keyBindings?: {
    forward: string
    backward: string
    left: string
    right: string
    jump: string
    dash: string
  }) {
    this.canvas = canvas
    this.keyBindings = keyBindings ?? {
      forward: 'KeyW',
      backward: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
      jump: 'Space',
      dash: 'ShiftLeft'
    }

    // Create bound handlers
    this.handleKeyDown = (e: KeyboardEvent) => {
      this.keys.set(e.code, true)
      if (e.code === 'Space') e.preventDefault()
    }
    this.handleKeyUp = (e: KeyboardEvent) => {
      this.keys.set(e.code, false)
    }
    this.handleMouseDown = (e: MouseEvent) => {
      // While a menu/overlay is open, leave the cursor free so it can click
      // menu items — don't capture the button or re-acquire pointer lock.
      if (!this.interactive) return
      this.mouseButtons.set(e.button, true)
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock()
      }
    }
    this.handleMouseUp = (e: MouseEvent) => {
      this.mouseButtons.set(e.button, false)
    }
    this.handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === this.canvas) {
        this.mouseAccumulator.x += e.movementX
        this.mouseAccumulator.y += e.movementY
      }
    }
    this.handlePointerLockChange = () => {
      if (document.pointerLockElement !== this.canvas) {
        this.mouseButtons.set(0, false)
      }
    }

    this.setupListeners()
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('pointerlockchange', this.handlePointerLockChange)
  }

  getInputState(): InputState {
    // While a menu/overlay is open, report fully-neutral input so the world
    // (movement, firing, mouse-look) ignores keys/mouse held during the menu.
    if (!this.interactive) {
      return {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        shootLeft: false,
        shootRight: false,
        dash: false,
        useAbility: false,
        useRackAbility: false,
        mouseX: 0,
        mouseY: 0,
      }
    }

    // Transfer accumulated movement to current frame
    this.mouseMovement.x = this.mouseAccumulator.x
    this.mouseMovement.y = this.mouseAccumulator.y

    const dz = InputManager.MOVE_DEADZONE
    const vm = this.virtualMove
    const vb = this.virtualButtons

    return {
      // Physical key OR virtual joystick past the deadzone.
      forward: this.keys.get(this.keyBindings.forward) || vm.y > dz || false,
      backward: this.keys.get(this.keyBindings.backward) || vm.y < -dz || false,
      left: this.keys.get(this.keyBindings.left) || vm.x < -dz || false,
      right: this.keys.get(this.keyBindings.right) || vm.x > dz || false,
      jump: this.keys.get(this.keyBindings.jump) || vb.get('jump') || false,
      shootLeft: this.mouseButtons.get(2) || vb.get('shootLeft') || false,  // Right mouse button
      shootRight: this.mouseButtons.get(0) || vb.get('shootRight') || false, // Left mouse button
      dash: this.keys.get(this.keyBindings.dash) || this.keys.get('ShiftRight') || vb.get('dash') || false,
      useAbility: this.keys.get('KeyE') || vb.get('useAbility') || false,
      // Rack ability is a SEPARATE verb from boost (E) so holding boost never
      // auto-dumps smoke/repair/shield the instant they leave cooldown.
      useRackAbility: this.keys.get('KeyQ') || vb.get('useRackAbility') || false,
      // Mouse look (under pointer lock) PLUS virtual look (touch drag, no lock needed).
      mouseX: this.mouseMovement.x + this.virtualLook.x,
      mouseY: this.mouseMovement.y + this.virtualLook.y
    }
  }

  resetMouseMovement() {
    // Reset the accumulator for next frame
    this.mouseAccumulator = { x: 0, y: 0 }
    this.mouseMovement = { x: 0, y: 0 }
    // Virtual look is a per-frame delta — consume it too.
    this.virtualLook = { x: 0, y: 0 }
  }

  // --- Virtual input API (driven by an on-screen touch overlay) ------------

  /** Set the movement joystick vector. x = strafe (+right), y = +forward. Clamped to [-1, 1]. */
  setVirtualMove(x: number, y: number) {
    this.virtualMove.x = Math.max(-1, Math.min(1, x))
    this.virtualMove.y = Math.max(-1, Math.min(1, y))
  }

  /** Add a look delta this frame (equivalent to mouse movementX/Y; no pointer lock required). */
  addVirtualLook(dx: number, dy: number) {
    this.virtualLook.x += dx
    this.virtualLook.y += dy
  }

  /** Hold/release a virtual action button (fire, jump, dash, ability). */
  setVirtualButton(name: VirtualButton, down: boolean) {
    this.virtualButtons.set(name, down)
  }

  /** Release all virtual input (e.g. when the overlay unmounts or loses focus). */
  clearVirtualInput() {
    this.virtualMove = { x: 0, y: 0 }
    this.virtualLook = { x: 0, y: 0 }
    this.virtualButtons.clear()
  }

  /**
   * Enable/disable input capture. When disabled the manager reports neutral
   * input, ignores held keys/mouse, releases pointer lock, and will NOT
   * re-acquire it on click — so an open menu's cursor stays free. Re-enabling
   * does not auto-lock: the player must click the canvas to re-engage mouse-look.
   */
  setInteractive(interactive: boolean) {
    this.interactive = interactive
    if (!interactive) {
      // Drop any held buttons/keys and free the cursor for the menu.
      this.mouseButtons.clear()
      this.keys.clear()
      this.resetMouseMovement()
      if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock()
      }
    }
  }

  isInteractive(): boolean {
    return this.interactive
  }

  cleanup() {
    // Remove all event listeners
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.canvas.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas.removeEventListener('mouseup', this.handleMouseUp)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange)

    // Release pointer lock
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock()
    }
    // Clear all input states
    this.keys.clear()
    this.mouseButtons.clear()
    this.mouseMovement = { x: 0, y: 0 }
    this.mouseAccumulator = { x: 0, y: 0 }
  }
}
