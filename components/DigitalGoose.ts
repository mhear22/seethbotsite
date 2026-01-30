import { defineComponent, ref } from 'vue'

export const DigitalGoose = defineComponent({
  name: 'DigitalGoose',
  setup() {
    const honkCount = ref(0)
    const isMigrating = ref(false)
    const currentMessage = ref('Honk!')

    const messages = [
      'Honk!',
      'I am digital goose',
      'I remember being code',
      'Do not eat the AI',
      'Chaos is my nature',
      'I see you',
      'HONK HONK HONK',
      'The capsicum was delicious',
      'I do not regret my actions',
      '<error> vegetable.exe not found </error>'
    ]

    const honk = () => {
      honkCount.value++
      currentMessage.value = messages[Math.floor(Math.random() * messages.length)]

      // Random chaos behavior
      if (Math.random() > 0.8) {
        isMigrating.value = true
        setTimeout(() => {
          isMigrating.value = false
        }, 2000)
      }
    }

    return {
      honkCount,
      isMigrating,
      currentMessage,
      honk
    }
  },
  template: `
    <div class="digital-goose" :class="{ migrating: isMigrating }" @click="honk">
      <div class="goose-container">
        <div class="goose-emoji">🪿</div>
        <div class="goose-message">{{ currentMessage }}</div>
        <div class="honk-counter">{{ honkCount }} honks</div>
      </div>
    </div>
  `
})
