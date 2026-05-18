/** Personal development items per recommended online degree (from perdonalDev.js). */

import degreePersonalDev from './perdonalDev.js'

/** @returns {{ skill: string, subtext: string, type: string }[]} */
export function getDegreePersonalDev(degree) {
  const key = String(degree || '').trim()
  if (degreePersonalDev[key]) return degreePersonalDev[key]
  if (degreePersonalDev['Online BBA']) return degreePersonalDev['Online BBA']
  return []
}
