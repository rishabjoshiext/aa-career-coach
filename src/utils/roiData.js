/** Salary trajectory assumptions for Frame 5 — compounded YoY growth. */

export const ROI_YEARS = [3, 5, 7, 10]

/** Grey “no action” bar — slow yearly growth */
export const NO_ACTION_YOY_GROWTH = 0.04

/** Purple path — compounded yearly growth by tier */
export const PATH_YOY_GROWTH = {
  trad: 0.09,
  fast: 0.12,
  accel: 0.18,
}

/** When profile salary is missing — annual LPA from Year 1 onward */
export const ROI_FALLBACK_LPA = 2.5

/** Total extra earnings card — 10% of annual path salary per year, summed */
export const EXTRA_EARNINGS_INCREMENT_RATE = 0.1

/** Default online degree programme length (months) → break-even = tenure + 1 yr */
export const DEFAULT_DEGREE_TENURE_MONTHS = 24

export function degreeTenureYears(tenureMonths = DEFAULT_DEGREE_TENURE_MONTHS) {
  const mo = Number(tenureMonths) || DEFAULT_DEGREE_TENURE_MONTHS
  return Math.max(1, Math.round(mo / 12))
}

/** Upskilling spend vs user budget — accel lowest, trad highest (legacy) */
export const PATH_INVESTMENT_MULT = {
  accel: 0.82,
  fast: 1.0,
  trad: 1.28,
}

export function pathInvestmentLacs(pathKey, budgetLacs) {
  const b = Number(budgetLacs) || 0
  const mult = PATH_INVESTMENT_MULT[pathKey] ?? 1
  return Math.round(b * mult * 10) / 10
}
