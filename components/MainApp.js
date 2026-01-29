export const MainApp = {
  template: `
    <div class="main-app">
      <!-- Router Navigation -->
      <Router :current-route="currentRoute" @route-change="onRouteChange" />

      <!-- Page Content -->
      <div class="page-content">
        <!-- HOME PAGE -->
        <div v-if="currentRoute === 'home'" class="page home-page">
          <!-- Animated background circles -->
          <div class="bg-circle"></div>
          <div class="bg-circle"></div>
          <div class="bg-circle"></div>

          <!-- Quote Section -->
          <QuoteSection :current-quote="currentQuote" @next-quote="nextQuote" />

          <!-- Rankings Panel -->
          <RankingsPanel
            :is-open="panels.rankings"
            :rankings="rankings"
            @toggle="togglePanel('rankings')"
          />

          <!-- Cat Panel -->
          <CatPanel
            :is-open="panels.cat"
            :cat-image="currentCatImage"
            @toggle="togglePanel('cat')"
            @new-cat="nextCat"
          />

          <!-- Tachometer -->
          <Tachometer
            :value="tachValue"
            :needle-angle="needleAngle"
            :clicked="fartClicked"
            :exploded="fartExploded"
            @fart="onFart"
          />

          <!-- Main container -->
          <div class="container">
            <div class="sparkles">✨</div>
            <div class="sparkles">✨</div>
            <div class="sparkles">✨</div>
            <div class="sparkles">✨</div>

            <!-- EmulatorJS Player -->
            <div class="emulator-container">
              <div class="emulator-screen"></div>
              <div class="emulator-buttons">
                <div class="emulator-label">Game Boy Controls</div>
                <button class="emulator-btn">▲</button>
                <button class="emulator-btn">◄</button>
                <button class="emulator-btn">►</button>
                <button class="emulator-btn">▼</button>
                <div class="emulator-screen-off">LOADING...</div>
              </div>
              <iframe class="emulator-frame"></iframe>
            </div>

            <div class="emoji">🌸</div>
            <h1>mald.mikahear.es</h1>
            <p>Welcome to this cute little corner of internet!</p>
            <p>✨ Stay a while ✨</p>
            <div class="button-row">
              <button class="cute-btn turn-me-btn" @click="onTurnMe">Turn me into a girl!</button>
              <button class="cute-btn" @click="nextQuote" style="background: linear-gradient(45deg, #90EE90, #32CD32);">💬 New Quote</button>
            </div>
          </div>
        </div>

        <!-- GIRL MODE PAGE -->
        <div v-if="currentRoute === 'girl'" class="page girl-page">
          <GirlModePage :dark-mode="darkMode" @back="onRouteChange('home')" />
        </div>

        <!-- ABOUT PAGE -->
        <div v-if="currentRoute === 'about'" class="page about-page">
          <div class="about-container">
            <div class="emoji">ℹ️</div>
            <h1>About This Site</h1>
            <p>This is a Vue.js-powered interactive website!</p>
            <p>Features:</p>
            <ul>
              <li>🎀 Dark mode toggle</li>
              <li>🎵 Music player</li>
              <li>📺 Live feeds</li>
              <li>👻 Coolness rankings</li>
              <li>🐱 Random cats</li>
              <li>💨 Mold meter</li>
              <li>🌸 Girl mode</li>
            </ul>
            <button class="cute-btn" @click="onRouteChange('home')">← Back Home</button>
          </div>
        </div>

        <!-- Control buttons -->
        <div class="control-buttons-container">
          <button class="rankings-toggle" @click="togglePanel('rankings')" title="Toggle rankings">👻</button>
          <button class="dark-toggle" @click="toggleDarkMode" :title="darkMode ? 'Light mode' : 'Dark mode'">
            {{ darkMode ? '☀️' : '🌙' }}
          </button>
          <button class="music-control" @click="toggleMusic" :title="musicPlaying ? 'Pause music' : 'Play music'">
            {{ musicPlaying ? '⏸️' : '🎵' }}
          </button>
          <button class="feed-toggle" @click="togglePanel('feed')" title="Toggle feeds">📰</button>
          <button class="mika-btn" @click="openMikaModal">🌸 Mika</button>
        </div>
      </div>

      <!-- Feed panel -->
      <FeedPanel :is-open="panels.feed" @toggle="togglePanel('feed')" />

      <!-- Mika Modal -->
      <MikaModal :is-open="mikaModalOpen" @close="closeMikaModal" />

      <!-- Confirmation overlay -->
      <ConfirmationModal :is-open="confirmationOpen" @close="closeConfirmation" />

      <!-- Audio -->
      <audio id="fartSound" src="fart-with-reverb.mp3" preload="auto"></audio>
      <audio id="newMusic" src="button-sound.mp3" preload="auto"></audio>
    </div>
  `,
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
    needleAngle: {
      type: Number,
      default: 0
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
      type: Array,
      required: true
    },
    panels: {
      type: Object,
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
    'confirmation-close',
    'next-quote',
    'new-cat',
    'fart',
    'turn-me'
  ],
  methods: {
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
    },
    toggleMusic() {
      this.$emit('toggle-music');
    },
    togglePanel(panelName) {
      this.$emit('toggle-panel', panelName);
    },
    onRouteChange(route) {
      this.$emit('route-change', route);
    },
    nextQuote() {
      this.$emit('next-quote');
    },
    nextCat() {
      this.$emit('new-cat');
    },
    onFart() {
      this.$emit('fart');
    },
    onTurnMe() {
      this.$emit('turn-me');
    },
    openMikaModal() {
      // Show confirmation instead
      this.$emit('confirmation-open');
    },
    closeMikaModal() {
      this.$emit('mika-close');
    },
    closeConfirmation() {
      this.$emit('confirmation-close');
    }
  }
};
