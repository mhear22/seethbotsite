export const CatPanel = {
  template: `
    <div class="cat-panel" :class="{ collapsed: !isOpen }">
      <div class="cat-header">
        <h3>🐱 Random Cats</h3>
        <button class="cat-close" @click="toggle">✕</button>
      </div>
      <div class="cat-content">
        <img :src="catImage" class="cat-image" alt="Random cat" />
        <button class="cute-btn" @click="$emit('new-cat')">🔄 New Cat</button>
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
    }
  },
  emits: ['toggle', 'new-cat'],
  methods: {
    toggle() {
      this.$emit('toggle');
    }
  }
};
