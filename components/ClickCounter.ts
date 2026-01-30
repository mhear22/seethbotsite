import { defineComponent } from 'vue'

interface ClickData {
  count: number
  timestamp: string
}

export const ClickCounter = defineComponent({
  template: `
    <div class="click-counter">
      <div class="counter-header">
        <h3>🖱️ Click Counter</h3>
      </div>
      <div class="counter-content">
        <div class="click-count">{{ count }}</div>
        <button 
          class="click-btn" 
          @click="incrementClick"
          :disabled="loading"
          :class="{ clicking: isClicking }"
        >
          {{ loading ? '...' : 'CLICK ME!' }}
        </button>
        <div class="click-info">
          <span v-if="lastUpdate">Last click: {{ formatTime(lastUpdate) }}</span>
        </div>
      </div>
    </div>
  `,
  props: {
    apiUrl: {
      type: String,
      default: '/api/clicks'
    }
  },
  data() {
    return {
      count: 0,
      loading: false,
      isClicking: false,
      lastUpdate: null as Date | null
    }
  },
  methods: {
    async fetchCount() {
      try {
        const response = await fetch(this.apiUrl)
        const data = await response.json() as ClickData
        this.count = data.count
        this.lastUpdate = new Date(data.timestamp)
      } catch (error) {
        console.error('Error fetching click count:', error)
      }
    },
    async incrementClick() {
      if (this.loading) return
      
      this.loading = true
      this.isClicking = true
      
      try {
        const response = await fetch(`${this.apiUrl}/increment`, {
          method: 'POST'
        })
        const data = await response.json() as ClickData
        this.count = data.count
        this.lastUpdate = new Date(data.timestamp)
        
        setTimeout(() => {
          this.isClicking = false
        }, 100)
      } catch (error) {
        console.error('Error incrementing click:', error)
      } finally {
        this.loading = false
      }
    },
    formatTime(date: Date): string {
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      if (diff < 1000) return 'just now'
      if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      return date.toLocaleTimeString()
    }
  },
  mounted() {
    this.fetchCount()
    setInterval(() => this.fetchCount(), 5000)
  }
})
