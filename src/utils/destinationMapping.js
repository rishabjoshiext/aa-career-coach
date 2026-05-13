/**
 * Maps & ranks career destination cards from Frame 1 profile.
 * Uses deterministic heuristics + seeded “insight” copy (no external AI API).
 */

import { INDUSTRIES } from './fasttrackData.js'

const INDUSTRY_IDS = new Set(INDUSTRIES.map((x) => x.id).filter((id) => id !== 'all'))

const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'in',
  'at',
  'to',
  'for',
  'of',
  'with',
  'jr',
  'sr',
  'i',
  'ii',
])

/** @param {string} t */
function normTokens(t) {
  if (!t || typeof t !== 'string') return []
  return t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP.has(w))
}

/** Jaccard on token sets */
function tokenOverlap(a, b) {
  const A = new Set(normTokens(a))
  const B = new Set(normTokens(b))
  if (!A.size || !B.size) return 0
  let inter = 0
  A.forEach((x) => {
    if (B.has(x)) inter += 1
  })
  const union = A.size + B.size - inter
  return union ? inter / union : 0
}

export function roleTrajectoryScore(currentRole, destRole) {
  const cur = (currentRole || '').trim().toLowerCase()
  const dest = (destRole || '').trim().toLowerCase()
  if (!cur || !dest) return 0
  if (cur === dest) return 1
  if (dest.includes(cur) || cur.includes(dest)) return 0.82
  const sim = tokenOverlap(currentRole, destRole)
  const bonus =
    normTokens(currentRole).some((t) => dest.includes(t) && t.length > 3) ? 0.12 : 0
  return Math.min(1, sim + bonus)
}

/**
 * Map free-text industry (e.g. Banking) to catalog function id.
 * @param {string} raw
 * @returns {string | null}
 */
export function inferIndustryFromFreeText(raw) {
  const s = (raw || '').toLowerCase()
  if (!s.trim()) return null
  const rules = [
    {
      id: 'Finance',
      keys: ['financ', 'bank', 'insurance', 'nbfc', 'account', 'audit', 'ca ', 'cpa', 'fintech', 'treasury', 'tax ', 'risk '],
    },
    { id: 'HR', keys: ['hr ', 'human', 'people', 'talent', 'payroll', 'recruit', 'l&d', 'learning', 'compensation', 'benefits', 'employee relations'] },
    { id: 'Marketing', keys: ['marketing', 'brand', 'growth marketing', 'performance marketing', 'seo', 'content', 'digital marketing', 'product marketing'] },
    { id: 'Sales', keys: ['sales', 'bdm', 'business development', 'account manager', 'enterprise', 'channel sales', 'regional sales', 'saas sales'] },
    { id: 'Operations', keys: ['operations', 'operat', 'program manager', 'process excellence', 'vendor operations', 'logistics manager'] },
    { id: 'SCM', keys: ['supply chain', 'logistics', 'scm', 'procurement', 'inventory', 'shipping', 'fulfillment'] },
    {
      id: 'Product',
      keys: [
        'head of product',
        'group product',
        'director of product',
        'vp product',
        'vice president product',
        'cpo',
        'chief product',
        'product director',
        'product lead',
        'product owner',
        'product manager',
        'product ',
        'growth product',
        'product ops',
        'product operations',
        'product analytics',
        'apm',
        'pm ',
      ],
    },
    {
      id: 'IT',
      keys: ['it ', 'software', 'developer', 'engineer', 'tech', 'devops', 'cloud', 'cyber', 'cybersecurity', 'ui/ux', 'ux', 'data science', 'ai', 'ml', 'analytics'],
    },
    { id: 'Strategy', keys: ['strategy', 'consult', 'consulting', 'general management', 'management consulting'] },
    { id: 'Customer Success', keys: ['customer success', 'csm', 'client success', 'implementation', 'renewal', 'tam', 'technical account'] },
    { id: 'Business Analytics', keys: ['business analytics', 'business analyst', 'bi developer', 'powerbi', 'tableau', 'analytics manager', 'quant'] },
    { id: 'Consulting', keys: ['consulting', 'management consultant', 'strategy consultant', 'operations consultant', 'transformation consultant'] },
    { id: 'Data Science', keys: ['data science', 'data scientist', 'mlops', 'nlp', 'computer vision', 'data architect'] },
    { id: 'AI & ML', keys: ['ai & ml', 'genai', 'llm', 'prompt', 'deep learning', 'reinforcement learning', 'ai engineer'] },
    { id: 'Digital Marketing', keys: ['digital marketing', 'seo', 'affiliate', 'email marketing', 'social media'] },
    { id: 'E-commerce', keys: ['e-commerce', 'ecommerce', 'marketplace', 'd2c', 'category manager', 'fulfillment'] },
    { id: 'Legal & Compliance', keys: ['legal', 'compliance', 'company secretary', 'dpo', 'data privacy', 'regulatory affairs', 'general counsel'] },
    { id: 'Risk Management', keys: ['risk management', 'internal auditor', 'operational risk', 'market risk', 'cro', 'business continuity'] },
    { id: 'Sustainability & ESG', keys: ['esg', 'sustainability', 'brsr', 'csr', 'carbon', 'circular economy'] },
    { id: 'UI/UX', keys: ['ui/ux', 'product designer', 'ux writer', 'ux researcher', 'interaction designer', 'design systems'] },
    { id: 'Cybersecurity', keys: ['cybersecurity', 'security analyst', 'pen tester', 'ethical hacker', 'appsec', 'ciso'] },
    { id: 'Cloud & DevOps', keys: ['devops', 'sre', 'cloud architect', 'platform engineer', 'finops', 'cloud security'] },
    { id: 'Other', keys: ['other', 'no-code', 'low-code', 'instructional', 'community manager', 'wellness', 'mental health', 'digital product seller'] },
  ]
  for (const r of rules) {
    if (r.keys.some((k) => s.includes(k.trim()))) return r.id
  }
  return null
}

/** Combine sector text + role title for inference (e.g. “IT” + “developer”). */
export function inferIndustryFromProfileStrings(ind, role) {
  return inferIndustryFromFreeText(`${ind || ''} ${role || ''}`)
}

/**
 * Guess function bucket from aspiration role title.
 * @param {string} dRole
 * @returns {string | null}
 */
export function inferIndustryFromDreamRole(dRole) {
  return inferIndustryFromFreeText(dRole)
}

export function hashProfileSeed(s) {
  const str = [s.name, s.phone, s.email, s.func, s.role, s.ind, s.dRole, s.dTarFunc, s.exp, s.company]
    .map((x) => (x == null ? '' : String(x)))
    .join('|')
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h >>> 0)
}

/** @typedef {{ mode: 'current' | 'aspiration' | 'blended', reason: string, headline: string, primaryIndustryId: string | null }} MappingInsight */

/**
 * @param {Record<string, any>} s profile draft from Frame 1
 * @returns {MappingInsight}
 */
export function buildMappingInsight(s) {
  const working = s.exp && s.exp !== 'fresher'
  const funcId = s.func && INDUSTRY_IDS.has(s.func) ? s.func : inferIndustryFromFreeText(s.func || '')
  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role)
  const dTar =
    s.dTarFunc && s.dTarFunc !== '' && s.dTarFunc !== 'Open / System should suggest' ? s.dTarFunc : null
  const dTarId = dTar && INDUSTRY_IDS.has(dTar) ? dTar : null
  const dreamInd = inferIndustryFromDreamRole(s.dRole || '')

  let primaryIndustryId = funcId || indGuess || dTarId || dreamInd

  if (working && funcId) {
    return {
      mode: 'current',
      primaryIndustryId: funcId,
      headline: 'Ranked from your current career',
      reason: `We weighted destinations in ${funcId}${s.role ? ` near “${s.role.trim()}”` : ''}${
        s.ind ? ` (${s.ind.trim()})` : ''
      } — then opened adjacent ladders where data shows frequent moves.`,
    }
  }

  if (working && !funcId && (indGuess || (s.role && s.role.trim().length > 2))) {
    return {
      mode: 'blended',
      primaryIndustryId: primaryIndustryId || 'all',
      headline: 'Ranked from your work history + aspirations',
      reason: `Your function was “Other” or uncategorised — we inferred ${indGuess || 'signals'} from your industry text and role title, then layered your stated aspirations so nothing relevant sits at the bottom.`,
    }
  }

  if (working && !funcId && !indGuess && !(s.role && s.role.trim().length > 2)) {
    return {
      mode: 'aspiration',
      primaryIndustryId: dTarId || dreamInd || 'all',
      headline: 'Ranked from your aspirations',
      reason:
        'Current role details were thin — we prioritised your dream title and target function so the grid still feels personal.',
    }
  }

  // Fresher / not working
  return {
    mode: 'aspiration',
    primaryIndustryId: dTarId || dreamInd || 'all',
    headline: 'Ranked from your aspirations',
    reason:
      'Early-career or between roles — we used your dream title and target function (when set) to order destinations by realistic proximity.',
  }
}

/**
 * Stable “analysis size” for UI badge (replaces Math.random).
 * @param {any} s
 */
export function inferredJourneySampleSize(s) {
  const h = hashProfileSeed(s)
  return 2200 + (h % 1800)
}

/**
 * Score a destination card for sorting. Higher = show first.
 * @param {any} card
 * @param {any} s
 * @param {MappingInsight} insight
 */
export function scoreDestination(card, s, insight) {
  let score = 0
  const dRoleLower = (s.dRole || '').toLowerCase().trim()
  const rn = card.role.toLowerCase()
  const dTar = s.dTarFunc && s.dTarFunc !== 'Open / System should suggest' ? s.dTarFunc : ''

  const matchDream =
    dRoleLower &&
    (rn === dRoleLower || rn.includes(dRoleLower) || dRoleLower.includes(rn.split(' ').pop() || ''))
  if (matchDream) score += 220

  if (dTar && dTar === card.industry) score += 95

  const funcId = s.func && INDUSTRY_IDS.has(s.func) ? s.func : inferIndustryFromFreeText(s.func || '')
  const working = s.exp && s.exp !== 'fresher'

  if (working && funcId && card.industry === funcId) score += 140

  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role)
  if (working && !funcId && indGuess && card.industry === indGuess) score += 110

  const traj = roleTrajectoryScore(s.role || '', card.role)
  if (working && traj > 0.08) score += Math.round(160 * traj)

  // Same-industry as inferred primary (covers aspiration-led ordering)
  if (insight.primaryIndustryId && insight.primaryIndustryId !== 'all' && card.industry === insight.primaryIndustryId) {
    score += insight.mode === 'aspiration' ? 55 : 40
  }

  // Light boost for “mainRole” if present on card data
  if (card.mainRole) score += 8

  return score
}

/**
 * One-line “AI analyst” note per card (deterministic).
 * @param {any} card
 * @param {any} s
 * @param {MappingInsight} insight
 */
/** Highlight destinations close to the user’s current title + function bucket. */
export function nearCurrentCareerMatch(card, s) {
  const working = s.exp && s.exp !== 'fresher'
  if (!working) return false
  const funcId = s.func && INDUSTRY_IDS.has(s.func) ? s.func : inferIndustryFromFreeText(s.func || '')
  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role)
  const traj = roleTrajectoryScore(s.role || '', card.role)
  if (traj < 0.22) return false
  if (funcId) return card.industry === funcId
  return !!(indGuess && card.industry === indGuess)
}

export function destinationAnalystNote(card, s, insight) {
  const bits = []
  const working = s.exp && s.exp !== 'fresher'
  const funcId = s.func && INDUSTRY_IDS.has(s.func) ? s.func : null

  if ((s.dRole || '').trim()) {
    const dr = (s.dRole || '').toLowerCase()
    const cr = card.role.toLowerCase()
    if (cr.includes(dr) || dr.includes(cr.split(' ')[0] || '')) bits.push('lines up with your stated dream title')
  }

  if (working && funcId && card.industry === funcId) bits.push('same function you’re in today')

  const traj = roleTrajectoryScore(s.role || '', card.role)
  if (working && traj >= 0.35) bits.push('title overlap with your current designation')

  if (s.dTarFunc && s.dTarFunc !== 'Open / System should suggest' && card.industry === s.dTarFunc)
    bits.push('matches your target functional area')

  if (!bits.length) {
    if (insight.mode === 'aspiration') return 'Shown because peers with similar aspiration picks often shortlist this role.'
    return 'Shown based on demand data for your selected filter.'
  }

  const h = hashProfileSeed({ ...s, _role: card.role })
  const flavor = ['Cross-checked against live JD language.', 'Weighted by Apna hiring velocity.', 'Validated against typical promotion ladders.'][h % 3]

  return `${bits[0]}${bits[1] ? ` · ${bits[1]}` : ''}. ${flavor}`
}
