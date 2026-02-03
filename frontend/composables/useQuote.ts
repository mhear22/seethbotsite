import { ref } from 'vue'
import { generalRepository } from '../repositories/general.repository'

export const useQuote = () => {
  const currentQuote = ref('Loading quote...')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRandomQuote = async () => {
    loading.value = true
    error.value = null

    try {
      const quote = await generalRepository.getQuote()

      if (quote.text) {
        currentQuote.value = quote.text
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
