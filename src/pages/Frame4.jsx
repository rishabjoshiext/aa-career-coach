import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { resolvePdRole } from '../utils/roleKey.js'
import { flattenIndustryRoles, INDUSTRIES } from '../utils/fasttrackData.js'
import { PD } from '../utils/pathData.js'
import {
  buildFallbackGaps,
  fetchGapAnalysisWithOpenAI,
  getStaticGapsForRole,
} from '../utils/gapAnalysisOpenAI.js'

const PATH_PILLS = [
  { key: 'accel', label: 'Accelerated', emoji: '⚡', hint: 'Fastest promotion cadence' },
  { key: 'fast', label: 'Fast Track', emoji: '🚀', hint: 'Balanced speed & safety' },
  { key: 'trad', label: 'Traditional', emoji: '📈', hint: 'Steady, proven ladder' },
]

const CAT_META = {
  edu: { title: 'Education', icon: '📚' },
  skill: { title: 'Skills & Tools', icon: '🛠️' },
  exp: { title: 'Experience', icon: '⏱️' },
  dev: { title: 'Personal Development', icon: '🌱' },
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

function impBarWrap(cls) {
  if (cls === 'red') return 'bg-[rgba(254,226,226,.9)]'
  if (cls === 'amber') return 'bg-[rgba(255,247,237,.95)]'
  return 'bg-[rgba(209,250,229,.75)]'
}

function impBarText(cls) {
  if (cls === 'red') return 'text-[#991b1b]'
  if (cls === 'amber') return 'text-[#9a3412]'
  return 'text-[#166534]'
}

function countPills(gaps, pillId) {
  let n = 0
  GAP_CATS.forEach((k) => {
    gaps[k]?.items?.forEach((it) => {
      if (it.pill === pillId) n += 1
    })
  })
  return n
}

/** Option A / Option B investment block — shown inside the edu accordion */
function InvestmentBlock({ investCalc, salaryMonthly, dMode }) {
  const { ftLump, ftMonthly, wsMonthly, wsTotal } = investCalc
  const breakNote =
    dMode === 'break'
      ? `~₹${Math.round((salaryMonthly * 24) / 1000).toLocaleString('en-IN')}k in earnings`
      : 'salary continuity'

  const optBFeatures = [
    'Weekend live classes — keep your salary',
    'UGC recognised · same degree weight',
    'EMI ≈ 18% of current monthly income',
    'Earn while you learn — net positive cash flow',
  ]

  return (
    <div className="mx-[16px] mb-[14px] overflow-hidden rounded-[11px] border border-[rgba(55,1,123,.2)]">
      <div className="bg-[linear-gradient(135deg,rgba(55,1,123,.05),rgba(117,4,255,.03))] px-[14px] py-[10px]">
        <div className="text-[11px] font-[800] uppercase tracking-[.06em] text-[#37017B]">
          Investment options to close this gap
        </div>
        <div className="mt-[2px] text-[10.5px] leading-[1.5] text-[#555]">
          Two ways to take a degree — pick what fits your situation. Counselor will discuss next steps.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[rgba(55,1,123,.2)]">
        {/* Option A */}
        <div className="bg-white px-[14px] py-[13px]">
          <div className="mb-[5px] text-[10px] font-[800] uppercase tracking-[.06em] text-[#aaa]">
            Option A · Career Break
          </div>
          <div className="mb-[7px] text-[13px] font-[800]">Full-time Degree</div>
          <div className="mb-[8px] flex items-baseline gap-[5px]">
            <span className="font-['DM_Serif_Display',serif] text-[22px] leading-none text-[#37017B]">
              ₹{Math.round(ftLump / 1000)}k
            </span>
            <span className="text-[11px] text-[#555]">
              total · or ₹{ftMonthly.toLocaleString('en-IN')}/mo EMI
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
              ₹{wsMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#555]">
              /month{wsTotal > 0 ? ` · ~₹${Math.round(wsTotal / 1000).toLocaleString('en-IN')}k total` : ''}
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
}) {
  const count = block.items?.length ?? 0
  const isAssessable = ASSESSABLE_CATS.has(cat)

  return (
    <div className="overflow-hidden rounded-[14px] border border-[rgba(0,0,0,.08)] bg-white shadow-[0_1px_8px_rgba(0,0,0,.04)]">
      <button
        type="button"
        id={`gap-section-${cat}`}
        aria-expanded={open}
        aria-controls={`gap-panel-${cat}`}
        className="flex w-full items-center gap-3 px-[16px] py-[14px] text-left transition-colors hover:bg-[rgba(55,1,123,.04)]"
        onClick={() => onToggle(cat)}
      >
        <span
          className="inline-flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[rgba(55,1,123,.08)] text-[16px]"
          aria-hidden
        >
          {meta.icon}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-[800] text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
          {meta.title}
        </span>
        <span className="flex-shrink-0 text-[12px] font-[700] text-[#666]">
          {count} item{count === 1 ? '' : 's'}
        </span>
        <span
          className={[
            'flex-shrink-0 text-[18px] font-[300] text-[#37017B] transition-transform duration-200',
            open ? 'rotate-90' : '',
          ].join(' ')}
          aria-hidden
        >
          ›
        </span>
      </button>

      {block.imp ? (
        <div className={`px-[16px] py-[10px] text-[12px] font-[800] ${impBarWrap(block.cls)} ${impBarText(block.cls)}`}>
          {block.imp}
        </div>
      ) : null}

      {open ? (
        <div
          id={`gap-panel-${cat}`}
          role="region"
          aria-labelledby={`gap-section-${cat}`}
          className="border-t border-[rgba(0,0,0,.06)]"
        >
          <div className="divide-y divide-[rgba(0,0,0,.05)] bg-[rgba(250,249,244,.35)]">
            {block.items.map((it, idx) => {
              const assessKey = `${cat}-${idx}`
              const assessed = isAssessable ? (itemAssess[assessKey] ?? '') : null
              const displayPill = assessed !== null ? (assessed === '' ? 'unass' : assessed) : it.pill

              return (
                <div key={`${cat}-${it.n}-${idx}`} className="bg-white px-[16px] py-[14px]">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="text-[14px] font-[800] leading-snug text-[#0C0C0C]">
                      {idx + 1}. {it.n}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
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
                      {displayPill ? (
                        <span
                          className={[
                            'inline-flex flex-shrink-0 rounded-[20px] border px-[10px] py-[3px] text-[9px] font-[800] uppercase tracking-[.06em]',
                            pillUi(displayPill),
                          ].join(' ')}
                        >
                          {pillText(displayPill)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mb-2 text-[12.5px] leading-[1.5] text-[#555]">{it.d}</p>
                  {it.w ? <p className="mb-2 text-[11.5px] font-[600] text-[#37017B]">{it.w}</p> : null}
                  <ul className="space-y-[6px]">
                    {it.actions?.map((a) => (
                      <li key={a} className="flex gap-2 text-[12px] leading-[1.45] text-[#444]">
                        <span className="mt-[6px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#37017B]" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Investment options shown at the bottom of the edu accordion */}
          {cat === 'edu' && investCalc ? (
            <div className="py-[10px]">
              <InvestmentBlock investCalc={investCalc} salaryMonthly={salaryMonthly} dMode={dMode} />
            </div>
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
    gapPath,
    setGapPath,
    setRPath,
    eduBudgetLacs,
    setEduBudgetLacs,
  } = useAppState()

  const [pathOpen, setPathOpen] = useState(false)
  const [itemAssess, setItemAssess] = useState({})
  const [openSections, setOpenSections] = useState(() => ({
    edu: false,
    skill: false,
    exp: false,
    dev: false,
  }))
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

      const ai = await fetchGapAnalysisWithOpenAI({
        targetRole: title,
        industryLabel,
        card: roleCard,
      })
      const next = ai || buildFallbackGaps(title, roleCard)
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

  const salaryLpa = useMemo(() => {
    const v = Number(String(s.salary || '').replace(/[^\d.]/g, ''))
    if (Number.isFinite(v) && v > 0) return v
    const d = Number(s.dSalary)
    return Number.isFinite(d) && d > 0 ? d : 8
  }, [s.dSalary, s.salary])

  const stats = useMemo(() => {
    if (!gaps) return { crit: 0, miss: 0, need: 0 }
    return {
      crit: countPills(gaps, 'crit'),
      miss: countPills(gaps, 'miss'),
      need: countPills(gaps, 'need'),
    }
  }, [gaps])

  const pathNodes = pd.nodes?.[gapPath] || []

  const handleItemAssess = useCallback((catKey, itemIdx, value) => {
    setItemAssess((prev) => ({ ...prev, [`${catKey}-${itemIdx}`]: value }))
  }, [])

  const pickPath = (k) => {
    setGapPath(k)
    setRPath(k)
  }

  const toggleSection = (key) => {
    setOpenSections((p) => ({ ...p, [key]: !p[key] }))
  }

  const goNext = () => {
    setRPath(gapPath)
    nav('/5')
  }

  const profilesN = roleCard?.dbProfiles?.toLocaleString('en-IN') ?? '2,127'
  const socialPct = 87

  return (
    <section data-scroll-top className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7">
      <div className="mx-auto max-w-[960px]">
        <div className="mb-[14px] flex flex-wrap items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
          <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-[3px] text-[#37017B]">4 · Gap Analysis</span>
          <span className="text-[#ddd]">›</span>
          <span className="text-[#ccc]">Destination · {destinationTitle}</span>
        </div>

        <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
          <div className="text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
            What&apos;s missing from your profile
          </div>
          <button
            type="button"
            className="rounded-[10px] border border-[rgba(55,1,123,.2)] bg-white px-[14px] py-[8px] text-[12px] font-[700] text-[#37017B] shadow-sm transition hover:bg-[rgba(55,1,123,.06)]"
            onClick={() => setPathOpen(true)}
          >
            View my path →
          </button>
        </div>
        <p className="mb-6 max-w-[720px] text-[13px] leading-[1.55] text-[#555]">
          Based on live JD analysis and profiles similar to yours on Apna. Gaps are grouped so you can prioritise — critical
          items block shortlisting; missing items hurt interviews; needed items strengthen your case.
        </p>

        {/* Summary card with path selector */}
        <div
          className={[
            'mb-4 overflow-hidden rounded-[16px] border border-[rgba(255,255,255,.08)] bg-[#0C0C0C] px-[20px] py-[20px] text-[#FAF9F4] shadow-[0_12px_40px_rgba(0,0,0,.18)]',
            gapsLoading ? 'animate-pulse opacity-90' : '',
          ].join(' ')}
        >
          <div className="mb-4 text-[20px] font-[800] leading-tight [font-family:'DM Serif Display',serif]">
            What&apos;s missing — {destinationTitle}
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {PATH_PILLS.map((p) => (
              <button
                key={p.key}
                type="button"
                title={p.hint}
                className={[
                  'rounded-[50px] border-[1.5px] px-[16px] py-[9px] text-[12px] font-[700] transition-all duration-200',
                  gapPath === p.key
                    ? 'border-[#a855f7] bg-[#a855f7] text-white shadow-[0_4px_14px_rgba(168,85,247,.35)]'
                    : 'border-[rgba(255,255,255,.2)] bg-[rgba(255,255,255,.06)] text-[rgba(250,249,244,.75)] hover:border-[rgba(168,85,247,.5)]',
                ].join(' ')}
                onClick={() => pickPath(p.key)}
              >
                <span className="mr-1">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: 'crit', label: 'Critical', sub: 'resume screen', v: stats.crit, border: 'border-[rgba(239,68,68,.35)]' },
              { k: 'miss', label: 'Missing', sub: 'interviews', v: stats.miss, border: 'border-[rgba(245,158,11,.35)]' },
              { k: 'need', label: 'Needed', sub: 'offer strength', v: stats.need, border: 'border-[rgba(59,130,246,.35)]' },
            ].map((row) => (
              <div
                key={row.k}
                className={['rounded-[13px] border bg-[rgba(255,255,255,.06)] p-[14px] backdrop-blur-sm', row.border].join(' ')}
              >
                <div className="text-[10px] font-[800] uppercase tracking-[.08em] text-[rgba(250,249,244,.45)]">{row.label}</div>
                <div className="mt-1 text-[28px] font-[800] leading-none text-white">{gapsLoading ? '—' : row.v}</div>
                <div className="mt-1 text-[11px] text-[rgba(250,249,244,.4)]">{row.sub}</div>
              </div>
            ))}
          </div>
        </div>

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
                />
              ))}
        </div>

        {/* Upskilling budget — feeds ROI screen */}
        <div className="mb-10 rounded-[14px] border border-[rgba(0,0,0,.08)] bg-[rgba(250,249,244,.5)] px-[18px] py-[16px]">
          <div className="mb-2 text-[13px] font-[800]">Your upskilling budget</div>
          <p className="mb-3 text-[11.5px] text-[#666]">We&apos;ll use this on the next screen for payback math.</p>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#888]">₹</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={eduBudgetLacs}
              onChange={(e) => setEduBudgetLacs(Number(e.target.value) || 0)}
              className="w-full rounded-[10px] border border-[rgba(0,0,0,.12)] bg-white px-[12px] py-[10px] text-[15px] font-[800] outline-none ring-[#37017B] focus:ring-2"
            />
            <span className="text-[12px] font-[700] text-[#888]">Lacs</span>
          </div>
          <p className="mt-2 text-[11px] text-[#aaa]">
            Current salary ~₹{salaryLpa.toLocaleString('en-IN')} · comfortable monthly investment ≈ ₹
            {Math.round(salaryMonthly * 0.18).toLocaleString('en-IN')}/mo
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(0,0,0,.06)] pt-6">
          <p className="max-w-[420px] text-[12px] text-[#888]">
            Path horizon for{' '}
            <strong className="text-[#0C0C0C]">{PATH_PILLS.find((p) => p.key === gapPath)?.label}</strong>: ~
            {pd[gapPath]?.yrs ?? '—'} yrs to{' '}
            <strong className="text-[#0C0C0C]">{destinationTitle}</strong> · saves{' '}
            <strong className="text-[#15803d]">
              {pd.trad.yrs - (pd[gapPath]?.yrs ?? pd.trad.yrs)} yrs
            </strong>{' '}
            vs traditional
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => nav('/3')}>
              ← Back
            </Button>
            <Button onClick={goNext}>See ROI →</Button>
          </div>
        </div>
      </div>

      {/* My Path modal */}
      {pathOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-[16px] border border-[rgba(0,0,0,.08)] bg-[#FAF9F4] p-[20px] shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[18px] font-[800] [font-family:'DM Serif Display',serif]">
                  Your path · {destinationTitle}
                </div>
                <div className="mt-1 text-[12px] text-[#666]">
                  {pd[gapPath]?.label ?? ''} · ~{pd[gapPath]?.yrs} years (illustrative ladder for your function)
                </div>
              </div>
              <button
                type="button"
                className="rounded-[8px] border border-[rgba(0,0,0,.1)] px-[12px] py-[6px] text-[12px] font-[700]"
                onClick={() => setPathOpen(false)}
              >
                Close
              </button>
            </div>
            <ol className="space-y-3">
              {pathNodes.map((n, i) => (
                <li
                  key={`${n.r}-${n.yr}`}
                  className={[
                    'rounded-[11px] border px-[12px] py-[10px]',
                    n.goal
                      ? 'border-[rgba(72,219,133,.45)] bg-[rgba(72,219,133,.08)]'
                      : 'border-[rgba(0,0,0,.06)] bg-white',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13px] font-[800]">
                      {i + 1}. {n.r}
                    </span>
                    <span className="text-[11px] font-[700] text-[#37017B]">Year ~{n.yr}</span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-[#555]">{n.brief}</div>
                  <div className="mt-1 text-[11px] font-[700] text-[#888]">{n.sal}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  )
}
