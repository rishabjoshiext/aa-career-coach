import { cn } from '../../utils/cn.js'

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full appearance-none rounded-[9px] border-[1.5px] border-[rgba(0,0,0,.09)] bg-white bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat px-[13px] py-[10px] pr-[30px] text-[13px] text-[#0C0C0C] outline-none transition-colors duration-200 focus:border-[#37017B]',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23bbb'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}

