<script setup lang="ts">
import { ref } from 'vue'
import { generalRepository } from '../../../repositories/general.repository'

// Gender detection constants (from Gender\Gender PHP class)
const GENDER_CONSTANTS = {
  // Gender result constants
  IS_FEMALE: 70,
  IS_MOSTLY_FEMALE: 102,
  IS_MALE: 77,
  IS_MOSTLY_MALE: 109,
  IS_UNISEX_NAME: 63,
  IS_A_COUPLE: 67,
  NAME_NOT_FOUND: 32,
  ERROR_IN_NAME: 69
}

interface Country {
  value: number
  name: string
  flag: string
}

interface GenderResult {
  gender: string
  confidence: string
  emoji: string
  resultClass: string
}

defineProps<{
  darkMode?: boolean
}>()

defineEmits<{
  back: []
}>()

const name = ref('')
const selectedCountry = ref(0)
const loading = ref(false)
const result = ref<GenderResult | null>(null)
const error = ref<string | null>(null)

const countries = ref<Country[]>([
  { value: 0, name: 'Any Country', flag: '🌍' },
  { value: 1, name: 'USA', flag: '🇺🇸' },
  { value: 2, name: 'UK', flag: '🇬🇧' },
  { value: 3, name: 'Germany', flag: '🇩🇪' },
  { value: 4, name: 'France', flag: '🇫🇷' },
  { value: 5, name: 'Spain', flag: '🇪🇸' },
  { value: 6, name: 'Italy', flag: '🇮🇹' },
  { value: 7, name: 'Netherlands', flag: '🇳🇱' },
  { value: 8, name: 'Poland', flag: '🇵🇱' },
  { value: 9, name: 'Russia', flag: '🇷🇺' }
])

const detectGender = async () => {
  if (!name.value.trim()) return

  loading.value = true
  result.value = null
  error.value = null

  try {
    const data = await generalRepository.detectGender(name.value, selectedCountry.value)

    // Map backend gender strings to constants
    const genderStringToCode: { [key: string]: number } = {
      'female': GENDER_CONSTANTS.IS_FEMALE,
      'mostly_female': GENDER_CONSTANTS.IS_MOSTLY_FEMALE,
      'male': GENDER_CONSTANTS.IS_MALE,
      'mostly_male': GENDER_CONSTANTS.IS_MOSTLY_MALE,
      'unisex': GENDER_CONSTANTS.IS_UNISEX_NAME,
      'couple': GENDER_CONSTANTS.IS_A_COUPLE,
      'not_found': GENDER_CONSTANTS.NAME_NOT_FOUND,
      'error': GENDER_CONSTANTS.ERROR_IN_NAME
    }

    const genderCode = genderStringToCode[data.gender] || GENDER_CONSTANTS.NAME_NOT_FOUND

    // Map gender codes to human-readable results
    const genderMap: { [key: number]: GenderResult } = {
      [GENDER_CONSTANTS.IS_FEMALE]: {
        gender: 'Female',
        confidence: data.probability ? `${Math.round(data.probability * 100)}%` : 'High',
        emoji: '👩',
        resultClass: 'result-female'
      },
      [GENDER_CONSTANTS.IS_MOSTLY_FEMALE]: {
        gender: 'Mostly Female',
        confidence: data.probability ? `${Math.round(data.probability * 100)}%` : 'Moderate',
        emoji: '👩',
        resultClass: 'result-female-likely'
      },
      [GENDER_CONSTANTS.IS_MALE]: {
        gender: 'Male',
        confidence: data.probability ? `${Math.round(data.probability * 100)}%` : 'High',
        emoji: '👨',
        resultClass: 'result-male'
      },
      [GENDER_CONSTANTS.IS_MOSTLY_MALE]: {
        gender: 'Mostly Male',
        confidence: data.probability ? `${Math.round(data.probability * 100)}%` : 'Moderate',
        emoji: '👨',
        resultClass: 'result-male-likely'
      },
      [GENDER_CONSTANTS.IS_UNISEX_NAME]: {
        gender: 'Unisex',
        confidence: 'N/A',
        emoji: '🧑',
        resultClass: 'result-unisex'
      },
      [GENDER_CONSTANTS.IS_A_COUPLE]: {
        gender: 'Couple',
        confidence: 'N/A',
        emoji: '👫',
        resultClass: 'result-couple'
      },
      [GENDER_CONSTANTS.NAME_NOT_FOUND]: {
        gender: 'Name Not Found',
        confidence: 'N/A',
        emoji: '❓',
        resultClass: 'result-unknown'
      },
      [GENDER_CONSTANTS.ERROR_IN_NAME]: {
        gender: 'Error',
        confidence: 'N/A',
        emoji: '⚠️',
        resultClass: 'result-error'
      }
    }

    const mappedResult = genderMap[genderCode]
    if (mappedResult) {
      result.value = mappedResult
    } else {
      error.value = 'Unable to determine gender'
    }
  } catch (err) {
    error.value = 'Error detecting gender. Please try again.'
    console.error('Gender detection error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="gender-picker" :class="{ dark: darkMode }">
    <div class="gender-picker-container">
      <div class="emoji">🔮</div>
      <h1>Gender Detector</h1>
      <p>Enter a name to detect its gender!</p>

      <form class="gender-form" @submit.prevent="detectGender">
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

        <div class="form-group">
          <label for="country">Country:</label>
          <select
            id="country"
            v-model="selectedCountry"
            class="country-select"
          >
            <option v-for="country in countries" :key="country.value" :value="country.value">
              {{ country.flag }} {{ country.name }}
            </option>
          </select>
        </div>

        <button
          type="submit"
          class="detect-btn"
          :disabled="loading || !name.trim()"
        >
          {{ loading ? 'Detecting...' : '🔮 Detect Gender' }}
        </button>
      </form>

      <div v-if="result" class="gender-result" :class="result.resultClass">
        <div class="result-emoji">{{ result.emoji }}</div>
        <h2>{{ result.gender }}</h2>
        <p v-if="result.confidence">Confidence: {{ result.confidence }}</p>
      </div>

      <div v-if="error" class="gender-error" role="alert" aria-live="assertive">
        <div class="emoji" aria-hidden="true">❌</div>
        <p>{{ error }}</p>
      </div>

      <button class="cute-btn back-btn" @click="$emit('back')">← Back Home</button>
    </div>
  </div>
</template>

<style scoped>
.gender-picker {
  min-height: 100vh;
  padding: 100px 20px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.gender-picker-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(236, 228, 236, 0.3);
}

.gender-picker-container .emoji {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 20px;
}

.gender-picker-container h1 {
  font-size: 2.5rem;
  text-align: center;
  margin: 0 0 10px 0;
  color: #880e4f;
}

.gender-picker-container > p {
  text-align: center;
  color: #666;
  margin: 0 0 30px 0;
  font-size: 1.1rem;
}

.gender-form {
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

.name-input,
.country-select {
  padding: 12px 16px;
  border: 2px solid #e91e63;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  color: #333;
  transition: all 0.2s ease;
}

.name-input:focus,
.country-select:focus {
  outline: none;
  border-color: #c2185b;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.name-input::placeholder {
  color: #999;
}

.country-select option {
  color: #333;
}

.detect-btn {
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

.detect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
}

.detect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gender-result {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  margin-bottom: 20px;
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

.result-emoji {
  font-size: 5rem;
  margin-bottom: 15px;
}

.gender-result h2 {
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.gender-result p {
  margin: 0;
  font-size: 1.1rem;
  color: #666;
}

/* Result color variants */
.result-female {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
}

.result-female h2 {
  color: #c2185b;
}

.result-male {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.result-male h2 {
  color: #1565c0;
}

.result-female-likely {
  background: linear-gradient(135deg, #fce4ec 0%, #fff9c4 100%);
}

.result-female-likely h2 {
  color: #f57f17;
}

.result-male-likely {
  background: linear-gradient(135deg, #e3f2fd 0%, #fff9c4 100%);
}

.result-male-likely h2 {
  color: #f57f17;
}

.result-unisex {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.result-unisex h2 {
  color: #7b1fa2;
}

.result-couple {
  background: linear-gradient(135deg, #fce4ec 0%, #e3f2fd 100%);
}

.result-couple h2 {
  color: #1565c0;
}

.result-unknown {
  background: linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%);
}

.result-unknown h2 {
  color: #616161;
}

.result-error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.result-error h2 {
  color: #c62828;
}

.gender-error {
  text-align: center;
  padding: 30px 20px;
  border-radius: 15px;
  background: #ffebee;
  margin-bottom: 20px;
}

.gender-error .emoji {
  font-size: 3rem;
  margin-bottom: 10px;
}

.gender-error p {
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
.dark.gender-picker {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.dark.gender-picker-container {
  background: #1e1e2e;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dark.gender-picker-container .emoji {
  filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.3));
}

.dark.gender-picker-container h1 {
  color: #ff80ab;
  text-shadow: 0 0 20px rgba(255, 128, 171, 0.3);
}

.dark.gender-picker-container > p {
  color: #b0b0b0;
}

.dark .form-group label {
  color: #e0e0e0;
}

.dark .name-input,
.dark .country-select {
  background: #2d2d3d;
  border-color: #ff80ab;
  color: #e0e0e0;
}

.dark .name-input::placeholder {
  color: #888;
}

.dark .name-input:focus,
.dark .country-select:focus {
  border-color: #ff4081;
  box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.2);
}

.dark .country-select option {
  background: #2d2d3d;
  color: #e0e0e0;
}

.dark .detect-btn {
  background: linear-gradient(135deg, #ff4081 0%, #c51162 100%);
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
}

.dark .detect-btn:hover:not(:disabled) {
  box-shadow: 0 6px 25px rgba(255, 64, 129, 0.5);
}

.dark .gender-result p {
  color: #b0b0b0;
}

/* Dark mode result variants */
.dark .result-female {
  background: linear-gradient(135deg, #4a1a2b 0%, #6d2a3e 100%);
}

.dark .result-female h2 {
  color: #ff80ab;
}

.dark .result-male {
  background: linear-gradient(135deg, #1a2d4a 0%, #2a4a6d 100%);
}

.dark .result-male h2 {
  color: #64b5f6;
}

.dark .result-female-likely {
  background: linear-gradient(135deg, #4a1a2b 0%, #4a4a2b 100%);
}

.dark .result-female-likely h2 {
  color: #ffd740;
}

.dark .result-male-likely {
  background: linear-gradient(135deg, #1a2d4a 0%, #4a4a2b 100%);
}

.dark .result-male-likely h2 {
  color: #ffd740;
}

.dark .result-unisex {
  background: linear-gradient(135deg, #2d1a4a 0%, #4a2d6d 100%);
}

.dark .result-unisex h2 {
  color: #e040fb;
}

.dark .result-couple {
  background: linear-gradient(135deg, #4a1a2b 0%, #1a2d4a 100%);
}

.dark .result-couple h2 {
  color: #64b5f6;
}

.dark .result-unknown {
  background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
}

.dark .result-unknown h2 {
  color: #a0a0a0;
}

.dark .result-error {
  background: linear-gradient(135deg, #4a1a1a 0%, #6d2a2a 100%);
}

.dark .result-error h2 {
  color: #ff5252;
}

.dark .gender-error {
  background: #4a1a1a;
}

.dark .gender-error .emoji {
  filter: drop-shadow(0 0 5px rgba(255, 82, 82, 0.5));
}

.dark .gender-error p {
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
