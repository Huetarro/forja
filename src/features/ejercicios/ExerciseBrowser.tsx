import { useMemo, useState, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { Chip } from '@/components/ui/Form'
import { Select } from '@/components/ui/Select'
import { EQUIPMENT, MUSCLES, type Exercise } from '@/db/schema'
import { filterExercises } from '@/domain/search'

interface Props {
  exercises: Exercise[]
  renderItem: (e: Exercise) => ReactNode
  /** Se muestra cuando no hay resultados; recibe el texto buscado. */
  renderEmpty: (query: string) => ReactNode
}

/** Buscador + filtros por músculo y material + lista. */
export function ExerciseBrowser({ exercises, renderItem, renderEmpty }: Props) {
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<string | undefined>()
  const [equipment, setEquipment] = useState<string | undefined>()

  const results = useMemo(
    () => filterExercises(exercises, { query, muscle, equipment }),
    [exercises, query, muscle, equipment],
  )

  return (
    <div>
      <div className="flex h-10 items-center gap-2 rounded-full bg-fill px-2.5">
        <Search size={17} className="shrink-0 text-ink-2" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio"
          aria-label="Buscar ejercicio"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Borrar búsqueda"
            className="grid size-8 place-items-center text-ink-2"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Chip selected={!muscle} onClick={() => setMuscle(undefined)} className="shrink-0">
          Todos
        </Chip>
        {MUSCLES.map((m) => (
          <Chip
            key={m}
            selected={muscle === m}
            onClick={() => setMuscle(muscle === m ? undefined : m)}
            className="shrink-0"
          >
            {m}
          </Chip>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-footnote text-ink-2">
          {results.length} {results.length === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
        <Select
          aria-label="Filtrar por material"
          value={equipment ?? ''}
          onChange={(e) => setEquipment(e.target.value || undefined)}
          className="text-subhead"
        >
          <option value="">Todo el material</option>
          {EQUIPMENT.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
      </div>

      {results.length > 0 ? (
        <ul className="mt-1 divide-y divide-sep overflow-hidden rounded-card bg-card">
          {results.map((e) => (
            <li key={e.id}>{renderItem(e)}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2">{renderEmpty(query)}</div>
      )}
    </div>
  )
}
