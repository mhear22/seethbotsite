/**
 * Tests for ClickerPage component
 *
 * Backend repositories, the audio composable and the router are mocked.
 * Fake timers keep the component's intervals (auto-click, save, sync,
 * golden mushroom spawn) from leaking between tests. Assertions focus on
 * observable rendered output rather than component internals.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper, flushPromises } from '@vue/test-utils'

const mockRouter = { push: vi.fn(), back: vi.fn() } as any

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/clicker' }),
  useRouter: () => mockRouter,
}))

vi.mock('../../repositories/clicks.repository', () => ({
  clicksRepository: {
    getCount: vi.fn().mockResolvedValue({ count: 0 }),
    addPoints: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../../repositories/general.repository', () => ({
  generalRepository: {
    getRankings: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../repositories/stats.repository', () => ({
  statsRepository: {
    recordStat: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
    updateHighScore: vi.fn().mockResolvedValue({ success: true, isNewRecord: false, score: 0, message: 'ok' }),
  },
}))

vi.mock('../../composables/useAudio', () => ({
  useAudio: () => ({
    playSound: vi.fn(),
    volume: { value: 0.5 },
    muted: { value: false },
  }),
}))

import ClickerPage from '../../components/pages/ClickerPage.vue'

// Mount and let onMounted's awaited loadRankings() resolve so isLoading flips
// to false and the content renders.
const mountClicker = async (): Promise<VueWrapper> => {
  const wrapper = mount(ClickerPage)
  await flushPromises()
  return wrapper
}

describe('ClickerPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    // requestAnimationFrame is used by the button-punch juice; make it a no-op
    // that runs synchronously so it doesn't depend on real animation frames.
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      cb(0)
      return 1
    })
    // jsdom doesn't implement these; the component touches them via audio/scroll.
    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders the header once loaded', async () => {
    const wrapper = await mountClicker()
    expect(wrapper.find('.clicker-page').exists()).toBe(true)
    expect(wrapper.find('.clicker-header h1').text()).toContain('Idle Clicker')
  })

  it('clicking the mushroom increases the displayed count and spawns a particle', async () => {
    const wrapper = await mountClicker()

    const pointsValue = () => wrapper.find('.stats-bar .stat-item .stat-value').text()
    expect(pointsValue()).toBe('0')

    const button = wrapper.find('.click-button')
    await button.trigger('click')

    // Base click power is 1, so count goes to at least 1 (crits only raise it).
    const after = parseInt(pointsValue(), 10)
    expect(after).toBeGreaterThanOrEqual(1)

    // A particle is rendered on the button.
    expect(wrapper.findAll('.particle').length).toBeGreaterThanOrEqual(1)
  })

  it('buying an affordable upgrade deducts points and increases click power', async () => {
    const wrapper = await mountClicker()

    // Grant enough points to afford "Better Click" (id 1, cost 10, +1 click power).
    const vm = wrapper.vm as any
    vm.count = 50
    await wrapper.vm.$nextTick()

    const powerBefore = parseInt(
      wrapper.findAll('.stats-bar .stat-value')[1].text(),
      10
    )

    // The first upgrade card is "Better Click".
    const firstUpgrade = wrapper.findAll('.upgrade-card')[0]
    await firstUpgrade.trigger('click')
    await wrapper.vm.$nextTick()

    // Points deducted by the cost (10).
    const pointsAfter = parseInt(wrapper.find('.stats-bar .stat-value').text(), 10)
    expect(pointsAfter).toBe(40)

    // Click power increased.
    const powerAfter = parseInt(
      wrapper.findAll('.stats-bar .stat-value')[1].text(),
      10
    )
    expect(powerAfter).toBeGreaterThan(powerBefore)
  })

  it('does not allow buying an upgrade you cannot afford', async () => {
    const wrapper = await mountClicker()

    // count is 0; the first upgrade card should be disabled.
    const firstUpgrade = wrapper.findAll('.upgrade-card')[0]
    expect(firstUpgrade.attributes('disabled')).toBeDefined()
    expect(firstUpgrade.classes()).toContain('disabled')
  })

  describe('prestige / rebirth', () => {
    it('disables rebirth below the lifetime threshold', async () => {
      const wrapper = await mountClicker()
      const prestigeBtn = wrapper.find('.prestige-btn')
      expect(prestigeBtn.attributes('disabled')).toBeDefined()
      // "Rebirth (0)" with zero pending tokens.
      expect(prestigeBtn.text()).toContain('Rebirth (0)')
    })

    it('computes tokens and applies the multiplier above the threshold', async () => {
      const wrapper = await mountClicker()
      const vm = wrapper.vm as any

      // Threshold is 1,000,000 lifetime. count / 1e6 = 4 -> sqrt = 2 tokens.
      vm.lifetimeCount = 4_000_000
      vm.count = 4_000_000
      await wrapper.vm.$nextTick()

      const prestigeBtn = wrapper.find('.prestige-btn')
      expect(prestigeBtn.attributes('disabled')).toBeUndefined()
      expect(prestigeBtn.text()).toContain('Rebirth (2)')

      // Perform the rebirth (confirm is stubbed to true).
      await prestigeBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Tokens granted, run points reset, permanent multiplier applied.
      const tokenValue = wrapper.findAll('.prestige-value')[0].text()
      const multiplierValue = wrapper.findAll('.prestige-value')[1].text()
      expect(tokenValue).toBe('2')
      // +10% per token => x1.2
      expect(multiplierValue).toBe('x1.2')
      // Run count was reset to 0.
      expect(wrapper.find('.stats-bar .stat-value').text()).toBe('0')
    })
  })

  it('shows the offline-earnings welcome-back banner on mount', async () => {
    // Seed a past last-seen timestamp and an auto-click producer so offline
    // earnings accrue. autoClickPower must be > 0 for the banner to appear.
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    localStorage.setItem('clicker-last-seen', String(oneHourAgo))
    localStorage.setItem(
      'clicker-stats',
      JSON.stringify({ count: 0, lifetimeCount: 0, prestigeTokens: 0 })
    )
    // Auto Clicker (id 2) gives +1 auto/sec per purchase.
    localStorage.setItem(
      'clicker-upgrades',
      JSON.stringify([{ id: 2, purchased: 5, cost: 50 }])
    )

    const wrapper = await mountClicker()

    const banner = wrapper.find('.offline-banner')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toContain('Welcome back')
  })

  it('does not show the offline banner without a prior last-seen timestamp', async () => {
    const wrapper = await mountClicker()
    expect(wrapper.find('.offline-banner').exists()).toBe(false)
  })

  describe('formatNumber', () => {
    it('renders B and T suffixes for large values', async () => {
      const wrapper = await mountClicker()
      const vm = wrapper.vm as any

      vm.count = 2_500_000_000 // 2.5 billion
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.stats-bar .stat-value').text()).toBe('2.50B')

      vm.count = 3_000_000_000_000 // 3 trillion
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.stats-bar .stat-value').text()).toBe('3.00T')
    })

    it('renders small numbers without a suffix', async () => {
      const wrapper = await mountClicker()
      const vm = wrapper.vm as any
      vm.count = 42
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.stats-bar .stat-value').text()).toBe('42')
    })
  })

  it('navigates home when Back is clicked', async () => {
    const wrapper = await mountClicker()
    await wrapper.find('.back-btn').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })
})
