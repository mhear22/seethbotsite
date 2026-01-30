import { defineComponent } from 'vue'
import { QuoteSection } from './QuoteSection.js'
import { RankingsPanel } from './RankingsPanel.js'
import { CatPanel } from './CatPanel.js'
import { Tachometer } from './Tachometer.js'
import { GirlModePage } from './GirlModePage.js'
import { FeedPanel } from './FeedPanel.js'
import { MikaModal } from './MikaModal.js'
import { ClickCounter } from './ClickCounter.js'
import { GenderPicker } from './GenderPicker.js'

export interface RankingItem {
  name: string
  score: number
  avatar: string
  isCurrentUser?: boolean
}

export interface PanelState {
  rankings: boolean
  cat: boolean
  feed: boolean
}

export const MainApp = defineComponent({
  components: {
    QuoteSection,
    RankingsPanel,
    CatPanel,
    Tachometer,
    GirlModePage,
    FeedPanel,
    MikaModal,
    ClickCounter,
    GenderPicker
  },
  props: {
    darkMode: {
      type: Boolean,
      default: false
    },
    musicPlaying: {
      type: Boolean,
      default: false
    },
    currentRoute: {
      type: String,
      default: 'home'
    },
    currentQuote: {
      type: String,
      required: true
    },
    currentCatImage: {
      type: String,
      required: true
    },
    tachValue: {
      type: Number,
      default: 77
    },
    fartClicked: {
      type: Boolean,
      default: false
    },
    fartExploded: {
      type: Boolean,
      default: false
    },
    rankings: {
      type: Array as () => RankingItem[],
      required: true
    },
    panels: {
      type: Object as () => PanelState,
      default: () => ({
        rankings: true,
        cat: true,
        feed: false
      })
    },
    mikaModalOpen: {
      type: Boolean,
      default: false
    },
    confirmationOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'toggle-dark-mode',
    'toggle-music',
    'toggle-panel',
    'route-change',
    'mika-close',
    'close-confirmation',
    'next-quote',
    'new-cat',
    'fart',
    'turn-me'
  ],
  methods: {
    toggleDarkMode() {
      this.$emit('toggle-dark-mode')
    },
    toggleMusic() {
      this.$emit('toggle-music')
    },
    togglePanel(panelName: keyof PanelState) {
      this.$emit('toggle-panel', panelName)
    },
    onRouteChange(route: string) {
      this.$emit('route-change', route)
    },
    nextQuote() {
      this.$emit('next-quote')
    },
    nextCat() {
      this.$emit('new-cat')
    },
    onFart() {
      this.$emit('fart')
    },
    onTurnMe() {
      this.$emit('turn-me')
    },
    openMikaModal() {
      this.$emit('confirmation-open')
    },
    closeMikaModal() {
      this.$emit('mika-close')
    },
    closeConfirmation() {
      this.$emit('close-confirmation')
    },
    goToGirlMode() {
      console.log('Going to girl mode...')
      this.$emit('close-confirmation')
      setTimeout(() => {
        this.$emit('route-change', 'girl')
        console.log('Route change emitted: girl')
      }, 100)
    },
    getTrendClass(index: number) {
      const trends = ['trend-up', 'trend-down', 'trend-same']
      return trends[index % trends.length]
    }
  }
})
