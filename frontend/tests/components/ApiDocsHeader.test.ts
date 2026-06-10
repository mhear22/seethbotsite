/**
 * Tests for ApiDocsHeader component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import ApiDocsHeader from '../../components/pages/ApiDocsHeader.vue'

describe('ApiDocsHeader', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(ApiDocsHeader, { props: { loading: false } })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the title with emoji', () => {
    expect(wrapper.find('h1').text()).toContain('📚 API Documentation')
  })

  it('renders the subtitle description', () => {
    expect(wrapper.find('.api-docs-header p').text()).toBe('Interactive API documentation and testing interface')
  })

  it('renders a refresh button with correct text', () => {
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('🔄 Refresh')
  })

  it('shows loading text when loading', async () => {
    const w = mount(ApiDocsHeader, { props: { loading: true } })
    expect(w.find('button').text()).toContain('Refreshing')
    w.unmount()
  })

  it('disables the refresh button when loading', async () => {
    const w = mount(ApiDocsHeader, { props: { loading: true } })
    expect(w.find('button[disabled]').exists()).toBe(true)
    w.unmount()
  })

  it('emits refresh event when button clicked', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })

  it('does not emit refresh when disabled (loading)', async () => {
    const w = mount(ApiDocsHeader, { props: { loading: true } })
    await w.find('button').trigger('click')
    expect(w.emitted('refresh')).toBeUndefined()
    w.unmount()
  })
})
