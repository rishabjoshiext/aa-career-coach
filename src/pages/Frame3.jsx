import { useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'
import { RunLoadOverlay } from '../components/loaders/RunLoadOverlay.jsx'
import { PD } from '../utils/pathData.js'
import { resolvePdRole } from '../utils/roleKey.js'
import { resolveJourneySourceCard } from '../utils/journeySourceCard.js'
import { JOB_LISTINGS, logoKey } from '../utils/jobsData.js'
import { JobDetailModal } from '../components/modals/JobDetailModal.jsx'

const PBGSEL = { trad: 'rgba(136,136,136,0.18)', fast: 'rgba(255,215,0,0.13)', accel: 'rgba(72,219,133,0.14)' }

const PATHS = [
  { key: 'all', label: 'All Paths', chip: 'on' },
  { key: 'trad', label: '📈 Traditional' },
  { key: 'fast', label: '⚡ Fast Track' },
  { key: 'accel', label: '🚀 Accelerated', accel: true },
]

const PY = { trad: 90, fast: 270, accel: 450 }
const PCOL = { trad: '#888', fast: '#FFD700', accel: '#48DB85' }
/** Visual hierarchy: Traditional has the most milestones, then Fast Track, then Accelerated. */
const PATH_NODE_COUNTS = { trad: 6, fast: 4, accel: 3 }

function jobsForRole(roleName) {
  return JOB_LISTINGS[roleName] || []
}

function parseMonthlyBand(salText) {
  const s = String(salText || '')
  const nums = s.match(/(\d+(?:\.\d+)?)([kKlL]?)/g) || []
  const vals = nums
    .map((n) => {
      const m = n.match(/(\d+(?:\.\d+)?)([kKlL]?)/)
      if (!m) return null
      const v = Number(m[1])
      const u = m[2].toLowerCase()
      if (u === 'l') return Math.round(v * 100000)
      if (u === 'k') return Math.round(v * 1000)
      return Math.round(v)
    })
    .filter(Boolean)
  if (!vals.length) return { min: 35000, max: 65000 }
  if (vals.length === 1) return { min: vals[0], max: Math.round(vals[0] * 1.2) }
  return { min: Math.min(vals[0], vals[1]), max: Math.max(vals[0], vals[1]) }
}

function formatBand(min, max) {
  const k1 = Math.round(min / 1000)
  const k2 = Math.round(max / 1000)
  return `₹${k1}–${k2}k/mo`
}

function mkNode(r, yr, brief, sal, isGoal = false) {
  return {
    r,
    yr,
    brief,
    sal,
    goal: isGoal,
    detail: {
      lifestyle: isGoal
        ? 'Destination stage. Compensation and role complexity accelerate.'
        : 'Progressive skill and responsibility growth at this stage.',
      what: [
        `Deliver outcomes as ${r}`,
        'Build stakeholder trust through measurable impact',
        'Strengthen role-specific execution quality',
        'Document outcomes for faster promotions/interviews',
      ],
      skills: ['Domain depth', 'Execution', 'Communication', 'Problem solving'],
    },
  }
}

function bandAtProgress(min, max, t) {
  const lo = Math.round(min + (max - min) * Math.max(0, t - 0.12) * 0.85)
  const hi = Math.round(min + (max - min) * Math.min(1, t + 0.08))
  return formatBand(Math.min(lo, hi), Math.max(lo, hi))
}

function buildPathRungs({ count, yearsTotal, target, desc, min, max, currentRole, pathKey }) {
  const rungs = []
  const tiers = ['Associate', 'Analyst', 'Specialist', 'Senior', 'Lead']
  for (let i = 0; i < count; i += 1) {
    const isGoal = i === count - 1
    const t = count === 1 ? 1 : i / (count - 1)
    const yr = Math.max(0.6, +(yearsTotal * t).toFixed(1))
    const sal = bandAtProgress(min, max, 0.35 + t * 0.62)
    if (isGoal) {
      rungs.push(mkNode(target, yr, desc, formatBand(min, max), true))
      continue
    }
    if (pathKey === 'accel' && i === 0) {
      rungs.push(
        mkNode(
          `${(currentRole || 'Current').slice(0, 22)} + Upskilling`,
          yr,
          'Parallel work + credential build; weekends / online',
          bandAtProgress(min, max, 0.32),
          false,
        ),
      )
      continue
    }
    const tier = tiers[Math.min(i, tiers.length - 1)]
    rungs.push(mkNode(`${target} ${tier}`, yr, 'Progressive skill and responsibility growth at this stage.', sal, false))
  }
  return rungs
}

function deterministicJourney(card, currentRole = 'Current Role') {
  const target = card?.role || 'Career Destination'
  const desc = card?.desc || 'Progress toward target destination'
  const yrs = {
    trad: Number(card?.tradYrs) || 8,
    fast: Number(card?.fastYrs) || 5,
    accel: Number(card?.accelYrs) || 3,
  }
  const { min, max } = parseMonthlyBand(card?.sal)
  const nTrad = PATH_NODE_COUNTS.trad
  const nFast = PATH_NODE_COUNTS.fast
  const nAccel = PATH_NODE_COUNTS.accel
  return {
    trad: { yrs: yrs.trad, label: 'Traditional' },
    fast: { yrs: yrs.fast, label: 'Fast Track' },
    accel: { yrs: yrs.accel, label: 'Accelerated' },
    nodes: {
      trad: buildPathRungs({
        count: nTrad,
        yearsTotal: yrs.trad,
        target,
        desc,
        min,
        max,
        currentRole,
        pathKey: 'trad',
      }),
      fast: buildPathRungs({
        count: nFast,
        yearsTotal: yrs.fast,
        target,
        desc,
        min,
        max,
        currentRole,
        pathKey: 'fast',
      }),
      accel: buildPathRungs({
        count: nAccel,
        yearsTotal: yrs.accel,
        target,
        desc,
        min,
        max,
        currentRole,
        pathKey: 'accel',
      }),
    },
  }
}

function journeyHasCanonicalLengths(j) {
  if (!j?.nodes) return false
  return (
    j.nodes.trad?.length === PATH_NODE_COUNTS.trad &&
    j.nodes.fast?.length === PATH_NODE_COUNTS.fast &&
    j.nodes.accel?.length === PATH_NODE_COUNTS.accel
  )
}

/** PD / AI may ship other lengths — coerce to canonical 6 / 4 / 3 so layout + hierarchy stay consistent. */
function ensureCanonicalJourney(raw, card, currentRole) {
  if (raw && journeyHasCanonicalLengths(raw)) return raw
  return deterministicJourney(card, currentRole)
}

function stripJsonFence(text) {
  const t = String(text || '').trim()
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  return m ? m[1].trim() : t
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
    out.nodes[pk] = (parsed.nodes[pk] || []).map((n) => {
      const d = n.detail
      const ok = d && Array.isArray(d.what) && d.what.length >= 4 && Array.isArray(d.skills) && d.skills.length >= 4
      return {
        ...n,
        detail: ok ? d : { ...defaultNodeDetail(), lifestyle: d?.lifestyle || defaultNodeDetail().lifestyle },
      }
    })
  }
  return out
}

/** Reject OpenAI output that drifts to the wrong destination (e.g. Finance when user picked Product). */
function validateJourneyForTarget(parsed, targetRole) {
  const want = String(targetRole || '').trim()
  if (!parsed || !want) return null
  const { trad: nt, fast: nf, accel: na } = PATH_NODE_COUNTS
  for (const pk of ['trad', 'fast', 'accel']) {
    const nodes = parsed.nodes?.[pk]
    const expected = pk === 'trad' ? nt : pk === 'fast' ? nf : na
    if (!Array.isArray(nodes) || nodes.length !== expected) return null
    const last = nodes[nodes.length - 1]
    if (!last.goal) return null
    if (String(last.r || '').trim() !== want) return null
    if (!parsed[pk]?.yrs || typeof parsed[pk].yrs !== 'number') return null
  }
  return enrichJourneyDetails(parsed)
}

async function generateJourneyWithOpenAI(card, currentRole) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null
  const target = String(card?.role || '').trim()
  const prompt = `Generate only valid JSON for a career journey map in India.

Target destination role (exact final title): ${target}
Role description: ${card.desc || '—'}
Traditional years: ${card.tradYrs}
Fast years: ${card.fastYrs}
Accelerated years: ${card.accelYrs}
Target salary band: ${card.sal}
Current role: ${currentRole || 'Current Role'}

Output JSON shape:
{"trad":{"yrs":number,"label":"Traditional"},"fast":{"yrs":number,"label":"Fast Track"},"accel":{"yrs":number,"label":"Accelerated"},"nodes":{"trad":[...EXACTLY 6 nodes...],"fast":[...EXACTLY 4 nodes...],"accel":[...EXACTLY 3 nodes...]}}

Each node: r, yr, brief, sal, detail object with lifestyle (string), what (array of 4 strings), skills (array of 4 strings).
The three paths MUST have different lengths: traditional has the most steps (6), fast track fewer (4), accelerated the fewest (3).
CRITICAL: In EVERY path, the LAST node must have goal=true and the field r must be EXACTLY "${target}" (same spelling and spacing). Intermediate roles must be realistic steps toward ${target}, not a different profession.`
  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.2,
      }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.output_text || ''
    if (!text) return null
    const parsed = JSON.parse(stripJsonFence(text))
    return validateJourneyForTarget(parsed, target)
  } catch {
    return null
  }
}

function pdfRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }
}

function pdfTrunc(text, max) {
  return String(text || '').length > max ? String(text).slice(0, max) + '…' : String(text || '')
}

export function Frame3() {
  const nav = useNavigate()
  const { s, selRole, selIndustry } = useAppState()
  const fallbackRole = resolvePdRole(selRole)
  const roleTitle = (selRole && String(selRole).trim()) || fallbackRole

  const journeyCard = useMemo(
    () => resolveJourneySourceCard({ selRole, selIndustry: selIndustry || 'all', profile: s }),
    [selRole, selIndustry, s],
  )

  const [dynJourney, setDynJourney] = useState(null)

  const pdStatic = PD[roleTitle] || null
  const deterministicFallback = useMemo(
    () => deterministicJourney(journeyCard, s.role || ''),
    [journeyCard, s.role],
  )

  const d = useMemo(() => {
    const raw = dynJourney || pdStatic || deterministicFallback
    return ensureCanonicalJourney(raw, journeyCard, s.role || '')
  }, [dynJourney, pdStatic, deterministicFallback, journeyCard, s.role])

  const pathTrack = useMemo(() => {
    const m = Math.max(d.nodes.trad.length, d.nodes.fast.length, d.nodes.accel.length)
    const gap = Math.min(280, Math.max(218, Math.floor(1700 / Math.max(m, 1))))
    const canvasW = 120 + m * gap + 360
    return { maxNodes: m, gap, canvasW }
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
    const sX = 120
    const sY = 270
    const nodeGap = pathTrack.gap
    const maxX = pathTrack.canvasW
    let svg = ''

    for (let yr = 1; yr <= 12; yr += 1) {
      const x = sX + yr * 185
      if (x > maxX) break
      svg += `<line x1="${x}" y1="30" x2="${x}" y2="490" stroke="rgba(255,255,255,0.03)" stroke-width="1" stroke-dasharray="2,8" />`
      if ([1, 2, 3, 5, 7, 9].includes(yr)) {
        svg += `<text x="${x}" y="16" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.42)" font-family="Outfit" font-weight="700">Yr ${yr}</text>`
      }
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
      const centerAt = (idx) => sX + (idx + 1) * nodeGap
      const fCX = centerAt(0)
      const fLE = fCX - 82
      const start =
        pk === 'trad'
          ? `M ${sX},${sY} C ${sX + 100},${sY} ${fLE - 70},${py} ${fLE},${py}`
          : pk === 'fast'
            ? `M ${sX},${sY} C ${sX + 60},${sY} ${fLE - 30},${py} ${fLE},${py}`
            : `M ${sX},${sY} C ${sX + 100},${sY} ${fLE - 70},${py} ${fLE},${py}`
      let pth = start
      for (let i = 0; i < ns.length - 1; i += 1) {
        const cx1 = centerAt(i)
        const cx2 = centerAt(i + 1)
        pth += ` M ${cx1 + 82},${py} L ${cx2 - 82},${py}`
      }
      const col = { trad: '#666', fast: '#FFD700', accel: '#48DB85' }[pk]
      const labelCol = pk === 'trad' ? '#FAF9F4' : col
      svg += `<path d="${pth}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${op}" />`
      svg += `<text x="128" y="${py - 24}" font-size="12" fill="${isActive ? labelCol : 'rgba(255,255,255,0.14)'}" font-family="Outfit" font-weight="900" letter-spacing="0.05em">${isActive ? d[pk].label.toUpperCase() : ''}</text>`
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

  const startRole = (s.role || 'Current').substring(0, 12)

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
    let alive = true
    const run = async () => {
      setJourneyIntroLoading(true)
      if (pdStatic) {
        setDynJourney(null)
        window.setTimeout(() => alive && setJourneyIntroLoading(false), 1200)
        return
      }
      setDynJourney(null)
      const aiJourney = await generateJourneyWithOpenAI(journeyCard, s.role)
      if (!alive) return
      setDynJourney(aiJourney || null)
      window.setTimeout(() => alive && setJourneyIntroLoading(false), 1200)
    }
    run()
    return () => {
      alive = false
    }
  }, [roleTitle, pdStatic, journeyCard, s.role])

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

  const downloadJourneyPdf = () => {
    try {
      const CW = pathTrack.canvasW
      const CH = 560  // extra headroom for header
      const DPR = 2
      const sX = 120
      const sY = 290  // shifted down to make room for the header text
      const nodeGap = pathTrack.gap
      const centerAt = (idx) => sX + (idx + 1) * nodeGap
      const COL = { trad: '#888888', fast: '#FFD700', accel: '#48DB85' }

      const offscreen = document.createElement('canvas')
      offscreen.width = CW * DPR
      offscreen.height = CH * DPR
      const ctx = offscreen.getContext('2d')
      ctx.scale(DPR, DPR)

      // Background
      ctx.fillStyle = '#0C0C0C'
      ctx.fillRect(0, 0, CW, CH)

      // Header: destination title
      ctx.fillStyle = 'rgba(250,249,244,0.9)'
      ctx.font = 'italic 700 18px Georgia, serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Career Journey to ${roleTitle}`, sX, 28)
      ctx.fillStyle = 'rgba(250,249,244,0.3)'
      ctx.font = '400 10px Outfit, system-ui, sans-serif'
      ctx.fillText('Three paths · Same destination', sX, 42)

      // Year grid
      for (let yr = 1; yr <= 12; yr++) {
        const x = sX + yr * 185
        if (x > CW) break
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'
        ctx.lineWidth = 1
        ctx.setLineDash([2, 8])
        ctx.beginPath()
        ctx.moveTo(x, 55)
        ctx.lineTo(x, CH - 10)
        ctx.stroke()
        ctx.setLineDash([])
        if ([1, 2, 3, 5, 7, 9].includes(yr)) {
          ctx.fillStyle = 'rgba(255,255,255,0.38)'
          ctx.font = '700 9px Outfit, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`Yr ${yr}`, x, 66)
        }
      }
      ctx.setLineDash([])

      // Lane backgrounds
      ;[
        { y: sY - 180, c: 'rgba(100,100,100,0.06)' },
        { y: sY,       c: 'rgba(55,1,123,0.06)'    },
        { y: sY + 180, c: 'rgba(72,219,133,0.06)'  },
      ].forEach(({ y, c }) => {
        ctx.fillStyle = c
        pdfRoundRect(ctx, sX, y - 52, Math.max(400, CW - 160), 104, 10)
        ctx.fill()
      })

      // Path Y positions (relative to sY)
      const pathY = { trad: sY - 180, fast: sY, accel: sY + 180 }

      // Path lines + labels — draw all paths at full opacity for the PDF
      ;['trad', 'fast', 'accel'].forEach((pk) => {
        const py = pathY[pk]
        const col = COL[pk]
        ctx.strokeStyle = col
        ctx.lineWidth = pk === 'accel' ? 2.5 : 2
        ctx.setLineDash([])

        const fCX = centerAt(0)
        const fLE = fCX - 82

        // Curved start from NOW to first tile
        ctx.beginPath()
        ctx.moveTo(sX, sY)
        ctx.bezierCurveTo(
          pk === 'fast' ? sX + 60 : sX + 100, sY,
          pk === 'fast' ? fLE - 30 : fLE - 70, py,
          fLE, py,
        )
        ctx.stroke()

        // Segments between tiles
        const ns = d.nodes[pk]
        for (let i = 0; i < ns.length - 1; i++) {
          ctx.beginPath()
          ctx.moveTo(centerAt(i) + 82, py)
          ctx.lineTo(centerAt(i + 1) - 82, py)
          ctx.stroke()
        }

        // Path label above first tile
        ctx.fillStyle = pk === 'trad' ? 'rgba(250,249,244,0.7)' : col
        ctx.font = '800 10px Outfit, system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(d[pk].label.toUpperCase(), 128, py - 26)
      })

      // NOW circle
      const nowX = 34 + 46
      ctx.strokeStyle = 'rgba(250,249,244,0.3)'
      ctx.fillStyle = 'rgba(250,249,244,0.08)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(nowX, sY, 42, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#FAF9F4'
      ctx.font = '800 10px Outfit, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('NOW', nowX, sY + 4)
      const startRole = pdfTrunc(s.role || 'Current', 10)
      ctx.fillStyle = 'rgba(250,249,244,0.4)'
      ctx.font = '400 8px Outfit, system-ui, sans-serif'
      ctx.fillText(startRole, nowX, sY + 16)

      // Milestone tiles
      ;['trad', 'fast', 'accel'].forEach((pk) => {
        const py = pathY[pk]
        const col = COL[pk]
        const CH_TILE = 92
        const TW = 176

        d.nodes[pk].forEach((n, idx) => {
          const cx = centerAt(idx)
          const tx = cx - 88
          const ty = py - CH_TILE / 2

          // Tile background
          ctx.fillStyle = '#1a1a1a'
          pdfRoundRect(ctx, tx, ty, TW, CH_TILE, 10)
          ctx.fill()
          ctx.strokeStyle = '#303030'
          ctx.lineWidth = 1.5
          pdfRoundRect(ctx, tx, ty, TW, CH_TILE, 10)
          ctx.stroke()

          if (n.goal) {
            // Gold "TARGET ROLE" badge
            ctx.fillStyle = 'rgba(255,215,0,0.15)'
            pdfRoundRect(ctx, tx + 11, ty + 10, 86, 14, 20)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,215,0,0.4)'
            ctx.lineWidth = 0.8
            pdfRoundRect(ctx, tx + 11, ty + 10, 86, 14, 20)
            ctx.stroke()
            ctx.fillStyle = '#FFD700'
            ctx.font = '700 7px Outfit, system-ui, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText('★  TARGET ROLE', tx + 17, ty + 20)

            // Role title below badge
            ctx.fillStyle = '#FAF9F4'
            ctx.font = '800 11px Outfit, system-ui, sans-serif'
            ctx.fillText(pdfTrunc(n.r, 22), tx + 11, ty + 37)
          } else {
            // Colour accent bar
            ctx.fillStyle = col
            pdfRoundRect(ctx, tx + 11, ty + 10, TW - 22, 2.5, 2)
            ctx.fill()

            // Role title
            ctx.fillStyle = '#FAF9F4'
            ctx.font = '800 11px Outfit, system-ui, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(pdfTrunc(n.r, 22), tx + 11, ty + 29)
          }

          // Year
          ctx.fillStyle = col
          ctx.font = '700 9px Outfit, system-ui, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(`Year ${n.yr}`, tx + 11, ty + 50)

          // Brief
          ctx.fillStyle = 'rgba(250,249,244,0.45)'
          ctx.font = '400 8.5px Outfit, system-ui, sans-serif'
          ctx.fillText(pdfTrunc(n.brief, 32), tx + 11, ty + 63)

          // Salary
          ctx.fillStyle = col
          ctx.font = '800 10px Outfit, system-ui, sans-serif'
          ctx.fillText(n.sal, tx + 11, ty + 77)
        })
      })

      // Export to PDF
      const imgData = offscreen.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ratio = offscreen.width / offscreen.height
      let targetW = pw - 10
      let targetH = targetW / ratio
      if (targetH > ph - 10) {
        targetH = ph - 10
        targetW = targetH * ratio
      }
      pdf.addImage(imgData, 'PNG', (pw - targetW) / 2, (ph - targetH) / 2, targetW, targetH)
      pdf.save(`journey-${roleTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (err) {
      console.error('Failed to export journey PDF', err)
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
                className="inline-flex items-center gap-[7px] rounded-[9px] bg-[#7504FF] px-[14px] py-[7px] text-[12px] font-[800] text-white shadow-[0_4px_14px_rgba(117,4,255,.4)] transition-all duration-200 hover:bg-[#8f15ff] active:scale-[.97]"
                onClick={downloadJourneyPdf}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1v7.5M6.5 8.5l-3-3M6.5 8.5l3-3M1.5 11h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Journey PDF
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

            <div className="absolute left-[34px] flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full border-2 border-[rgba(250,249,244,.28)] bg-[rgba(250,249,244,.08)]" style={{ top: `${270 - 46}px` }}>
              <div className="text-[10.5px] font-[900] uppercase tracking-[.06em] text-[#FAF9F4]">NOW</div>
              <div className="mt-[3px] px-1 text-center text-[8.5px] text-[rgba(250,249,244,.45)]">{startRole}</div>
            </div>

            <div className="absolute inset-0">
              {['trad', 'fast', 'accel'].map((pk) => {
                const isActive = filter === 'all' || filter === pk
                const op = isActive ? 1 : 0.07
                const py = PY[pk]
                const sX = 120
                const centerAt = (idx) => sX + (idx + 1) * pathTrack.gap
                const CH = 92
                return d.nodes[pk].map((n, idx) => {
                  const cx = centerAt(idx)
                  const cardX = cx - 88
                  const cardY = py - CH / 2
                  const isGoal = Boolean(n.goal)
                  const selected = selectedNode?.pathKey === pk && selectedNode?.idx === idx
                  const tileKey = `${pk}:${idx}`
                  const showTileSk = journeyIntroLoading || skeletonKeys.has(tileKey)
                  return (
                    <button
                      key={tileKey}
                      className={[
                        'absolute w-[176px] select-none rounded-[11px] border-[1.5px] border-[#272727] bg-[#161616] px-[13px] py-[11px] text-left transition-[opacity,transform,box-shadow,border-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
                        !isActive || showTileSk ? 'pointer-events-none' : 'cursor-pointer',
                        selected ? 'shadow-[0_0_0_4px_color-mix(in_srgb,var(--mc)_25%,transparent),0_8px_30px_rgba(0,0,0,.55)] -translate-y-[3px] scale-[1.03]' : '',
                        showTileSk ? 'milestone-tile-skeleton' : 'milestone-tile-reveal',
                      ].join(' ')}
                      style={{
                        left: `${cardX}px`,
                        top: `${cardY}px`,
                        opacity: op,
                        ['--mc']: PCOL[pk],
                        borderColor: selected ? PCOL[pk] : undefined,
                        backgroundColor: selected ? PBGSEL[pk] : undefined,
                      }}
                      onClick={() => setSelectedNode({ pathKey: pk, idx })}
                    >
                      <div className="milestone-tile-inner transition-opacity duration-200">
                        {isGoal ? (
                          <div className="mb-[6px] inline-block rounded-[20px] border border-[rgba(255,215,0,.3)] bg-[rgba(255,215,0,.15)] px-[7px] py-[2px] text-[8px] font-[800] uppercase tracking-[.05em] text-[#FFD700]">
                            ★ TARGET ROLE
                          </div>
                        ) : (
                          <div className="mb-[9px] h-[2.5px] rounded-[2px]" style={{ background: PCOL[pk] }} />
                        )}
                        <div className="mb-[3px] text-[11px] font-[800] leading-[1.3] text-[#FAF9F4]">{n.r}</div>
                        <div className="mb-[4px] flex items-center gap-[5px] text-[9px] font-[700]" style={{ color: PCOL[pk] }}>
                          Year {n.yr} {n.tag ? <span className="rounded-[10px] bg-[rgba(117,4,255,.3)] px-[6px] py-[1.5px] text-[7.5px] font-[800] text-[#e879f9]">+DEGREE</span> : null}
                        </div>
                        <div className="mb-[6px] text-[9px] leading-[1.45] text-[rgba(250,249,244,.42)]">{n.brief}</div>
                        <div className="text-[10px] font-[800]" style={{ color: isActive ? PCOL[pk] : '#888' }}>
                          {n.sal}
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
                <div className="mb-[3px] text-[16px] [font-family:'DM Serif Display',serif]">{selectedDetail.node.r}</div>
                <div className="mb-1 text-[10px] font-[700]" style={{ color: selectedDetail.col }}>
                  Year {selectedDetail.node.yr}
                </div>
                <div className="mb-2 text-[20px] font-[900]" style={{ color: selectedDetail.col }}>
                  {selectedDetail.node.sal}
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
                          <span className="font-[700] text-[#48DB85]">{j.sal}</span>
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

        <div className="mt-2 flex flex-shrink-0 items-center justify-between">
          <div className="text-[12px] text-[rgba(250,249,244,.4)]">
            Accelerated path saves <strong className="text-[#FAF9F4]">{saveYears} years</strong> vs Traditional
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="border-[rgba(255,255,255,.1)] text-[rgba(250,249,244,.4)] hover:bg-[rgba(255,255,255,.06)]" onClick={() => nav('/2')}>
              ← Back
            </Button>
            <Button
              className="bg-[#7504FF] shadow-[0_4px_16px_rgba(117,4,255,.3)] hover:bg-[#7504FF]"
              onClick={() => setGapLoading(true)}
              disabled={gapLoading}
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

