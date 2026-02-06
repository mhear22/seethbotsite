/**
 * Tests for FavoriteButton component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FavoriteButton from '../../../components/shared/ui/FavoriteButton.vue'

// Mock the useFavorites composable
vi.mock('../../../composables/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
  }),
}))

describe('FavoriteButton', () => {
  let mockToggleFavorite: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    const { useFavorites } = require('../../../composables/useFavorites')
    mockToggleFavorite = useFavorites().toggleFavorite
  })

  it('renders with default size (medium)', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.classes()).toContain('w-10')
    expect(button.classes()).toContain('h-10')
  })

  it('renders with small size', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
        size: 'small',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('w-8')
    expect(button.classes()).toContain('h-8')
  })

  it('renders with large size', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
        size: 'large',
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('w-12')
    expect(button.classes()).toContain('h-12')
  })

  it('renders star icon', () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const icon = wrapper.find('.favorite-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.text()).toBe('⭐')
  })

  it('calls toggleFavorite when clicked', async () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    await wrapper.find('button').trigger('click')

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1)
    expect(mockToggleFavorite).toHaveBeenCalledWith('cat', { id: 'test-cat-1', name: 'Test Cat' })
  })

  it('stops event propagation when clicked', async () => {
    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const mockEvent = {
      stopPropagation: vi.fn(),
    }

    await wrapper.vm.handleClick(mockEvent)

    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
  })

  it('has correct title when not favorited', () => {
    const { useFavorites } = require('../../../composables/useFavorites')
    useFavorites().isFavorite.mockReturnValue(false)

    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('title')).toBe('Add to favorites')
  })

  it('has correct title when favorited', () => {
    const { useFavorites } = require('../../../composables/useFavorites')
    useFavorites().isFavorite.mockReturnValue(true)

    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('title')).toBe('Remove from favorites')
  })

  it('applies favorited class when favorited', () => {
    const { useFavorites } = require('../../../composables/useFavorites')
    useFavorites().isFavorite.mockReturnValue(true)

    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).toContain('favorited')
  })

  it('does not apply favorited class when not favorited', () => {
    const { useFavorites } = require('../../../composables/useFavorites')
    useFavorites().isFavorite.mockReturnValue(false)

    const wrapper = mount(FavoriteButton, {
      props: {
        type: 'cat',
        data: { id: 'test-cat-1', name: 'Test Cat' },
      },
    })

    const button = wrapper.find('button')
    expect(button.classes()).not.toContain('favorited')
  })
})
