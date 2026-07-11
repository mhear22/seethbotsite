/**
 * useAudio shared state — the settings modal's volume/mute must be THE SAME
 * refs every game page plays through. muted/volume used to be created per
 * useAudio() call, so a settings change silently did nothing to pages that had
 * already called useAudio(); both are now module singletons.
 *
 * Runs in the node test env: localStorage/document access in the composable is
 * guarded, and these tests only exercise the shared refs (no playback).
 */
import { describe, it, expect, afterEach } from 'vitest'
import { useAudio } from '../useAudio'

afterEach(() => {
  // Leave the singleton in its default state for other consumers.
  const a = useAudio()
  a.setVolume(0.5)
  a.unmuteAll()
})

describe('useAudio shared state', () => {
  it('shares one volume across independent consumers', () => {
    const settingsModal = useAudio()
    const storyPage = useAudio()
    settingsModal.setVolume(0.15)
    expect(storyPage.volume.value).toBeCloseTo(0.15)
  })

  it('clamps setVolume into 0..1', () => {
    const a = useAudio()
    a.setVolume(4)
    expect(a.volume.value).toBe(1)
    a.setVolume(-2)
    expect(a.volume.value).toBe(0)
  })

  it('shares mute across consumers and unmutes symmetrically', () => {
    const settingsModal = useAudio()
    const battlePage = useAudio()
    settingsModal.muted.value = true
    expect(battlePage.muted.value).toBe(true)
    battlePage.unmuteAll()
    expect(settingsModal.muted.value).toBe(false)
  })
})
