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
  useAbility: boolean  // E key (rack ability)
  mouseX: number
  mouseY: number
}

/** Virtual action buttons a touch/gamepad overlay can drive. */
export type VirtualButton = 'shootLeft' | 'shootRight' | 'jump' | 'dash' | 'useAbility'

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
