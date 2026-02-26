# Logo Assets

This directory contains logos for products mentioned on the vibe-coding page.

## Available Logos

### AI Models
- **anthropic.svg** - Anthropic logo (Claude's parent company)
- **openai.svg** - OpenAI logo (GPT Codex)
- **gemini.svg** - Google Gemini logo
- **zhipu.svg** - Zhipu AI GLM logo
- **google.svg** - Google logo

### Tools & Platforms
- **cursor.svg** - Cursor AI code editor logo
- **github.svg** - GitHub logo (for Copilot CLI)
- **ollama.png** - Ollama logo (for local models)

## Sources

- **OpenAI**: Wikimedia Commons
- **Google/Gemini**: Official Google assets
- **GitHub**: Wikimedia Commons
- **Anthropic**: Official Anthropic assets
- **Zhipu AI**: Official GLM repository
- **Cursor**: Cursor official website
- **Ollama**: Ollama official website

## Usage

These logos can be imported in Vue components:

```vue
<script setup>
import anthropicLogo from '@/assets/logos/anthropic.svg'
import openaiLogo from '@/assets/logos/openai.svg'
// etc.
</script>

<template>
  <img :src="anthropicLogo" alt="Anthropic" />
</template>
```

## Notes

- All files are in SVG format except `ollama.png` which is PNG
- SVG files are scalable and work well in both light and dark modes
- These logos are trademarked by their respective companies
- Usage should follow each company's brand guidelines
