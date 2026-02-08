/**
 * Tests for Modal component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Modal from '../../components/shared/ui/Modal.vue'

describe('Modal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('does not render when isOpen is false', () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: false,
        title: 'Test Modal',
      },
    })

    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders when isOpen is true', () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const overlay = document.body.querySelector('.modal-overlay')
    expect(overlay).not.toBeNull()
    expect(document.body.querySelector('.modal-title')?.textContent).toBe('Test Modal')
  })

  it('displays the title', () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'My Modal Title',
      },
    })

    expect(document.body.querySelector('.modal-title')?.textContent).toBe('My Modal Title')
  })

  it('renders slot content', () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
      slots: {
        default: '<div class="test-content">Modal Content Here</div>',
      },
    })

    const content = document.body.querySelector('.test-content')
    expect(content).not.toBeNull()
    expect(content?.textContent).toBe('Modal Content Here')
  })

  it('emits close event when close button is clicked', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const closeBtn = document.body.querySelector('.modal-close-btn') as HTMLElement
    closeBtn.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close event when overlay is clicked', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const overlay = document.body.querySelector('.modal-overlay') as HTMLElement
    overlay.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close event when modal container is clicked', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const container = document.body.querySelector('.modal-container') as HTMLElement
    container.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('does not emit close event when modal body is clicked', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const body = document.body.querySelector('.modal-body') as HTMLElement
    body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('adds escape key listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes escape key listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('emits close event when Escape key is pressed', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(escapeEvent)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close event when other keys are pressed', async () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    document.dispatchEvent(enterEvent)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('has correct aria-label on close button', () => {
    wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: 'Test Modal',
      },
    })

    const closeButton = document.body.querySelector('.modal-close-btn')
    expect(closeButton?.getAttribute('aria-label')).toBe('Close modal')
  })
})
