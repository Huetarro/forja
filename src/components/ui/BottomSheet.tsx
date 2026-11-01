import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Botón a la derecha de la cabecera (p. ej. "Guardar"). */
  action?: ReactNode
  /** Altura completa (para listas largas). */
  tall?: boolean
}

/** Hoja inferior al estilo iOS. Se cierra tocando fuera o arrastrando hacia abajo. */
export function BottomSheet({ open, onClose, title, children, action, tall }: Props) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const controls = useDragControls()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`absolute inset-x-0 bottom-0 mx-auto flex max-w-xl flex-col rounded-t-sheet bg-bg ${tall ? 'h-[92dvh]' : 'max-h-[92dvh]'}`}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragListener={false}
            dragControls={controls}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
          >
            <SheetHeader
              onGrab={(e) => {
                if (!(e.target as HTMLElement).closest('button, a, input')) controls.start(e)
              }}
              titleId={titleId}
              title={title}
              onClose={onClose}
              action={action}
            />
            <div className="pb-safe min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
              <div className="pb-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function SheetHeader({
  onGrab,
  titleId,
  title,
  onClose,
  action,
}: {
  onGrab: (e: React.PointerEvent) => void
  titleId: string
  title: string
  onClose: () => void
  action?: ReactNode
}) {
  return (
    <div className="shrink-0 touch-none px-2 pt-2" onPointerDown={onGrab}>
      <div className="mx-auto mb-1 h-[5px] w-9 rounded-full bg-fill-strong" aria-hidden />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          onClick={onClose}
          className="min-h-touch justify-self-start px-3 text-body text-accent-ink"
        >
          Cerrar
        </button>
        <h2 id={titleId} className="max-w-[55vw] truncate text-body font-semibold">
          {title}
        </h2>
        <div className="justify-self-end">{action}</div>
      </div>
    </div>
  )
}
