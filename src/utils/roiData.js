/** Salary trajectory assumptions for Frame 5 (aligned with path tiers). */

export const ROI_YEARS = [3, 5, 7, 10]

/** Annual compounding uplift on gross income for “no structured move” trajectory */
export const STAGNATION_RATE = 0.055

/** Path-specific annual income growth — accel > fast > trad (returns) */
export const PATH_GROWTH = {
  trad: 0.088,
  fast: 0.118,
  accel: 0.152,
}

/** Upskilling spend vs user budget — accel lowest, trad highest (investment) */
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

/**
 * Projected salary multiple vs starting annual income after `years`.
 * @param {'trad'|'fast'|'accel'} pathKey
 * @param {boolean} stagnation
 */
export function salaryMultiple(pathKey, years, stagnation) {
  const r = stagnation ? STAGNATION_RATE : PATH_GROWTH[pathKey] || PATH_GROWTH.trad
  return (1 + r) ** years
}

/** Approximate cumulative gross earnings multiplier (integral of geometric-ish steps) */
export function cumulativeIncomeFactor(pathKey, years, stagnation) {
  const r = stagnation ? STAGNATION_RATE : PATH_GROWTH[pathKey] || PATH_GROWTH.trad
  let sum = 0
  let w = 1
  for (let y = 1; y <= years; y += 1) {
    sum += w
    w *= 1 + r
  }
  return sum
}

/**
 * Extra cumulative gross income (in same units as `baseLpa` annual, i.e. “LPA·years” scale) vs stagnation.
 */
export function cumulativeEarningsDeltaLpa(pathKey, years) {
  const cumPath = cumulativeIncomeFactor(pathKey, years, false)
  const cumStag = cumulativeIncomeFactor(pathKey, years, true)
  return cumPath - cumStag
}

/** First year count (1–20) where cumulative uplift ≥ budget (₹ Lacs). Null if not within 20 yrs. */
export function yearsToRecoverBudget(baseLpa, pathKey, budgetLacs) {
  const budgetAnnualUnits = Number(budgetLacs) || 0
  if (budgetAnnualUnits <= 0 || !baseLpa) return 1
  for (let y = 1; y <= 20; y += 1) {
    const delta = baseLpa * cumulativeEarningsDeltaLpa(pathKey, y)
    if (delta >= budgetAnnualUnits) return y
  }
  return null
}
