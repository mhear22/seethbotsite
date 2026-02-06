/**
 * Tests for useKeyboardShortcuts composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'

/**
 * Helper to mount a composable within a proper Vue component context.
 * Required because useKeyboardShortcuts uses onMounted/onUnmounted.
 */
function withSetup<T>(composable: () => T) {
  let result: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => {}
      },
    })
  )
  const root = document.createElement('div')
  document.body.appendChild(root)
  app.mount(root)
  return { result: result!, app, root }
}

/**
 * Helper to dispatch a keydown event that bubbles from a DOM element up to window.
 * The composable's handler checks event.target, so dispatching from a real element
 * ensures target.getAttribute is available (unlike window in jsdom).
 */
function dispatchKeydown(
  element: HTMLElement,
  options: KeyboardEventInit
) {
  const event = new KeyboardEvent('keydown', { ...options, bubbles: true })
  element.dispatchEvent(event)
}

describe('useKeyboardShortcuts', () => {
  let instance: ReturnType<typeof withSetup<ReturnType<typeof useKeyboardShortcuts>>>

  beforeEach(() => {
    instance = withSetup(() => useKeyboardShortcuts())
  })

  afterEach(() => {
    instance.app.unmount()
    if (instance.root.parentNode) {
      instance.root.parentNode.removeChild(instance.root)
    }
  })

  it('registerShortcut adds to shortcuts', () => {
    const { result } = instance

    result.registerShortcut({
      key: 'a',
      description: 'Test shortcut A',
      action: vi.fn(),
    })

    expect(result.shortcuts.value).toHaveLength(1)
    expect(result.shortcuts.value[0].key).toBe('a')
    expect(result.shortcuts.value[0].description).toBe('Test shortcut A')
  })

  it('unregisterShortcut removes shortcut by key', () => {
    const { result } = instance

    result.registerShortcut({
      key: 'b',
      description: 'Test shortcut B',
      action: vi.fn(),
    })
    expect(result.shortcuts.value).toHaveLength(1)

    result.unregisterShortcut('b')
    expect(result.shortcuts.value).toHaveLength(0)
  })

  it('toggleHelp toggles isHelpOpen', () => {
    const { result } = instance

    expect(result.isHelpOpen.value).toBe(false)

    result.toggleHelp()
    expect(result.isHelpOpen.value).toBe(true)

    result.toggleHelp()
    expect(result.isHelpOpen.value).toBe(false)
  })

  it('shortcut action fires on matching keydown', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 'k',
      description: 'Test K shortcut',
      action,
    })

    dispatchKeydown(document.body, {
      key: 'k',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('shortcut with ctrl modifier matches ctrl+key', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 's',
      ctrl: true,
      description: 'Save shortcut',
      action,
    })

    dispatchKeydown(document.body, {
      key: 's',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
    })

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('shortcut does not fire without required ctrl modifier', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 's',
      ctrl: true,
      description: 'Save shortcut',
      action,
    })

    // Press 's' without ctrl
    dispatchKeydown(document.body, {
      key: 's',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action).not.toHaveBeenCalled()
  })

  it('shortcuts skipped when target is INPUT', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 'a',
      description: 'Test shortcut',
      action,
    })

    const input = document.createElement('input')
    document.body.appendChild(input)

    dispatchKeydown(input, {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('shortcuts skipped when target is TEXTAREA', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 'a',
      description: 'Test shortcut',
      action,
    })

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    dispatchKeydown(textarea, {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action).not.toHaveBeenCalled()
    document.body.removeChild(textarea)
  })

  it('shortcuts skipped for contenteditable element', () => {
    const { result } = instance
    const action = vi.fn()

    result.registerShortcut({
      key: 'a',
      description: 'Test shortcut',
      action,
    })

    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    document.body.appendChild(div)

    dispatchKeydown(div, {
      key: 'a',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action).not.toHaveBeenCalled()
    document.body.removeChild(div)
  })

  it('only first matching shortcut fires (break on first match)', () => {
    const { result } = instance
    const action1 = vi.fn()
    const action2 = vi.fn()

    result.registerShortcut({
      key: 'x',
      description: 'First X shortcut',
      action: action1,
    })

    result.registerShortcut({
      key: 'x',
      description: 'Second X shortcut',
      action: action2,
    })

    dispatchKeydown(document.body, {
      key: 'x',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    })

    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).not.toHaveBeenCalled()
  })
})
