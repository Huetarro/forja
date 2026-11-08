import type { SelectHTMLAttributes } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Selector nativo (en iOS abre la rueda del sistema). */
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative inline-flex items-center">
      <select
        className={cn(
          'min-h-touch max-w-[52vw] appearance-none truncate bg-transparent pr-6 pl-2 text-right text-body text-ink-2 outline-none',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronsUpDown
        size={16}
        className="pointer-events-none absolute right-0 text-ink-2"
        aria-hidden
      />
    </span>
  )
}
