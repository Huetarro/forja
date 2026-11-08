import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Timer, X } from 'lucide-react'
import { formatClock } from '@/domain/timer'
import { beep } from '@/lib/sound'
import { useNow } from '@/lib/useNow'
import { cn } from '@/lib/cn'
import { useRestTimer } from '@/stores/restTimer'

/** Temporizador de descanso flotante: cuenta atrás, ±15 s y aviso visual y sonoro al acabar. */
export function RestTimerBar() {
  const { endsAt, total, add, stop } = useRestTimer()
  const now = useNow(250, endsAt !== null)
  const left = endsAt ? Math.ceil((endsAt - now) / 1000) : 0
  const finished = endsAt !== null && left <= 0
  const beeped = useRef<number | null>(null)

  useEffect(() => {
    if (finished && endsAt && beeped.current !== endsAt) {
      beeped.current = endsAt
      beep()
      const t = setTimeout(stop, 6000)
      return () => clearTimeout(t)
    }
  }, [finished, endsAt, stop])

  const pct = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0

  return (
    <AnimatePresence>
      {endsAt !== null && (
        <motion.div
          role="timer"
          aria-live="polite"
          aria-label={finished ? 'Descanso terminado' : `Descanso: quedan ${left} segundos`}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-0 z-30 flex justify-center px-4"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <div
            className={cn(
              'relative flex w-full max-w-md items-center gap-2 overflow-hidden rounded-full py-1.5 pr-1.5 pl-4 shadow-[var(--sombra-pop)]',
              finished
                ? 'bg-accent text-on-accent'
                : 'bg-[var(--hud)] text-ink backdrop-blur-[20px] backdrop-saturate-[1.8]',
            )}
          >
            {!finished && (
              <span
                className="absolute inset-y-0 left-0 bg-fill transition-[width] duration-300"
                style={{ width: `${pct * 100}%` }}
                aria-hidden
              />
            )}
            <Timer size={18} className="relative" aria-hidden />
            <span className="tnum relative flex-1 text-body font-bold">
              {finished ? 'Descanso terminado' : formatClock(left, true)}
            </span>
            {!finished && (
              <>
                <RestBtn onClick={() => add(-15)} label="Restar 15 segundos">
                  −15
                </RestBtn>
                <RestBtn onClick={() => add(15)} label="Sumar 15 segundos">
                  +15
                </RestBtn>
              </>
            )}
            <RestBtn onClick={stop} label="Cerrar temporizador">
              <X size={18} />
            </RestBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RestBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="tnum relative grid h-10 min-w-11 place-items-center rounded-full bg-white/15 px-2 text-subhead font-semibold"
    >
      {children}
    </button>
  )
}
