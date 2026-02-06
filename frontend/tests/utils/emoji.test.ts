/**
 * Tests for emoji utility functions
 */

import { describe, it, expect } from 'vitest'
import { parseEmoji, emojiToDisplay } from '../../utils/emoji'

describe('parseEmoji', () => {
  it('parses static Discord emoji', () => {
    const result = parseEmoji('<:pepe:123456>')

    expect(result.type).toBe('discord_static')
    expect(result.name).toBe('pepe')
    expect(result.id).toBe('123456')
    expect(result.url).toBe('https://cdn.discordapp.com/emojis/123456.png')
    expect(result.original).toBe('<:pepe:123456>')
  })

  it('parses animated Discord emoji', () => {
    const result = parseEmoji('<a:dance:789012>')

    expect(result.type).toBe('discord_animated')
    expect(result.name).toBe('dance')
    expect(result.id).toBe('789012')
    expect(result.url).toBe('https://cdn.discordapp.com/emojis/789012.gif')
    expect(result.original).toBe('<a:dance:789012>')
  })

  it('returns unicode type for regular emoji', () => {
    const result = parseEmoji('👍')

    expect(result.type).toBe('unicode')
    expect(result.name).toBe('👍')
    expect(result.id).toBeUndefined()
    expect(result.url).toBeUndefined()
    expect(result.original).toBe('👍')
  })

  it('returns unicode type for plain text', () => {
    const result = parseEmoji('hello')

    expect(result.type).toBe('unicode')
    expect(result.name).toBe('hello')
    expect(result.original).toBe('hello')
  })

  it('does not match malformed Discord emoji', () => {
    const result = parseEmoji('<:missing_id:>')

    expect(result.type).toBe('unicode')
  })

  it('does not match partial Discord format', () => {
    const result = parseEmoji('<:name:abc>')

    expect(result.type).toBe('unicode')
  })
})

describe('emojiToDisplay', () => {
  it('returns url/alt object for Discord static emoji', () => {
    const result = emojiToDisplay('<:pepe:123456>')

    expect(result).toEqual({
      url: 'https://cdn.discordapp.com/emojis/123456.png',
      alt: 'pepe',
    })
  })

  it('returns url/alt object for Discord animated emoji', () => {
    const result = emojiToDisplay('<a:wave:999>')

    expect(result).toEqual({
      url: 'https://cdn.discordapp.com/emojis/999.gif',
      alt: 'wave',
    })
  })

  it('returns the emoji string for unicode emoji', () => {
    const result = emojiToDisplay('🎉')

    expect(result).toBe('🎉')
  })
})
