import { defineComponent } from 'vue'

export const Tachometer = defineComponent({
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
      validator: (v: number) => v >= 0 && v <= 100
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
    needleAngle(): number {
      const clampedValue = Math.max(0, Math.min(100, this.value))
      return 225 + (clampedValue * 0.9)
    },
    needleStyle(): { transform: string } {
      return {
        transform: `rotate(${this.needleAngle}deg)`
      }
    }
  },
  methods: {
    onFart() {
      this.$emit('fart')
    }
  }
})
