import { cn } from '../../utils/cn.js'

export function Label({ className, required, optional, children, ...props }) {
  return (
    <div
      className={cn(
        'mb-[6px] text-[10px] font-[700] uppercase tracking-[.09em] text-[#bbb]',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-[#b91c1c]" aria-hidden>
          {' '}
          *
        </span>
      ) : null}
      {optional ? (
        <span className="ml-1 text-[9px] font-[600] normal-case tracking-normal text-[#aaa]">(optional)</span>
      ) : null}
    </div>
  )
}

