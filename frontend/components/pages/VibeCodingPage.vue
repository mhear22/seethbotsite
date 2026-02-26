<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import anthropicLogo from '../../assets/logos/anthropic.svg'
import openaiLogo from '../../assets/logos/openai.svg'
import geminiLogo from '../../assets/logos/gemini.svg'
import zhipuLogo from '../../assets/logos/zhipu.svg'
import googleLogo from '../../assets/logos/google.svg'
import cursorLogo from '../../assets/logos/cursor.svg'
import githubLogo from '../../assets/logos/github.svg'
import ollamaLogo from '../../assets/logos/ollama.png'

const store = useAppStore()

const selectedModel = ref<string>('all')

const models = [
  { id: 'opus', name: 'Claude Opus', icon: '🟣', logo: anthropicLogo, description: 'Most capable Claude model, best for complex tasks' },
  { id: 'sonnet', name: 'Claude Sonnet', icon: '🟣', logo: anthropicLogo, description: 'Balanced Claude model, great for everyday coding' },
  { id: 'glm5', name: 'GLM 5', icon: '🟢', logo: zhipuLogo, description: 'Zhipu AI model, good multimodal capabilities' },
  { id: 'codex', name: 'GPT Codex', icon: '🔵', logo: openaiLogo, description: 'OpenAI coding-focused model' },
  { id: 'gemini', name: 'Gemini', icon: '🔴', logo: geminiLogo, description: 'Google\'s multimodal model' },
  { id: 'local', name: 'Local Models', icon: '🟡', logo: ollamaLogo, description: 'Self-hosted models (Ollama, LM Studio, etc.)' }
]

const cliTools = [
  { 
    id: 'claude-code', 
    name: 'Claude Code', 
    icon: '⚡',
    logo: anthropicLogo,
    description: 'Official Anthropic CLI for Claude models',
    bestModels: ['opus', 'sonnet'],
    worksWith: ['glm5'],
    notes: 'First-class support for Opus/Sonnet. GLM 5 works with configuration tweaks (marked with *)'
  },
  { 
    id: 'opencode', 
    name: 'Opencode', 
    icon: '🔧',
    logo: githubLogo,
    description: 'Open-source coding assistant CLI',
    bestModels: ['local', 'glm5'],
    worksWith: ['opus', 'sonnet', 'codex', 'gemini'],
    notes: 'Flexible and supports many models. Great for local development.'
  },
  { 
    id: 'codex-cli', 
    name: 'Codex CLI', 
    icon: '🔵',
    logo: openaiLogo,
    description: 'OpenAI\'s official CLI tool',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Optimized for GPT Codex. First-class OpenAI integration.'
  },
  { 
    id: 'copilot-cli', 
    name: 'Copilot CLI', 
    icon: '✈️',
    logo: githubLogo,
    description: 'GitHub\'s terminal-based Copilot',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Built on OpenAI models. Great for shell commands and scripts.'
  }
]

const guiTools = [
  { 
    id: 'claude-cowork', 
    name: 'Claude Cowork', 
    icon: '🤝',
    logo: anthropicLogo,
    description: 'Desktop app for Claude collaboration',
    bestModels: ['opus', 'sonnet'],
    worksWith: ['glm5'],
    notes: 'First-class Claude experience. Native desktop integration.'
  },
  { 
    id: 'codex-app', 
    name: 'Codex App', 
    icon: '📱',
    logo: openaiLogo,
    description: 'OpenAI\'s desktop application',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Official OpenAI desktop client. Seamless GPT integration.'
  },
  { 
    id: 'antigravity', 
    name: 'Antigravity', 
    icon: '🚀',
    logo: googleLogo,
    description: 'Multi-model AI coding environment',
    bestModels: ['local'],
    worksWith: ['opus', 'sonnet', 'glm5', 'codex', 'gemini'],
    notes: 'Great for experimenting with different models. Supports local models well.'
  },
  { 
    id: 'cursor', 
    name: 'Cursor', 
    icon: '🖱️',
    logo: cursorLogo,
    description: 'AI-first code editor',
    bestModels: ['codex'],
    worksWith: ['opus', 'sonnet', 'glm5', 'gemini', 'local'],
    notes: 'Supports many models but not first-class for all. Built on VS Code.'
  },
  { 
    id: 'z-code', 
    name: 'Z Code', 
    icon: '💫',
    logo: zhipuLogo,
    description: 'Next-gen AI coding assistant',
    bestModels: ['glm5'],
    worksWith: ['opus', 'sonnet', 'codex', 'gemini', 'local'],
    notes: 'Good GLM 5 integration. Growing model support.'
  }
]

const filteredCliTools = computed(() => {
  if (selectedModel.value === 'all') return cliTools
  return cliTools.filter(tool => 
    tool.bestModels.includes(selectedModel.value) || 
    tool.worksWith.includes(selectedModel.value)
  )
})

const filteredGuiTools = computed(() => {
  if (selectedModel.value === 'all') return guiTools
  return guiTools.filter(tool => 
    tool.bestModels.includes(selectedModel.value) || 
    tool.worksWith.includes(selectedModel.value)
  )
})

function getModelSupport(tool: any, modelId: string): 'best' | 'works' | 'none' {
  if (tool.bestModels.includes(modelId)) return 'best'
  if (tool.worksWith.includes(modelId)) return 'works'
  return 'none'
}
</script>

<template>
  <div class="page vibe-coding-page" :class="{ dark: store.darkMode }">
    <h1>🌊 Vibe Coding Guide</h1>
    <p class="subtitle">Your comprehensive reference for AI coding tools and models</p>

    <div class="content-sections">
      <!-- Model Overview Section -->
      <section class="content-section">
        <h2>🤖 Available Models</h2>
        <div class="model-grid">
          <div 
            v-for="model in models" 
            :key="model.id"
            class="model-card"
            :class="{ selected: selectedModel === model.id }"
            @click="selectedModel = selectedModel === model.id ? 'all' : model.id"
          >
            <div class="model-icon">
              <img v-if="model.logo" :src="model.logo" :alt="`${model.name} logo`" class="product-logo model-logo" />
              <span v-else>{{ model.icon }}</span>
            </div>
            <div class="model-info">
              <h3>{{ model.name }}</h3>
              <p>{{ model.description }}</p>
            </div>
          </div>
        </div>
        <p class="filter-hint">
          {{ selectedModel === 'all' ? 'Click a model to filter tools' : `Showing tools for ${models.find(m => m.id === selectedModel)?.name}. Click again to show all.` }}
        </p>
      </section>

      <!-- CLI Tools Section -->
      <section class="content-section">
        <h2>⌨️ CLI Tools</h2>
        <div class="tools-list">
          <div v-for="tool in filteredCliTools" :key="tool.id" class="tool-card">
            <div class="tool-header">
              <span class="tool-icon">
                <img v-if="tool.logo" :src="tool.logo" :alt="`${tool.name} logo`" class="product-logo tool-logo" />
                <span v-else>{{ tool.icon }}</span>
              </span>
              <div>
                <h3>{{ tool.name }}</h3>
                <p class="tool-description">{{ tool.description }}</p>
              </div>
            </div>
            
            <div class="model-support">
              <h4>Model Support:</h4>
              <div class="support-grid">
                <div 
                  v-for="model in models" 
                  :key="model.id"
                  class="support-item"
                  :class="getModelSupport(tool, model.id)"
                >
                  <span class="support-icon">
                    <img v-if="model.logo" :src="model.logo" :alt="`${model.name} logo`" class="support-logo" />
                    <span v-else>{{ model.icon }}</span>
                  </span>
                  <span class="support-name">{{ model.name }}</span>
                  <span class="support-badge">
                    <template v-if="getModelSupport(tool, model.id) === 'best'">✓ First Class</template>
                    <template v-else-if="getModelSupport(tool, model.id) === 'works'">* Works</template>
                    <template v-else>—</template>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="tool-notes">
              <strong>📝 Notes:</strong> {{ tool.notes }}
            </div>
          </div>
        </div>
      </section>

      <!-- GUI Tools Section -->
      <section class="content-section">
        <h2>🖥️ GUI Tools</h2>
        <div class="tools-list">
          <div v-for="tool in filteredGuiTools" :key="tool.id" class="tool-card">
            <div class="tool-header">
              <span class="tool-icon">
                <img v-if="tool.logo" :src="tool.logo" :alt="`${tool.name} logo`" class="product-logo tool-logo" />
                <span v-else>{{ tool.icon }}</span>
              </span>
              <div>
                <h3>{{ tool.name }}</h3>
                <p class="tool-description">{{ tool.description }}</p>
              </div>
            </div>
            
            <div class="model-support">
              <h4>Model Support:</h4>
              <div class="support-grid">
                <div 
                  v-for="model in models" 
                  :key="model.id"
                  class="support-item"
                  :class="getModelSupport(tool, model.id)"
                >
                  <span class="support-icon">
                    <img v-if="model.logo" :src="model.logo" :alt="`${model.name} logo`" class="support-logo" />
                    <span v-else>{{ model.icon }}</span>
                  </span>
                  <span class="support-name">{{ model.name }}</span>
                  <span class="support-badge">
                    <template v-if="getModelSupport(tool, model.id) === 'best'">✓ First Class</template>
                    <template v-else-if="getModelSupport(tool, model.id) === 'works'">* Works</template>
                    <template v-else>—</template>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="tool-notes">
              <strong>📝 Notes:</strong> {{ tool.notes }}
            </div>
          </div>
        </div>
      </section>

      <!-- Best Practices Section -->
      <section class="content-section">
        <h2>💡 Best Practices by Model</h2>
        <div class="practices-grid">
          <div class="practice-card">
            <h3>🟣 Claude (Opus/Sonnet)</h3>
            <ul>
              <li><strong>Best with:</strong> Claude Code (CLI) or Claude Cowork (GUI)</li>
              <li><strong>Approach:</strong> First-class experience, native integration</li>
              <li><strong>Tips:</strong> Use extended thinking for complex problems</li>
            </ul>
          </div>
          
          <div class="practice-card">
            <h3>🟢 GLM 5</h3>
            <ul>
              <li><strong>Best with:</strong> Z Code, Opencode, or Claude Code (with config)</li>
              <li><strong>Approach:</strong> May require API configuration tweaks</li>
              <li><strong>Tips:</strong> Good multimodal capabilities for visual tasks</li>
            </ul>
          </div>
          
          <div class="practice-card">
            <h3>🔵 GPT Codex</h3>
            <ul>
              <li><strong>Best with:</strong> Codex CLI, Copilot CLI, Codex App, or Cursor</li>
              <li><strong>Approach:</strong> First-class in OpenAI tools, good in Cursor</li>
              <li><strong>Tips:</strong> Excellent for shell commands and quick scripts</li>
            </ul>
          </div>
          
          <div class="practice-card">
            <h3>🔴 Gemini</h3>
            <ul>
              <li><strong>Best with:</strong> Antigravity or Cursor (with setup)</li>
              <li><strong>Approach:</strong> Not first-class, requires configuration</li>
              <li><strong>Tips:</strong> Strong at multimodal and long-context tasks</li>
            </ul>
          </div>
          
          <div class="practice-card">
            <h3>🟡 Local Models</h3>
            <ul>
              <li><strong>Best with:</strong> Opencode, Antigravity, or LM Studio</li>
              <li><strong>Approach:</strong> Full control, privacy-focused</li>
              <li><strong>Tips:</strong> Requires good hardware, choose model size wisely</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Legend Section -->
      <section class="content-section legend-section">
        <h2>📖 Legend</h2>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-badge best">✓ First Class</span>
            <span>Native integration, optimal experience</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge works">* Works</span>
            <span>Functional but may need configuration or have limitations</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge none">—</span>
            <span>Not supported or not recommended</span>
          </div>
        </div>
      </section>
    </div>

    <footer class="page-footer">
      <p>Happy vibe coding! 🌊✨ | {{ store.darkMode ? 'Dark' : 'Light' }} mode</p>
    </footer>
  </div>
</template>

<style scoped>
/* CSS Variables for theme colors */
:root {
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --hover-bg: #f7fafc;
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --best-color: #48bb78;
  --works-color: #ecc94b;
  --none-color: #a0aec0;
}

.vibe-coding-page.dark {
  --card-bg: #2d3748;
  --text-primary: #ffffff;
  --text-secondary: #f1f5f9;
  --hover-bg: #4a5568;
}

.vibe-coding-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.vibe-coding-page.dark {
  background: linear-gradient(135deg, #0d1219 0%, #1a202c 100%);
}

h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

/* Model Grid */
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.model-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  color: var(--text-primary);
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.model-card.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.model-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.model-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.model-info p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.filter-hint {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Tools List */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tool-card {
  background: var(--hover-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--primary-color);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.product-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.model-logo {
  max-width: 36px;
  max-height: 36px;
}

.tool-logo {
  max-width: 40px;
  max-height: 40px;
}

.tool-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-primary);
}

.tool-description {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

/* Model Support Grid */
.model-support {
  margin: 1rem 0;
}

.model-support h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.support-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--card-bg);
  border-radius: 6px;
  font-size: 0.85rem;
}

.support-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.support-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.support-name {
  flex: 1;
  color: var(--text-primary);
}

.support-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.support-item.best .support-badge {
  background: rgba(72, 187, 120, 0.2);
  color: var(--best-color);
}

.support-item.works .support-badge {
  background: rgba(236, 201, 75, 0.2);
  color: var(--works-color);
}

.support-item.none .support-badge {
  background: rgba(160, 174, 192, 0.2);
  color: var(--none-color);
}

.tool-notes {
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

/* Practices Grid */
.practices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.practice-card {
  padding: 1.5rem;
  background: var(--hover-bg);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.practice-card h3 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.practice-card ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--text-primary);
}

.practice-card li {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.practice-card li strong {
  color: var(--primary-color);
}

/* Legend Section */
.legend-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.legend-badge {
  min-width: 120px;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.legend-badge.best {
  background: rgba(72, 187, 120, 0.2);
  color: var(--best-color);
}

.legend-badge.works {
  background: rgba(236, 201, 75, 0.2);
  color: var(--works-color);
}

.legend-badge.none {
  background: rgba(160, 174, 192, 0.2);
  color: var(--none-color);
}

/* Footer */
.page-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .vibe-coding-page {
    padding: 20px 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .model-grid,
  .practices-grid {
    grid-template-columns: 1fr;
  }

  .support-grid {
    grid-template-columns: 1fr;
  }
}
</style>
