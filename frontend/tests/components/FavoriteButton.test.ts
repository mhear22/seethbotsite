/**
 * Tests for FavoriteButton component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const mockPlayClick = vi.fn()
const mockPlaySuccess = vi.fn()
const mockIsFavorited = vi.fn(() => false)
const mockToggleFavorite = vi.fn(() => Promise.resolve(true))

vi.mock('../../composables/useAudio', () => ({
  useAudio: () => ({
    playClick: mockPlayClick,
    playSuccess: mockPlaySuccess,
  }),
}))

vi.mock('../../stores/useFavoritesStore', () => ({
  useFavoritesStore: () => ({
    isFavorited: mockIsFavorited,
    toggleFavorite: mockToggleFavorite,
  }),
}))

import FavoriteButton from '../../components/shared/ui/FavoriteButton.vue'

describe('FavoriteButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockIsFavorited.mockReturnValue(false)
  })

  it('renders with default size (medium)', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.classes()).toContain('favorite-button')
    expect(button.classes()).toContain('size-medium')
  })

  it('renders with small size', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'panel',
        itemId: 'test-panel',
        displayName: 'Test Panel',
        size: 'small',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('size-small')
  })

  it('renders with large size', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'feature',
        itemId: 'test-feature',
        displayName: 'Test Feature',
        size: 'large',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('size-large')
  })

  it('renders star icon', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const icon = wrapper.find('.favorite-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.text()).toBe('★')
  })

  it('calls toggleFavorite when clicked', async () => {
    mockToggleFavorite.mockResolvedValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1)
    expect(mockToggleFavorite).toHaveBeenCalledWith('page', 'test-page', 'Test Page')
  })

  it('plays success sound when toggle succeeds', async () => {
    mockToggleFavorite.mockResolvedValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockPlaySuccess).toHaveBeenCalled()
  })

  it('plays click sound when toggle fails', async () => {
    mockToggleFavorite.mockResolvedValue(false)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockPlayClick).toHaveBeenCalled()
  })

  it('does not toggle while processing', async () => {
    let resolvePromise: ((value: boolean) => void) | null = null
    mockToggleFavorite.mockImplementation(() => {
      return new Promise(resolve => {
        resolvePromise = resolve
      })
    })

    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const promise = wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    // Click again while processing
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    // Should only call toggleFavorite once
    expect(mockToggleFavorite).toHaveBeenCalledTimes(1)

    // Resolve the promise
    if (resolvePromise) resolvePromise(true)
    await promise
  })

  it('has correct title when not favorited', () => {
    mockIsFavorited.mockReturnValue(false)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Add to favorites')
  })

  it('has correct title when favorited', () => {
    mockIsFavorited.mockReturnValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Remove from favorites')
  })

  it('applies favorited class when favorited', () => {
    mockIsFavorited.mockReturnValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('is-favorited')
  })

  it('shows text for large size', () => {
    mockIsFavorited.mockReturnValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
        size: 'large',
      },
    })

    const text = wrapper.find('.favorite-text')
    expect(text.exists()).toBe(true)
    expect(text.text()).toBe('Favorited')
  })

  it('does not show text for medium size', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
        size: 'medium',
      },
    })

    const text = wrapper.find('.favorite-text')
    expect(text.exists()).toBe(false)
  })

  it('emits toggle event when favorited', async () => {
    mockIsFavorited.mockReturnValue(false)
    mockToggleFavorite.mockResolvedValue(true)
    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')?.[0]).toEqual([true])
  })

  it('disables button while processing', async () => {
    let resolvePromise: ((value: boolean) => void) | null = null
    mockToggleFavorite.mockImplementation(() => {
      return new Promise(resolve => {
        resolvePromise = resolve
      })
    })

    const wrapper = mount(FavoriteButton, {
      props: {
        itemType: 'page',
        itemId: 'test-page',
        displayName: 'Test Page',
      },
    })

    const promise = wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()

    if (resolvePromise) resolvePromise(true)
    await promise
  })
})
