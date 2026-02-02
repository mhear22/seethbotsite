import { ref } from 'vue'

export const useQuote = () => {
  const currentQuote = ref('Loading quote...')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRandomQuote = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/quote')
      const data = await response.json()

      if (data.quote) {
        currentQuote.value = data.quote
      } else {
        currentQuote.value = 'Stay curious, keep asking questions.'
      }
    } catch (err) {
      console.error('Error fetching quote:', err)
      error.value = 'Failed to load quote'
      currentQuote.value = 'Stay curious, keep asking questions.'
    } finally {
      loading.value = false
    }
  }

  // Load a quote on mount
  fetchRandomQuote()

  return {
    currentQuote,
    loading,
    error,
    fetchRandomQuote
  }
}
