import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-card', className)} {...rest} />
}

/** Título de sección al estilo de las listas agrupadas de iOS. */
export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-2 flex items-end justify-between px-1">
      <h2 className="text-title3 font-bold">{children}</h2>
      {action}
    </div>
  )
}
