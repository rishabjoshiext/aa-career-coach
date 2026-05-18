import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { resolvePdRole } from '../utils/roleKey.js'
import { PD } from '../utils/pathData.js'
import { DEFAULT_DEGREE_TENURE_MONTHS, ROI_YEARS } from '../utils/roiData.js'
import {
  buildFallbackRoiModel,
  chartYearTicks,
  fmtRupeeMoK,
  pctIncreaseFromBaseline,
  potentialBankBalanceLacs,
  resolveMonthlySalaryRupees,
  suggestedBreakEvenYear,
  totalExtraFromTenPctIncrements,
} from '../utils/roiModel.js'
import { formatBudgetLacs } from '../utils/formatINR.js'

const PATH_TABS = [
  { key: 'accel', label: 'Accelerated', emoji: '🚀', hint: 'Lowest upskilling spend · highest salary lift' },
  { key: 'fast', label: 'Fast Track', emoji: '⚡', hint: 'Moderate investment · balanced returns' },
  { key: 'trad', label: 'Traditional', emoji: '📈', hint: 'Highest investment · slowest salary growth' },
]

const BRAND_PURPLE = '#6320EE'
const EXTRA_EARNINGS_YEARS = 5

function fmtLacs(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return formatBudgetLacs(n)
}

export function Frame5() {
  const nav = useNavigate()
  const { s, selRole, rPath, setRPath, rYear, setRYear, openPathDrawer } = useAppState()

  const [roiModel, setRoiModel] = useState(null)
  const [roiLoading, setRoiLoading] = useState(true)
  const [hoverYear, setHoverYear] = useState(null)

  const pdKey = resolvePdRole(selRole)
  const destinationTitle = (selRole && String(selRole).trim()) || 'your goal'
  const pd = PD[pdKey] || PD['Finance Manager']

  const monthlySalaryRupees = useMemo(() => resolveMonthlySalaryRupees(s), [s])

  const degreeTenureMonths = DEFAULT_DEGREE_TENURE_MONTHS

  useEffect(() => {
    setRoiLoading(true)
    const next = buildFallbackRoiModel({
      monthlySalaryRupees,
      degreeTenureMonths,
    })
    setRoiModel(next)
    setRoiLoading(false)
  }, [monthlySalaryRupees, degreeTenureMonths])

  const stag = roiModel?.stagMonthlyK
  const pathSeries = roiModel?.pathMonthlyK?.[rPath]
  const accelSeries = roiModel?.pathMonthlyK?.accel
  const baselineK = roiModel?.growthBaseK ?? 0

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

  const salaryAccelEnd = accelSeries?.[rYear] ?? 0

  const totalExtra = accelSeries ? totalExtraFromTenPctIncrements(accelSeries, EXTRA_EARNINGS_YEARS) : 0
  const bankApprox = accelSeries ? potentialBankBalanceLacs(accelSeries) : 0
  const beYear = suggestedBreakEvenYear(degreeTenureMonths)

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
            onClick={openPathDrawer}
          >
            View path →
          </button>
        </div>

        <div className="mb-6 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
        Where your career pays off: Earnings <em className="text-[#6320EE] not-italic">with</em> vs{' '}
          <em className="text-[#6320EE] not-italic">without</em> action.
        </div>

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
            <>
              <div className="flex items-end justify-between gap-[6px] sm:gap-[12px]" style={{ minHeight: chartH + 52 }}>
                {ticks.map((yr) => {
                  const hS = Math.round((stag[yr] / chartMaxK) * chartH)
                  const hP = Math.round((pathSeries[yr] / chartMaxK) * chartH)
                  const isHorizon = yr === rYear
                  const isHover = hoverYear === yr
                  const moDelta = Math.max(0, Math.round(pathSeries[yr] - stag[yr]))
                  const pctStag = pctIncreaseFromBaseline(stag[yr], baselineK)
                  const pctPath = pctIncreaseFromBaseline(pathSeries[yr], baselineK)
                  const fmtPct = (p) => (p == null ? '—' : p >= 0 ? `+${p}%` : `${p}%`)
                  return (
                    <div
                      key={`col-${yr}`}
                      className={[
                        'group/col flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-[12px] px-1 pb-1 pt-2 transition-all duration-200',
                        isHover ? 'bg-[rgba(99,32,238,.07)] -translate-y-0.5' : 'hover:bg-[rgba(99,32,238,.05)]',
                      ].join(' ')}
                      onMouseEnter={() => setHoverYear(yr)}
                      onMouseLeave={() => setHoverYear(null)}
                    >
                      <div
                        className={[
                          'mb-1 flex w-full justify-center gap-[4px] text-[10px] font-[800] transition-transform duration-200 sm:text-[11px]',
                          isHover ? 'scale-[1.03]' : '',
                        ].join(' ')}
                      >
                        <span className="text-[#737373]">{fmtRupeeMoK(stag[yr])}</span>
                        <span className="text-[#ccc]">/</span>
                        <span style={{ color: BRAND_PURPLE }}>{fmtRupeeMoK(pathSeries[yr])}</span>
                      </div>
                      {isHover ? (
                        <div className="mb-1 flex w-full flex-col items-center gap-0.5 rounded-[8px] bg-[rgba(99,32,238,.08)] px-2 py-1 text-[9px] font-[800] leading-snug">
                          <span className="text-[#737373]">No action {fmtPct(pctStag)}</span>
                          <span className="text-[#6320EE]">{pathLabel} {fmtPct(pctPath)}</span>
                          {moDelta > 0 ? (
                            <span className="text-[8.5px] font-[700] text-[#888]">+{fmtRupeeMoK(moDelta)} vs no action</span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mb-1 h-[18px]" aria-hidden />
                      )}
                      <div className="flex h-[184px] w-full items-end justify-center gap-[5px]">
                        <div
                          className={[
                            'w-[38%] max-w-[44px] origin-bottom rounded-t-[8px] bg-[linear-gradient(180deg,#e5e5e5,#bdbdbd)] transition-all duration-200 sm:max-w-[52px]',
                            isHover ? 'scale-y-[1.04] opacity-90' : 'group-hover/col:opacity-85',
                          ].join(' ')}
                          style={{ height: `${Math.max(8, hS)}px` }}
                          title={`No action: ${fmtRupeeMoK(stag[yr])} (${fmtPct(pctStag)} vs baseline)`}
                        />
                        <div
                          className={[
                            'w-[38%] max-w-[44px] origin-bottom rounded-t-[8px] bg-[linear-gradient(180deg,#6320EE,#37017B)] transition-all duration-200 sm:max-w-[52px]',
                            isHorizon
                              ? 'shadow-[0_0_20px_rgba(99,32,238,.45)] ring-2 ring-[rgba(250,204,21,.75)]'
                              : isHover
                                ? 'scale-y-[1.06] shadow-[0_12px_28px_rgba(99,32,238,.38)]'
                                : 'shadow-[0_8px_22px_rgba(99,32,238,.22)] group-hover/col:shadow-[0_10px_26px_rgba(99,32,238,.3)]',
                          ].join(' ')}
                          style={{ height: `${Math.max(8, hP)}px` }}
                          title={`${pathLabel}: ${fmtRupeeMoK(pathSeries[yr])} (${fmtPct(pctPath)} vs baseline)`}
                        />
                      </div>
                      <div
                        className={[
                          'mt-2 flex items-center gap-1 text-[11px] font-[800] transition-colors duration-200',
                          isHover || isHorizon ? 'text-[#6320EE]' : 'text-[#555]',
                        ].join(' ')}
                      >
                        {yr === 0 ? 'Now' : `Yr ${yr}`}
                        {isHorizon ? <span className="text-[12px] leading-none text-[#eab308]">★</span> : null}
                      </div>
                    </div>
                  )
                })}
              </div>

            </>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-[13px] font-[600] text-[#aaa]">
              Loading salary curves…
            </div>
          )}
        </div>

        {/* Metric cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { border: '#6320EE', icon: '📈', label: `Your salary by year ${rYear}`, value: fmtRupeeMoK(salaryAccelEnd) },
            { border: '#15803d', icon: '💰', label: 'Total extra earnings', value: fmtLacs(totalExtra) },
            { border: '#eab308', icon: '🏦', label: 'Potential bank balance in 5 years', value: `${fmtLacs(bankApprox)}+` },
            { border: '#6366f1', icon: '⏱️', label: 'Break-even point', value: `Year ${beYear}` },
          ].map((card) => (
            <div
              key={card.label}
              className="flex min-h-[128px] flex-col rounded-[14px] border border-[rgba(0,0,0,.06)] border-t-[4px] bg-white p-[16px] shadow-[0_2px_12px_rgba(0,0,0,.04)]"
              style={{ borderTopColor: card.border }}
            >
              <div className="mb-2 text-[18px] leading-none" aria-hidden>
                {card.icon}
              </div>
              <div className="mb-2 text-[9px] font-[800] uppercase tracking-[.12em] text-[#888]">{card.label}</div>
              <div className="mt-auto text-[26px] font-[800] leading-none text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
                {card.value}
              </div>
            </div>
          ))}
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
