/**
 * Tests for AboutPage component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AboutPage from '../../components/pages/AboutPage.vue'

const mockStore = {
  darkMode: false,
} as any

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => mockStore
}))

describe('AboutPage', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.darkMode = false
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders the page with about-page class and dark mode binding', () => {
    wrapper = mount(AboutPage)
    expect(wrapper.find('.about-page').exists()).toBe(true)
    expect(wrapper.classes('about-page')).toBe(true)
  })

  it('renders the about heading', () => {
    wrapper = mount(AboutPage)
    expect(wrapper.find('h1').text()).toContain('About')
  })

  it('renders the subtitle', () => {
    wrapper = mount(AboutPage)
    expect(wrapper.find('.subtitle').exists()).toBe(true)
  })

  it('renders the Features section with feature list items', () => {
    wrapper = mount(AboutPage)
    const sections = wrapper.findAll('.about-section')
    expect(sections.length).toBeGreaterThan(0)

    const featureSection = sections.find(s => s.find('h2').text().includes('Features'))
    expect(featureSection).toBeDefined()

    const featureItems = featureSection!.findAll('.feature-list li')
    expect(featureItems.length).toBeGreaterThan(5)
  })

  it('renders the Tech Stack section with tech grid items', () => {
    wrapper = mount(AboutPage)
    const sections = wrapper.findAll('.about-section')

    const techSection = sections.find(s => s.find('h2').text().includes('Tech Stack'))
    expect(techSection).toBeDefined()

    const techItems = techSection!.findAll('.tech-item')
    expect(techItems.length).toBeGreaterThan(0)
  })

  it('renders the Stats section with stat items', () => {
    wrapper = mount(AboutPage)
    const sections = wrapper.findAll('.about-section')

    const statsSection = sections.find(s => s.find('h2').text().includes('Stats'))
    expect(statsSection).toBeDefined()

    const statItems = statsSection!.findAll('.stat-item')
    expect(statItems.length).toBeGreaterThan(0)
  })

  it('renders links section with link cards', () => {
    wrapper = mount(AboutPage)
    const sections = wrapper.findAll('.about-section')

    const linksSection = sections.find(s => s.find('h2').text().includes('Links'))
    expect(linksSection).toBeDefined()

    const linkCards = linksSection!.findAll('.link-card')
    expect(linkCards.length).toBeGreaterThan(0)
  })

  it('renders footer', () => {
    wrapper = mount(AboutPage)
    expect(wrapper.find('.about-footer').exists()).toBe(true)
  })

  it('applies dark class when store has darkMode=true', () => {
    mockStore.darkMode = true
    wrapper = mount(AboutPage)
    expect(wrapper.classes('dark')).toBe(true)
  })

  it('does not apply dark class when store has darkMode=false', () => {
    mockStore.darkMode = false
    wrapper = mount(AboutPage)
    expect(wrapper.classes('dark')).toBe(false)
  })
})
