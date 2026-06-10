/**
 * Tests for InfoCardsSection component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock the store
vi.mock('../../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

import InfoCardsSection from '../../../components/pages/QldRedistributionPage/InfoCardsSection.vue'

describe('InfoCardsSection', () => {
  it('renders the section heading', () => {
    const wrapper = mount(InfoCardsSection)
    expect(wrapper.find('h2').text()).toBe('How It Works')
  })

  it('renders 4 info cards', () => {
    const wrapper = mount(InfoCardsSection)
    expect(wrapper.findAll('.info-card')).toHaveLength(4)
  })

  it('renders Independent Commission card', () => {
    const wrapper = mount(InfoCardsSection)
    const cards = wrapper.findAll('.info-card')
    expect(cards[0].find('h3').text()).toBe('Independent Commission')
    expect(cards[0].text()).toContain('John Sosso')
  })

  it('renders First Review Since 2017 card', () => {
    const wrapper = mount(InfoCardsSection)
    const cards = wrapper.findAll('.info-card')
    expect(cards[1].find('h3').text()).toBe('First Review Since 2017')
    expect(cards[1].text()).toContain('demographic changes')
  })

  it('renders Seat Count: 93 card', () => {
    const wrapper = mount(InfoCardsSection)
    const cards = wrapper.findAll('.info-card')
    expect(cards[2].find('h3').text()).toBe('Seat Count: 93')
    expect(cards[2].text()).toContain('93 seats')
  })

  it('renders Public Consultation card', () => {
    const wrapper = mount(InfoCardsSection)
    const cards = wrapper.findAll('.info-card')
    expect(cards[3].find('h3').text()).toBe('Public Consultation')
    expect(cards[3].text()).toContain('objections')
  })

  it('has a link to the Sosso section', () => {
    const wrapper = mount(InfoCardsSection)
    const link = wrapper.find('a.read-more-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('#sosso-section')
  })
})
