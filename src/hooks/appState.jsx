import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useProfileDraft } from './useProfileDraft.js'

const Ctx = createContext(null)

export function AppStateProvider({ children }) {
  const { resetDraft, ...draft } = useProfileDraft()
  const [selIndustry, setSelIndustry] = useState('all')
  const [selRole, setSelRole] = useState(null)
  const [pathLoading, setPathLoading] = useState(false)
  /** Frame 4–5: which career path variant is selected for gaps / ROI */
  const [gapPath, setGapPath] = useState('accel')
  /** Frame 5: ROI chart highlights this path (defaults with gapPath) */
  const [rPath, setRPath] = useState('accel')
  /** Frame 5: horizon in years */
  const [rYear, setRYear] = useState(5)
  /** Education + upskilling budget (₹ Lacs) — shared F4 → F5 */
  const [eduBudgetLacs, setEduBudgetLacs] = useState(4.5)
  /** Incremented on resetSession so Frame1 remounts and drops local UI state. */
  const [sessionEpoch, setSessionEpoch] = useState(0)
  /** Accelerated-path bottom sheet (Frames 4+) */
  const [pathDrawerOpen, setPathDrawerOpen] = useState(false)

  const openPathDrawer = useCallback(() => setPathDrawerOpen(true), [])
  const closePathDrawer = useCallback(() => setPathDrawerOpen(false), [])

  const resetSession = useCallback(() => {
    resetDraft()
    setSelIndustry('all')
    setSelRole(null)
    setPathLoading(false)
    setGapPath('accel')
    setRPath('accel')
    setRYear(5)
    setEduBudgetLacs(4.5)
    setPathDrawerOpen(false)
    setSessionEpoch((e) => e + 1)
  }, [resetDraft])

  const value = useMemo(
    () => ({
      ...draft,
      resetSession,
      sessionEpoch,
      selIndustry,
      setSelIndustry,
      selRole,
      setSelRole,
      pathLoading,
      setPathLoading,
      gapPath,
      setGapPath,
      rPath,
      setRPath,
      rYear,
      setRYear,
      eduBudgetLacs,
      setEduBudgetLacs,
      pathDrawerOpen,
      openPathDrawer,
      closePathDrawer,
    }),
    [
      draft,
      resetSession,
      sessionEpoch,
      selIndustry,
      selRole,
      pathLoading,
      gapPath,
      rPath,
      rYear,
      eduBudgetLacs,
      pathDrawerOpen,
      openPathDrawer,
      closePathDrawer,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAppState must be used within AppStateProvider')
  return v
}

