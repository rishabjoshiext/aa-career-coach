import { useEffect, useMemo, useRef, useState } from 'react'

/** Mirrors fasttrack_v6 `laMsgs` + `runLoad('loadA', …)`. */
const PROFILE_ITEMS = [
  { pre: 'Reading', post: 'data points from your profile', target: 147, suffix: '+' },
  { pre: 'Cross-referencing', post: 'similar career journeys', target: 4830, suffix: '+' },
  { pre: 'Identifying', post: 'salary benchmarks for your industry', target: 287, suffix: '+' },
  { pre: 'Mapping', post: 'target roles that fit you', target: 24, suffix: '' },
  { pre: 'Computing', post: 'path compression timelines', target: 18, suffix: '' },
]

/** Mirrors fasttrack_v6 `lbMsgs` + `runLoad('loadB', …)`. */
const GAP_ITEMS = [
  { pre: 'Checking', post: 'role requirements against your profile', target: 42, suffix: '' },
  { pre: 'Scanning', post: 'job descriptions for the target role', target: 312, suffix: '+' },
  { pre: 'Analysing', post: 'seniority benchmarks across levels', target: 64, suffix: '' },
  { pre: 'Calculating', post: 'timeline data points per path', target: 128, suffix: '' },
  { pre: 'Generating', post: 'personalised report sections', target: 12, suffix: '' },
]

function lineState(i, runningIdx, completedIdx) {
  if (completedIdx >= i) return 'done'
  if (runningIdx === i) return 'running'
  return 'idle'
}

export function RunLoadOverlay({ open, variant = 'profile', onDone, totalMs = 7200 }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const items = useMemo(() => (variant === 'gaps' ? GAP_ITEMS : PROFILE_ITEMS), [variant])
  const title = variant === 'gaps' ? 'Calculating your gaps' : 'Analysing your profile'
  const subtitle =
    variant === 'gaps'
      ? 'Building your personalised gap report.'
      : 'Checking real data — takes a moment.'

  const [runningIdx, setRunningIdx] = useState(-1)
  const [completedIdx, setCompletedIdx] = useState(-1)
  const [nums, setNums] = useState(() => items.map(() => 10))
  const [pbarWide, setPbarWide] = useState(false)
  const timersRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    for (const t of timersRef.current) window.clearTimeout(t)
    timersRef.current = []
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    if (!open) {
      setRunningIdx(-1)
      setCompletedIdx(-1)
      setNums(items.map(() => 10))
      setPbarWide(false)
      return undefined
    }

    setRunningIdx(-1)
    setCompletedIdx(-1)
    setNums(items.map(() => 10))
    setPbarWide(false)
    window.requestAnimationFrame(() => setPbarWide(true))

    const perMsg = Math.max(400, Math.floor(totalMs / items.length))
    let cancelled = false

    const push = (fn, ms) => {
      timersRef.current.push(window.setTimeout(fn, ms))
    }

    const animateCounter = (idx, target, durationMs) => {
      const from = 10
      const start = performance.now()
      const step = (now) => {
        if (cancelled) return
        const k = Math.min(1, (now - start) / durationMs)
        const ease = 1 - (1 - k) ** 3
        const v = Math.round(from + (target - from) * ease)
        setNums((prev) => {
          const next = [...prev]
          next[idx] = v
          return next
        })
        if (k < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          rafRef.current = null
          setNums((prev) => {
            const next = [...prev]
            next[idx] = target
            return next
          })
        }
      }
      rafRef.current = requestAnimationFrame(step)
    }

    const advance = (step) => {
      if (cancelled) return
      if (step > 0) {
        const prev = step - 1
        setCompletedIdx(prev)
        setNums((prevN) => {
          const next = [...prevN]
          next[prev] = items[prev].target
          return next
        })
      }
      if (step < items.length) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setRunningIdx(step)
        animateCounter(step, items[step].target, Math.max(160, perMsg - 100))
        push(() => advance(step + 1), perMsg)
      } else {
        setRunningIdx(-1)
        push(() => {
          if (!cancelled) onDoneRef.current?.()
        }, 420)
      }
    }

    push(() => advance(0), 120)

    return () => {
      cancelled = true
      for (const t of timersRef.current) window.clearTimeout(t)
      timersRef.current = []
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [open, items, totalMs])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[950] flex flex-col items-center justify-center bg-[#0C0C0C] text-[#FAF9F4] transition-opacity duration-300">
      <div className="[font-family:'DM Serif Display',serif] text-[20px] text-[#FAF9F4]">{title}</div>
      <div className="mb-9 mt-[5px] max-w-[90vw] text-center text-[12px] text-[rgba(250,249,244,.4)]">{subtitle}</div>

      <div className="flex w-full max-w-[92vw] flex-col gap-[9px]" style={{ width: 'fit-content' }}>
        {items.map((it, i) => {
          const st = lineState(i, runningIdx, completedIdx)
          const isDone = st === 'done'
          const isRun = st === 'running'
          const dim = st === 'idle'
          const display = nums[i] ?? 10
          return (
            <div
              key={`${variant}-${i}`}
              className={[
                'flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] transition-colors duration-300',
                dim ? 'text-[rgba(250,249,244,.3)]' : '',
                isDone ? 'text-[rgba(250,249,244,.85)]' : '',
                isRun ? 'text-[#a855f7]' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] text-[9px] transition-all duration-300',
                  isDone ? 'border-[#a855f7] bg-[#a855f7] text-white' : '',
                  isRun ? 'border-[#a855f7] motion-safe:animate-[loaderChkSpin_0.8s_linear_infinite]' : 'border-[rgba(255,255,255,.1)]',
                  dim ? 'border-[rgba(255,255,255,.1)]' : '',
                ].join(' ')}
              >
                {isDone ? '✓' : '○'}
              </div>
              <span className="min-w-[72px] font-[700]">{it.pre}</span>
              <span
                className={[
                  'min-w-[52px] text-right font-[800] tabular-nums',
                  isDone ? 'text-[rgba(168,85,247,.55)]' : '',
                  isRun ? 'text-[#a855f7]' : '',
                  dim ? 'text-[rgba(168,85,247,.35)]' : '',
                ].join(' ')}
              >
                {display.toLocaleString('en-IN')}
                {it.suffix}
              </span>
              <span className="min-w-0 flex-1 basis-full pl-[28px] text-[12px] opacity-85 sm:basis-auto sm:pl-0">{it.post}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-8 h-[2px] w-[min(320px,90vw)] overflow-hidden rounded-[2px] bg-[rgba(255,255,255,.05)]">
        <div
          className="h-full rounded-[2px] bg-[linear-gradient(90deg,#37017B,#7504FF)] transition-[width] duration-[3000ms] ease-out"
          style={{ width: pbarWide ? '100%' : '0%' }}
        />
      </div>
    </div>
  )
}
