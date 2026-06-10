/**
 * Tests for MapExpandedModal component
 * Uses document.body.querySelector because MapExpandedModal uses <Teleport to="body">
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'

const mockMapData = {
  name: 'Test Electorate',
  image: '/test-expanded.png'
}

import MapExpandedModal from '../../../components/pages/QldRedistributionPage/MapExpandedModal.vue'

describe('MapExpandedModal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('does not render when not visible', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: false, mapData: mockMapData },
      attachTo: document.body
    })
    expect(document.body.querySelector('.map-expanded-overlay')).toBeNull()
  })

  it('does not render when visible but no mapData', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: true, mapData: null },
      attachTo: document.body
    })
    expect(document.body.querySelector('.map-expanded-overlay')).toBeNull()
  })

  it('renders when visible and mapData provided', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: true, mapData: mockMapData },
      attachTo: document.body
    })
    expect(document.body.querySelector('.map-expanded-overlay')).not.toBeNull()
  })

  it('displays the map image', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: true, mapData: mockMapData },
      attachTo: document.body
    })
    const img = document.body.querySelector('img')
    expect(img).not.toBeNull()
    expect(img!.getAttribute('src')).toBe('/test-expanded.png')
  })

  it('has a close button', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: true, mapData: mockMapData },
      attachTo: document.body
    })
    const closeBtn = document.body.querySelector('.map-expanded-close')
    expect(closeBtn).not.toBeNull()
    expect(closeBtn!.textContent).toBe('✕')
  })

  it('image has zoom-in cursor', () => {
    wrapper = mount(MapExpandedModal, {
      props: { visible: true, mapData: mockMapData },
      attachTo: document.body
    })
    const img = document.body.querySelector('.map-expanded-image')
    expect(img).not.toBeNull()
    expect((img as HTMLElement).style.cursor).toBe('zoom-in')
  })
})
