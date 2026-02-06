/**
 * Tests for QuoteSection component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const mockToggleFavorite = vi.fn()
const mockIsFavorite = vi.fn(() => false)

vi.mock('../../composables/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}))

import QuoteSection from '../../components/shared/ui/QuoteSection.vue'

describe('QuoteSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsFavorite.mockReturnValue(false)
  })

  it('renders quote text', () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Test quote here',
      },
    })

    const quoteText = wrapper.find('.quote-text')
    expect(quoteText.exists()).toBe(true)
    expect(quoteText.text()).toContain('Test quote here')
  })

  it('formats quote with quotes around it', () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Simple quote',
      },
    })

    const quoteText = wrapper.find('.quote-text')
    expect(quoteText.html()).toContain('"Simple quote"')
  })

  it('splits quote with \\n\\n into advice section', () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Main quote\n\nAdvice part',
      },
    })

    const quoteText = wrapper.find('.quote-text')
    const html = quoteText.html()
    expect(html).toContain('"Main quote"')
    expect(html).toContain('<span class="advice-section">Advice part</span>')
  })

  it('emits next-quote on quote text click', async () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Click me',
      },
    })

    await wrapper.find('.quote-text').trigger('click')

    expect(wrapper.emitted('next-quote')).toBeTruthy()
    expect(wrapper.emitted('next-quote')).toHaveLength(1)
  })

  it('shows favorite button', () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Test quote',
      },
    })

    const favBtn = wrapper.find('.favorite-btn')
    expect(favBtn.exists()).toBe(true)
  })

  it('favorite button calls toggleFavorite on click', async () => {
    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Test quote',
      },
    })

    await wrapper.find('.favorite-btn').trigger('click')

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('favorite button has favorited class when isFavorite returns true', () => {
    mockIsFavorite.mockReturnValue(true)

    const wrapper = mount(QuoteSection, {
      props: {
        currentQuote: 'Favorited quote',
      },
    })

    const favBtn = wrapper.find('.favorite-btn')
    expect(favBtn.classes()).toContain('favorited')
  })
})
