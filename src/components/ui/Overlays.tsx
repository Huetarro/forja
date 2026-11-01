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
        <div className="fixed inset-0 z-[60] grid place-items-center px-10">
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
            className="relative w-full max-w-[290px] overflow-hidden rounded-card bg-card-2 text-center"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-5 pt-5 pb-4">
              <h2 id="confirm-title" className="text-body font-semibold">
                {req.title}
              </h2>
              {req.text && <p className="mt-1 text-footnote text-ink-2">{req.text}</p>}
            </div>
            <div className="grid grid-cols-2 border-t border-sep">
              <button
                type="button"
                onClick={() => req.resolve(false)}
                className="min-h-touch border-r border-sep text-body text-accent-ink"
              >
                {req.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => req.resolve(true)}
                className={cn(
                  'min-h-touch text-body font-semibold',
                  req.destructive ? 'text-danger' : 'text-accent-ink',
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

            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex min-h-11 max-w-md items-center gap-2 rounded-full bg-[#2c2c2e] py-1 pr-1.5 pl-4 text-subhead font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
          >
            <span>{t.text}</span>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  void t.undo?.()
                  dismiss(t.id)
                }}
                className="min-h-9 rounded-full px-3 font-semibold text-[#ff8a4c]"
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
