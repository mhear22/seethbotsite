/**
 * Tests for MoldPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

import MoldPage from '../../components/pages/MoldPage.vue'

describe('MoldPage', () => {
  it('renders the page', () => {
    const wrapper = mount(MoldPage)
    expect(wrapper.find('.mold-page, .page').exists()).toBe(true)
  })

  it('has a heading', () => {
    const wrapper = mount(MoldPage)
    const heading = wrapper.find('h1, h2, h3')
    expect(heading.exists()).toBe(true)
  })
})
