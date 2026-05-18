import {
  DEFAULT_DEGREE_TENURE_MONTHS,
  EXTRA_EARNINGS_INCREMENT_RATE,
  NO_ACTION_YOY_GROWTH,
  PATH_YOY_GROWTH,
  ROI_FALLBACK_LPA,
  degreeTenureYears,
} from './roiData.js'
import { formatRupeeMonthly } from './formatINR.js'

const HORIZON_BUILD = 10

/** Monthly salary in thousands of INR (e.g. 20 = ₹20k/mo). */
export function monthlyKFromRupees(monthlyRupees) {
  const n = Number(monthlyRupees)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round((n / 1000) * 10) / 10
}

export function monthlyKFromLpa(lpa) {
  const n = Number(lpa)
  if (!Number.isFinite(n) || n <= 0) return 0
  return monthlyKFromRupees((n * 100000) / 12)
}

/**
 * Compounded monthly salary at chart year `yearIndex`.
 * Year 0 = base (all paths equal). Each later year applies (1 + rate)^years of growth.
 * Without profile salary: Year 0 = 0; from Year 1 base = fallback LPA monthly, then compound.
 */
export function monthlyKAtYear(baseK, yoyRate, yearIndex, hasSalaryAtNow) {
  const y = Number(yearIndex) || 0
  if (!hasSalaryAtNow && y === 0) return 0

  const growthYears = hasSalaryAtNow ? y : Math.max(0, y - 1)
  return Math.round(baseK * (1 + yoyRate) ** growthYears * 10) / 10
}

/**
 * @param {object} input
 * @param {number} input.monthlySalaryRupees — profile monthly gross; 0 if missing
 * @param {number} [input.degreeTenureMonths]
 */
export function buildFallbackRoiModel({ monthlySalaryRupees, degreeTenureMonths = DEFAULT_DEGREE_TENURE_MONTHS }) {
  const hasSalary = Number(monthlySalaryRupees) > 0
  const baseK = hasSalary ? monthlyKFromRupees(monthlySalaryRupees) : monthlyKFromLpa(ROI_FALLBACK_LPA)

  const stagMonthlyK = []
  const pathMonthlyK = { accel: [], fast: [], trad: [] }

  for (let y = 0; y <= HORIZON_BUILD; y += 1) {
    stagMonthlyK.push(monthlyKAtYear(baseK, NO_ACTION_YOY_GROWTH, y, hasSalary))
    pathMonthlyK.trad.push(monthlyKAtYear(baseK, PATH_YOY_GROWTH.trad, y, hasSalary))
    pathMonthlyK.fast.push(monthlyKAtYear(baseK, PATH_YOY_GROWTH.fast, y, hasSalary))
    pathMonthlyK.accel.push(monthlyKAtYear(baseK, PATH_YOY_GROWTH.accel, y, hasSalary))
  }

  const tenureYrs = degreeTenureYears(degreeTenureMonths)
  const cardCopy = {
    totalExtraSub: 'Sum of 10% annual increments on your accelerated path salary over 5 years.',
    bankSub: 'Combined Year 3 + Year 4 gross earnings on the accelerated path (illustrative).',
    breakEvenSub: `When cumulative extra earnings surpass your education budget — typically around Year ${tenureYrs + 1} (degree tenure + 1).`,
  }

  return {
    stagMonthlyK,
    pathMonthlyK,
    cardCopy,
    growthBaseK: baseK,
    hasSalary,
    degreeTenureYrs: tenureYrs,
  }
}

/** Annual gross in ₹ Lacs from monthly-K series at year index. */
export function annualLacsFromMonthlyK(monthlyK, yearIndex) {
  return Math.round(((Number(monthlyK[yearIndex]) || 0) * 12) / 100)
}

/** Sum of 10% of each year's accelerated annual salary (years 1..yEnd). */
export function totalExtraFromTenPctIncrements(accelMonthlyK, yEnd = 5) {
  let sum = 0
  for (let y = 1; y <= yEnd; y += 1) {
    sum += annualLacsFromMonthlyK(accelMonthlyK, y) * EXTRA_EARNINGS_INCREMENT_RATE
  }
  return Math.round(sum * 10) / 10
}

/** Potential bank balance — Year 3 + Year 4 accelerated annual earnings (₹ Lacs). */
export function potentialBankBalanceLacs(accelMonthlyK) {
  const y3 = annualLacsFromMonthlyK(accelMonthlyK, 3)
  const y4 = annualLacsFromMonthlyK(accelMonthlyK, 4)
  return Math.round((y3 + y4) * 10) / 10
}

/** Break-even year = suggested degree tenure + 1 */
export function suggestedBreakEvenYear(degreeTenureMonths = DEFAULT_DEGREE_TENURE_MONTHS) {
  return degreeTenureYears(degreeTenureMonths) + 1
}

/** % increase vs profile baseline (Year 0 / Year 1 base monthly-K). */
export function pctIncreaseFromBaseline(valueK, baselineK) {
  const base = Number(baselineK) || 0
  const val = Number(valueK) || 0
  if (base <= 0) {
    if (val <= 0) return 0
    return null
  }
  return Math.round(((val - base) / base) * 100)
}

/** Chart x-axis year indices to show (includes 0 and rYear) */
export function chartYearTicks(rYear) {
  const y = Math.min(HORIZON_BUILD, Math.max(1, Number(rYear) || 5))
  if (y <= 4) {
    return [...new Set([0, 1, 2, 3, y].filter((x) => x <= y && x >= 0))].sort((a, b) => a - b)
  }
  if (y === 5) return [0, 1, 2, 3, 5]
  if (y <= 7) return [...new Set([0, 1, 2, 3, 5, y].filter((x) => x <= y))].sort((a, b) => a - b)
  return [0, 2, 4, 6, 8, 10].filter((x) => x <= y)
}

export function fmtRupeeMoK(k) {
  const monthlyRupees = Math.round((Number(k) || 0) * 1000)
  return formatRupeeMonthly(monthlyRupees)
}

/** Parse profile inputs → monthly gross in rupees (0 if absent). */
export function resolveMonthlySalaryRupees(profile = {}) {
  const raw = String(profile.salary || '').replace(/[^\d]/g, '')
  const monthly = Number(raw)
  if (Number.isFinite(monthly) && monthly > 0) return monthly

  const lpa = Number(profile.dSalary)
  if (Number.isFinite(lpa) && lpa > 0) return Math.round((lpa * 100000) / 12)

  return 0
}
