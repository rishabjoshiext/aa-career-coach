import { PATH_GROWTH, STAGNATION_RATE } from './roiData.js'
import { formatRupeeMonthly } from './formatINR.js'

const HORIZON = 10

/** Monthly salary in thousands of INR (e.g. 20 = ₹20k/mo). Index = calendar year offset from now. */
export function buildFallbackRoiModel({ salaryLpa, eduBudgetLacs }) {
  const lpa = Number(salaryLpa) > 0 ? Number(salaryLpa) : 8
  const m0 = Math.round(((lpa * 100000) / 12 / 1000) * 10) / 10
  const start = Math.max(12, Math.min(180, m0))

  const stagMonthlyK = []
  const pathMonthlyK = { accel: [], fast: [], trad: [] }

  for (let y = 0; y <= HORIZON; y += 1) {
    stagMonthlyK.push(Math.round(start * (1 + STAGNATION_RATE) ** y))
    pathMonthlyK.trad.push(Math.round(start * (1 + PATH_GROWTH.trad) ** y))
    pathMonthlyK.fast.push(Math.round(start * (1 + PATH_GROWTH.fast) ** y))
    pathMonthlyK.accel.push(Math.round(start * (1 + PATH_GROWTH.accel) ** y))
  }

  const budget = Number(eduBudgetLacs) || 0
  const cardCopy = {
    totalExtraSub: 'Over the selected horizon vs staying on your current trajectory.',
    bankSub: 'If you save 35% of extra earnings over the horizon — on top of current savings.',
    breakEvenSub:
      budget > 0
        ? 'When cumulative extra earnings surpass your education budget you set earlier.'
        : 'When cumulative extra earnings surpass a typical upskilling investment for this move.',
  }

  return { stagMonthlyK, pathMonthlyK, cardCopy }
}

/** Cumulative extra gross earnings in ₹ Lacs vs stagnation, years 1..yEnd inclusive */
export function cumulativeExtraLacs(stagK, pathK, yEnd) {
  let sum = 0
  for (let y = 1; y <= yEnd; y += 1) {
    sum += ((pathK[y] - stagK[y]) * 12) / 100
  }
  return Math.max(0, Math.round(sum * 10) / 10)
}

/** First year 1..20 where cumulative extra >= budgetLacs */
export function breakEvenYear(stagK, pathK, budgetLacs) {
  const b = Number(budgetLacs) || 0
  if (b <= 0) return null
  for (let y = 1; y <= HORIZON; y += 1) {
    if (cumulativeExtraLacs(stagK, pathK, y) >= b) return y
  }
  return null
}

/** Chart x-axis year indices to show (includes 0 and rYear) */
export function chartYearTicks(rYear) {
  const y = Math.min(HORIZON, Math.max(1, Number(rYear) || 5))
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
