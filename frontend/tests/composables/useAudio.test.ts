/**
 * Tests for useAudio composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAudio, _resetAudioManager } from '../../composables/useAudio'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('useAudio', () => {
  let audioMocks: Map<string, any>

  const createMockAudio = () => ({
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    currentTime: 0,
    volume: 0.5,
    playbackRate: 1,
    load: vi.fn()
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    localStorageMock.clear()
    audioMocks = new Map()

    // Mock Audio constructor to return a new mock for each sound
    vi.spyOn(window, 'Audio' as any).mockImplementation((src: string) => {
      const mock = createMockAudio()
      audioMocks.set(src, mock)
      return mock as any
    })
  })

  afterEach(() => {
    // Reset module state between tests
    _resetAudioManager()
    audioMocks.clear()
  })

  it('should initialize with default preferences if none saved', () => {
    const { volume, muted } = useAudio()

    expect(volume.value).toBe(50)
    expect(muted.value).toBe(false)
  })

  it('should load saved preferences from localStorage', () => {
    // Set localStorage before creating composable
    localStorageMock.setItem('audioVolume', '75')
    localStorageMock.setItem('audioMuted', 'true')

    const { volume, muted } = useAudio()

    expect(volume.value).toBe(75)
    expect(muted.value).toBe(true)
  })

  it('should set volume and save to localStorage', () => {
    const { setVolume, volume } = useAudio()

    setVolume(80)

    expect(volume.value).toBe(80)
    expect(localStorageMock.getItem('audioVolume')).toBe('80')
  })

  it('should clamp volume to 0-100 range', () => {
    const { setVolume, volume } = useAudio()

    setVolume(150)
    expect(volume.value).toBe(100)

    setVolume(-50)
    expect(volume.value).toBe(0)
  })

  it('should toggle mute state and save to localStorage', () => {
    const { toggleMute, muted } = useAudio()

    expect(muted.value).toBe(false)

    toggleMute()
    expect(muted.value).toBe(true)
    expect(localStorageMock.getItem('audioMuted')).toBe('true')

    toggleMute()
    expect(muted.value).toBe(false)
    expect(localStorageMock.getItem('audioMuted')).toBe('false')
  })

  it('should not play sound when muted', () => {
    const { toggleMute, playClick } = useAudio()

    toggleMute()
    playClick()

    // Check that no audio elements were played
    audioMocks.forEach(mock => {
      expect(mock.play).not.toHaveBeenCalled()
    })
  })

  it('should play click sound with correct parameters', () => {
    const { playClick } = useAudio()

    playClick()

    // Find the audio element for button-sound.mp3
    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
    expect(audioMock!.volume).toBeCloseTo(0.5, 1)
  })

  it('should play success sound', () => {
    const { playSuccess } = useAudio()

    playSuccess()

    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should play error sound with start time', () => {
    const { playError } = useAudio()

    playError()

    const audioMock = audioMocks.get('/fart-with-reverb.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.currentTime).toBe(0.5)
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should play panel open sound', () => {
    const { playPanelOpen } = useAudio()

    playPanelOpen()

    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should play honk sound', () => {
    const { playHonk } = useAudio()

    playHonk()

    const audioMock = audioMocks.get('/goose-honk.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should play points earned sound', () => {
    const { playPointsEarned } = useAudio()

    playPointsEarned()

    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should play notification sound', () => {
    const { playNotification } = useAudio()

    playNotification()

    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock).toBeDefined()
    expect(audioMock!.play).toHaveBeenCalled()
  })

  it('should preload all sounds on initialization', () => {
    // Clear previous calls
    vi.clearAllMocks()

    useAudio()

    // Should have called Audio constructor for each unique sound file (3 unique files)
    expect(window.Audio as any).toHaveBeenCalledTimes(3)
    // All audio elements should have called load()
    audioMocks.forEach(mock => {
      expect(mock.load).toHaveBeenCalled()
    })
  })

  it('should handle play errors gracefully', () => {
    const { playClick } = useAudio()

    // Make play fail
    audioMocks.forEach(mock => {
      mock.play = vi.fn().mockRejectedValue(new Error('Audio play failed'))
    })

    // Should not throw
    expect(() => playClick()).not.toThrow()
  })

  it('should pause all sounds when muting', () => {
    const { playClick, toggleMute } = useAudio()

    playClick()
    toggleMute()

    // All audio elements should be paused
    audioMocks.forEach(mock => {
      expect(mock.pause).toHaveBeenCalled()
    })
  })

  it('should reuse audio elements for the same sound', () => {
    const { playClick } = useAudio()

    playClick()
    playClick()

    // Should only create one audio element for button-sound.mp3
    expect((window.Audio as any).mock.calls.filter((call: any[]) => 
      call[0] === '/button-sound.mp3'
    ).length).toBe(1)
  })

  it('should reset audio before playing', () => {
    const { playClick } = useAudio()

    playClick()

    const audioMock = audioMocks.get('/button-sound.mp3')
    expect(audioMock!.pause).toHaveBeenCalled()
    expect(audioMock!.currentTime).toBe(0)
  })
})
