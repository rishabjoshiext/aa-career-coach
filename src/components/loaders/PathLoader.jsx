import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [idx, setIdx] = useState(0)
  const [slot, setSlot] = useState('a') // a|b active
  const [aState, setAState] = useState({ html: '', cls: '' })
  const [bState, setBState] = useState({ html: '', cls: '' })
  const intRef = useRef(null)
  const doneRef = useRef(null)

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

  useEffect(() => {
    if (!open) return undefined

    setIdx(0)
    setSlot('a')
    setAState({ html: fill(LINES[0], vars), cls: 'in' })
    setBState({ html: '', cls: '' })

    let i = 1
    intRef.current = window.setInterval(() => {
      const html = fill(LINES[i % LINES.length], vars)
      if (slot === 'a') {
        setBState({ html, cls: '' })
        // force tick
        window.requestAnimationFrame(() => {
          setBState({ html, cls: 'in' })
          setAState((p) => ({ ...p, cls: 'out' }))
          window.setTimeout(() => setAState((p) => ({ ...p, cls: '' })), 760)
        })
        setSlot('b')
      } else {
        setAState({ html, cls: '' })
        window.requestAnimationFrame(() => {
          setAState({ html, cls: 'in' })
          setBState((p) => ({ ...p, cls: 'out' }))
          window.setTimeout(() => setBState((p) => ({ ...p, cls: '' })), 760)
        })
        setSlot('a')
      }
      i += 1
      setIdx(i)
    }, 1900)

    doneRef.current = window.setTimeout(() => {
      onDone?.()
    }, durationMs)

    return () => {
      if (intRef.current) window.clearInterval(intRef.current)
      if (doneRef.current) window.clearTimeout(doneRef.current)
      intRef.current = null
      doneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[900] flex flex-col items-center justify-center bg-[linear-gradient(145deg,#080010,#0C0C0C)]">
      <div className="flex flex-col items-center">
        <svg className="h-[110px] w-[560px] max-w-[92vw]" viewBox="0 0 560 110">
          <defs>
            <filter id="pg">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 40,55 C 100,55 110,18 180,18 L 520,18"
            fill="none"
            stroke="#444"
            strokeWidth="1.5"
            className="[stroke-dasharray:2000] [stroke-dashoffset:2000] motion-safe:animate-[drawLine_2.6s_ease_forwards]"
          />
          <path
            d="M 40,55 L 520,55"
            fill="none"
            stroke="#37017B"
            strokeWidth="2"
            className="[stroke-dasharray:1600] [stroke-dashoffset:1600] motion-safe:animate-[drawLine_2.4s_ease_.7s_forwards]"
          />
          <path
            d="M 40,55 C 100,55 110,90 180,90 L 440,90"
            fill="none"
            stroke="#7504FF"
            strokeWidth="3"
            filter="url(#pg)"
            className="[stroke-dasharray:1200] [stroke-dashoffset:1200] motion-safe:animate-[drawLine_2.2s_ease_1.3s_forwards]"
          />
          <circle cx="40" cy="55" r="7" fill="rgba(250,249,244,0.15)" stroke="rgba(250,249,244,0.5)" strokeWidth="1.5" />
          <circle
            cx="520"
            cy="18"
            r="5"
            fill="#444"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.3s_ease_1.8s_forwards]"
          />
          <circle
            cx="520"
            cy="55"
            r="6"
            fill="#37017B"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.3s_ease_2s_forwards]"
          />
          <circle
            cx="440"
            cy="90"
            r="8"
            fill="#7504FF"
            opacity="0"
            className="motion-safe:animate-[fadeIn_.4s_ease_2.2s_forwards]"
          />
        </svg>

        <div className="mt-5 text-center text-[22px] [font-family:'DM Serif Display',serif] text-[#FAF9F4]">{title}</div>

        <div className="relative mt-[14px] h-[38px] w-full max-w-[640px] overflow-hidden">
          <div
            className={[
              'absolute inset-0 flex items-center justify-center px-4 text-center text-[16px] font-[500] leading-[1.35] tracking-[-.005em] text-[rgba(250,249,244,.72)] opacity-0 transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(.4,0,.2,1)] [will-change:transform,opacity] translate-y-full',
              aState.cls === 'in' ? 'translate-y-0 opacity-100' : '',
              aState.cls === 'out' ? '-translate-y-full opacity-0' : '',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: aState.html }}
          />
          <div
            className={[
              'absolute inset-0 flex items-center justify-center px-4 text-center text-[16px] font-[500] leading-[1.35] tracking-[-.005em] text-[rgba(250,249,244,.72)] opacity-0 transition-[transform,opacity] duration-700 [transition-timing-function:cubic-bezier(.4,0,.2,1)] [will-change:transform,opacity] translate-y-full',
              bState.cls === 'in' ? 'translate-y-0 opacity-100' : '',
              bState.cls === 'out' ? '-translate-y-full opacity-0' : '',
            ].join(' ')}
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

