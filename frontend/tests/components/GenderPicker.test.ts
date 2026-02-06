/**
 * Tests for GenderPicker component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockDetectGender = vi.fn()

vi.mock('../../repositories/general.repository', () => ({
  generalRepository: { detectGender: (...args: any[]) => mockDetectGender(...args) },
}))

import GenderPicker from '../../components/shared/ui/GenderPicker.vue'

describe('GenderPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with name input', () => {
    const wrapper = mount(GenderPicker)

    const nameInput = wrapper.find('#name')
    expect(nameInput.exists()).toBe(true)
    expect(nameInput.attributes('type')).toBe('text')
    expect(nameInput.attributes('placeholder')).toBe('Enter a name')
  })

  it('renders country select with options', () => {
    const wrapper = mount(GenderPicker)

    const select = wrapper.find('#country')
    expect(select.exists()).toBe(true)

    const options = select.findAll('option')
    expect(options.length).toBeGreaterThanOrEqual(2)
    expect(options[0].text()).toContain('Any Country')
    expect(options[1].text()).toContain('USA')
  })

  it('disables submit button when name is empty', () => {
    const wrapper = mount(GenderPicker)

    const button = wrapper.find('.detect-btn')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('calls detectGender on form submit', async () => {
    mockDetectGender.mockResolvedValue({ gender: 'female', probability: 0.95 })

    const wrapper = mount(GenderPicker)

    await wrapper.find('#name').setValue('Alice')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockDetectGender).toHaveBeenCalledWith('Alice', 0)
  })

  it('displays female result correctly', async () => {
    mockDetectGender.mockResolvedValue({ gender: 'female', probability: 0.95 })

    const wrapper = mount(GenderPicker)

    await wrapper.find('#name').setValue('Alice')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const result = wrapper.find('.gender-result')
    expect(result.exists()).toBe(true)
    expect(result.classes()).toContain('result-female')
    expect(result.text()).toContain('Female')
    expect(result.text()).toContain('95%')
  })

  it('displays male result correctly', async () => {
    mockDetectGender.mockResolvedValue({ gender: 'male', probability: 0.88 })

    const wrapper = mount(GenderPicker)

    await wrapper.find('#name').setValue('Bob')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const result = wrapper.find('.gender-result')
    expect(result.exists()).toBe(true)
    expect(result.classes()).toContain('result-male')
    expect(result.text()).toContain('Male')
    expect(result.text()).toContain('88%')
  })

  it('shows error message on API failure', async () => {
    mockDetectGender.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(GenderPicker)

    await wrapper.find('#name').setValue('TestName')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const errorDiv = wrapper.find('.gender-error')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Error detecting gender')
  })

  it('emits back event when back button is clicked', async () => {
    const wrapper = mount(GenderPicker)

    const backBtn = wrapper.find('.back-btn')
    await backBtn.trigger('click')

    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('back')).toHaveLength(1)
  })
})
