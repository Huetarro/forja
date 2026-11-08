import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Grupo de filas al estilo de los ajustes de iOS. */
export function Group({
  title,
  footer,
  children,
  className,
}: {
  title?: string
  footer?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      {title && <h3 className="mb-1.5 px-4 text-footnote font-medium text-ink-2">{title}</h3>}
      <div className="divide-y divide-sep overflow-hidden rounded-card bg-card">{children}</div>
      {footer && <p className="mt-1.5 px-4 text-footnote text-ink-2">{footer}</p>}
    </section>
  )
}

/** Fila con etiqueta a la izquierda y control a la derecha. */
export function Row({
  label,
  children,
  htmlFor,
}: {
  label: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-1.5">
      <label htmlFor={htmlFor} className="text-body">
        {label}
      </label>
      <div className="flex min-w-0 items-center justify-end">{children}</div>
    </div>
  )
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full bg-transparent px-4 text-body outline-none placeholder:text-ink-2',
        className,
      )}
      {...rest}
    />
  )
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={cn(
        'block w-full resize-none bg-transparent px-4 py-3 text-body outline-none placeholder:text-ink-2',
        className,
      )}
      {...rest}
    />
  )
}

/** Interruptor tipo iOS. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-accent' : 'bg-fill-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform duration-200',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

/** Chip seleccionable. */
export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'min-h-9 rounded-full px-3.5 text-subhead font-medium transition-colors duration-150',
        selected ? 'bg-accent text-on-accent' : 'bg-fill text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
