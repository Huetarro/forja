import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Switch } from '@/components/ui/Form'
import { SortableList } from '@/components/ui/SortableList'
import { addSupplement, reorderSupplements, updateSupplement, useSupplements } from '@/db/days'
import { moveItem } from '@/domain/ordering'
import { cn } from '@/lib/cn'

/** Suplementos: añadir, renombrar, reordenar y desactivar. */
export function SupplementsEditor() {
  const list = useSupplements(true)
  const [name, setName] = useState('')
  if (!list) return null

  return (
    <section>
      <h3 className="mb-1.5 px-4 text-footnote font-medium text-ink-2">Suplementos</h3>
      <div className="overflow-hidden rounded-card bg-card">
        <SortableList
          items={list}
          getId={(s) => s.id}
          className="divide-y divide-sep"
          onReorder={(from, to) =>
            void reorderSupplements(moveItem(list, from, to).map((s) => s.id))
          }
          renderItem={(s, handle) => (
            <div className="flex items-center bg-card pr-3">
              {handle}
              <input
                key={s.id + s.name}
                defaultValue={s.name}
                aria-label={`Nombre del suplemento ${s.name}`}
                maxLength={30}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== s.name) void updateSupplement(s.id, { name: v })
                  else e.target.value = s.name
                }}
                className={cn(
                  'min-h-12 min-w-0 flex-1 bg-transparent text-body outline-none',
                  !s.active && 'text-ink-2',
                )}
              />
              <Switch
                label={`${s.name} activo`}
                checked={s.active}
                onChange={(active) => void updateSupplement(s.id, { active })}
              />
            </div>
          )}
        />
        <form
          className="flex items-center gap-2 border-t border-sep py-1 pr-2 pl-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            void addSupplement(name).then(() => setName(''))
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Añadir suplemento"
            aria-label="Nuevo suplemento"
            maxLength={30}
            enterKeyHint="done"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-body outline-none"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            aria-label="Añadir suplemento"
            className="grid size-10 place-items-center rounded-full text-accent-ink disabled:opacity-30"
          >
            <Plus size={22} />
          </button>
        </form>
      </div>
      <p className="mt-1.5 px-4 text-footnote text-ink-2">
        Desactiva los que ya no tomes: su historial se conserva.
      </p>
    </section>
  )
}
