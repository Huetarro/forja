import { useState } from 'react'
import { Archive, FolderPlus } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { SortableList } from '@/components/ui/SortableList'
import {
  createProgram,
  renameProgram,
  reorderPrograms,
  setProgramArchived,
  usePrograms,
} from '@/db/routines'
import { moveItem } from '@/domain/ordering'
import { toast } from '@/stores/ui'

/** Gestionar programas (carpetas de rutinas): crear, renombrar, ordenar y archivar. */
export function ProgramsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Programas" tall>
      <ProgramsBody />
    </BottomSheet>
  )
}

function ProgramsBody() {
  const programs = usePrograms()
  const [name, setName] = useState('')

  const add = async () => {
    if (!name.trim()) return
    await createProgram(name)
    setName('')
  }

  return (
    <div className="space-y-5 pt-2">
      <p className="px-1 text-subhead text-ink-2">
        Agrupa tus rutinas en carpetas, por ejemplo “Fuerza” o “Verano”. La rutina sugerida sigue el
        orden de cada programa.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void add()
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del nuevo programa"
          aria-label="Nombre del nuevo programa"
          maxLength={40}
          enterKeyHint="done"
          className="min-h-touch min-w-0 flex-1 rounded-md bg-card px-4 outline-none focus:ring-2 focus:ring-focus"
        />
        <Button type="submit" disabled={!name.trim()} icon={<FolderPlus size={18} />}>
          Crear
        </Button>
      </form>

      {programs && programs.length > 0 && (
        <SortableList
          items={programs}
          getId={(p) => p.id}
          className="divide-y divide-sep overflow-hidden rounded-card bg-card"
          onReorder={(from, to) =>
            void reorderPrograms(moveItem(programs, from, to).map((p) => p.id))
          }
          renderItem={(p, handle) => (
            <div className="flex items-center bg-card pr-1">
              {handle}
              <input
                key={p.id + p.name}
                defaultValue={p.name}
                aria-label={`Nombre del programa ${p.name}`}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== p.name) void renameProgram(p.id, v)
                  else e.target.value = p.name
                }}
                maxLength={40}
                className="min-h-12 min-w-0 flex-1 bg-transparent text-body outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  void setProgramArchived(p.id, true)
                  toast(`“${p.name}” archivado`, () => setProgramArchived(p.id, false))
                }}
                aria-label={`Archivar ${p.name}`}
                className="grid min-h-touch min-w-touch place-items-center text-ink-2"
              >
                <Archive size={19} />
              </button>
            </div>
          )}
        />
      )}
    </div>
  )
}
