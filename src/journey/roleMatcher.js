/**
 * Fuzzy role matching and ladder selection.
 * @module journey/roleMatcher
 */

import { inferCareerAreaFromText } from '../data/potentialCareerAreas.js'
import {
  CURATED_LADDERS,
  CATEGORY_TO_CURATED,
  buildStemLadder,
  extractRoleStem,
  getAllLadders,
  getCategoryLaddersFromMapping,
  getLadderForCategory,
  LEVEL_RANK,
} from './roleLadders.js'
import { inferSeniorityRank } from './seniority.js'

export { inferSeniorityRank } from './seniority.js'

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'in', 'at', 'to', 'for', 'of', 'with', 'jr', 'sr', 'i', 'ii', 'iii'])

/** @param {string} t */
export function normalizeRole(t) {
  return String(t || '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** @param {string} t */
function normTokens(t) {
  return normalizeRole(t)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} 0–1
 */
export function roleSimilarity(a, b) {
  const A = normTokens(a)
  const B = normTokens(b)
  if (!A.length || !B.length) return 0
  const cur = normalizeRole(a).toLowerCase()
  const dest = normalizeRole(b).toLowerCase()
  if (cur === dest) return 1
  if (dest.includes(cur) || cur.includes(dest)) return 0.88
  const setA = new Set(A)
  let inter = 0
  B.forEach((x) => {
    if (setA.has(x)) inter += 1
  })
  const union = setA.size + B.size - inter
  const jaccard = union ? inter / union : 0
  const prefixBonus = A.some((t) => t.length > 3 && dest.includes(t)) ? 0.1 : 0
  return Math.min(1, jaccard + prefixBonus)
}

/**
 * @param {import('./roleLadders.js').CareerLadder} ladder
 * @param {string} roleTitle
 * @returns {number} index or -1
 */
export function findRoleIndexInLadder(ladder, roleTitle) {
  const want = normalizeRole(roleTitle)
  if (!want || !ladder?.roles?.length) return -1
  const exact = ladder.roles.findIndex((r) => normalizeRole(r).toLowerCase() === want.toLowerCase())
  if (exact >= 0) return exact

  let best = -1
  let bestSc = 0
  ladder.roles.forEach((r, i) => {
    const sc = roleSimilarity(want, r)
    if (sc > bestSc) {
      bestSc = sc
      best = i
    }
  })
  return bestSc >= 0.42 ? best : -1
}

/**
 * @param {import('./roleLadders.js').CareerLadder} ladder
 * @param {string} roleTitle
 * @returns {number}
 */
function indexBySeniorityProxy(ladder, roleTitle) {
  const rank = inferSeniorityRank(roleTitle)
  let best = 0
  let bestDiff = Infinity
  ladder.roles.forEach((r, i) => {
    const rr = inferSeniorityRank(r)
    const diff = Math.abs(rr - rank)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}

/**
 * @param {import('./roleLadders.js').CareerLadder} ladder
 * @param {string} currentRole
 * @param {string} targetRole
 * @returns {{ currentIdx: number, targetIdx: number, score: number }}
 */
export function resolveIndicesOnLadder(ladder, currentRole, targetRole) {
  let currentIdx = findRoleIndexInLadder(ladder, currentRole)
  let targetIdx = findRoleIndexInLadder(ladder, targetRole)

  if (currentIdx < 0) currentIdx = indexBySeniorityProxy(ladder, currentRole)
  if (targetIdx < 0) targetIdx = indexBySeniorityProxy(ladder, targetRole)

  let workingLadder = ladder
  if (targetIdx < 0) {
    const roles = [...workingLadder.roles]
    if (!roles.some((r) => roleSimilarity(r, targetRole) > 0.9)) {
      roles.push(normalizeRole(targetRole))
    }
    targetIdx = roles.length - 1
    workingLadder = { ...workingLadder, roles }
  }

  if (currentIdx > targetIdx) {
    const cr = inferSeniorityRank(currentRole)
    const tr = inferSeniorityRank(targetRole)
    if (tr >= cr) currentIdx = Math.max(0, targetIdx - 1)
    else currentIdx = Math.min(currentIdx, targetIdx)
  }

  const score =
    roleSimilarity(currentRole, ladder.roles[currentIdx] || '') * 0.4 +
    roleSimilarity(targetRole, ladder.roles[targetIdx] || '') * 0.6

  return { currentIdx, targetIdx, score, ladder: workingLadder }
}

/**
 * @param {string} currentRole
 * @param {string} targetRole
 * @param {string} [categoryHint]
 * @param {object} [destinationMeta]
 * @returns {{ ladder: import('./roleLadders.js').CareerLadder, currentIdx: number, targetIdx: number }}
 */
export function selectBestLadder(currentRole, targetRole, categoryHint = '', destinationMeta = null) {
  const current = normalizeRole(currentRole) || 'Current Role'
  const target = normalizeRole(targetRole) || 'Target Role'

  const hints = [
    destinationMeta?.category,
    destinationMeta?.industry,
    categoryHint,
    inferCareerAreaFromText(`${current} ${target}`),
    inferCareerAreaFromText(target),
    inferCareerAreaFromText(current),
  ].filter(Boolean)

  /** @type {import('./roleLadders.js').CareerLadder[]} */
  const candidates = []

  for (const hint of hints) {
    const lad = getLadderForCategory(String(hint))
    if (lad) candidates.push(lad)
    const curatedKey = CATEGORY_TO_CURATED[String(hint)]
    if (curatedKey && CURATED_LADDERS[curatedKey]) {
      candidates.push(CURATED_LADDERS[curatedKey])
    }
  }

  const jsonLad = getCategoryLaddersFromMapping()
  for (const lad of jsonLad.values()) candidates.push(lad)

  for (const lad of Object.values(CURATED_LADDERS)) candidates.push(lad)

  const seen = new Set()
  const unique = candidates.filter((l) => {
    if (!l?.id || seen.has(l.id)) return false
    seen.add(l.id)
    return true
  })

  let best = null
  let bestScore = -1
  let bestResolved = null

  for (const lad of unique) {
    const resolved = resolveIndicesOnLadder({ ...lad, roles: [...lad.roles] }, current, target)
    if (resolved.targetIdx < 0) continue
    const forward = resolved.targetIdx > resolved.currentIdx || roleSimilarity(target, lad.roles[resolved.targetIdx]) > 0.75
    const bonus = hints.includes(lad.name) ? 0.15 : 0
    const total = resolved.score + bonus + (forward ? 0.1 : 0)
    if (total > bestScore) {
      bestScore = total
      best = resolved.ladder
      bestResolved = resolved
    }
  }

  if (best && bestResolved) {
    return {
      ladder: bestResolved.ladder,
      currentIdx: bestResolved.currentIdx,
      targetIdx: bestResolved.targetIdx,
    }
  }

  const stem = extractRoleStem(target)
  const synthetic = buildStemLadder(stem, target, 9)
  const synLadder = { id: `stem_${stem}`, name: stem, roles: synthetic }
  const curIdx = Math.max(0, inferSeniorityRank(current) - 2)
  const tgtIdx = synLadder.roles.length - 1
  if (!synLadder.roles.some((r) => roleSimilarity(r, current) > 0.85)) {
    synLadder.roles.unshift(current)
    return { ladder: synLadder, currentIdx: 0, targetIdx: synLadder.roles.length - 1 }
  }
  return { ladder: synLadder, currentIdx: Math.min(curIdx, tgtIdx - 1), targetIdx: tgtIdx }
}

/**
 * Roles from current → target on ladder (inclusive), deduped.
 * @param {import('./roleLadders.js').CareerLadder} ladder
 * @param {number} currentIdx
 * @param {number} targetIdx
 * @param {string} currentRole
 * @param {string} targetRole
 * @returns {string[]}
 */
export function sliceProgression(ladder, currentIdx, targetIdx, currentRole, targetRole) {
  const roles = [...ladder.roles]
  let from = Math.max(0, Math.min(currentIdx, targetIdx))
  let to = Math.max(currentIdx, targetIdx)

  if (to <= from) {
    const stem = extractRoleStem(targetRole)
    const bridge = buildStemLadder(stem, targetRole, 7)
    const cur = normalizeRole(currentRole)
    const merged = [cur, ...bridge.filter((r) => roleSimilarity(r, cur) < 0.9)]
    return [...new Set(merged.map(normalizeRole))]
  }

  let slice = roles.slice(from, to + 1).map(normalizeRole)
  if (roleSimilarity(slice[0], currentRole) < 0.55) slice[0] = normalizeRole(currentRole)
  const last = slice.length - 1
  if (roleSimilarity(slice[last], targetRole) < 0.55) slice[last] = normalizeRole(targetRole)
  return [...new Set(slice)]
}

/**
 * @param {string} categoryName
 * @param {string} roleTitle
 * @returns {object | null}
 */
export function findDestinationMeta(categoryName, roleTitle) {
  const cat = getCategoryLaddersFromMapping().get(categoryName)
  if (!cat?.meta) return null
  const want = normalizeRole(roleTitle).toLowerCase()
  return (
    cat.meta.find((r) => String(r.title || '').trim().toLowerCase() === want) ||
    cat.meta.find((r) => roleSimilarity(r.title, roleTitle) >= 0.72) ||
    null
  )
}

export { getAllLadders, LEVEL_RANK }
