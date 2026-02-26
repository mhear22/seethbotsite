import { ref, computed } from 'vue'

export interface MonthlyData {
  month: number
  principal: number
  interest: number
  balance: number
  extra: number
}

export interface DRMonthlyData {
  month: number
  homeLoanBalance: number
  investmentLoanBalance: number
  portfolioValue: number
  dividends: number
  taxSaving: number
  netWealth: number
}

export interface LoanSettings {
  loanAmount: number
  interestRate: number
  loanTermYears: number
  extraRepayment: number
  extraFrequency: 'monthly' | 'fortnightly' | 'weekly'
}

export interface DebtRecyclingSettings {
  enabled: boolean
  income: number
  totalReturn: number
  dividendYield: number
}

// ATO 2025-26 tax brackets (including 2% Medicare levy)
function getMarginalRate(income: number): number {
  if (income <= 18200) return 0
  if (income <= 45000) return 0.19 + 0.02
  if (income <= 120000) return 0.325 + 0.02
  if (income <= 180000) return 0.37 + 0.02
  return 0.45 + 0.02
}

// Calculate monthly payment
function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months
  const monthlyRate = annualRate / 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

// Generate amortization schedule
function generateSchedule(
  principal: number,
  annualRate: number,
  months: number,
  extraMonthly: number
): MonthlyData[] {
  if (principal <= 0 || months <= 0) return []

  const monthlyRate = annualRate / 12
  const payment = calculateMonthlyPayment(principal, annualRate, months)
  let balance = principal
  const result: MonthlyData[] = []

  for (let m = 1; m <= months; m++) {
    if (balance <= 0) break
    const interestCharge = balance * monthlyRate
    const totalPrincipal = Math.min(payment - interestCharge + extraMonthly, balance)

    result.push({
      month: m,
      principal: Math.max(0, totalPrincipal),
      interest: interestCharge,
      balance: Math.max(0, balance - totalPrincipal),
      extra: extraMonthly
    })

    balance -= totalPrincipal
  }

  return result
}

// Generate debt recycling schedule
function generateDRSchedule(
  principal: number,
  annualRate: number,
  months: number,
  extraMonthly: number,
  income: number,
  totalReturn: number,
  dividendYield: number
): DRMonthlyData[] {
  const monthlyRate = annualRate / 12
  const capitalGrowthRate = (totalReturn - dividendYield) / 100 / 12
  const dividendRate = dividendYield / 100 / 12
  const taxRate = getMarginalRate(income)
  const payment = calculateMonthlyPayment(principal, annualRate, months)

  let homeLoanBalance = principal
  let investmentLoanBalance = 0
  let portfolioValue = 0
  const result: DRMonthlyData[] = []

  for (let m = 1; m <= months; m++) {
    if (homeLoanBalance <= 0) break

    // 1. Pay P&I on the non-deductible home loan portion
    const homeInterest = homeLoanBalance * monthlyRate
    const homePrincipal = Math.min(payment - homeInterest + extraMonthly, homeLoanBalance)

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
}

export function useHomeLoanCalculator() {
  // Loan settings
  const loanAmount = ref(500000)
  const interestRate = ref(6.5)
  const loanTermYears = ref(30)
  const extraRepayment = ref(0)
  const extraFrequency = ref<'monthly' | 'fortnightly' | 'weekly'>('monthly')

  // Debt recycling settings
  const drEnabled = ref(false)
  const drIncome = ref(120000)
  const drTotalReturn = ref(9)
  const drDividendYield = ref(4)

  // Computed values
  const marginalRate = computed(() => getMarginalRate(drIncome.value))

  const extraMonthly = computed(() => {
    if (extraFrequency.value === 'fortnightly') return extraRepayment.value * 26 / 12
    if (extraFrequency.value === 'weekly') return extraRepayment.value * 52 / 12
    return extraRepayment.value
  })

  const months = computed(() => loanTermYears.value * 12)
  const annualRate = computed(() => interestRate.value / 100)

  // Schedule with extra repayments
  const schedule = computed(() => generateSchedule(
    loanAmount.value,
    annualRate.value,
    months.value,
    extraMonthly.value
  ))

  // Base schedule (no extra repayments)
  const baseSchedule = computed(() => generateSchedule(
    loanAmount.value,
    annualRate.value,
    months.value,
    0
  ))

  // Debt recycling schedule
  const drSchedule = computed(() => {
    if (!drEnabled.value) return []
    return generateDRSchedule(
      loanAmount.value,
      annualRate.value,
      months.value,
      extraMonthly.value,
      drIncome.value,
      drTotalReturn.value,
      drDividendYield.value
    )
  })

  // Summary statistics
  const totalInterestPaid = computed(() => schedule.value.reduce((s, r) => s + r.interest, 0))
  const totalPaid = computed(() => schedule.value.reduce((s, r) => s + r.principal + r.interest, 0))
  const baseMonthlyPayment = computed(() => calculateMonthlyPayment(loanAmount.value, annualRate.value, months.value))
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

  // Validation
  const validationErrors = computed(() => {
    const errors: string[] = []
    if (loanAmount.value <= 0) errors.push('Loan amount must be positive')
    if (interestRate.value < 0) errors.push('Interest rate cannot be negative')
    if (loanTermYears.value < 1) errors.push('Loan term must be at least 1 year')
    if (interestRate.value > 30) errors.push(interestRate.value > 100 ? 'Loan shark territory' : 'Very high rate — check your numbers!')
    return errors
  })

  const isValid = computed(() => validationErrors.value.length === 0)

  // Settings object for external access
  const settings = computed<LoanSettings>(() => ({
    loanAmount: loanAmount.value,
    interestRate: interestRate.value,
    loanTermYears: loanTermYears.value,
    extraRepayment: extraRepayment.value,
    extraFrequency: extraFrequency.value
  }))

  const drSettings = computed<DebtRecyclingSettings>(() => ({
    enabled: drEnabled.value,
    income: drIncome.value,
    totalReturn: drTotalReturn.value,
    dividendYield: drDividendYield.value
  }))

  // Reset function
  function reset() {
    loanAmount.value = 500000
    interestRate.value = 6.5
    loanTermYears.value = 30
    extraRepayment.value = 0
    extraFrequency.value = 'monthly'
    drEnabled.value = false
    drIncome.value = 120000
    drTotalReturn.value = 9
    drDividendYield.value = 4
  }

  return {
    // State
    loanAmount,
    interestRate,
    loanTermYears,
    extraRepayment,
    extraFrequency,
    drEnabled,
    drIncome,
    drTotalReturn,
    drDividendYield,

    // Computed
    marginalRate,
    extraMonthly,
    schedule,
    baseSchedule,
    drSchedule,
    totalInterestPaid,
    totalPaid,
    baseMonthlyPayment,
    actualLoanLength,
    yearsEarlier,
    interestSaved,
    drLoanLength,
    drYearsEarlier,
    drFinalPortfolio,
    drFinalInvestmentLoan,
    drNetWealth,
    drTotalDividends,
    drTotalTaxSavings,

    // Settings objects
    settings,
    drSettings,

    // Validation
    validationErrors,
    isValid,

    // Actions
    reset
  }
}
