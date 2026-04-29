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

type SupportLevel = 'best' | 'works' | 'none'
type ToolType = 'cli' | 'gui'

interface ModelOption {
  id: string
  name: string
  icon: string
  logo: string
  description: string
}

interface ToolOption {
  id: string
  name: string
  icon: string
  logo: string
  description: string
  bestModels: string[]
  worksWith: string[]
  notes: string
}

interface Subscription {
  id: string
  name: string
  logo: string
  price: string
  period: string
  features: string[]
  highlight?: boolean
}

const store = useAppStore()
const focusedModel = ref<string | null>(null)
const activeTool = ref<ToolOption | null>(null)
const activeToolType = ref<ToolType>('gui')

const models: ModelOption[] = [
  { id: 'opus', name: 'Claude Opus', icon: '🟣', logo: anthropicLogo, description: 'Most capable Claude model' },
  { id: 'sonnet', name: 'Claude Sonnet', icon: '🟣', logo: anthropicLogo, description: 'Balanced Claude model' },
  { id: 'glm5', name: 'GLM 5', icon: '🟢', logo: zhipuLogo, description: 'Zhipu multimodal model' },
  { id: 'codex', name: 'GPT Codex', icon: '🔵', logo: openaiLogo, description: 'OpenAI coding-focused model' },
  { id: 'gemini', name: 'Gemini', icon: '🔴', logo: geminiLogo, description: 'Google multimodal model' },
  { id: 'local', name: 'Local Models', icon: '🟡', logo: ollamaLogo, description: 'Self-hosted model stack' }
]

const cliTools: ToolOption[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '⚡',
    logo: anthropicLogo,
    description: 'Official Anthropic CLI for Claude models',
    bestModels: ['opus', 'sonnet'],
    worksWith: ['glm5'],
    notes: 'First-class support for Opus/Sonnet. GLM 5 works with configuration tweaks.'
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
    description: 'OpenAI official CLI tool',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Optimized for GPT Codex with first-class OpenAI integration.'
  },
  {
    id: 'copilot-cli',
    name: 'Copilot CLI',
    icon: '✈️',
    logo: githubLogo,
    description: 'GitHub terminal Copilot',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Built on OpenAI models. Great for shell commands and scripts.'
  }
]

const guiTools: ToolOption[] = [
  {
    id: 'claude-cowork',
    name: 'Claude Cowork',
    icon: '🤝',
    logo: anthropicLogo,
    description: 'Desktop app for Claude collaboration',
    bestModels: ['opus', 'sonnet'],
    worksWith: ['glm5'],
    notes: 'First-class Claude experience with native desktop integration.'
  },
  {
    id: 'codex-app',
    name: 'Codex App',
    icon: '📱',
    logo: openaiLogo,
    description: 'OpenAI desktop application',
    bestModels: ['codex'],
    worksWith: [],
    notes: 'Official OpenAI desktop client for GPT workflows.'
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    icon: '🚀',
    logo: googleLogo,
    description: 'Multi-model AI coding environment',
    bestModels: ['local'],
    worksWith: ['opus', 'sonnet', 'glm5', 'codex', 'gemini'],
    notes: 'Great for experimenting with many models, especially local model setups.'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '🖱️',
    logo: cursorLogo,
    description: 'AI-first code editor',
    bestModels: ['codex'],
    worksWith: ['opus', 'sonnet', 'glm5', 'gemini', 'local'],
    notes: 'Supports many models, with strong coding ergonomics.'
  },
  {
    id: 'z-code',
    name: 'Z Code',
    icon: '💫',
    logo: zhipuLogo,
    description: 'Next-gen AI coding assistant',
    bestModels: ['glm5'],
    worksWith: ['opus', 'sonnet', 'codex', 'gemini', 'local'],
    notes: 'Good GLM 5 integration and growing support across other models.'
  }
]

const visibleGuiTools = computed(() => {
  if (!focusedModel.value) return guiTools
  return guiTools.filter((tool) => getModelSupport(tool, focusedModel.value as string) !== 'none')
})

const visibleCliTools = computed(() => {
  if (!focusedModel.value) return cliTools
  return cliTools.filter((tool) => getModelSupport(tool, focusedModel.value as string) !== 'none')
})

function toggleModelFocus(modelId: string): void {
  focusedModel.value = focusedModel.value === modelId ? null : modelId
}

function openToolDetails(tool: ToolOption, type: ToolType): void {
  activeTool.value = tool
  activeToolType.value = type
}

function closeToolDetails(): void {
  activeTool.value = null
}

function getModelSupport(tool: ToolOption, modelId: string): SupportLevel {
  if (tool.bestModels.includes(modelId)) return 'best'
  if (tool.worksWith.includes(modelId)) return 'works'
  return 'none'
}

function getSupportLabel(level: SupportLevel): string {
  if (level === 'best') return 'First Class'
  if (level === 'works') return 'Works'
  return 'Not Recommended'
}

function getSupportShort(level: SupportLevel): string {
  if (level === 'best') return 'FC'
  if (level === 'works') return 'OK'
  return '--'
}

function isModelDeemphasized(modelId: string): boolean {
  return focusedModel.value !== null && focusedModel.value !== modelId
}

const subscriptions: Subscription[] = [
  {
    id: 'claude',
    name: 'Claude Pro',
    logo: anthropicLogo,
    price: '$20',
    period: '/month',
    features: ['Claude Opus & Sonnet', 'Extended context', 'Priority access'],
    highlight: true
  },
  {
    id: 'openai',
    name: 'ChatGPT Plus',
    logo: openaiLogo,
    price: '$20',
    period: '/month',
    features: ['GPT-4o & GPT-4', 'DALL-E 3', 'Advanced Voice']
  },
  {
    id: 'zhipu',
    name: 'Z.ai',
    logo: zhipuLogo,
    price: 'Varies',
    period: '',
    features: ['GLM-4 & GLM-5', 'Multimodal', 'API access']
  },
  {
    id: 'cursor',
    name: 'Cursor Pro',
    logo: cursorLogo,
    price: '$20',
    period: '/month',
    features: ['Unlimited completions', 'Claude & GPT-4', 'Priority models']
  },
  {
    id: 'gemini',
    name: 'Gemini Advanced',
    logo: geminiLogo,
    price: '$20',
    period: '/month',
    features: ['Gemini Ultra', '2TB storage', 'Google One bundled']
  }
]
</script>

<template>
  <div class="page vibe-coding-page" :class="{ dark: store.darkMode }">
    <header class="page-header">
      <h1>Vibe Coding Matrix</h1>
      <p class="subtitle">All model and app permutations in one glance. Click any app for details.</p>
      <p v-if="focusedModel" class="focus-hint">
        Focused model: {{ models.find((model) => model.id === focusedModel)?.name }}
        <button class="clear-focus" @click="focusedModel = null">Clear</button>
      </p>
    </header>

    <section class="subscriptions-section">
      <h2>Subscriptions</h2>
      <div class="subscriptions-grid">
        <div
          v-for="sub in subscriptions"
          :key="sub.id"
          class="subscription-card"
          :class="{ highlight: sub.highlight }"
        >
          <div class="sub-header">
            <img :src="sub.logo" :alt="`${sub.name} logo`" class="logo sub-logo" />
            <div class="sub-info">
              <span class="sub-name">{{ sub.name }}</span>
              <span class="sub-price">{{ sub.price }}<span class="sub-period">{{ sub.period }}</span></span>
            </div>
          </div>
          <ul class="sub-features">
            <li v-for="(feature, idx) in sub.features" :key="idx">{{ feature }}</li>
          </ul>
        </div>
      </div>
    </section>

    <div class="workspace-grid">
      <section class="column models-column">
        <h2>Models</h2>
        <div class="column-list">
          <button
            v-for="model in models"
            :key="model.id"
            class="model-row"
            :class="{ selected: focusedModel === model.id }"
            @click="toggleModelFocus(model.id)"
          >
            <img :src="model.logo" :alt="`${model.name} logo`" class="logo model-logo" />
            <div class="row-copy">
              <span class="row-title">{{ model.name }}</span>
              <span class="row-subtitle">{{ model.description }}</span>
            </div>
          </button>
        </div>
      </section>

      <section class="column tools-column gui-column">
        <h2>GUI Apps</h2>
        <div class="column-list">
          <button
            v-for="tool in visibleGuiTools"
            :key="tool.id"
            class="tool-row"
            @click="openToolDetails(tool, 'gui')"
          >
            <div class="tool-header">
              <img :src="tool.logo" :alt="`${tool.name} logo`" class="logo tool-logo" />
              <div class="row-copy">
                <span class="row-title">{{ tool.name }}</span>
                <span class="row-subtitle">{{ tool.description }}</span>
              </div>
            </div>
            <div class="support-strip">
              <div
                v-for="model in models"
                :key="`${tool.id}-${model.id}`"
                class="support-pill"
                :class="[getModelSupport(tool, model.id), { deemphasized: isModelDeemphasized(model.id) }]"
              >
                <img :src="model.logo" :alt="`${model.name} logo`" class="logo support-logo" />
                <span>{{ getSupportShort(getModelSupport(tool, model.id)) }}</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section class="column tools-column cli-column">
        <h2>CLI Apps</h2>
        <div class="column-list">
          <button
            v-for="tool in visibleCliTools"
            :key="tool.id"
            class="tool-row"
            @click="openToolDetails(tool, 'cli')"
          >
            <div class="tool-header">
              <img :src="tool.logo" :alt="`${tool.name} logo`" class="logo tool-logo" />
              <div class="row-copy">
                <span class="row-title">{{ tool.name }}</span>
                <span class="row-subtitle">{{ tool.description }}</span>
              </div>
            </div>
            <div class="support-strip">
              <div
                v-for="model in models"
                :key="`${tool.id}-${model.id}`"
                class="support-pill"
                :class="[getModelSupport(tool, model.id), { deemphasized: isModelDeemphasized(model.id) }]"
              >
                <img :src="model.logo" :alt="`${model.name} logo`" class="logo support-logo" />
                <span>{{ getSupportShort(getModelSupport(tool, model.id)) }}</span>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>

    <div v-if="activeTool" class="modal-overlay" @click.self="closeToolDetails">
      <div class="modal-card" role="dialog" aria-modal="true" :aria-label="`${activeTool.name} details`">
        <div class="modal-header">
          <div class="modal-title-group">
            <img :src="activeTool.logo" :alt="`${activeTool.name} logo`" class="logo modal-logo" />
            <div>
              <h3>{{ activeTool.name }}</h3>
              <p>{{ activeToolType === 'cli' ? 'CLI App' : 'GUI App' }}</p>
            </div>
          </div>
          <button class="modal-close" aria-label="Close details" @click="closeToolDetails">x</button>
        </div>

        <p class="modal-description">{{ activeTool.description }}</p>

        <section class="modal-section">
          <h4>What to consider</h4>
          <p>{{ activeTool.notes }}</p>
        </section>

        <section class="modal-section">
          <h4>Model Compatibility</h4>
          <div class="modal-support-grid">
            <div
              v-for="model in models"
              :key="`modal-${model.id}`"
              class="modal-support-row"
              :class="getModelSupport(activeTool, model.id)"
            >
              <div class="modal-model">
                <img :src="model.logo" :alt="`${model.name} logo`" class="logo support-logo" />
                <span>{{ model.name }}</span>
              </div>
              <span class="modal-badge">{{ getSupportLabel(getModelSupport(activeTool, model.id)) }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vibe-coding-page {
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-border: rgba(99, 102, 241, 0.2);
  --text-primary: #1f2937;
  --text-secondary: #475569;
  --page-bg-start: #f8fafc;
  --page-bg-end: #e2e8f0;
  --row-bg: rgba(248, 250, 252, 0.9);
  --row-hover: rgba(226, 232, 240, 0.95);
  --best-color: #15803d;
  --works-color: #a16207;
  --none-color: #64748b;
  --highlight-border: rgba(99, 102, 241, 0.5);
  --highlight-bg: rgba(99, 102, 241, 0.08);
  
  height: 100vh;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  background: linear-gradient(140deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);
  color: var(--text-primary);
}

.vibe-coding-page.dark {
  --card-bg: rgba(30, 41, 59, 0.96);
  --card-border: rgba(148, 163, 184, 0.35);
  --text-primary: #e2e8f0;
  --text-secondary: #cbd5e1;
  --page-bg-start: #0b1220;
  --page-bg-end: #1e293b;
  --row-bg: rgba(30, 41, 59, 0.95);
  --row-hover: rgba(51, 65, 85, 0.95);
  --best-color: #86efac;
  --works-color: #facc15;
  --none-color: #cbd5e1;
  --highlight-border: rgba(129, 140, 248, 0.5);
  --highlight-bg: rgba(99, 102, 241, 0.15);
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.1;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.focus-hint {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.clear-focus {
  margin-left: 8px;
  border: 1px solid var(--card-border);
  background: var(--row-bg);
  border-radius: 999px;
  padding: 2px 10px;
  color: var(--text-primary);
  cursor: pointer;
}

.subscriptions-section {
  flex-shrink: 0;
}

.subscriptions-section h2 {
  margin: 0 0 8px;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.subscription-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.subscription-card:hover {
  border-color: var(--highlight-border);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.subscription-card.highlight {
  border-color: var(--highlight-border);
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--highlight-bg) 100%);
}

.sub-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sub-logo {
  width: 28px;
  height: 28px;
}

.sub-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sub-name {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-primary);
}

.sub-price {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sub-period {
  font-size: 0.75rem;
  opacity: 0.7;
}

.sub-features {
  margin: 0;
  padding: 0 0 0 14px;
  list-style: disc;
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.sub-features li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(230px, 0.9fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.column {
  min-height: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.column h2 {
  margin: 0 0 10px;
  font-size: 1rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.models-column .model-row,
.tools-column .tool-row {
  flex: 1;
  min-height: 0;
}

.model-row,
.tool-row {
  width: 100%;
  border: 1px solid var(--card-border);
  border-radius: 10px;
  background: var(--row-bg);
  padding: 8px;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.model-row:hover,
.tool-row:hover {
  background: var(--row-hover);
}

.model-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-row.selected {
  border-color: #2563eb;
  box-shadow: inset 0 0 0 1px #2563eb;
}

.tool-row {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-title {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.2;
}

.row-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo {
  object-fit: contain;
  flex-shrink: 0;
}

.model-logo,
.tool-logo {
  width: 26px;
  height: 26px;
}

.support-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.support-pill {
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.support-pill.best {
  background: rgba(22, 163, 74, 0.18);
  border-color: rgba(22, 163, 74, 0.34);
  color: var(--best-color);
}

.support-pill.works {
  background: rgba(250, 204, 21, 0.2);
  border-color: rgba(250, 204, 21, 0.35);
  color: var(--works-color);
}

.support-pill.none {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.35);
  color: var(--none-color);
}

.support-pill.deemphasized {
  opacity: 0.42;
}

.support-logo {
  width: 14px;
  height: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 30;
}

.modal-card {
  width: min(640px, 100%);
  max-height: min(80vh, 760px);
  overflow: auto;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-group h3 {
  margin: 0;
  font-size: 1.1rem;
}

.modal-title-group p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.modal-logo {
  width: 30px;
  height: 30px;
}

.modal-close {
  border: 1px solid var(--card-border);
  background: var(--row-bg);
  color: var(--text-primary);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.modal-description {
  margin: 12px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-section h4 {
  margin: 0 0 8px;
  font-size: 0.92rem;
}

.modal-section p {
  margin: 0;
  font-size: 0.87rem;
  color: var(--text-secondary);
}

.modal-section + .modal-section {
  margin-top: 14px;
}

.modal-support-grid {
  display: grid;
  gap: 6px;
}

.modal-support-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 7px 9px;
}

.modal-model {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
}

.modal-badge {
  font-size: 0.76rem;
  font-weight: 600;
}

.modal-support-row.best .modal-badge {
  color: var(--best-color);
}

.modal-support-row.works .modal-badge {
  color: var(--works-color);
}

.modal-support-row.none .modal-badge {
  color: var(--none-color);
}

@media (max-width: 1080px) {
  .vibe-coding-page {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .column-list {
    overflow: visible;
  }

  .row-subtitle {
    white-space: normal;
  }
}
</style>
