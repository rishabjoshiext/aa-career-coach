import { useCallback, useEffect, useRef, useState } from 'react'

function CarouselArrow({ direction, disabled, onClick }) {
  const label = direction === 'prev' ? 'Scroll left' : 'Scroll right'
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,0,0,.06)] bg-white shadow-[0_2px_8px_rgba(0,0,0,.08)] transition-all duration-200',
        disabled
          ? 'cursor-not-allowed text-[rgba(55,1,123,.25)]'
          : 'cursor-pointer text-[#37017B] hover:border-[rgba(55,1,123,.2)] hover:shadow-[0_4px_12px_rgba(55,1,123,.12)]',
      ].join(' ')}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        {direction === 'prev' ? (
          <path
            d="M9 2L4 7L9 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M5 2L10 7L5 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}

/**
 * Single-row horizontal carousel with top-right prev/next controls.
 * @param {{ children: import('react').ReactNode, resetKey?: string | number, className?: string }} props
 */
export function DestinationCardsCarousel({ children, resetKey, className = '' }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = 0
    updateArrows()
  }, [resetKey, updateArrows])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows, children])

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('[data-carousel-card]')
    const gap = 13
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-end gap-2">
        <CarouselArrow direction="prev" disabled={!canPrev} onClick={() => scroll(-1)} />
        <CarouselArrow direction="next" disabled={!canNext} onClick={() => scroll(1)} />
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-[13px] overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  )
}
