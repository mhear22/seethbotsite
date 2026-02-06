/**
 * Tests for ModalContainer component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModalContainer from '../../components/shared/modals/ModalContainer.vue'

describe('ModalContainer', () => {
  let wrapper: VueWrapper

  const createModals = (overrides: Partial<{ isOpen: boolean }>[] = []) => [
    { id: 'chat', title: 'Chat', icon: '💬', isOpen: false, ...overrides[0] },
    { id: 'notes', title: 'Notes', icon: '📝', isOpen: false, ...overrides[1] },
  ]

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders modal list with buttons for each modal', () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const buttons = wrapper.findAll('.modal-toggle-btn')
    expect(buttons).toHaveLength(2)
  })

  it('shows modal title and icon for each modal', () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const titles = wrapper.findAll('.modal-title')
    const icons = wrapper.findAll('.modal-icon')

    expect(titles[0].text()).toBe('Chat')
    expect(titles[1].text()).toBe('Notes')
    expect(icons[0].text()).toBe('💬')
    expect(icons[1].text()).toBe('📝')
  })

  it('emits toggle event with modal id on modal button click', async () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const buttons = wrapper.findAll('.modal-toggle-btn')
    await buttons[0].trigger('click')

    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')![0]).toEqual(['chat'])
  })

  it('toggles collapsed state when dock-toggle button is clicked', async () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const dockToggle = wrapper.find('.dock-toggle')
    expect(wrapper.find('.modal-dock').classes()).not.toContain('collapsed')

    await dockToggle.trigger('click')
    expect(wrapper.find('.modal-dock').classes()).toContain('collapsed')

    await dockToggle.trigger('click')
    expect(wrapper.find('.modal-dock').classes()).not.toContain('collapsed')
  })

  it('loads collapsed state from localStorage on mount', async () => {
    localStorage.setItem('dock-collapsed-left', 'true')

    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    await nextTick()
    expect(wrapper.find('.modal-dock').classes()).toContain('collapsed')
  })

  it('saves collapsed state to localStorage when toggled', async () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const dockToggle = wrapper.find('.dock-toggle')
    await dockToggle.trigger('click')

    expect(localStorage.getItem('dock-collapsed-left')).toBe('true')

    await dockToggle.trigger('click')
    expect(localStorage.getItem('dock-collapsed-left')).toBe('false')
  })

  it('applies collapsed class when collapsed is true', async () => {
    const modals = createModals()
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const dockToggle = wrapper.find('.dock-toggle')
    await dockToggle.trigger('click')

    expect(wrapper.find('.modal-dock').classes()).toContain('collapsed')
  })

  it('applies modal-open class for open modals', () => {
    const modals = createModals([{ isOpen: true }, {}])
    wrapper = mount(ModalContainer, {
      props: { modals },
    })

    const items = wrapper.findAll('.modal-item')
    expect(items[0].classes()).toContain('modal-open')
    expect(items[1].classes()).not.toContain('modal-open')
  })
})
