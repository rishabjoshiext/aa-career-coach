import { cn } from '../utils/cn.js'
import { useEffect, useMemo, useRef, useState } from 'react'

function fmtINR(num) {
  const n = Number(num)
  if (!Number.isFinite(n)) return null
  return n.toLocaleString('en-IN')
}

const IDLE_LIVE_FEED_LABELS = ['Profiles scanning…', 'Same education path', 'Open jobs nearby']

export function LiveProfileCard({ s, progressPct }) {
  const name = s.name?.trim() || 'Your Name'
  const av = s.name?.trim()?.[0]?.toUpperCase() || '?'
  const eduLabel = s.edu === '12' ? '12th / Diploma' : s.edu === 'UG' ? 'Graduate (UG)' : 'Post Graduate'
  const salaryLabel = s.salary ? `₹${fmtINR(s.salary)}` : '—'

  /** Live matching numbers stay at 0 until work experience or skills inputs exist (mirrors prototype intent). */
  const liveMatchUnlocked = useMemo(() => {
    const hasWorkEx =
      s.exp !== 'fresher' ||
      Boolean(String(s.yrsCur || '').trim()) ||
      (Boolean(String(s.role || '').trim()) && Boolean(String(s.company || '').trim()))
    const hasSkills =
      Boolean(String(s.english || '').trim()) ||
      Boolean(String(s.linkedinTier || '').trim()) ||
      Boolean(String(s.projects || '').trim()) ||
      Boolean(String(s.internships || '').trim())
    return hasWorkEx || hasSkills
  }, [s.exp, s.yrsCur, s.role, s.company, s.english, s.linkedinTier, s.projects, s.internships])

  const statusMsgs = [
    'Awaiting profile data…',
    'Matching with similar profiles…',
    'Cross-referencing career journeys…',
    'Identifying role clusters…',
    'Computing salary bands…',
    'Mapping career trajectory…',
    'Profile match locked',
  ]

  const targets = useMemo(() => {
    if (!liveMatchUnlocked) return { p: 0, e: 0, j: 0 }

    const filled =
      Object.entries({
        name: s.name,
        phone: s.phone,
        email: s.email,
        bd10: s.bd10,
        sc10: s.sc10,
        bd12: s.bd12,
        sc12: s.sc12,
        spec: s.spec,
        scoreUG: s.scoreUG,
        uni: s.uni,
        year: s.year,
        role: s.role,
        company: s.company,
        salary: s.salary,
        func: s.func,
        ind: s.ind,
        english: s.english,
      }).filter(([, v]) => Boolean(v)).length

    const expBonus = s.exp === 'fresher' ? 0 : s.exp === '0-1' ? 1 : s.exp === '1-3' ? 2 : s.exp === '3-6' ? 3 : 4
    const total = filled + expBonus

    const profilesScanned = Math.max(10, Math.min(4830, Math.round(10 + total * 240 + (total > 5 ? total * 180 : 0))))
    const eduMatches = Math.max(
      2,
      Math.min(
        1840,
        Math.round((s.spec ? 60 : 0) + (s.bd12 ? 40 : 0) + (s.bd10 ? 20 : 0) + (s.uni ? 80 : 0) + (s.scoreUG ? 30 : 0) + total * 55),
      ),
    )
    const jobsNearby = Math.max(
      4,
      Math.min(2400, Math.round((s.func ? 280 : 0) + (s.ind ? 160 : 0) + (s.role ? 260 : 0) + (s.salary ? 140 : 0) + total * 60)),
    )

    return { p: profilesScanned, e: eduMatches, j: jobsNearby }
  }, [s, liveMatchUnlocked])

  const feedLabels = useMemo(() => {
    if (!liveMatchUnlocked) return IDLE_LIVE_FEED_LABELS
    const labels = []
    if (s.role && s.func) labels.push(`${s.func} profiles like yours`)
    else if (s.func) labels.push(`${s.func} profiles scanning`)
    else if (s.spec) labels.push(`${s.spec} grads in DB`)
    else labels.push('Profiles scanning…')

    if (s.uni) labels.push(`From ${s.uni.length > 18 ? `${s.uni.slice(0, 18)}…` : s.uni}`)
    else if (s.spec) labels.push(`${s.spec} match`)
    else if (s.bd12) labels.push(`${s.bd12} board peers`)
    else labels.push('Same education path')

    if (s.ind && s.role) labels.push(`${s.role} jobs in ${s.ind.length > 14 ? `${s.ind.slice(0, 14)}…` : s.ind}`)
    else if (s.func) labels.push(`Open ${s.func} jobs`)
    else if (s.ind) labels.push(`${s.ind.length > 16 ? `${s.ind.slice(0, 16)}…` : s.ind} openings`)
    else labels.push('Open jobs nearby')

    return labels
  }, [s, liveMatchUnlocked])

  const [counts, setCounts] = useState({ p: 0, e: 0, j: 0 })
  const countsRef = useRef(counts)
  const [bumped, setBumped] = useState({ p: false, e: false, j: false })
  const rafs = useRef({ p: null, e: null, j: null })

  useEffect(() => {
    countsRef.current = counts
  }, [counts])

  useEffect(() => {
    const keys = ['p', 'e', 'j']
    keys.forEach((k) => {
      const target = targets[k]
      const cur = countsRef.current[k] || 0
      if (cur === target) return
      if (target > cur + 50) {
        setBumped((b) => ({ ...b, [k]: true }))
        window.setTimeout(() => setBumped((b) => ({ ...b, [k]: false })), 600)
      }

      if (rafs.current[k]) cancelAnimationFrame(rafs.current[k])
      const start = performance.now()
      const dur = Math.min(900, Math.abs(target - cur) * 8 + 200)
      const step = (t) => {
        const kk = Math.min(1, (t - start) / dur)
        const ease = 1 - Math.pow(1 - kk, 3)
        const v = Math.round(cur + (target - cur) * ease)
        setCounts((prev) => (prev[k] === v ? prev : { ...prev, [k]: v }))
        if (kk < 1) rafs.current[k] = requestAnimationFrame(step)
        else rafs.current[k] = null
      }
      rafs.current[k] = requestAnimationFrame(step)
    })

    return () => {
      ;['p', 'e', 'j'].forEach((k) => {
        if (rafs.current[k]) cancelAnimationFrame(rafs.current[k])
        rafs.current[k] = null
      })
    }
  }, [targets])

  const [ambientCounts, setAmbientCounts] = useState({ p: 0, e: 0, j: 0 })
  const [ambientStatus, setAmbientStatus] = useState(null)
  const ambientIdx = useRef(0)

  useEffect(() => {
    if (!liveMatchUnlocked) {
      setAmbientStatus(null)
      setAmbientCounts({ p: 0, e: 0, j: 0 })
    }
  }, [liveMatchUnlocked])

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReduced || !liveMatchUnlocked) return undefined

    const AMBIENT_STATUS = [
      'Matching database…',
      'Scanning {p} profiles for similarity',
      'Cross-referencing salary bands',
      'Identifying role clusters',
      'Computing your career trajectory',
      'Comparing {p} similar journeys',
      'Building your match score',
      'Mapping you to top destinations',
    ]

    const jitter = (target) => {
      if (target <= 10) return target
      const delta = Math.round(Math.random() * 5 - 2)
      return Math.max(target - 3, Math.min(target + 5, target + delta))
    }

    const id = window.setInterval(() => {
      setAmbientCounts({
        p: jitter(targets.p),
        e: jitter(targets.e),
        j: jitter(targets.j),
      })

      ambientIdx.current += 1
      if (ambientIdx.current % 3 === 0) {
        const msg = AMBIENT_STATUS[(ambientIdx.current / 3) % AMBIENT_STATUS.length].replace(
          '{p}',
          targets.p.toLocaleString('en-IN'),
        )
        setAmbientStatus(msg)
      }
    }, 1000)

    return () => window.clearInterval(id)
  }, [targets, liveMatchUnlocked])

  const statusMsg =
    liveMatchUnlocked && ambientStatus
      ? ambientStatus
      : statusMsgs[Math.min(Math.floor(progressPct / 16), statusMsgs.length - 1)]

  return (
    <aside
      className={cn(
        'relative self-start overflow-hidden rounded-[18px] border border-[rgba(55,1,123,.14)]',
        'bg-[linear-gradient(160deg,#FFFFFF_0%,#FBFAFE_55%,#F4EEFE_100%)]',
        'shadow-[0_1px_0_rgba(255,255,255,.6)_inset,0_-1px_0_rgba(55,1,123,.04)_inset,0_4px_18px_rgba(55,1,123,.06),0_16px_48px_rgba(55,1,123,.07)]',
        'lg:sticky lg:top-[14px] lg:max-h-[calc(100vh-80px)]',
        'flex flex-col',
      )}
    >
      {/* holo strip */}
      <div className="h-[4px] flex-shrink-0 bg-[linear-gradient(90deg,#7504FF_0%,#37017B_18%,#a855f7_36%,#48DB85_54%,#FFD700_72%,#37017B_90%,#7504FF_100%)] [background-size:200%_100%] motion-safe:animate-[lpcHolo_6s_linear_infinite]" />

      {/* guilloche top-right */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 h-[240px] w-[240px] bg-[radial-gradient(circle_at_1px_1px,rgba(55,1,123,.15)_1px,transparent_1.5px)] [background-size:11px_11px] [mask-image:radial-gradient(ellipse_at_top_right,#000_0%,rgba(0,0,0,.5)_40%,transparent_70%)]" />
      {/* bottom barcode line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-[1px] bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.18)_0_2px,transparent_2px_7px)]" />

      {/* head strip */}
      <div className="relative z-[1] flex flex-shrink-0 items-center justify-between border-b border-dashed border-[rgba(55,1,123,.12)] px-4 pb-[9px] pt-[10px]">
        <div className="flex items-center gap-[7px]">
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[linear-gradient(135deg,#37017B,#7504FF)] text-[11px] font-[900] text-white shadow-[0_2px_6px_rgba(55,1,123,.25)]">
            F
          </div>
          <div className="[font-family:'DM Serif Display',serif] text-[14px] tracking-[-.01em] text-[#37017B]">
            FastTrack
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-[20px] border border-[rgba(34,197,94,.22)] bg-[rgba(34,197,94,.07)] px-2 py-[3px] text-[9px] font-[800] uppercase tracking-[.08em] text-[#22c55e]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#22c55e] motion-safe:animate-[blink_2s_infinite]" />
          Live profile
        </div>
      </div>

      <div className="relative z-[1] flex-1 overflow-y-auto px-4 pb-3 pt-[13px] [scrollbar-width:thin]">
        <div className="mb-[11px] flex items-center gap-3">
          <div className="relative flex h-[64px] w-[54px] flex-shrink-0 items-center justify-center rounded-[8px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.08))] text-[24px] text-[#37017B] shadow-[inset_0_0_0_3px_rgba(255,255,255,.6),inset_0_0_0_4px_rgba(55,1,123,.07)] [font-family:'DM Serif Display',serif]">
            {av}
            <span className="pointer-events-none absolute left-[-1px] top-[-1px] h-[9px] w-[9px] rounded-[1px] border-l-[2px] border-t-[2px] border-[#37017B]" />
            <span className="pointer-events-none absolute bottom-[-1px] right-[-1px] h-[9px] w-[9px] rounded-[1px] border-b-[2px] border-r-[2px] border-[#37017B]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[18px] leading-[1.15] tracking-[-.01em] text-[#0C0C0C] [font-family:'DM Serif Display',serif]">
              {name}
            </div>
            <div className="mt-[3px] truncate text-[10.5px] text-[#888]">
              {s.role && s.company ? `${s.role} @ ${s.company}` : s.role || 'Building profile…'}
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="mb-[2px] flex items-center gap-[5px] text-[8.5px] font-[800] uppercase tracking-[.1em] text-[rgba(55,1,123,.5)]">
            Education
            <span className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.15)_0_2px,transparent_2px_4px)]" />
          </div>
          <div className="flex flex-wrap items-baseline gap-[2px] text-[11.5px] font-[600] leading-[1.4] text-[#0C0C0C]">
            <span>{eduLabel}</span>
            <span className="mx-[2px] font-[400] text-[#ccc]">·</span>
            <span className={cn(!s.spec && 'text-[#aaa] font-[500]')}>{s.spec || 'specialisation'}</span>
            <span className="mx-[2px] font-[400] text-[#ccc]">·</span>
            <span className={cn(!s.year && 'text-[#aaa] font-[500]')}>{s.year || 'year'}</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="mb-[2px] flex items-center gap-[5px] text-[8.5px] font-[800] uppercase tracking-[.1em] text-[rgba(55,1,123,.5)]">
            Career
            <span className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,rgba(55,1,123,.15)_0_2px,transparent_2px_4px)]" />
          </div>
          <div className="flex flex-wrap items-baseline gap-[2px] text-[11.5px] font-[600] leading-[1.4] text-[#0C0C0C]">
            <span>{s.role || '—'}</span>
            <span className="mx-[2px] font-[400] text-[#ccc]">·</span>
            <span className={cn(!s.func && 'text-[#aaa] font-[500]')}>{s.func || 'function'}</span>
            <span className="mx-[2px] font-[400] text-[#ccc]">·</span>
            <span className={cn(!s.ind && 'text-[#aaa] font-[500]')}>{s.ind || 'industry'}</span>
          </div>
        </div>

        <div className="my-[9px] grid grid-cols-2 gap-[7px]">
          <div className="rounded-[8px] border border-[rgba(55,1,123,.08)] bg-[rgba(55,1,123,.04)] px-[9px] py-[6px]">
            <div className="mb-[2px] text-[8.5px] font-[800] uppercase tracking-[.08em] text-[#aaa]">
              Experience
            </div>
            <div className="text-[13px] font-[800] leading-[1.1] tracking-[-.01em] text-[#0C0C0C]">
              {s.exp === 'fresher' ? 'Fresher' : `${s.exp} yrs`}
            </div>
          </div>
          <div className="rounded-[8px] border border-[rgba(55,1,123,.08)] bg-[rgba(55,1,123,.04)] px-[9px] py-[6px]">
            <div className="mb-[2px] text-[8.5px] font-[800] uppercase tracking-[.08em] text-[#aaa]">
              Monthly Salary
            </div>
            <div className="text-[13px] font-[800] leading-[1.1] tracking-[-.01em] text-[#0C0C0C]">
              {salaryLabel}
            </div>
          </div>
        </div>

        <div className="mt-[11px] rounded-[9px] border border-[rgba(55,1,123,.14)] bg-[linear-gradient(135deg,rgba(55,1,123,.07),rgba(117,4,255,.04))] px-[11px] py-[9px]">
          <div className="flex items-center gap-[7px]">
            <div className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#37017B] shadow-[0_0_0_3px_rgba(55,1,123,.12)] motion-safe:animate-[blink_1.5s_infinite]" />
            <div className="flex-1 text-[10.5px] font-[700] text-[#37017B]">{statusMsg}</div>
            <div className="text-[10px] font-[800] text-[#37017B] tabular-nums">
              {progressPct}%
            </div>
          </div>
          <div className="mt-[7px] h-[3px] overflow-hidden rounded-[2px] bg-[rgba(55,1,123,.08)]">
            <div
              className="h-full rounded-[2px] bg-[linear-gradient(90deg,#37017B,#7504FF,#a855f7)] [background-size:200%_100%] motion-safe:animate-[lpcPbShine_3s_linear_infinite] transition-[width] duration-[1200ms] ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="mt-[11px] rounded-[9px] border border-[rgba(0,0,0,.04)] bg-[rgba(0,0,0,.02)] px-[11px] py-[9px]">
          <div className="mb-[6px] flex items-center gap-[5px] text-[8.5px] font-[800] uppercase tracking-[.1em] text-[#bbb]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#22c55e] motion-safe:animate-[blink_1.4s_infinite]" />
            Live matching
          </div>
          {[
            {
              k: 'p',
              l: feedLabels[0],
              v: liveMatchUnlocked ? ambientCounts.p || counts.p : 0,
            },
            {
              k: 'e',
              l: feedLabels[1],
              v: liveMatchUnlocked ? ambientCounts.e || counts.e : 0,
            },
            {
              k: 'j',
              l: feedLabels[2],
              v: liveMatchUnlocked ? ambientCounts.j || counts.j : 0,
            },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-[2px] text-[10px] leading-[1.5] text-[#555]">
              <span className="inline-flex items-center gap-[5px]">
                <span className="text-[9px] font-[900] text-[#22c55e]">▸</span> {row.l}
              </span>
              <span
                className={cn(
                  'tabular-nums font-[800] text-[#37017B] transition-colors duration-200',
                  bumped[row.k] && 'text-[#22c55e]',
                )}
              >
                {Number(row.v).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-[1] flex flex-shrink-0 justify-end border-t border-dashed border-[rgba(55,1,123,.12)] px-4 pb-[11px] pt-[9px]">
        <div className="flex h-[14px] items-end gap-[1.5px]" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <i
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="block w-[1.5px] rounded-[1px] bg-[#37017B] opacity-70"
              style={{
                height: `${[60, 90, 40, 100, 55, 75, 30, 85, 50, 70, 45, 95][i]}%`,
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

