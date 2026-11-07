import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Plus, Trash2, Trophy, X } from 'lucide-react'
import type { Drop, WorkoutSet } from '@/db/schema'
import { setDrops, setSetType, updateSet } from '@/db/workouts'
import { SET_TYPE_CHIP, SET_TYPE_LABEL, SET_TYPE_SHORT, nextSetType } from '@/domain/setTypes'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'
import { NumberField } from './NumberField'

export interface PrevSet {
  weight: number | null
  reps: number | null
}

interface Props {
  set: WorkoutSet
  /** número que se muestra en el chip para las series normales */
  number: number
  prev?: PrevSet
  isRecord: boolean
  bodyweight: boolean
  onCompleted: (set: WorkoutSet) => void
  onDelete: (set: WorkoutSet) => void
}

const RIR_OPTIONS = [0, 1, 2, 3, 4, 5] as const

/** Una fila de serie: tipo · anterior · kg · reps · RIR · check. Desliza a la izquierda para borrar. */
export function SetRow({ set, number, prev, isRecord, bodyweight, onCompleted, onDelete }: Props) {
  const reduce = useReducedMotion()
  const [rirOpen, setRirOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const weightRef = useRef<HTMLInputElement>(null)
  const repsRef = useRef<HTMLInputElement>(null)
  // Último valor tecleado (la base de datos puede tardar unos ms en devolverlo)
  const typed = useRef<{ weight?: number | null; reps?: number | null }>({})
  const done = set.completed

  const toggleDone = async () => {
    if (done) {
      await updateSet(set.id, { completed: false })
      return
    }
    const w = typed.current.weight !== undefined ? typed.current.weight : set.weight
    const r = typed.current.reps !== undefined ? typed.current.reps : set.reps
    const weight = w ?? prev?.weight ?? (bodyweight ? 0 : null)
    const reps = r ?? prev?.reps ?? null
    if (weight === null) return weightRef.current?.focus()
    if (reps === null) return repsRef.current?.focus()
    const next = { ...set, weight, reps, completed: true }
    await updateSet(set.id, { weight, reps, completed: true })
    onCompleted(next)
  }

  const sideLabel = set.side === 'izq' ? 'Izq' : set.side === 'der' ? 'Der' : null
  const prevText =
    prev && prev.weight !== null && prev.reps !== null
      ? `${formatNumber(prev.weight, 2)} × ${prev.reps}`
      : '—'

  return (
    <div className="relative overflow-hidden">
      {/* Fondo rojo al deslizar */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-end bg-danger pr-5 text-white',
          !dragging && 'invisible',
        )}
        aria-hidden
      >
        <Trash2 size={20} />
      </div>
      <motion.div
        drag={reduce ? false : 'x'}
        dragDirectionLock
        dragConstraints={{ left: -110, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        dragSnapToOrigin
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          setDragging(false)
          if (info.offset.x < -80) onDelete(set)
        }}
        className={cn('relative touch-pan-y bg-card')}
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 bg-success-soft transition-opacity duration-200',
            done ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="relative grid grid-cols-[38px_minmax(0,1fr)_68px_54px_40px_44px] items-center gap-1.5 px-3 py-1.5">
          <button
            type="button"
            onClick={() => void setSetType(set, nextSetType(set.type))}
            aria-label={`Tipo: ${SET_TYPE_LABEL[set.type]}. Toca para cambiar`}
            className={cn(
              'tnum grid size-9 place-items-center rounded-full font-bold',
              set.type === 'restpause' ? 'text-footnote' : 'text-subhead',
              SET_TYPE_CHIP[set.type],
            )}
          >
            {set.type === 'normal' ? number : SET_TYPE_SHORT[set.type]}
          </button>

          <div className="min-w-0 leading-tight">
            {sideLabel && <div className="text-caption font-semibold text-ink-2">{sideLabel}</div>}
            <div className="tnum flex items-center gap-1 truncate text-footnote text-ink-2">
              {prevText}
              {isRecord && (
                <Trophy size={13} className="shrink-0 text-accent-ink" aria-label="Récord" />
              )}
            </div>
          </div>

          <NumberField
            ref={weightRef}
            decimal
            label={`Peso serie ${number}${sideLabel ? ` ${sideLabel}` : ''}`}
            value={set.weight}
            placeholder={prev?.weight ?? null}
            onCommit={(weight) => {
              typed.current.weight = weight
              void updateSet(set.id, { weight })
            }}
          />
          <NumberField
            ref={repsRef}
            label={`Reps serie ${number}${sideLabel ? ` ${sideLabel}` : ''}`}
            value={set.reps}
            placeholder={prev?.reps ?? null}
            onCommit={(reps) => {
              typed.current.reps = reps
              void updateSet(set.id, { reps })
            }}
          />

          <button
            type="button"
            onClick={() => setRirOpen((o) => !o)}
            aria-label={`RIR${set.rir !== undefined ? ` ${set.rir}` : ''}. Toca para elegir`}
            aria-expanded={rirOpen}
            className={cn(
              'tnum h-10 rounded-sm text-subhead font-semibold',
              set.rir !== undefined ? 'bg-fill text-ink' : 'text-ink-3',
            )}
          >
            {set.rir === undefined ? 'RIR' : set.rir >= 5 ? '5+' : set.rir}
          </button>

          <motion.button
            type="button"
            onClick={() => void toggleDone()}
            whileTap={reduce ? undefined : { scale: 0.85 }}
            aria-label={done ? 'Serie hecha. Toca para desmarcar' : 'Marcar serie como hecha'}
            aria-pressed={done}
            className={cn(
              'grid size-11 place-items-center rounded-full transition-colors duration-200',
              done ? 'bg-success text-white' : 'bg-fill text-ink-3',
            )}
          >
            <motion.span
              key={String(done)}
              initial={reduce || !done ? false : { scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <Check size={22} strokeWidth={3} />
            </motion.span>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {rirOpen && (
            <Expand key="rir">
              <div
                className="flex items-center gap-1.5 px-3 pb-2"
                role="radiogroup"
                aria-label="RIR"
              >
                <span className="mr-1 text-footnote text-ink-2">RIR</span>
                {RIR_OPTIONS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    role="radio"
                    aria-checked={set.rir === r}
                    onClick={() => {
                      void updateSet(set.id, { rir: r })
                      setRirOpen(false)
                    }}
                    className={cn(
                      'tnum h-9 min-w-9 flex-1 rounded-full text-subhead font-semibold',
                      set.rir === r ? 'bg-accent text-on-accent' : 'bg-fill',
                    )}
                  >
                    {r === 5 ? '5+' : r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    void updateSet(set.id, { rir: undefined })
                    setRirOpen(false)
                  }}
                  aria-label="Quitar RIR"
                  className="grid size-9 place-items-center rounded-full text-ink-3"
                >
                  <X size={16} />
                </button>
              </div>
            </Expand>
          )}
          {set.type === 'dropset' && (
            <Expand key="drops">
              <DropsEditor set={set} />
            </Expand>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Expand({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

/** Bajadas de un dropset: peso y reps de cada una, sin límite. */
function DropsEditor({ set }: { set: WorkoutSet }) {
  const drops = set.drops
  const save = (next: Drop[]) => void setDrops(set.id, next)
  return (
    <div className="ml-[50px] space-y-1.5 border-l-2 border-accent/50 pr-3 pb-2.5 pl-3">
      {drops.map((d, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_68px_54px_36px] items-center gap-1.5">
          <span className="text-footnote text-ink-2">Bajada {i + 1}</span>
          <NumberField
            decimal
            label={`Peso bajada ${i + 1}`}
            value={d.weight}
            onCommit={(weight) => save(drops.map((x, k) => (k === i ? { ...x, weight } : x)))}
          />
          <NumberField
            label={`Reps bajada ${i + 1}`}
            value={d.reps}
            onCommit={(reps) => save(drops.map((x, k) => (k === i ? { ...x, reps } : x)))}
          />
          <button
            type="button"
            onClick={() => save(drops.filter((_, k) => k !== i))}
            aria-label={`Eliminar bajada ${i + 1}`}
            className="grid size-9 place-items-center text-ink-3 active:text-danger"
          >
            <X size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => save([...drops, { weight: null, reps: null }])}
        className="flex min-h-9 items-center gap-1 text-subhead font-semibold text-accent-ink"
      >
        <Plus size={16} /> bajada
      </button>
    </div>
  )
}
