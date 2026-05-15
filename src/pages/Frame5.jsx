import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { resolvePdRole } from '../utils/roleKey.js'
import { flattenIndustryRoles, INDUSTRIES } from '../utils/fasttrackData.js'
import { PD } from '../utils/pathData.js'
import { ROI_YEARS } from '../utils/roiData.js'
import {
  breakEvenYear,
  buildFallbackRoiModel,
  chartYearTicks,
  cumulativeExtraLacs,
  fetchRoiWithOpenAI,
  fmtRupeeMoK,
} from '../utils/roiOpenAI.js'

const PATH_TABS = [
  { key: 'accel', label: 'Accelerated', emoji: '🚀', hint: 'Fastest promotion cadence' },
  { key: 'fast', label: 'Fast Track', emoji: '⚡', hint: 'Balanced speed & safety' },
  { key: 'trad', label: 'Traditional', emoji: '📈', hint: 'Steady, proven ladder' },
]

const BRAND_PURPLE = '#6320EE'

function fmtLacs(n) {
  if (n == null || Number.isNaN(n)) return '—'
  const x = Number(n)
  if (x >= 100) return `₹${Math.round(x)}L`
  return `₹${x.toFixed(x % 1 === 0 ? 0 : 1)}L`
}

export function Frame5() {
  const nav = useNavigate()
  const { s, selIndustry, selRole, rPath, setRPath, rYear, setRYear, eduBudgetLacs } = useAppState()

  const [roiModel, setRoiModel] = useState(null)
  const [roiLoading, setRoiLoading] = useState(true)

  const pdKey = resolvePdRole(selRole)
  const destinationTitle = (selRole && String(selRole).trim()) || 'your goal'
  const pd = PD[pdKey] || PD['Finance Manager']

  const industryLabel = useMemo(() => {
    const row = INDUSTRIES.find((i) => i.id === selIndustry)
    return row?.n || 'All Functions'
  }, [selIndustry])

  const roleCard = useMemo(() => {
    const flat = flattenIndustryRoles(selIndustry === 'all' ? 'all' : selIndustry)
    const t = (selRole || '').trim()
    return flat.find((c) => c.role === t) || flat.find((c) => c.role === pdKey) || flat[0]
  }, [selRole, selIndustry, pdKey])

  const roleTitleForRoi = (selRole || '').trim() || pdKey

  const salaryLpa = useMemo(() => {
    const v = Number(String(s.salary || '').replace(/[^\d.]/g, ''))
    if (Number.isFinite(v) && v > 0) return v
    const d = Number(s.dSalary)
    return Number.isFinite(d) && d > 0 ? d : 8
  }, [s.dSalary, s.salary])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setRoiLoading(true)
      const ai = await fetchRoiWithOpenAI({
        targetRole: roleTitleForRoi,
        industryLabel,
        card: roleCard,
        salaryLpa,
        eduBudgetLacs,
      })
      const next = ai || buildFallbackRoiModel({ salaryLpa, eduBudgetLacs })
      if (!cancelled) {
        setRoiModel(next)
        setRoiLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [roleTitleForRoi, industryLabel, roleCard, salaryLpa, eduBudgetLacs])

  const stag = roiModel?.stagMonthlyK
  const pathSeries = roiModel?.pathMonthlyK?.[rPath]
  const cardCopy = roiModel?.cardCopy

  const ticks = chartYearTicks(rYear)
  const chartMaxK = useMemo(() => {
    if (!stag || !pathSeries) return 100
    let m = 1
    ticks.forEach((yr) => {
      m = Math.max(m, stag[yr] || 0, pathSeries[yr] || 0)
    })
    return m
  }, [stag, pathSeries, ticks])

  const chartH = 168

  const pathLabel = PATH_TABS.find((p) => p.key === rPath)?.label ?? 'Your Path'
  const pathYearsToRole = pd[rPath]?.yrs ?? pd.trad?.yrs ?? '—'

  const salaryPathEnd = pathSeries?.[rYear] ?? 0
  const salaryStagEnd = stag?.[rYear] ?? 0
  const moDiff = Math.max(0, Math.round(salaryPathEnd - salaryStagEnd))

  const totalExtra = stag && pathSeries ? cumulativeExtraLacs(stag, pathSeries, rYear) : 0
  const bankApprox = Math.round(totalExtra * 0.35 * 10) / 10
  const beYear = stag && pathSeries ? breakEvenYear(stag, pathSeries, eduBudgetLacs) : null

  const totalExtraSub =
    cardCopy?.totalExtraSub?.trim() ||
    `Over ${rYear} years vs staying at your current trajectory — before tax.`

  const bankSub =
    cardCopy?.bankSub?.trim() ||
    `If you save 35% of extra earnings over ${rYear} years — on top of current savings.`

  const breakEvenSub =
    cardCopy?.breakEvenSub?.trim() ||
    (Number(eduBudgetLacs) > 0
      ? `When cumulative extra earnings surpass your ₹${eduBudgetLacs}L education budget.`
      : 'When extra earnings surpass a typical upskilling investment for this move.')

  return (
    <section className="absolute inset-0 overflow-y-auto px-9 pb-10 pt-7" data-app-page-scroll>
      <div className="mx-auto max-w-[960px]">
        <div className="mb-[14px] flex flex-wrap items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
          <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-[3px] text-[#37017B]">5 · ROI</span>
          <span className="text-[#ddd]">›</span>
          <span className="text-[#ccc]">{destinationTitle}</span>
        </div>

        {/* Goal banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[#0C0C0C] px-[18px] py-[14px] text-[#FAF9F4]">
          <div className="flex min-w-0 items-start gap-3">
            <span className="text-[20px] text-[#48DB85]" aria-hidden>
              ⚡
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-[800] uppercase tracking-[.12em] text-[rgba(250,249,244,.45)]">
                Your selected goal
              </div>
              <div className="mt-[4px] text-[14px] font-[800] leading-snug">
                {pathLabel} path · {pathYearsToRole} years to <span className="text-[#e9d5ff]">{destinationTitle}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 rounded-[10px] border border-[rgba(250,249,244,.2)] bg-transparent px-[14px] py-[8px] text-[12px] font-[700] text-[#FAF9F4] transition hover:bg-[rgba(255,255,255,.08)]"
            onClick={() => nav('/3')}
          >
            View path →
          </button>
        </div>

        <div className="mb-2 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
          Earnings <em className="text-[#6320EE] not-italic">with</em> vs{' '}
          <em className="text-[#6320EE] not-italic">without</em> action.
        </div>
        <p className="mb-6 max-w-[720px] text-[13px] leading-[1.55] text-[#555]">
          Select a path and target year to see your salary growth — and what stagnation costs you. Figures use your current
          package (~{fmtLacs(salaryLpa)} LPA) and upskilling budget (₹{eduBudgetLacs}L); projections are tailored to{' '}
          <strong className="text-[#0C0C0C]">{destinationTitle}</strong>.
        </p>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {PATH_TABS.map((p) => (
              <button
                key={p.key}
                type="button"
                title={p.hint}
                className={[
                  'rounded-[50px] border-[1.5px] px-[16px] py-[9px] text-[12px] font-[700] transition-all duration-200',
                  rPath === p.key
                    ? 'border-[#6320EE] bg-[#6320EE] text-white shadow-[0_4px_14px_rgba(99,32,238,.28)]'
                    : 'border-[rgba(0,0,0,.08)] bg-white text-[#555] hover:border-[rgba(99,32,238,.35)]',
                ].join(' ')}
                onClick={() => setRPath(p.key)}
              >
                <span className="mr-1">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-[700] text-[#888]">Show up to:</span>
            {ROI_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                className={[
                  'min-w-[56px] rounded-[10px] border px-[14px] py-[8px] text-[13px] font-[800] transition-all',
                  rYear === y
                    ? 'border-black bg-black text-white shadow-sm'
                    : 'border-[rgba(0,0,0,.08)] bg-white text-[#666] hover:border-[rgba(0,0,0,.2)]',
                ].join(' ')}
                onClick={() => setRYear(y)}
              >
                Year {y}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div
          className={[
            'mb-6 rounded-[16px] border border-[rgba(0,0,0,.06)] bg-white p-[20px] shadow-[0_4px_24px_rgba(0,0,0,.06)]',
            roiLoading ? 'animate-pulse opacity-80' : '',
          ].join(' ')}
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-[800] text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
                Monthly salary — no action vs {pathLabel}
              </div>
              <div className="mt-1 text-[11px] font-[600] tracking-[.02em] text-[#888]">
                INR gross · illustrative projection for India metros
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-[700]">
              <span className="inline-flex items-center gap-2 text-[#737373]">
                <span className="inline-block h-[10px] w-[10px] rounded-[2px] bg-[#d4d4d4]" /> No Action
              </span>
              <span className="inline-flex items-center gap-2 text-[#6320EE]">
                <span className="inline-block h-[10px] w-[10px] rounded-[2px] bg-[linear-gradient(135deg,#6320EE,#37017B)]" />{' '}
                Your Path
              </span>
            </div>
          </div>

          {!roiLoading && stag && pathSeries ? (
            <div className="flex items-end justify-between gap-[6px] sm:gap-[12px]" style={{ minHeight: chartH + 52 }}>
              {ticks.map((yr) => {
                const hS = Math.round((stag[yr] / chartMaxK) * chartH)
                const hP = Math.round((pathSeries[yr] / chartMaxK) * chartH)
                const isHorizon = yr === rYear
                return (
                  <div key={`col-${yr}`} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="mb-1 flex w-full justify-center gap-[4px] text-[10px] font-[800] sm:text-[11px]">
                      <span className="text-[#737373]">{fmtRupeeMoK(stag[yr])}</span>
                      <span className="text-[#ccc]">/</span>
                      <span style={{ color: BRAND_PURPLE }}>{fmtRupeeMoK(pathSeries[yr])}</span>
                    </div>
                    <div className="flex h-[184px] w-full items-end justify-center gap-[5px]">
                      <div
                        className="w-[38%] max-w-[44px] rounded-t-[8px] bg-[linear-gradient(180deg,#e5e5e5,#bdbdbd)] sm:max-w-[52px]"
                        style={{ height: `${Math.max(8, hS)}px` }}
                        title={`No action: ${fmtRupeeMoK(stag[yr])}`}
                      />
                      <div
                        className={[
                          'w-[38%] max-w-[44px] rounded-t-[8px] bg-[linear-gradient(180deg,#6320EE,#37017B)] sm:max-w-[52px]',
                          isHorizon ? 'shadow-[0_0_20px_rgba(99,32,238,.45)] ring-2 ring-[rgba(250,204,21,.75)]' : 'shadow-[0_8px_22px_rgba(99,32,238,.22)]',
                        ].join(' ')}
                        style={{ height: `${Math.max(8, hP)}px` }}
                        title={`Your path: ${fmtRupeeMoK(pathSeries[yr])}`}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-[800] text-[#555]">
                      {yr === 0 ? 'Now' : `Yr ${yr}`}
                      {isHorizon ? <span className="text-[12px] leading-none text-[#eab308]">★</span> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-[13px] font-[600] text-[#aaa]">
              Loading salary curves…
            </div>
          )}
        </div>

        {/* Metric cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[14px] border border-[rgba(0,0,0,.06)] border-t-[4px] border-t-[#6320EE] bg-white p-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)]">
            <div className="mb-2 text-[18px] leading-none" aria-hidden>
              📈
            </div>
            <div className="mb-2 text-[9px] font-[800] uppercase tracking-[.12em] text-[#888]">Your salary by year {rYear}</div>
            <div className="text-[26px] font-[800] leading-none text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
              {fmtRupeeMoK(salaryPathEnd)}/mo
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.45] text-[#666]">
              vs {fmtRupeeMoK(salaryStagEnd)}/mo with no action
              {moDiff > 0 ? (
                <>
                  {' '}
                  — a {fmtRupeeMoK(moDiff)}/mo difference
                </>
              ) : null}
              .
            </p>
          </div>

          <div className="rounded-[14px] border border-[rgba(0,0,0,.06)] border-t-[4px] border-t-[#15803d] bg-white p-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)]">
            <div className="mb-2 text-[18px] leading-none" aria-hidden>
              💰
            </div>
            <div className="mb-2 text-[9px] font-[800] uppercase tracking-[.12em] text-[#888]">Total extra earnings</div>
            <div className="text-[26px] font-[800] leading-none text-[#0C0C0C] [font-family:'DM Serif Display',serif]">{fmtLacs(totalExtra)}</div>
            <p className="mt-3 text-[11.5px] leading-[1.45] text-[#666]">{totalExtraSub}</p>
          </div>

          <div className="rounded-[14px] border border-[rgba(0,0,0,.06)] border-t-[4px] border-t-[#eab308] bg-white p-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)]">
            <div className="mb-2 text-[18px] leading-none" aria-hidden>
              🏦
            </div>
            <div className="mb-2 text-[9px] font-[800] uppercase tracking-[.12em] text-[#888]">
              Potential bank balance in {rYear} years
            </div>
            <div className="text-[26px] font-[800] leading-none text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
              {fmtLacs(bankApprox)}+
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.45] text-[#666]">{bankSub}</p>
          </div>

          <div className="rounded-[14px] border border-[rgba(0,0,0,.06)] border-t-[4px] border-t-[#6366f1] bg-white p-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)]">
            <div className="mb-2 text-[18px] leading-none" aria-hidden>
              ⏱️
            </div>
            <div className="mb-2 text-[9px] font-[800] uppercase tracking-[.12em] text-[#888]">Break-even point</div>
            <div className="text-[26px] font-[800] leading-none text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
              {beYear != null ? `Year ${beYear}` : 'Beyond horizon'}
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.45] text-[#666]">{breakEvenSub}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(0,0,0,.06)] pt-6">
          <p className="max-w-[460px] text-[11px] leading-[1.5] text-[#aaa]">
            Illustrative only — projections combine role-market norms with your inputs; tax, equity, and employer variance can
            change outcomes materially.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => nav('/4')}>
              ← Back
            </Button>
            <Button onClick={() => nav('/6')}>See Who Did It →</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
