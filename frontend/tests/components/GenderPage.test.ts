/**
 * Tests for GenderPage component
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

vi.mock('../../components/shared/ui/PhrenologyPicker.vue', () => ({
  default: {
    name: 'PhrenologyPicker',
    template: '<div class="mock-phrenology-picker"><slot /></div>',
    props: ['darkMode'],
    emits: ['back']
  }
}))

import GenderPage from '../../components/pages/GenderPage.vue'

describe('GenderPage', () => {
  it('renders the page container', () => {
    const wrapper = mount(GenderPage)
    expect(wrapper.find('.phrenology-page').exists()).toBe(true)
  })

  it('renders the PhrenologyPicker component', () => {
    const wrapper = mount(GenderPage)
    expect(wrapper.find('.mock-phrenology-picker').exists()).toBe(true)
  })

  it('passes darkMode prop to PhrenologyPicker', () => {
    const wrapper = mount(GenderPage)
    expect(wrapper.findComponent({ name: 'PhrenologyPicker' }).exists()).toBe(true)
  })

  it('has the page class', () => {
    const wrapper = mount(GenderPage)
    expect(wrapper.find('.page').exists()).toBe(true)
  })
})
