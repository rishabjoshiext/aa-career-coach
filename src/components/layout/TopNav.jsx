import { useLocation, useNavigate } from 'react-router-dom'

const STEPS = [
  { path: '/1', short: '1', title: 'Profile' },
  { path: '/2', short: '2', title: 'Destination' },
  { path: '/3', short: '3', title: 'Path' },
  { path: '/4', short: '4', title: 'Gaps' },
  { path: '/5', short: '5', title: 'ROI' },
  { path: '/6', short: '6', title: 'Stories' },
  { path: '/7', short: '7', title: 'Focus' },
]

export function TopNav() {
  const { pathname } = useLocation()
  const nav = useNavigate()

  const activeIdx = STEPS.findIndex((s) => s.path === pathname)
  const activeMeta = activeIdx >= 0 ? STEPS[activeIdx] : null
  const doneStep = pathname === '/8'

  return (
    <nav className="fixed inset-x-0 top-0 z-[600] flex h-[52px] items-center justify-between border-b border-[rgba(0,0,0,.07)] bg-[rgba(250,249,244,.96)] px-7 backdrop-blur-[12px]">
      <button
        type="button"
        className="flex items-center gap-[9px] rounded-[8px] text-left outline-none ring-[#37017B] transition hover:bg-[rgba(55,1,123,.06)] focus-visible:ring-2"
        onClick={() => nav('/1')}
        aria-label="FastTrack Career — go to start"
      >
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-[#37017B] text-[13px] font-[900] text-white">
          F
        </div>
        <div>
          <div className="[font-family:'DM Serif Display',serif] text-[14px] text-[#37017B]">
            FastTrack Career
          </div>
          <div className="text-[10px] text-[#bbb]">Career Path Intelligence</div>
        </div>
      </button>

      <div className="flex max-w-[min(520px,58vw)] flex-1 items-center justify-center gap-[3px] overflow-x-auto px-2">
        {STEPS.map((step, i) => {
          const on = pathname === step.path
          return (
            <button
              key={step.path}
              type="button"
              title={step.title}
              onClick={() => nav(step.path)}
              className={[
                'h-[7px] min-w-[20px] flex-1 rounded-[3px] transition-all duration-200',
                on ? 'bg-[#37017B]' : 'bg-[rgba(55,1,123,.12)] hover:bg-[rgba(55,1,123,.22)]',
              ].join(' ')}
              aria-current={on ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${step.title}`}
            />
          )
        })}
      </div>

      <div className="min-w-[120px] text-right">
        <div className="rounded-[20px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] px-3 py-1 text-[11px] font-[600] text-[#37017B]">
          {doneStep ? '✓ · Complete' : activeMeta ? `${activeMeta.short} · ${activeMeta.title}` : '—'}
        </div>
      </div>
    </nav>
  )
}
