<script setup lang="ts">
import { ref } from 'vue'
import { generalRepository } from '../../../repositories/general.repository'

interface PhrenologyResult {
  name: string
  gender: string
  genderProbability: number
  genderCount: number
  age: number | null
  ageCount: number
  nationalities: {
    country_id: string
    probability: number
  }[]
  nationalityCount: number
  phrenology: {
    name: string
    value: string
  }[]
}

defineProps<{
  darkMode?: boolean
}>()

defineEmits<{
  back: []
}>()

const name = ref('')
const loading = ref(false)
const result = ref<PhrenologyResult | null>(null)
const error = ref<string | null>(null)

// Country code to flag emoji mapping
const countryFlags: { [key: string]: string } = {
  US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸',
  IT: '🇮🇹', NL: '🇳🇱', PL: '🇵🇱', RU: '🇷🇺', BR: '🇧🇷',
  CA: '🇨🇦', AU: '🇦🇺', IN: '🇮🇳', CN: '🇨🇳', JP: '🇯🇵',
  MX: '🇲🇽', AR: '🇦🇷', ZA: '🇿🇦', NG: '🇳🇬', KR: '🇰🇷'
}

const analyzePhrenology = async () => {
  if (!name.value.trim()) return

  loading.value = true
  result.value = null
  error.value = null

  try {
    const data = await generalRepository.analyzePhrenology(name.value)
    result.value = data
  } catch (err) {
    error.value = 'Error analyzing phrenology. Please try again.'
    console.error('Phrenology analysis error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="phrenology-picker" :class="{ dark: darkMode }">
    <div class="phrenology-picker-container">
      <div class="emoji">🔮</div>
      <h1>Phrenology</h1>
      <p>Predict properties from a name (completely scientific, trust us)</p>

      <form class="phrenology-form" @submit.prevent="analyzePhrenology">
        <div class="form-group">
          <label for="name">Name:</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter a name"
            required
            class="name-input"
          />
        </div>

        <button
          type="submit"
          class="analyze-btn"
          :disabled="loading || !name.trim()"
        >
          {{ loading ? 'Analyzing...' : '🔮 Analyze Phrenology' }}
        </button>
      </form>

      <div v-if="result" class="phrenology-result">
        <div class="result-section">
          <h3>📊 Demographics</h3>
          <div class="result-item">
            <span class="label">Gender:</span>
            <span class="value">{{ result.gender === 'male' ? '👨 Male' : result.gender === 'female' ? '👩 Female' : '❓ Unknown' }}</span>
            <span v-if="result.genderProbability > 0" class="confidence">
              ({{ Math.round(result.genderProbability * 100) }}% confidence, based on {{ result.genderCount.toLocaleString() }} records)
            </span>
          </div>
          <div class="result-item">
            <span class="label">Age:</span>
            <span class="value">{{ result.age ? `${result.age} years old` : 'Unknown' }}</span>
            <span v-if="result.age" class="confidence">
              (based on {{ result.ageCount.toLocaleString() }} records)
            </span>
          </div>
          <div v-if="result.nationalities.length > 0" class="result-item">
            <span class="label">Nationality:</span>
            <div class="nationalities">
              <span
                v-for="(country, index) in result.nationalities"
                :key="index"
                class="nationality-item"
              >
                {{ countryFlags[country.country_id] || country.country_id }}
                <span class="probability">{{ Math.round(country.probability * 100) }}%</span>
              </span>
            </div>
            <span class="confidence">(based on {{ result.nationalityCount.toLocaleString() }} records)</span>
          </div>
        </div>

        <div class="result-section phrenology-section">
          <h3>🔮 Phrenology Properties</h3>
          <p class="disclaimer">These properties are 100% scientifically accurate*</p>
          <div
            v-for="(prop, index) in result.phrenology"
            :key="index"
            class="phrenology-item"
          >
            <span class="phrenology-label">{{ prop.name }}:</span>
            <span class="phrenology-value">{{ prop.value }}</span>
          </div>
        </div>

        <div class="footer-note">
          <small>*Not actually scientifically accurate</small>
        </div>
      </div>

      <div v-if="error" class="phrenology-error" role="alert" aria-live="assertive">
        <div class="emoji" aria-hidden="true">❌</div>
        <p>{{ error }}</p>
      </div>

      <button class="cute-btn back-btn" @click="$emit('back')">← Back Home</button>
    </div>
  </div>
</template>

<style scoped>
.phrenology-picker {
  min-height: 100vh;
  padding: 100px 20px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.phrenology-picker-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(236, 228, 236, 0.3);
}

.phrenology-picker-container .emoji {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 20px;
}

.phrenology-picker-container h1 {
  font-size: 2.5rem;
  text-align: center;
  margin: 0 0 10px 0;
  color: #880e4f;
}

.phrenology-picker-container > p {
  text-align: center;
  color: #666;
  margin: 0 0 30px 0;
  font-size: 1.1rem;
}

.phrenology-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.name-input {
  padding: 12px 16px;
  border: 2px solid #e91e63;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  color: #333;
  transition: all 0.2s ease;
}

.name-input:focus {
  outline: none;
  border-color: #c2185b;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.name-input::placeholder {
  color: #999;
}

.analyze-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.phrenology-result {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.result-section h3 {
  margin: 0 0 16px 0;
  color: #880e4f;
  font-size: 1.1rem;
}

.phrenology-section {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.phrenology-section h3 {
  color: #6a1b9a;
}

.result-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item .label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.result-item .value {
  font-size: 1.1rem;
  color: #1a1a1a;
  font-weight: 500;
}

.confidence {
  font-size: 0.85rem;
  color: #757575;
  font-style: italic;
}

.nationalities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.nationality-item {
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nationality-item .probability {
  font-size: 0.85rem;
  color: #757575;
  font-weight: 500;
}

.phrenology-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.phrenology-item:last-child {
  margin-bottom: 0;
}

.phrenology-label {
  font-weight: 600;
  color: #4a148c;
  font-size: 1rem;
}

.phrenology-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6a1b9a;
}

.disclaimer {
  font-style: italic;
  color: #757575;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}

.footer-note {
  text-align: center;
  padding-top: 12px;
  border-top: 1px dashed #ab47bc;
}

.footer-note small {
  color: #7b1fa2;
  font-size: 0.8rem;
}

.phrenology-error {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  background: #ffebee;
  margin-bottom: 20px;
}

.phrenology-error .emoji {
  font-size: 3rem;
  margin-bottom: 10px;
}

.phrenology-error p {
  color: #c62828;
  margin: 0;
  font-size: 1.1rem;
}

.back-btn {
  width: 100%;
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

/* Dark mode styles */
.dark.phrenology-picker {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.dark.phrenology-picker-container {
  background: #1e1e2e;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dark.phrenology-picker-container .emoji {
  filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.3));
}

.dark.phrenology-picker-container h1 {
  color: #ff80ab;
  text-shadow: 0 0 20px rgba(255, 128, 171, 0.3);
}

.dark.phrenology-picker-container > p {
  color: #b0b0b0;
}

.dark .form-group label {
  color: #e0e0e0;
}

.dark .name-input {
  background: #2d2d3d;
  border-color: #ff80ab;
  color: #e0e0e0;
}

.dark .name-input::placeholder {
  color: #888;
}

.dark .name-input:focus {
  border-color: #ff4081;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.2);
}

.dark .analyze-btn {
  background: linear-gradient(135deg, #ff4081 0%, #c51162 100%);
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
}

.dark .analyze-btn:hover:not(:disabled) {
  box-shadow: 0 6px 25px rgba(255, 64, 129, 0.5);
}

.dark .result-section {
  background: #2d2d3d;
}

.dark .result-section h3 {
  color: #ff80ab;
}

.dark .phrenology-section {
  background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
}

.dark .phrenology-section h3 {
  color: #e1bee7;
}

.dark .result-item .label {
  color: #e0e0e0;
}

.dark .result-item .value {
  color: #f5f5f5;
}

.dark .confidence {
  color: #b0b0b0;
}

.dark .nationality-item {
  background: #3d3d4d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dark .nationality-item .probability {
  color: #b0b0b0;
}

.dark .phrenology-item {
  background: #3d3d4d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark .phrenology-label {
  color: #ce93d8;
}

.dark .phrenology-value {
  color: #e1bee7;
}

.dark .disclaimer {
  color: #ce93d8;
}

.dark .footer-note {
  border-top-color: #ce93d8;
}

.dark .footer-note small {
  color: #ce93d8;
}

.dark .phrenology-error {
  background: #4a1a1a;
}

.dark .phrenology-error .emoji {
  filter: drop-shadow(0 0 5px rgba(255, 82, 82, 0.5));
}

.dark .phrenology-error p {
  color: #ff5252;
}

.dark .back-btn {
  background: #2d2d3d;
  color: #e0e0e0;
  border-color: #4a4a5d;
}

.dark .back-btn:hover {
  background: #3d3d4d;
}
</style>
