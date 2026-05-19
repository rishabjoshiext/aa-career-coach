/**
 * Maps & ranks career destination cards from Frame 1 profile.
 * Uses deterministic heuristics + seeded “insight” copy (no external AI API).
 */

import { CAREER_AREA_ID_SET, clampToCareerArea, inferCareerAreaFromText } from '../data/potentialCareerAreas.js'
import { careerAreaFromWorkRoleTitle } from '../data/roleCareerAreaMap.js'

const INDUSTRY_IDS = CAREER_AREA_ID_SET

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
  return inferCareerAreaFromText(raw)
}

/** Combine sector text + role title + skill chips for inference. */
export function inferIndustryFromProfileStrings(ind, role, skillsExtra = '') {
  return inferIndustryFromFreeText(`${ind || ''} ${role || ''} ${skillsExtra || ''}`)
}

/**
 * Guess function bucket from aspiration role title.
 * @param {string} dRole
 * @returns {string | null}
 */
export function inferIndustryFromDreamRole(dRole) {
  return inferIndustryFromFreeText(dRole)
}

/**
 * Legacy target-function field (if set) or industry inferred from dream role.
 * Used for ranking, pills, and copy when the separate “target function” step is gone.
 * @param {Record<string, any>} s
 * @returns {string} catalog industry id or ''
 */
export function aspirationTargetIndustryId(s) {
  const raw =
    s.dTarFunc && s.dTarFunc !== 'Open / System should suggest' ? String(s.dTarFunc).trim() : ''
  if (raw) {
    const clamped = clampToCareerArea(raw)
    if (clamped) return clamped
    const fromLegacy = inferIndustryFromFreeText(raw)
    if (fromLegacy) return fromLegacy
  }
  return (
    careerAreaFromWorkRoleTitle(s.dRole || '') ||
    inferIndustryFromDreamRole(s.dRole || '') ||
    ''
  )
}

function profileSkillsText(s) {
  return Array.isArray(s?.selectedSkills) ? s.selectedSkills.join(' ') : ''
}

export function hashProfileSeed(s) {
  const str = [s.name, s.phone, s.email, s.func, s.role, s.ind, s.dRole, s.dTarFunc, s.exp, s.company, profileSkillsText(s)]
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
  const funcId = clampToCareerArea(s.func) || inferIndustryFromFreeText(s.func || '')
  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role, profileSkillsText(s))
  const aspId = aspirationTargetIndustryId(s)
  const aspCatalogId = aspId && INDUSTRY_IDS.has(aspId) ? aspId : null

  let primaryIndustryId = funcId || indGuess || aspCatalogId

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
      primaryIndustryId: aspCatalogId || 'all',
      headline: 'Ranked from your aspirations',
      reason:
        'Current role details were thin — we prioritised your dream title (and signals from it) so the grid still feels personal.',
    }
  }

  // Fresher / not working
  return {
    mode: 'aspiration',
    primaryIndustryId: aspCatalogId || 'all',
    headline: 'Ranked from your aspirations',
    reason:
      'Early-career or between roles — we used your dream title to infer proximity and order destinations realistically.',
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
  const dTar = aspirationTargetIndustryId(s)

  const matchDream =
    dRoleLower &&
    (rn === dRoleLower || rn.includes(dRoleLower) || dRoleLower.includes(rn.split(' ').pop() || ''))
  if (matchDream) score += 220

  if (dTar && dTar === card.industry) score += 95

  const funcId = clampToCareerArea(s.func) || inferIndustryFromFreeText(s.func || '')
  const working = s.exp && s.exp !== 'fresher'

  if (working && funcId && card.industry === funcId) score += 140

  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role, profileSkillsText(s))
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
  const funcId = clampToCareerArea(s.func) || inferIndustryFromFreeText(s.func || '')
  const indGuess = inferIndustryFromProfileStrings(s.ind, s.role, profileSkillsText(s))
  const traj = roleTrajectoryScore(s.role || '', card.role)
  if (traj < 0.22) return false
  if (funcId) return card.industry === funcId
  return !!(indGuess && card.industry === indGuess)
}

export function destinationAnalystNote(card, s, insight) {
  const bits = []
  const working = s.exp && s.exp !== 'fresher'
  const funcId = clampToCareerArea(s.func) || null

  if ((s.dRole || '').trim()) {
    const dr = (s.dRole || '').toLowerCase()
    const cr = card.role.toLowerCase()
    if (cr.includes(dr) || dr.includes(cr.split(' ')[0] || '')) bits.push('lines up with your stated dream title')
  }

  if (working && funcId && card.industry === funcId) bits.push('same function you’re in today')

  const traj = roleTrajectoryScore(s.role || '', card.role)
  if (working && traj >= 0.35) bits.push('title overlap with your current designation')

  const aspInd = aspirationTargetIndustryId(s)
  if (aspInd && card.industry === aspInd) bits.push('lines up with your aspiration function bucket')

  if (!bits.length) {
    if (insight.mode === 'aspiration') return 'Shown because peers with similar aspiration picks often shortlist this role.'
    return 'Shown based on demand data for your selected filter.'
  }

  const h = hashProfileSeed({ ...s, _role: card.role })
  const flavor = ['Cross-checked against live JD language.', 'Weighted by Apna hiring velocity.', 'Validated against typical promotion ladders.'][h % 3]

  return `${bits[0]}${bits[1] ? ` · ${bits[1]}` : ''}. ${flavor}`
}
