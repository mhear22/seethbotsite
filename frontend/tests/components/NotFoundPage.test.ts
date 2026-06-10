/**
 * Tests for NotFoundPage component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import NotFoundPage from '../../components/pages/NotFoundPage.vue'

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
} as any

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/nonexistent-page' }),
  useRouter: () => mockRouter,
}))

describe('NotFoundPage', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders the error code "404"', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.error-code').exists()).toBe(true)
    expect(wrapper.find('.error-code').text()).toBe('404')
  })

  it('renders the error title "Page Not Found"', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.error-title').exists()).toBe(true)
    expect(wrapper.find('.error-title').text()).toBe('Page Not Found')
  })

  it('displays the route path in the message', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('/nonexistent-page')
  })

  it('renders Go Home button', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.btn-primary').exists()).toBe(true)
    expect(wrapper.find('.btn-primary').text()).toBe('Go Home')
  })

  it('renders Go Back button', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.btn-secondary').exists()).toBe(true)
    expect(wrapper.find('.btn-secondary').text()).toBe('Go Back')
  })

  it('calls router.push("/") when Go Home is clicked', async () => {
    wrapper = mount(NotFoundPage)

    await wrapper.find('.btn-primary').trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  it('calls router.back() when Go Back is clicked', async () => {
    wrapper = mount(NotFoundPage)

    await wrapper.find('.btn-secondary').trigger('click')

    expect(mockRouter.back).toHaveBeenCalledTimes(1)
  })

  it('has correct CSS classes for layout', () => {
    wrapper = mount(NotFoundPage)

    expect(wrapper.find('.not-found-page').exists()).toBe(true)
    expect(wrapper.find('.not-found-content').exists()).toBe(true)
    expect(wrapper.find('.actions').exists()).toBe(true)
  })
})
