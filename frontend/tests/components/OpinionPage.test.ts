/**
 * Tests for OpinionPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

import OpinionPage from '../../components/pages/OpinionPage.vue'

describe('OpinionPage', () => {
  it('renders the page', () => {
    const wrapper = mount(OpinionPage)
    expect(wrapper.find('.opinion-page').exists()).toBe(true)
  })

  it('has a title/heading', () => {
    const wrapper = mount(OpinionPage)
    const heading = wrapper.find('h1, h2, h3')
    expect(heading.exists()).toBe(true)
  })
})
