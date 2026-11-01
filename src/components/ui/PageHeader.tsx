import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
}

/** Cabecera grande al estilo iOS (Large Title). */
export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="flex items-end justify-between gap-3 pt-4 pb-5">
      <div className="min-w-0">
        {subtitle && <p className="text-footnote font-semibold text-ink-2">{subtitle}</p>}
        <h1 className="truncate font-display text-large font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </header>
  )
}
