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
