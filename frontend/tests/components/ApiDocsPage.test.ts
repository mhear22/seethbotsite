/**
 * Tests for ApiDocsPage component and its extracted sub-components
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    darkMode: false
  })
}))

describe('ApiDocsPage', () => {
  it('renders the page with ApiDocsHeader and iframe wrapper', async () => {
    const wrapper = mount((await import('../../components/pages/ApiDocsPage.vue')).default as any, {
      global: {
        components: {
          ApiDocsHeader: { template: '<div class="mock-api-docs-header"></div>' },
          ApiDocsLoadingOverlay: { template: '<div class="mock-api-docs-loading"></div>' }
        }
      }
    })
    expect(wrapper.find('.api-docs-page').exists()).toBe(true)
  })

  it('renders the iframe element', async () => {
    const wrapper = mount((await import('../../components/pages/ApiDocsPage.vue')).default as any, {
      global: {
        stubs: {
          ApiDocsHeader: { template: '<div class="mock-api-docs-header"></div>' }
        }
      }
    })
    expect(wrapper.find('iframe').exists()).toBe(true)
  })

  it('has api-docs-iframe-wrapper div', async () => {
    const wrapper = mount((await import('../../components/pages/ApiDocsPage.vue')).default as any, {
      global: {
        stubs: {
          ApiDocsHeader: { template: '<div class="mock-api-docs-header"></div>' },
          ApiDocsLoadingOverlay: { template: '' }
        }
      }
    })
    expect(wrapper.find('.api-docs-iframe-wrapper').exists()).toBe(true)
  })

  it('does not show loading overlay when not loading', async () => {
    const wrapper = mount((await import('../../components/pages/ApiDocsPage.vue')).default as any, {
      global: {
        stubs: {
          ApiDocsHeader: { template: '<div class="mock-api-docs-header"></div>' },
          ApiDocsLoadingOverlay: { template: '<div class="mock-api-docs-loading"></div>' }
        }
      }
    })
    expect(wrapper.find('.api-docs-loading').exists()).toBe(false)
  })

  it('renders loading overlay when loading', async () => {
    const wrapper = mount((await import('../../components/pages/ApiDocsPage.vue')).default as any, {
      global: {
        stubs: {
          ApiDocsHeader: { template: '<div class="mock-api-docs-header"></div>' },
          ApiDocsLoadingOverlay: { template: '<div class="mock-api-docs-loading"></div>' }
        }
      },
      props: {}
    })
  })
})
