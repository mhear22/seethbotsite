/**
 * Tests for ClocksPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

// Mock all child components
vi.mock('../../components/shared/clocks/WorldClockList.vue', () => ({
  default: { name: 'WorldClockList', template: '<div class="mock-world-clock-list" />', props: ['clocks', 'showSeconds'] }
}))
vi.mock('../../components/shared/clocks/TimeComparisonBars.vue', () => ({
  default: { name: 'TimeComparisonBars', template: '<div class="mock-time-comparison" />', props: ['clocks'] }
}))
vi.mock('../../components/shared/clocks/HolidaysDisplay.vue', () => ({
  default: { name: 'HolidaysDisplay', template: '<div class="mock-holidays" />' }
}))
vi.mock('../../components/shared/clocks/BirdSoundsPlayer.vue', () => ({
  default: { name: 'BirdSoundsPlayer', template: '<div class="mock-bird-sounds"></div>' }
}))

import ClocksPage from '../../components/pages/ClocksPage.vue'

describe('ClocksPage', () => {
  it('renders the page title', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.find('h1').text()).toContain('World Clocks')
  })

  it('renders the subtitle', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.find('.subtitle').text()).toContain('Current time across different timezones')
  })

  it('renders WorldClockList component', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.findComponent({ name: 'WorldClockList' }).exists()).toBe(true)
  })

  it('renders TimeComparisonBars component', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.findComponent({ name: 'TimeComparisonBars' }).exists()).toBe(true)
  })

  it('renders HolidaysDisplay component', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.findComponent({ name: 'HolidaysDisplay' }).exists()).toBe(true)
  })

  it('renders BirdSoundsPlayer component', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.findComponent({ name: 'BirdSoundsPlayer' }).exists()).toBe(true)
  })

  it('renders footer notes', () => {
    const wrapper = mount(ClocksPage)
    const footer = wrapper.find('.footer-note')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('Australia/Brisbane')
    expect(footer.text()).toContain('Updates every second')
  })

  it('has the clocks-page class', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.find('.clocks-page').exists()).toBe(true)
  })

  it('renders the header section', () => {
    const wrapper = mount(ClocksPage)
    expect(wrapper.find('.clocks-header').exists()).toBe(true)
  })
})
