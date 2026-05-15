import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { PathLoader } from '../components/loaders/PathLoader.jsx'
import { ROLE_TAGS } from '../utils/fasttrackData.js'
import {
  aspirationTargetIndustryId,
  buildMappingInsight,
  destinationAnalystNote,
  inferredJourneySampleSize,
  nearCurrentCareerMatch,
  scoreDestination,
} from '../utils/destinationMapping.js'
import {
  buildSafetyNetCards,
  getAllRolesForCareerArea,
  getAnchorRoleTitle,
  getRelevantCareerAreaIds,
  POTENTIAL_CAREER_INDUSTRIES,
  resolveDestinationPack,
} from '../data/roleDestinationPacks.js'
import { AlignmentPanel } from '../components/frame2/AlignmentPanel.jsx'
import { DestinationCardsCarousel } from '../components/frame2/DestinationCardsCarousel.jsx'
import { formatCountIN, formatSalaryLabelIndian } from '../utils/formatINR.js'

function fmtIN(n) {
  return formatCountIN(n)
}

export function Frame2() {
  const nav = useNavigate()
  const { s, selIndustry, setSelIndustry, selRole, setSelRole, pathLoading, setPathLoading } = useAppState()
  const [customRole, setCustomRole] = useState('')
  const alignRef = useRef(null)
  const prevAnchorRef = useRef(null)

  const anchorTitle = useMemo(() => getAnchorRoleTitle(s), [s])
  const pack = useMemo(() => resolveDestinationPack(s), [s])

  useLayoutEffect(() => {
    if (prevAnchorRef.current === null) {
      setSelIndustry(pack.primaryIndustry)
      setSelRole(null)
    } else if (prevAnchorRef.current !== anchorTitle) {
      setSelIndustry(pack.primaryIndustry)
      setSelRole(null)
    }
    prevAnchorRef.current = anchorTitle
  }, [anchorTitle, pack.primaryIndustry, setSelIndustry, setSelRole])

  const mappingInsight = useMemo(() => buildMappingInsight(s), [s])

  const relevantAreaIds = useMemo(
    () => getRelevantCareerAreaIds(pack.primaryIndustry),
    [pack.primaryIndustry],
  )

  const decorateCard = useMemo(() => {
    const dRoleLower = (s.dRole || '').toLowerCase().trim()
    const dTar = aspirationTargetIndustryId(s)
    return (c, opts = {}) => {
      const rn = c.role.toLowerCase()
      const card = { ...c }
      card._matchDream =
        !!(
          dRoleLower &&
          (rn === dRoleLower ||
            rn.includes(dRoleLower) ||
            dRoleLower.includes((rn.split(' ').slice(-1)[0] || '')))
        )
      card._matchFunc = !!(dTar && dTar === c.industry)
      card._nearCurrent = nearCurrentCareerMatch(c, s)
      card._mappingScore = scoreDestination(c, s, mappingInsight)
      card._analystNote = destinationAnalystNote(c, s, mappingInsight)
      if (opts.hero) card._hero = true
      return card
    }
  }, [s, mappingInsight])

  const rolesByArea = useMemo(() => {
    const map = new Map()
    for (const areaId of relevantAreaIds) {
      const raw = getAllRolesForCareerArea(areaId, anchorTitle)
      map.set(
        areaId,
        raw.map((c, i) => decorateCard(c, { hero: areaId === pack.primaryIndustry && i === 0 })),
      )
    }
    return map
  }, [relevantAreaIds, anchorTitle, pack.primaryIndustry, decorateCard])

  const allDeck = useMemo(() => {
    const seen = new Set()
    const list = []
    for (const areaId of relevantAreaIds) {
      for (const c of rolesByArea.get(areaId) || []) {
        const key = `${c.industry}|||${c.role}`
        if (seen.has(key)) continue
        seen.add(key)
        list.push(c)
      }
    }
    list.sort((a, b) => {
      if (a._hero && !b._hero) return -1
      if (!a._hero && b._hero) return 1
      const primaryBoost =
        (a.industry === pack.primaryIndustry ? 2 : 0) - (b.industry === pack.primaryIndustry ? 2 : 0)
      if (primaryBoost !== 0) return primaryBoost
      const diff = (b._mappingScore || 0) - (a._mappingScore || 0)
      if (diff !== 0) return diff
      const sb = (b._matchDream ? 4 : 0) + (b._matchFunc ? 2 : 0) + (b._nearCurrent ? 1 : 0)
      const sa = (a._matchDream ? 4 : 0) + (a._matchFunc ? 2 : 0) + (a._nearCurrent ? 1 : 0)
      return sb - sa
    })
    return list
  }, [relevantAreaIds, rolesByArea, pack.primaryIndustry])

  const filterPills = useMemo(() => {
    const primary = pack.primaryIndustry
    const secondaryIds = relevantAreaIds.filter((id) => id !== primary)

    const rows = []
    const pm = POTENTIAL_CAREER_INDUSTRIES.find((i) => i.id === primary)
    if (pm) {
      rows.push({
        ...pm,
        kind: 'primary',
        pillCount: rolesByArea.get(primary)?.length || 0,
      })
    }
    const allRow = POTENTIAL_CAREER_INDUSTRIES.find((i) => i.id === 'all')
    if (allRow) rows.push({ ...allRow, kind: 'all', pillCount: allDeck.length })
    for (const id of secondaryIds.slice(0, 4)) {
      const m = POTENTIAL_CAREER_INDUSTRIES.find((i) => i.id === id)
      if (!m) continue
      rows.push({ ...m, kind: 'related', pillCount: rolesByArea.get(id)?.length || 0 })
    }
    return rows
  }, [pack.primaryIndustry, relevantAreaIds, rolesByArea, allDeck.length])

  const cards = useMemo(() => {
    if (selIndustry === 'all') return allDeck
    return rolesByArea.get(selIndustry) || []
  }, [allDeck, selIndustry, rolesByArea])

  const safetyCards = useMemo(
    () => buildSafetyNetCards(pack.primaryIndustry, anchorTitle, 3),
    [pack.primaryIndustry, anchorTitle],
  )

  const dreamMatches = useMemo(() => allDeck.filter((c) => c._matchDream).length, [allDeck])

  const nearCurrentMatches = useMemo(() => allDeck.filter((c) => c._nearCurrent).length, [allDeck])

  const badgeText = useMemo(() => {
    const n = inferredJourneySampleSize(s)
    const asp = aspirationTargetIndustryId(s)
    const areaLabel =
      mappingInsight.primaryIndustryId && mappingInsight.primaryIndustryId !== 'all'
        ? mappingInsight.primaryIndustryId
        : s.func && s.func !== 'Other'
          ? s.func
          : asp || 'India-wide'
    return `AI-personalised ranking · ${fmtIN(n)} ${areaLabel} career journeys modelled`
  }, [s, mappingInsight])

  const selectedCard = useMemo(() => {
    if (!selRole) return null
    const fromCards = allDeck.find((c) => c.role === selRole) || cards.find((c) => c.role === selRole)
    if (fromCards) return fromCards
    const fromSafe = safetyCards.find((c) => c.role === selRole)
    if (fromSafe) return fromSafe
    return { role: selRole, industry: pack.primaryIndustry }
  }, [selRole, allDeck, cards, safetyCards, pack.primaryIndustry])

  const alignChecks = useMemo(() => {
    if (!selectedCard) return []
    if (selectedCard._isSafetyNet) {
      return [
        `${selectedCard.role} — a stable, predictable role in ${selectedCard.industry}`,
        `Starting salary band ${formatSalaryLabelIndian(selectedCard.sal)} · steady incremental growth`,
        `${selectedCard.jobs} active openings · ${selectedCard.apnaJobs} on Apna right now`,
        'Lower entry barrier · works as fallback or warm-up path',
        'Predictable career arc — no high-stakes pivots needed',
      ]
    }
    return [
      `${selectedCard.role} role at a respected company in ${selectedCard.industry}`,
      `Salary to ${formatSalaryLabelIndian(selectedCard.sal)} by Year ${selectedCard.accelYrs} on accelerated path`,
      `${selectedCard.jobs} active job openings in India · ${selectedCard.apnaJobs} on Apna alone`,
      `${fmtIN(selectedCard.dbProfiles)} people walked this same path`,
      `${selectedCard.growth} 5-year demand growth — supply shortage is real`,
    ]
  }, [selectedCard])

  const frame2CanProceed = useMemo(() => Boolean(selRole && String(selRole).trim()), [selRole])

  useEffect(() => {
    if (!selectedCard) return
    window.setTimeout(() => {
      alignRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }, [selectedCard])

  return (
    <section className="absolute inset-0 overflow-y-auto px-9 pb-8 pt-7" data-app-page-scroll>
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-[20px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-[13px] py-[5px] text-[11px] font-[700] text-[#37017B]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#37017B] motion-safe:animate-[blink_1.2s_infinite]" />
          {badgeText}
        </div>

        <div className="mb-1 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
          Your potential <em className="text-[#37017B] not-italic">career destinations</em>
        </div>
        <div className="mb-[14px] text-[13px] leading-[1.55] text-[#555]">
          Data-backed outcomes for <strong className="font-[800] text-[#0C0C0C]">{anchorTitle || 'your goal'}</strong>
          {s.exp !== 'fresher' && String(s.role || '').trim()
            ? ' — from your current designation.'
            : ' — from your dream role (no current title yet).'}{' '}
          Filters show every role in each relevant area from our catalogue — pick any card to see your journey.
        </div>

        <div className="mb-[14px] rounded-[11px] border border-[rgba(117,4,255,.2)] bg-[linear-gradient(135deg,rgba(117,4,255,.06),rgba(55,1,123,.04))] px-4 py-[12px]">
          <div className="mb-[6px] flex flex-wrap items-center gap-[8px]">
            <span className="rounded-[20px] bg-[rgba(117,4,255,.12)] px-[9px] py-[3px] text-[9px] font-[800] uppercase tracking-[.07em] text-[#7504FF]">
              Curated pack
            </span>
            <span className="text-[12px] font-[800] text-[#0C0C0C]">{pack.label}</span>
          </div>
          <p className="text-[12px] leading-[1.5] text-[#555]">
            {mappingInsight.reason} Unlisted titles will use live role-mapping (API) in a later release — this screen uses
            the offline catalogue.
          </p>
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
          Filter this shortlist
        </div>
        <div className="relative mb-[18px]">
          <div id="functional-area-pills" className="flex flex-wrap gap-[6px]">
            {filterPills.map((ind) => {
              const on = selIndustry === ind.id
              const isPrimary = ind.kind === 'primary'
              return (
                <button
                  key={`${ind.kind}-${ind.id}`}
                  type="button"
                  className={[
                    'relative inline-flex shrink-0 items-center gap-[6px] rounded-[50px] border-[1.5px] px-[13px] py-[7px] text-[11px] font-[700] transition-all duration-200',
                    on
                      ? 'border-[#37017B] bg-[#37017B] text-white shadow-[0_3px_14px_rgba(55,1,123,.35)]'
                      : 'border-[rgba(0,0,0,.07)] bg-white text-[#888] hover:border-[rgba(55,1,123,.14)] hover:text-[#37017B]',
                  ].join(' ')}
                  onClick={() => {
                    setSelIndustry(ind.id)
                    setSelRole(null)
                  }}
                >
                  {isPrimary && !on ? (
                    <span className="absolute right-[-2px] top-[-2px] h-[7px] w-[7px] rounded-full border-[1.5px] border-[#FAF9F4] bg-[#48DB85]" />
                  ) : null}
                  <span className={on ? 'opacity-100' : ''}>
                    {ind.ico}{' '}
                    {isPrimary ? (
                      <>
                        For you · <span className="text-[11px]">{ind.n}</span>
                      </>
                    ) : (
                      ind.n
                    )}{' '}
                  </span>
                  <span
                    className={[
                      'text-[10px] font-[700] opacity-65',
                      on ? 'text-white/90 opacity-100' : '',
                    ].join(' ')}
                  >
                    ({ind.pillCount})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <DestinationCardsCarousel resetKey={selIndustry} className="mb-2">
          {cards.map((d) => {
            const dreamCos = d.dreamCompanies?.length ? d.dreamCompanies : []
            const areaIco =
              POTENTIAL_CAREER_INDUSTRIES.find((i) => i.id === d.industry)?.ico ||
              ROLE_TAGS[d.industry]?.ico ||
              '🎯'
            const selected = selRole === d.role
            return (
              <button
                key={`${d.industry}:${d.role}`}
                type="button"
                data-carousel-card
                title={d._analystNote}
                className={[
                  'group relative w-[min(100%,300px)] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[16px] border-2 border-[rgba(0,0,0,.07)] bg-white p-5 text-left transition-all duration-200 sm:w-[300px]',
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
                {d._hero ? (
                  <div className="absolute left-[11px] top-[11px] rounded-[20px] bg-[rgba(55,1,123,.12)] px-[7px] py-[3px] text-[9px] font-[800] uppercase tracking-[.05em] text-[#37017B]">
                    Top pick
                  </div>
                ) : null}
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
                  <span className="mr-[6px]">{areaIco} </span>
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
                <div className="text-[19px] font-[800]">{formatSalaryLabelIndian(d.sal)}</div>
                <div className="mt-[2px] text-[11px] font-[600] text-[#37017B]">
                  ↑ {d.growth} 5-yr demand growth · {d.jobs} open in India
                </div>
                <div className="mt-[6px] flex items-center gap-[5px] rounded-[6px] bg-[rgba(55,1,123,.07)] px-2 py-[5px] text-[10.5px] font-[700] text-[#37017B]">
                  <span className="rounded-[4px] bg-[#FF6B00] px-[6px] py-[2px] text-[11px] font-[900] uppercase tracking-[.05em] text-white">
                    apna
                  </span>
                  {d.apnaJobs} matches from Apna jobs
                </div>

                {dreamCos.length > 0 ? (
                  <div
                    className={[
                      'mt-[10px] border-t border-dashed border-[rgba(0,0,0,.07)] pt-[10px]',
                      selected ? '' : 'hidden group-hover:block',
                    ].join(' ')}
                  >
                    <div className="mb-[6px] text-[9px] font-[800] uppercase tracking-[.05em] text-[#7504FF]">
                      Dream companies
                    </div>
                    <div className="flex flex-wrap gap-[3px]">
                      {dreamCos.slice(0, 5).map((c) => (
                        <span
                          key={c}
                          className="rounded-[5px] bg-[rgba(117,4,255,.08)] px-[7px] py-[2px] text-[9.5px] font-[600] text-[#7504FF]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

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
        </DestinationCardsCarousel>

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
        {safetyCards.length > 0 ? (
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
                  Stable options in <strong className="font-[800] text-[#0C0C0C]">{pack.primaryIndustry}</strong> only —
                  lower barriers, steady demand. Click a card to open your journey.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[11px] lg:grid-cols-3">
              {safetyCards.map((sr) => {
                const picked = selRole === sr.role
                return (
                <button
                  key={`safe-${sr.role}`}
                  type="button"
                  className={[
                    'relative cursor-pointer rounded-[13px] border-[1.5px] border-[rgba(34,197,94,.18)] bg-[linear-gradient(135deg,#fff,rgba(34,197,94,.025))] p-[14px] text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-[rgba(34,197,94,.4)] hover:shadow-[0_6px_18px_rgba(34,197,94,.1)]',
                    picked ? 'border-[#22c55e] ring-2 ring-[rgba(34,197,94,.25)]' : '',
                  ].join(' ')}
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
                      <div className="text-[14px] font-[800] text-[#0C0C0C]">{formatSalaryLabelIndian(sr.sal)}</div>
                    </div>
                    <div className="text-[10px] font-[700] text-[#22c55e]">{sr.apnaJobs} on Apna</div>
                  </div>
                </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div ref={alignRef}>
          <AlignmentPanel
            selected={selectedCard}
            alignChecks={alignChecks}
            onConfirm={() => setPathLoading(true)}
            onClose={() => setSelRole(null)}
            confirmDisabled={!frame2CanProceed}
            confirmHint={!frame2CanProceed && selectedCard ? 'Pick one destination card above to continue.' : ''}
          />
        </div>

        <div className="mt-[22px] flex items-center gap-[10px]">
          <Button variant="ghost" onClick={() => nav('/1')}>
            ← Back
          </Button>
        </div>
      </div>

      {pathLoading ? (
        <PathLoader
          open
          role={selRole || 'your goal'}
          onDone={() => {
            setPathLoading(false)
            nav('/3')
          }}
        />
      ) : null}
    </section>
  )
}

