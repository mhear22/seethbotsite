/**
 * Tests for KeanuPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

import KeanuPage from '../../components/pages/KeanuPage.vue'

describe('KeanuPage', () => {
  it('renders the page title', () => {
    const wrapper = mount(KeanuPage)
    expect(wrapper.find('h1').text()).toContain('Keanu')
  })

  it('renders the subtitle', () => {
    const wrapper = mount(KeanuPage)
    expect(wrapper.find('.subtitle').text()).toContain('Keanu')
  })

  it('renders the refresh all button', () => {
    const wrapper = mount(KeanuPage)
    const btn = wrapper.find('.refresh-button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Refresh All')
  })

  it('has the keanu-page class', () => {
    const wrapper = mount(KeanuPage)
    expect(wrapper.find('.keanu-page').exists()).toBe(true)
  })

  it('renders the header section', () => {
    const wrapper = mount(KeanuPage)
    expect(wrapper.find('.keanu-header').exists()).toBe(true)
  })

  it('loads 6 Keanu images after mount', async () => {
    const wrapper = mount(KeanuPage)
    await flushPromises()
    const cards = wrapper.findAll('.keanu-card')
    expect(cards).toHaveLength(6)
  })

  it('displays Keanu images from placekeanu.com', async () => {
    const wrapper = mount(KeanuPage)
    await flushPromises()
    const images = wrapper.findAll('.keanu-image')
    expect(images).toHaveLength(6)
    images.forEach(img => {
      expect(img.attributes('src')).toContain('placekeanu.com')
    })
  })

  it('has refresh button on each card', async () => {
    const wrapper = mount(KeanuPage)
    await flushPromises()
    const refreshBtns = wrapper.findAll('.refresh-single-button')
    expect(refreshBtns).toHaveLength(6)
  })

  it('renders footer with placekeanu.com link', () => {
    const wrapper = mount(KeanuPage)
    const footer = wrapper.find('.footer-note')
    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('PlaceKeanu.com')
    const link = footer.find('a')
    expect(link.attributes('href')).toBe('https://placekeanu.com/')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('images have correct alt text', async () => {
    const wrapper = mount(KeanuPage)
    await flushPromises()
    const images = wrapper.findAll('.keanu-image')
    images.forEach((img, index) => {
      expect(img.attributes('alt')).toContain('Keanu Reeves')
      expect(img.attributes('alt')).toContain(String(index + 1))
    })
  })
})
