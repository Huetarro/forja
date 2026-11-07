import { useEffect, useState } from 'react'
import { Check, Pause, Play } from 'lucide-react'
import { DEFAULT_STRETCHES, STRETCH_SECONDS, toggleStretch } from '@/db/plan'
import type { Workout } from '@/db/schema'
import { useSettings } from '@/db/settings'
import { cn } from '@/lib/cn'
import { beep } from '@/lib/sound'
import { useNow } from '@/lib/useNow'
import { toast } from '@/stores/ui'

/**
 * Estiramientos al final de la rutina: check por cada uno y temporizador opcional de 45 s
 * (por marcas de tiempo). Al completarlos todos se marca "estiramientos" en el día.
 */
export function StretchList({ workout }: { workout: Workout }) {
  const settings = useSettings()
  const list = settings?.stretchList ?? DEFAULT_STRETCHES
  const done = new Set(workout.stretchesDone ?? [])
  const [timer, setTimer] = useState<{ name: string; endsAt: number } | null>(null)
  const now = useNow(250, timer !== null)
  const left = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0

  const toggle = async (name: string, force?: boolean) => {
    const complete = await toggleStretch(workout.id, name, list, force)
    if (complete) toast('Estiramientos completados')
  }

  // Al acabar el tiempo: aviso y se marca ese estiramiento
  useEffect(() => {
    if (!timer) return
    const id = setTimeout(
      () => {
        setTimer(null)
        beep()
        void toggle(timer.name, true)
      },
      Math.max(0, timer.endsAt - Date.now()),
    )
    return () => clearTimeout(id)
  }, [timer]) // eslint-disable-line react-hooks/exhaustive-deps

  if (list.length === 0) return null
  const count = list.filter((s) => done.has(s)).length

  return (
    <section className="mt-4 overflow-hidden rounded-card bg-card" aria-label="Estiramientos">
      <header className="flex items-baseline justify-between px-4 pt-3 pb-1">
        <h2 className="text-title3 font-bold">Estiramientos</h2>
        <span className="tnum text-footnote text-ink-2">
          {count}/{list.length} · {STRETCH_SECONDS} s cada uno
        </span>
      </header>
      <ul className="divide-y divide-sep/60">
        {list.map((name) => {
          const isDone = done.has(name)
          const running = timer?.name === name
          return (
            <li key={name} className="flex min-h-14 items-center gap-2 px-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                onClick={() => void toggle(name)}
                className="flex min-h-12 flex-1 items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full transition-colors',
                    isDone ? 'bg-success text-white' : 'border-2 border-fill-strong',
                  )}
                >
                  {isDone && <Check size={16} strokeWidth={3} />}
                </span>
                <span className={cn('text-body', isDone && 'text-ink-2')}>{name}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setTimer(running ? null : { name, endsAt: Date.now() + STRETCH_SECONDS * 1000 })
                }
                aria-label={
                  running
                    ? `Parar temporizador de ${name}`
                    : `Temporizador de ${STRETCH_SECONDS} s para ${name}`
                }
                className={cn(
                  'tnum flex h-10 min-w-16 items-center justify-center gap-1 rounded-full px-3 text-subhead font-semibold',
                  running ? 'bg-accent text-on-accent' : 'bg-fill text-ink-2',
                )}
              >
                {running ? (
                  <>
                    <Pause size={14} aria-hidden /> {left}
                  </>
                ) : (
                  <>
                    <Play size={14} aria-hidden /> {STRETCH_SECONDS}
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
