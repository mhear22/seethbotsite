import { defineComponent } from 'vue'

export const ControlButtons = defineComponent({
  template: `
    <div>
      <button class="rankings-toggle" @click="$emit('toggle-rankings')" title="Toggle rankings">👻</button>
      <button class="dark-toggle" @click="$emit('toggle-dark')" :title="darkMode ? 'Light mode' : 'Dark mode'">
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
      <button class="music-control" @click="$emit('toggle-music')" :title="musicPlaying ? 'Pause music' : 'Play music'">
        {{ musicPlaying ? '⏸️' : '🎵' }}
      </button>
      <button class="feed-toggle" @click="$emit('toggle-feed')" title="Toggle feeds">📰</button>
      <button class="mika-btn" @click="$emit('toggle-mika')">🌸 Mika</button>
    </div>
  `,
  props: {
    darkMode: {
      type: Boolean,
      default: false
    },
    musicPlaying: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-rankings', 'toggle-dark', 'toggle-music', 'toggle-feed', 'toggle-mika']
});
