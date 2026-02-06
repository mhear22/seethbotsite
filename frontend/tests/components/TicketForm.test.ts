/**
 * Tests for TicketForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import TicketForm from '../../components/shared/ui/TicketForm.vue'

// Mock fetch for categories loading
const mockCategories = {
  categories: [
    { name: 'User Interface' },
    { name: 'Backend' },
    { name: 'Performance' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    })
  ) as any
})

describe('TicketForm', () => {
  it('renders form with title input', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: '',
        description: '',
      },
    })

    const titleInput = wrapper.find('#ticket-title')
    expect(titleInput.exists()).toBe(true)
    expect(titleInput.attributes('type')).toBe('text')
  })

  it('renders form with description textarea', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: '',
        description: '',
      },
    })

    const textarea = wrapper.find('#ticket-description')
    expect(textarea.exists()).toBe(true)
    expect(textarea.element.tagName.toLowerCase()).toBe('textarea')
  })

  it('emits update:title when title input changes', async () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: '',
        description: '',
      },
    })

    const titleInput = wrapper.find('#ticket-title')
    await titleInput.setValue('New Title')

    expect(wrapper.emitted('update:title')).toBeTruthy()
    expect(wrapper.emitted('update:title')![0]).toEqual(['New Title'])
  })

  it('emits update:description when description changes', async () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: '',
        description: '',
      },
    })

    const textarea = wrapper.find('#ticket-description')
    await textarea.setValue('New description text')

    expect(wrapper.emitted('update:description')).toBeTruthy()
    expect(wrapper.emitted('update:description')![0]).toEqual(['New description text'])
  })

  it('submit button is disabled when title is empty', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: '',
        description: '',
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('submit button is enabled when title has content', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'A valid title',
        description: '',
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    expect(submitBtn.attributes('disabled')).toBeUndefined()
  })

  it('emits submit on button click', async () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Valid title',
        description: 'Some description',
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    await submitBtn.trigger('click')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emits cancel when cancel clicked (isEditing=true)', async () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Title',
        description: 'Desc',
        isEditing: true,
      },
    })

    const cancelBtn = wrapper.find('.btn-cancel')
    expect(cancelBtn.exists()).toBe(true)
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('shows Save Changes when isEditing', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Title',
        description: 'Desc',
        isEditing: true,
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    expect(submitBtn.text()).toBe('Save Changes')
  })

  it('shows Submit Ticket when not editing', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Title',
        description: 'Desc',
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    expect(submitBtn.text()).toBe('Submit Ticket')
  })

  it('shows Saving... when loading', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Title',
        description: 'Desc',
        loading: true,
      },
    })

    const submitBtn = wrapper.find('.btn-submit')
    expect(submitBtn.text()).toBe('Saving...')
  })

  it('disables inputs when loading', () => {
    const wrapper = mount(TicketForm, {
      props: {
        title: 'Title',
        description: 'Desc',
        loading: true,
      },
    })

    const titleInput = wrapper.find('#ticket-title')
    const textarea = wrapper.find('#ticket-description')
    const typeSelect = wrapper.find('#ticket-type')
    const prioritySelect = wrapper.find('#ticket-priority')

    expect(titleInput.attributes('disabled')).toBeDefined()
    expect(textarea.attributes('disabled')).toBeDefined()
    expect(typeSelect.attributes('disabled')).toBeDefined()
    expect(prioritySelect.attributes('disabled')).toBeDefined()
  })
})
