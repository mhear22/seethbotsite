import { defineComponent } from 'vue'

export const ConfirmationModal = defineComponent({
  template: `
    <div class="confirmation" :class="{ active: isOpen }" @click.self="close">
      <div class="confirmation-box">
        <div class="emoji">💕</div>
        <h1>So you want to be a girl?</h1>
        <p>You could totally be a girl if you wanted. No matter who you are or what you've been through, don't let anything stop you from living as your best self!</p>
        <p>✨ You are valid no matter who you are ✨</p>
        <div class="button-row">
          <button class="cute-btn" @click="close">Go back</button>
          <button class="cute-btn" @click="confirm" style="background: linear-gradient(45deg, #ff6b9d, #ff8a80);">Yes! Turn me into a girl! 💕</button>
        </div>
      </div>
    </div>
  `,
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'confirm'],
  methods: {
    close() {
      this.$emit('close');
    },
    confirm() {
      this.$emit('confirm');
    }
  }
});
