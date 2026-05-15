import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { resolvePdRole } from '../utils/roleKey.js'
import { flattenIndustryRoles, INDUSTRIES } from '../utils/fasttrackData.js'
import { PD } from '../utils/pathData.js'
import {
  buildFallbackStories,
  conservativeHikePct,
  conservativePlacedPct,
  fetchStoriesWithOpenAI,
  liveReviewersCount,
} from '../utils/socialStoriesData.js'

const PATH_LABELS = [
  { key: 'accel', label: 'Accelerated' },
  { key: 'fast', label: 'Fast Track' },
  { key: 'trad', label: 'Traditional' },
]

export function Frame6() {
  const nav = useNavigate()
  const { s, selIndustry, selRole, gapPath } = useAppState()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const pdKey = resolvePdRole(selRole)
  const destinationTitle = (selRole && String(selRole).trim()) || 'your goal'
  const pd = PD[pdKey] || PD['Finance Manager']
  const pathLabel = PATH_LABELS.find((p) => p.key === gapPath)?.label ?? 'Accelerated'
  const pathYears = pd[gapPath]?.yrs ?? pd.accel?.yrs ?? '—'

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

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const ai = await fetchStoriesWithOpenAI({
        destinationTitle: roleTitle,
        industryLabel,
        card: roleCard,
      })
      const list = ai && ai.length >= 8 ? ai.slice(0, 8) : buildFallbackStories(destinationTitle)
      if (!cancelled) {
        setStories(list)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [roleTitle, industryLabel, roleCard, destinationTitle])

  const stats = useMemo(() => {
    const hike = conservativeHikePct(roleCard, destinationTitle)
    const placed = conservativePlacedPct(destinationTitle)
    const reviewers = liveReviewersCount(roleCard, destinationTitle)
    const db = roleCard?.dbProfiles
    const dbStr = typeof db === 'number' ? db.toLocaleString('en-IN') : '2,100+'
    return {
      hike,
      jobs: roleCard?.jobs || '—',
      placed,
      reviewers,
      dbStr,
    }
  }, [roleCard, destinationTitle])

  const displayName = (s.name || '').trim()
  const headingEm = displayName || 'professionals like you'

  return (
    <section className="absolute inset-0 overflow-y-auto px-9 pb-10 pt-7" data-app-page-scroll>
      <div className="mx-auto max-w-[1060px]">
        <div className="mb-[14px] flex flex-wrap items-center gap-[6px] text-[11px] font-[600] text-[#bbb]">
          <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-[3px] text-[#37017B]">6 · Stories</span>
          <span className="text-[#ddd]">›</span>
          <span className="text-[#ccc]">{destinationTitle}</span>
        </div>

        {/* Goal ingress — matches prototype */}
        <button
          type="button"
          onClick={() => nav('/3')}
          className="mb-5 flex w-full items-center gap-3 rounded-[11px] border border-[rgba(168,85,247,.2)] bg-[linear-gradient(135deg,#0C0C0C,#1a1a1a)] px-[14px] py-[10px] text-left transition hover:border-[rgba(168,85,247,.35)]"
        >
          <span className="text-[20px] text-[#48DB85]" aria-hidden>
            ⚡
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-[800] uppercase tracking-[.1em] text-[rgba(250,249,244,.45)]">Your selected goal</div>
            <div className="truncate text-[13px] font-[800] text-[#FAF9F4]">
              {pathLabel} path · {pathYears} years to {destinationTitle}
            </div>
          </div>
          <span className="flex-shrink-0 text-[12px] font-[700] text-[#48DB85]">View path →</span>
        </button>

        <div className="mb-2 text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
          People exactly <em className="text-[#37017B] not-italic">{headingEm}</em> — before and after.
        </div>
        <p className="mb-6 max-w-[720px] text-[13px] leading-[1.55] text-[#555]">
          Same background. Same starting salary band. They chose a structured path toward{' '}
          <strong className="text-[#0C0C0C]">{destinationTitle}</strong>.
        </p>

        {/* 4 dark stat tiles */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[linear-gradient(135deg,#0C0C0C,#111)] px-4 py-3.5 text-center">
            <div className="[font-family:'DM Serif Display',serif] text-[26px] leading-none text-[#48DB85]">+{stats.hike}%</div>
            <div className="mt-2 text-[11px] font-[600] leading-snug text-[rgba(250,249,244,.45)]">
              Median salary uplift after structured path
            </div>
          </div>
          <div className="rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[linear-gradient(135deg,#0C0C0C,#111)] px-4 py-3.5 text-center">
            <div className="[font-family:'DM Serif Display',serif] text-[26px] leading-none text-[#48DB85]">{stats.jobs}</div>
            <div className="mt-2 text-[11px] font-[600] leading-snug text-[rgba(250,249,244,.45)]">
              Open {destinationTitle} roles · India (aggregated listings)
            </div>
          </div>
          <div className="rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[linear-gradient(135deg,#0C0C0C,#111)] px-4 py-3.5 text-center">
            <div className="[font-family:'DM Serif Display',serif] text-[26px] leading-none text-[#48DB85]">4.6★</div>
            <div className="mt-2 text-[11px] font-[600] leading-snug text-[rgba(250,249,244,.45)]">Session satisfaction (rolling)</div>
          </div>
          <div className="rounded-[12px] border border-[rgba(255,255,255,.07)] bg-[linear-gradient(135deg,#0C0C0C,#111)] px-4 py-3.5 text-center">
            <div className="[font-family:'DM Serif Display',serif] text-[26px] leading-none text-[#48DB85]">{stats.placed}%</div>
            <div className="mt-2 text-[11px] font-[600] leading-snug text-[rgba(250,249,244,.45)]">
              Reported offer or promotion within 9 months
            </div>
          </div>
        </div>

        {/* Live pill */}
        <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-[20px] border border-[rgba(0,0,0,.07)] bg-[rgba(0,0,0,.03)] px-[13px] py-[6px]">
          <span className="h-[6px] w-[6px] flex-shrink-0 animate-pulse rounded-full bg-[#22c55e]" />
          <p className="text-[11px] font-[600] leading-snug text-[#555]">
            <strong className="text-[#0C0C0C]">{stats.dbStr}</strong> profiles in our sample moved toward roles like{' '}
            <strong className="text-[#37017B]">{destinationTitle}</strong>
            <span className="text-[#999]"> · </span>
            <span className="text-[#666]">{stats.reviewers.toLocaleString('en-IN')} peers reviewing paths this week</span>
          </p>
        </div>

        {/* Story grid */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(loading ? Array.from({ length: 8 }) : stories).map((story, idx) =>
            loading ? (
              <div
                key={`sk-${idx}`}
                className="h-[220px] animate-pulse rounded-[15px] border border-[rgba(0,0,0,.06)] bg-[rgba(0,0,0,.03)]"
              />
            ) : (
              <article
                key={`${story.n}-${idx}`}
                className={[
                  'flex flex-col rounded-[15px] border p-[17px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(55,1,123,.2)] hover:shadow-[0_5px_18px_rgba(55,1,123,.07)]',
                  idx % 4 === 1
                    ? 'border-[rgba(55,1,123,.12)] bg-[rgba(55,1,123,.04)]'
                    : idx % 4 === 2
                      ? 'border-[rgba(72,219,133,.15)] bg-[rgba(72,219,133,.04)]'
                      : idx % 4 === 3
                        ? 'border-[rgba(250,204,21,.2)] bg-[rgba(255,215,0,.04)]'
                        : 'border-[rgba(0,0,0,.07)] bg-white',
                ].join(' ')}
              >
                <div
                  className={[
                    'mb-2 flex h-[42px] w-[42px] items-center justify-center rounded-full [font-family:\'DM Serif Display\',serif] text-[16px]',
                    story.ph ? 'bg-[rgba(55,1,123,.07)] text-[#37017B]' : 'bg-[rgba(0,0,0,.04)] text-[#ccc]',
                  ].join(' ')}
                >
                  {story.i}
                </div>
                <div className="text-[13px] font-[700] text-[#0C0C0C]">{story.n}</div>
                <div className="mb-2 text-[10px] text-[#bbb]">📍 {story.c}</div>
                <div className="mb-2 flex flex-wrap items-center gap-1">
                  <span className="rounded-[5px] bg-[rgba(0,0,0,.04)] px-[7px] py-[3px] text-[9px] font-[600] text-[#777]">{story.f}</span>
                  <span className="text-[11px] font-[900] text-[#37017B]">→</span>
                  <span className="rounded-[5px] bg-[rgba(55,1,123,.07)] px-[7px] py-[3px] text-[9px] font-[800] text-[#37017B]">{story.t}</span>
                </div>
                <div className="text-[22px] font-[900] leading-none text-[#37017B]">{story.h}</div>
                <div className="mb-2 text-[9px] text-[#bbb]">salary hike · {story.ti}</div>
                <blockquote className="mb-3 flex-1 border-l-2 border-[rgba(55,1,123,.14)] pl-2 text-[10.5px] italic leading-[1.55] text-[#555]">
                  {story.q}
                </blockquote>
                <button
                  type="button"
                  onClick={() => setSelected(story)}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 self-start rounded-[6px] bg-[#0A66C2] px-2.5 py-1.5 text-[10px] font-[700] text-white transition hover:bg-[#004182]"
                >
                  <span className="rounded-[2px] bg-white px-1 text-[9px] font-[900] tracking-wide text-[#0A66C2]">in</span>
                  See journey snapshot
                </button>
              </article>
            ),
          )}
        </div>

        <div className="mt-2 rounded-[13px] border border-[rgba(55,1,123,.12)] bg-[rgba(55,1,123,.04)] px-[18px] py-[14px]">
          <div className="text-[11px] font-[800] uppercase tracking-[.08em] text-[#37017B]">How we use stories</div>
          <p className="mt-2 text-[12.5px] leading-[1.55] text-[#555]">
            Narratives are illustrative composites — not guarantees. Names and employers are anonymised; your counsellor maps
            patterns to your gap list and ROI.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-[rgba(0,0,0,.06)] pt-6">
          <Button variant="ghost" onClick={() => nav('/5')}>
            ← Back
          </Button>
          <Button onClick={() => nav('/7')}>See your specialisation →</Button>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="snap-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[440px] overflow-y-auto rounded-[16px] border border-[rgba(0,0,0,.08)] bg-[#FAF9F4] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-[800] uppercase tracking-[.1em] text-[#37017B]">Journey snapshot</div>
                <h2 id="snap-title" className="mt-1 text-[18px] font-[800] [font-family:'DM Serif Display',serif]">
                  {selected.n}
                </h2>
                <p className="text-[11px] text-[#888]">📍 {selected.c}</p>
              </div>
              <button
                type="button"
                className="rounded-[8px] border border-[rgba(0,0,0,.1)] px-3 py-1 text-[12px] font-[700]"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-1 text-[12px]">
              <span className="rounded-[6px] bg-[rgba(0,0,0,.05)] px-2 py-1 text-[11px] font-[600] text-[#555]">{selected.f}</span>
              <span className="font-[900] text-[#37017B]">→</span>
              <span className="rounded-[6px] bg-[rgba(55,1,123,.08)] px-2 py-1 text-[11px] font-[800] text-[#37017B]">{selected.t}</span>
            </div>
            <p className="mb-4 text-[13px] font-[800] text-[#37017B]">
              {selected.h} <span className="text-[12px] font-[600] text-[#888]">· {selected.ti}</span>
            </p>
            <blockquote className="mb-4 border-l-2 border-[rgba(55,1,123,.25)] pl-3 text-[13px] italic leading-[1.55] text-[#444]">
              “{selected.q}”
            </blockquote>
            <p className="text-[11px] leading-[1.5] text-[#888]">
              Sample profile for discussion only. In a live session your counsellor can share anonymised benchmarks and
              referrals relevant to {destinationTitle}.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
