import { forwardRef, useState } from 'react'
import { parseDecimal } from '@/domain/units'
import { cn } from '@/lib/cn'

interface Props {
  value: number | null
  /** Valor anterior que se muestra en gris y se acepta si no se toca. */
  placeholder?: number | null
  onCommit: (v: number | null) => void
  decimal?: boolean
  label: string
  className?: string
  disabled?: boolean
  /** Resalta la casilla (falta el dato) */
  invalid?: boolean
}

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? '' : String(n).replace('.', ',')

/** Campo numérico: teclado decimal (kg) o numérico (reps). Guarda en cada cambio. */
export const NumberField = forwardRef<HTMLInputElement, Props>(function NumberField(
  { value, placeholder, onCommit, decimal, label, className, disabled, invalid },
  ref,
) {
  const [text, setText] = useState(fmt(value))
  const [lastValue, setLastValue] = useState(value)
  // Si el valor cambia desde fuera (p. ej. al marcar y aceptar el anterior), se sincroniza
  if (value !== lastValue) {
    setLastValue(value)
    if (parseDecimal(text) !== value) setText(fmt(value))
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      pattern={decimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
      enterKeyHint="next"
      autoComplete="off"
      aria-label={label}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      value={text}
      placeholder={fmt(placeholder ?? null)}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const raw = decimal
          ? e.target.value.replace(/[^0-9.,]/g, '')
          : e.target.value.replace(/\D/g, '')
        setText(raw)
        const n = parseDecimal(raw)
        const v = n === null ? null : decimal ? n : Math.round(n)
        setLastValue(v)
        onCommit(v)
      }}
      className={cn(
        'tnum h-10 w-full min-w-0 rounded-sm bg-fill text-center text-body font-semibold outline-none placeholder:font-normal placeholder:text-ink-3 focus:ring-2 focus:ring-accent',
        invalid && 'ring-2 ring-danger',
        className,
      )}
    />
  )
})
