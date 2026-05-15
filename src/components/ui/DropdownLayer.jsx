import { createPortal } from 'react-dom'
import { useCallback, useLayoutEffect, useState } from 'react'
import { cn } from '../../utils/cn.js'

/**
 * Renders dropdown content in a fixed layer so it is not clipped by overflow-hidden
 * ancestors (education / work drawers, scroll areas).
 */
export function DropdownLayer({ open, anchorRef, children, className }) {
  const [box, setBox] = useState(null)

  const update = useCallback(() => {
    if (!open || !anchorRef?.current) {
      setBox(null)
      return
    }
    const r = anchorRef.current.getBoundingClientRect()
    setBox({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    })
  }, [open, anchorRef])

  useLayoutEffect(() => {
    update()
    if (!open) return
    const el = anchorRef.current
    const ro = el ? new ResizeObserver(update) : null
    if (el) ro.observe(el)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      if (ro && el) ro.unobserve(el)
      if (ro) ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, update, anchorRef])

  if (!open || !box) return null

  return createPortal(
    <div
      data-autocomplete-layer
      style={{
        position: 'fixed',
        top: box.top,
        left: box.left,
        width: box.width,
        zIndex: 10000,
      }}
      className={cn(
        'max-h-[min(280px,calc(100vh-24px))] overflow-y-auto rounded-[9px] border border-[rgba(55,1,123,.14)] bg-white p-[5px] shadow-[0_10px_40px_rgba(55,1,123,.18)]',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  )
}
