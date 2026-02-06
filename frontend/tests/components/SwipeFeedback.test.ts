/**
 * Tests for SwipeFeedback component
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SwipeFeedback from '../../components/shared/ui/SwipeFeedback.vue'

describe('SwipeFeedback', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('does not render when visible is false', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: false,
        direction: null,
        icon: '',
        message: '',
      },
    })

    expect(wrapper.find('.swipe-feedback').exists()).toBe(false)
  })

  it('renders when visible is true', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: true,
        direction: 'left',
        icon: 'heart',
        message: 'Liked!',
      },
    })

    expect(wrapper.find('.swipe-feedback').exists()).toBe(true)
  })

  it('shows correct arrow for left direction', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: true,
        direction: 'left',
        icon: '',
        message: '',
      },
    })

    const arrow = wrapper.find('.feedback-arrow')
    expect(arrow.text()).toBe('\u2190')
  })

  it('shows correct arrow for right direction', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: true,
        direction: 'right',
        icon: '',
        message: '',
      },
    })

    const arrow = wrapper.find('.feedback-arrow')
    expect(arrow.text()).toBe('\u2192')
  })

  it('shows correct arrow for up direction', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: true,
        direction: 'up',
        icon: '',
        message: '',
      },
    })

    const arrow = wrapper.find('.feedback-arrow')
    expect(arrow.text()).toBe('\u2191')
  })

  it('displays icon and message props', () => {
    wrapper = mount(SwipeFeedback, {
      props: {
        visible: true,
        direction: 'down',
        icon: 'star',
        message: 'Favorited!',
      },
    })

    const icon = wrapper.find('.feedback-icon')
    const message = wrapper.find('.feedback-message')
    expect(icon.text()).toBe('star')
    expect(message.text()).toBe('Favorited!')
  })
})
