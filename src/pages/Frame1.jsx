import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiveProfileCard } from '../components/LiveProfileCard.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { Frame1EducationSection } from '../components/profile/Frame1EducationSection.jsx'
import { Frame1WorkSection } from '../components/profile/Frame1WorkSection.jsx'
import { Frame1SkillsSection } from '../components/profile/Frame1SkillsSection.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Label } from '../components/ui/Label.jsx'
import { ToggleButton, ToggleGroup } from '../components/ui/Toggle.jsx'
import { RunLoadOverlay } from '../components/loaders/RunLoadOverlay.jsx'
import { EDU_BRANCH_COLLEGE, EDU_BRANCH_SCHOOL_ONLY, EDU_PROGRAM_MODE_VALUES } from '../data/frame1Education.js'
import { isListedIndustry, searchWorkEmployers, searchWorkRoles } from '../data/workExperienceData.js'
import { aspirationTargetIndustryId } from '../utils/destinationMapping.js'
import { DropdownLayer } from '../components/ui/DropdownLayer.jsx'

function isValidTenDigitPhone(phone) {
  return /^\d{10}$/.test(String(phone ?? '').trim())
}

function isValidEmail(email) {
  const t = String(email ?? '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

export function Frame1() {
  const nav = useNavigate()
  const { s, setS, progressPct } = useAppState()
  const [panel, setPanel] = useState('profile') // profile | dreams
  const [dCoQ, setDCoQ] = useState('')
  const [dCoOpen, setDCoOpen] = useState(false)
  const dCoWrapRef = useRef(null)
  const dCoInpRef = useRef(null)

  const [dRoleQ, setDRoleQ] = useState(() => s.dRole || '')
  const [dRoleFocused, setDRoleFocused] = useState(false)
  const dRoleWrapRef = useRef(null)

  const [toDestLoading, setToDestLoading] = useState(false)

  const dreamSalaryClamped = useMemo(() => {
    const n = Number(s.dSalary)
    return Number.isFinite(n) ? Math.min(50, Math.max(5, Math.round(n))) : 25
  }, [s.dSalary])

  const dreamSalaryFillPct = useMemo(() => ((dreamSalaryClamped - 5) / 45) * 100, [dreamSalaryClamped])

  const dRoleHits = useMemo(() => searchWorkRoles(dRoleQ, 48), [dRoleQ])
  const showDreamRoleDd = dRoleFocused && (dRoleQ || '').trim().length > 0 && dRoleHits.length > 0

  useEffect(() => {
    if (!dRoleFocused) return
    const down = (ev) => {
      if (!dRoleWrapRef.current) return
      if (dRoleWrapRef.current.contains(ev.target)) return
      if (ev.target.closest?.('[data-autocomplete-layer]')) return
      setDRoleFocused(false)
      setDRoleQ(s.dRole || '')
    }
    window.addEventListener('mousedown', down)
    return () => window.removeEventListener('mousedown', down)
  }, [dRoleFocused, s.dRole])

  useEffect(() => {
    const n = Number(s.dSalary)
    if (!Number.isFinite(n) || n < 5 || n > 50) {
      setS((p) => ({ ...p, dSalary: dreamSalaryClamped }))
      return
    }
    if (Math.round(n) !== n) {
      setS((p) => ({ ...p, dSalary: Math.round(n) }))
    }
  }, [s.dSalary, dreamSalaryClamped, setS])

  const dreamMonthly = useMemo(() => {
    const v = dreamSalaryClamped
    return Math.round((v * 100000) / 12).toLocaleString('en-IN')
  }, [dreamSalaryClamped])

  const dreamSummary = useMemo(() => {
    const parts = []
    if (s.dRole) parts.push(`<strong>${s.dRole}</strong>`)
    if (s.dCompanies.length) parts.push(`at ${s.dCompanies.map((c) => `<strong>${c}</strong>`).join(' / ')}`)
    if (s.dSalary) parts.push(`earning <strong>₹${dreamSalaryClamped}L/yr</strong>`)
    if (s.dMode === 'both') parts.push('without taking a break from work')
    else if (s.dMode === 'break') parts.push('via a focused full-time degree')
    return parts.length ? parts.join(' ') : ''
  }, [s.dCompanies, s.dMode, s.dRole, s.dSalary, dreamSalaryClamped])

  const dCoMatches = useMemo(() => {
    const q = (dCoQ || '').trim()
    if (!q || s.dCompanies.length >= 3) return []
    return searchWorkEmployers(dCoQ, 28).filter((c) => !s.dCompanies.includes(c))
  }, [dCoQ, s.dCompanies])

  useEffect(() => {
    const onDown = (ev) => {
      if (!dCoWrapRef.current) return
      if (dCoWrapRef.current.contains(ev.target)) return
      if (ev.target.closest?.('[data-autocomplete-layer]')) return
      setDCoOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [])

  const profileReadyForDreams = useMemo(() => {
    const p = s
    if (!String(p.name || '').trim()) return false
    if (!isValidTenDigitPhone(p.phone)) return false
    if (!isValidEmail(p.email)) return false
    if (!p.eduMax) return false
    if (EDU_BRANCH_SCHOOL_ONLY.has(p.eduMax)) {
      if (!String(p.schoolMedium || '').trim()) return false
    } else if (EDU_BRANCH_COLLEGE.has(p.eduMax)) {
      if (!String(p.uni || '').trim()) return false
      if (p.eduMax === 'iti') {
        if (p.degreeEdu !== 'ITI') return false
      } else if (!String(p.degreeEdu || '').trim()) {
        return false
      }
      if (!String(p.spec || '').trim()) return false
      if (!String(p.year || '').trim()) return false
      if (!String(p.schoolMedium || '').trim()) return false
      if (!EDU_PROGRAM_MODE_VALUES.has(p.eduStudyMode)) return false
    } else {
      return false
    }

    if (!p.exp || String(p.exp).trim() === '') return false
    if (p.exp !== 'fresher') {
      if (p.totalExpYears === '' || p.totalExpYears == null) return false
      const y = parseInt(String(p.totalExpYears), 10)
      const m = p.totalExpMonths === '' || p.totalExpMonths == null ? 0 : parseInt(String(p.totalExpMonths), 10)
      if (!Number.isFinite(y) || y < 0 || y > 50) return false
      if (!Number.isFinite(m) || m < 0 || m > 11) return false
      if (y * 12 + m < 1) return false
      if (!String(p.company || '').trim()) return false
      if (!isListedIndustry(p.ind)) return false
      if (!String(p.role || '').trim()) return false
      const sal = parseInt(String(p.salary || '').replace(/\D/g, ''), 10)
      if (!Number.isFinite(sal) || sal < 1000) return false
    }

    if (!Array.isArray(p.selectedSkills) || p.selectedSkills.length < 2) return false
    if (!String(p.english || '').trim()) return false
    if (!String(p.linkedinTier || '').trim()) return false

    return true
  }, [s])

  const dreamsReady = useMemo(() => {
    if (!String(s.dRole || '').trim()) return false
    if (!Array.isArray(s.dCompanies) || s.dCompanies.length < 1) return false
    if (!s.dMode) return false
    const n = Number(s.dSalary)
    if (!Number.isFinite(n)) return false
    if (n < 5 || n > 50) return false
    return true
  }, [s.dRole, s.dCompanies, s.dMode, s.dSalary])

  const readyForAnalyse = profileReadyForDreams && dreamsReady

  const addDreamCo = (c) => {
    const v = c.trim()
    if (!v) return
    setS((p) => (p.dCompanies.includes(v) || p.dCompanies.length >= 3 ? p : { ...p, dCompanies: [...p.dCompanies, v] }))
    setDCoQ('')
    setDCoOpen(false)
    window.setTimeout(() => dCoInpRef.current?.focus(), 0)
  }

  const removeDreamCo = (c) => {
    setS((p) => ({ ...p, dCompanies: p.dCompanies.filter((x) => x !== c) }))
    window.setTimeout(() => dCoInpRef.current?.focus(), 0)
  }

  return (
    <section className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7" data-app-page-scroll>
        <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {/* Sub-flow indicator */}
            <div className="mb-[14px] flex items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
              <div
                className={[
                  'rounded-[20px] bg-[rgba(0,0,0,.04)] px-[10px] py-[3px]',
                  panel === 'profile' ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]' : '',
                ].join(' ')}
              >
                1 · Profile
              </div>
              <span className="text-[#ddd]">›</span>
              <div
                className={[
                  'rounded-[20px] bg-[rgba(0,0,0,.04)] px-[10px] py-[3px]',
                  panel === 'dreams' ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]' : '',
                ].join(' ')}
              >
                2 · Aspirations
              </div>
            </div>

            {/* PANEL 1A — PROFILE */}
            {panel === 'profile' && (
              <div>
                <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
                  Let&apos;s start with <em className="text-[#37017B] not-italic">the essentials.</em>
                </div>
                <div className="mb-6 text-[13px] leading-[1.55] text-[#555]">
                  A few details are enough to tailor your journey. You can refine more later as you explore options.
                </div>

                <div className="flex flex-col gap-[11px]">
                  {/* Personal */}
                  <div className="mb-[8px] mt-[6px] flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      1
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Personal</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div>
                      <Label required>Full Name</Label>
                      <Input value={s.name} onChange={(e) => setS((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Rohan Mehta" />
                    </div>
                    <div>
                      <Label required>Phone</Label>
                      <Input
                        value={s.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setS((p) => ({ ...p, phone: digits }))
                        }}
                        placeholder="10-digit mobile"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        title="Enter exactly 10 digits (numbers only)"
                      />
                      {s.phone && s.phone.length < 10 ? (
                        <div className="mt-1 text-[10px] font-[600] text-[#b45309]">Enter all 10 digits (numbers only).</div>
                      ) : null}
                    </div>
                    <div>
                      <Label required>Email</Label>
                      <Input
                        type="email"
                        value={s.email}
                        onChange={(e) => setS((p) => ({ ...p, email: e.target.value }))}
                        placeholder="rohan@example.com"
                      />
                    </div>
                  </div>

                  <Frame1EducationSection s={s} setS={setS} />
                  <Frame1WorkSection s={s} setS={setS} />
                  <Frame1SkillsSection s={s} setS={setS} />
                </div>

                <div className="mt-[22px] flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
                  <Button disabled={!profileReadyForDreams} onClick={() => profileReadyForDreams && setPanel('dreams')}>
                    Continue to Aspirations →
                  </Button>
                  {!profileReadyForDreams ? (
                    <span className="text-[11px] font-[600] text-[#b45309]">Complete all required fields (*) to continue.</span>
                  ) : null}
                </div>
              </div>
            )}

            {/* PANEL 1B — DREAMS */}
            {panel === 'dreams' && (
              <div>
                <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
                  Now — what are <em className="text-[#37017B] not-italic">your aspirations?</em>
                </div>
                <div className="mb-6 text-[13px] leading-[1.55] text-[#555]">
                  No wrong answers. We use these to weight destinations by ambition and realistic salary bands — so the paths
                  you see are not undershooting where you want to land.
                </div>

                <div className="flex flex-col gap-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      1
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Role</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">
                      What role would feel like a real win 5 years from now?
                    </div>
                  </div>
                  <Label required>Dream role</Label>
                  <div ref={dRoleWrapRef} className="relative">
                    <div
                      className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                      onMouseDown={() => setDRoleFocused(true)}
                    >
                      <input
                        value={dRoleQ}
                        onChange={(e) => {
                          const v = e.target.value
                          setDRoleQ(v)
                          setS((p) => ({ ...p, dRole: v }))
                        }}
                        onFocus={() => setDRoleFocused(true)}
                        onBlur={() => window.setTimeout(() => setDRoleFocused(false), 180)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (dRoleHits[0]) {
                              setS((p) => ({ ...p, dRole: dRoleHits[0] }))
                              setDRoleQ(dRoleHits[0])
                            }
                            setDRoleFocused(false)
                            return
                          }
                          if (e.key === 'Escape') setDRoleFocused(false)
                        }}
                        placeholder="Type or pick — e.g. Finance Manager"
                        className="w-full border-0 bg-transparent px-0 py-[3px] text-[13px] outline-none placeholder:text-[#ccc]"
                        autoComplete="off"
                      />
                    </div>
                    <DropdownLayer open={showDreamRoleDd} anchorRef={dRoleWrapRef}>
                      {dRoleHits.map((r) => (
                        <button
                          key={r}
                          type="button"
                          className="block w-full rounded-[6px] px-[10px] py-[7px] text-left text-[12px] text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)]"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => {
                            setS((p) => ({ ...p, dRole: r }))
                            setDRoleQ(r)
                            setDRoleFocused(false)
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </DropdownLayer>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      2
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Companies</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">Pick 1–3</div>
                  </div>
                  <Label required>Dream companies</Label>
                  <div ref={dCoWrapRef} className="relative">
                    <div
                      className="min-h-[42px] rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[11px] py-[8px]"
                      onMouseDown={() => window.setTimeout(() => dCoInpRef.current?.focus(), 0)}
                    >
                      <div className="flex flex-wrap items-center gap-[6px]">
                        {s.dCompanies.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-[6px] rounded-[20px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-[10px] py-[4px] text-[11px] font-[600] text-[#37017B]"
                          >
                            {c}
                            <button
                              className="text-[13px] leading-none text-[#37017B]/60 hover:text-[#37017B]"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={(ev) => {
                                ev.preventDefault()
                                removeDreamCo(c)
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <input
                          ref={dCoInpRef}
                          disabled={s.dCompanies.length >= 3}
                          value={dCoQ}
                          onChange={(e) => {
                            setDCoQ(e.target.value)
                            setDCoOpen(true)
                          }}
                          onFocus={() => setDCoOpen(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (dCoMatches.length) addDreamCo(dCoMatches[0])
                              else addDreamCo(dCoQ)
                              return
                            }
                            if (e.key === 'Backspace' && !dCoQ && s.dCompanies.length) {
                              setS((p) => ({ ...p, dCompanies: p.dCompanies.slice(0, -1) }))
                            }
                            if (e.key === 'Escape') setDCoOpen(false)
                          }}
                          placeholder={
                            s.dCompanies.length === 0
                              ? 'Type a company name…'
                              : s.dCompanies.length >= 3
                                ? 'Maximum 3 companies'
                                : 'Add another…'
                          }
                          className="min-w-[120px] flex-1 border-0 bg-transparent px-0 py-[3px] text-[12px] outline-none placeholder:text-[#ccc] disabled:cursor-not-allowed disabled:text-[#bbb]"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <DropdownLayer
                      open={dCoOpen && dCoMatches.length > 0 && s.dCompanies.length < 3}
                      anchorRef={dCoWrapRef}
                    >
                      {dCoMatches.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="block w-full rounded-[6px] px-[10px] py-[6px] text-left text-[12px] text-[#0C0C0C] hover:bg-[rgba(55,1,123,.07)] hover:text-[#37017B]"
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => addDreamCo(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </DropdownLayer>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      3
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Dream Salary</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">By Year 5 (LPA)</div>
                  </div>
                  <Label required>Target package</Label>
                  <div className="rounded-[11px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-4 py-[14px]">
                    <div className="mb-[11px] flex items-baseline justify-between">
                      <div className="[font-family:'DM Serif Display',serif] text-[24px] text-[#37017B]">
                        ₹<span className="tabular-nums">{dreamSalaryClamped}</span>
                        <span className="ml-[3px] font-[600] text-[#555] [font-family:Outfit,system-ui,sans-serif]">
                          LPA
                        </span>
                      </div>
                      <div className="text-[10px] font-[600] text-[#bbb]">
                        ≈ ₹<span className="tabular-nums">{dreamMonthly}</span>/mo
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={dreamSalaryClamped}
                      onChange={(e) => setS((p) => ({ ...p, dSalary: Number(e.target.value) }))}
                      className="dream-salary-range w-full cursor-pointer"
                      style={{ '--fill-pct': `${dreamSalaryFillPct}%` }}
                    />
                    <div className="mt-[6px] flex justify-between text-[9px] font-[600] text-[#ccc]">
                      <span>5L</span>
                      <span>15L</span>
                      <span>25L</span>
                      <span>35L</span>
                      <span>50L+</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(55,1,123,.07)] text-[11px] font-[800] text-[#37017B] [font-family:'DM Serif Display',serif]">
                      4
                    </div>
                    <div className="text-[13px] font-[800] tracking-[-.01em] text-[#0C0C0C]">Preferred Mode</div>
                    <div className="ml-auto text-[10.5px] text-[#bbb]">If a degree becomes part of the plan</div>
                  </div>
                  <Label required>Preferred mode</Label>
                  <ToggleGroup>
                    <ToggleButton active={s.dMode === 'both'} onClick={() => setS((p) => ({ ...p, dMode: 'both' }))}>
                      Work + Study (no break)
                    </ToggleButton>
                    <ToggleButton active={s.dMode === 'break'} onClick={() => setS((p) => ({ ...p, dMode: 'break' }))}>
                      Career break — full-time degree
                    </ToggleButton>
                    <ToggleButton active={s.dMode === 'uns'} onClick={() => setS((p) => ({ ...p, dMode: 'uns' }))}>
                      Not sure yet
                    </ToggleButton>
                  </ToggleGroup>

                  <div className="mt-[14px] rounded-[11px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.04))] px-4 py-[13px]">
                    <div className="mb-[6px] text-[10px] font-[800] uppercase tracking-[.07em] text-[#37017B]">
                      Compiled aspiration
                    </div>
                    <div
                      className="text-[12px] leading-[1.55] text-[#0C0C0C]"
                      dangerouslySetInnerHTML={{
                        __html: dreamSummary || 'Fill in above and your goals appear here.',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-[22px] flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-[10px]">
                  <Button variant="ghost" onClick={() => setPanel('profile')}>
                    ← Back to Profile
                  </Button>
                  <Button disabled={!readyForAnalyse} onClick={() => readyForAnalyse && setToDestLoading(true)}>
                    Analyse My Profile →
                  </Button>
                  {!readyForAnalyse ? (
                    <span className="text-[11px] font-[600] text-[#b45309]">
                      {!profileReadyForDreams
                        ? 'Profile is incomplete — fix required fields on step 1.'
                        : 'Complete every aspiration field (*) before analysing.'}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Right sticky card */}
          <div>
            <LiveProfileCard s={s} progressPct={progressPct} />
          </div>
        </div>
      </div>

      <RunLoadOverlay
        open={toDestLoading}
        variant="profile"
        totalMs={7200}
        onDone={() => {
          setToDestLoading(false)
          setS((p) => ({
            ...p,
            func: (p.func && String(p.func).trim()) || aspirationTargetIndustryId(p) || p.func,
            role: (p.role && String(p.role).trim()) || (p.dRole && String(p.dRole).trim() ? p.dRole : p.role),
          }))
          nav('/2')
        }}
      />
    </section>
  )
}

