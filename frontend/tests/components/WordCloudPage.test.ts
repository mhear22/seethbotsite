/**
 * Tests for WordCloudPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

import WordCloudPage from '../../components/pages/WordCloudPage.vue'

describe('WordCloudPage', () => {
  it('renders the page', () => {
    const wrapper = mount(WordCloudPage)
    expect(wrapper.find('.wordcloud-page').exists()).toBe(true)
  })

  it('has a heading', () => {
    const wrapper = mount(WordCloudPage)
    const heading = wrapper.find('h1, h2, h3')
    expect(heading.exists()).toBe(true)
  })
})
