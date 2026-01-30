import { defineComponent } from 'vue'
import type { RankingItem } from './MainApp.js'

export const RankingsPanel = defineComponent({
  template: `
    <div class="rankings-panel" :class="{ collapsed: !isOpen }">
      <div class="rankings-header">
        <h3>👻 Coolness Rankings</h3>
        <button class="rankings-close" @click="toggle">✕</button>
      </div>
      <div class="rankings-list">
        <div v-for="(rank, index) in rankings" :key="index" class="rank-item">
          <div class="rank-avatar">{{ rank.avatar }}</div>
          <div class="rank-name" :class="{ 'current-user': rank.isCurrentUser }">{{ rank.name }}</div>
          <div class="rank-score">{{ rank.score }}</div>
          <div class="rank-label">pts</div>
        </div>
      </div>
    </div>
  `,
  props: {
    isOpen: {
      type: Boolean,
      default: true
    },
    rankings: {
      type: Array as () => RankingItem[],
      required: true
    }
  },
  emits: ['toggle'],
  methods: {
    toggle() {
      this.$emit('toggle')
    }
  }
});
