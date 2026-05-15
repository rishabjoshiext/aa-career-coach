import { useCallback, useMemo, useState } from 'react'

export const INITIAL_PROFILE_DRAFT = {
  // personal
  name: '',
  phone: '',
  email: '',
  // education (simplified)
  /** @type {'' | '10_below' | '12_pass' | 'diploma' | 'iti' | 'graduate' | 'postgraduate'} */
  eduMax: '',
  /** Legacy: '12' | 'UG' | 'PG' — synced from eduMax for downstream frames */
  edu: '',
  schoolMedium: '',
  /** College / institute name (typeahead or free text) */
  uni: '',
  /** Degree / programme (ITI, UG, or PG list) */
  degreeEdu: '',
  spec: '',
  year: '',
  /** College track: programme mode — `regular_full_time` | `part_time` | `distance_online` | `open_school` */
  eduStudyMode: '',
  /** Total tenure (when not fresher): year part 0–40 from Frame 1 work drawer */
  totalExpYears: '',
  /** Optional months 0–11 */
  totalExpMonths: '',
  exp: '',
  func: '',
  role: '',
  level: 'IC',
  company: '',
  yrsCur: '',
  salary: '',
  hasPrev: false,
  prevRole: '',
  prevCo: '',
  prevYrs: '',
  prevWhy: '',
  prevSal: '',
  // skills (Frame 1 — chips + English + LinkedIn)
  ind: '',
  /** @type {string[]} */
  selectedSkills: [],
  english: '',
  linkedinTier: '',
  // dreams
  dRole: '',
  dCompanies: [],
  dSalary: 25,
  dMode: 'both',
  dTarFunc: '',
}

function profileProgressStarted(s) {
  const t = (v) => String(v ?? '').trim()
  if (t(s.name) || t(s.phone) || t(s.email)) return true
  if (s.eduMax) return true
  if (t(s.schoolMedium) || t(s.uni) || t(s.degreeEdu) || t(s.spec) || t(s.year) || t(s.eduStudyMode)) return true
  if (s.exp === 'fresher') return true
  if (s.exp && s.exp !== 'fresher') return true
  if (t(s.totalExpYears) || t(s.totalExpMonths)) return true
  if (t(s.role) || t(s.company) || t(s.salary) || t(s.func) || t(s.yrsCur)) return true
  if ((s.selectedSkills && s.selectedSkills.length) || t(s.ind) || t(s.english) || t(s.linkedinTier)) return true
  if (s.hasPrev) return true
  if (t(s.dRole) || (s.dCompanies && s.dCompanies.length)) return true
  return false
}

export function useProfileDraft() {
  const [s, setS] = useState(() => ({ ...INITIAL_PROFILE_DRAFT }))

  const resetDraft = useCallback(() => {
    setS({ ...INITIAL_PROFILE_DRAFT })
  }, [])

  const progressPct = useMemo(() => {
    if (!profileProgressStarted(s)) return 0
    const t = (v) => String(v ?? '').trim()
    let p = 0
    if (s.name) p += 12
    if (s.phone && /^\d{10}$/.test(String(s.phone).trim())) p += 10
    if (s.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s.email).trim())) p += 10
    if (s.eduMax) p += 12
    if (s.schoolMedium) p += 10
    if (s.uni) p += 10
    if (s.degreeEdu) p += 8
    if (s.spec) p += 10
    if (s.year) p += 8
    if (String(s.exp || '') && s.exp !== 'fresher') {
      if (t(s.totalExpYears)) p += 5
      if (t(s.company)) p += 5
      if (t(s.ind)) p += 5
      if (t(s.role)) p += 5
      if (t(s.salary)) p += 5
    }
    if (s.selectedSkills && s.selectedSkills.length >= 2) p += 4
    else if (s.selectedSkills && s.selectedSkills.length === 1) p += 2
    if (s.english) p += 3
    if (s.linkedinTier) p += 3
    return Math.min(p, 100)
  }, [s])

  return useMemo(
    () => ({ s, setS, progressPct, resetDraft }),
    [s, progressPct, resetDraft],
  )
}
