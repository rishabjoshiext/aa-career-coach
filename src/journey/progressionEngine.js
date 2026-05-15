/**
 * Deterministic career progression engine — Traditional / Fast Track / Accelerated.
 * @module journey/progressionEngine
 */

import { selectBestLadder, findDestinationMeta, normalizeRole, roleSimilarity } from './roleMatcher.js'
import { extractRoleStem, buildStemLadder } from './roleLadders.js'
import { filterRolesForHierarchy, inferSeniorityRank } from './seniority.js'

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

const YEAR_ANCHORS = {
  traditional: [0.6, 1.8, 3.6, 5.4, 7.2, 9],
  fastTrack: [0.6, 2.3, 4.7, 5.8, 7],
  accelerated: [0.6, 2.5, 5],
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
  const anchors = YEAR_ANCHORS[key] || YEAR_ANCHORS.traditional
  if (count <= anchors.length) {
    const picked = anchors.slice(0, count)
    const scale = totalYears / picked[picked.length - 1]
    return picked.map((y) => +(y * scale).toFixed(1))
  }
  const out = []
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 1 : i / (count - 1)
    out.push(+(Math.max(0.6, totalYears * t)).toFixed(1))
  }
  return out
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} t 0–1
 */
function formatSalaryBandValues(lo, hi) {
  const k1 = Math.round(Math.min(lo, hi) / 1000)
  const k2 = Math.round(Math.max(lo, hi) / 1000)
  return `₹${k1}–${k2}k/mo`
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
  const from = Math.min(currentIdx, targetIdx)
  const to = Math.max(currentIdx, targetIdx)

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
  pool = uniquePreserveOrder([...pool, ...synthetics])
  pool = filterRolesForHierarchy(pool, currentRole, targetRole)
  pool.push(target)
  return pool
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
export function samplePathRoles(pool, count, mode, currentRole, targetRole, ladderId = '') {
  const target = normalizeRole(targetRole)
  const current = normalizeRole(currentRole)

  let candidates = filterRolesForHierarchy(
    uniquePreserveOrder(pool).filter((r) => roleKey(r) !== roleKey(current)),
    currentRole,
    targetRole,
  ).filter((r) => roleKey(r) !== roleKey(target))

  if (mode === 'accelerated') {
    const upskill = UPSKILL_BY_DOMAIN[ladderId] || 'Upskilling'
    const shortCurrent = current.length > 28 ? `${current.slice(0, 25)}…` : current
    const first = `${shortCurrent} + ${upskill}`
    if (count === 1) return [target]
    if (count === 2) return [first, target]

    const midRoles = fillUniqueMiddle(candidates, 1, target)
    let mid = midRoles[0]
    if (!mid || roleKey(mid) === roleKey(target) || roleSimilarity(mid, target) > 0.88) {
      mid =
        candidates.find((r) => roleSimilarity(r, target) < 0.72) ||
        `${extractRoleStem(target)} Specialist`
    }
    if (count === 3) return orderMilestoneRoles(uniquePreserveOrder([first, normalizeRole(mid), target]), mode)

    const inner = fillUniqueMiddle(candidates, count - 2, target)
    return orderMilestoneRoles(uniquePreserveOrder([first, ...inner, target]).slice(0, count), mode)
  }

  const middleCount = Math.max(0, count - 1)
  let middle = pickUniqueEvenly(candidates, middleCount)
  if (middle.length < middleCount) {
    middle = fillUniqueMiddle([...middle, ...candidates], middleCount, target)
  }

  return orderMilestoneRoles(uniquePreserveOrder([...middle.slice(0, middleCount), target]).slice(0, count), mode)
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
  const tradYears = Number(input.tradYears ?? tl.traditional) || 9
  const fastYears = Number(input.fastYears ?? tl.fast_track) || 7
  const accelYears = Number(input.accelYears ?? tl.accelerated) || 5

  const salMeta = meta?.target_salary
  const salaryText =
    input.salaryText ||
    (salMeta?.min_monthly && salMeta?.max_monthly
      ? `₹${Math.round(salMeta.min_monthly / 1000)}–${Math.round(salMeta.max_monthly / 1000)}k`
      : '₹35–85k')

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
    const roles = samplePathRoles(pool, count, mode, currentRole, targetRole, ladder.id)
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
    skills: ['Domain depth', 'Execution', 'Communication', 'Problem solving'],
  }
}

/**
 * Convert engine output → Frame 3 journey shape.
 * @param {CareerProgressionResult} progression
 * @param {{ tradYears?: number, fastYears?: number, accelYears?: number }} [years]
 */
export function progressionToFrame3Journey(progression, years = {}) {
  const mapPath = (nodes, pathKey) =>
    nodes.map((n) => ({
      r: n.role,
      yr: n.year,
      brief: n.description,
      sal: n.salary,
      goal: n.isTargetRole,
      ...(n.tag ? { tag: true } : {}),
      detail: defaultNodeDetail(n.role, n.description),
    }))

  return {
    trad: { yrs: years.tradYears ?? 9, label: 'Traditional' },
    fast: { yrs: years.fastYears ?? 7, label: 'Fast Track' },
    accel: { yrs: years.accelYears ?? 5, label: 'Accelerated' },
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
