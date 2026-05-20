/**
 * Deterministic career progression engine — Traditional / Fast Track / Accelerated.
 * @module journey/progressionEngine
 */

import { selectBestLadder, findDestinationMeta, normalizeRole, roleSimilarity } from './roleMatcher.js'
import { extractRoleStem, buildStemLadder, getLadderForCategory } from './roleLadders.js'
import { filterRolesForHierarchy, inferSeniorityRank, isGenericCurrentRole } from './seniority.js'
import { formatRupeeMonthlyBand } from '../utils/formatINR.js'
import { resolveMilestoneSkills } from '../data/skillsSuggestions.js'

/** Future milestone cards on canvas (NOW circle is separate). */
export const PATH_MILESTONE_COUNTS = {
  traditional: 6,
  fastTrack: 5,
  accelerated: 3,
}

/** Total boxes including current role (for documentation / QA). */
export const PATH_TOTAL_BOX_COUNTS = {
  traditional: 7,
  fastTrack: 6,
  accelerated: 4,
}

/** Path end years — must match `timelineLayout.js` PATH_END_YEARS. */
const PATH_END_YEARS = {
  traditional: 7,
  fastTrack: 5.5,
  accelerated: 4,
}

const YEAR_FRACTIONS = {
  traditional: [0.1, 0.28, 0.45, 0.62, 0.78, 1],
  fastTrack: [0.11, 0.3, 0.52, 0.76, 1],
  accelerated: [0.2, 0.55, 1],
}

const UPSKILL_BY_DOMAIN = {
  software_engineering: 'AI Upskilling',
  product: 'Product Leadership Certification',
  sales: 'Enterprise SaaS Training',
  marketing: 'Performance Marketing Certification',
  finance: 'Professional Certification',
  banking_insurance: 'IRDAI / BFSI Certification',
  operations: 'Lean Six Sigma',
  data_science: 'ML Specialisation',
  business_analytics: 'Analytics Certification',
  hr: 'HRBP Certification',
  consulting: 'MBA / Strategy Certification',
  ui_ux: 'Design Systems Certification',
  cloud_devops: 'Cloud Architect Certification',
  project_management: 'PMP / Agile Certification',
  customer_success: 'CS Leadership Certification',
}

/**
 * @typedef {object} ProgressionNode
 * @property {string} role
 * @property {number} year
 * @property {string} salary
 * @property {string} description
 * @property {boolean} isTargetRole
 * @property {boolean} [tag]
 */

/**
 * @typedef {object} CareerProgressionResult
 * @property {ProgressionNode[]} traditional
 * @property {ProgressionNode[]} fastTrack
 * @property {ProgressionNode[]} accelerated
 * @property {{ ladderId: string, ladderName: string, slice: string[] }} meta
 */

/**
 * @param {number} count
 * @param {number} totalYears
 * @param {'traditional'|'fastTrack'|'accelerated'} pathKey
 * @returns {number[]}
 */
function yearsForPath(count, totalYears, pathKey) {
  const key = pathKey === 'fastTrack' ? 'fastTrack' : pathKey
  const endYear = PATH_END_YEARS[key] ?? totalYears
  const base = YEAR_FRACTIONS[key] || YEAR_FRACTIONS.traditional
  let fractions = base
  if (count !== base.length) {
    fractions = []
    for (let i = 0; i < count; i += 1) {
      fractions.push(count === 1 ? 1 : (i + 1) / count)
    }
  }
  return fractions.map((f) => +(f * endYear).toFixed(1))
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} t 0–1
 */
function formatSalaryBandValues(lo, hi) {
  return formatRupeeMonthlyBand(lo, hi)
}

/** @param {object} [profile] */
export function parseProfileMonthlySalary(profile) {
  const raw = String(profile?.salary ?? '').replace(/[^\d.]/g, '')
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  if (n < 100) return Math.round((n * 100000) / 12)
  return Math.round(n)
}

/**
 * Strictly increasing monthly bands, each step above the user's current salary.
 * @param {number} count
 * @param {number} currentMonthly
 * @param {number} destMin
 * @param {number} destMax
 */
export function buildIncreasingSalaries(count, currentMonthly, destMin, destMax) {
  const floor =
    currentMonthly > 0
      ? Math.max(Math.round(currentMonthly * 1.08), currentMonthly + 2000)
      : Math.max(15000, Math.round(destMin * 0.35))
  let endLo = Math.max(destMin, Math.round(floor * 1.4))
  let endHi = Math.max(destMax, endLo + 6000)
  if (endHi <= endLo) endHi = endLo + 8000

  const bands = []
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 1 : i / (count - 1)
    let lo = Math.round(floor + (endLo - floor) * t)
    let hi = Math.round(floor * 1.1 + (endHi - floor * 1.1) * t)
    if (i > 0) {
      lo = Math.max(lo, bands[i - 1].hi + 1500)
      hi = Math.max(hi, lo + 3000)
    }
    lo = Math.max(lo, floor)
    hi = Math.max(hi, lo + 2000)
    bands.push({ lo, hi })
  }
  return bands.map(({ lo, hi }) => formatSalaryBandValues(lo, hi))
}

function sortBySeniority(roles) {
  return [...roles].sort((a, b) => inferSeniorityRank(a) - inferSeniorityRank(b))
}

/**
 * @param {string} salText
 */
export function parseSalaryBand(salText) {
  const s = String(salText || '')
  const nums = s.match(/(\d+(?:\.\d+)?)([kKlL]?)/g) || []
  const vals = nums
    .map((n) => {
      const m = n.match(/(\d+(?:\.\d+)?)([kKlL]?)/)
      if (!m) return null
      const v = Number(m[1])
      const u = m[2].toLowerCase()
      if (u === 'l') return Math.round(v * 100000)
      if (u === 'k') return Math.round(v * 1000)
      return Math.round(v)
    })
    .filter(Boolean)
  if (!vals.length) return { min: 35000, max: 85000 }
  if (vals.length === 1) return { min: vals[0], max: Math.round(vals[0] * 1.35) }
  return { min: Math.min(vals[0], vals[1]), max: Math.max(vals[0], vals[1]) }
}

/**
 * @param {string} role
 * @param {boolean} isTarget
 * @param {boolean} isAccelFirst
 */
function descriptionForStep(role, isTarget, isAccelFirst) {
  if (isTarget) return 'Destination role — ownership, leadership and measurable business impact.'
  if (isAccelFirst) return 'Parallel work + credential build; weekends / online — compress timeline without a career break.'
  if (/\b(senior|lead|principal|director|head|vp)\b/i.test(role)) {
    return 'Expanded scope, team influence and higher-stakes outcomes at this level.'
  }
  if (/\b(associate|analyst|executive|coordinator)\b/i.test(role)) {
    return 'Build core craft, stakeholder trust and consistent delivery before the next promotion.'
  }
  return 'Progressive responsibility, broader ownership and stronger domain credibility.'
}

/** @param {string} r */
function roleKey(r) {
  return normalizeRole(r).toLowerCase()
}

/** Block auto-generated placeholder titles (e.g. "Sales Professional 3"). */
function isSyntheticPlaceholderRole(role) {
  return /\bprofessional\s+\d+\b/i.test(normalizeRole(role))
}

/**
 * @param {string[]} roles
 */
function withoutPlaceholderRoles(roles) {
  return roles.filter((r) => !isSyntheticPlaceholderRole(r))
}

/**
 * Backfill missing milestones from curated / JSON ladders — never generic "Professional N".
 * @param {number} need
 * @param {string} targetRole
 * @param {string} categoryName
 * @param {Set<string>} usedKeys
 */
function catalogRoleBackfill(need, targetRole, categoryName, usedKeys) {
  if (need <= 0) return []
  const hints = [
    categoryName,
    categoryName === 'Sales' ? 'Other' : '',
    categoryName === 'Other' ? 'Sales' : '',
  ].filter(Boolean)

  const collected = []
  for (const hint of hints) {
    const lad = getLadderForCategory(hint)
    if (lad?.roles?.length) collected.push(...lad.roles)
  }

  const candidates = withoutPlaceholderRoles(
    filterRolesForHierarchy(uniquePreserveOrder(collected), 'Current Role', targetRole),
  ).filter((r) => {
    const k = roleKey(r)
    return k && k !== roleKey(targetRole) && !usedKeys.has(k)
  })

  return pickUniqueEvenly(candidates, need)
}

/** @param {string[]} roles */
export function uniquePreserveOrder(roles) {
  const seen = new Set()
  const out = []
  for (const r of roles) {
    const k = roleKey(r)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(normalizeRole(r))
  }
  return out
}

/**
 * Wide pool of unique roles on the ladder between current and target (for sampling).
 * @param {import('./roleLadders.js').CareerLadder} ladder
 */
export function buildProgressionPool(ladder, currentIdx, targetIdx, currentRole, targetRole) {
  const all = ladder.roles.map(normalizeRole)
  const target = normalizeRole(targetRole)
  let from = Math.min(currentIdx, targetIdx)
  let to = Math.max(currentIdx, targetIdx)

  if (isGenericCurrentRole(currentRole) || from === to) {
    from = 0
    to = Math.max(to, Math.min(ladder.roles.length - 1, targetIdx + 2))
  }

  let windowStart = from
  let windowEnd = to
  const minPool = 12

  const sliceFiltered = () =>
    filterRolesForHierarchy(uniquePreserveOrder(all.slice(windowStart, windowEnd + 1)), currentRole, targetRole)

  let pool = sliceFiltered()

  while (pool.length < minPool && windowStart > 0) {
    windowStart -= 1
    pool = sliceFiltered()
  }
  while (pool.length < minPool && windowEnd < to) {
    windowEnd += 1
    pool = sliceFiltered()
  }

  pool = pool.filter((r) => roleKey(r) !== roleKey(target))
  const stem = extractRoleStem(target)
  const synthetics = filterRolesForHierarchy(
    buildStemLadder(stem, target, 10),
    currentRole,
    targetRole,
  ).filter((r) => roleKey(r) !== roleKey(target))
  pool = withoutPlaceholderRoles(uniquePreserveOrder([...pool, ...synthetics]))
  pool = withoutPlaceholderRoles(filterRolesForHierarchy(pool, currentRole, targetRole))
  pool.push(target)
  return withoutPlaceholderRoles(pool)
}

/**
 * Pick `need` unique roles from candidates (never duplicates).
 * @param {string[]} candidates
 * @param {number} need
 */
function pickUniqueEvenly(candidates, need) {
  const list = sortBySeniority(uniquePreserveOrder(candidates))
  if (!list.length || need <= 0) return []

  if (list.length <= need) return list.slice(0, need)

  const out = []
  const used = new Set()
  for (let i = 0; i < need; i += 1) {
    const t = need === 1 ? 0.5 : i / (need - 1)
    const idx = Math.round(t * (list.length - 1))
    const role = list[idx]
    const k = roleKey(role)
    if (!used.has(k)) {
      used.add(k)
      out.push(role)
    }
  }
  for (const role of list) {
    if (out.length >= need) break
    const k = roleKey(role)
    if (!used.has(k)) {
      used.add(k)
      out.push(role)
    }
  }
  return out.slice(0, need)
}

/**
 * Fill gaps with stem-based titles when the pool is too thin.
 * @param {string[]} middle
 * @param {number} need
 * @param {string} targetRole
 */
function fillUniqueMiddle(middle, need, targetRole) {
  const target = normalizeRole(targetRole)
  let out = uniquePreserveOrder(middle).filter((r) => roleKey(r) !== roleKey(target))

  const stem = extractRoleStem(target)
  const extras = buildStemLadder(stem, target, Math.max(need + 2, 8))
  for (const r of extras) {
    if (out.length >= need) break
    if (roleKey(r) === roleKey(target)) continue
    if (!out.some((x) => roleKey(x) === roleKey(r))) out.push(normalizeRole(r))
  }

  return sortBySeniority(pickUniqueEvenly(out, need))
}

/** Guarantee exactly `count` roles (target last); backfill from catalog ladders — no placeholder titles. */
function ensureRoleListCount(roles, count, targetRole, candidates = [], categoryName = '') {
  const target = normalizeRole(targetRole)
  let out = withoutPlaceholderRoles(uniquePreserveOrder(roles)).filter((r) => roleKey(r) !== roleKey(target))
  out.push(target)

  let guard = 0
  while (out.length < count && guard < 24) {
    guard += 1
    const needMiddle = Math.max(0, count - 1)
    const mids = fillUniqueMiddle(
      withoutPlaceholderRoles([...out.slice(0, -1), ...candidates]),
      needMiddle,
      target,
    )
    out = withoutPlaceholderRoles(uniquePreserveOrder([...mids, target]))

    if (out.length < count) {
      const used = new Set(out.map(roleKey))
      const backfill = catalogRoleBackfill(count - out.length + 1, target, categoryName, used)
      for (const r of backfill) {
        if (out.length >= count) break
        const k = roleKey(r)
        if (!k || used.has(k) || k === roleKey(target)) continue
        used.add(k)
        out.splice(out.length - 1, 0, normalizeRole(r))
      }
    }

    if (out.length < count) {
      const stem = extractRoleStem(target)
      const extras = withoutPlaceholderRoles(buildStemLadder(stem, target, count + 4))
      for (const r of extras) {
        if (out.length >= count) break
        const k = roleKey(r)
        if (!k || k === roleKey(target) || out.some((x) => roleKey(x) === k)) continue
        out.splice(out.length - 1, 0, normalizeRole(r))
      }
    }
  }

  return withoutPlaceholderRoles(out).slice(0, count)
}

/** Ensure milestone roles ascend in seniority (accel upskill node stays first). */
function orderMilestoneRoles(roles, mode) {
  if (mode === 'accelerated' && roles.length > 1) {
    const [first, ...rest] = roles
    const last = rest[rest.length - 1]
    const middle = sortBySeniority(rest.slice(0, -1))
    return [first, ...middle, last]
  }
  return sortBySeniority(roles)
}

/**
 * Sample `count` unique future milestone roles from a progression pool.
 * @param {string[]} pool
 * @param {number} count
 * @param {'traditional'|'fastTrack'|'accelerated'} mode
 * @param {string} currentRole
 * @param {string} targetRole
 * @param {string} [ladderId]
 */
export function samplePathRoles(pool, count, mode, currentRole, targetRole, ladderId = '', categoryName = '') {
  const target = normalizeRole(targetRole)
  const current = normalizeRole(currentRole)

  let candidates = withoutPlaceholderRoles(
    filterRolesForHierarchy(
      uniquePreserveOrder(pool).filter((r) => roleKey(r) !== roleKey(current)),
      currentRole,
      targetRole,
    ),
  ).filter((r) => roleKey(r) !== roleKey(target))

  if (mode === 'accelerated') {
    const first = current
    if (count === 1) return [target]
    if (count === 2) return [first, target]

    const midRoles = fillUniqueMiddle(candidates, 1, target)
    let mid = midRoles[0]
    if (!mid || roleKey(mid) === roleKey(target) || roleSimilarity(mid, target) > 0.88) {
      mid =
        candidates.find((r) => roleSimilarity(r, target) < 0.72) ||
        `${extractRoleStem(target)} Specialist`
    }
    if (count === 3) {
      return orderMilestoneRoles(
        ensureRoleListCount([first, normalizeRole(mid), target], count, target, candidates, categoryName),
        mode,
      )
    }

    const inner = fillUniqueMiddle(candidates, count - 2, target)
    return orderMilestoneRoles(
      ensureRoleListCount([first, ...inner, target], count, target, candidates, categoryName),
      mode,
    )
  }

  const middleCount = Math.max(0, count - 1)
  let middle = pickUniqueEvenly(candidates, middleCount)
  if (middle.length < middleCount) {
    middle = fillUniqueMiddle([...middle, ...candidates], middleCount, target)
  }

  return orderMilestoneRoles(
    ensureRoleListCount([...middle.slice(0, middleCount), target], count, target, candidates, categoryName),
    mode,
  )
}

const FRAME3_PATH_KEYS = { trad: 'traditional', fast: 'fastTrack', accel: 'accelerated' }

/**
 * Coerce any journey to canonical 6 / 5 / 3 milestone cards (engine is structural fallback).
 * @param {object|null} journey
 * @param {object} fallbackJourney — typically `buildJourneyFromProgressionEngine` output
 */
export function coerceJourneyToCanonicalCounts(journey, fallbackJourney) {
  const fb = fallbackJourney || journey
  if (!fb?.nodes) return journey || fb

  const out = {
    ...fb,
    ...journey,
    trad: { ...fb.trad, ...journey?.trad, label: journey?.trad?.label || fb.trad?.label || 'Traditional' },
    fast: { ...fb.fast, ...journey?.fast, label: journey?.fast?.label || fb.fast?.label || 'Fast Track' },
    accel: { ...fb.accel, ...journey?.accel, label: journey?.accel?.label || fb.accel?.label || 'Accelerated' },
    nodes: {},
  }

  for (const pk of ['trad', 'fast', 'accel']) {
    const want = PATH_MILESTONE_COUNTS[FRAME3_PATH_KEYS[pk]]
    const preferred = journey?.nodes?.[pk] || []
    const engineNodes = fb.nodes[pk] || []
    let nodes =
      preferred.length === want
        ? preferred
        : engineNodes.length === want
          ? engineNodes
          : engineNodes.length > want
            ? engineNodes.slice(0, want)
            : engineNodes

    while (nodes.length < want && engineNodes.length) {
      const src = engineNodes[nodes.length] || engineNodes[engineNodes.length - 1]
      nodes.push({ ...src })
    }

    nodes = nodes.slice(0, want).map((n, i) => ({
      ...n,
      goal: i === want - 1,
      ...(pk === 'fast' && i === 0 ? { fastTag: n.fastTag || 'self_learning' } : {}),
      ...(pk === 'fast' && i === 1 ? { fastTag: n.fastTag || 'upskilling' } : {}),
      ...(pk === 'accel' && i === 0 ? { tag: n.tag !== false } : {}),
    }))

    out.nodes[pk] = nodes
  }

  return out
}

/**
 * @param {object} input
 * @param {string} input.currentRole
 * @param {string} input.targetRole
 * @param {string} [input.categoryName]
 * @param {object} [input.destinationMeta]
 * @param {number} [input.tradYears]
 * @param {number} [input.fastYears]
 * @param {number} [input.accelYears]
 * @param {string} [input.salaryText]
 * @param {number} [input.currentMonthlySalary]
 * @param {object} [input.profile]
 * @returns {CareerProgressionResult}
 */
export function generateCareerProgression(input) {
  const currentRole = normalizeRole(input.currentRole) || 'Current Role'
  const targetRole = normalizeRole(input.targetRole) || 'Target Role'
  const currentMonthly =
    Number(input.currentMonthlySalary) > 0
      ? Number(input.currentMonthlySalary)
      : parseProfileMonthlySalary(input.profile)
  const categoryName = input.categoryName || input.destinationMeta?.category || ''
  const meta =
    input.destinationMeta ||
    (categoryName ? findDestinationMeta(categoryName, targetRole) : null)

  const tl = meta?.timeline || {}
  const tradYears = PATH_END_YEARS.traditional
  const fastYears = PATH_END_YEARS.fastTrack
  const accelYears = PATH_END_YEARS.accelerated

  const salMeta = meta?.target_salary
  const salaryText =
    input.salaryText ||
    (salMeta?.min_monthly && salMeta?.max_monthly
      ? formatRupeeMonthlyBand(salMeta.min_monthly, salMeta.max_monthly)
      : formatRupeeMonthlyBand(35000, 85000))

  const { min, max } = parseSalaryBand(salaryText)

  const { ladder, currentIdx, targetIdx } = selectBestLadder(
    currentRole,
    targetRole,
    categoryName,
    { ...meta, category: categoryName },
  )

  const pool = buildProgressionPool(ladder, currentIdx, targetIdx, currentRole, targetRole)

  const paths = /** @type {const} */ (['traditional', 'fastTrack', 'accelerated'])
  const yearTotals = { traditional: tradYears, fastTrack: fastYears, accelerated: accelYears }
  /** @type {CareerProgressionResult} */
  const result = {
    traditional: [],
    fastTrack: [],
    accelerated: [],
    meta: { ladderId: ladder.id, ladderName: ladder.name, slice: pool },
  }

  for (const pathKey of paths) {
    const count = PATH_MILESTONE_COUNTS[pathKey]
    const mode = pathKey
    const roles = samplePathRoles(pool, count, mode, currentRole, targetRole, ladder.id, categoryName)
    const years = yearsForPath(count, yearTotals[pathKey], pathKey)
    const salaries = buildIncreasingSalaries(count, currentMonthly, min, max)

    result[pathKey] = roles.map((role, i) => {
      const isTarget = i === count - 1
      const isAccelFirst = pathKey === 'accelerated' && i === 0
      return {
        role: isTarget ? targetRole : role,
        year: years[i],
        salary: salaries[i],
        description: descriptionForStep(role, isTarget, isAccelFirst),
        isTargetRole: isTarget,
        ...(isAccelFirst ? { tag: true } : {}),
      }
    })
  }

  return result
}

function defaultNodeDetail(role, brief) {
  return {
    lifestyle: brief,
    what: [
      `Deliver measurable outcomes as ${role}`,
      'Build stakeholder trust through clear communication',
      'Strengthen craft with feedback loops and mentorship',
      'Document wins for promotion and interviews',
    ],
    skills: resolveMilestoneSkills(role),
  }
}

/**
 * Convert engine output → Frame 3 journey shape.
 * @param {CareerProgressionResult} progression
 * @param {{ tradYears?: number, fastYears?: number, accelYears?: number }} [years]
 */
export function progressionToFrame3Journey(progression, years = {}) {
  const mapPath = (nodes, pathKey) =>
    nodes.map((n, i) => ({
      r: n.role,
      yr: n.year,
      brief: n.description,
      sal: n.salary,
      goal: n.isTargetRole,
      ...(n.tag ? { tag: true } : {}),
      ...(pathKey === 'fastTrack' && i === 0 ? { fastTag: 'self_learning' } : {}),
      ...(pathKey === 'fastTrack' && i === 1 ? { fastTag: 'upskilling' } : {}),
      detail: defaultNodeDetail(n.role, n.description),
    }))

  return {
    trad: { yrs: years.tradYears ?? PATH_END_YEARS.traditional, label: 'Traditional' },
    fast: { yrs: years.fastYears ?? PATH_END_YEARS.fastTrack, label: 'Fast Track' },
    accel: { yrs: years.accelYears ?? PATH_END_YEARS.accelerated, label: 'Accelerated' },
    nodes: {
      trad: mapPath(progression.traditional, 'traditional'),
      fast: mapPath(progression.fastTrack, 'fastTrack'),
      accel: mapPath(progression.accelerated, 'accelerated'),
    },
  }
}

/**
 * Single entry for Frame 3 — replaces legacy deterministicJourney.
 * @param {object} card — journey source card
 * @param {string} currentRole
 * @param {object} [profile]
 */
export function buildJourneyFromProgressionEngine(card, currentRole = '', profile = {}) {
  const target = normalizeRole(card?.role) || 'Career Destination'
  const category =
    card?.industry ||
    card?.category ||
    profile?.dTarFunc ||
    profile?.ind ||
    ''

  const progression = generateCareerProgression({
    currentRole: currentRole || profile?.role || 'Current Role',
    targetRole: target,
    categoryName: category,
    destinationMeta: card?.destinationMeta,
    tradYears: card?.tradYrs,
    fastYears: card?.fastYrs,
    accelYears: card?.accelYrs,
    salaryText: card?.sal,
    profile,
    currentMonthlySalary: parseProfileMonthlySalary(profile),
  })

  return progressionToFrame3Journey(progression, {
    tradYears: Number(card?.tradYrs) || 9,
    fastYears: Number(card?.fastYrs) || 7,
    accelYears: Number(card?.accelYrs) || 5,
  })
}
