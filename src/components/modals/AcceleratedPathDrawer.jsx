import { useMemo } from 'react'
import { useAppState } from '../../hooks/appState.jsx'
import { profileMonthlySalaryLabel, resolveUserJourney } from '../../utils/resolveJourney.js'

/**
 * Bottom sheet (mp-drawer) — always shows the accelerated path, per fasttrack_v6 HTML.
 */
export function AcceleratedPathDrawer({ open, onClose }) {
  const { s, selRole, selIndustry } = useAppState()

  const { journey, destinationTitle } = useMemo(
    () => resolveUserJourney({ selRole, selIndustry, profile: s }),
    [selRole, selIndustry, s],
  )

  const accelNodes = journey?.nodes?.accel ?? []
  const accelYears = journey?.accel?.yrs ?? 5
  const tradYears = journey?.trad?.yrs ?? 9
  const yearsSaved = Math.max(0, tradYears - accelYears)

  const nowRole = (s.role || '').trim() || 'Current Role'
  const nowSal = profileMonthlySalaryLabel(s)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-[rgba(12,12,12,.55)] backdrop-blur-[8px] motion-safe:animate-[modalFadeIn_.2s_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accel-path-drawer-title"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose()
      }}
    >
      <div
        className="relative flex max-h-[80vh] w-full max-w-[780px] flex-col overflow-hidden rounded-t-[20px] border border-b-0 border-[rgba(168,85,247,.15)] bg-[linear-gradient(180deg,#0C0C0C_0%,#111_100%)] shadow-[0_-8px_48px_rgba(0,0,0,.5)] motion-safe:animate-[mpSlideUp_.35s_cubic-bezier(.4,0,.2,1)]"
        onMouseDown={(ev) => ev.stopPropagation()}
      >
        <div className="mx-auto mt-[11px] h-1 w-[42px] shrink-0 rounded-[3px] bg-[rgba(255,255,255,.2)]" aria-hidden />

        <div className="flex items-start justify-between gap-3 border-b border-[rgba(255,255,255,.05)] px-[22px] pb-3 pt-3">
          <div className="min-w-0">
            <div className="mb-1.5 inline-flex items-center gap-1 rounded-[20px] border border-[rgba(72,219,133,.2)] bg-[rgba(72,219,133,.08)] px-2.5 py-[3px] text-[9px] font-[800] uppercase tracking-[.09em] text-[#48DB85]">
              ⚡ Accelerated path
            </div>
            <h2
              id="accel-path-drawer-title"
              className="text-[18px] leading-[1.2] text-[#FAF9F4] [font-family:'DM Serif Display',serif]"
            >
              Your journey to <em className="text-[#48DB85] not-italic">{destinationTitle}</em>
            </h2>
          </div>
          <button
            type="button"
            className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[7px] border-0 bg-[rgba(255,255,255,.06)] text-[15px] text-[rgba(250,249,244,.6)] transition-all duration-200 hover:rotate-90 hover:bg-[rgba(255,255,255,.12)] hover:text-[#FAF9F4]"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex items-stretch gap-0 overflow-x-auto px-[22px] py-[18px]">
          <div className="min-w-[130px] flex-1 rounded-[10px] border border-dashed border-[rgba(255,255,255,.2)] bg-[rgba(255,255,255,.03)] px-3 py-2.5">
            <div className="mb-[3px] text-[8.5px] font-[800] uppercase tracking-[.08em] text-[rgba(255,255,255,.5)]">
              Now
            </div>
            <div className="mb-[3px] text-[11.5px] font-[700] leading-[1.3] text-[#FAF9F4]">{nowRole}</div>
            <div className="text-[10px] font-[700] text-[rgba(255,255,255,.5)]">
              {nowSal || 'Starting point'}
            </div>
          </div>

          {accelNodes.map((n, i) => {
            const isGoal = Boolean(n.goal) || i === accelNodes.length - 1
            const title = i === 0 ? nowRole : n.r
            return (
              <div key={`${n.r}-${i}`} className="flex shrink-0 items-center">
                <span className="flex w-6 items-center justify-center text-[13px] text-[#48DB85]" aria-hidden>
                  ▸
                </span>
                <div
                  className={[
                    'min-w-[130px] flex-1 rounded-[10px] border px-3 py-2.5',
                    isGoal
                      ? 'border-[#48DB85] bg-[linear-gradient(135deg,rgba(72,219,133,.18),rgba(72,219,133,.08))] shadow-[0_0_0_2px_rgba(72,219,133,.12)]'
                      : 'border-[rgba(72,219,133,.15)] bg-[rgba(72,219,133,.05)]',
                  ].join(' ')}
                >
                  {n.tag ? (
                    <div className="mb-[6px]">
                      <span className="inline-flex rounded-[8px] border-2 border-[rgba(168,85,247,.65)] bg-[linear-gradient(135deg,rgba(117,4,255,.5),rgba(72,219,133,.22))] px-[10px] py-[4px] text-[10px] font-[900] uppercase tracking-[.1em] text-[#f3e8ff]">
                        + Degree
                      </span>
                    </div>
                  ) : null}
                  <div className="mb-[3px] text-[11.5px] font-[700] leading-[1.3] text-[#FAF9F4]">{title}</div>
                  <div
                    className={[
                      'text-[10px] font-[700]',
                      isGoal ? 'text-[#FFD700]' : 'text-[#48DB85]',
                    ].join(' ')}
                  >
                    {n.sal}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-[rgba(255,255,255,.05)] bg-[rgba(0,0,0,.2)] px-[22px] py-3.5 pb-[18px]">
          <p className="text-[11px] leading-[1.45] text-[rgba(255,255,255,.55)]">
            <strong className="font-[800] text-[#48DB85]">{accelYears} years</strong> on the accelerated path
            {yearsSaved > 0 ? (
              <>
                {' '}
                · <strong className="font-[800] text-[#48DB85]">{yearsSaved} yrs faster</strong> than traditional
              </>
            ) : null}{' '}
            · Path data verified
          </p>
        </div>
      </div>
    </div>
  )
}
