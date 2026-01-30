import { defineComponent } from 'vue'

// Gender detection constants (from Gender\Gender PHP class)
export const GENDER_CONSTANTS = {
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

export const GenderPicker = defineComponent({
  template: `
    <div class="gender-picker">
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
        
        <div v-if="error" class="gender-error">
          <div class="emoji">❌</div>
          <p>{{ error }}</p>
        </div>
        
        <button class="cute-btn back-btn" @click="$emit('back')">← Back Home</button>
      </div>
    </div>
  `,
  props: {
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['back'],
  data() {
    return {
      name: '',
      selectedCountry: 0,
      loading: false,
      result: null as GenderResult | null,
      error: null as string | null,
      countries: [
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
      ] as Country[]
    }
  },
  methods: {
    async detectGender() {
      if (!this.name.trim()) return
      
      this.loading = true
      this.result = null
      this.error = null
      
      try {
        const response = await fetch('/api/gender', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            country: this.selectedCountry
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to detect gender')
        }
        
        const data = await response.json()
        
        // Map gender codes to human-readable results
        const genderMap: { [key: number]: GenderResult } = {
          [GENDER_CONSTANTS.IS_FEMALE]: {
            gender: 'Female',
            confidence: 'High',
            emoji: '👩',
            resultClass: 'result-female'
          },
          [GENDER_CONSTANTS.IS_MOSTLY_FEMALE]: {
            gender: 'Mostly Female',
            confidence: 'Moderate',
            emoji: '👩',
            resultClass: 'result-female-likely'
          },
          [GENDER_CONSTANTS.IS_MALE]: {
            gender: 'Male',
            confidence: 'High',
            emoji: '👨',
            resultClass: 'result-male'
          },
          [GENDER_CONSTANTS.IS_MOSTLY_MALE]: {
            gender: 'Mostly Male',
            confidence: 'Moderate',
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
        
        const result = genderMap[data.gender_code]
        if (result) {
          this.result = result
        } else {
          this.error = 'Unable to determine gender'
        }
      } catch (err) {
        this.error = 'Error detecting gender. Please try again.'
        console.error('Gender detection error:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
