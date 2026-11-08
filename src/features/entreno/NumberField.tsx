import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
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
  /** Valor máximo admitido; lo que lo supere se guarda como este máximo. */
  max?: number
}

/** Retardo del guardado mientras se teclea. */
const SAVE_DELAY_MS = 300

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? '' : String(n).replace('.', ',')

/**
 * Campo numérico: teclado decimal (kg) o numérico (reps). El texto vive aquí mientras se
 * escribe; se guarda con un pequeño retardo y, al momento, al salir, con Intro o si la app
 * pasa a segundo plano. Admite coma y punto.
 */
export const NumberField = forwardRef<HTMLInputElement, Props>(function NumberField(
  { value, placeholder, onCommit, decimal, label, className, disabled, invalid, max },
  ref,
) {
  const [text, setText] = useState(fmt(value))
  const [seenValue, setSeenValue] = useState(value)
  const [focused, setFocused] = useState(false)
  // Si el valor cambia desde fuera (p. ej. al aceptar el anterior), se sincroniza; nunca al escribir
  if (value !== seenValue) {
    setSeenValue(value)
    if (!focused && parseDecimal(text) !== value) setText(fmt(value))
  }

  const commitRef = useRef(onCommit)
  useEffect(() => {
    commitRef.current = onCommit
  }, [onCommit])

  const pending = useRef<{ v: number | null } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flush = useCallback(() => {
    clearTimeout(timer.current)
    if (!pending.current) return
    const { v } = pending.current
    pending.current = null
    commitRef.current(v)
  }, [])

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

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
      onFocus={(e) => {
        setFocused(true)
        e.target.select()
      }}
      onBlur={() => {
        setFocused(false)
        flush()
        const n = parseDecimal(text)
        if (max !== undefined && n !== null && n > max) setText(fmt(max))
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') flush()
      }}
      onChange={(e) => {
        const raw = decimal
          ? e.target.value.replace(/[^0-9.,]/g, '')
          : e.target.value.replace(/\D/g, '')
        setText(raw)
        const n = parseDecimal(raw)
        const rounded = n === null ? null : decimal ? n : Math.round(n)
        pending.current = {
          v: rounded !== null && max !== undefined ? Math.min(rounded, max) : rounded,
        }
        clearTimeout(timer.current)
        timer.current = setTimeout(flush, SAVE_DELAY_MS)
      }}
      className={cn(
        'tnum h-10 w-full min-w-0 rounded-sm bg-fill text-center text-body font-semibold outline-none placeholder:font-normal placeholder:text-ink-3 focus:ring-2 focus:ring-accent',
        invalid && 'ring-2 ring-danger',
        className,
      )}
    />
  )
})
