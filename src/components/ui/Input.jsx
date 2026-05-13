import { cn } from '../../utils/cn.js'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[13px] py-[10px] text-[13px] text-[#0C0C0C] outline-none transition-colors duration-200 placeholder:text-[#ccc] focus:border-[#37017B]',
        className,
      )}
      {...props}
    />
  )
}

