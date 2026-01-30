import { defineComponent } from 'vue'

export const FeedPanel = defineComponent({
  template: `
    <div class="feed-panel" :class="{ collapsed: !isOpen }">
      <div class="feed-header">
        <h3>☁️ Live Feeds</h3>
        <button class="feed-close" @click="toggle">✕</button>
      </div>
      <div class="feed-content">
        <div class="feed-section">
          <h4>🐦 Brisbane Radar</h4>
          <p>Live weather radar for Brisbane area</p>
          <iframe src="https://www.bom.gov.au/products/IDR064.loop.gif"></iframe>
        </div>
        <div class="feed-section">
          <h4>🚂 Subway Surfers (YT)</h4>
          <p>Autoplay gameplay video</p>
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"></iframe>
        </div>
        <div class="feed-section">
          <h4>🐦 BOM Queensland (X)</h4>
          <p>Latest weather alerts from Bureau of Meteorology</p>
          <a href="https://x.com/BOM_Qld" target="_blank" style="color: #666; font-size: 12px; display: block; margin-top: 5px;">@BOM_Qld on X/Twitter →</a>
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
  emits: ['toggle'],
  methods: {
    toggle() {
      this.$emit('toggle');
    }
  }
});
