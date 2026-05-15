import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { EDU_MAX_PILLS } from '../data/frame1Education.js'
import { resolvePdRole } from '../utils/roleKey.js'
import { flattenIndustryRoles, INDUSTRIES } from '../utils/fasttrackData.js'
import {
  buildFallbackOnlineCollegePicks,
} from '../utils/onlinePartnerUniversities.js'
import { buildFallbackSpec } from '../utils/specialisationData.js'
import { formatLPA, formatRupeeMonthly, formatSalaryLabelIndian } from '../utils/formatINR.js'

const PATH_LABELS = [
  { key: 'trad', label: 'Traditional' },
  { key: 'fast', label: 'Fast Track' },
  { key: 'accel', label: 'Accelerated' },
]

const ACCENT = '#5b21b6'

/** Profile salary field: treat &lt;100 as LPA, else monthly rupees */
function formatSalaryFromProfile(s) {
  const raw = String(s.salary || '').replace(/,/g, '').trim()
  const n = Number(raw.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n < 100) return `~${formatRupeeMonthly(Math.round((n * 100000) / 12))} (from ${formatLPA(n)})`
  return `~${formatRupeeMonthly(n)}`
}

function targetSalaryLabel(card) {
  if (!card?.sal) return '—'
  return formatSalaryLabelIndian(card.sal)
}

function profileEducationLine(s) {
  const bits = []
  const pill = EDU_MAX_PILLS.find((p) => p.id === s.eduMax)
  if (pill) bits.push(pill.label)
  else if (s.edu === '12') bits.push('Class 12 pathway')
  else if (s.edu === 'UG') bits.push('Undergraduate')
  else if (s.edu === 'PG') bits.push('Postgraduate')
  if (s.degreeEdu) bits.push(s.degreeEdu)
  if (s.spec) bits.push(s.spec)
  if (s.uni) bits.push(s.uni)
  if (s.year) bits.push(`’${String(s.year).slice(-2)}`)
  return bits.length ? bits.join(' · ') : 'Your career profile'
}

function studyModePill(s) {
  if (s.dMode === 'both') return 'WORK + STUDY'
  if (s.dMode === 'break') return 'FULL-TIME STUDY'
  return 'MODE OPEN'
}

export function Frame7() {
  const nav = useNavigate()
  const { s, selIndustry, selRole, gapPath, rPath, rYear, eduBudgetLacs } = useAppState()
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collegePicks, setCollegePicks] = useState([])
  const [collegesLoading, setCollegesLoading] = useState(false)

  const pdKey = resolvePdRole(selRole)
  const destinationTitle = (selRole && String(selRole).trim()) || 'your goal'

  const industryLabel = useMemo(() => {
    const row = INDUSTRIES.find((i) => i.id === selIndustry)
    return row?.n || 'All Functions'
  }, [selIndustry])

  const roleCard = useMemo(() => {
    const flat = flattenIndustryRoles(selIndustry === 'all' ? 'all' : selIndustry)
    const t = (selRole || '').trim()
    return flat.find((c) => c.role === t) || flat.find((c) => c.role === pdKey) || flat[0]
  }, [selRole, selIndustry, pdKey])

  const roleTitle = (selRole || '').trim() || pdKey

  const specProfileSnap = useMemo(
    () => ({
      edu: s.edu,
      spec: s.spec,
      role: s.role,
      func: s.func,
      dRole: s.dRole,
    }),
    [s.edu, s.spec, s.role, s.func, s.dRole],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const next = buildFallbackSpec(destinationTitle, roleCard, specProfileSnap)
      if (!cancelled) {
        setSpec(next)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [roleTitle, industryLabel, roleCard, destinationTitle, specProfileSnap])

  useEffect(() => {
    if (!spec?.title) return undefined
    let cancelled = false
    async function loadColleges() {
      setCollegesLoading(true)
      const picks = buildFallbackOnlineCollegePicks(destinationTitle, spec.title)
      if (!cancelled) {
        setCollegePicks(picks.slice(0, 5))
        setCollegesLoading(false)
      }
    }
    loadColleges()
    return () => {
      cancelled = true
    }
  }, [spec?.title, destinationTitle, industryLabel, roleCard])

  const pathLabel = PATH_LABELS.find((p) => p.key === gapPath)?.label ?? gapPath
  const roiPath = PATH_LABELS.find((p) => p.key === rPath)?.label ?? rPath

  const displayName = (s.name || '').trim() || 'Your name'
  const initial = displayName.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase() || '?'

  const currentTitle = (s.role || '').trim() || 'Current role'
  const currentSub = [s.func, s.company].filter(Boolean).join(' · ') || 'Starting point (from your profile)'

  const anchorDisplay = collegePicks[0] || spec?.anchorUni || '—'

  return (
    <section className="absolute inset-0 overflow-y-auto px-9 pb-10 pt-7" data-app-page-scroll>
      <div className="mx-auto max-w-[880px]">
        <div className="mb-[14px] flex flex-wrap items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
          <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-[3px] text-[#37017B]">7 · Specialisation</span>
          <span className="text-[#ddd]">›</span>
          <span className="text-[#ccc]">{destinationTitle}</span>
        </div>

        <h1 className="mb-3 text-[30px] font-[400] leading-[1.12] tracking-[-0.02em] text-[#0C0C0C] md:text-[34px] [font-family:'DM Serif Display',serif]">
          The specialisation{' '}
          <span className="font-[400] italic" style={{ color: ACCENT }}>
            your gaps.
          </span>
        </h1>
        <p className="mb-7 max-w-[720px] text-[14px] font-[400] leading-[1.6] text-[#555]">
          Based on your gap analysis, here is the exact qualification that covers every critical gap in your profile.
        </p>

        {/* Transition plan card — mirrors prototype + Frame 1 fields */}
        <div className="relative mb-5 overflow-hidden rounded-[16px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(160deg,#FFFFFF_0%,#FBFAFE_55%,#F4EEFE_100%)] shadow-[0_4px_18px_rgba(55,1,123,.06)]">
          <div className="h-[4px] bg-[linear-gradient(90deg,#FFD700_0%,#48DB85_35%,#a855f7_55%,#37017B_78%,#7504FF_100%)] bg-[length:200%_100%]" />
          <div className="relative z-[1] grid gap-4 px-[18px] py-4 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex items-center gap-3 border-b border-dashed border-[rgba(55,1,123,.14)] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5">
              <div className="relative flex h-[54px] w-[46px] flex-shrink-0 items-center justify-center rounded-[7px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.08))] [font-family:'DM Serif Display',serif] text-[21px] text-[#37017B] shadow-[inset_0_0_0_2px_rgba(255,255,255,.6)]">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="[font-family:'DM Serif Display',serif] text-[17px] font-[400] tracking-[-0.01em] text-[#0C0C0C]">
                  {displayName}
                </div>
                <div className="mt-1 text-[11px] font-[500] leading-snug text-[#777]">{profileEducationLine(s)}</div>
                {s.ind ? <div className="mt-0.5 text-[10px] font-[500] text-[#999]">Industry: {s.ind}</div> : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.spec ? (
                    <span className="rounded-[4px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-2 py-0.5 text-[8.5px] font-[800] uppercase tracking-[.06em] text-[#37017B]">
                      {s.spec}
                    </span>
                  ) : (
                    <span
                      className="rounded-[4px] border border-[rgba(0,0,0,.08)] bg-[rgba(0,0,0,.04)] px-2 py-0.5 text-[11px] font-[700] text-[#999]"
                      title="Add specialisation in profile"
                    >
                      —
                    </span>
                  )}
                  <span className="rounded-[4px] border border-[rgba(72,219,133,.22)] bg-[rgba(72,219,133,.1)] px-2 py-0.5 text-[8.5px] font-[800] uppercase tracking-[.06em] text-[#15803d]">
                    {studyModePill(s)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <div className="text-[8.5px] font-[800] uppercase tracking-[.1em] text-[#bbb]">Currently</div>
                <div className="truncate text-[14px] font-[800] text-[#0C0C0C]">{currentTitle}</div>
                <div className="text-[11px] font-[600] text-[#888]">{currentSub}</div>
                <div className="mt-1 text-[10px] font-[600] text-[#999]">{formatSalaryFromProfile(s)}</div>
              </div>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#37017B,#7504FF)] text-[13px] font-[900] text-white shadow-[0_4px_12px_rgba(55,1,123,.3)]">
                →
              </div>
              <div>
                <div className="text-[8.5px] font-[800] uppercase tracking-[.1em]" style={{ color: ACCENT }}>
                  Target
                </div>
                <div className="truncate text-[14px] font-[800]" style={{ color: ACCENT }}>
                  {destinationTitle}
                </div>
                <div className="text-[11px] font-[600] text-[#888]">Typical band</div>
                <div className="mt-1 text-[10px] font-[600] text-[#666]">{targetSalaryLabel(roleCard)}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-dashed border-[rgba(55,1,123,.12)] px-[18px] py-2">
            <div className="flex items-center gap-1.5 text-[8.5px] font-[800] tracking-[.07em] text-[#22c55e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              Active counselling session
            </div>
          </div>
        </div>

        {loading || !spec ? (
          <div className="mb-4 h-[200px] animate-pulse rounded-[18px] bg-[rgba(55,1,123,.12)]" />
        ) : (
          <>
            <div className="relative mb-5 overflow-hidden rounded-[18px] bg-[linear-gradient(130deg,#4c1d95,#7c3aed)] px-7 py-7 text-white shadow-[0_12px_40px_rgba(76,29,149,.25)]">
              <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:34px_34px]" />
              <div className="relative z-[1]">
                <div className="mb-2 text-[10px] font-[800] uppercase tracking-[.12em] text-[rgba(255,255,255,.58)]">
                  Recommended specialisation
                </div>
                <div className="[font-family:'DM Serif Display',serif] text-[26px] font-[400] leading-[1.15] tracking-[-0.02em] md:text-[28px]">
                  {spec.title}
                </div>
                <p className="mt-3 max-w-[640px] text-[13px] font-[400] leading-[1.55] text-[rgba(255,255,255,.78)]">
                  {spec.subtitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {spec.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-[20px] border border-[rgba(255,255,255,.18)] bg-[rgba(255,255,255,.12)] px-3.5 py-1.5 text-[11px] font-[600] backdrop-blur-[2px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[13px] border border-[rgba(0,0,0,.07)] bg-white p-4 shadow-[0_1px_10px_rgba(0,0,0,.04)]">
                <div className="mb-3 text-[14px] font-[700] text-[#0C0C0C]">What you study</div>
                <div className="space-y-0">
                  {spec.curriculum.map((line, i) => (
                    <div
                      key={line}
                      className="flex items-center gap-2 border-b border-[rgba(0,0,0,.07)] py-2.5 last:border-b-0"
                    >
                      <span className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(55,1,123,.09)] text-[9px] font-[800] text-[#37017B]">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-[11.5px] font-[500] leading-snug text-[#333]">{line}</span>
                      <span className="flex-shrink-0 text-[10px] font-[600] text-[#bbb]">Sem {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[13px] border border-[rgba(0,0,0,.07)] bg-white p-4 shadow-[0_1px_10px_rgba(0,0,0,.04)]">
                <div className="mb-3 text-[14px] font-[700] text-[#0C0C0C]">What you walk away with</div>
                <div className="space-y-0">
                  {spec.outcomes.map((o) => (
                    <div key={o} className="flex items-start gap-2 border-b border-[rgba(0,0,0,.07)] py-2.5 last:border-b-0">
                      <span className="text-[12px] font-[700]" style={{ color: ACCENT }}>
                        →
                      </span>
                      <span className="text-[11.5px] font-[500] leading-snug text-[#333]">{o}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[9px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-[700] text-[#37017B]">{anchorDisplay}</div>
                    <div className="text-[10px] text-[#666]">Anchor partner · UGC online / ODL (verify current approvals)</div>
                  </div>
                  <button
                    type="button"
                    className="flex-shrink-0 text-[12px] font-[600] text-[#37017B] underline decoration-[rgba(55,1,123,.4)]"
                    title="Demo — brochure in live product"
                  >
                    Programme brochure
                  </button>
                </div>

                <div className="mt-4 border-t border-dashed border-[rgba(0,0,0,.1)] pt-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-[800] uppercase tracking-[.08em] text-[#888] after:flex-1 after:h-px after:bg-[repeating-linear-gradient(90deg,rgba(0,0,0,.06)_0_2px,transparent_2px_5px)] after:content-['']">
                    Strong online options for this role (max 5)
                  </div>
                  {collegesLoading ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[1, 2, 3, 4, 5].map((k) => (
                        <div key={k} className="h-[52px] animate-pulse rounded-[9px] bg-[rgba(0,0,0,.04)]" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {collegePicks.map((uni) => (
                        <div
                          key={uni}
                          className="rounded-[9px] border border-[rgba(0,0,0,.08)] bg-[rgba(250,249,244,.6)] px-3 py-2.5"
                        >
                          <div className="text-[11.5px] font-[800] leading-snug text-[#0C0C0C]">{uni}</div>
                          <div className="mt-1 text-[9.5px] font-[600] text-[#888]">Online / ODL · India</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 rounded-[8px] bg-[rgba(0,0,0,.03)] px-3 py-2.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#888]">Open job postings (India)</span>
                    <span className="font-[700]">{spec.jobs}</span>
                  </div>
                  <div className="my-1.5 h-[3px] overflow-hidden rounded-[2px] bg-[rgba(0,0,0,.06)]">
                    <div
                      className="h-full rounded-[2px] bg-[linear-gradient(90deg,#37017B,#7c3aed)] transition-all duration-700"
                      style={{ width: `${spec.demandPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#888]">5-yr demand growth (postings)</span>
                    <span className="font-[700]">{spec.growth}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px]">
                    <span className="text-[#888]">Supply note</span>
                    <span className="max-w-[55%] text-right font-[700] text-[#b45309]">{spec.gap}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="rounded-[14px] border border-[rgba(0,0,0,.06)] bg-[linear-gradient(180deg,#fff,rgba(250,249,244,.95))] p-5">
          <div className="mb-2 text-[11px] font-[800] uppercase tracking-[.1em] text-[#888]">Journey recap</div>
          <div className="grid gap-3 text-[13px] sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-[700] uppercase tracking-[.06em] text-[#aaa]">Destination</div>
              <div className="font-[800]" style={{ color: ACCENT }}>
                {destinationTitle}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-[700] uppercase tracking-[.06em] text-[#aaa]">Path preference</div>
              <div className="font-[700]">{pathLabel}</div>
            </div>
            <div>
              <div className="text-[10px] font-[700] uppercase tracking-[.06em] text-[#aaa]">ROI view</div>
              <div className="font-[700]">
                {roiPath} · {rYear} yr · ₹{eduBudgetLacs}L budget
              </div>
            </div>
            <div>
              <div className="text-[10px] font-[700] uppercase tracking-[.06em] text-[#aaa]">Recommended track</div>
              <div className="font-[700] text-[#0C0C0C]">{spec?.title ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(0,0,0,.06)] pt-6">
          <p className="max-w-[420px] text-[11px] leading-[1.5] text-[#aaa]">
            Programme choice is advisory — your counsellor validates fit, intake dates, and financing. Nothing here is an
            admission guarantee.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" className="rounded-[999px]" onClick={() => nav('/6')}>
              ← Back
            </Button>
            <Button className="rounded-[999px]" onClick={() => nav('/8')}>
              Wrap Up Session →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
