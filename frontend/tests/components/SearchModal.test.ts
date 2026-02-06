/**
 * Tests for SearchModal component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import SearchModal from '../../components/shared/ui/SearchModal.vue'

describe('SearchModal', () => {
  let wrapper: VueWrapper

  const mockTickets = [
    { id: 1, title: 'Fix login bug', description: 'Login form broken', status: 'open', type: 'bug', priority: 'high' },
    { id: 2, title: 'Add dark mode', description: 'Theme support', status: 'closed', type: 'feature', priority: 'medium' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Mock fetch for ticket loading
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tickets: mockTickets }),
    }) as any
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
  })

  it('does not render when isOpen is false', () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: false },
    })

    expect(document.body.querySelector('.search-modal-overlay')).toBeNull()
  })

  it('renders search input when isOpen is true', () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const input = document.body.querySelector('.search-input')
    expect(input).not.toBeNull()
    expect(input?.getAttribute('placeholder')).toContain('Search')
  })

  it('shows empty state when no query is entered', () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const emptyState = document.body.querySelector('.search-empty')
    expect(emptyState).not.toBeNull()
    expect(emptyState?.textContent).toContain('Start typing to search')
  })

  it('filters pages by search query', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const input = document.body.querySelector('.search-input') as HTMLInputElement
    input.value = 'Fish'
    input.dispatchEvent(new Event('input'))
    await flushPromises()

    const results = document.body.querySelectorAll('.result-item')
    expect(results.length).toBeGreaterThan(0)

    const titles = Array.from(results).map(r => r.querySelector('.result-title')?.textContent)
    expect(titles).toContain('Fishing')
  })

  it('shows matching page results with icon and subtitle', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const input = document.body.querySelector('.search-input') as HTMLInputElement
    input.value = 'Cats'
    input.dispatchEvent(new Event('input'))
    await flushPromises()

    const result = document.body.querySelector('.result-item')
    expect(result).not.toBeNull()
    expect(result?.querySelector('.result-title')?.textContent).toBe('Cats')
    expect(result?.querySelector('.result-subtitle')?.textContent).toBe('Page')
  })

  it('shows no results found for non-matching query', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const input = document.body.querySelector('.search-input') as HTMLInputElement
    input.value = 'xyznonexistent123'
    input.dispatchEvent(new Event('input'))
    await flushPromises()

    const emptyState = document.body.querySelector('.search-empty')
    expect(emptyState).not.toBeNull()
    expect(emptyState?.textContent).toContain('No results found')
  })

  it('emits close on Escape key', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)
    await flushPromises()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close on overlay click', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const overlay = document.body.querySelector('.search-modal-overlay') as HTMLElement
    overlay.click()
    await flushPromises()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('navigates on result selection via Enter key', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: true },
    })

    const input = document.body.querySelector('.search-input') as HTMLInputElement
    input.value = 'Fishing'
    input.dispatchEvent(new Event('input'))
    await flushPromises()

    // Press Enter to select the first result
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    document.dispatchEvent(enterEvent)
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/fishing')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('loads tickets when opened', async () => {
    wrapper = mount(SearchModal, {
      props: { isOpen: false },
    })

    await wrapper.setProps({ isOpen: true })
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledWith('/api/tickets?sortBy=updated_at&limit=100')
  })
})
