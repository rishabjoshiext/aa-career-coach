/**
 * Potential Career Destinations — loads `potential_career_mapping.json`,
 * maps Frame 1 profile → allowed career area, returns destination cards for Frame 2.
 */

import mappingDoc from './potential_career_mapping.json'
import {
  ALLOWED_CAREER_AREAS,
  CAREER_AREA_ID_SET,
  FRAME1_FUNC_TO_CAREER_AREA,
  clampToCareerArea,
} from './potentialCareerAreas.js'
import { inferCareerAreaFromText } from './potentialCareerAreas.js'
import { careerAreaFromWorkRoleTitle } from './roleCareerAreaMap.js'
import { functionalAreaFromIndustry } from './workExperienceData.js'
import { formatCountIN, formatRupeeMonthlyBand } from '../utils/formatINR.js'

export const DESTINATION_PACK_SIZE = 14

/** @type {Map<string, { id: string, name: string, emoji: string, roles: object[] }>} */
const CATEGORY_BY_NAME = new Map()

/** @type {Map<string, object[]>} */
const ROLES_BY_AREA = new Map()

function flattenCategories(nodes) {
  if (!nodes) return
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    if (Array.isArray(node.categories)) flattenCategories(node.categories)
    if (node.name && Array.isArray(node.roles)) {
      const name = String(node.name).trim()
      if (!CATEGORY_BY_NAME.has(name)) {
        CATEGORY_BY_NAME.set(name, {
          id: node.id || name.toLowerCase().replace(/\s+/g, '_'),
          name,
          emoji: node.emoji || '🎯',
          roles: node.roles,
        })
      }
      ROLES_BY_AREA.set(name, node.roles)
    }
  }
}

flattenCategories(mappingDoc.categories)

/** Categories present in JSON ∩ allowed list */
export const JSON_CAREER_AREA_NAMES = ALLOWED_CAREER_AREAS.filter((n) => CATEGORY_BY_NAME.has(n))

export const POTENTIAL_CAREER_INDUSTRIES = [
  { id: 'all', n: 'All Functions', ico: '⚡' },
  ...JSON_CAREER_AREA_NAMES.map((name) => {
    const c = CATEGORY_BY_NAME.get(name)
    return { id: name, n: name, ico: c?.emoji || '🎯' }
  }),
]

const RELATED_RING = {
  Product: ['IT', 'Software Development', 'Data Science', 'Strategy'],
  IT: ['Software Development', 'Cloud & DevOps', 'Data Science', 'Cybersecurity'],
  'Software Development': ['IT', 'Cloud & DevOps', 'Data Science', 'Product'],
  Operations: ['Supply Chain Management', 'Project Management', 'Finance', 'Consulting'],
  'Supply Chain Management': ['Operations', 'Finance', 'Consulting', 'IT'],
  Marketing: ['Digital Marketing', 'Product', 'Business Analytics', 'Strategy'],
  'Data Science': ['Business Analytics', 'AI & ML', 'IT', 'Product'],
  'Business Analytics': ['Data Science', 'Finance', 'Marketing', 'IT'],
  'Customer Success': ['Marketing', 'IT', 'Operations', 'Product'],
  HR: ['Human Resources', 'Operations', 'Consulting', 'Finance'],
  Finance: ['Banking & Insurance', 'Risk Management', 'Consulting', 'Business Analytics'],
  'Banking & Insurance': ['Finance', 'Risk Management', 'Consulting', 'Operations'],
  'Project Management': ['IT', 'Operations', 'Consulting', 'Strategy'],
  'Digital Marketing': ['Marketing', 'Product', 'Business Analytics', 'E-commerce'].map((x) =>
    x === 'E-commerce' ? 'Marketing' : x,
  ),
  Education: ['Operations', 'HR', 'Consulting', 'Other'],
  'Hospitality Management': ['Operations', 'Marketing', 'Finance', 'HR'],
  Strategy: ['Consulting', 'Finance', 'Product', 'Operations'],
  Consulting: ['Strategy', 'Finance', 'Operations', 'Business Analytics'],
  'Human Resources': ['HR', 'Consulting', 'Operations', 'Finance'],
  'UI/UX': ['Product', 'IT', 'Marketing', 'Software Development'],
  'AI & ML': ['Data Science', 'IT', 'Cloud & DevOps', 'Product'],
  'Cloud & DevOps': ['IT', 'Software Development', 'Cybersecurity', 'Data Science'],
  Cybersecurity: ['IT', 'Cloud & DevOps', 'Risk Management', 'Operations'],
  'Risk Management': ['Finance', 'Banking & Insurance', 'Consulting', 'Legal & Compliance'],
  'Legal & Compliance': ['Risk Management', 'Finance', 'Consulting', 'Operations'],
  Other: ['Operations', 'Marketing', 'IT', 'Finance'],
}

function relatedFor(primary) {
  const ring = (RELATED_RING[primary] || RELATED_RING.Other).filter(
    (id) => id !== primary && CATEGORY_BY_NAME.has(id),
  )
  return [...new Set(ring)].slice(0, 4)
}

export function relatedIndustryPad(primary) {
  return relatedFor(primary)
}

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'in', 'at', 'to', 'for', 'of', 'with', 'jr', 'sr', 'i', 'ii'])

function normTokens(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

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

function scoreRoleAgainstAnchor(anchor, roleTitle) {
  const cur = anchor.toLowerCase()
  const dest = roleTitle.toLowerCase()
  if (!cur) return 0
  if (cur === dest) return 1
  if (dest.includes(cur) || cur.includes(dest)) return 0.85
  return tokenOverlap(anchor, roleTitle)
}

function formatJobs(n) {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return '—'
  return `${formatCountIN(num)}+`
}

function formatCount(n) {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return '0'
  return num.toLocaleString('en-IN')
}

function formatSal(minM, maxM) {
  if (!minM && !maxM) return '—'
  return formatRupeeMonthlyBand(minM, maxM)
}

/**
 * @param {object} roleRow JSON role
 * @param {string} areaName
 */
export function roleRowToDestinationCard(roleRow, areaName) {
  const tl = roleRow.timeline || {}
  const sal = roleRow.target_salary || {}
  const v = roleRow.validated_across || {}
  const accelYrs = Number(tl.accelerated) || 0
  const dream = Array.isArray(roleRow.dream_companies) ? roleRow.dream_companies : []

  return {
    role: roleRow.title,
    desc: roleRow.description || '',
    jobs: formatJobs(roleRow.open_positions_india),
    apnaJobs: formatCount(roleRow.apna_job_matches),
    growth: `+${roleRow.demand_growth_5yr_pct ?? 0}%`,
    sal: formatSal(sal.min_monthly, sal.max_monthly),
    accelYrs,
    fastYrs: Number(tl.fast_track) || 0,
    tradYrs: Number(tl.traditional) || 0,
    dbProfiles: v.apna_database ?? 0,
    naukri: v.naukri_postings ?? 0,
    linkedin: v.linkedin_jobs ?? 0,
    industry: areaName,
    dreamCompanies: dream,
    _roleId: roleRow.id,
    _level: roleRow.level,
  }
}

/**
 * Best-matching career area for a role title by scanning JSON catalog.
 * @param {string} roleTitle
 * @returns {string | null}
 */
/**
 * Find JSON role row + area for a destination title.
 * @param {string} roleTitle
 * @returns {{ areaName: string, roleRow: object } | null}
 */
export function findRoleMetadataByTitle(roleTitle) {
  const t = String(roleTitle || '').trim()
  if (!t) return null
  let best = null
  let bestScore = 0
  for (const areaName of JSON_CAREER_AREA_NAMES) {
    const roles = ROLES_BY_AREA.get(areaName) || []
    for (const row of roles) {
      const s = scoreRoleAgainstAnchor(t, row.title)
      if (s > bestScore) {
        bestScore = s
        best = { areaName, roleRow: row }
      }
    }
  }
  return bestScore >= 0.55 ? best : null
}

export function matchCareerAreaByRoleTitle(roleTitle) {
  const t = String(roleTitle || '').trim()
  if (!t) return null
  let bestArea = null
  let bestScore = 0
  for (const areaName of JSON_CAREER_AREA_NAMES) {
    const roles = ROLES_BY_AREA.get(areaName) || []
    for (const row of roles) {
      const s = scoreRoleAgainstAnchor(t, row.title)
      if (s > bestScore) {
        bestScore = s
        bestArea = areaName
      }
    }
  }
  return bestScore >= 0.2 ? bestArea : null
}

function careerAreaFromIndustry(industry) {
  const ind = String(industry || '').trim()
  if (!ind) return null
  const func = functionalAreaFromIndustry(ind)
  const area = FRAME1_FUNC_TO_CAREER_AREA[func] || clampToCareerArea(func)
  if (area && CATEGORY_BY_NAME.has(area)) return area
  return inferCareerAreaFromText(ind)
}

/**
 * Resolve career area from role title, industry, and optional func bucket.
 * Prefers JSON catalog match, then work-experience role map, then text inference.
 */
function resolveCareerAreaFromRoleAndContext({ role, industry, func }) {
  const roleTitle = String(role || '').trim()
  const ind = String(industry || '').trim()
  const funcRaw = String(func || '').trim()

  if (roleTitle) {
    const fromCatalog = matchCareerAreaByRoleTitle(roleTitle)
    if (fromCatalog) return fromCatalog

    const fromMap = careerAreaFromWorkRoleTitle(roleTitle)
    if (fromMap && CATEGORY_BY_NAME.has(fromMap)) return fromMap
  }

  const inferred = inferCareerAreaFromText(`${roleTitle} ${ind} ${funcRaw}`)
  if (inferred && CATEGORY_BY_NAME.has(inferred)) return inferred

  const fromInd = careerAreaFromIndustry(ind)
  if (fromInd && CATEGORY_BY_NAME.has(fromInd)) return fromInd

  if (funcRaw) {
    const fromFunc = FRAME1_FUNC_TO_CAREER_AREA[funcRaw] || clampToCareerArea(funcRaw)
    if (fromFunc && CATEGORY_BY_NAME.has(fromFunc)) return fromFunc
  }

  return null
}

/**
 * Resolve primary career area from Frame 1 profile.
 * Priority: current role + industry → dream role → Other / general catalog.
 * @param {Record<string, any>} s
 * @returns {string}
 */
export function resolveCareerAreaForProfile(s) {
  const hasWork = s?.exp && s.exp !== 'fresher'
  const currentRole = String(s?.role || '').trim()
  const currentInd = String(s?.ind || '').trim()
  const currentFunc = String(s?.func || '').trim()
  const dreamRole = String(s?.dRole || '').trim()

  if (hasWork && (currentRole || currentInd)) {
    const fromCurrent = resolveCareerAreaFromRoleAndContext({
      role: currentRole,
      industry: currentInd,
      func: currentFunc,
    })
    if (fromCurrent) return fromCurrent
  }

  if (dreamRole) {
    const fromDream = resolveCareerAreaFromRoleAndContext({
      role: dreamRole,
      industry: '',
      func: '',
    })
    if (fromDream) return fromDream
  }

  if (!hasWork && currentInd) {
    const fromInd = careerAreaFromIndustry(currentInd)
    if (fromInd) return fromInd
  }

  return 'Other'
}

/**
 * @param {Record<string, any>} s
 */
export function getAnchorRoleTitle(s) {
  const working = s?.exp && s.exp !== 'fresher'
  const cur = String(s?.role || '').trim()
  if (working && cur) return cur
  return String(s?.dRole || '').trim()
}

/**
 * Pick destination cards from JSON for primary + related areas.
 * @param {string} primaryArea
 * @param {string} anchorTitle
 * @param {number} [target]
 */
function buildDestinationDeck(primaryArea, anchorTitle, target = DESTINATION_PACK_SIZE) {
  const seen = new Set()
  /** @type {ReturnType<typeof roleRowToDestinationCard>[]} */
  const out = []

  const addFromArea = (areaName, limit) => {
    const roles = ROLES_BY_AREA.get(areaName) || []
    const scored = roles
      .map((row) => ({ row, score: scoreRoleAgainstAnchor(anchorTitle, row.title) }))
      .sort((a, b) => b.score - a.score)
    for (const { row } of scored) {
      if (out.length >= target) break
      const key = `${areaName}|||${row.id || row.title}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(roleRowToDestinationCard(row, areaName))
      if (limit && out.filter((c) => c.industry === areaName).length >= limit) break
    }
  }

  const primaryCap = Math.min(10, target)
  addFromArea(primaryArea, primaryCap)

  const related = relatedFor(primaryArea)
  let wave = 0
  while (out.length < target && wave < 20) {
    for (const area of [primaryArea, ...related]) {
      if (out.length >= target) break
      const roles = ROLES_BY_AREA.get(area) || []
      if (wave < roles.length) {
        const row = roles
          .map((r) => ({ r, score: scoreRoleAgainstAnchor(anchorTitle, r.title) }))
          .sort((a, b) => b.score - a.score)[wave]
        if (row) {
          const key = `${area}|||${row.r.id || row.r.title}`
          if (!seen.has(key)) {
            seen.add(key)
            out.push(roleRowToDestinationCard(row.r, area))
          }
        }
      }
    }
    wave += 1
  }

  if (out.length && out[0].industry === primaryArea) {
    out[0] = { ...out[0], _hero: true }
  } else if (out[0]) {
    out[0] = { ...out[0], _hero: true }
  }

  return out.slice(0, target)
}

/**
 * @param {Record<string, any> | string} profileOrAnchor Frame 1 draft or legacy anchor string
 */
export function resolveDestinationPack(profileOrAnchor) {
  const profile =
    typeof profileOrAnchor === 'object' && profileOrAnchor !== null
      ? profileOrAnchor
      : { role: String(profileOrAnchor || '') }

  const anchor = getAnchorRoleTitle(profile)
  const primary = resolveCareerAreaForProfile(profile)
  const destinations = buildDestinationDeck(primary, anchor, DESTINATION_PACK_SIZE)

  const label = anchor
    ? `Paths from ${primary}`
    : 'General professional paths'

  return {
    label,
    primaryIndustry: primary,
    relatedIndustries: relatedFor(primary),
    destinations,
    source: 'potential_career_mapping',
  }
}

/** @param {string} areaName @param {string} [anchorTitle] */
export function getAllRolesForCareerArea(areaName, anchorTitle = '') {
  const roles = ROLES_BY_AREA.get(areaName) || []
  return roles
    .map((row) => ({ row, score: scoreRoleAgainstAnchor(anchorTitle, row.title) }))
    .sort((a, b) => b.score - a.score)
    .map(({ row }) => roleRowToDestinationCard(row, areaName))
}

/** @param {string} primary */
export function getRelevantCareerAreaIds(primary) {
  return [primary, ...relatedFor(primary)].filter((id) => (ROLES_BY_AREA.get(id) || []).length > 0)
}

const SAFETY_LEVELS = new Set(['intermediate'])
const SAFETY_TITLE_RE =
  /\b(junior|associate|executive|coordinator|analyst|assistant|specialist|representative|officer|clerk|trainee|support|administrator|operator)\b/i

/**
 * 2–3 stable, lower-barrier roles from one area only (safety net strip).
 * @param {string} areaName
 * @param {string} [anchorTitle]
 * @param {number} [limit]
 */
export function buildSafetyNetCards(areaName, anchorTitle = '', limit = 3) {
  const roles = ROLES_BY_AREA.get(areaName) || []
  if (!roles.length) return []

  const ranked = roles
    .map((row) => {
      const sal = row.target_salary || {}
      const minSal = Number(sal.min_monthly) || 999999
      const apna = Number(row.apna_job_matches) || 0
      const accel = Number(row.timeline?.accelerated) || 99
      const isSafety =
        SAFETY_LEVELS.has(row.level) ||
        SAFETY_TITLE_RE.test(row.title || '') ||
        minSal <= 120000
      return { row, isSafety, minSal, apna, accel }
    })
    .filter((x) => x.isSafety)
    .sort((a, b) => {
      const scoreA = a.apna - a.minSal * 0.02 - a.accel * 500
      const scoreB = b.apna - b.minSal * 0.02 - b.accel * 500
      return scoreB - scoreA
    })

  const pool = ranked.length ? ranked : roles.map((row) => ({ row, isSafety: true, minSal: 0, apna: 0, accel: 99 }))

  return pool.slice(0, limit).map(({ row }) => {
    const card = roleRowToDestinationCard(row, areaName)
    const sal = row.target_salary || {}
    return {
      ...card,
      sal: formatSal(sal.min_monthly, sal.max_monthly),
      _isSafetyNet: true,
    }
  })
}

/** @deprecated use getAllRolesForCareerArea */
export function safeRolesForCareerArea(areaName, anchorTitle = '') {
  return getAllRolesForCareerArea(areaName, anchorTitle)
}
