export const Tachometer = {
  template: `
    <div class="tachometer">
      <div class="tachometer-dial">
        <div class="tachometer-ticks">
          <div class="tick"></div>
          <div class="tick major"></div>
          <div class="tick"></div>
          <div class="tick major"></div>
          <div class="tick"></div>
        </div>
        <div class="tachometer-needle" :style="needleStyle"></div>
        <div class="tachometer-label">🍄 MOLD METER</div>
        <div class="tachometer-value">{{ value }}%</div>
      </div>
      <button class="fart-btn" @click="onFart" :class="{ exploded: exploded }" :disabled="clicked">💨 Fart!</button>
    </div>
  `,
  props: {
    value: {
      type: Number,
      default: 77,
      validator: (v) => v >= 0 && v <= 100
    },
    clicked: {
      type: Boolean,
      default: false
    },
    exploded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['fart'],
  computed: {
    /**
     * Calculate needle angle based on mold percentage.
     * 0% → 225° (bottom left)
     * 50% → 270° (top)
     * 100% → 315° (top right)
     * Arc spans 90° from bottom-left to top-right.
     */
    needleAngle() {
      // Clamp value to 0-100 range
      const clampedValue = Math.max(0, Math.min(100, this.value));
      // Map 0-100 to 225-315 degrees
      return 225 + (clampedValue * 0.9);
    },
    needleStyle() {
      return {
        transform: `rotate(${this.needleAngle}deg)`
      };
    }
  },
  methods: {
    onFart() {
      this.$emit('fart');
    }
  }
};
