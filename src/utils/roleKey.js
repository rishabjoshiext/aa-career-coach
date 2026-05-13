import { DEFAULT_ROLE, PD } from './pathData.js'
import { inferIndustryFromFreeText } from './destinationMapping.js'

/** Resolve selected destination string to a PD key used across Frames 3–7 */
export function resolvePdRole(selRole) {
  if (selRole && PD[selRole]) return selRole
  const inf = inferIndustryFromFreeText(String(selRole || ''))
  if (inf === 'HR') return 'HR Manager'
  if (inf === 'Finance') return 'Finance Manager'
  return DEFAULT_ROLE
}
