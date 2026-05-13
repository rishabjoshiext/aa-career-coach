import { cn } from '../../utils/cn.js'

export function ToggleGroup({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)]',
        className,
      )}
      {...props}
    />
  )
}

export function ToggleButton({ className, active, children, ...props }) {
  return (
    <button
      className={cn(
        'flex-1 cursor-pointer border-0 bg-white px-[4px] py-[9px] text-[11px] font-[600] text-[#aaa] transition-all duration-200',
        active && 'bg-[#37017B] text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Compact % / CGPA control: equal-width columns, typography aligned with “Score format” label */
export function ScoreFormatToggleGroup({ className, ...props }) {
  return (
    <div
      className={cn(
        'inline-grid shrink-0 grid-cols-2 overflow-hidden rounded-[6px] border border-[rgba(0,0,0,.09)]',
        'w-[7.35rem] sm:w-[7.5rem]',
        className,
      )}
      role="group"
      {...props}
    />
  )
}

export function ScoreFormatToggleButton({ className, active, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex min-h-0 min-w-0 cursor-pointer items-center justify-center border-0 bg-white px-[3px] py-[1px] text-[10px] font-[700] uppercase leading-none tracking-[.07em] text-[#aaa] transition-colors duration-150',
        active && 'bg-[#37017B] text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

