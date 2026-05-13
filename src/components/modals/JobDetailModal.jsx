import { logoKey } from '../../utils/jobsData.js'

export function JobDetailModal({ open, job, onClose }) {
  if (!open || !job) return null
  const logoTxt = job.co
    .split(' ')
    .map((w) => w[0])
    .slice(0, 3)
    .join('')
    .toUpperCase()
  const lk = logoKey(job.co)

  return (
    <div
      className="fixed inset-0 z-[1000] hidden items-center justify-center bg-[rgba(12,12,12,.55)] p-6 backdrop-blur-[8px] motion-safe:animate-[modalFadeIn_.2s_ease]"
      style={{ display: open ? 'flex' : 'none' }}
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose()
      }}
    >
      <div className="relative max-h-[88vh] w-full max-w-[540px] overflow-y-auto rounded-[18px] border border-[rgba(255,255,255,.05)] bg-[#FAF9F4] shadow-[0_24px_80px_rgba(0,0,0,.4)] motion-safe:animate-[modalSlideIn_.3s_cubic-bezier(.4,0,.2,1)]">
        <button
          className="absolute right-[14px] top-[14px] z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] border-0 bg-[rgba(0,0,0,.05)] text-[16px] text-[#666] transition-all duration-200 hover:bg-[rgba(0,0,0,.1)] hover:text-[#0C0C0C] hover:rotate-90"
          onClick={onClose}
        >
          ×
        </button>

        <div className="rounded-t-[18px] border-b border-[rgba(0,0,0,.07)] bg-[linear-gradient(135deg,#fff,#FBFAFE)] px-6 pb-[18px] pt-6">
          <div className="mb-3 flex items-center gap-[10px]">
            <div
              className={[
                'flex h-[42px] w-[42px] items-center justify-center rounded-[9px] text-[13px] font-[900] text-white tracking-[.04em]',
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
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-[800] text-[#0C0C0C]">{job.co}</div>
              <div className="mt-[2px] text-[10px] text-[#888]">{job.mode} · Posted {job.posted}</div>
            </div>
          </div>

          <div className="mb-2 text-[22px] [font-family:'DM Serif Display',serif] text-[#0C0C0C]">
            {job.title}
          </div>

          <div className="flex flex-wrap gap-[6px]">
            <span className="rounded-[20px] bg-[rgba(72,219,133,.08)] px-[10px] py-1 text-[10px] font-[700] text-[#22c55e]">
              💰 {job.sal}
            </span>
            <span className="rounded-[20px] bg-[rgba(55,1,123,.07)] px-[10px] py-1 text-[10px] font-[700] text-[#37017B]">
              📍 {job.loc}
            </span>
            <span className="rounded-[20px] bg-[rgba(255,107,0,.08)] px-[10px] py-1 text-[10px] font-[700] text-[#ea580c]">
              {job.mode}
            </span>
            <span className="rounded-[20px] bg-[rgba(202,138,4,.08)] px-[10px] py-1 text-[10px] font-[700] text-[#b45309]">
              {job.exp}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-[18px]">
          <div className="mb-4">
            <div className="mb-[7px] text-[9px] font-[800] uppercase tracking-[.1em] text-[#aaa]">About the role</div>
            <div className="text-[12.5px] leading-[1.55] text-[#444]">{job.about}</div>
          </div>

          <div className="mb-4">
            <div className="mb-[7px] text-[9px] font-[800] uppercase tracking-[.1em] text-[#aaa]">Key skills required</div>
            <div className="flex flex-wrap gap-[5px]">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-[5px] border border-[rgba(55,1,123,.14)] bg-white px-[9px] py-1 text-[10.5px] font-[600] text-[#37017B]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-[7px] text-[9px] font-[800] uppercase tracking-[.1em] text-[#aaa]">What you&apos;ll do</div>
            <div className="text-[12.5px] leading-[1.55] text-[#444]">{job.what}</div>
          </div>

          <div className="mt-[18px] flex gap-[9px] border-t border-[rgba(0,0,0,.07)] pt-[14px]">
            <button
              className="flex-1 cursor-pointer rounded-[8px] bg-[#FF6B00] px-4 py-[10px] text-[12px] font-[700] text-white transition-all duration-200 hover:bg-[#e55a00]"
              onClick={() => alert('In production: opens job on Apna')}
            >
              Apply on Apna
            </button>
            <button
              className="cursor-pointer rounded-[8px] border-[1.5px] border-[rgba(0,0,0,.07)] bg-transparent px-4 py-[10px] text-[12px] font-[600] text-[#666]"
              onClick={() => alert('Saved')}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

