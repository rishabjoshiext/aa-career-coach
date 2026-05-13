import { cn } from '../../utils/cn.js'

const styles = {
  base: 'inline-flex items-center justify-center gap-[7px] rounded-[10px] font-[600] transition-all duration-200 select-none',
  size: {
    md: 'px-[22px] py-[11px] text-[13px]',
    sm: 'px-[16px] py-[9px] text-[12px]',
  },
  variant: {
    primary:
      'bg-[#37017B] text-white hover:bg-[#2a005f] hover:-translate-y-[1px] disabled:pointer-events-none disabled:opacity-45 disabled:hover:translate-y-0',
    ghost:
      'bg-transparent text-[#37017B] border-[1.5px] border-[rgba(55,1,123,.14)] hover:bg-[rgba(55,1,123,.07)]',
  },
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(styles.base, styles.size[size], styles.variant[variant], className)}
      {...props}
    />
  )
}

