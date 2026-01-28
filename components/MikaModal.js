export const MikaModal = {
  template: `
    <div class="mika-modal" :class="{ active: isOpen }" @click.self="close">
      <div class="mika-modal-box">
        <div class="emoji">🌸</div>
        <h1>Hi there!</h1>
        <button class="cute-btn" @click="close">Close</button>
      </div>
    </div>
  `,
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
