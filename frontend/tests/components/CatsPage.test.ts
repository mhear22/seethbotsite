/**
 * Tests for CatsPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const mockNextCat = vi.fn()
const mockAppStore = {
  catImage: 'https://example.com/cat.jpg',
  catLoading: false,
  nextCat: mockNextCat,
  darkMode: false
}

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => mockAppStore
}))

vi.mock('../../components/panels/CatPanel.vue', () => ({
  default: {
    name: 'CatPanel',
    template: '<div class="mock-cat-panel" />',
    props: ['catImage', 'loading', 'centered'],
    emits: ['new-cat']
  }
}))

import CatsPage from '../../components/pages/CatsPage.vue'

describe('CatsPage', () => {
  it('renders the page title', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('h1').text()).toContain('Cats')
  })

  it('renders the subtitle', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('.subtitle').text()).toContain('Click to get a random cat!')
  })

  it('renders the page header', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('.page-header').exists()).toBe(true)
  })

  it('renders CatPanel component', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.findComponent({ name: 'CatPanel' }).exists()).toBe(true)
  })

  it('has the cats-page class', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('.cats-page').exists()).toBe(true)
  })

  it('has the cats container', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('.cats-container').exists()).toBe(true)
  })

  it('has the page class', () => {
    const wrapper = mount(CatsPage)
    expect(wrapper.find('.page').exists()).toBe(true)
  })
})
