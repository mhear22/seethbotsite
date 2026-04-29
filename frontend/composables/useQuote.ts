import { ref } from 'vue'
import { generalRepository } from '../repositories/general.repository'

// Local fallback quotes for resilience (Ticket #31)
const FALLBACK_QUOTES = [
  "Stay curious, keep asking questions.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Simplicity is the soul of efficiency.",
  "Any sufficiently advanced technology is indistinguishable from magic.",
  "The only way to go fast is to go well."
]

// Local fallback advice for when external API fails
const FALLBACK_ADVICE = [
  "Take breaks often, your brain needs rest.",
  "Drink more water, stay hydrated.",
  "Clear your desk, clear your mind.",
  "Start small, think big.",
  "Done is better than perfect."
]

export const useQuote = () => {
  const currentQuote = ref('Loading quote...')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRandomQuote = async () => {
    loading.value = true
    error.value = null

    try {
      // Fetch both quote and advice with proper error handling
      const [quoteResult, adviceResult] = await Promise.allSettled([
        generalRepository.getQuote(),
        fetch('https://api.adviceslip.com/advice', { signal: AbortSignal.timeout(3000) })
          .then(res => res.json())
          .catch(() => null)
      ])

      // Extract quote text with fallback
      const quoteText = quoteResult.status === 'fulfilled'
        ? (quoteResult.value?.text || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)])
        : FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]

      // Extract advice with fallback
      const adviceText = adviceResult.status === 'fulfilled' && adviceResult.value?.slip?.advice
        ? adviceResult.value.slip.advice
        : FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)]

      // Combine quote and advice
      currentQuote.value = `${quoteText}\n\n💡 ${adviceText}`
    } catch (err) {
      console.error('Error fetching quote:', err)
      error.value = 'Failed to load quote'
      // Use fallback quote + advice combo
      const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
      const randomAdvice = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)]
      currentQuote.value = `${randomQuote}\n\n💡 ${randomAdvice}`
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
