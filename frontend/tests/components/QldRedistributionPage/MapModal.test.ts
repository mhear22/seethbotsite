/**
 * Tests for MapModal component
 * Uses document.body.querySelector because MapModal uses <Teleport to="body">
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'

const mockMapData = {
  name: 'Test Electorate',
  image: '/test-image.png',
  color: 'controversial',
  status: 'controversial',
  party: 'LNP',
  region: 'South East QLD'
}

import MapModal from '../../../components/pages/QldRedistributionPage/MapModal.vue'

describe('MapModal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('does not render when mapData is null', () => {
    wrapper = mount(MapModal, {
      props: { mapData: null },
      attachTo: document.body
    })
    expect(document.body.querySelector('.map-modal-overlay')).toBeNull()
  })

  it('renders modal content when mapData is provided', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Test Electorate')
    expect(document.body.textContent).toContain('Proposed Boundaries')
  })

  it('displays the electorate name', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Test Electorate')
  })

  it('displays status badge', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData },
      attachTo: document.body
    })
    const badge = document.body.querySelector('.status-badge')
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toContain('Controversial')
  })

  it('displays party and region info', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('LNP')
    expect(document.body.textContent).toContain('South East QLD')
  })

  it('displays map image', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData },
      attachTo: document.body
    })
    const img = document.body.querySelector('img')
    expect(img).not.toBeNull()
    expect(img!.getAttribute('src')).toBe('/test-image.png')
  })

  it('applies dark mode classes when darkMode is true', () => {
    wrapper = mount(MapModal, {
      props: { mapData: mockMapData, darkMode: true },
      attachTo: document.body
    })
    expect(document.body.querySelector('.dark-overlay')).not.toBeNull()
  })
})
