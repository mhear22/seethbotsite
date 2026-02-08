// Input management for battle controls
export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  shoot: boolean
  mouseX: number
  mouseY: number
}

export class InputManager {
  private keys: Map<string, boolean> = new Map()
  private mouseButtons: Map<number, boolean> = new Map()
  private mouseMovement = { x: 0, y: 0 }
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
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
        this.mouseMovement.x += e.movementX
        this.mouseMovement.y += e.movementY
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
    return {
      forward: this.keys.get('KeyW') || false,
      backward: this.keys.get('KeyS') || false,
      left: this.keys.get('KeyA') || false,
      right: this.keys.get('KeyD') || false,
      jump: this.keys.get('Space') || false,
      shoot: this.mouseButtons.get(0) || false, // Left mouse button
      mouseX: this.mouseMovement.x,
      mouseY: this.mouseMovement.y
    }
  }

  resetMouseMovement() {
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
  }
}
