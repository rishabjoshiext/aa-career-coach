/**
 * Seniority ranks and hierarchy guards for journey progression.
 * @module journey/seniority
 */

function normalizeRole(t) {
  return String(t || '').trim().replace(/\s+/g, ' ')
}

const EXEC_PATTERN =
  /\b(coo|ceo|cto|cio|cfo|cpo|chief|evp|svp|vp|vice president|director|head of|zonal head|president)\b/i

/** @param {string} roleTitle */
export function inferSeniorityRank(roleTitle) {
  const t = normalizeRole(roleTitle).toLowerCase()
  if (/\b(coo|ceo|cto|cio|cfo|chief|cpo|president)\b/.test(t)) return 9
  if (/\b(vp|vice president|evp|svp|zonal head)\b/.test(t)) return 8
  if (/\b(director|head of)\b/.test(t)) return 7
  if (/\b(regional|national|global)\s+.*(manager|head|lead)\b/.test(t)) return 6
  if (/\b(senior|sr\.?)\s+(manager|engineer|analyst|consultant|specialist)\b/.test(t)) return 5
  if (/\b(principal|staff)\b/.test(t)) return 5
  if (/\b(lead)\b/.test(t) && !/\bteam lead\b/.test(t)) return 5
  if (/\bmanager\b/.test(t)) return 4
  if (/\b(specialist|analyst)\b/.test(t)) return 3
  if (/\b(associate)\b/.test(t)) return 2
  if (/\b(executive|coordinator|representative|receptionist|assistant)\b/.test(t)) return 1
  return 2
}

/** @param {string} roleTitle */
export function isExecutiveTierRole(roleTitle) {
  const t = normalizeRole(roleTitle).toLowerCase()
  if (EXEC_PATTERN.test(t)) return true
  return inferSeniorityRank(roleTitle) >= 7
}

/** @param {string} targetRole */
export function destinationAllowsExecutiveSteps(targetRole) {
  const rank = inferSeniorityRank(targetRole)
  return rank >= 7 || isExecutiveTierRole(targetRole)
}

/**
 * Keep junior → senior steps only; never place VP/Director/CXO before a non-executive destination.
 * @param {string[]} roles
 * @param {string} currentRole
 * @param {string} targetRole
 */
export function filterRolesForHierarchy(roles, currentRole, targetRole) {
  const currentRank = inferSeniorityRank(currentRole)
  const targetRank = inferSeniorityRank(targetRole)
  const allowExec = destinationAllowsExecutiveSteps(targetRole)

  const filtered = roles.filter((r) => {
    const rank = inferSeniorityRank(r)
    if (!allowExec && (isExecutiveTierRole(r) || rank >= 7)) return false
    if (rank > targetRank) return false
    if (rank < currentRank - 1) return false
    return true
  })

  return [...filtered].sort((a, b) => inferSeniorityRank(a) - inferSeniorityRank(b))
}

/** Stem tiers capped to destination seniority (no Director before Manager target). */
export function stemTiersForTarget(targetRole) {
  const targetRank = inferSeniorityRank(targetRole)
  const tiers = [
    { label: 'Executive', rank: 1 },
    { label: 'Associate', rank: 2 },
    { label: 'Analyst', rank: 3 },
    { label: 'Specialist', rank: 3 },
    { label: 'Senior', rank: 5 },
    { label: 'Lead', rank: 5 },
    { label: 'Manager', rank: 4 },
    { label: 'Director', rank: 7 },
  ]
  return tiers
    .filter((t) => t.rank <= targetRank && (t.rank < 7 || destinationAllowsExecutiveSteps(targetRole)))
    .sort((a, b) => a.rank - b.rank)
}
