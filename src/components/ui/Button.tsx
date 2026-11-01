import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'plain' | 'danger'
type Size = 'md' | 'lg' | 'sm'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  block?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent active:opacity-80',
  secondary: 'bg-fill text-ink active:bg-fill-strong',
  plain: 'bg-transparent text-accent-ink active:opacity-60',
  danger: 'bg-danger-soft text-danger active:opacity-70',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3.5 text-subhead rounded-full',
  md: 'min-h-touch px-5 text-body rounded-md',
  lg: 'min-h-13 px-6 text-body rounded-md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-[opacity,background-color] duration-150 disabled:opacity-40',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
