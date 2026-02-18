/**
 * Tests for BreadcrumbNav component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRoute = {
  path: '/',
  name: 'home',
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  RouterLink: { template: '<a><slot /></a>', props: ['to'] },
}))

import { mount } from '@vue/test-utils'
import BreadcrumbNav from '../../components/shared/ui/BreadcrumbNav.vue'

const mountBreadcrumb = () =>
  mount(BreadcrumbNav, {
    global: {
      stubs: {
        'router-link': { template: '<a><slot /></a>' },
      },
    },
  })

describe('BreadcrumbNav', () => {
  beforeEach(() => {
    mockRoute.path = '/'
    mockRoute.fullPath = '/'
  })

  it('shows only Home breadcrumb on home page', () => {
    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('Home')
  })

  it('shows page name for /fishing route', () => {
    mockRoute.path = '/fishing'
    mockRoute.fullPath = '/fishing'

    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')
    const lastItem = items[items.length - 1]
    expect(lastItem.text()).toContain('Fishing')
  })

  it('shows category breadcrumb for Fun & Games routes', () => {
    mockRoute.path = '/fishing'
    mockRoute.fullPath = '/fishing'

    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')
    // Home > Fun & Games > Fishing
    expect(items).toHaveLength(3)
    expect(items[1].text()).toContain('Fun & Games')
    expect(items[2].text()).toContain('Fishing')
  })

  it('does not show category breadcrumb for Community routes', () => {
    mockRoute.path = '/stats'
    mockRoute.fullPath = '/stats'

    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')
    // Home > Statistics (no category)
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Home')
    expect(items[1].text()).toContain('Statistics')
  })

  it('applies active class to the last breadcrumb', () => {
    mockRoute.path = '/fishing'
    mockRoute.fullPath = '/fishing'

    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')
    const lastItem = items[items.length - 1]
    expect(lastItem.classes()).toContain('active')

    // Non-last items should not have active class
    expect(items[0].classes()).not.toContain('active')
  })

  it('renders router-link for non-last breadcrumbs and span for last', () => {
    mockRoute.path = '/fishing'
    mockRoute.fullPath = '/fishing'

    const wrapper = mountBreadcrumb()

    const items = wrapper.findAll('.breadcrumb-item')

    // First item (Home) should have a link
    expect(items[0].find('.breadcrumb-link').exists()).toBe(true)
    expect(items[0].find('.breadcrumb-current').exists()).toBe(false)

    // Last item (Fishing) should have a span, not a link
    const lastItem = items[items.length - 1]
    expect(lastItem.find('.breadcrumb-current').exists()).toBe(true)
    expect(lastItem.find('.breadcrumb-link').exists()).toBe(false)
  })
})
