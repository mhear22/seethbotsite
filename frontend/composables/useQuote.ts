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
      // Fetch both quote and advice
      const [quote, adviceResponse] = await Promise.all([
        generalRepository.getQuote(),
        fetch('https://api.adviceslip.com/advice').then(res => res.json())
      ])

      const quoteText = quote.text || 'Stay curious, keep asking questions.'
      const adviceText = adviceResponse.slip?.advice || ''

      // Combine quote and advice
      if (adviceText) {
        currentQuote.value = `${quoteText}\n\n💡 ${adviceText}`
      } else {
        currentQuote.value = quoteText
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
