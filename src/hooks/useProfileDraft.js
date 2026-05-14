import { useCallback, useMemo, useState } from 'react'

export const INITIAL_PROFILE_DRAFT = {
  // personal
  name: '',
  phone: '',
  email: '',
  // education
  edu: '',
  bd10: '',
  sc10: '',
  bd12: '',
  sc12: '',
  /** 'pct' = % marks, 'cgpa' = CGPA (10-point scale) — per block toggles on Frame 1 */
  edScore10Mode: 'pct',
  edScore12Mode: 'pct',
  edScoreUgMode: 'pct',
  uni: '',
  year: '',
  mode: '',
  spec: '',
  scoreUG: '',
  // work
  exp: 'fresher',
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
  // skills
  ind: '',
  english: '',
  linkedinTier: '',
  projects: '',
  internships: '',
  // dreams
  dRole: '',
  dCompanies: [],
  dSalary: 25,
  dMode: 'both',
  dTarFunc: '',
}

export function useProfileDraft() {
  const [s, setS] = useState(() => ({ ...INITIAL_PROFILE_DRAFT }))

  const resetDraft = useCallback(() => {
    setS({ ...INITIAL_PROFILE_DRAFT })
  }, [])

  const progressPct = useMemo(() => {
    let p = 0
    if (s.name) p += 8
    if (s.phone) p += 4
    if (s.email) p += 4
    if (s.edu) p += 5
    if (s.bd10) p += 4
    if (s.sc10) p += 4
    if (s.bd12) p += 4
    if (s.sc12) p += 4
    if (s.spec) p += 6
    if (s.scoreUG) p += 4
    if (s.mode) p += 3
    if (s.uni) p += 4
    if (s.year) p += 4
    if (s.exp !== 'fresher') p += 8
    if (s.role) p += 6
    if (s.company) p += 4
    if (s.salary) p += 6
    if (s.func) p += 6
    if (s.ind) p += 4
    if (s.english) p += 2
    if (s.linkedinTier) p += 2
    if (s.projects) p += 2
    if (s.internships) p += 2
    return Math.min(p, 100)
  }, [s])

  return useMemo(
    () => ({ s, setS, progressPct, resetDraft }),
    [s, progressPct, resetDraft],
  )
}

