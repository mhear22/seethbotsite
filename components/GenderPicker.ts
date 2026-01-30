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
  ERROR_IN_NAME: 69,

  // Country constants
  ANY_COUNTRY: 0,
  BRITAIN: 1,
  IRELAND: 2,
  USA: 3,
  SPAIN: 4,
  PORTUGAL: 5,
  ITALY: 6,
  MALTA: 7,
  FRANCE: 8,
  BELGIUM: 9,
  LUXEMBOURG: 10,
  NETHERLANDS: 11,
  GERMANY: 12,
  EAST_FRISIA: 13,
  AUSTRIA: 14,
  SWISS: 15,
  ICELAND: 16,
  DENMARK: 17,
  NORWAY: 18,
  SWEDEN: 19,
  FINLAND: 20,
  ESTONIA: 21,
  LATVIA: 22,
  LITHUANIAN: 23,
  POLAND: 24,
  CZECH_REP: 25,
  SLOVAKIA: 26,
  HUNGARY: 27,
  ROMANIA: 28,
  BULGARIA: 29,
  BOSNIA: 30,
  CROATIA: 31,
  KOSOVO: 32,
  MACEDONIA: 33,
  MONTENEGRO: 34,
  SERBIA: 35,
  SLOVENIA: 36,
  ALBANIA: 37,
  GREECE: 38,
  RUSSIA: 39,
  BELARUS: 40,
  MOLDOVA: 41,
  UKRAINE: 42,
  ARMENIA: 43,
  AZERBAIJAN: 44,
  GEORGIA: 45,
  KAZAKH_UZBEK: 46,
  TURKEY: 47,
  ARABIA: 48,
  ISRAEL: 49,
  CHINA: 50,
  INDIA: 51,
  JAPAN: 52,
  KOREA: 53
};

// Country names mapped to constants
export const COUNTRIES = [
  { value: 0, name: 'Any Country', flag: '🌍' },
  { value: 1, name: 'Britain', flag: '🇬🇧' },
  { value: 2, name: 'Ireland', flag: '🇮🇪' },
  { value: 3, name: 'USA', flag: '🇺🇸' },
  { value: 4, name: 'Spain', flag: '🇪🇸' },
  { value: 5, name: 'Portugal', flag: '🇵🇹' },
  { value: 6, name: 'Italy', flag: '🇮🇹' },
  { value: 7, name: 'Malta', flag: '🇲🇹' },
  { value: 8, name: 'France', flag: '🇫🇷' },
  { value: 9, name: 'Belgium', flag: '🇧🇪' },
  { value: 10, name: 'Luxembourg', flag: '🇱🇺' },
  { value: 11, name: 'Netherlands', flag: '🇳🇱' },
  { value: 12, name: 'Germany', flag: '🇩🇪' },
  { value: 13, name: 'East Frisia', flag: '🇩🇪' },
  { value: 14, name: 'Austria', flag: '🇦🇹' },
  { value: 15, name: 'Switzerland', flag: '🇨🇭' },
  { value: 16, name: 'Iceland', flag: '🇮🇸' },
  { value: 17, name: 'Denmark', flag: '🇩🇰' },
  { value: 18, name: 'Norway', flag: '🇳🇴' },
  { value: 19, name: 'Sweden', flag: '🇸🇪' },
  { value: 20, name: 'Finland', flag: '🇫🇮' },
  { value: 21, name: 'Estonia', flag: '🇪🇪' },
  { value: 22, name: 'Latvia', flag: '🇱🇻' },
  { value: 23, name: 'Lithuania', flag: '🇱🇹' },
  { value: 24, name: 'Poland', flag: '🇵🇱' },
  { value: 25, name: 'Czech Republic', flag: '🇨🇿' },
  { value: 26, name: 'Slovakia', flag: '🇸🇰' },
  { value: 27, name: 'Hungary', flag: '🇭🇺' },
  { value: 28, name: 'Romania', flag: '🇷🇴' },
  { value: 29, name: 'Bulgaria', flag: '🇧🇬' },
  { value: 30, name: 'Bosnia', flag: '🇧🇦' },
  { value: 31, name: 'Croatia', flag: '🇭🇷' },
  { value: 32, name: 'Kosovo', flag: '🇽🇰' },
  { value: 33, name: 'Macedonia', flag: '🇲🇰' },
  { value: 34, name: 'Montenegro', flag: '🇲🇪' },
  { value: 35, name: 'Serbia', flag: '🇷🇸' },
  { value: 36, name: 'Slovenia', flag: '🇸🇮' },
  { value: 37, name: 'Albania', flag: '🇦🇱' },
  { value: 38, name: 'Greece', flag: '🇬🇷' },
  { value: 39, name: 'Russia', flag: '🇷🇺' },
  { value: 40, name: 'Belarus', flag: '🇧🇾' },
  { value: 41, name: 'Moldova', flag: '🇲🇩' },
  { value: 42, name: 'Ukraine', flag: '🇺🇦' },
  { value: 43, name: 'Armenia', flag: '🇦🇲' },
  { value: 44, name: 'Azerbaijan', flag: '🇦🇿' },
  { value: 45, name: 'Georgia', flag: '🇬🇪' },
  { value: 46, name: 'Kazakhstan/Uzbekistan', flag: '🇰🇿' },
  { value: 47, name: 'Turkey', flag: '🇹🇷' },
  { value: 48, name: 'Arabia', flag: '🇸🇦' },
  { value: 49, name: 'Israel', flag: '🇮🇱' },
  { value: 50, name: 'China', flag: '🇨🇳' },
  { value: 51, name: 'India', flag: '🇮🇳' },
  { value: 52, name: 'Japan', flag: '🇯🇵' },
  { value: 53, name: 'Korea', flag: '🇰🇷' }
];

export const GenderPicker = {
  name: 'GenderPicker',
  template: `
    <div class="gender-picker" :class="{ 'dark': darkMode }">
      <div class="gender-picker-container">
        <div class="emoji">🔮</div>
        <h1>Gender Detector</h1>
        <p>Predict gender from first name based on country data</p>

        <div class="gender-form">
          <div class="form-group">
            <label for="nameInput">First Name:</label>
            <input
              id="nameInput"
              v-model="name"
              type="text"
              placeholder="Enter a first name..."
              class="name-input"
              @keyup.enter="detectGender"
            />
          </div>

          <div class="form-group">
            <label for="countrySelect">Country:</label>
            <select
              id="countrySelect"
              v-model="selectedCountry"
              class="country-select"
            >
              <option value="" disabled>Select a country...</option>
              <option v-for="country in sortedCountries" :key="country.value" :value="country.value">
                {{ country.flag }} {{ country.name }}
              </option>
            </select>
          </div>

          <button
            class="cute-btn detect-btn"
            @click="detectGender"
            :disabled="!name || selectedCountry === ''"
          >
            ✨ Detect Gender
          </button>
        </div>

        <div v-if="result" class="gender-result" :class="resultClass">
          <div class="result-emoji">{{ resultEmoji }}</div>
          <h2>{{ resultText }}</h2>
          <p v-if="name">Name: <strong>{{ name }}</strong></p>
          <p v-if="selectedCountryName">Country: <strong>{{ selectedCountry.flag }} {{ selectedCountryName }}</strong></p>
          <p v-if="confidence" class="confidence">Confidence: {{ confidence }}</p>
        </div>

        <div v-if="error" class="gender-error">
          <div class="emoji">⚠️</div>
          <p>{{ error }}</p>
        </div>

        <button class="cute-btn back-btn" @click="onBack">← Back</button>
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
      selectedCountry: 0, // Default to "Any Country"
      result: null,
      error: null,
      confidence: ''
    };
  },
  computed: {
    sortedCountries() {
      return [...COUNTRIES].sort((a, b) => {
        // Keep "Any Country" at the top
        if (a.value === 0) return -1;
        if (b.value === 0) return 1;
        return a.name.localeCompare(b.name);
      });
    },
    selectedCountryName() {
      const country = COUNTRIES.find(c => c.value === this.selectedCountry);
      return country ? country.name : '';
    },
    resultText() {
      if (!this.result) return '';

      const texts = {
        [GENDER_CONSTANTS.IS_FEMALE]: 'Female',
        [GENDER_CONSTANTS.IS_MOSTLY_FEMALE]: 'Mostly Female',
        [GENDER_CONSTANTS.IS_MALE]: 'Male',
        [GENDER_CONSTANTS.IS_MOSTLY_MALE]: 'Mostly Male',
        [GENDER_CONSTANTS.IS_UNISEX_NAME]: 'Unisex',
        [GENDER_CONSTANTS.IS_A_COUPLE]: 'Couple Name',
        [GENDER_CONSTANTS.NAME_NOT_FOUND]: 'Name Not Found',
        [GENDER_CONSTANTS.ERROR_IN_NAME]: 'Error in Name'
      };

      return texts[this.result] || 'Unknown';
    },
    resultEmoji() {
      if (!this.result) return '';

      const emojis = {
        [GENDER_CONSTANTS.IS_FEMALE]: '♀️',
        [GENDER_CONSTANTS.IS_MOSTLY_FEMALE]: '♀️',
        [GENDER_CONSTANTS.IS_MALE]: '♂️',
        [GENDER_CONSTANTS.IS_MOSTLY_MALE]: '♂️',
        [GENDER_CONSTANTS.IS_UNISEX_NAME]: '⚧️',
        [GENDER_CONSTANTS.IS_A_COUPLE]: '👫',
        [GENDER_CONSTANTS.NAME_NOT_FOUND]: '❓',
        [GENDER_CONSTANTS.ERROR_IN_NAME]: '⚠️'
      };

      return emojis[this.result] || '❓';
    },
    resultClass() {
      if (!this.result) return '';

      const classes = {
        [GENDER_CONSTANTS.IS_FEMALE]: 'result-female',
        [GENDER_CONSTANTS.IS_MOSTLY_FEMALE]: 'result-female-likely',
        [GENDER_CONSTANTS.IS_MALE]: 'result-male',
        [GENDER_CONSTANTS.IS_MOSTLY_MALE]: 'result-male-likely',
        [GENDER_CONSTANTS.IS_UNISEX_NAME]: 'result-unisex',
        [GENDER_CONSTANTS.IS_A_COUPLE]: 'result-couple',
        [GENDER_CONSTANTS.NAME_NOT_FOUND]: 'result-unknown',
        [GENDER_CONSTANTS.ERROR_IN_NAME]: 'result-error'
      };

      return classes[this.result] || '';
    }
  },
  methods: {
    async detectGender() {
      this.error = null;
      this.result = null;
      this.confidence = '';

      if (!this.name.trim()) {
        this.error = 'Please enter a name';
        return;
      }

      try {
        // Call backend API
        const response = await fetch('/api/gender', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name.trim(),
            country: this.selectedCountry
          })
        });

        if (!response.ok) {
          throw new Error('Failed to detect gender');
        }

        const data = await response.json();

        // Map backend response to constants
        const resultMap = {
          'female': GENDER_CONSTANTS.IS_FEMALE,
          'mostly_female': GENDER_CONSTANTS.IS_MOSTLY_FEMALE,
          'male': GENDER_CONSTANTS.IS_MALE,
          'mostly_male': GENDER_CONSTANTS.IS_MOSTLY_MALE,
          'unisex': GENDER_CONSTANTS.IS_UNISEX_NAME,
          'couple': GENDER_CONSTANTS.IS_A_COUPLE,
          'not_found': GENDER_CONSTANTS.NAME_NOT_FOUND,
          'error': GENDER_CONSTANTS.ERROR_IN_NAME
        };

        this.result = resultMap[data.gender] || GENDER_CONSTANTS.NAME_NOT_FOUND;

        // Set confidence if available
        if (data.probability) {
          this.confidence = `${Math.round(data.probability * 100)}%`;
        }

      } catch (err) {
        console.error('Gender detection error:', err);
        this.error = 'Failed to detect gender. Please try again.';
      }
    },
    onBack() {
      this.$emit('back');
    }
  }
};
