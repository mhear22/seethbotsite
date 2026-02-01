/**
 * Parse Discord custom emoji format
 * <:name:id> for static emojis
 * <a:name:id> for animated emojis
 */
export interface DiscordEmoji {
  type: 'unicode' | 'discord_static' | 'discord_animated'
  name: string
  id?: string
  url?: string
  original: string
}

/**
 * Parse an emoji string and determine if it's a Discord custom emoji
 */
export function parseEmoji(emoji: string): DiscordEmoji {
  // Match <:name:id> or <a:name:id>
  const discordMatch = emoji.match(/^<(a?):([^:]+):(\d+)>$/)

  if (discordMatch) {
    const animated = discordMatch[1] === 'a'
    const name = discordMatch[2]
    const id = discordMatch[3]
    const ext = animated ? 'gif' : 'png'

    return {
      type: animated ? 'discord_animated' : 'discord_static',
      name,
      id,
      url: `https://cdn.discordapp.com/emojis/${id}.${ext}`,
      original: emoji
    }
  }

  // Regular unicode emoji
  return {
    type: 'unicode',
    name: emoji,
    original: emoji
  }
}

/**
 * Convert emoji to display format (either image URL or unicode)
 */
export function emojiToDisplay(emoji: string): string | { url: string; alt: string } {
  const parsed = parseEmoji(emoji)

  if (parsed.type === 'discord_static' || parsed.type === 'discord_animated') {
    return { url: parsed.url!, alt: parsed.name }
  }

  return emoji
}
