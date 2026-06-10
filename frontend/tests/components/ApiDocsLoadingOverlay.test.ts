/**
 * Tests for ApiDocsLoadingOverlay component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApiDocsLoadingOverlay from '../../components/pages/ApiDocsLoadingOverlay.vue'

describe('ApiDocsLoadingOverlay', () => {
  it('renders the loading spinner', () => {
    const wrapper = mount(ApiDocsLoadingOverlay)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('renders the loading text', () => {
    const wrapper = mount(ApiDocsLoadingOverlay)
    expect(wrapper.text()).toContain('Loading API documentation...')
  })
})
