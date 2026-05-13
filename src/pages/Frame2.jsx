import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { PathLoader } from '../components/loaders/PathLoader.jsx'
import {
  COMPANY_TIERS,
  INDUSTRIES,
  ROLE_TAGS,
  flattenIndustryRoles,
  safeRolesForIndustry,
} from '../utils/fasttrackData.js'
import {
  buildMappingInsight,
  destinationAnalystNote,
  inferredJourneySampleSize,
  nearCurrentCareerMatch,
  scoreDestination,
} from '../utils/destinationMapping.js'
import { AlignmentPanel } from '../components/frame2/AlignmentPanel.jsx'

function fmtIN(n) {
  if (typeof n === 'number') return n.toLocaleString('en-IN')
  return String(n || '')
}

export function Frame2() {
  const nav = useNavigate()
  const { s, selIndustry, setSelIndustry, selRole, setSelRole, pathLoading, setPathLoading } = useAppState()
  const [customRole, setCustomRole] = useState('')
  const alignRef = useRef(null)

  const mappingInsight = useMemo(() => buildMappingInsight(s), [s])

  useEffect(() => {
    const id = mappingInsight.primaryIndustryId
    const ok = id && id !== 'all' && INDUSTRIES.some((i) => i.id === id)
    if (!ok) return
    // Preselect the mapped functional area. Once user clicks a pill, we respect their choice.
    setSelIndustry((prev) => {
      if (!prev || prev === 'all') return id
      // If current selection is not a known pill (e.g., older persisted state), recover to mapped id.
      const exists = INDUSTRIES.some((i) => i.id === prev)
      return exists ? prev : id
    })
  }, [mappingInsight.primaryIndustryId, setSelIndustry])

  const orderedIndustries = useMemo(() => {
    const all = INDUSTRIES.slice()
    if (!selIndustry || selIndustry === 'all') return all
    const sel = all.find((x) => x.id === selIndustry)
    const rest = all.filter((x) => x.id !== selIndustry && x.id !== 'all')
    const allChip = all.find((x) => x.id === 'all')
    // Requirement: selected pill moves in front; others remain unselected behind it.
    return [sel, allChip, ...rest].filter(Boolean)
  }, [selIndustry])

  const cards = useMemo(() => {
    const list = flattenIndustryRoles(selIndustry).map((c) => ({ ...c }))
    const dRoleLower = (s.dRole || '').toLowerCase().trim()
    const dTar = s.dTarFunc && s.dTarFunc !== 'Open / System should suggest' ? s.dTarFunc : ''
    list.forEach((c) => {
      const rn = c.role.toLowerCase()
      c._matchDream =
        !!(
          dRoleLower &&
          (rn === dRoleLower ||
            rn.includes(dRoleLower) ||
            dRoleLower.includes((rn.split(' ').slice(-1)[0] || '')))
        )
      c._matchFunc = !!(dTar && dTar === c.industry)
      c._nearCurrent = nearCurrentCareerMatch(c, s)
      c._mappingScore = scoreDestination(c, s, mappingInsight)
      c._analystNote = destinationAnalystNote(c, s, mappingInsight)
    })
    list.sort((a, b) => {
      const diff = (b._mappingScore || 0) - (a._mappingScore || 0)
      if (diff !== 0) return diff
      const sb = (b._matchDream ? 4 : 0) + (b._matchFunc ? 2 : 0) + (b._nearCurrent ? 1 : 0)
      const sa = (a._matchDream ? 4 : 0) + (a._matchFunc ? 2 : 0) + (a._nearCurrent ? 1 : 0)
      return sb - sa
    })
    return list
  }, [selIndustry, s, mappingInsight])

  const safeRoles = useMemo(() => safeRolesForIndustry(selIndustry), [selIndustry])

  const dreamMatches = useMemo(() => cards.filter((c) => c._matchDream).length, [cards])

  const nearCurrentMatches = useMemo(() => cards.filter((c) => c._nearCurrent).length, [cards])

  const badgeText = useMemo(() => {
    const n = inferredJourneySampleSize(s)
    const areaLabel =
      mappingInsight.primaryIndustryId && mappingInsight.primaryIndustryId !== 'all'
        ? mappingInsight.primaryIndustryId
        : s.func && s.func !== 'Other'
          ? s.func
          : s.dTarFunc && s.dTarFunc !== 'Open / System should suggest'
            ? s.dTarFunc
            : 'India-wide'
    return `AI-personalised ranking · ${fmtIN(n)} ${areaLabel} career journeys modelled`
  }, [s, mappingInsight])

  const selectedCard = useMemo(() => {
    if (!selRole) return null
    // selRole can be set by safety cards too; handle both
    const fromCards = cards.find((c) => c.role === selRole)
    if (fromCards) return fromCards
    // search safety role list
    const fromSafe = safeRoles.find((r) => r.role === selRole)
    if (fromSafe)
      return {
        role: fromSafe.role,
        industry: fromSafe.industry,
        desc: fromSafe.desc,
        sal: fromSafe.sal,
        jobs: fromSafe.jobs,
        apnaJobs: fromSafe.apnaJobs,
        accelYrs: '—',
        fastYrs: '—',
        tradYrs: '—',
        dbProfiles: 1500,
        growth: '+18%',
        naukri: 8000,
        linkedin: 5000,
      }
    return { role: selRole, industry: 'all' }
  }, [selRole, cards, safeRoles])

  const alignChecks = useMemo(() => {
    if (!selectedCard) return []
    if (selectedCard.accelYrs === '—') {
      return [
        `${selectedCard.role} — a stable, predictable role in ${selectedCard.industry}`,
        `Starting salary band ${selectedCard.sal}/mo · steady incremental growth`,
        `${selectedCard.jobs} active openings · ${selectedCard.apnaJobs} on Apna right now`,
        'Lower entry barrier · works as fallback or warm-up path',
        'Predictable career arc — no high-stakes pivots needed',
      ]
    }
    return [
      `${selectedCard.role} role at a respected company in ${selectedCard.industry}`,
      `Salary to ${selectedCard.sal}/mo by Year ${selectedCard.accelYrs} on accelerated path`,
      `${selectedCard.jobs} active job openings in India · ${selectedCard.apnaJobs} on Apna alone`,
      `${fmtIN(selectedCard.dbProfiles)} people walked this same path`,
      `${selectedCard.growth} 5-year demand growth — supply shortage is real`,
    ]
  }, [selectedCard])

  const frame2CanProceed = useMemo(
    () => Boolean(selRole && String(selRole).trim()) && Boolean(selIndustry && selIndustry !== 'all'),
    [selRole, selIndustry],
  )

  useEffect(() => {
    if (!selectedCard) return
    window.setTimeout(() => {
      alignRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }, [selectedCard])

  return (
    <section className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-[20px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-[13px] py-[5px] text-[11px] font-[700] text-[#37017B]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#37017B] motion-safe:animate-[blink_1.2s_infinite]" />
          {badgeText}
        </div>

        <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
          Your potential <em className="text-[#37017B] not-italic">career destinations</em>
        </div>
        <div className="mb-[14px] text-[13px] leading-[1.55] text-[#555]">
          Data-backed outcomes — not suggestions. Filter by function. Hover any role to see how the data was sourced.
        </div>

        <div className="mb-[14px] rounded-[11px] border border-[rgba(117,4,255,.2)] bg-[linear-gradient(135deg,rgba(117,4,255,.06),rgba(55,1,123,.04))] px-4 py-[12px]">
          <div className="mb-[6px] flex flex-wrap items-center gap-[8px]">
            <span className="rounded-[20px] bg-[rgba(117,4,255,.12)] px-[9px] py-[3px] text-[9px] font-[800] uppercase tracking-[.07em] text-[#7504FF]">
              Mapping engine
            </span>
            <span className="text-[12px] font-[800] text-[#0C0C0C]">{mappingInsight.headline}</span>
          </div>
          <p className="text-[12px] leading-[1.5] text-[#555]">{mappingInsight.reason}</p>
        </div>

        {dreamMatches > 0 && s.dRole && (
          <div className="mb-[14px] flex items-center gap-[10px] rounded-[11px] border border-[rgba(72,219,133,.25)] bg-[linear-gradient(135deg,rgba(72,219,133,.08),rgba(72,219,133,.03))] px-4 py-[11px]">
            <div className="text-[16px]">🎯</div>
            <div className="text-[12px] font-[700] leading-[1.4] text-[#0C0C0C]">
              Your dream of <em className="not-italic text-[#22c55e]">{s.dRole}</em> matches{' '}
              <em className="not-italic text-[#22c55e]">
                {dreamMatches} {dreamMatches === 1 ? 'destination' : 'destinations'}
              </em>{' '}
              below — highlighted in green
            </div>
          </div>
        )}

        {nearCurrentMatches > 0 && s.exp !== 'fresher' && (s.role || s.func) && (
          <div className="mb-[14px] flex items-center gap-[10px] rounded-[11px] border border-[rgba(117,4,255,.22)] bg-[linear-gradient(135deg,rgba(117,4,255,.05),rgba(250,249,244,.9))] px-4 py-[11px]">
            <div className="text-[16px]">◎</div>
            <div className="text-[12px] font-[700] leading-[1.4] text-[#0C0C0C]">
              <em className="not-italic text-[#7504FF]">{nearCurrentMatches}</em>{' '}
              {nearCurrentMatches === 1 ? 'destination' : 'destinations'} sit close to{' '}
              <em className="not-italic text-[#7504FF]">
                {s.func ? `${s.func}` : 'Your profile'}
                {s.role ? ` · ${s.role}` : ''}
              </em>{' '}
              — marked <span className="font-[800] text-[#7504FF]">Near today</span>
            </div>
          </div>
        )}

        <div className="mb-2 text-[10px] font-[700] uppercase tracking-[.09em] text-[#bbb]">
          Filter by functional area
        </div>
        <div className="mb-[18px] flex flex-wrap gap-[6px]">
          {orderedIndustries.map((ind) => {
            const cnt =
              ind.id === 'all'
                ? Object.values(flattenIndustryRoles('all')).length
                : (flattenIndustryRoles(ind.id) || []).length
            const isMatch =
              (s.dTarFunc === ind.id && ind.id !== 'all') ||
              (s.func === ind.id && ind.id !== 'all') ||
              (mappingInsight.primaryIndustryId === ind.id && ind.id !== 'all')
            const on = selIndustry === ind.id
            return (
              <button
                key={ind.id}
                className={[
                  'relative inline-flex items-center gap-[6px] rounded-[50px] border-[1.5px] border-[rgba(0,0,0,.07)] bg-white px-[13px] py-[7px] text-[11px] font-[700] text-[#888] transition-all duration-200',
                  'hover:border-[rgba(55,1,123,.14)] hover:text-[#37017B]',
                  on
                    ? 'border-[rgba(55,1,123,.24)] bg-[rgba(55,1,123,.1)] text-[#37017B] shadow-[0_2px_10px_rgba(55,1,123,.08)]'
                    : '',
                ].join(' ')}
                onClick={() => {
                  setSelIndustry(ind.id)
                  setSelRole(null)
                }}
              >
                {isMatch && !on && ind.id !== 'all' && (
                  <span className="absolute right-[-2px] top-[-2px] h-[7px] w-[7px] rounded-full border-[1.5px] border-[#FAF9F4] bg-[#48DB85]" />
                )}
                {ind.ico} {ind.n}{' '}
                <span className={['text-[10px] font-[700] opacity-65', on ? 'text-[#37017B] opacity-100' : ''].join(' ')}>
                  ({cnt})
                </span>
              </button>
            )
          })}
        </div>

        <div className="grid max-h-[580px] grid-cols-1 gap-[13px] overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((d) => {
            const tiers = COMPANY_TIERS[d.industry] || COMPANY_TIERS.Finance
            const selected = selRole === d.role
            return (
              <button
                key={`${d.industry}:${d.role}`}
                type="button"
                title={d._analystNote}
                className={[
                  'group relative cursor-pointer overflow-hidden rounded-[16px] border-2 border-[rgba(0,0,0,.07)] bg-white p-5 text-left transition-all duration-200',
                  'hover:-translate-y-[2px] hover:border-[rgba(55,1,123,.14)] hover:shadow-[0_6px_20px_rgba(55,1,123,.07)]',
                  selected ? 'border-[#37017B]' : '',
                  d._matchDream ? 'border-[rgba(72,219,133,.5)]' : '',
                  d._nearCurrent && !d._matchDream ? 'border-[rgba(117,4,255,.35)]' : '',
                ].join(' ')}
                onClick={() => setSelRole(d.role)}
              >
                <div
                  className={[
                    'absolute left-0 right-0 top-0 h-[3px] bg-[rgba(0,0,0,.07)] transition-colors duration-200',
                    selected ? 'bg-[#37017B]' : '',
                    d._matchDream ? 'bg-[#48DB85]' : '',
                    d._nearCurrent && !d._matchDream ? 'bg-[#7504FF]' : '',
                  ].join(' ')}
                />
                {d._matchDream ? (
                  <div className="absolute right-[11px] top-[11px] rounded-[20px] bg-[#48DB85] px-[7px] py-[3px] text-[9px] font-[800] uppercase tracking-[.05em] text-[#0C0C0C]">
                    ★ Your dream
                  </div>
                ) : d._nearCurrent ? (
                  <div className="absolute right-[11px] top-[11px] rounded-[20px] bg-[rgba(117,4,255,.15)] px-[7px] py-[3px] text-[9px] font-[800] uppercase tracking-[.05em] text-[#7504FF]">
                    Near today
                  </div>
                ) : null}

                <div className="mb-[9px] inline-flex rounded-[20px] px-[9px] py-[3px] text-[10px] font-[700] uppercase tracking-[.07em]">
                  <span className="mr-[6px]">
                    {(ROLE_TAGS[d.industry]?.ico || '🎯') + ' '}
                  </span>
                  <span
                    className={[
                      'rounded-[20px] px-[9px] py-[3px]',
                      d.industry === 'Finance'
                        ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]'
                        : d.industry === 'HR'
                          ? 'bg-[rgba(117,4,255,.1)] text-[#7504FF]'
                          : d.industry === 'Marketing'
                            ? 'bg-[rgba(239,68,68,.08)] text-[#dc2626]'
                            : d.industry === 'Sales'
                              ? 'bg-[rgba(249,115,22,.08)] text-[#ea580c]'
                              : 'bg-[rgba(0,0,0,.04)] text-[#888]',
                    ].join(' ')}
                  >
                    {d.industry}
                  </span>
                </div>

                <div className="mb-[3px] text-[19px] [font-family:'DM Serif Display',serif]">
                  {d.role}
                </div>
                <div className="mb-3 text-[12px] text-[#555]">{d.desc}</div>

                <div className="mb-3 flex flex-col gap-1">
                  <div className="flex justify-between rounded-[6px] px-[7px] py-1 text-[11px]">
                    <span className="text-[#aaa]">Traditional</span>
                    <span className="font-[700] text-[#0C0C0C]">{d.tradYrs} yrs</span>
                  </div>
                  <div className="flex justify-between rounded-[6px] px-[7px] py-1 text-[11px]">
                    <span className="font-[600] text-[#FFD700]">⚡ Fast Track</span>
                    <span className="font-[700] text-[#FFD700]">{d.fastYrs} yrs</span>
                  </div>
                  <div className="flex justify-between rounded-[6px] bg-[rgba(72,219,133,.08)] px-[7px] py-1 text-[11px]">
                    <span className="font-[600] text-[#48DB85]">🚀 Accelerated</span>
                    <span className="font-[700] text-[#48DB85]">{d.accelYrs} yrs</span>
                  </div>
                </div>

                <div className="my-[10px] h-px w-full bg-[rgba(0,0,0,.07)]" />

                <div className="mb-[3px] text-[10px] font-[700] uppercase tracking-[.07em] text-[#bbb]">
                  Target Salary (Year {d.accelYrs})
                </div>
                <div className="text-[19px] font-[800]">{d.sal}/mo</div>
                <div className="mt-[2px] text-[11px] font-[600] text-[#37017B]">
                  ↑ {d.growth} 5-yr demand growth · {d.jobs} open in India
                </div>
                <div className="mt-[6px] flex items-center gap-[5px] rounded-[6px] bg-[rgba(55,1,123,.07)] px-2 py-[5px] text-[10.5px] font-[700] text-[#37017B]">
                  <span className="rounded-[4px] bg-[#FF6B00] px-[6px] py-[2px] text-[11px] font-[900] uppercase tracking-[.05em] text-white">
                    apna
                  </span>
                  {d.apnaJobs} matches from Apna jobs
                </div>

                {/* tiers show on hover/selected */}
                <div className={['mt-[10px] border-t border-dashed border-[rgba(0,0,0,.07)] pt-[10px]', selected ? '' : 'hidden group-hover:block'].join(' ')}>
                  {[
                    { lbl: 'Dream', cls: 'text-[#7504FF]', cos: tiers.dream, pill: 'bg-[rgba(117,4,255,.08)] text-[#7504FF]' },
                    { lbl: 'Regular', cls: 'text-[#888]', cos: tiers.regular, pill: 'bg-[#f4f3ee] text-[#666]' },
                    { lbl: 'Safety Net', cls: 'text-[#22c55e]', cos: tiers.safe, pill: 'bg-[rgba(34,197,94,.08)] text-[#22c55e]' },
                  ].map((row) => (
                    <div key={row.lbl} className="mb-[6px] flex items-center gap-2 last:mb-0">
                      <div className={['w-[60px] flex-shrink-0 text-[9px] font-[800] uppercase tracking-[.05em]', row.cls].join(' ')}>
                        {row.lbl}
                      </div>
                      <div className="flex flex-wrap gap-[3px]">
                        {row.cos.slice(0, 4).map((c) => (
                          <span key={c} className={['rounded-[5px] px-[7px] py-[2px] text-[9.5px] font-[600]', row.pill].join(' ')}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* hover validation overlay — v6 HTML: white fade, not black */}
                <div
                  className={[
                    'pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[16px] px-[18px] pb-[14px] pt-[36px] opacity-0 transition-opacity duration-[220ms] ease-out group-hover:opacity-100',
                    'bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.95)_22%,#fff_50%,#fff_100%)]',
                    'text-[#0C0C0C] shadow-[inset_0_-2px_0_0_rgba(55,1,123,.08)]',
                  ].join(' ')}
                >
                  <div className="mb-[7px] flex items-center gap-[5px] text-[9px] font-[800] uppercase tracking-[.08em] text-[#aaa] after:mt-[1px] after:h-px after:flex-1 after:bg-[repeating-linear-gradient(90deg,rgba(0,0,0,.08)_0_2px,transparent_2px_5px)] after:content-['']">
                    Validated across
                  </div>
                  <div className="flex justify-between text-[11px] font-[600] text-[#555]">
                    <span>Apna database</span>
                    <span className="font-[800] text-[#37017B] [font-variant-numeric:tabular-nums]">{fmtIN(d.dbProfiles)} profiles</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-[600] text-[#555]">
                    <span>Naukri postings</span>
                    <span className="font-[800] text-[#37017B] [font-variant-numeric:tabular-nums]">{fmtIN(d.naukri)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-[600] text-[#555]">
                    <span>LinkedIn jobs</span>
                    <span className="font-[800] text-[#37017B] [font-variant-numeric:tabular-nums]">{fmtIN(d.linkedin)}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-[10px] flex gap-[9px]">
          <input
            className="flex-1 rounded-[9px] border-[1.5px] border-dashed border-[rgba(55,1,123,.2)] bg-transparent px-[13px] py-[9px] text-[13px] outline-none placeholder:text-[#ccc]"
            placeholder="+ Counselor: type a custom role to map…"
            value={customRole}
            onChange={(e) => {
              const v = e.target.value
              setCustomRole(v)
              if (v.trim().length > 3) setSelRole(v.trim())
            }}
          />
        </div>

        {/* Safety net */}
        {safeRoles.length > 0 && (
          <div className="mt-[22px] border-t border-dashed border-[rgba(0,0,0,.08)] pt-5">
            <div className="mb-[14px] flex items-start gap-[11px]">
              <div className="inline-flex flex-shrink-0 items-center gap-[6px] rounded-[20px] border border-[rgba(34,197,94,.22)] bg-[rgba(34,197,94,.08)] px-[11px] py-[5px] text-[10px] font-[800] uppercase tracking-[.07em] text-[#22c55e]">
                ⛨ Safety Net
              </div>
              <div className="flex-1">
                <div className="mb-[3px] text-[18px] leading-[1.25] [font-family:'DM Serif Display',serif]">
                  Safer alternatives — <em className="not-italic text-[#22c55e]">built for stable growth</em>
                </div>
                <div className="text-[11.5px] leading-[1.5] text-[#555]">
                  If the destinations above feel too far, these roles offer steady demand, lower entry barriers, and reliable
                  career progression. Use these as fallback or warm-up paths.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[11px] lg:grid-cols-3">
              {safeRoles.map((sr) => (
                <button
                  key={sr.role}
                  className="relative cursor-pointer rounded-[13px] border-[1.5px] border-[rgba(34,197,94,.18)] bg-[linear-gradient(135deg,#fff,rgba(34,197,94,.025))] p-[14px] text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-[rgba(34,197,94,.4)] hover:shadow-[0_6px_18px_rgba(34,197,94,.1)]"
                  onClick={() => setSelRole(sr.role)}
                >
                  <div className="mb-2 inline-block rounded-[4px] bg-[rgba(34,197,94,.08)] px-[7px] py-[2px] text-[9px] font-[800] uppercase tracking-[.06em] text-[#22c55e]">
                    {sr.industry}
                  </div>
                  <div className="mb-[3px] text-[15px] leading-[1.25] [font-family:'DM Serif Display',serif]">{sr.role}</div>
                  <div className="mb-[10px] text-[10.5px] leading-[1.45] text-[#888]">{sr.desc}</div>
                  <div className="flex items-end justify-between border-t border-[rgba(34,197,94,.1)] pt-[9px]">
                    <div>
                      <div className="text-[9px] font-[700] uppercase tracking-[.06em] text-[#aaa]">Starting salary</div>
                      <div className="text-[14px] font-[800] text-[#0C0C0C]">{sr.sal}</div>
                    </div>
                    <div className="text-[10px] font-[700] text-[#22c55e]">{sr.apnaJobs} on Apna</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={alignRef}>
          <AlignmentPanel
            selected={selectedCard}
            alignChecks={alignChecks}
            onConfirm={() => setPathLoading(true)}
            onClose={() => setSelRole(null)}
            confirmDisabled={!frame2CanProceed}
            confirmHint={
              !frame2CanProceed && selectedCard
                ? 'Pick a functional-area filter above (not “All industries”) to continue to your journey.'
                : ''
            }
          />
        </div>

        <div className="mt-[22px] flex items-center gap-[10px]">
          <Button variant="ghost" onClick={() => nav('/1')}>
            ← Back
          </Button>
        </div>
      </div>

      <PathLoader
        open={pathLoading}
        role={selRole || 'your goal'}
        onDone={() => {
          setPathLoading(false)
          nav('/3')
        }}
      />
    </section>
  )
}

