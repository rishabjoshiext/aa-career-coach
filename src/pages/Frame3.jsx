import { useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import { captureJourneyElement } from '../utils/exportJourneyPdf.js'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { RunLoadOverlay } from '../components/loaders/RunLoadOverlay.jsx'
import { PD } from '../utils/pathData.js'
import { resolvePdRole } from '../utils/roleKey.js'
import { resolveJourneySourceCard } from '../utils/journeySourceCard.js'
import {
  buildJourneyFromProgressionEngine,
  coerceJourneyToCanonicalCounts,
} from '../journey/progressionEngine.js'
import {
  TIMELINE_MAX_YEARS,
  TIMELINE_ORIGIN_X,
  PATH_MIN_FIRST_CENTER,
  applyTimelineToJourney,
  buildTimelineYearTicks,
  milestoneCentersForPath,
  accelCentersThreeBox,
} from '../journey/timelineLayout.js'
import { JOB_LISTINGS, logoKey } from '../utils/jobsData.js'
import { JobDetailModal } from '../components/modals/JobDetailModal.jsx'
import { formatSalaryLabelIndian } from '../utils/formatINR.js'

const PATHS = [
  { key: 'all', label: 'All Paths', chip: 'on' },
  { key: 'trad', label: '📈 Traditional' },
  { key: 'fast', label: '⚡ Fast Track' },
  { key: 'accel', label: '🚀 Accelerated', accel: true },
]

const PY = { trad: 90, fast: 270, accel: 450 }
const PCOL = { trad: '#888', fast: '#FFD700', accel: '#48DB85' }
const NOW_CIRCLE_LEFT = 4
const NOW_CIRCLE_SIZE = 92
const PATH_LABEL_X = NOW_CIRCLE_LEFT + NOW_CIRCLE_SIZE + 14
const PATH_LABEL_Y_OFFSET = 26
const TIMELINE_START_X = TIMELINE_ORIGIN_X
const PX_PER_YEAR = 185
const TIMELINE_END_PAD = 200

function milestoneDisplayTitle(pk, idx, n, currentRole) {
  if (pk === 'accel' && idx === 0) {
    const cur = String(currentRole || '').trim()
    if (cur) return cur
  }
  return n.r
}

function MilestonePathBadge({ pk, n }) {
  if (pk === 'accel' && n.tag) {
    return (
      <div className="mb-[6px]">
        <span className="inline-flex rounded-[8px] border-2 border-[rgba(168,85,247,.65)] bg-[linear-gradient(135deg,rgba(117,4,255,.5),rgba(72,219,133,.22))] px-[11px] py-[5px] text-[10.5px] font-[900] uppercase tracking-[.1em] text-[#f3e8ff] shadow-[0_0_14px_rgba(117,4,255,.4)]">
          + Degree
        </span>
      </div>
    )
  }
  if (pk === 'fast' && n.fastTag === 'self_learning') {
    return (
      <div className="mb-[5px] text-[10px] font-[800] uppercase tracking-[.07em] text-[#FFD700]">
        + Self learning
      </div>
    )
  }
  if (pk === 'fast' && n.fastTag === 'upskilling') {
    return (
      <div className="mb-[5px] text-[10px] font-[800] uppercase tracking-[.07em] text-[#FFD700]">
        + upskilling
      </div>
    )
  }
  return null
}
function jobsForRole(roleName) {
  return JOB_LISTINGS[roleName] || []
}

/** Hand-tuned PD merged with engine — always exactly 6 / 5 / 3 milestone cards. */
function ensureCanonicalJourney(raw, engineJourney) {
  return enrichJourneyDetails(coerceJourneyToCanonicalCounts(raw, engineJourney))
}

function defaultNodeDetail() {
  return {
    lifestyle: 'Progressive skill and responsibility growth at this stage.',
    what: [
      'Deliver measurable outcomes in this role',
      'Build stakeholder trust through clear communication',
      'Strengthen craft with feedback loops',
      'Document wins for promotion and interviews',
    ],
    skills: ['Domain depth', 'Execution', 'Communication', 'Problem solving'],
  }
}

function enrichJourneyDetails(parsed) {
  const out = { ...parsed, nodes: { ...parsed.nodes } }
  for (const pk of ['trad', 'fast', 'accel']) {
    out.nodes[pk] = (parsed.nodes[pk] || []).map((n, i) => {
      const d = n.detail
      const ok = d && Array.isArray(d.what) && d.what.length >= 4 && Array.isArray(d.skills) && d.skills.length >= 4
      return {
        ...n,
        detail: ok ? d : { ...defaultNodeDetail(), lifestyle: d?.lifestyle || defaultNodeDetail().lifestyle },
        ...(pk === 'fast' && i === 0 && !n.fastTag ? { fastTag: 'self_learning' } : {}),
        ...(pk === 'fast' && i === 1 && !n.fastTag ? { fastTag: 'upskilling' } : {}),
      }
    })
  }
  return out
}

export function Frame3() {
  const nav = useNavigate()
  const { s, selRole, selIndustry, setGapPath, setRPath } = useAppState()
  const fallbackRole = resolvePdRole(selRole)
  const roleTitle = (selRole && String(selRole).trim()) || fallbackRole

  const journeyCard = useMemo(
    () => resolveJourneySourceCard({ selRole, selIndustry: selIndustry || 'all', profile: s }),
    [selRole, selIndustry, s],
  )

  const pdStatic = PD[roleTitle] || null

  const engineJourney = useMemo(
    () => buildJourneyFromProgressionEngine(journeyCard, s.role || '', s),
    [journeyCard, s],
  )

  const d = useMemo(() => {
    const base = ensureCanonicalJourney(pdStatic, engineJourney)
    return applyTimelineToJourney(base)
  }, [pdStatic, engineJourney])

  const pathTrack = useMemo(() => {
    const timelineMax = TIMELINE_MAX_YEARS
    const canvasW = TIMELINE_START_X + timelineMax * PX_PER_YEAR + TIMELINE_END_PAD
    const xForYear = (yr) => TIMELINE_START_X + Number(yr || 0) * PX_PER_YEAR
    const pathEndX = (pk) => xForYear(d[pk].yrs)
    const fastCenters = milestoneCentersForPath(
      d.nodes.fast,
      xForYear,
      200,
      PATH_MIN_FIRST_CENTER.fast,
      pathEndX('fast'),
    )
    const accelEndX = pathEndX('accel')
    const accelNatural = milestoneCentersForPath(
      d.nodes.accel,
      xForYear,
      200,
      PATH_MIN_FIRST_CENTER.accel,
      accelEndX,
    )
    const accelFirst = fastCenters[0] ?? accelNatural[0] ?? PATH_MIN_FIRST_CENTER.accel
    const accelCenters =
      d.nodes.accel.length === 3
        ? accelCentersThreeBox(accelFirst, accelEndX)
        : accelNatural
    const centersByPath = {
      trad: milestoneCentersForPath(
        d.nodes.trad,
        xForYear,
        200,
        PATH_MIN_FIRST_CENTER.trad,
        pathEndX('trad'),
      ),
      fast: fastCenters,
      accel: accelCenters,
    }
    return {
      timelineMax,
      canvasW,
      xForYear,
      centersByPath,
      yearTicks: buildTimelineYearTicks(timelineMax),
    }
  }, [d])

  const [filter, setFilter] = useState('all')
  const [zoom, setZoom] = useState({ s: 1, tx: 0, ty: 0, target_s: 1, target_tx: 0, target_ty: 0 })
  const vpRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const dragRef = useRef({ dr: false, lx: 0, ly: 0 })

  const [selectedNode, setSelectedNode] = useState(null) // {pathKey, idx}
  const [jobModal, setJobModal] = useState({ open: false, job: null })
  const [journeyIntroLoading, setJourneyIntroLoading] = useState(true)
  const [gapLoading, setGapLoading] = useState(false)
  /** Staggered tile reveal (mirrors fasttrack_v6 buildCards skeleton + accel→fast→trad). */
  const [skeletonKeys, setSkeletonKeys] = useState(() => new Set())
  const staggerTimersRef = useRef([])

  const saveYears = d.trad.yrs - d.accel.yrs

  const linesSvg = useMemo(() => {
    const sX = TIMELINE_START_X
    const sY = 270
    const { xForYear, yearTicks, canvasW: maxX } = pathTrack
    let svg = ''

    for (const yr of yearTicks) {
      const x = xForYear(yr)
      if (x > maxX - 40) break
      svg += `<line x1="${x}" y1="30" x2="${x}" y2="490" stroke="rgba(255,255,255,0.03)" stroke-width="1" stroke-dasharray="2,8" />`
      svg += `<text x="${x}" y="16" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.42)" font-family="Outfit" font-weight="700">Yr ${yr}</text>`
    }

    ;[
      { y: 90, c: 'rgba(100,100,100,0.04)' },
      { y: 270, c: 'rgba(55,1,123,0.04)' },
      { y: 440, c: 'rgba(72,219,133,0.04)' },
    ].forEach((tr) => {
      svg += `<rect x="120" y="${tr.y - 52}" width="${Math.max(400, maxX - 200)}" height="104" rx="10" fill="${tr.c}" />`
    })

    ;['trad', 'fast', 'accel'].forEach((pk) => {
      const py = PY[pk]
      const isActive = filter === 'all' || filter === pk
      const op = isActive ? 1 : 0.05
      const sw = isActive ? (pk === 'accel' ? 3 : 2) : 1
      const ns = d.nodes[pk]
      const centers = pathTrack.centersByPath[pk]
      const centerAt = (idx) => centers[idx] ?? xForYear(ns[idx]?.yr ?? 0)
      const fCX = centerAt(0)
      const fLE = fCX - 82
      const start =
        pk === 'trad'
          ? `M ${sX},${sY} C ${sX + 100},${sY} ${fLE - 70},${py} ${fLE},${py}`
          : pk === 'fast' || pk === 'accel'
            ? `M ${sX},${sY} C ${sX + 60},${sY} ${fLE - 30},${py} ${fLE},${py}`
            : `M ${sX},${sY} C ${sX + 100},${sY} ${fLE - 70},${py} ${fLE},${py}`
      let pth = start
      for (let i = 0; i < ns.length - 1; i += 1) {
        const cx1 = centerAt(i)
        const cx2 = centerAt(i + 1)
        pth += ` M ${cx1 + 82},${py} L ${cx2 - 82},${py}`
      }
      const col = { trad: '#666', fast: '#FFD700', accel: '#48DB85' }[pk]
      svg += `<path d="${pth}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${op}" />`
    })

    return svg
  }, [d, filter, pathTrack])

  useEffect(() => {
    const vp = vpRef.current
    if (!vp) return undefined

    const onWheel = (ev) => {
      ev.preventDefault()
      const r = vp.getBoundingClientRect()
      const mx = ev.clientX - r.left
      const my = ev.clientY - r.top
      const dyRaw = ev.deltaY
      const dy = Math.max(-60, Math.min(60, dyRaw))
      const factor = ev.ctrlKey ? 0.004 : 0.0022
      const delta = Math.exp(-dy * factor)
      setZoom((z) => {
        const ns = Math.max(0.45, Math.min(3.5, z.target_s * delta))
        const ntx = mx - (mx - z.target_tx) * (ns / z.target_s)
        const nty = my - (my - z.target_ty) * (ns / z.target_s)
        return { ...z, target_s: ns, target_tx: ntx, target_ty: nty }
      })
    }

    vp.addEventListener('wheel', onWheel, { passive: false })
    return () => vp.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    if (rafRef.current) return
    const step = () => {
      setZoom((z) => {
        const lerp = 0.18
        const ds = z.target_s - z.s
        const dx = z.target_tx - z.tx
        const dy = z.target_ty - z.ty
        const ns = z.s + ds * lerp
        const ntx = z.tx + dx * lerp
        const nty = z.ty + dy * lerp
        const done = Math.abs(ds) < 0.0008 && Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4
        if (done) return { ...z, s: z.target_s, tx: z.target_tx, ty: z.target_ty }
        return { ...z, s: ns, tx: ntx, ty: nty }
      })
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    const vp = vpRef.current
    if (!vp) return undefined

    const onDown = (ev) => {
      dragRef.current = { dr: true, lx: ev.clientX, ly: ev.clientY }
    }
    const onMove = (ev) => {
      if (!dragRef.current.dr) return
      const dx = ev.clientX - dragRef.current.lx
      const dy = ev.clientY - dragRef.current.ly
      dragRef.current.lx = ev.clientX
      dragRef.current.ly = ev.clientY
      setZoom((z) => ({ ...z, tx: z.tx + dx, ty: z.ty + dy, target_tx: z.tx + dx, target_ty: z.ty + dy }))
    }
    const onUp = () => {
      dragRef.current.dr = false
    }
    vp.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      vp.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const canvasStyle = useMemo(
    () => ({
      transform: `translate3d(${zoom.tx.toFixed(1)}px,${zoom.ty.toFixed(1)}px,0) scale(${zoom.s.toFixed(3)})`,
      transformOrigin: '0 0',
    }),
    [zoom],
  )

  const currentRoleFull = (s.role || '').trim() || 'Current'
  const startRole =
    currentRoleFull.length > 14 ? `${currentRoleFull.slice(0, 12)}…` : currentRoleFull

  const selectedDetail = useMemo(() => {
    if (!selectedNode) return null
    const node = d.nodes[selectedNode.pathKey][selectedNode.idx]
    return { node, col: PCOL[selectedNode.pathKey] || '#48DB85', pathKey: selectedNode.pathKey }
  }, [selectedNode, d])

  const mdpJobs = useMemo(() => {
    if (!selectedDetail) return []
    return jobsForRole(selectedDetail.node.r).slice(0, 3)
  }, [selectedDetail])

  useEffect(() => {
    startTransition(() => setJourneyIntroLoading(true))
    const tid = window.setTimeout(() => setJourneyIntroLoading(false), 900)
    return () => window.clearTimeout(tid)
  }, [roleTitle, journeyCard, s.role])

  useLayoutEffect(() => {
    for (const t of staggerTimersRef.current) window.clearTimeout(t)
    staggerTimersRef.current = []
    if (journeyIntroLoading) {
      startTransition(() => setSkeletonKeys(new Set()))
      return undefined
    }
    const dj = d
    const full = new Set()
    for (const pk of ['accel', 'fast', 'trad']) {
      const arr = dj.nodes[pk] || []
      for (let i = 0; i < arr.length; i += 1) full.add(`${pk}:${i}`)
    }
    startTransition(() => setSkeletonKeys(full))
    let delay = 120
    const REVEAL_STEP = 330
    for (const pk of ['accel', 'fast', 'trad']) {
      const arr = dj.nodes[pk] || []
      for (let i = 0; i < arr.length; i += 1) {
        const k = `${pk}:${i}`
        const tid = window.setTimeout(() => {
          startTransition(() => {
            setSkeletonKeys((prev) => {
              const next = new Set(prev)
              next.delete(k)
              return next
            })
          })
        }, delay)
        staggerTimersRef.current.push(tid)
        delay += REVEAL_STEP
      }
    }
    return () => {
      for (const t of staggerTimersRef.current) window.clearTimeout(t)
      staggerTimersRef.current = []
    }
  }, [journeyIntroLoading, d])

  const downloadJourneyPdf = async () => {
    const el = canvasRef.current
    if (!el) return
    const prev = { filter, zoom: { ...zoom } }
    try {
      for (const t of staggerTimersRef.current) window.clearTimeout(t)
      staggerTimersRef.current = []
      setSkeletonKeys(new Set())
      setFilter('all')
      setZoom({ s: 1, tx: 0, ty: 0, target_s: 1, target_tx: 0, target_ty: 0 })
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise((r) => window.setTimeout(r, 400))

      const canvas = await captureJourneyElement(el)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      let targetW = w - 10
      let targetH = targetW / ratio
      if (targetH > h - 10) {
        targetH = h - 10
        targetW = targetH * ratio
      }
      pdf.addImage(imgData, 'PNG', (w - targetW) / 2, (h - targetH) / 2, targetW, targetH)
      pdf.save(`journey-${roleTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (err) {
      console.error('Failed to export journey PDF', err)
    } finally {
      setFilter(prev.filter)
      setZoom({
        ...prev.zoom,
        target_s: prev.zoom.s,
        target_tx: prev.zoom.tx,
        target_ty: prev.zoom.ty,
      })
    }
  }

  return (
    <section className="absolute inset-0 overflow-hidden bg-[#0C0C0C] px-6 pb-3 pt-5 text-[#FAF9F4]">
      <div
        className={[
          'mx-auto flex h-full max-w-[100%] flex-col transition-all duration-700',
          journeyIntroLoading ? 'translate-y-[8px] opacity-0 blur-[1px]' : 'translate-y-0 opacity-100 blur-0',
        ].join(' ')}
      >
        <div className="flex-shrink-0">
          <div className="mb-[3px] text-[27px] leading-[1.2] [font-family:'DM Serif Display',serif]">
            Your journey to <em className="not-italic text-[#a855f7]">{roleTitle}</em>
          </div>
          <div className="mb-[14px] text-[13px] text-[rgba(250,249,244,.35)]">
            Three paths. Same destination. Scroll to explore — zoom in to see milestones. Click any milestone for full detail.
          </div>

          <div className="mb-3 flex items-center gap-[6px]">
            {PATHS.map((p) => (
              <button
                key={p.key}
                className={[
                  'cursor-pointer rounded-[50px] border-[1.5px] border-[rgba(255,255,255,.12)] bg-transparent px-4 py-[7px] text-[12px] font-[800] tracking-[.03em] text-[rgba(250,249,244,.56)] transition-all duration-200',
                  filter === p.key ? 'border-[#37017B] bg-[#37017B] text-white' : '',
                  p.accel ? 'bg-[#48DB85] text-[#0C0C0C] border-[#48DB85] shadow-[0_0_16px_rgba(72,219,133,.3)]' : '',
                ].join(' ')}
                onClick={() => {
                  setFilter(p.key)
                  setSelectedNode(null)
                }}
              >
                {p.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-[6px]">
              <button
                className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(55,1,123,.45)] bg-[linear-gradient(135deg,rgba(248,245,255,.14)_0%,rgba(117,4,255,.22)_100%)] px-3 py-[8px] text-[12px] font-[800] text-[#f5e9ff] shadow-[0_2px_12px_rgba(117,4,255,.18)] transition hover:border-[rgba(168,85,247,.55)] hover:bg-[linear-gradient(135deg,rgba(248,245,255,.2)_0%,rgba(117,4,255,.32)_100%)] hover:text-white"
                onClick={downloadJourneyPdf}
                title="Download journey graph as PDF"
              >
                ⬇ Download plan
              </button>
              <span className="text-[10px] font-[600] text-[rgba(250,249,244,.25)]">{Math.round(zoom.s * 100)}%</span>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.04)] text-[14px] font-[700] text-[rgba(250,249,244,.6)] transition-all duration-200 hover:bg-[rgba(255,255,255,.1)] hover:text-[#FAF9F4]"
                onClick={() => setZoom((z) => ({ ...z, target_s: Math.min(3.5, z.target_s * 1.25) }))}
              >
                +
              </button>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.04)] text-[14px] font-[700] text-[rgba(250,249,244,.6)] transition-all duration-200 hover:bg-[rgba(255,255,255,.1)] hover:text-[#FAF9F4]"
                onClick={() => setZoom((z) => ({ ...z, target_s: Math.max(0.45, z.target_s * 0.8) }))}
              >
                −
              </button>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.04)] text-[14px] font-[700] text-[rgba(250,249,244,.6)] transition-all duration-200 hover:bg-[rgba(255,255,255,.1)] hover:text-[#FAF9F4]"
                onClick={() => setZoom((z) => ({ ...z, target_s: 1, target_tx: 0, target_ty: 0 }))}
                title="Reset view"
              >
                ⌂
              </button>
            </div>
          </div>
        </div>

        <div
          ref={vpRef}
          className="relative flex-1 cursor-grab overflow-hidden rounded-[12px] border border-[rgba(255,255,255,.04)] bg-[linear-gradient(180deg,#0d0d0d_0%,#0C0C0C_100%)] active:cursor-grabbing"
        >
          <div
            ref={canvasRef}
            className="absolute h-[520px]"
            style={{ ...canvasStyle, width: `${pathTrack.canvasW}px` }}
          >
            <svg
              className="pointer-events-none absolute left-0 top-0 h-[520px]"
              width={pathTrack.canvasW}
              height={520}
              dangerouslySetInnerHTML={{ __html: `<defs></defs>${linesSvg}` }}
            />

            <div className="pointer-events-none absolute inset-0 z-[3]">
              {['trad', 'fast', 'accel'].map((pk) => {
                const isActive = filter === 'all' || filter === pk
                const labelX = PATH_LABEL_X
                const labelY = PY[pk] - PATH_LABEL_Y_OFFSET
                const labelCol = pk === 'trad' ? '#FAF9F4' : PCOL[pk]
                return (
                  <div
                    key={`path-label-${pk}`}
                    className="absolute whitespace-nowrap text-[11px] font-[900] uppercase tracking-[.05em]"
                    style={{
                      left: `${labelX}px`,
                      top: `${labelY}px`,
                      color: labelCol,
                      opacity: isActive ? 1 : 0.14,
                    }}
                  >
                    {d[pk].label.toUpperCase()}
                  </div>
                )
              })}
            </div>

            <div
              className="absolute z-[2] flex flex-col items-center justify-center rounded-full border-2 border-[rgba(250,249,244,.28)] bg-[rgba(250,249,244,.08)]"
              style={{
                left: `${NOW_CIRCLE_LEFT}px`,
                top: `${270 - NOW_CIRCLE_SIZE / 2}px`,
                width: `${NOW_CIRCLE_SIZE}px`,
                height: `${NOW_CIRCLE_SIZE}px`,
              }}
            >
              <div className="text-[10.5px] font-[900] uppercase tracking-[.06em] text-[#FAF9F4]">NOW</div>
              <div className="mt-[3px] px-1 text-center text-[8.5px] text-[rgba(250,249,244,.45)]">{startRole}</div>
            </div>

            <div className="absolute inset-0 z-[1]">
              {['trad', 'fast', 'accel'].map((pk) => {
                const isActive = filter === 'all' || filter === pk
                const op = isActive ? 1 : 0.07
                const py = PY[pk]
                const CH = 92
                return d.nodes[pk].map((n, idx) => {
                  const cx = pathTrack.centersByPath[pk][idx] ?? pathTrack.xForYear(n.yr)
                  const cardX = cx - 88
                  const cardY = py - CH / 2
                  const isGoal = Boolean(n.goal)
                  const selected = selectedNode?.pathKey === pk && selectedNode?.idx === idx
                  const tileKey = `${pk}:${idx}`
                  const showTileSk = journeyIntroLoading || skeletonKeys.has(tileKey)
                  return (
                    <button
                      key={tileKey}
                      type="button"
                      data-journey-milestone
                      className={[
                        'absolute w-[176px] select-none rounded-[11px] border-[1.5px] px-[13px] py-[11px] text-left transition-[opacity,transform,box-shadow,border-color,background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
                        !isActive || showTileSk ? 'pointer-events-none' : 'cursor-pointer',
                        selected
                          ? 'scale-[1.02] border-[rgba(168,85,247,.55)] bg-[linear-gradient(145deg,rgba(117,4,255,.42)_0%,rgba(55,1,123,.38)_55%,rgba(24,12,40,.92)_100%)] shadow-[0_0_0_1px_rgba(248,245,255,.12),0_10px_36px_rgba(117,4,255,.25)]'
                          : 'border-[#272727] bg-[#161616] hover:border-[rgba(255,255,255,.12)]',
                        showTileSk ? 'milestone-tile-skeleton' : 'milestone-tile-reveal',
                      ].join(' ')}
                      style={{
                        left: `${cardX}px`,
                        top: `${cardY}px`,
                        opacity: op,
                        ['--mc']: PCOL[pk],
                      }}
                      onClick={() => {
                        setSelectedNode({ pathKey: pk, idx })
                        setGapPath(pk)
                        setRPath(pk)
                      }}
                    >
                      <div className="milestone-tile-inner transition-opacity duration-200">
                        {isGoal ? (
                          <div className="mb-[6px] inline-block rounded-[20px] border border-[rgba(255,215,0,.3)] bg-[rgba(255,215,0,.15)] px-[7px] py-[2px] text-[8px] font-[800] uppercase tracking-[.05em] text-[#FFD700]">
                            ★ TARGET ROLE
                          </div>
                        ) : (
                          <div className="mb-[9px] h-[2.5px] rounded-[2px]" style={{ background: PCOL[pk] }} />
                        )}
                        <div className="mb-[3px] text-[11px] font-[800] leading-[1.3] text-[#FAF9F4]">
                          {milestoneDisplayTitle(pk, idx, n, currentRoleFull)}
                        </div>
                        <MilestonePathBadge pk={pk} n={n} />
                        <div className="mb-[6px] text-[9px] leading-[1.45] text-[rgba(250,249,244,.42)]">{n.brief}</div>
                        <div className="text-[10px] font-[800]" style={{ color: isActive ? PCOL[pk] : '#888' }}>
                          {formatSalaryLabelIndian(n.sal)}
                        </div>
                      </div>
                    </button>
                  )
                })
              })}
            </div>
          </div>
        </div>

        {/* milestone detail panel */}
        <div
          className={[
            'relative mt-[10px] overflow-hidden rounded-[12px] border border-[#1e1e1e] bg-[#111] transition-all duration-300',
            selectedDetail ? 'border-[#2a2a2a] opacity-100' : 'opacity-70',
          ].join(' ')}
        >
          {selectedDetail ? (
            <button
              type="button"
              className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.06)] text-[18px] font-[400] leading-none text-[rgba(250,249,244,.75)] transition hover:bg-[rgba(255,255,255,.12)] hover:text-[#FAF9F4]"
              onClick={() => setSelectedNode(null)}
              aria-label="Close milestone details"
            >
              ×
            </button>
          ) : null}
          {!selectedDetail ? (
            <div className="flex items-center gap-[10px] px-5 py-4 text-[12px] text-[rgba(250,249,244,.25)]">
              <span className="text-[18px] opacity-30 motion-safe:animate-[float_3s_ease-in-out_infinite]">👆</span>
              Click any milestone on the path to see what happens at that stage
            </div>
          ) : (
            <div className="grid grid-cols-1 pt-1 pr-12 lg:grid-cols-[220px_1fr_1fr_1fr]">
              <div className="border-r border-[rgba(255,255,255,.04)] px-4 py-[14px]" style={{ borderLeft: `3px solid ${selectedDetail.col}` }}>
                <div className="mb-[7px] inline-block rounded-[20px] border px-[9px] py-[3px] text-[8.5px] font-[800] uppercase tracking-[.07em]" style={{ color: selectedDetail.col, borderColor: `${selectedDetail.col}44`, background: `${selectedDetail.col}22` }}>
                  {selectedDetail.pathKey === 'trad' ? '📈 Traditional' : selectedDetail.pathKey === 'fast' ? '⚡ Fast Track' : '🚀 Accelerated'}
                </div>
                <div className="mb-[3px] text-[16px] [font-family:'DM Serif Display',serif]">
                  {milestoneDisplayTitle(
                    selectedDetail.pathKey,
                    selectedNode?.idx ?? 0,
                    selectedDetail.node,
                    currentRoleFull,
                  )}
                </div>
                <MilestonePathBadge pk={selectedDetail.pathKey} n={selectedDetail.node} />
                <div className="mb-2 text-[20px] font-[900]" style={{ color: selectedDetail.col }}>
                  {formatSalaryLabelIndian(selectedDetail.node.sal)}
                </div>
                <div className="text-[10px] italic leading-[1.5] text-[rgba(250,249,244,.4)]">
                  {selectedDetail.node.detail.lifestyle}
                </div>
              </div>

              <div className="border-r border-[rgba(255,255,255,.04)] px-4 py-[14px]">
                <div className="mb-2 text-[8px] font-[800] uppercase tracking-[.1em] text-[#383838]">What happens here</div>
                {selectedDetail.node.detail.what.map((w) => (
                  <div key={w} className="mb-[6px] text-[10.5px] leading-[1.45] text-[rgba(250,249,244,.6)]">
                    <span className="mr-[6px]" style={{ color: selectedDetail.col }}>
                      ·
                    </span>
                    {w}
                  </div>
                ))}
              </div>

              <div className="border-r border-[rgba(255,255,255,.04)] px-4 py-[14px]">
                <div className="mb-2 text-[8px] font-[800] uppercase tracking-[.1em] text-[#383838]">Skills you&apos;ll have</div>
                <div className="flex flex-wrap">
                  {selectedDetail.node.detail.skills.map((sk) => (
                    <span key={sk} className="mr-[3px] mb-[4px] rounded-[20px] border border-[rgba(255,255,255,.08)] bg-[rgba(255,255,255,.05)] px-[9px] py-[3px] text-[9.5px] text-[rgba(250,249,244,.65)]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-4 py-[14px]">
                <div className="mb-[9px] text-[8.5px] font-[800] uppercase tracking-[.1em] text-[#383838]">
                  Live jobs on Apna for this stage
                </div>
                <div className="space-y-[7px]">
                  {mdpJobs.map((j) => {
                    const lk = logoKey(j.co)
                    const logoTxt = j.co.split(' ').map((w) => w[0]).slice(0, 3).join('').toUpperCase()
                    return (
                      <button
                        key={j.title}
                        className="group w-full cursor-pointer overflow-hidden rounded-[9px] border border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.04)] p-[9px] text-left transition-all duration-200 hover:border-[rgba(168,85,247,.35)] hover:bg-[rgba(255,255,255,.08)] hover:translate-x-[2px]"
                        onClick={() => setJobModal({ open: true, job: j })}
                      >
                        <div className="mb-[6px] flex items-center gap-2">
                          <div
                            className={[
                              'flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px] text-[9px] font-[900] text-white',
                              lk === 'tcs'
                                ? 'bg-[linear-gradient(135deg,#0F4DA8,#1a73d9)]'
                                : lk === 'infosys'
                                  ? 'bg-[linear-gradient(135deg,#007CC3,#0096DC)]'
                                  : lk === 'wipro'
                                    ? 'bg-[linear-gradient(135deg,#7B1FA2,#9C27B0)]'
                                    : lk === 'hdfc'
                                      ? 'bg-[linear-gradient(135deg,#004C8F,#0063b1)]'
                                      : lk === 'icici'
                                        ? 'bg-[linear-gradient(135deg,#B02A30,#D63939)]'
                                        : lk === 'goldman'
                                          ? 'bg-[linear-gradient(135deg,#7B6CFF,#a855f7)]'
                                          : 'bg-[linear-gradient(135deg,#FF6B00,#FF8533)]',
                            ].join(' ')}
                          >
                            {logoTxt}
                          </div>
                          <div className="min-w-0 flex-1 truncate text-[11px] font-[800] text-[#FAF9F4]">{j.co}</div>
                          {j.posted?.includes('1d') || j.posted?.includes('2d') ? (
                            <div className="rounded-[3px] bg-[rgba(72,219,133,.1)] px-[6px] py-[2px] text-[7.5px] font-[800] uppercase tracking-[.06em] text-[#48DB85]">
                              New
                            </div>
                          ) : null}
                        </div>
                        <div className="mb-[5px] text-[11.5px] font-[700] leading-[1.3] text-[rgba(250,249,244,.92)]">
                          {j.title}
                        </div>
                        <div className="flex flex-wrap gap-[9px] text-[9.5px] text-[rgba(250,249,244,.4)]">
                          <span>📍 {j.loc}</span>
                          <span>{j.mode}</span>
                          <span className="font-[700] text-[#48DB85]">{formatSalaryLabelIndian(j.sal)}</span>
                          {j.posted ? <span>{j.posted}</span> : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-shrink-0 items-center justify-between gap-3">
          <div className="text-[12px] text-[rgba(250,249,244,.4)]">
            {selectedNode ? (
              <>
                Accelerated path saves <strong className="text-[#FAF9F4]">{saveYears} years</strong> vs Traditional
              </>
            ) : (
              <span className="text-[rgba(250,249,244,.55)]">
                Click a milestone on your preferred path to continue
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="border-[rgba(255,255,255,.1)] text-[rgba(250,249,244,.4)] hover:bg-[rgba(255,255,255,.06)]" onClick={() => nav('/2')}>
              ← Back
            </Button>
            <Button
              className="bg-[#7504FF] shadow-[0_4px_16px_rgba(117,4,255,.3)] hover:bg-[#7504FF] disabled:opacity-40 disabled:shadow-none"
              onClick={() => setGapLoading(true)}
              disabled={gapLoading || !selectedNode}
              title={selectedNode ? undefined : 'Select a milestone on your preferred career path first'}
            >
              See What&apos;s Missing →
            </Button>
          </div>
        </div>
      </div>

      <JobDetailModal open={jobModal.open} job={jobModal.job} onClose={() => setJobModal({ open: false, job: null })} />
      <RunLoadOverlay
        open={gapLoading}
        variant="gaps"
        totalMs={7200}
        onDone={() => {
          setGapLoading(false)
          nav('/4')
        }}
      />
    </section>
  )
}

