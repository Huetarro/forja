import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useUI } from '@/stores/ui'
import { cn } from '@/lib/cn'

/** Diálogo de confirmación y avisos temporales, montados una vez en la app. */
export function Overlays() {
  return createPortal(
    <>
      <ConfirmDialog />
      <Toasts />
    </>,
    document.body,
  )
}

function ConfirmDialog() {
  const req = useUI((s) => s.confirmReq)
  return (
    <AnimatePresence>
      {req && (
        <div className="fixed inset-0 z-[60] grid place-items-center px-6">
          <motion.div
            className="absolute inset-0 bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => req.resolve(false)}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full max-w-[360px] rounded-card bg-raised shadow-[var(--sombra-pop)]"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 pt-6 pb-4">
              <h2 id="confirm-title" className="text-title3 font-semibold">
                {req.title}
              </h2>
              {req.text && <p className="mt-1 text-footnote text-ink-2">{req.text}</p>}
            </div>
            <div className="flex flex-wrap justify-end gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => req.resolve(false)}
                className="min-h-touch rounded-full bg-fill px-4 text-subhead text-ink"
              >
                {req.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => req.resolve(true)}
                className={cn(
                  'min-h-touch rounded-full px-4 text-subhead',
                  req.destructive ? 'bg-danger text-white' : 'bg-accent text-on-accent',
                )}
              >
                {req.confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Toasts() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismissToast)
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[55] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 92px)' }}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}

            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
            exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.18 } }}
            className="pointer-events-auto flex min-h-11 max-w-md items-center gap-2 rounded-full bg-[var(--hud)] py-1 pr-1.5 pl-4 text-subhead text-ink shadow-[var(--sombra-pop)] backdrop-blur-[20px] backdrop-saturate-[1.8]"
          >
            <span>{t.text}</span>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  void t.undo?.()
                  dismiss(t.id)
                }}
                className="min-h-9 rounded-full px-3 font-semibold text-accent-ink"
              >
                Deshacer
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
