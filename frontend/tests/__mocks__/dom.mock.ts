import { vi } from 'vitest'

export function createMockAudioElement(id: string) {
  const audio = {
    id,
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    currentTime: 0,
    loop: false,
    volume: 1,
    playbackRate: 1,
    muted: false,
  }
  return audio as unknown as HTMLAudioElement
}

export function setupMockAudioElements(ids: string[]) {
  const elements = new Map<string, ReturnType<typeof createMockAudioElement>>()

  ids.forEach(id => {
    elements.set(id, createMockAudioElement(id))
  })

  const originalGetById = document.getElementById.bind(document)
  vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
    return (elements.get(id) as unknown as HTMLElement) || originalGetById(id)
  })

  return elements
}
