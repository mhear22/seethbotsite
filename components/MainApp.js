export const MainApp = {
  template: `
    <div>
      <!-- Animated background circles -->
      <div class="bg-circle"></div>
      <div class="bg-circle"></div>
      <div class="bg-circle"></div>

      <!-- Quote Section -->
      <QuoteSection :current-quote="currentQuote" @next-quote="nextQuote" />

      <!-- Rankings Panel -->
      <RankingsPanel
        :is-open="rankingsOpen"
        :rankings="rankings"
        @toggle="toggleRankings"
      />

      <!-- Cat Panel -->
      <CatPanel
        :is-open="catOpen"
        :cat-image="currentCatImage"
        @toggle="toggleCat"
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
          <button class="cute-btn" @click="onTurnMe">Turn me into a girl!</button>
          <button class="cute-btn" @click="nextQuote" style="background: linear-gradient(45deg, #90EE90, #32CD32);">💬 New Quote</button>
        </div>
      </div>

      <!-- Control buttons -->
      <div>
        <button class="rankings-toggle" @click="toggleRankings" title="Toggle rankings">👻</button>
        <button class="dark-toggle" @click="toggleDarkMode" :title="darkMode ? 'Light mode' : 'Dark mode'">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
        <button class="music-control" @click="toggleMusic" :title="musicPlaying ? 'Pause music' : 'Play music'">
          {{ musicPlaying ? '⏸️' : '🎵' }}
        </button>
        <button class="feed-toggle" @click="toggleFeed" title="Toggle feeds">📰</button>
        <button class="mika-btn" @click="openMikaModal">🌸 Mika</button>
      </div>

      <!-- Feed panel -->
      <FeedPanel :is-open="feedOpen" @toggle="toggleFeed" />

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
    feedOpen: {
      type: Boolean,
      default: false
    },
    rankingsOpen: {
      type: Boolean,
      default: true
    },
    catOpen: {
      type: Boolean,
      default: true
    },
    mikaModalOpen: {
      type: Boolean,
      default: false
    },
    confirmationOpen: {
      type: Boolean,
      default: false
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
    }
  },
  emits: [
    'toggle-dark-mode',
    'toggle-music',
    'toggle-feed',
    'toggle-rankings',
    'toggle-cat',
    'toggle-mika',
    'close-mika',
    'next-quote',
    'new-cat',
    'fart',
    'turn-me',
    'close-confirmation'
  ],
  methods: {
    toggleDarkMode() {
      this.$emit('toggle-dark-mode');
    },
    toggleMusic() {
      this.$emit('toggle-music');
    },
    toggleFeed() {
      this.$emit('toggle-feed');
    },
    toggleRankings() {
      this.$emit('toggle-rankings');
    },
    toggleCat() {
      this.$emit('toggle-cat');
    },
    openMikaModal() {
      this.$emit('toggle-mika');
    },
    closeMikaModal() {
      this.$emit('close-mika');
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
    closeConfirmation() {
      this.$emit('close-confirmation');
    }
  }
};
