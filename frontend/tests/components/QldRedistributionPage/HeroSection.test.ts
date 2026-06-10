/**
 * Tests for HeroSection component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../../../components/pages/QldRedistributionPage/HeroSection.vue'

describe('HeroSection', () => {
  it('renders the main heading', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('h1').text()).toContain('Queensland Electoral Redistribution 2026')
  })

  it('renders the subtitle', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('.hero-subtitle').text()).toContain('first comprehensive boundary review since 2017')
  })

  it('has the hero section element', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('section.hero').exists()).toBe(true)
  })

  it('uses correct heading level', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(false)
  })
})
