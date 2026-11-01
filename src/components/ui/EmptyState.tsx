import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  text: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, text, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-card bg-card px-6 py-10 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-accent-soft text-accent-ink">
        <Icon size={26} strokeWidth={2} aria-hidden />
      </div>
      <h3 className="text-title3 font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-[30ch] text-subhead text-ink-2">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
