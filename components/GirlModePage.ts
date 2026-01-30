import { defineComponent } from 'vue'

export const GirlModePage = defineComponent({
  template: `
    <div class="girl-mode-container">
      <div class="girl-mode-content">
        <div class="girl-emoji">💕</div>
        <h1>Girl Mode Activated!</h1>
        <p>Welcome to the girl mode experience! 🌸</p>
        <p>This is a special space just for you.</p>
        <div class="girl-features">
          <div class="girl-feature">
            <div class="feature-icon">🎀</div>
            <div class="feature-text">Sparkly Everything</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">💖</div>
            <div class="feature-text">Cute Vibes</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">🌸</div>
            <div class="feature-text">Flower Power</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">🎀</div>
            <div class="feature-text">Rainbow Mode</div>
          </div>
        </div>
        <div class="girl-message">
          <p>You are valid and loved exactly as you are! ✨</p>
          <p>This is your safe space to be yourself.</p>
        </div>
        <button class="cute-btn girl-back-btn" @click="$emit('back')">💕 Go Back</button>
      </div>
    </div>
  `,
  props: {
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['back']
});
