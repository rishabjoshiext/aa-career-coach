export function AlignmentPanel({
  selected,
  alignChecks,
  onConfirm,
  onClose,
  confirmDisabled = false,
  confirmHint = '',
}) {
  if (!selected) return null
  return (
    <div className="mt-3 rounded-[14px] border border-[rgba(55,1,123,.14)] bg-[rgba(55,1,123,.07)] p-5 motion-safe:animate-[sup_.3s_ease]">
      <div className="mb-[3px] text-[14px] font-[700] text-[#0C0C0C]">
        You&apos;ve selected: {selected.role}
      </div>
      <div className="mb-[14px] text-[12px] text-[#555]">
        Confirm you&apos;re aligned with what this path gives you.
      </div>

      <div className="mb-[14px] grid grid-cols-1 gap-[7px] lg:grid-cols-2">
        {alignChecks.map((a) => (
          <div key={a} className="flex items-start gap-2 rounded-[9px] border border-[rgba(0,0,0,.07)] bg-white px-[11px] py-[9px]">
            <div className="mt-[1px] flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#37017B] bg-[rgba(55,1,123,.07)] text-[8px] font-[800] text-[#37017B]">
              ✓
            </div>
            <div className="text-[11px] font-[600] leading-[1.4] text-[#0C0C0C]">{a}</div>
          </div>
        ))}
      </div>

      <div className="mb-[10px] text-[13px] font-[700] text-[#0C0C0C]">
        Are you aligned with this career destination?
      </div>

      {confirmDisabled && confirmHint ? (
        <div className="mb-[10px] rounded-[8px] border border-[rgba(180,83,9,.25)] bg-[rgba(251,191,36,.08)] px-3 py-[8px] text-[11px] font-[600] leading-[1.4] text-[#92400e]">
          {confirmHint}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={confirmDisabled}
          className={[
            'rounded-[8px] bg-[#37017B] px-5 py-[9px] text-[12px] font-[700] text-white',
            confirmDisabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
          ].join(' ')}
          onClick={() => !confirmDisabled && onConfirm()}
        >
          Yes, show me the journey →
        </button>
        <button
          className="cursor-pointer rounded-[8px] bg-[rgba(0,0,0,.05)] px-4 py-[9px] text-[12px] font-[600] text-[#888]"
          onClick={onClose}
        >
          Choose differently
        </button>
      </div>
    </div>
  )
}

