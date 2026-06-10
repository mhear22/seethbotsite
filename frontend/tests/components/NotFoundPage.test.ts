/**
 * Tests for NotFoundPage component
 */

import { describe, it, expect, vi } from 'vitest'
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

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders the error code "404"', () => {
    wrapper = mount(NotFoundPage)

    const errorCode = document.body.querySelector('.error-code') as HTMLElement
    expect(errorCode).not.toBeNull()
    expect(errorCode.textContent).toBe('404')
  })

  it('renders the error title "Page Not Found"', () => {
    wrapper = mount(NotFoundPage)

    const errorTitle = document.body.querySelector('.error-title') as HTMLElement
    expect(errorTitle).not.toBeNull()
    expect(errorTitle.textContent).toBe('Page Not Found')
  })

  it('displays the route path in the message', () => {
    wrapper = mount(NotFoundPage)

    const errorMessage = document.body.querySelector('.error-message') as HTMLElement
    expect(errorMessage).not.toBeNull()
    expect(errorMessage.textContent).toContain('/nonexistent-page')
  })

  it('renders Go Home button', () => {
    wrapper = mount(NotFoundPage)

    const homeBtn = document.body.querySelector('.btn-primary') as HTMLElement
    expect(homeBtn).not.toBeNull()
    expect(homeBtn.textContent).toBe('Go Home')
  })

  it('renders Go Back button', () => {
    wrapper = mount(NotFoundPage)

    const backBtn = document.body.querySelector('.btn-secondary') as HTMLElement
    expect(backBtn).not.toBeNull()
    expect(backBtn.textContent).toBe('Go Back')
  })

  it('calls router.push("/") when Go Home is clicked', async () => {
    wrapper = mount(NotFoundPage)

    const homeBtn = document.body.querySelector('.btn-primary') as HTMLElement
    homeBtn.click()
    await wrapper.vm.$nextTick()

    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  it('calls router.back() when Go Back is clicked', async () => {
    wrapper = mount(NotFoundPage)

    const backBtn = document.body.querySelector('.btn-secondary') as HTMLElement
    backBtn.click()
    await wrapper.vm.$nextTick()

    expect(mockRouter.back).toHaveBeenCalledTimes(1)
  })

  it('has correct CSS classes for layout', () => {
    wrapper = mount(NotFoundPage)

    const page = document.body.querySelector('.not-found-page')
    expect(page).not.toBeNull()

    const content = document.body.querySelector('.not-found-content')
    expect(content).not.toBeNull()

    const actions = document.body.querySelector('.actions')
    expect(actions).not.toBeNull()
  })
})
