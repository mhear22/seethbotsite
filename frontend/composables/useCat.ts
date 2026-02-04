import { ref, onMounted } from 'vue'

export function useCat() {
  const catImage = ref('')
  const catLoading = ref(true)

  const fetchNewCat = async () => {
    try {
      catLoading.value = true
      const response = await fetch('https://api.thecatapi.com/v1/images/search?size=med')
      if (!response.ok) {
        console.error('Failed to fetch cat:', response.status)
        return
      }

      const data = await response.json()
      if (data && data.length > 0 && data[0].url) {
        catImage.value = data[0].url
      } else {
        console.error('Invalid cat API response:', data)
      }
    } catch (error) {
      console.error('Error fetching cat:', error)
    } finally {
      catLoading.value = false
    }
  }

  // Fetch initial cat image on mount
  onMounted(() => {
    fetchNewCat()
  })

  return {
    catImage,
    catLoading,
    fetchNewCat
  }
}
