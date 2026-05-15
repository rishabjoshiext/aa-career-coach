/**
 * Resolves a journey "card" for Frame 3 — always aligned to the user's selected destination,
 * never silently falling back to another function's PD data.
 */

import { inferIndustryFromFreeText, inferIndustryFromProfileStrings, roleTrajectoryScore } from './destinationMapping.js'
import { flattenIndustryRoles } from './fasttrackData.js'
import { findRoleMetadataByTitle, matchCareerAreaByRoleTitle } from '../data/potentialCareerData.js'

const DEFAULT_CARD = {
  role: 'Your goal',
  desc: 'Structured progression toward your selected destination',
  tradYrs: 8,
  fastYrs: 5,
  accelYrs: 4,
  sal: '₹35–65k',
}

function defaultYearsAndSalForInference(ind) {
  const map = {
    Product: { tradYrs: 9, fastYrs: 6, accelYrs: 4, sal: '₹70–110k' },
    Marketing: { tradYrs: 8, fastYrs: 5, accelYrs: 4, sal: '₹45–80k' },
    Finance: { tradYrs: 9, fastYrs: 7, accelYrs: 5, sal: '₹55–90k' },
    HR: { tradYrs: 8, fastYrs: 6, accelYrs: 4, sal: '₹40–75k' },
    IT: { tradYrs: 8, fastYrs: 5, accelYrs: 3, sal: '₹55–120k' },
    Sales: { tradYrs: 7, fastYrs: 5, accelYrs: 3, sal: '₹35–90k' },
    Operations: { tradYrs: 8, fastYrs: 6, accelYrs: 4, sal: '₹40–80k' },
    'Business Analytics': { tradYrs: 7, fastYrs: 5, accelYrs: 3, sal: '₹50–95k' },
    'Data Science': { tradYrs: 8, fastYrs: 5, accelYrs: 4, sal: '₹65–130k' },
    Strategy: { tradYrs: 9, fastYrs: 7, accelYrs: 5, sal: '₹80–150k' },
  }
  return map[ind] || { tradYrs: 8, fastYrs: 5, accelYrs: 4, sal: '₹45–85k' }
}

function attachDestinationMeta(card, title) {
  const metaHit = findRoleMetadataByTitle(title)
  if (!metaHit) {
    const area = card.industry || matchCareerAreaByRoleTitle(title)
    return { ...card, category: card.category || area, industry: card.industry || area }
  }
  return {
    ...card,
    industry: metaHit.areaName,
    category: metaHit.areaName,
    destinationMeta: metaHit.roleRow,
  }
}

/**
 * @param {{ selRole: string | null, selIndustry?: string, profile?: { ind?: string, role?: string, dSalary?: number } }}} p
 * @returns {object} Card shape for progression engine (role, desc, tradYrs, fastYrs, accelYrs, sal, category, …)
 */
export function resolveJourneySourceCard({ selRole, selIndustry, profile }) {
  const title = String(selRole || '').trim()
  if (!title) {
    return { ...DEFAULT_CARD }
  }

  const all = flattenIndustryRoles('all')
  const scoped = selIndustry && selIndustry !== 'all' ? flattenIndustryRoles(selIndustry) : all

  const exactScoped = scoped.find((c) => c.role === title)
  if (exactScoped) return attachDestinationMeta(exactScoped, title)

  const exactAll = all.find((c) => c.role === title)
  if (exactAll) return attachDestinationMeta(exactAll, title)

  let best = null
  let bestSc = 0
  for (const c of all) {
    const sc = Math.max(roleTrajectoryScore(title, c.role), roleTrajectoryScore(c.role, title))
    if (sc > bestSc) {
      bestSc = sc
      best = c
    }
  }

  const inferred =
    inferIndustryFromFreeText(title) ||
    inferIndustryFromProfileStrings(
      profile?.ind,
      profile?.role,
      Array.isArray(profile?.selectedSkills) ? profile.selectedSkills.join(' ') : '',
    ) ||
    (/\bproduct\b/i.test(title) ? 'Product' : null)

  if (bestSc >= 0.26 && best) {
    return attachDestinationMeta(
      {
        ...best,
        role: title,
        desc: best.desc || `Progression toward ${title}`,
      },
      title,
    )
  }

  if (inferred === 'Product') {
    const pm = all.find((c) => c.role === 'Product Manager')
    if (pm) {
      return attachDestinationMeta(
        { ...pm, role: title, desc: pm.desc || `Leadership track toward ${title}` },
        title,
      )
    }
  }

  const metaHit = findRoleMetadataByTitle(title)
  if (metaHit) {
    const fromJson = flattenIndustryRoles(metaHit.areaName).find((c) => c.role === metaHit.roleRow.title)
    if (fromJson) {
      return {
        ...fromJson,
        role: title,
        desc: fromJson.desc || metaHit.roleRow.description || `Progression toward ${title}`,
        industry: metaHit.areaName,
        category: metaHit.areaName,
        destinationMeta: metaHit.roleRow,
      }
    }
  }

  const area = matchCareerAreaByRoleTitle(title) || inferred
  const y = defaultYearsAndSalForInference(area)
  return {
    role: title,
    desc: `Career arc toward ${title} in the ${area || 'chosen'} track.`,
    tradYrs: y.tradYrs,
    fastYrs: y.fastYrs,
    accelYrs: y.accelYrs,
    sal: y.sal,
    jobs: '5,000+',
    apnaJobs: '1,000+',
    growth: '+28%',
    dbProfiles: 1200,
    industry: area || selIndustry || 'Other',
    category: area || selIndustry || 'Other',
  }
}
