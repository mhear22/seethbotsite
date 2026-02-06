/**
 * Tests for Modal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../../../components/shared/ui/Modal.vue'

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: false,
        title: 'Test Modal',
      },
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('renders when isOpen is true', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toBe('Test Modal')
  })

  it('displays the title', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'My Modal Title',
      },
    })

    expect(wrapper.find('.modal-title').text()).toBe('My Modal Title')
  })

  it('renders slot content', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
      slots: {
        default: '<div class="modal-content">Modal Content Here</div>',
      },
    })

    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.find('.modal-content').text()).toBe('Modal Content Here')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    await wrapper.find('.modal-close-btn').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close event when overlay is clicked', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    await wrapper.find('.modal-overlay').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close event when modal container is clicked', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    await wrapper.find('.modal-container').trigger('click')

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('does not emit close event when modal body is clicked', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
      slots: {
        default: '<div class="modal-content">Content</div>',
      },
    })

    await wrapper.find('.modal-body').trigger('click')

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('adds escape key listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes escape key listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('emits close event when Escape key is pressed', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
      attachTo: document.body,
    })

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close event when other keys are pressed', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
      attachTo: document.body,
    })

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    document.dispatchEvent(enterEvent)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('has correct aria-label on close button', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const closeButton = wrapper.find('.modal-close-btn')
    expect(closeButton.attributes('aria-label')).toBe('Close')
  })
})
