import { cn } from '@/lib/cn'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  label: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, label }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-fill p-0.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            type="button"
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-9 flex-1 rounded-full px-2 text-footnote transition-colors duration-150',
              active ? 'bg-segment text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-ink-2',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
