import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { resolvePdRole } from '../utils/roleKey.js'
import { flattenIndustryRoles, INDUSTRIES } from '../utils/fasttrackData.js'
import { PD } from '../utils/pathData.js'
import {
  buildFallbackGaps,
  getStaticGapsForRole,
} from '../utils/gapAnalysisOpenAI.js'
import { formatCountIN, formatRupee, formatRupeeMonthly } from '../utils/formatINR.js'

const GAP_PATH = 'accel'

const CAT_META = {
  edu: { title: 'Education', icon: '📚', iconBg: 'bg-[rgba(184,48,0,.08)]' },
  skill: { title: 'Skills & Tools', icon: '🛠️', iconBg: 'bg-[rgba(55,1,123,.08)]' },
  exp: { title: 'Experience', icon: '⏱️', iconBg: 'bg-[rgba(202,138,4,.1)]' },
  dev: { title: 'Personal Development', icon: '🌱', iconBg: 'bg-[rgba(16,185,129,.08)]' },
}

const GAP_CATS = ['edu', 'skill', 'exp', 'dev']

/** skill and dev items get a per-item counselor assess dropdown */
const ASSESSABLE_CATS = new Set(['skill', 'dev'])

const ITEM_ASSESS_OPTS = [
  { value: '', label: 'Assess →' },
  { value: 'qual', label: '✓ Qualified' },
  { value: 'miss', label: '✗ Missing' },
  { value: 'crit', label: '✗ Critical gap' },
  { value: 'need', label: '~ Partial' },
]

function pillUi(pill) {
  if (pill === 'crit') return 'border-[rgba(239,68,68,.35)] bg-[rgba(239,68,68,.08)] text-[#b91c1c]'
  if (pill === 'miss') return 'border-[rgba(245,158,11,.4)] bg-[rgba(245,158,11,.1)] text-[#b45309]'
  if (pill === 'qual') return 'border-[rgba(5,150,105,.35)] bg-[rgba(5,150,105,.08)] text-[#059669]'
  if (pill === 'unass') return 'border-[rgba(0,0,0,.12)] bg-[rgba(0,0,0,.03)] text-[#bbb]'
  return 'border-[rgba(59,130,246,.35)] bg-[rgba(59,130,246,.08)] text-[#1d4ed8]'
}

function pillText(pill) {
  if (pill === 'crit') return 'Critical gap'
  if (pill === 'miss') return 'Missing'
  if (pill === 'qual') return 'Qualified'
  if (pill === 'unass') return 'Not assessed'
  if (pill === 'need') return 'Partial'
  return 'Needed'
}

function impBadgeUi(cls) {
  if (cls === 'red') return 'bg-[rgba(184,48,0,.08)] text-[#b83000]'
  if (cls === 'amber') return 'bg-[rgba(202,138,4,.08)] text-[#b45309]'
  return 'bg-[rgba(16,185,129,.08)] text-[#059669]'
}

function giBoxUi(pill) {
  if (pill === 'crit') return 'border-[#b83000] bg-[rgba(184,48,0,.07)]'
  if (pill === 'miss') return 'border-[#ca8a04] bg-[rgba(202,138,4,.07)]'
  if (pill === 'qual') return 'border-[#059669] bg-[rgba(5,150,105,.1)]'
  if (pill === 'unass') return 'border-[#ccc] bg-[#f9f9f9]'
  return 'border-[rgba(55,1,123,.4)] bg-[rgba(55,1,123,.07)]'
}

/** Collapsible investment options — inside Education accordion (HTML inv-blk) */
function InvestmentBlock({ investCalc, salaryMonthly, dMode, collapsed, onToggleHead }) {
  const { ftLump, ftMonthly, wsMonthly, wsTotal } = investCalc
  const breakNote =
    dMode === 'break'
      ? `~${formatRupee(salaryMonthly * 24)} in earnings`
      : 'salary continuity'

  const optBFeatures = [
    'Weekend live classes — keep your salary',
    'UGC recognised · same degree weight',
    'EMI ≈ 18% of current monthly income',
    'Earn while you learn — net positive cash flow',
  ]

  return (
    <div className="mx-[16px] mb-[14px] overflow-hidden rounded-[11px] border border-[rgba(55,1,123,.2)]">
      <button
        type="button"
        className="relative w-full bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.05))] px-[14px] py-[10px] text-left"
        onClick={onToggleHead}
      >
        <div className="pr-[18px] text-[11px] font-[800] uppercase tracking-[.06em] text-[#37017B]">
          Investment options to close this gap
        </div>
        <div className="mt-[2px] pr-[18px] text-[10.5px] leading-[1.5] text-[#555]">
          Two ways to take a degree — pick what fits your situation. Tap to expand.
        </div>
        <span
          className={[
            'pointer-events-none absolute right-[14px] top-[14px] h-[8px] w-[8px] border-b-2 border-r-2 border-[#999] transition-transform',
            collapsed ? '-translate-y-px rotate-[-45deg]' : 'translate-y-[-2px] rotate-45',
          ].join(' ')}
          aria-hidden
        />
      </button>
      {!collapsed ? (
      <div className="grid grid-cols-1 gap-px bg-[rgba(55,1,123,.2)] sm:grid-cols-2">
        {/* Option A */}
        <div className="bg-white px-[14px] py-[13px]">
          <div className="mb-[5px] text-[10px] font-[800] uppercase tracking-[.06em] text-[#aaa]">
            Option A · Career Break
          </div>
          <div className="mb-[7px] text-[13px] font-[800]">Full-time Degree</div>
          <div className="mb-[8px] flex items-baseline gap-[5px]">
            <span className="font-['DM_Serif_Display',serif] text-[22px] leading-none text-[#37017B]">
              {formatRupee(ftLump)}
            </span>
            <span className="text-[11px] text-[#555]">
              total · or {formatRupeeMonthly(ftMonthly)} EMI
            </span>
          </div>
          {['2-year full-time programme', 'Campus placements + alumni network', 'Faster completion (24 months)'].map(
            (f) => (
              <div key={f} className="mb-[3px] flex items-start gap-[5px] text-[10.5px] leading-[1.45] text-[#777]">
                <span className="shrink-0 font-[800] text-[#37017B]">·</span>
                {f}
              </div>
            ),
          )}
          <div className="mt-[5px] text-[9.5px] font-[700] text-[#b83000]">
            Trade-off: career break · loss of {breakNote}
          </div>
        </div>

        {/* Option B – Recommended */}
        <div className="relative bg-[linear-gradient(135deg,#fff,rgba(72,219,133,.04))] px-[14px] py-[13px]">
          <div className="absolute right-[10px] top-[8px] rounded-[20px] bg-[#48DB85] px-[7px] py-[2px] text-[8px] font-[800] uppercase tracking-[.06em] text-white">
            Recommended
          </div>
          <div className="mb-[5px] text-[10px] font-[800] uppercase tracking-[.06em] text-[#aaa]">
            Option B · No Break
          </div>
          <div className="mb-[7px] text-[13px] font-[800]">Work + Study Degree</div>
          <div className="mb-[8px] flex items-baseline gap-[5px]">
            <span className="font-['DM_Serif_Display',serif] text-[22px] leading-none text-[#37017B]">
              {formatRupeeMonthly(wsMonthly).replace('/mo', '')}
            </span>
            <span className="text-[11px] text-[#555]">
              /month{wsTotal > 0 ? ` · ~${formatRupee(wsTotal)} total` : ''}
            </span>
          </div>
          {optBFeatures.map((f) => (
            <div key={f} className="mb-[3px] flex items-start gap-[5px] text-[10.5px] leading-[1.45] text-[#777]">
              <span className="shrink-0 font-[800] text-[#37017B]">·</span>
              {f}
            </div>
          ))}
        </div>
      </div>
      ) : null}
    </div>
  )
}

function BudgetBlock({ salaryMonthly, monthlyBudget, onBudgetChange, editing, onToggleEdit }) {
  return (
    <div className="mx-[16px] mb-[14px] rounded-[10px] border-[1.5px] border-[rgba(55,1,123,.2)] bg-[linear-gradient(135deg,rgba(55,1,123,.05),rgba(117,4,255,.03))] px-[14px] py-[12px]">
      <div className="mb-[8px] flex items-center justify-between gap-2">
        <div className="text-[11px] font-[800] uppercase tracking-[.05em] text-[#37017B]">
          Your comfortable monthly investment
        </div>
        <button
          type="button"
          className="text-[11px] font-[700] text-[#37017B] underline-offset-2 hover:underline"
          onClick={onToggleEdit}
        >
          {editing ? 'Done' : '✏ Edit'}
        </button>
      </div>
      <div className="mb-[6px] flex items-baseline gap-[4px]">
        <span className="text-[15px] font-[800] text-[#37017B]">₹</span>
        <input
          type="text"
          inputMode="numeric"
          readOnly={!editing}
          value={formatCountIN(monthlyBudget)}
          onChange={(e) => {
            const n = Number(String(e.target.value).replace(/[^\d]/g, ''))
            if (Number.isFinite(n)) onBudgetChange(n)
          }}
          className={[
            'min-w-0 flex-1 border-0 bg-transparent font-["DM_Serif_Display",serif] text-[26px] leading-none text-[#0C0C0C] outline-none',
            editing ? 'border-b border-[rgba(55,1,123,.35)]' : '',
          ].join(' ')}
        />
        <span className="text-[12px] font-[700] text-[#888]">/month</span>
      </div>
      <p className="text-[10.5px] leading-[1.5] text-[#666]">
        Based on {formatRupeeMonthly(salaryMonthly)} salary · 18% of income · fits a BBA/MBA EMI comfortably
      </p>
    </div>
  )
}

function GapCategoryCard({
  cat,
  meta,
  block,
  open,
  onToggle,
  itemAssess,
  onItemAssess,
  investCalc,
  salaryMonthly,
  dMode,
  invCollapsed,
  onToggleInv,
  monthlyBudget,
  onBudgetChange,
  budgetEditing,
  onToggleBudgetEdit,
}) {
  const count = block.items?.length ?? 0
  const isAssessable = ASSESSABLE_CATS.has(cat)

  return (
    <div className="overflow-hidden rounded-[13px] border border-[rgba(0,0,0,.08)] bg-white transition-colors hover:border-[rgba(55,1,123,.2)]">
      <button
        type="button"
        id={`gap-section-${cat}`}
        aria-expanded={open}
        aria-controls={`gap-panel-${cat}`}
        className={[
          'relative flex w-full flex-col gap-[5px] px-[16px] py-[13px] text-left transition-colors hover:bg-[rgba(55,1,123,.025)]',
          open ? 'border-b border-[rgba(0,0,0,.08)]' : '',
        ].join(' ')}
        onClick={() => onToggle(cat)}
      >
        <div className="flex items-center gap-[10px] pr-[22px]">
          <span
            className={[
              'inline-flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[9px] text-[16px]',
              meta.iconBg,
            ].join(' ')}
            aria-hidden
          >
            {meta.icon}
          </span>
          <span className="min-w-0 flex-1 text-[15px] font-[800] text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
            {meta.title}
          </span>
          <span className="flex-shrink-0 text-[11px] font-[700] text-[#888]">
            {count} item{count === 1 ? '' : 's'}
          </span>
        </div>
        {block.imp ? (
          <span
            className={[
              'inline-flex w-fit rounded-[6px] px-[8px] py-[2px] text-[11px] font-[700] leading-[1.4]',
              impBadgeUi(block.cls),
            ].join(' ')}
          >
            {block.imp}
          </span>
        ) : null}
        <span
          className={[
            'pointer-events-none absolute right-[16px] top-[18px] h-[8px] w-[8px] border-b-2 border-r-2 border-[#999] transition-transform',
            open ? 'translate-y-[-2px] rotate-45' : '-translate-y-px rotate-[-45deg]',
          ].join(' ')}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={`gap-panel-${cat}`}
          role="region"
          aria-labelledby={`gap-section-${cat}`}
        >
          <div className="px-[14px] py-[2px]">
            {block.items.map((it, idx) => {
              const assessKey = `${cat}-${idx}`
              const assessed = isAssessable ? (itemAssess[assessKey] ?? '') : null
              const displayPill = assessed !== null ? (assessed === '' ? 'unass' : assessed) : it.pill
              const boxPill = isAssessable && !assessed ? 'unass' : displayPill || 'need'

              return (
                <div
                  key={`${cat}-${it.n}-${idx}`}
                  className="flex gap-[10px] border-b border-[rgba(0,0,0,.06)] py-[12px] last:border-b-0"
                >
                  <div
                    className={['w-[4px] shrink-0 self-stretch rounded-[3px] border', giBoxUi(boxPill)].join(' ')}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-[800] leading-snug text-[#0C0C0C]">{it.n}</div>
                    <p className="mt-[4px] text-[12px] leading-[1.5] text-[#555]">{it.d}</p>
                    {it.w ? (
                      <p className="mt-[4px] text-[11px] font-[600] text-[#b83000]">⚠ {it.w}</p>
                    ) : null}
                    <div className="mt-[6px] space-y-[4px]">
                      {it.actions?.map((a) => (
                        <div key={a} className="text-[11.5px] leading-[1.45] text-[#666]">
                          · {a}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-[6px]">
                    {isAssessable ? (
                      <select
                        value={assessed ?? ''}
                        onChange={(e) => onItemAssess(cat, idx, e.target.value)}
                        className="cursor-pointer rounded-[6px] border border-[rgba(0,0,0,.08)] bg-white px-[6px] py-[3px] text-[10px] font-[600] text-[#888] outline-none focus:border-[#37017B] focus:ring-1 focus:ring-[#37017B]"
                      >
                        {ITEM_ASSESS_OPTS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {(displayPill || isAssessable) && (
                      <span
                        className={[
                          'inline-flex rounded-[20px] border px-[8px] py-[2px] text-[9px] font-[800] uppercase tracking-[.05em]',
                          pillUi(isAssessable && !assessed ? 'unass' : displayPill),
                        ].join(' ')}
                      >
                        {pillText(isAssessable && !assessed ? 'unass' : displayPill)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {cat === 'edu' && investCalc ? (
            <>
              <InvestmentBlock
                investCalc={investCalc}
                salaryMonthly={salaryMonthly}
                dMode={dMode}
                collapsed={invCollapsed}
                onToggleHead={onToggleInv}
              />
              <BudgetBlock
                salaryMonthly={salaryMonthly}
                monthlyBudget={monthlyBudget}
                onBudgetChange={onBudgetChange}
                editing={budgetEditing}
                onToggleEdit={onToggleBudgetEdit}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}


export function Frame4() {
  const nav = useNavigate()
  const {
    s,
    selIndustry,
    selRole,
    setGapPath,
    setRPath,
    setEduBudgetLacs,
  } = useAppState()

  const [itemAssess, setItemAssess] = useState({})
  const [openSections, setOpenSections] = useState(() => ({
    edu: true,
    skill: false,
    exp: false,
    dev: false,
  }))
  const [invCollapsed, setInvCollapsed] = useState(true)
  const [budgetEditing, setBudgetEditing] = useState(false)
  const [gaps, setGaps] = useState(null)
  const [gapsLoading, setGapsLoading] = useState(true)

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

  const pd = PD[pdKey] || PD['Finance Manager']

  const roleTitleForGaps = (selRole || '').trim() || pdKey

  useEffect(() => {
    setGapPath(GAP_PATH)
    setRPath(GAP_PATH)
  }, [setGapPath, setRPath])

  useEffect(() => {
    let cancelled = false
    const title = roleTitleForGaps

    async function load() {
      setGapsLoading(true)
      const staticGaps = getStaticGapsForRole(title)
      if (staticGaps) {
        if (!cancelled) {
          setGaps(staticGaps)
          setGapsLoading(false)
        }
        return
      }

      const next = buildFallbackGaps(title, roleCard)
      if (!cancelled) {
        setGaps(next)
        setGapsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [roleTitleForGaps, industryLabel, roleCard])

  /** Monthly salary in ₹ — profile stores it as monthly rupees (e.g. 24000) */
  const salaryMonthly = useMemo(() => {
    const v = Number(String(s.salary || '').replace(/[^\d.]/g, ''))
    if (Number.isFinite(v) && v > 0) return v
    const lpa = Number(s.dSalary)
    return Number.isFinite(lpa) && lpa > 0 ? Math.round((lpa * 100000) / 12) : 20000
  }, [s.salary, s.dSalary])

  /** Investment option costs derived from monthly salary — matching HTML prototype */
  const investCalc = useMemo(() => {
    const sal = salaryMonthly
    const ftLump = Math.max(89000, Math.round(sal * 5))
    const ftMonthly = Math.round(ftLump / 24)
    const wsMonthly = Math.max(2500, Math.round(sal * 0.18))
    const wsTotal = wsMonthly * 30
    return { ftLump, ftMonthly, wsMonthly, wsTotal }
  }, [salaryMonthly])

  const suggestedMonthly = useMemo(
    () => Math.round((salaryMonthly * 0.18) / 100) * 100,
    [salaryMonthly],
  )

  const [budgetOverride, setBudgetOverride] = useState(null)
  const [prevSuggested, setPrevSuggested] = useState(suggestedMonthly)
  if (suggestedMonthly !== prevSuggested) {
    setPrevSuggested(suggestedMonthly)
    setBudgetOverride(null)
  }
  const monthlyBudget = budgetOverride ?? suggestedMonthly

  const handleItemAssess = useCallback((catKey, itemIdx, value) => {
    setItemAssess((prev) => ({ ...prev, [`${catKey}-${itemIdx}`]: value }))
  }, [])

  const toggleSection = (key) => {
    setOpenSections((p) => ({ ...p, [key]: !p[key] }))
  }

  const goNext = () => {
    const lacs = Math.round(((monthlyBudget * 12) / 100000) * 10) / 10
    setEduBudgetLacs(lacs > 0 ? lacs : 0)
    setRPath(GAP_PATH)
    nav('/5')
  }

  const profilesN = roleCard?.dbProfiles != null ? formatCountIN(roleCard.dbProfiles) : '2,127'
  const accelYrs = pd[GAP_PATH]?.yrs ?? pd.accel?.yrs
  const socialPct = 87

  return (
    <section data-scroll-top className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7">
      <div className="mx-auto max-w-[960px]">
        <div className="mb-[14px] flex flex-wrap items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
          <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-[3px] text-[#37017B]">4 · Gap Analysis</span>
          <span className="text-[#ddd]">›</span>
          <span className="text-[#ccc]">Destination · {destinationTitle}</span>
        </div>

        <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
          What&apos;s missing from your profile
        </div>
        <p className="mb-2 max-w-[720px] text-[13px] leading-[1.55] text-[#555]">
          Based on live JD analysis and profiles similar to yours on Apna. Gaps are grouped so you can prioritise — critical
          items block shortlisting; missing items hurt interviews; needed items strengthen your case.
        </p>
        <p className="mb-6 text-[12px] font-[700] text-[#37017B]">
          ⚡ Accelerated path · ~{accelYrs ?? '—'} year target for {destinationTitle}
        </p>

        {/* Social proof */}
        <div className="mb-6 rounded-[12px] border border-[rgba(72,219,133,.35)] bg-[rgba(72,219,133,.12)] px-[16px] py-[12px] text-[12.5px] font-[600] leading-[1.5] text-[#14532d]">
          Of {profilesN} profiles with your background who reached{' '}
          <strong className="font-[800] text-[#052e16]">{destinationTitle}</strong>,{' '}
          {socialPct}% closed every Critical gap below before getting shortlisted.
        </div>

        <div className="mb-2 text-[10px] font-[700] uppercase tracking-[.09em] text-[#bbb]">
          Profile gap breakdown — assess each item below with your counselor
        </div>

        {/* Gap accordions */}
        <div className="mb-8 space-y-3">
          {gapsLoading || !gaps
            ? GAP_CATS.map((cat) => (
                <div
                  key={cat}
                  className="h-[88px] animate-pulse rounded-[14px] border border-[rgba(0,0,0,.06)] bg-[rgba(0,0,0,.04)]"
                />
              ))
            : GAP_CATS.map((cat) => (
                <GapCategoryCard
                  key={cat}
                  cat={cat}
                  meta={CAT_META[cat]}
                  block={gaps[cat]}
                  open={openSections[cat]}
                  onToggle={toggleSection}
                  itemAssess={itemAssess}
                  onItemAssess={handleItemAssess}
                  investCalc={cat === 'edu' ? investCalc : null}
                  salaryMonthly={salaryMonthly}
                  dMode={s.dMode}
                  invCollapsed={invCollapsed}
                  onToggleInv={() => setInvCollapsed((v) => !v)}
                  monthlyBudget={monthlyBudget}
                  onBudgetChange={setBudgetOverride}
                  budgetEditing={budgetEditing}
                  onToggleBudgetEdit={() => setBudgetEditing((v) => !v)}
                />
              ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(0,0,0,.06)] pt-6">
          <p className="max-w-[420px] text-[12px] text-[#888]">
            Accelerated path: ~{accelYrs ?? '—'} yrs to{' '}
            <strong className="text-[#0C0C0C]">{destinationTitle}</strong>
            {pd.trad?.yrs && accelYrs ? (
              <>
                {' '}
                · saves{' '}
                <strong className="text-[#15803d]">{pd.trad.yrs - accelYrs} yrs</strong> vs traditional
              </>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => nav('/3')}>
              ← Back
            </Button>
            <Button onClick={goNext}>See ROI →</Button>
          </div>
        </div>
      </div>

    </section>
  )
}
