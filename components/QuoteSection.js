export const QuoteSection = {
  template: `
    <div class="quote-section">
      <div class="quote-text" @click="nextQuote">"{{ currentQuote }}"</div>
    </div>
  `,
  props: {
    currentQuote: {
      type: String,
      required: true
    }
  },
  emits: ['next-quote'],
  methods: {
    nextQuote() {
      this.$emit('next-quote');
    }
  }
};
