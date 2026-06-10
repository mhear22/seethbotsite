/**
 * Tests for BoothModal component
 * Uses document.body.querySelector because BoothModal uses <Teleport to="body">
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'

const mockBooths = [
  { n: 'Spring Hill PS', t: 'PB', v: 1234, p: { ALP: 45.2, LNP: 42.1, GRN: 8.5, ONP: 2.1 } },
  { n: 'Early Voting Centre', t: 'EV', v: 5678, p: { ALP: 50.1, LNP: 38.2, GRN: 7.3, IND: 2.0 } }
]

const mockElectorate = {
  name: 'Test Electorate',
  formerName: 'Old Name',
  booths: mockBooths
}

import BoothModal from '../../../components/pages/QldRedistributionPage/BoothModal.vue'

describe('BoothModal', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('does not render when electorate is null', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: null },
      attachTo: document.body
    })
    expect(document.body.querySelector('.booth-modal-overlay')).toBeNull()
  })

  it('renders when electorate is provided', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Test Electorate')
  })

  it('displays former name when available', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('formerly Old Name')
  })

  it('shows loading state', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate, loading: true },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Loading booth data')
    expect(document.body.querySelector('.booth-spinner')).not.toBeNull()
  })

  it('shows empty state when no booths', () => {
    const emptyElectorate = { name: 'Empty Electorate', booths: [] }
    wrapper = mount(BoothModal, {
      props: { electorate: emptyElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('No booth data available')
  })

  it('renders booth cards for each booth', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.querySelectorAll('.booth-card')).toHaveLength(2)
  })

  it('displays booth names', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Spring Hill PS')
    expect(document.body.textContent).toContain('Early Voting Centre')
  })

  it('shows booth type labels', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('Polling Booth')
    expect(document.body.textContent).toContain('Early Voting')
  })

  it('displays vote counts', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('1,234')
    expect(document.body.textContent).toContain('5,678')
  })

  it('renders donut charts for each booth', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.querySelectorAll('.donut-container')).toHaveLength(2)
    expect(document.body.querySelectorAll('svg.donut-chart')).toHaveLength(2)
  })

  it('renders party legend items', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.textContent).toContain('ALP')
    expect(document.body.textContent).toContain('LNP')
    expect(document.body.textContent).toContain('GRN')
  })

  it('has a close button', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    expect(document.body.querySelector('.booth-modal-close')).not.toBeNull()
  })

  it('displays subtitle with election year', () => {
    wrapper = mount(BoothModal, {
      props: { electorate: mockElectorate },
      attachTo: document.body
    })
    const subtitle = document.body.querySelector('.booth-modal-subtitle')
    expect(subtitle).not.toBeNull()
    expect(subtitle!.textContent).toContain('2024 Election')
  })
})
