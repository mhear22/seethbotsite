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
  },
  template: `
    <div class="main-app" :class="{ dark: darkMode }">
      <!-- Header Controls -->
      <div class="header-controls">
        <button @click="toggleDarkMode" class="control-btn" :class="{ active: darkMode }">
          {{ darkMode ? '🌙' : '☀️' }}
        </button>
        <button @click="toggleMusic" class="control-btn" :class="{ active: musicPlaying }">
          {{ musicPlaying ? '🔊' : '🔇' }}
        </button>
        <button @click="togglePanel('rankings')" class="control-btn" :class="{ active: panels.rankings }">
          👻
        </button>
        <button @click="togglePanel('cat')" class="control-btn" :class="{ active: panels.cat }">
          🐱
        </button>
        <button @click="togglePanel('feed')" class="control-btn" :class="{ active: panels.feed }">
          📰
        </button>
      </div>

      <!-- Route-specific content -->
      <div class="content-area">
        <!-- Home Page -->
        <div v-if="currentRoute === 'home'" class="page home-page">
          <QuoteSection :quote="currentQuote" @next="nextQuote" />
          <Tachometer :value="tachValue" />
          <ClickCounter @fart="onFart" @turn-me="onTurnMe" />
        </div>

        <!-- Girl Mode Page -->
        <GirlModePage v-else-if="currentRoute === 'girl'" @close="onRouteChange('home')" />

        <!-- Gender Page -->
        <div v-else-if="currentRoute === 'gender'" class="page gender-page">
          <GenderPicker @close="onRouteChange('home')" />
        </div>

        <!-- About Page -->
        <div v-else-if="currentRoute === 'about'" class="page about-page">
          <h1>About</h1>
          <p>This is Mika's cool website! ✨</p>
        </div>

        <!-- Rankings Page -->
        <div v-else-if="currentRoute === 'rankings'" class="page rankings-page">
          <RankingsPanel :rankings="rankings" :get-trend-class="getTrendClass" />
        </div>

        <!-- Cats Page -->
        <div v-else-if="currentRoute === 'cats'" class="page cats-page">
          <CatPanel :cat-image="currentCatImage" :loading="false" @new-cat="nextCat" />
        </div>
      </div>

      <!-- Floating Panels -->
      <!-- Bottom Left Coolness Rankings Panel (Always Visible) -->
      <div v-if="panelOpen.coolnessPanel" class="coolness-panel-bottom-left">
        <div class="coolness-panel-header">
          <span>🏆 Coolness Rankings</span>
          <button @click="togglePanel('coolnessPanel')" class="close-btn">×</button>
        </div>
        <div class="coolness-panel-list">
          <div
            v-for="(person, index) in rankings"
            :key="person.name"
            class="coolness-item"
            :class="{ 'is-current-user': person.isCurrentUser }"
          >
            <span class="rank">{{ index + 1 }}.</span>
            <span class="avatar">{{ person.avatar }}</span>
            <span class="name">{{ person.name }}</span>
            <span class="score">{{ person.score.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <RankingsPanel
        v-if="panels.rankings && currentRoute === 'home'"
        :rankings="rankings"
        :get-trend-class="getTrendClass"
        class="floating-panel rankings-panel"
      />
      <CatPanel
        v-if="panels.cat && currentRoute === 'home'"
        :cat-image="currentCatImage"
        :loading="false"
        @new-cat="nextCat"
        class="floating-panel cat-panel"
      />
      <FeedPanel
        v-if="panels.feed"
        class="floating-panel feed-panel"
        @close="togglePanel('feed')"
      />

      <!-- Modals -->
      <MikaModal
        v-if="mikaModalOpen"
        @close="closeMikaModal"
      />
    </div>

    <!-- Audio elements -->
    <audio id="newMusic" loop>
      <source src="/newMusic.mp3" type="audio/mpeg">
    </audio>
    <audio id="fartSound">
      <source src="/fart-with-reverb.mp3" type="audio/mpeg">
    </audio>

    <style>
      /* Bottom Left Coolness Panel */
      .coolness-panel-bottom-left {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(40, 44, 52, 0.95);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .dark .coolness-panel-bottom-left {
        background: rgba(20, 24, 32, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .coolness-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
        color: #e2e8f0;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #a0aec0;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .coolness-panel-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .coolness-item {
        display: grid;
        grid-template-columns: 24px 24px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-size: 13px;
        transition: background 0.2s;
      }

      .coolness-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .coolness-item.is-current-user {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.4);
      }

      .rank {
        color: #a0aec0;
        font-weight: bold;
      }

      .avatar {
        font-size: 16px;
      }

      .name {
        color: #e2e8f0;
        font-weight: 500;
      }

      .score {
        color: #48bb78;
        font-weight: bold;
        font-size: 12px;
      }

      .dark .score {
        color: #68d391;
      }
    </style>
  `
})
