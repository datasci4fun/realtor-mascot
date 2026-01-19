'use client'

import { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type LoanType = 'conventional' | 'fha' | 'va' | 'usda'

interface AmortizationRow {
  month: number
  year: number
  payment: number
  principal: number
  interest: number
  balance: number
  totalPrincipal: number
  totalInterest: number
}

interface LoanTypeInfo {
  name: string
  description: string
  minDownPaymentPercent: number
  hasPMI: boolean
  pmiRate: number // Annual rate as decimal
  upfrontFee: number // As decimal (e.g., 0.0175 for 1.75%)
  upfrontFeeLabel: string
  annualFeeLabel: string
  pmiRemovable: boolean
  pmiRemovalNote: string
  bestFor: string
  loanLimit2025: number
}

const LOAN_TYPES: Record<LoanType, LoanTypeInfo> = {
  conventional: {
    name: 'Conventional',
    description: 'Standard mortgage not backed by government. Best rates for good credit.',
    minDownPaymentPercent: 3,
    hasPMI: true,
    pmiRate: 0.007, // ~0.7% average
    upfrontFee: 0,
    upfrontFeeLabel: '',
    annualFeeLabel: 'PMI',
    pmiRemovable: true,
    pmiRemovalNote: 'PMI removed at 20% equity',
    bestFor: 'Credit score 620+, want to remove PMI later',
    loanLimit2025: 806500,
  },
  fha: {
    name: 'FHA',
    description: 'Government-backed loan with lower credit requirements.',
    minDownPaymentPercent: 3.5,
    hasPMI: true,
    pmiRate: 0.0055, // 0.55% annual MIP (varies by loan term/amount)
    upfrontFee: 0.0175, // 1.75% upfront MIP
    upfrontFeeLabel: 'Upfront MIP (1.75%)',
    annualFeeLabel: 'MIP',
    pmiRemovable: false,
    pmiRemovalNote: 'MIP required for life of loan (11 years if 10%+ down)',
    bestFor: 'Credit score 500-619, first-time buyers',
    loanLimit2025: 524225,
  },
  va: {
    name: 'VA',
    description: 'For veterans, active military, and eligible spouses. No down payment required.',
    minDownPaymentPercent: 0,
    hasPMI: false,
    pmiRate: 0,
    upfrontFee: 0.0215, // 2.15% funding fee (first use, $0 down)
    upfrontFeeLabel: 'VA Funding Fee (2.15%)',
    annualFeeLabel: '',
    pmiRemovable: false,
    pmiRemovalNote: 'No monthly mortgage insurance',
    bestFor: 'Veterans, active military, eligible spouses',
    loanLimit2025: 0, // No limit with full entitlement
  },
  usda: {
    name: 'USDA',
    description: 'For rural and suburban areas. No down payment, income limits apply.',
    minDownPaymentPercent: 0,
    hasPMI: true,
    pmiRate: 0.0035, // 0.35% annual guarantee fee
    upfrontFee: 0.01, // 1% upfront guarantee fee
    upfrontFeeLabel: 'Guarantee Fee (1%)',
    annualFeeLabel: 'Guarantee Fee',
    pmiRemovable: false,
    pmiRemovalNote: 'Annual fee required for life of loan',
    bestFor: 'Rural/suburban areas, income under $119,850',
    loanLimit2025: 398600,
  },
}

interface MortgageInputs {
  homePrice: number
  downPayment: number
  downPaymentPercent: number
  interestRate: number
  loanTerm: number
  propertyTaxRate: number
  homeInsurance: number
  hoa: number
  loanType: LoanType
}

interface MortgageBreakdown {
  principal: number
  interest: number
  propertyTax: number
  homeInsurance: number
  pmi: number
  hoa: number
  total: number
  loanAmount: number
  totalInterest: number
  totalCost: number
  upfrontFees: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface MortgageCalculatorProps {
  initialPrice?: number
  compact?: boolean
}

export default function MortgageCalculator({ initialPrice = 400000, compact = false }: MortgageCalculatorProps) {
  const [inputs, setInputs] = useState<MortgageInputs>({
    homePrice: initialPrice,
    downPayment: initialPrice * 0.2,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTaxRate: 2.2, // Texas average
    homeInsurance: 2400,
    hoa: 0,
    loanType: 'conventional',
  })

  const [usePercent, setUsePercent] = useState(true)

  const loanTypeInfo = LOAN_TYPES[inputs.loanType]

  const updateInput = (field: keyof MortgageInputs, value: number | LoanType) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value }

      // When loan type changes, adjust down payment to meet minimum
      if (field === 'loanType') {
        const newLoanType = LOAN_TYPES[value as LoanType]
        if (updated.downPaymentPercent < newLoanType.minDownPaymentPercent) {
          updated.downPaymentPercent = newLoanType.minDownPaymentPercent
          updated.downPayment = (updated.homePrice * newLoanType.minDownPaymentPercent) / 100
        }
        // Adjust interest rate based on loan type (VA typically lower)
        if (value === 'va') {
          updated.interestRate = Math.max(5.5, updated.interestRate - 0.5)
        } else if (prev.loanType === 'va') {
          updated.interestRate = updated.interestRate + 0.5
        }
      }

      // Sync down payment amount and percent
      if (field === 'downPaymentPercent') {
        updated.downPayment = (updated.homePrice * (value as number)) / 100
      } else if (field === 'downPayment') {
        updated.downPaymentPercent = ((value as number) / updated.homePrice) * 100
      } else if (field === 'homePrice') {
        if (usePercent) {
          updated.downPayment = ((value as number) * updated.downPaymentPercent) / 100
        } else {
          updated.downPaymentPercent = (updated.downPayment / (value as number)) * 100
        }
      }

      return updated
    })
  }

  const breakdown = useMemo((): MortgageBreakdown => {
    const loanTypeConfig = LOAN_TYPES[inputs.loanType]
    const loanAmount = inputs.homePrice - inputs.downPayment
    const monthlyRate = inputs.interestRate / 100 / 12
    const numPayments = inputs.loanTerm * 12

    // Calculate upfront fees (can be financed into loan)
    const upfrontFees = loanAmount * loanTypeConfig.upfrontFee

    // Monthly principal & interest (M = P[r(1+r)^n]/[(1+r)^n-1])
    let monthlyPI = 0
    if (monthlyRate > 0) {
      const x = Math.pow(1 + monthlyRate, numPayments)
      monthlyPI = (loanAmount * monthlyRate * x) / (x - 1)
    } else {
      monthlyPI = loanAmount / numPayments
    }

    // Monthly property tax
    const monthlyTax = (inputs.homePrice * (inputs.propertyTaxRate / 100)) / 12

    // Monthly home insurance
    const monthlyInsurance = inputs.homeInsurance / 12

    // PMI/MIP/Guarantee Fee calculation based on loan type
    let monthlyPMI = 0
    if (loanTypeConfig.hasPMI) {
      if (inputs.loanType === 'conventional') {
        // Conventional PMI only required if down payment < 20%
        if (inputs.downPaymentPercent < 20) {
          monthlyPMI = (loanAmount * loanTypeConfig.pmiRate) / 12
        }
      } else {
        // FHA MIP and USDA guarantee fee always required
        monthlyPMI = (loanAmount * loanTypeConfig.pmiRate) / 12
      }
    }

    // HOA
    const monthlyHOA = inputs.hoa

    // Total monthly payment
    const total = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA

    // Total interest over life of loan
    const totalInterest = monthlyPI * numPayments - loanAmount

    // Total cost (all payments + upfront fees)
    const totalCost = total * numPayments + upfrontFees

    // Split P&I for display
    const firstMonthInterest = loanAmount * monthlyRate
    const firstMonthPrincipal = monthlyPI - firstMonthInterest

    return {
      principal: firstMonthPrincipal,
      interest: firstMonthInterest,
      propertyTax: monthlyTax,
      homeInsurance: monthlyInsurance,
      pmi: monthlyPMI,
      hoa: monthlyHOA,
      total,
      loanAmount,
      totalInterest,
      totalCost,
      upfrontFees,
    }
  }, [inputs])

  // Calculate bar widths for visual breakdown
  const barWidths = useMemo(() => {
    const total = breakdown.total
    if (total === 0) return { pi: 0, tax: 0, insurance: 0, pmi: 0, hoa: 0 }

    const pi = ((breakdown.principal + breakdown.interest) / total) * 100
    const tax = (breakdown.propertyTax / total) * 100
    const insurance = (breakdown.homeInsurance / total) * 100
    const pmi = (breakdown.pmi / total) * 100
    const hoa = (breakdown.hoa / total) * 100

    return { pi, tax, insurance, pmi, hoa }
  }, [breakdown])

  // Generate amortization schedule
  const amortizationSchedule = useMemo((): AmortizationRow[] => {
    const loanAmount = inputs.homePrice - inputs.downPayment
    const monthlyRate = inputs.interestRate / 100 / 12
    const numPayments = inputs.loanTerm * 12

    let monthlyPI = 0
    if (monthlyRate > 0) {
      const x = Math.pow(1 + monthlyRate, numPayments)
      monthlyPI = (loanAmount * monthlyRate * x) / (x - 1)
    } else {
      monthlyPI = loanAmount / numPayments
    }

    const schedule: AmortizationRow[] = []
    let balance = loanAmount
    let totalPrincipal = 0
    let totalInterest = 0

    for (let month = 1; month <= numPayments; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPI - interestPayment
      balance -= principalPayment
      totalPrincipal += principalPayment
      totalInterest += interestPayment

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        payment: monthlyPI,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        totalPrincipal,
        totalInterest,
      })
    }

    return schedule
  }, [inputs.homePrice, inputs.downPayment, inputs.interestRate, inputs.loanTerm])

  // Aggregate schedule by year for charts
  const yearlyData = useMemo(() => {
    const years: { year: number; principal: number; interest: number; balance: number }[] = []

    for (let year = 1; year <= inputs.loanTerm; year++) {
      const yearRows = amortizationSchedule.filter((row) => row.year === year)
      const lastRow = yearRows[yearRows.length - 1]
      const yearPrincipal = yearRows.reduce((sum, row) => sum + row.principal, 0)
      const yearInterest = yearRows.reduce((sum, row) => sum + row.interest, 0)

      years.push({
        year,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: lastRow?.balance || 0,
      })
    }

    return years
  }, [amortizationSchedule, inputs.loanTerm])

  // Pie chart data for payment breakdown
  const pieData = useMemo(() => {
    const data = [
      { name: 'Principal & Interest', value: breakdown.principal + breakdown.interest, color: '#4f46e5' },
      { name: 'Property Tax', value: breakdown.propertyTax, color: '#3b82f6' },
      { name: 'Insurance', value: breakdown.homeInsurance, color: '#22c55e' },
    ]

    if (breakdown.pmi > 0) {
      data.push({ name: loanTypeInfo.annualFeeLabel, value: breakdown.pmi, color: '#eab308' })
    }

    if (breakdown.hoa > 0) {
      data.push({ name: 'HOA', value: breakdown.hoa, color: '#a855f7' })
    }

    return data
  }, [breakdown, loanTypeInfo.annualFeeLabel])

  // State for active tab in schedule/charts section
  const [activeTab, setActiveTab] = useState<'charts' | 'schedule'>('charts')
  const [scheduleView, setScheduleView] = useState<'monthly' | 'yearly'>('yearly')

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Estimated Monthly Payment</h3>
        <p className="text-3xl font-bold text-primary-600 mb-2">
          {formatCurrencyDetailed(breakdown.total)}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {formatCurrency(inputs.downPayment)} down ({inputs.downPaymentPercent.toFixed(0)}%) · {inputs.loanTerm}yr · {inputs.interestRate}%
        </p>
        <a
          href={`/tools/mortgage-calculator?price=${inputs.homePrice}`}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Compare loan types (FHA, VA, USDA) →
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mortgage Calculator</h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(LOAN_TYPES) as LoanType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateInput('loanType', type)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      inputs.loanType === type
                        ? 'bg-primary-50 border-primary-600 ring-1 ring-primary-600'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`font-semibold text-sm ${
                      inputs.loanType === type ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {LOAN_TYPES[type].name}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {LOAN_TYPES[type].minDownPaymentPercent}% min down
                    </p>
                  </button>
                ))}
              </div>
              {/* Loan type info */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{loanTypeInfo.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Best for:</strong> {loanTypeInfo.bestFor}
                </p>
                {loanTypeInfo.loanLimit2025 > 0 && (
                  <p className="text-xs text-gray-500">
                    <strong>2025 Loan Limit:</strong> {formatCurrency(loanTypeInfo.loanLimit2025)}
                  </p>
                )}
              </div>
            </div>

            {/* Home Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.homePrice}
                  onChange={(e) => updateInput('homePrice', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="10000"
                value={inputs.homePrice}
                onChange={(e) => updateInput('homePrice', Number(e.target.value))}
                className="w-full mt-2 accent-primary-600"
              />
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Down Payment
                </label>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setUsePercent(false)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      !usePercent ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    $
                  </button>
                  <button
                    onClick={() => setUsePercent(true)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      usePercent ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {usePercent ? '%' : '$'}
                </span>
                <input
                  type="number"
                  value={usePercent ? inputs.downPaymentPercent.toFixed(1) : inputs.downPayment}
                  onChange={(e) =>
                    updateInput(
                      usePercent ? 'downPaymentPercent' : 'downPayment',
                      Number(e.target.value)
                    )
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <input
                type="range"
                min="0"
                max={usePercent ? 100 : inputs.homePrice}
                step={usePercent ? 1 : 1000}
                value={usePercent ? inputs.downPaymentPercent : inputs.downPayment}
                onChange={(e) =>
                  updateInput(
                    usePercent ? 'downPaymentPercent' : 'downPayment',
                    Number(e.target.value)
                  )
                }
                className="w-full mt-2 accent-primary-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(inputs.downPayment)} ({inputs.downPaymentPercent.toFixed(1)}%)
              </p>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.125"
                  value={inputs.interestRate}
                  onChange={(e) => updateInput('interestRate', Number(e.target.value))}
                  className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="0.125"
                value={inputs.interestRate}
                onChange={(e) => updateInput('interestRate', Number(e.target.value))}
                className="w-full mt-2 accent-primary-600"
              />
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term
              </label>
              <div className="flex gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => updateInput('loanTerm', term)}
                    className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${
                      inputs.loanTerm === term
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {term} years
                  </button>
                ))}
              </div>
            </div>

            {/* Property Tax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Tax Rate (Annual)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={inputs.propertyTaxRate}
                  onChange={(e) => updateInput('propertyTaxRate', Number(e.target.value))}
                  className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Texas average is ~2.2%. {formatCurrency((inputs.homePrice * inputs.propertyTaxRate) / 100)}/year
              </p>
            </div>

            {/* Home Insurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Insurance (Annual)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.homeInsurance}
                  onChange={(e) => updateInput('homeInsurance', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* HOA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HOA (Monthly)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={inputs.hoa}
                  onChange={(e) => updateInput('hoa', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <p className="text-sm text-gray-600 mb-1">Estimated Monthly Payment</p>
              <p className="text-4xl font-bold text-primary-600 mb-4">
                {formatCurrencyDetailed(breakdown.total)}
              </p>

              {/* Visual breakdown bar */}
              <div className="h-4 rounded-full overflow-hidden flex mb-4">
                <div
                  className="bg-primary-600"
                  style={{ width: `${barWidths.pi}%` }}
                  title="Principal & Interest"
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${barWidths.tax}%` }}
                  title="Property Tax"
                />
                <div
                  className="bg-green-500"
                  style={{ width: `${barWidths.insurance}%` }}
                  title="Home Insurance"
                />
                {barWidths.pmi > 0 && (
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${barWidths.pmi}%` }}
                    title="PMI"
                  />
                )}
                {barWidths.hoa > 0 && (
                  <div
                    className="bg-purple-500"
                    style={{ width: `${barWidths.hoa}%` }}
                    title="HOA"
                  />
                )}
              </div>

              {/* Breakdown list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-600 mr-2" />
                    <span className="text-sm text-gray-600">Principal & Interest</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrencyDetailed(breakdown.principal + breakdown.interest)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Property Tax</span>
                  </div>
                  <span className="font-medium">{formatCurrencyDetailed(breakdown.propertyTax)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <span className="text-sm text-gray-600">Home Insurance</span>
                  </div>
                  <span className="font-medium">{formatCurrencyDetailed(breakdown.homeInsurance)}</span>
                </div>

                {breakdown.pmi > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">{loanTypeInfo.annualFeeLabel}</span>
                    </div>
                    <span className="font-medium">{formatCurrencyDetailed(breakdown.pmi)}</span>
                  </div>
                )}

                {breakdown.hoa > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                      <span className="text-sm text-gray-600">HOA</span>
                    </div>
                    <span className="font-medium">{formatCurrencyDetailed(breakdown.hoa)}</span>
                  </div>
                )}
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Summary stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount</span>
                  <span className="font-medium">{formatCurrency(breakdown.loanAmount)}</span>
                </div>
                {breakdown.upfrontFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{loanTypeInfo.upfrontFeeLabel}</span>
                    <span className="font-medium">{formatCurrency(breakdown.upfrontFees)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-medium">{formatCurrency(breakdown.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total of {inputs.loanTerm * 12} Payments</span>
                  <span className="font-medium">{formatCurrency(breakdown.totalCost)}</span>
                </div>
              </div>

              {/* Loan Type Specific Notes */}
              {breakdown.pmi > 0 && (
                <div className={`mt-4 p-3 rounded-lg ${
                  loanTypeInfo.pmiRemovable
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    loanTypeInfo.pmiRemovable ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    <strong>{loanTypeInfo.annualFeeLabel}:</strong> {loanTypeInfo.pmiRemovalNote}
                  </p>
                </div>
              )}

              {inputs.loanType === 'va' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>VA Benefit:</strong> No monthly mortgage insurance required.
                    The funding fee can be financed into the loan or waived for disabled veterans.
                  </p>
                </div>
              )}

              {inputs.loanType === 'usda' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>USDA Requirement:</strong> Property must be in an eligible rural area
                    and household income must be under {formatCurrency(119850)} for 1-4 members.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Schedule Section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'charts'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Charts
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Amortization Schedule
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'charts' && (
            <div className="space-y-8">
              {/* Payment Breakdown Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payment Breakdown</h3>
                <div className="grid lg:grid-cols-2 gap-6 items-center">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrencyDetailed(value as number)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrencyDetailed(item.value)}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-primary-600">{formatCurrencyDetailed(breakdown.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Principal vs Interest Over Time */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Principal vs Interest Over Time</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="year"
                        tickFormatter={(year) => `Yr ${year}`}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(value as number),
                          String(name).charAt(0).toUpperCase() + String(name).slice(1),
                        ]}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="principal"
                        stackId="1"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        name="Principal"
                      />
                      <Area
                        type="monotone"
                        dataKey="interest"
                        stackId="1"
                        stroke="#f97316"
                        fill="#f97316"
                        name="Interest"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  In early years, more of your payment goes to interest. Over time, more goes to principal.
                </p>
              </div>

              {/* Loan Balance Over Time */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Balance Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="year"
                        tickFormatter={(year) => `Yr ${year}`}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), 'Balance']}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#22c55e"
                        fill="#dcfce7"
                        name="Balance"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              {/* View Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setScheduleView('yearly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      scheduleView === 'yearly'
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => setScheduleView('monthly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      scheduleView === 'monthly'
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        {scheduleView === 'yearly' ? 'Year' : 'Month'}
                      </th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Payment</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Principal</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Interest</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleView === 'yearly' ? (
                      yearlyData.map((row) => (
                        <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">Year {row.year}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(row.principal + row.interest)}</td>
                          <td className="text-right py-3 px-2 text-primary-600">{formatCurrency(row.principal)}</td>
                          <td className="text-right py-3 px-2 text-orange-600">{formatCurrency(row.interest)}</td>
                          <td className="text-right py-3 px-2 font-medium">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))
                    ) : (
                      amortizationSchedule.slice(0, 60).map((row) => (
                        <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-2">{row.month}</td>
                          <td className="text-right py-2 px-2">{formatCurrencyDetailed(row.payment)}</td>
                          <td className="text-right py-2 px-2 text-primary-600">{formatCurrencyDetailed(row.principal)}</td>
                          <td className="text-right py-2 px-2 text-orange-600">{formatCurrencyDetailed(row.interest)}</td>
                          <td className="text-right py-2 px-2 font-medium">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {scheduleView === 'monthly' && amortizationSchedule.length > 60 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing first 60 months of {amortizationSchedule.length} total payments.
                  </p>
                )}
              </div>

              {/* Summary Row */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Payments</p>
                    <p className="font-semibold text-gray-900">{inputs.loanTerm * 12}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Principal</p>
                    <p className="font-semibold text-primary-600">{formatCurrency(breakdown.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Interest</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(breakdown.totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Cost</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(breakdown.loanAmount + breakdown.totalInterest)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
