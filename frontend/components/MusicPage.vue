<script setup lang="ts">
import { useAppStore } from '../stores/useAppStore'

const appStore = useAppStore()

const strudelUrl = 'https://strudel.cc/#CnNldENwbSgxMjAvNCkKCmxldCBzY2FsZXMgPSAiZjptaW5vciIKCiQ6IHMoInNiZCIpLnN0cnVjdCgieCB%2BIHggeCoyIikucm9vbSgiMSAwLjIhMyIpLnB1bmNoY2FyZCgpCiQ6IHMoIn4gW3NkIFtoaCA8aGggb2g%2BXV0gfiB%2BIikKJDogcygifiB%2BIFt%2BIDx%2BIGNwIGNwIGNwKjI%2BXSB%2BIikKJDogcygid2hpdGUiKS5zdHJ1Y3QoIlt%2BIHhdKjw0IFs0IDhdPiIpLnN1cygwKS5kZWMoLjAyKQokOiBzKCJbfiBsdF0gWzxodCBtdD4gbHRdIGx0KjwxIDI%2BIH4iKQoKJDogbigiWzAgPDIgNCA8NiA3Pi8yPl0qOCIuc3ViKDcpLmFkZCgiPDAgMyAxIFs1IDRdPi8yIikpLnNjYWxlKHNjYWxlcykuc291bmQoInNxciwgc2F3IikubHBmKDQwMCkubHBxKDgpLmxwZW52KC0xMCkubHBhKDAuMSkucHVuY2hjYXJkKCkKCiQ6IG4oIjAgMCA8WzAgMl0gMD4gW34gMF0gMyA8MyB%2BPiA8fiA1PiA1IFt%2BIDBdIDMgW34gMF0gNSBbfiBbMHwwKjJdXSAzQDIgNiIuYWRkKCI8NyBbNyA5XT4vMiIpKS5zbG93KDIpLnNjYWxlKHNjYWxlcykucygiZ21fY2VsZXN0YSwgdHJpIikuZGVsYXkoLjMpLmNsaXAoLjkpLnJlbCguMSkKCg%3D%3D'
</script>

<template>
  <div class="music-page" :class="{ dark: appStore.darkMode }">
    <div class="music-header">
      <h1>🎵 Music</h1>
      <p class="subtitle">Strudel - Live Coding Music</p>
    </div>

    <div class="music-container">
      <div class="strudel-wrapper">
        <div class="strudel-frame">
          <iframe
            :src="strudelUrl"
            width="100%"
            height="400"
            frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media"
            allowfullscreen
            title="Strudel Live Coding"
          ></iframe>
        </div>

        <div class="music-info">
          <h3>About Strudel</h3>
          <p>
            Strudel is a live coding environment for creating music using simple patterns.
            It's inspired by Tidal Cycles and uses a similar pattern-based approach.
          </p>
          <p class="license-note">
            📜 <strong>Note:</strong> This project uses Strudel under the AGPL-3.0 license.
            Source code must be available upon request.
          </p>
          <div class="music-links">
            <a href="https://strudel.cc" target="_blank" rel="noopener noreferrer" class="music-link">
              🎹 Visit Strudel
            </a>
            <a href="https://strudel.cc/technical-manual/" target="_blank" rel="noopener noreferrer" class="music-link">
              📚 Documentation
            </a>
            <a href="https://github.com/tidalcycles/Strudel" target="_blank" rel="noopener noreferrer" class="music-link">
              💻 GitHub
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>🎵 Click the play button in the Strudel player to start the music</p>
      <p>🔄 You can modify the pattern and experiment with different sounds</p>
    </div>
  </div>
</template>

<style scoped>
.music-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transition: background 0.5s ease;
}

.music-page.dark {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.music-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.music-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.dark .subtitle {
  color: #a0a0a0;
}

.music-container {
  max-width: 1000px;
  margin: 0 auto;
}

.strudel-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark .strudel-wrapper {
  background: rgba(40, 44, 52, 0.95);
}

.strudel-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.strudel-frame {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  background: #1a1a1a;
}

.dark .strudel-frame {
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.music-info {
  text-align: center;
}

.music-info h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 15px;
}

.dark .music-info h3 {
  color: #e2e8f0;
}

.music-info p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.dark .music-info p {
  color: #a0a0a0;
}

.license-note {
  font-size: 0.9rem;
  color: #999;
  padding: 12px;
  background: rgba(255, 107, 157, 0.1);
  border-radius: 8px;
  margin: 15px 0;
}

.dark .license-note {
  background: rgba(255, 182, 193, 0.1);
  color: #888;
}

.music-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
  flex-wrap: wrap;
}

.music-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(45deg, #ff91a4, #ff8a80);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 145, 164, 0.3);
}

.music-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 145, 164, 0.4);
}

.footer-note {
  text-align: center;
  margin-top: 60px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
}

.dark .footer-note {
  background: rgba(40, 44, 52, 0.8);
}

.footer-note p {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0;
}

.dark .footer-note p {
  color: #a0a0a0;
}

@media (max-width: 768px) {
  .music-header h1 {
    font-size: 2rem;
  }

  .strudel-wrapper {
    padding: 20px;
  }

  .strudel-frame iframe {
    height: 300px;
  }

  .music-links {
    flex-direction: column;
    align-items: center;
  }

  .music-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
