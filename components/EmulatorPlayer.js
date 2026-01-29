export const EmulatorPlayer = {
  template: `
    <div class="emulator-container">
      <div class="emulator-box">
        <div class="emulator-screen">
          <canvas ref="screenCanvas" width="240" height="216"></canvas>
          <div v-if="!gameRunning" class="emulator-overlay">
            <div class="emulator-title">POKEMON EMERALD</div>
            <div class="emulator-start-btn" @click="startGame">▶ START</div>
          </div>
        </div>
        <div class="emulator-controls">
          <div class="d-pad">
            <button class="dpad-btn dpad-up" @click="movePlayer('up')" title="Up">▲</button>
            <div class="dpad-middle">
              <button class="dpad-btn dpad-left" @click="movePlayer('left')" title="Left">◄</button>
              <button class="dpad-btn dpad-down" @click="movePlayer('down')" title="Down">▼</button>
              <button class="dpad-btn dpad-right" @click="movePlayer('right')" title="Right">►</button>
            </div>
          </div>
          <div class="action-buttons">
            <button class="action-btn btn-a" @click="pressAction('A')">A</button>
            <button class="action-btn btn-b" @click="pressAction('B')">B</button>
          </div>
        </div>
      </div>
      <div class="emulator-label">Game Boy Emulator</div>
    </div>
  `,
  data() {
    return {
      gameRunning: false,
      playerX: 120,
      playerY: 108,
      facing: 'right',
      pixelBuffer: new Uint8Array(160 * 144)
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.screenCanvas;
      if (canvas) {
        this.ctx = canvas.getContext('2d');
        this.clearScreen();
      }
    },
    clearScreen() {
      if (this.ctx) {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 240, 216);
      }
    },
    startGame() {
      this.gameRunning = true;
      this.drawGameScreen();
    },
    movePlayer(direction) {
      if (!this.gameRunning) return;

      const step = 4;
      switch (direction) {
        case 'up':
          this.playerY = Math.max(8, this.playerY - step);
          break;
        case 'down':
          this.playerY = Math.min(200, this.playerY + step);
          break;
        case 'left':
          this.playerX = Math.max(8, this.playerX - step);
          this.facing = 'left';
          break;
        case 'right':
          this.playerX = Math.min(224, this.playerX + step);
          this.facing = 'right';
          break;
      }
      this.drawGameScreen();
    },
    pressAction(button) {
      console.log(`Button pressed: ${button}`);
      // Visual feedback
      this.drawGameScreen();
    },
    drawGameScreen() {
      if (!this.ctx) return;

      this.clearScreen();

      // Draw title screen or game
      if (!this.gameRunning) {
        this.ctx.fillStyle = '#ff3333';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('POKEMON EMERALD', 120, 88);
        this.ctx.font = '12px Courier New';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Press START to play', 120, 140);
      } else {
        // Simple game scene
        this.ctx.fillStyle = '#2d5a27';
        this.ctx.fillRect(0, 0, 240, 216);

        // Draw grass
        this.ctx.fillStyle = '#4a8f3c';
        for (let i = 0; i < 20; i++) {
          const x = (i * 37) % 240;
          const y = 160 + Math.floor(i / 6) * 8;
          this.ctx.fillRect(x, y, 24, 6);
        }

        // Draw player (simple sprite)
        const playerColor = this.facing === 'right' ? '#ff0000' : '#0000ff';
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(this.playerX, this.playerY, 16, 16);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.playerX + 4, this.playerY + 4, 8, 8);

        // Draw stats
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 80, 12);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`X: ${this.playerX} Y: ${this.playerY}`, 4, 9);
      }
    }
  },
  watch: {
    playerX() {
      if (this.gameRunning) this.drawGameScreen();
    },
    playerY() {
      if (this.gameRunning) this.drawGameScreen();
    }
  }
};
