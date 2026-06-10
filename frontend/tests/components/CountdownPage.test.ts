/**
 * Tests for CountdownPage component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CountdownPage from '../../components/pages/CountdownPage.vue'

const mockStore = {
  darkMode: false,
} as any

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => mockStore
}))

describe('CountdownPage', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.darkMode = false
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders the page container', () => {
    wrapper = mount(CountdownPage)
    expect(wrapper.find('.countdown-page').exists()).toBe(true)
  })

  it('renders the countdown header with title', () => {
    wrapper = mount(CountdownPage)
    expect(wrapper.find('.countdown-header h1').text()).toContain('Game Release Countdowns')
  })

  it('renders the subtitle', () => {
    wrapper = mount(CountdownPage)
    expect(wrapper.find('.subtitle').exists()).toBe(true)
  })

  it('renders countdown cards for each release', () => {
    wrapper = mount(CountdownPage)
    const cards = wrapper.findAll('.countdown-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders game titles for releases', () => {
    wrapper = mount(CountdownPage)
    const cards = wrapper.findAll('.countdown-card')
    
    const titles = cards.map(c => c.find('.game-title').text())
    expect(titles.some(t => t.includes('Slay The Spire'))).toBe(true)
    expect(titles.some(t => t.includes('Heat Death'))).toBe(true)
  })

  it('shows released badge for past releases', () => {
    wrapper = mount(CountdownPage)
    const cards = wrapper.findAll('.countdown-card')
    
    const releasedCard = cards.find(c => c.classes('released'))
    expect(releasedCard).toBeDefined()
    expect(releasedCard!.find('.released-badge').exists()).toBe(true)
  })

  it('renders countdown timer for upcoming releases', () => {
    wrapper = mount(CountdownPage)
    const cards = wrapper.findAll('.countdown-card')
    
    const activeCards = cards.filter(c => !c.classes('released'))
    expect(activeCards.some(c => c.find('.timer').exists())).toBe(true)
  })

  it('renders time units (days, hours, minutes, seconds)', () => {
    wrapper = mount(CountdownPage)
    const timer = wrapper.find('.timer')
    expect(timer.exists()).toBe(true)
    
    const timeUnits = timer.findAll('.time-unit')
    expect(timeUnits.length).toBe(4)
  })

  it('renders footer note section', () => {
    wrapper = mount(CountdownPage)
    expect(wrapper.find('.footer-note').exists()).toBe(true)
  })

  it('applies dark class when store has darkMode=true', () => {
    mockStore.darkMode = true
    wrapper = mount(CountdownPage)
    expect(wrapper.classes('dark')).toBe(true)
  })
})
