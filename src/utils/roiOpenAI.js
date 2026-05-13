import { PATH_GROWTH, STAGNATION_RATE } from './roiData.js'

const HORIZON = 10
const PATH_KEYS = ['accel', 'fast', 'trad']

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
}

export function normalizeRoiPayload(data) {
  try {
    const o = typeof data === 'string' ? JSON.parse(stripJsonFence(data)) : data
    if (!o || typeof o !== 'object') return null
    const n = HORIZON + 1
    const roundArr = (a) =>
      Array.isArray(a) && a.length === n
        ? a.map((x) => Math.round(Number(x)))
        : null
    const stag = roundArr(o.stagMonthlyK)
    if (!stag || stag.some((x) => !Number.isFinite(x) || x < 5 || x > 800)) return null
    if (!o.pathMonthlyK || typeof o.pathMonthlyK !== 'object') return null
    const pathMonthlyK = {}
    for (const k of PATH_KEYS) {
      const raw = roundArr(o.pathMonthlyK[k])
      if (!raw || raw.some((x) => !Number.isFinite(x) || x < 5 || x > 800)) return null
      pathMonthlyK[k] = raw.map((v, y) => (y === 0 ? stag[y] : Math.max(v, stag[y])))
    }
    const cardCopy = o.cardCopy && typeof o.cardCopy === 'object' ? o.cardCopy : {}
    return {
      stagMonthlyK: stag,
      pathMonthlyK,
      cardCopy: {
        totalExtraSub: typeof cardCopy.totalExtraSub === 'string' ? cardCopy.totalExtraSub : '',
        bankSub: typeof cardCopy.bankSub === 'string' ? cardCopy.bankSub : '',
        breakEvenSub: typeof cardCopy.breakEvenSub === 'string' ? cardCopy.breakEvenSub : '',
      },
    }
  } catch {
    return null
  }
}

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

export async function fetchRoiWithOpenAI({
  targetRole,
  industryLabel,
  card,
  salaryLpa,
  eduBudgetLacs,
}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const role = String(targetRole || '').trim() || 'Target role'
  const ind = industryLabel || 'General'
  const desc = card?.desc ? String(card.desc) : ''
  const salBand = card?.sal ? String(card.sal) : ''
  const lpa = Number(salaryLpa) > 0 ? salaryLpa : 8
  const budget = Number(eduBudgetLacs) || 0

  const prompt = `You output ONLY valid JSON (no markdown) for an India-market career ROI model.

User destination role: ${role}
Industry / function: ${ind}
Role description: ${desc}
Typical salary band for role (from dataset, monthly): ${salBand}
User current gross salary: ~${lpa} LPA (use as anchor for "now" unless inconsistent with band)
Education / upskilling budget already captured in app: ₹${budget} Lacs (use only for copy hints)

Return JSON:
{
  "stagMonthlyK": array of exactly 11 integers — monthly gross in thousands of INR for years 0..10 if candidate takes NO structured action (slow cost-of-living raises only). Year 0 = "now". Values must rise gently (~4–7%/yr).
  "pathMonthlyK": {
    "trad": 11 integers — structured traditional ladder toward ${role},
    "fast": 11 integers — faster track,
    "accel": 11 integers — accelerated path; largest gap vs stagnation by year 5–10
  },
  Rules: year 0 all paths equal stagnation. For y>=1 each path >= stagnation. Integers only, realistic for Indian metros (typical range year 10 often 35–120k/month for mid-senior unless role is very junior). Align long-run ceiling with "${salBand}" when it implies a band.
  "cardCopy": {
    "totalExtraSub": one short line like "Over 5 years vs staying at current trajectory" but mention horizon generically,
    "bankSub": mention 35% savings of extra earnings,
    "breakEvenSub": one line referencing when extra earnings pass the ₹${budget}L budget (if budget 0, say "typical degree investment")
  }
}`

  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.2,
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.output_text || ''
    if (!text) return null
    return normalizeRoiPayload(text)
  } catch {
    return null
  }
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
  const n = Math.round(Number(k) || 0)
  return `₹${n}k`
}
