import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CatPanel from '../../components/panels/CatPanel.vue'

const toggleFavorite = vi.fn()
const isFavorite = vi.fn(() => false)

vi.mock('../../composables/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite,
    isFavorite,
  }),
}))

describe('CatPanel', () => {
  beforeEach(() => {
    toggleFavorite.mockReset()
    isFavorite.mockReset()
    isFavorite.mockReturnValue(false)
  })

  it('renders fallback game link with safe rel attributes', () => {
    const wrapper = mount(CatPanel, {
      props: {
        isOpen: true,
        catImage: 'https://example.com/cat.png',
        loading: false,
      },
    })

    const fallbackLink = wrapper.find('.cat-game-link')
    expect(fallbackLink.exists()).toBe(true)
    expect(fallbackLink.attributes('target')).toBe('_blank')
    expect(fallbackLink.attributes('rel')).toBe('noopener noreferrer')
  })

  it('does not render anchor elements as children of iframe', () => {
    mount(CatPanel, {
      props: {
        isOpen: true,
        catImage: 'https://example.com/cat.png',
        loading: false,
      },
    })

    expect(document.querySelector('.cat-game-iframe a')).toBeNull()
  })

  it('emits new-cat when refresh button is clicked', async () => {
    const wrapper = mount(CatPanel, {
      props: {
        isOpen: true,
        catImage: 'https://example.com/cat.png',
        loading: false,
      },
    })

    await wrapper.find('.cute-btn').trigger('click')
    expect(wrapper.emitted('new-cat')).toBeTruthy()
  })
})
