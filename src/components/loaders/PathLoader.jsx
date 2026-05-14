import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../utils/cn.js'

const LINES = [
  'Mapping the journey for <strong>{role}</strong>…',
  'Browsing through <strong>{n1}</strong> real profiles like yours…',
  'Looking at where they ended up…',
  'Cross-checking <strong>{n2}</strong> salary bands across India…',
  'Found <strong>{n3}</strong> matching openings on Apna…',
  'Asking <strong>4,280</strong> journeys if this checks out…',
  'Adding a pinch of optimism. Plating it nicely…',
]

function fill(line, vars) {
  return line
    .replace('{role}', vars.role)
    .replace('{n1}', vars.n1)
    .replace('{n2}', vars.n2)
    .replace('{n3}', vars.n3)
}

export function PathLoader({ role, open, onDone, title = 'Building your career paths…', durationMs = 10500 }) {
  const glowFilterId = useId().replace(/:/g, '')
  const [aState, setAState] = useState({ html: '', cls: '' })
  const [bState, setBState] = useState({ html: '', cls: '' })
  const intRef = useRef(null)
  const doneRef = useRef(null)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const vars = useMemo(() => {
    const r = role || 'your goal'
    const seed = r.length
    return {
      role: r,
      n1: (4830 - seed * 7).toLocaleString('en-IN'),
      n2: (287 + seed * 4).toLocaleString('en-IN'),
      n3: (12400 + seed * 23).toLocaleString('en-IN'),
    }
  }, [role])

  useLayoutEffect(() => {
    if (!open) return undefined

    // Run before paint so the first subline is visible on the opening frame.
    /* eslint-disable react-hooks/set-state-in-effect -- intentional bootstrap in useLayoutEffect */
    setAState({ html: fill(LINES[0], vars), cls: 'in' })
    setBState({ html: '', cls: '' })
    /* eslint-enable react-hooks/set-state-in-effect */

    let i = 1
    /** Alternate which caption slot receives the next line (avoids stale `slot` state in the interval). */
    let nextIsB = true

    intRef.current = window.setInterval(() => {
      const html = fill(LINES[i % LINES.length], vars)
      if (nextIsB) {
        setBState({ html, cls: '' })
        window.requestAnimationFrame(() => {
          setBState({ html, cls: 'in' })
          setAState((p) => ({ ...p, cls: 'out' }))
          window.setTimeout(() => setAState((p) => ({ ...p, cls: '' })), 760)
        })
      } else {
        setAState({ html, cls: '' })
        window.requestAnimationFrame(() => {
          setAState({ html, cls: 'in' })
          setBState((p) => ({ ...p, cls: 'out' }))
          window.setTimeout(() => setBState((p) => ({ ...p, cls: '' })), 760)
        })
      }
      nextIsB = !nextIsB
      i += 1
    }, 1900)

    doneRef.current = window.setTimeout(() => {
      onDoneRef.current?.()
    }, durationMs)

    return () => {
      if (intRef.current) window.clearInterval(intRef.current)
      if (doneRef.current) window.clearTimeout(doneRef.current)
      intRef.current = null
      doneRef.current = null
    }
  }, [open, vars, durationMs])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[900] flex flex-col items-center justify-center bg-[linear-gradient(155deg,#1a0a2e_0%,#0d0518_38%,#080010_72%,#0c0c0c_100%)]">
      <div className="flex flex-col items-center px-4">
        <svg
          key={role}
          className="h-[110px] w-[560px] max-w-[92vw]"
          viewBox="0 0 560 110"
          aria-hidden
        >
          <defs>
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Top: subtle grey arc */}
          <path
            pathLength={1}
            d="M 40,55 C 100,55 110,18 180,18 L 520,18"
            fill="none"
            stroke="#6b6b6b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1}
            className="motion-safe:animate-[pathDraw_2.5s_cubic-bezier(.4,0,.2,1)_forwards]"
          />
          {/* Middle: primary purple straight path */}
          <path
            pathLength={1}
            d="M 40,55 L 520,55"
            fill="none"
            stroke="#37017B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1}
            className="motion-safe:animate-[pathDraw_2.2s_cubic-bezier(.4,0,.2,1)_0.65s_forwards]"
          />
          {/* Bottom: glowing accent path */}
          <path
            pathLength={1}
            d="M 40,55 C 100,55 110,90 180,90 L 440,90"
            fill="none"
            stroke="#7504FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1}
            filter={`url(#${glowFilterId})`}
            className="motion-safe:animate-[pathDraw_2s_cubic-bezier(.4,0,.2,1)_1.15s_forwards]"
          />
          <circle cx="40" cy="55" r="6" fill="#37017B" stroke="#FAF9F4" strokeWidth="2" />
          <circle
            cx="520"
            cy="18"
            r="4"
            fill="#888"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.35s_ease_1.75s_forwards]"
          />
          <circle
            cx="520"
            cy="55"
            r="5"
            fill="#37017B"
            stroke="#FAF9F4"
            strokeWidth="1.5"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.35s_ease_1.95s_forwards]"
          />
          <circle
            cx="440"
            cy="90"
            r="7"
            fill="#7504FF"
            stroke="#FAF9F4"
            strokeWidth="1.5"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.4s_ease_2.15s_forwards]"
          />
        </svg>

        <div className="mt-5 text-center text-[22px] font-[600] leading-snug tracking-[-0.02em] text-[#FAF9F4] [font-family:'DM Serif Display',serif]">
          {title}
        </div>

        {/* Rotating sublines (v6-style). twMerge avoids opacity-0 + opacity-100 both applying. */}
        <div className="relative mt-[12px] min-h-[5.5rem] w-full max-w-[640px] overflow-hidden px-2">
          <div
            className={cn(
              'path-loader-caption absolute inset-0 flex items-center justify-center px-3 text-center text-[14px] font-[500] leading-[1.5] tracking-[-.01em] text-[#b8b5ad] transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(.4,0,.2,1)] [font-family:Outfit,system-ui,sans-serif] [&_strong]:font-[700] [&_strong]:text-[#f5f4ef]',
              aState.cls === 'in' && 'translate-y-0 opacity-100',
              aState.cls === 'out' && '-translate-y-full opacity-0',
              (aState.cls === '' || !aState.cls) && 'translate-y-full opacity-0',
            )}
            dangerouslySetInnerHTML={{ __html: aState.html }}
          />
          <div
            className={cn(
              'path-loader-caption absolute inset-0 flex items-center justify-center px-3 text-center text-[14px] font-[500] leading-[1.5] tracking-[-.01em] text-[#b8b5ad] transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(.4,0,.2,1)] [font-family:Outfit,system-ui,sans-serif] [&_strong]:font-[700] [&_strong]:text-[#f5f4ef]',
              bState.cls === 'in' && 'translate-y-0 opacity-100',
              bState.cls === 'out' && '-translate-y-full opacity-0',
              (bState.cls === '' || !bState.cls) && 'translate-y-full opacity-0',
            )}
            dangerouslySetInnerHTML={{ __html: bState.html }}
          />
        </div>

        <div className="mt-[22px] flex gap-[6px]">
          <div className="h-[6px] w-[6px] rounded-full bg-[rgba(255,255,255,.15)] motion-safe:animate-[dotbounce_1.2s_infinite]" />
          <div className="h-[6px] w-[6px] rounded-full bg-[rgba(255,255,255,.15)] motion-safe:animate-[dotbounce_1.2s_.2s_infinite]" />
          <div className="h-[6px] w-[6px] rounded-full bg-[rgba(255,255,255,.15)] motion-safe:animate-[dotbounce_1.2s_.4s_infinite]" />
        </div>
      </div>
    </div>
  )
}
