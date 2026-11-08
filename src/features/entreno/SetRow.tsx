import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Plus, Trash2, Trophy, X } from 'lucide-react'
import type { Drop, ExerciseMetric, WorkoutSet } from '@/db/schema'
import { setDrops, setSetType, updateDrop, updateSet } from '@/db/workouts'
import { SET_TYPE_CHIP, SET_TYPE_LABEL, SET_TYPE_SHORT, nextSetType } from '@/domain/setTypes'
import { RP_REST_NOTE } from '@/domain/techniques'
import { formatSetValue } from '@/lib/exerciseMeta'
import { cn } from '@/lib/cn'
import { toast } from '@/stores/ui'
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
  /** kg opcional (sin kg se guarda 0) */
  noLoad: boolean
  metric: ExerciseMetric
  onCompleted: (set: WorkoutSet) => void
  onDelete: (set: WorkoutSet) => void
}

/** Una fila de serie: tipo · anterior · kg · reps · check. Desliza a la izquierda para borrar. */
export function SetRow({
  set,
  number,
  prev,
  isRecord,
  noLoad,
  metric,
  onCompleted,
  onDelete,
}: Props) {
  const reduce = useReducedMotion()
  const [dragging, setDragging] = useState(false)
  // Casilla que falta al intentar marcar (se resalta; el teclado no se abre solo)
  const [missing, setMissing] = useState<'weight' | 'reps' | null>(null)
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
    const weight = w ?? (noLoad ? 0 : (prev?.weight ?? null))
    const reps = r ?? prev?.reps ?? null
    if (weight === null || reps === null) {
      setMissing(weight === null ? 'weight' : 'reps')
      toast(
        weight === null
          ? 'Apunta el peso de la serie'
          : metric === 'segundos'
            ? 'Apunta los segundos de la serie'
            : 'Apunta las reps de la serie',
      )
      return
    }
    setMissing(null)
    // Rest-pause: las mini-series sin peso usan el de la serie
    const drops =
      set.type === 'restpause'
        ? set.drops.map((d) => ({ ...d, weight: d.weight ?? weight }))
        : set.drops
    const next = { ...set, weight, reps, drops, completed: true }
    await updateSet(set.id, { weight, reps, drops, completed: true })
    onCompleted(next)
  }

  const sideLabel = set.side === 'izq' ? 'Izq' : set.side === 'der' ? 'Der' : null
  const prevText =
    prev && prev.weight !== null && prev.reps !== null
      ? formatSetValue(prev.weight, prev.reps, metric)
      : '—'
  const repsName = metric === 'segundos' ? 'Segundos' : 'Reps'

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
        <div className="relative grid grid-cols-[38px_minmax(0,1fr)_68px_54px_44px] items-center gap-1.5 px-3 py-1.5">
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
            decimal
            label={`Peso serie ${number}${sideLabel ? ` ${sideLabel}` : ''}${noLoad ? ' (opcional)' : ''}`}
            value={noLoad && set.weight === 0 ? null : set.weight}
            placeholder={noLoad ? null : (prev?.weight ?? null)}
            invalid={missing === 'weight'}
            onCommit={(weight) => {
              typed.current.weight = weight
              setMissing(null)
              void updateSet(set.id, { weight })
            }}
          />
          <NumberField
            label={`${repsName} serie ${number}${sideLabel ? ` ${sideLabel}` : ''}`}
            value={set.reps}
            placeholder={prev?.reps ?? null}
            invalid={missing === 'reps'}
            onCommit={(reps) => {
              typed.current.reps = reps
              setMissing(null)
              void updateSet(set.id, { reps })
            }}
          />

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
          {(set.type === 'dropset' || set.type === 'restpause') && (
            <Expand key="drops">
              <DropsEditor set={set} metric={metric} />
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

/**
 * Bajadas de un dropset o mini-series de un rest-pause: peso y reps de cada una, sin límite.
 * Cuentan como 1 serie: no suman volumen ni récords.
 */
function DropsEditor({ set, metric }: { set: WorkoutSet; metric: ExerciseMetric }) {
  const drops = set.drops
  const rp = set.type === 'restpause'
  const name = rp ? 'Mini-serie' : 'Bajada'
  const repsName = metric === 'segundos' ? 'Segundos' : 'Reps'
  const save = (next: Drop[]) => void setDrops(set.id, next)
  return (
    <div
      className={cn(
        'ml-[50px] space-y-1.5 border-l-2 pr-3 pb-2.5 pl-3',
        rp ? 'border-rp/50' : 'border-accent/50',
      )}
    >
      {rp && <p className="text-footnote text-ink-2">Entre mini-series: {RP_REST_NOTE}</p>}
      {drops.map((d, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_68px_54px_36px] items-center gap-1.5">
          <span className="text-footnote text-ink-2">
            {name} {i + 1}
          </span>
          <NumberField
            decimal
            label={`Peso ${name.toLowerCase()} ${i + 1}`}
            value={d.weight}
            placeholder={rp ? set.weight : null}
            onCommit={(weight) => void updateDrop(set.id, i, { weight })}
          />
          <NumberField
            label={`${repsName} ${name.toLowerCase()} ${i + 1}`}
            value={d.reps}
            onCommit={(reps) => void updateDrop(set.id, i, { reps })}
          />
          <button
            type="button"
            onClick={() => save(drops.filter((_, k) => k !== i))}
            aria-label={`Eliminar ${name.toLowerCase()} ${i + 1}`}
            className="grid size-9 place-items-center text-ink-3 active:text-danger"
          >
            <X size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => save([...drops, { weight: null, reps: null }])}
        className={cn(
          'flex min-h-9 items-center gap-1 text-subhead font-semibold',
          rp ? 'text-rp' : 'text-accent-ink',
        )}
      >
        <Plus size={16} /> {rp ? 'mini-serie' : 'bajada'}
      </button>
    </div>
  )
}
