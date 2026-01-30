import { defineComponent } from 'vue'

export const CatPanel = defineComponent({
  template: `
    <div class="cat-panel" :class="{ collapsed: !isOpen }">
      <div class="cat-header">
        <h3>🐱 Random Cats</h3>
        <button class="cat-close" @click="toggle">✕</button>
      </div>
      <div class="cat-content">
        <img v-if="!loading" :src="catImage" class="cat-image" alt="Random cat" />
        <div v-if="loading" class="cat-loading">Loading... 🐱</div>
        <button class="cute-btn" @click="$emit('new-cat')" :disabled="loading">🔄 New Cat</button>
      </div>
    </div>
  `,
  props: {
    isOpen: {
      type: Boolean,
      default: true
    },
    catImage: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle', 'new-cat'],
  methods: {
    toggle() {
      this.$emit('toggle')
    }
  }
});
