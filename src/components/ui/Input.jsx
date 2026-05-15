import { cn } from '../../utils/cn.js'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white px-[13px] py-[10px] text-[13px] text-[#0C0C0C] outline-none transition-colors duration-200 placeholder:text-[#ccc] focus:border-[#37017B]',
        /* Match non-email fields: neutralize Chrome autofill yellow/blue tint */
        '[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_rgb(255,255,255)_inset] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_rgb(255,255,255)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0C0C0C] [&:-webkit-autofill]:[caret-color:#0C0C0C]',
        className,
      )}
      {...props}
    />
  )
}

