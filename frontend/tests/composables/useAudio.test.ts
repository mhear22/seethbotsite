/**
 * Tests for useAudio composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAudio } from '../../composables/useAudio'

describe('useAudio', () => {
  let mockAudioElement: {
    pause: ReturnType<typeof vi.fn>
    play: ReturnType<typeof vi.fn>
    currentTime: number
    loop: boolean
    volume: number
    playbackRate: number
  }

  beforeEach(() => {
    vi.restoreAllMocks()

    mockAudioElement = {
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      currentTime: 10,
      loop: true,
      volume: 1,
      playbackRate: 1,
    }
  })

  it('should do nothing if element is not found', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null)

    const { playSound } = useAudio()
    // Should not throw
    playSound('nonexistent')

    expect(document.getElementById).toHaveBeenCalledWith('nonexistent')
  })

  it('should pause and reset audio before playing', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()
    playSound('testSound')

    expect(mockAudioElement.pause).toHaveBeenCalled()
    expect(mockAudioElement.currentTime).toBe(0)
  })

  it('should set loop to false', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()
    playSound('testSound')

    expect(mockAudioElement.loop).toBe(false)
  })

  it('should default volume to 0.5', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()
    playSound('testSound')

    expect(mockAudioElement.volume).toBe(0.5)
  })

  it('should clamp volume to 0-1 range', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()

    playSound('testSound', { volume: 5 })
    expect(mockAudioElement.volume).toBe(1)

    playSound('testSound', { volume: -3 })
    expect(mockAudioElement.volume).toBe(0)
  })

  it('should set playback rate when provided', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()
    playSound('testSound', { rate: 1.5 })

    expect(mockAudioElement.playbackRate).toBe(1.5)
  })

  it('should clamp playback rate to 0.5-2.0 range', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playSound } = useAudio()

    playSound('testSound', { rate: 10 })
    expect(mockAudioElement.playbackRate).toBe(2.0)

    playSound('testSound', { rate: 0.1 })
    expect(mockAudioElement.playbackRate).toBe(0.5)
  })

  it('should play music when toggleMusic is called with true', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { toggleMusic } = useAudio()
    toggleMusic(true)

    expect(mockAudioElement.volume).toBe(0.5)
    expect(mockAudioElement.play).toHaveBeenCalled()
  })

  it('should pause music when toggleMusic is called with false', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { toggleMusic } = useAudio()
    toggleMusic(false)

    expect(mockAudioElement.pause).toHaveBeenCalled()
  })

  it('should call playSound with correct params for playButtonClick', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAudioElement as any)

    const { playButtonClick } = useAudio()
    playButtonClick()

    expect(document.getElementById).toHaveBeenCalledWith('buttonSound')
    expect(mockAudioElement.volume).toBe(0.5)
    expect(mockAudioElement.play).toHaveBeenCalled()
  })
})
