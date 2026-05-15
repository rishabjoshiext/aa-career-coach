/**
 * Indian Rupee formatting — en-IN grouping, lakhs/crores (no western "100k").
 */

export function formatINR(amount) {
  const n = Math.round(Number(amount))
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-IN')
}

/** ₹12.5 L (annual LPA) */
export function formatLPA(lpa) {
  const n = Number(lpa)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 100) return `₹${formatINR(Math.round(n))} LPA`
  return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)} LPA`
}

/** ₹45,000 or ₹1.2 L depending on magnitude */
export function formatRupee(amount, { monthly = false } = {}) {
  const n = Math.round(Number(amount))
  if (!Number.isFinite(n)) return '—'
  if (n >= 10000000) {
    const cr = n / 10000000
    const core = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')
    return `₹${core} Cr${monthly ? '/mo' : ''}`
  }
  if (n >= 100000) {
    const L = n / 100000
    const core = L % 1 === 0 ? L.toFixed(0) : L.toFixed(2).replace(/\.?0+$/, '')
    return `₹${core} L${monthly ? '/mo' : ''}`
  }
  return `₹${formatINR(n)}${monthly ? '/mo' : ''}`
}

export function formatRupeeMonthly(amount) {
  return formatRupee(amount, { monthly: true })
}

export function formatRupeeBand(lo, hi, { monthly = false } = {}) {
  const a = Number(lo)
  const b = Number(hi)
  if (!Number.isFinite(a) && !Number.isFinite(b)) return '—'
  if (Number.isFinite(a) && Number.isFinite(b)) {
    return `${formatRupee(a, { monthly })}–${formatRupee(b, { monthly }).replace(/^₹/, '')}`
  }
  return formatRupee(a || b, { monthly })
}

/** Monthly salary band from rupee min/max (e.g. progression engine). */
export function formatRupeeMonthlyBand(lo, hi) {
  return formatRupeeBand(lo, hi, { monthly: true })
}

/** Cumulative budget in lakhs for ROI copy — ₹4.5 L */
export function formatBudgetLacs(lacs) {
  const n = Number(lacs)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)} L`
}

/** Job / profile counts — Indian grouping, no "k" suffix */
export function formatCountIN(n) {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return '0'
  return num.toLocaleString('en-IN')
}

/**
 * Normalise legacy salary strings (₹65–85k, ₹1.2L) for display in frames.
 */
export function formatSalaryLabelIndian(raw) {
  if (raw == null || raw === '') return '—'
  const s = String(raw).trim()
  if (!s) return '—'

  const withMo = s.includes('/mo')
  const body = s.replace(/\/mo/gi, '').trim()

  const bandK = body.match(/^₹?\s*([\d.]+)\s*[–-]\s*₹?\s*([\d.]+)\s*k$/i)
  if (bandK) {
    const lo = parseFloat(bandK[1]) * 1000
    const hi = parseFloat(bandK[2]) * 1000
    return `${formatRupeeMonthlyBand(lo, hi)}`
  }

  const singleK = body.match(/^₹?\s*([\d.]+)\s*k$/i)
  if (singleK) {
    return formatRupeeMonthly(parseFloat(singleK[1]) * 1000)
  }

  const bandL = body.match(/^₹?\s*([\d.]+)\s*[–-]\s*₹?\s*([\d.]+)\s*L$/i)
  if (bandL) {
    const lo = parseFloat(bandL[1]) * 100000
    const hi = parseFloat(bandL[2]) * 100000
    return `${formatRupeeMonthlyBand(lo, hi)}`
  }

  const singleL = body.match(/^₹?\s*([\d.]+)\s*L$/i)
  if (singleL) {
    return formatRupeeMonthly(parseFloat(singleL[1]) * 100000)
  }

  return withMo && !s.endsWith('/mo') ? `${s}/mo` : s
}
