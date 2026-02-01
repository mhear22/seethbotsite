import { ref } from 'vue'

export function useCat() {
  const catImage = ref('https://cataas.com/cat')
  const catLoading = ref(false)

  const fetchNewCat = async () => {
    try {
      catLoading.value = true
      const response = await fetch('https://cataas.com/cat')
      if (!response.ok) {
        console.error('Failed to fetch cat:', response.status)
        return
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      catImage.value = imageUrl
    } catch (error) {
      console.error('Error fetching cat:', error)
    } finally {
      catLoading.value = false
    }
  }

  return {
    catImage,
    catLoading,
    fetchNewCat
  }
}
