<script setup lang="ts">
import { ref, computed } from 'vue'

interface MonthlyData {
  month: number
  principal: number
  interest: number
  balance: number
  extra: number
}

interface DRMonthlyData {
  month: number
  homeLoanBalance: number
  investmentLoanBalance: number
  portfolioValue: number
  dividends: number
  taxSaving: number
  netWealth: number
}

const disclaimerDismissed = ref(false)

const loanAmount = ref(500000)
const interestRate = ref(6.5)
const loanTermYears = ref(30)
const extraRepayment = ref(0)
const extraFrequency = ref<'monthly' | 'fortnightly' | 'weekly'>('monthly')

// Debt recycling
const drEnabled = ref(false)
const drIncome = ref(120000)
const drTotalReturn = ref(9)
const drDividendYield = ref(4)

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val)

// ATO 2025-26 tax brackets (including 2% Medicare levy)
const getMarginalRate = (income: number): number => {
  // Medicare levy threshold: $26,000 (low income)
  // We calculate effective marginal rate at the margin
  if (income <= 18200) return 0
  if (income <= 45000) return 0.19 + 0.02
  if (income <= 120000) return 0.325 + 0.02
  if (income <= 180000) return 0.37 + 0.02
  return 0.45 + 0.02
}

const marginalRate = computed(() => getMarginalRate(drIncome.value))

const extraMonthly = computed(() => {
  if (extraFrequency.value === 'fortnightly') return extraRepayment.value * 26 / 12
  if (extraFrequency.value === 'weekly') return extraRepayment.value * 52 / 12
  return extraRepayment.value
})

const schedule = computed((): MonthlyData[] => {
  const principal = loanAmount.value
  const annualRate = interestRate.value / 100
  const months = loanTermYears.value * 12
  const monthlyRate = annualRate / 12
  const extra = extraMonthly.value

  if (principal <= 0 || months <= 0) return []

  let balance = principal
  const result: MonthlyData[] = []

  let payment: number
  if (annualRate === 0) {
    payment = principal / months
  } else {
    payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  for (let m = 1; m <= months; m++) {
    if (balance <= 0) break
    const interestCharge = balance * monthlyRate
    const totalPrincipal = Math.min(payment - interestCharge + extra, balance)

    result.push({
      month: m,
      principal: Math.max(0, totalPrincipal),
      interest: interestCharge,
      balance: Math.max(0, balance - totalPrincipal),
      extra
    })

    balance -= totalPrincipal
  }

  return result
})

const baseSchedule = computed((): MonthlyData[] => {
  const principal = loanAmount.value
  const annualRate = interestRate.value / 100
  const months = loanTermYears.value * 12
  const monthlyRate = annualRate / 12

  if (principal <= 0 || months <= 0) return []

  let balance = principal
  const result: MonthlyData[] = []

  let payment: number
  if (annualRate === 0) {
    payment = principal / months
  } else {
    payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  for (let m = 1; m <= months; m++) {
    if (balance <= 0) break
    const interestCharge = balance * monthlyRate
    const principalCharge = Math.min(payment - interestCharge, balance)

    result.push({
      month: m,
      principal: Math.max(0, principalCharge),
      interest: interestCharge,
      balance: Math.max(0, balance - principalCharge),
      extra: 0
    })

    balance -= principalCharge
  }

  return result
})

// Debt recycling schedule
const drSchedule = computed((): DRMonthlyData[] => {
  if (!drEnabled.value) return []

  const principal = loanAmount.value
  const annualRate = interestRate.value / 100
  const months = loanTermYears.value * 12
  const monthlyRate = annualRate / 12
  const extra = extraMonthly.value
  const capitalGrowthRate = (drTotalReturn.value - drDividendYield.value) / 100 / 12
  const dividendRate = drDividendYield.value / 100 / 12
  const taxRate = marginalRate.value

  if (principal <= 0 || months <= 0) return []

  let payment: number
  if (annualRate === 0) {
    payment = principal / months
  } else {
    payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  let homeLoanBalance = principal
  let investmentLoanBalance = 0
  let portfolioValue = 0
  const result: DRMonthlyData[] = []

  for (let m = 1; m <= months; m++) {
    if (homeLoanBalance <= 0) break

    // 1. Pay P&I on the non-deductible home loan portion
    const homeInterest = homeLoanBalance * monthlyRate
    const homePrincipal = Math.min(payment - homeInterest + extra, homeLoanBalance)

    // 2. Recycle: redraw the principal paid and invest it
    const recycled = Math.max(0, homePrincipal)
    investmentLoanBalance += recycled
    portfolioValue += recycled

    // 3. Portfolio grows (capital gains — dividends paid out separately)
    portfolioValue *= (1 + capitalGrowthRate)

    // 4. Dividends received (applied directly to home loan)
    const dividends = portfolioValue * dividendRate

    // 5. Tax saving on investment loan interest (deductible)
    const investmentInterest = investmentLoanBalance * monthlyRate
    const taxSaving = investmentInterest * taxRate

    // 6. Apply dividends + tax savings as extra payment on home loan
    const extraFromDR = dividends + taxSaving

    // 7. Update home loan balance
    homeLoanBalance = Math.max(0, homeLoanBalance - homePrincipal - extraFromDR)

    const netWealth = portfolioValue - investmentLoanBalance

    result.push({
      month: m,
      homeLoanBalance,
      investmentLoanBalance,
      portfolioValue,
      dividends,
      taxSaving,
      netWealth
    })
  }

  return result
})

const totalInterestPaid = computed(() => schedule.value.reduce((s, r) => s + r.interest, 0))
const totalPaid = computed(() => schedule.value.reduce((s, r) => s + r.principal + r.interest, 0))
const baseMonthlyPayment = computed(() => {
  const principal = loanAmount.value
  const annualRate = interestRate.value / 100
  const months = loanTermYears.value * 12
  const monthlyRate = annualRate / 12
  if (annualRate === 0) return principal / months
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
})
const actualLoanLength = computed(() => schedule.value.length)
const yearsEarlier = computed(() => Math.max(0, loanTermYears.value * 12 - actualLoanLength.value) / 12)
const interestSaved = computed(() => {
  const baseTotal = baseSchedule.value.reduce((s, r) => s + r.interest, 0)
  return baseTotal - totalInterestPaid.value
})

// DR summary stats
const drLoanLength = computed(() => drSchedule.value.length)
const drYearsEarlier = computed(() => Math.max(0, actualLoanLength.value - drLoanLength.value) / 12)
const drFinalPortfolio = computed(() => drSchedule.value.at(-1)?.portfolioValue ?? 0)
const drFinalInvestmentLoan = computed(() => drSchedule.value.at(-1)?.investmentLoanBalance ?? 0)
const drNetWealth = computed(() => drFinalPortfolio.value - drFinalInvestmentLoan.value)
const drTotalDividends = computed(() => drSchedule.value.reduce((s, r) => s + r.dividends, 0))
const drTotalTaxSavings = computed(() => drSchedule.value.reduce((s, r) => s + r.taxSaving, 0))

// SVG chart data
const SVG_W = 800
const SVG_H = 320
const PAD = { top: 20, right: 20, bottom: 40, left: 70 }

const chartData = computed(() => {
  const data = schedule.value
  if (!data.length) return { bars: [], months: 0, maxVal: 0 }

  const step = Math.ceil(data.length / 120)
  const sampled = data.filter((_, i) => i % step === 0)

  const maxVal = Math.max(...sampled.map(d => d.principal + d.interest))
  const innerW = SVG_W - PAD.left - PAD.right
  const innerH = SVG_H - PAD.top - PAD.bottom
  const barW = Math.max(1, innerW / sampled.length - 1)

  const bars = sampled.map((d, i) => {
    const x = PAD.left + i * (innerW / sampled.length)
    const totalH = ((d.principal + d.interest) / maxVal) * innerH
    const interestH = (d.interest / maxVal) * innerH
    const principalH = totalH - interestH
    return {
      x,
      barW,
      interestY: PAD.top + innerH - interestH,
      interestH,
      principalY: PAD.top + innerH - totalH,
      principalH,
      month: d.month
    }
  })

  return { bars, months: data.length, maxVal }
})

const yLabels = computed(() => {
  const { maxVal } = chartData.value
  if (!maxVal) return []
  const innerH = SVG_H - PAD.top - PAD.bottom
  return [0, 0.25, 0.5, 0.75, 1].map(frac => ({
    val: formatCurrency(maxVal * frac),
    y: PAD.top + innerH - frac * innerH
  }))
})

const xLabels = computed(() => {
  const { bars } = chartData.value
  if (!bars.length) return []
  const step = Math.ceil(bars.length / 6)
  return bars.filter((_, i) => i % step === 0 || i === bars.length - 1).map(b => ({
    x: b.x + b.barW / 2,
    label: `Yr ${Math.ceil(b.month / 12)}`
  }))
})

// Balance line
const balanceLine = computed(() => {
  const data = schedule.value
  if (!data.length) return ''
  const step = Math.ceil(data.length / 120)
  const sampled = data.filter((_, i) => i % step === 0)
  const maxBalance = loanAmount.value
  const innerW = SVG_W - PAD.left - PAD.right
  const innerH = SVG_H - PAD.top - PAD.bottom
  return sampled.map((d, i) => {
    const x = PAD.left + i * (innerW / sampled.length) + (innerW / sampled.length) / 2
    const y = PAD.top + innerH - (d.balance / maxBalance) * innerH
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
})

// DR comparison chart (portfolio value vs investment loan vs home loan balance)
const DR_SVG_W = 800
const DR_SVG_H = 300
const DR_PAD = { top: 20, right: 20, bottom: 40, left: 80 }

const drChartData = computed(() => {
  const data = drSchedule.value
  if (!data.length) return { maxVal: 0, portfolioLine: '', investLoanLine: '', homeLoanLine: '', xLabels: [] }

  const step = Math.ceil(data.length / 120)
  const sampled = data.filter((_, i) => i % step === 0)

  const maxVal = Math.max(
    loanAmount.value,
    ...sampled.map(d => d.portfolioValue),
    ...sampled.map(d => d.investmentLoanBalance)
  )
  const innerW = DR_SVG_W - DR_PAD.left - DR_PAD.right
  const innerH = DR_SVG_H - DR_PAD.top - DR_PAD.bottom

  const toPath = (vals: { x: number; y: number }[]) =>
    vals.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const points = sampled.map((d, i) => {
    const x = DR_PAD.left + i * (innerW / sampled.length) + (innerW / sampled.length) / 2
    return {
      x,
      portfolio: DR_PAD.top + innerH - (d.portfolioValue / maxVal) * innerH,
      investLoan: DR_PAD.top + innerH - (d.investmentLoanBalance / maxVal) * innerH,
      homeLoan: DR_PAD.top + innerH - (d.homeLoanBalance / maxVal) * innerH,
      month: d.month
    }
  })

  const xLabelStep = Math.ceil(points.length / 6)
  const xLabels = points
    .filter((_, i) => i % xLabelStep === 0 || i === points.length - 1)
    .map(p => ({ x: p.x, label: `Yr ${Math.ceil(p.month / 12)}` }))

  const drYLabels = [0, 0.25, 0.5, 0.75, 1].map(frac => ({
    val: formatCurrency(maxVal * frac),
    y: DR_PAD.top + innerH - frac * innerH
  }))

  return {
    maxVal,
    portfolioLine: toPath(points.map(p => ({ x: p.x, y: p.portfolio }))),
    investLoanLine: toPath(points.map(p => ({ x: p.x, y: p.investLoan }))),
    homeLoanLine: toPath(points.map(p => ({ x: p.x, y: p.homeLoan }))),
    xLabels,
    yLabels: drYLabels
  }
})
</script>

<template>
  <div class="loan-page">
    <h1 class="page-title">Home Loan Calculator</h1>

    <Teleport to="body">
      <div v-if="!disclaimerDismissed" class="modal-backdrop" @click.self="disclaimerDismissed = true">
        <div class="modal">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">Heads up</h2>
          <p class="modal-body">
            This is a shitpost and AI generated slop. Proceed understanding that it's unlikely to even be remotely close.
          </p>
          <button class="modal-btn" @click="disclaimerDismissed = true">I understand, show me the slop</button>
        </div>
      </div>
    </Teleport>

    <div class="layout">
      <!-- Inputs -->
      <div class="panel inputs-panel">
        <h2>Loan Details</h2>

        <div class="field">
          <label>Loan Amount</label>
          <div class="input-row">
            <span class="prefix">$</span>
            <input type="number" v-model.number="loanAmount" min="0" max="100000000" step="10000" />
          </div>
          <input type="range" v-model.number="loanAmount" min="0" max="5000000" step="10000" class="slider" />
        </div>

        <div class="field">
          <label>Interest Rate <span class="hint">(0–200%)</span></label>
          <div class="input-row">
            <input type="number" v-model.number="interestRate" min="0" max="200" step="0.05" />
            <span class="suffix">%</span>
          </div>
          <input type="range" v-model.number="interestRate" min="0" max="200" step="0.05" class="slider" />
          <div v-if="interestRate > 30" class="warning">
            {{ interestRate > 100 ? 'Loan shark territory' : 'Very high rate — check your numbers!' }}
          </div>
        </div>

        <div class="field">
          <label>Loan Term</label>
          <div class="input-row">
            <input type="number" v-model.number="loanTermYears" min="1" max="100" step="1" />
            <span class="suffix">years</span>
          </div>
          <input type="range" v-model.number="loanTermYears" min="1" max="100" step="1" class="slider" />
        </div>

        <div class="field extra-section">
          <label>Extra Repayments</label>
          <div class="input-row">
            <span class="prefix">$</span>
            <input type="number" v-model.number="extraRepayment" min="0" max="1000000" step="100" />
            <select v-model="extraFrequency" class="freq-select">
              <option value="monthly">/ month</option>
              <option value="fortnightly">/ fortnight</option>
              <option value="weekly">/ week</option>
            </select>
          </div>
          <input type="range" v-model.number="extraRepayment" min="0" max="10000" step="100" class="slider" />
          <div v-if="extraRepayment > 0" class="extra-note">
            = {{ formatCurrency(extraMonthly) }} / month
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="panel summary-panel">
        <h2>Summary</h2>
        <div class="stat-grid">
          <div class="stat">
            <div class="stat-label">Monthly Payment</div>
            <div class="stat-value">{{ formatCurrency(baseMonthlyPayment) }}</div>
          </div>
          <div class="stat" v-if="extraRepayment > 0">
            <div class="stat-label">Total Monthly</div>
            <div class="stat-value">{{ formatCurrency(baseMonthlyPayment + extraMonthly) }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Interest</div>
            <div class="stat-value interest">{{ formatCurrency(totalInterestPaid) }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Repaid</div>
            <div class="stat-value">{{ formatCurrency(totalPaid) }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Loan Duration</div>
            <div class="stat-value">{{ (actualLoanLength / 12).toFixed(1) }} years</div>
          </div>
          <template v-if="extraRepayment > 0 && yearsEarlier > 0">
            <div class="stat highlight">
              <div class="stat-label">Paid Off Early</div>
              <div class="stat-value">{{ yearsEarlier.toFixed(1) }} years</div>
            </div>
            <div class="stat highlight">
              <div class="stat-label">Interest Saved</div>
              <div class="stat-value">{{ formatCurrency(interestSaved) }}</div>
            </div>
          </template>
        </div>

        <!-- Interest vs Principal ratio bar -->
        <div class="ratio-bar-wrap" v-if="totalPaid > 0">
          <div class="ratio-label">
            <span class="principal-dot"></span> Principal {{ formatCurrency(loanAmount) }}
            <span class="interest-dot"></span> Interest {{ formatCurrency(totalInterestPaid) }}
          </div>
          <div class="ratio-bar">
            <div class="ratio-principal" :style="{ width: (loanAmount / totalPaid * 100).toFixed(1) + '%' }"></div>
            <div class="ratio-interest" :style="{ width: (totalInterestPaid / totalPaid * 100).toFixed(1) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="panel chart-panel" v-if="schedule.length">
      <h2>Repayment Breakdown Over Time</h2>
      <div class="legend">
        <span class="legend-item"><span class="legend-box principal-box"></span> Principal</span>
        <span class="legend-item"><span class="legend-box interest-box"></span> Interest</span>
        <span class="legend-item"><span class="legend-line balance-line-legend"></span> Remaining Balance</span>
      </div>
      <div class="chart-scroll">
        <svg :viewBox="`0 0 ${SVG_W} ${SVG_H}`" class="chart-svg" preserveAspectRatio="none">
          <g v-for="label in yLabels" :key="label.val">
            <line :x1="PAD.left" :y1="label.y" :x2="SVG_W - PAD.right" :y2="label.y" class="grid-line" />
            <text :x="PAD.left - 6" :y="label.y + 4" class="axis-label" text-anchor="end">{{ label.val }}</text>
          </g>

          <g v-for="bar in chartData.bars" :key="bar.month">
            <rect :x="bar.x" :y="bar.principalY" :width="bar.barW" :height="bar.principalH" class="bar-principal" />
            <rect :x="bar.x" :y="bar.interestY" :width="bar.barW" :height="bar.interestH" class="bar-interest" />
          </g>

          <path :d="balanceLine" class="balance-path" fill="none" />

          <g v-for="xl in xLabels" :key="xl.x">
            <text :x="xl.x" :y="SVG_H - PAD.bottom + 16" class="axis-label" text-anchor="middle">{{ xl.label }}</text>
          </g>

          <line :x1="PAD.left" :y1="PAD.top" :x2="PAD.left" :y2="SVG_H - PAD.bottom" class="axis-line" />
          <line :x1="PAD.left" :y1="SVG_H - PAD.bottom" :x2="SVG_W - PAD.right" :y2="SVG_H - PAD.bottom" class="axis-line" />
        </svg>
      </div>
    </div>

    <!-- Year-by-year table -->
    <div class="panel table-panel" v-if="schedule.length">
      <details>
        <summary>Year-by-Year Breakdown</summary>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Principal Paid</th>
                <th>Interest Paid</th>
                <th>Extra Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="yr in Math.ceil(schedule.length / 12)" :key="yr">
                <td>{{ yr }}</td>
                <td>{{ formatCurrency(schedule.slice((yr - 1) * 12, yr * 12).reduce((s, r) => s + r.principal, 0)) }}</td>
                <td class="interest-cell">{{ formatCurrency(schedule.slice((yr - 1) * 12, yr * 12).reduce((s, r) => s + r.interest, 0)) }}</td>
                <td>{{ formatCurrency(schedule.slice((yr - 1) * 12, yr * 12).reduce((s, r) => s + r.extra, 0)) }}</td>
                <td>{{ formatCurrency(schedule[Math.min(yr * 12 - 1, schedule.length - 1)].balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>

    <!-- ── Debt Recycling Section ── -->
    <div class="panel dr-toggle-panel">
      <div class="dr-header">
        <div>
          <h2 style="margin:0 0 0.25rem">Debt Recycling</h2>
          <p class="dr-subtitle">Convert non-deductible home loan debt into tax-deductible investment debt over time.</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" v-model="drEnabled" />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
      </div>

      <template v-if="drEnabled">
        <div class="dr-inputs">
          <div class="field">
            <label>Annual Taxable Income <span class="hint">(ATO 2025–26 brackets)</span></label>
            <div class="input-row">
              <span class="prefix">$</span>
              <input type="number" v-model.number="drIncome" min="0" max="5000000" step="5000" />
            </div>
            <input type="range" v-model.number="drIncome" min="0" max="500000" step="5000" class="slider" />
            <div class="dr-tax-note">
              Marginal rate: <strong>{{ (marginalRate * 100).toFixed(0) }}%</strong>
              <span class="hint"> (incl. 2% Medicare levy)</span>
            </div>
          </div>

          <div class="field">
            <label>Expected Total Investment Return <span class="hint">(dividends + capital growth)</span></label>
            <div class="input-row">
              <input type="number" v-model.number="drTotalReturn" min="0" max="50" step="0.5" />
              <span class="suffix">% p.a.</span>
            </div>
            <input type="range" v-model.number="drTotalReturn" min="0" max="30" step="0.5" class="slider" />
          </div>

          <div class="field">
            <label>Dividend Yield <span class="hint">(cash income applied to loan)</span></label>
            <div class="input-row">
              <input type="number" v-model.number="drDividendYield" min="0" :max="drTotalReturn" step="0.5" />
              <span class="suffix">% p.a.</span>
            </div>
            <input type="range" v-model.number="drDividendYield" min="0" :max="drTotalReturn" step="0.5" class="slider" />
            <div class="extra-note">Capital growth: {{ (drTotalReturn - drDividendYield).toFixed(1) }}% p.a.</div>
          </div>
        </div>

        <!-- DR Results -->
        <div v-if="drSchedule.length" class="dr-results">
          <h3 class="dr-results-title">Debt Recycling Outcome</h3>

          <div class="stat-grid">
            <div class="stat highlight-green">
              <div class="stat-label">Home Loan Paid Off</div>
              <div class="stat-value green">{{ (drLoanLength / 12).toFixed(1) }} years</div>
            </div>
            <div class="stat highlight-green" v-if="drYearsEarlier > 0">
              <div class="stat-label">Paid Off Earlier</div>
              <div class="stat-value green">{{ drYearsEarlier.toFixed(1) }} years sooner</div>
            </div>
            <div class="stat">
              <div class="stat-label">Final Portfolio Value</div>
              <div class="stat-value">{{ formatCurrency(drFinalPortfolio) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Investment Loan Remaining</div>
              <div class="stat-value interest">{{ formatCurrency(drFinalInvestmentLoan) }}</div>
            </div>
            <div class="stat highlight-gold">
              <div class="stat-label">Net Wealth Gain</div>
              <div class="stat-value gold">{{ formatCurrency(drNetWealth) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Dividends Received</div>
              <div class="stat-value">{{ formatCurrency(drTotalDividends) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Tax Savings</div>
              <div class="stat-value green">{{ formatCurrency(drTotalTaxSavings) }}</div>
            </div>
          </div>

          <div class="dr-disclaimer">
            <strong>Note:</strong> This is a simplified model. Dividends and tax savings are applied monthly. Franking credits,
            CGT on sale, transaction costs, and income tax on dividends are not modelled. Debt recycling carries investment risk —
            consider professional financial advice.
          </div>

          <!-- DR Chart -->
          <div class="dr-chart-wrap">
            <h3 class="dr-results-title">Portfolio vs Loan Balances Over Time</h3>
            <div class="legend">
              <span class="legend-item"><span class="legend-line" style="background:#a78bfa"></span> Portfolio Value</span>
              <span class="legend-item"><span class="legend-line" style="background:#ff7755"></span> Investment Loan</span>
              <span class="legend-item"><span class="legend-line" style="background:#55dd88"></span> Home Loan (non-deductible)</span>
            </div>
            <div class="chart-scroll">
              <svg :viewBox="`0 0 ${DR_SVG_W} ${DR_SVG_H}`" class="chart-svg" preserveAspectRatio="none">
                <g v-for="label in drChartData.yLabels" :key="label.val">
                  <line :x1="DR_PAD.left" :y1="label.y" :x2="DR_SVG_W - DR_PAD.right" :y2="label.y" class="grid-line" />
                  <text :x="DR_PAD.left - 6" :y="label.y + 4" class="axis-label" text-anchor="end">{{ label.val }}</text>
                </g>

                <path :d="drChartData.portfolioLine" fill="none" class="dr-portfolio-path" />
                <path :d="drChartData.investLoanLine" fill="none" class="dr-investloan-path" />
                <path :d="drChartData.homeLoanLine" fill="none" class="dr-homeloan-path" />

                <g v-for="xl in drChartData.xLabels" :key="xl.x">
                  <text :x="xl.x" :y="DR_SVG_H - DR_PAD.bottom + 16" class="axis-label" text-anchor="middle">{{ xl.label }}</text>
                </g>

                <line :x1="DR_PAD.left" :y1="DR_PAD.top" :x2="DR_PAD.left" :y2="DR_SVG_H - DR_PAD.bottom" class="axis-line" />
                <line :x1="DR_PAD.left" :y1="DR_SVG_H - DR_PAD.bottom" :x2="DR_SVG_W - DR_PAD.right" :y2="DR_SVG_H - DR_PAD.bottom" class="axis-line" />
              </svg>
            </div>
          </div>

          <!-- DR Year-by-Year Table -->
          <details class="dr-table-details">
            <summary>Year-by-Year Debt Recycling Breakdown</summary>
            <div class="table-scroll" style="margin-top:1rem">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Home Loan Balance</th>
                    <th>Investment Loan</th>
                    <th>Portfolio Value</th>
                    <th>Dividends</th>
                    <th>Tax Savings</th>
                    <th>Net Wealth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="yr in Math.ceil(drSchedule.length / 12)" :key="yr">
                    <td>{{ yr }}</td>
                    <td>{{ formatCurrency(drSchedule[Math.min(yr * 12 - 1, drSchedule.length - 1)].homeLoanBalance) }}</td>
                    <td class="interest-cell">{{ formatCurrency(drSchedule[Math.min(yr * 12 - 1, drSchedule.length - 1)].investmentLoanBalance) }}</td>
                    <td class="portfolio-cell">{{ formatCurrency(drSchedule[Math.min(yr * 12 - 1, drSchedule.length - 1)].portfolioValue) }}</td>
                    <td>{{ formatCurrency(drSchedule.slice((yr - 1) * 12, yr * 12).reduce((s, r) => s + r.dividends, 0)) }}</td>
                    <td class="savings-cell">{{ formatCurrency(drSchedule.slice((yr - 1) * 12, yr * 12).reduce((s, r) => s + r.taxSaving, 0)) }}</td>
                    <td class="net-wealth-cell">{{ formatCurrency(drSchedule[Math.min(yr * 12 - 1, drSchedule.length - 1)].netWealth) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.loan-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  color: #e8e8e8;
  font-family: inherit;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 700px) {
  .layout { grid-template-columns: 1fr; }
}

.panel {
  background: #1a1a2e;
  border: 1px solid #2a2a4a;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.panel h2 {
  font-size: 1.1rem;
  color: #aaa;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-panel, .table-panel, .summary-panel, .dr-toggle-panel {
  margin-bottom: 1rem;
}

/* Inputs */
.field {
  margin-bottom: 1.2rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 0.4rem;
}

.hint {
  font-size: 0.75rem;
  color: #666;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.input-row input[type="number"] {
  flex: 1;
  background: #0d0d1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 0.45rem 0.6rem;
  font-size: 1rem;
  min-width: 0;
}

.input-row input[type="number"]:focus {
  outline: none;
  border-color: #5577ff;
}

.prefix, .suffix {
  color: #888;
  font-size: 0.9rem;
  white-space: nowrap;
}

.freq-select {
  background: #0d0d1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #aaa;
  padding: 0.45rem 0.5rem;
  font-size: 0.85rem;
}

.slider {
  width: 100%;
  margin-top: 0.4rem;
  accent-color: #5577ff;
}

.warning {
  font-size: 0.8rem;
  color: #ff8844;
  margin-top: 0.3rem;
}

.extra-note {
  font-size: 0.8rem;
  color: #77aaff;
  margin-top: 0.3rem;
}

.extra-section {
  border-top: 1px solid #2a2a4a;
  padding-top: 1rem;
}

/* Summary */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.stat {
  background: #0d0d1a;
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
}

.stat.highlight {
  border: 1px solid #44aa66;
}

.stat.highlight-green {
  border: 1px solid #44aa66;
}

.stat.highlight-gold {
  border: 1px solid #ccaa44;
}

.stat-label {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: #ddd;
}

.stat-value.interest {
  color: #ff7755;
}

.stat.highlight .stat-value,
.stat-value.green {
  color: #55dd88;
}

.stat-value.gold {
  color: #ffcc55;
}

/* Ratio bar */
.ratio-bar-wrap {
  margin-top: 0.5rem;
}

.ratio-label {
  font-size: 0.78rem;
  color: #888;
  margin-bottom: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.principal-dot, .interest-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.principal-dot { background: #5577ff; }
.interest-dot { background: #ff7755; }

.ratio-bar {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
}

.ratio-principal { background: #5577ff; }
.ratio-interest { background: #ff7755; }

/* Chart */
.chart-scroll {
  overflow-x: auto;
}

.chart-svg {
  width: 100%;
  min-width: 400px;
  height: 320px;
  display: block;
}

.legend {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #aaa;
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.principal-box { background: #5577ff; }
.interest-box { background: #ff7755; }

.legend-line {
  width: 20px;
  height: 2px;
  border-radius: 1px;
}

.balance-line-legend { background: #55dd88; }

/* SVG elements */
.bar-principal { fill: #5577ff; opacity: 0.85; }
.bar-interest { fill: #ff7755; opacity: 0.85; }
.balance-path { stroke: #55dd88; stroke-width: 2; }
.grid-line { stroke: #2a2a4a; stroke-width: 1; }
.axis-line { stroke: #444; stroke-width: 1.5; }
.axis-label { fill: #666; font-size: 11px; }

/* DR SVG paths */
.dr-portfolio-path { stroke: #a78bfa; stroke-width: 2.5; }
.dr-investloan-path { stroke: #ff7755; stroke-width: 2; stroke-dasharray: 5 3; }
.dr-homeloan-path { stroke: #55dd88; stroke-width: 2; }

/* Table */
details summary {
  cursor: pointer;
  color: #aaa;
  font-size: 0.9rem;
  padding: 0.3rem 0;
  user-select: none;
}

details summary:hover { color: #ddd; }

.table-scroll {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th, td {
  padding: 0.5rem 0.8rem;
  text-align: right;
  border-bottom: 1px solid #1e1e3a;
}

th {
  color: #888;
  font-weight: normal;
  text-transform: uppercase;
  font-size: 0.75rem;
}

th:first-child, td:first-child { text-align: left; }

td { color: #ccc; }

.interest-cell { color: #ff7755; }
.portfolio-cell { color: #a78bfa; }
.savings-cell { color: #55dd88; }
.net-wealth-cell { color: #ffcc55; font-weight: 600; }

tr:hover td { background: #1e1e3a; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal {
  background: #1a1a2e;
  border: 1px solid #aa6600;
  border-radius: 14px;
  padding: 2rem 2.25rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
}

.modal-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.modal-title {
  font-size: 1.3rem;
  color: #ffaa44;
  margin: 0 0 0.75rem;
}

.modal-body {
  color: #bbb;
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.modal-btn {
  background: #aa6600;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.15s;
}

.modal-btn:hover {
  background: #cc8800;
}

/* ── Debt Recycling ── */
.dr-toggle-panel {
  border-color: #3a2a5a;
}

.dr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dr-subtitle {
  font-size: 0.82rem;
  color: #888;
  margin: 0;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: #2a2a4a;
  border-radius: 12px;
  transition: background 0.2s;
  position: relative;
}

.toggle-switch input:checked + .toggle-track {
  background: #7755dd;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}

.dr-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  padding: 1.25rem;
  background: #12121f;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #2a1a4a;
}

@media (max-width: 700px) {
  .dr-inputs { grid-template-columns: 1fr; }
}

.dr-tax-note {
  font-size: 0.8rem;
  color: #a78bfa;
  margin-top: 0.3rem;
}

.dr-results-title {
  font-size: 0.95rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem;
}

.dr-results {
  border-top: 1px solid #2a2a4a;
  padding-top: 1.5rem;
}

.dr-chart-wrap {
  margin-top: 1.5rem;
}

.dr-disclaimer {
  font-size: 0.78rem;
  color: #666;
  background: #0d0d1a;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  line-height: 1.5;
}

.dr-disclaimer strong {
  color: #888;
}

.dr-table-details {
  margin-top: 1.5rem;
}
</style>
