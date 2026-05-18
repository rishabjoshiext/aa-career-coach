import {
  PATH_MILESTONE_COUNTS,
  buildJourneyFromProgressionEngine,
} from '../journey/progressionEngine.js'
import { resolveJourneySourceCard } from './journeySourceCard.js'
import { PD } from './pathData.js'
import { resolvePdRole } from './roleKey.js'
import { formatRupeeMonthly } from './formatINR.js'

const PATH_NODE_COUNTS = {
  trad: PATH_MILESTONE_COUNTS.traditional,
  fast: PATH_MILESTONE_COUNTS.fastTrack,
  accel: PATH_MILESTONE_COUNTS.accelerated,
}

function journeyHasCanonicalLengths(j) {
  if (!j?.nodes) return false
  return (
    j.nodes.trad?.length === PATH_NODE_COUNTS.trad &&
    j.nodes.fast?.length === PATH_NODE_COUNTS.fast &&
    j.nodes.accel?.length === PATH_NODE_COUNTS.accel
  )
}

/**
 * Same journey source as Frame 3 — used by the accelerated-path bottom sheet.
 */
export function resolveUserJourney({ selRole, selIndustry, profile }) {
  const fallbackRole = resolvePdRole(selRole)
  const destinationTitle = (selRole && String(selRole).trim()) || fallbackRole

  const journeyCard = resolveJourneySourceCard({
    selRole,
    selIndustry: selIndustry || 'all',
    profile,
  })

  const pdStatic = PD[destinationTitle] || null
  const engineJourney = buildJourneyFromProgressionEngine(
    journeyCard,
    profile?.role || '',
    profile,
  )

  const journey =
    pdStatic && journeyHasCanonicalLengths(pdStatic) ? pdStatic : engineJourney

  return { journey, destinationTitle, journeyCard }
}

/** Monthly salary label for the “Now” stage in the path drawer. */
export function profileMonthlySalaryLabel(profile) {
  const raw = String(profile?.salary || '').replace(/[^\d]/g, '')
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0) return formatRupeeMonthly(n)
  const lpa = Number(profile?.dSalary)
  if (Number.isFinite(lpa) && lpa > 0) {
    return formatRupeeMonthly(Math.round((lpa * 100000) / 12))
  }
  return null
}
