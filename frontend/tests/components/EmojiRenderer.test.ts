/**
 * Tests for EmojiRenderer component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../utils/emoji', () => ({
  parseEmoji: vi.fn((emoji: string) => {
    if (emoji.startsWith('<:')) return { type: 'discord_static', name: 'test', id: '123', url: 'https://cdn.discordapp.com/emojis/123.png', original: emoji }
    if (emoji.startsWith('<a:')) return { type: 'discord_animated', name: 'test', id: '456', url: 'https://cdn.discordapp.com/emojis/456.gif', original: emoji }
    return { type: 'unicode', name: emoji, original: emoji }
  }),
}))

import EmojiRenderer from '../../components/shared/ui/EmojiRenderer.vue'

describe('EmojiRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders unicode emoji as span with text', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: 'hello',
      },
    })

    const span = wrapper.find('.unicode-emoji')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('hello')
  })

  it('renders discord static emoji as img with correct src', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: '<:test:123>',
      },
    })

    const img = wrapper.find('img.discord-emoji')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://cdn.discordapp.com/emojis/123.png')
    expect(img.attributes('alt')).toBe('test')
  })

  it('renders discord animated emoji as img', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: '<a:test:456>',
      },
    })

    const img = wrapper.find('img.discord-emoji')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://cdn.discordapp.com/emojis/456.gif')
  })

  it('renders goose emoji as img with /goose.png src', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: '\u{1FABF}',
      },
    })

    const img = wrapper.find('img.goose-emoji')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/goose.png')
    expect(img.attributes('alt')).toBe('goose')
  })

  it('uses default size of 32px', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: 'hello',
      },
    })

    const span = wrapper.find('.unicode-emoji')
    expect(span.attributes('style')).toContain('font-size: 32px')
  })

  it('uses custom size prop', () => {
    const wrapper = mount(EmojiRenderer, {
      props: {
        emoji: 'hello',
        size: 64,
      },
    })

    const span = wrapper.find('.unicode-emoji')
    expect(span.attributes('style')).toContain('font-size: 64px')
  })
})
