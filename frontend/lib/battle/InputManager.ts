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

export class InputManager {
  private keys: Map<string, boolean> = new Map()
  private mouseButtons: Map<number, boolean> = new Map()
  private mouseMovement = { x: 0.0, y: 0.0 }
  private mouseAccumulator = { x: 0.0, y: 0.0 } // Accumulated raw movement
  private canvas: HTMLCanvasElement
  private keyBindings: {
    forward: string
    backward: string
    left: string
    right: string
    jump: string
    dash: string
  }

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
    this.setupListeners()
  }

  private setupListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true)
      // Prevent space from scrolling page
      if (e.code === 'Space') {
        e.preventDefault()
      }
    })

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false)
    })

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.set(e.button, true)
      // Request pointer lock for FPS-style mouse control
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock()
      }
    })

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons.set(e.button, false)
    })

    this.canvas.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        // Accumulate raw movement values (integers from browser)
        this.mouseAccumulator.x += e.movementX
        this.mouseAccumulator.y += e.movementY
      }
    })

    // Pointer lock change
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) {
        // Pointer lock lost - stop shooting
        this.mouseButtons.set(0, false)
      }
    })
  }

  getInputState(): InputState {
    // Transfer accumulated movement to current frame
    this.mouseMovement.x = this.mouseAccumulator.x
    this.mouseMovement.y = this.mouseAccumulator.y

    return {
      forward: this.keys.get(this.keyBindings.forward) || false,
      backward: this.keys.get(this.keyBindings.backward) || false,
      left: this.keys.get(this.keyBindings.left) || false,
      right: this.keys.get(this.keyBindings.right) || false,
      jump: this.keys.get(this.keyBindings.jump) || false,
      shootLeft: this.mouseButtons.get(2) || false,  // Right mouse button
      shootRight: this.mouseButtons.get(0) || false, // Left mouse button
      dash: this.keys.get(this.keyBindings.dash) || this.keys.get('ShiftRight') || false,
      useAbility: this.keys.get('KeyE') || false,
      mouseX: this.mouseMovement.x,
      mouseY: this.mouseMovement.y
    }
  }

  resetMouseMovement() {
    // Reset the accumulator for next frame
    this.mouseAccumulator = { x: 0, y: 0 }
    this.mouseMovement = { x: 0, y: 0 }
  }

  cleanup() {
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
