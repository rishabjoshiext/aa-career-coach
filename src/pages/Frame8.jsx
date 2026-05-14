import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { useAppState } from '../hooks/appState.jsx'

export function Frame8() {
  const nav = useNavigate()
  const { resetSession } = useAppState()

  const onStartNew = () => {
    resetSession()
    nav('/1', { replace: true })
  }

  return (
    <section data-scroll-top className="absolute inset-0 overflow-y-auto bg-[#FAF9F4] px-6 py-10 text-[#0C0C0C]">
      <div className="mx-auto flex min-h-full max-w-[560px] flex-col items-center justify-center text-center">
        <div
          className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-[rgba(55,1,123,.2)] bg-[rgba(55,1,123,.08)] text-[40px] shadow-[0_12px_40px_rgba(55,1,123,.12)]"
          aria-hidden
        >
          ✓
        </div>
        <h1 className="mb-3 text-[32px] leading-[1.15] [font-family:'DM Serif Display',serif] text-[#37017B]">
          Session wrapped up
        </h1>
        <p className="mb-2 max-w-[480px] text-[15px] leading-[1.55] text-[#555]">
          Thanks for walking through your path with FastTrack. Your counsellor can pick up from here with intake timing,
          programme fit, and financing.
        </p>
        <p className="mb-10 max-w-[440px] text-[13px] leading-[1.5] text-[#999]">
          When you are ready to explore another destination or refresh your profile, start clean — nothing from this run
          is kept on this device.
        </p>
        <Button
          type="button"
          variant="primary"
          className="min-w-[min(100%,320px)] rounded-[999px] px-10 py-[18px] text-[16px] font-[800] shadow-[0_8px_28px_rgba(55,1,123,.25)]"
          onClick={onStartNew}
        >
          Start a new session
        </Button>
      </div>
    </section>
  )
}
