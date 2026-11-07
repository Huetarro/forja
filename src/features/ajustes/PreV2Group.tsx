import { useState } from 'react'
import { History } from 'lucide-react'
import { Group } from '@/components/ui/Form'
import { restorePreV2, SNAPSHOT_DAYS, usePreV2Snapshot } from '@/db/snapshot'
import { longDate, toLocalDate } from '@/domain/dates'
import { confirm, toast } from '@/stores/ui'

/** "Restaurar copia anterior a la v2": visible durante 30 días tras la actualización. */
export function PreV2Group() {
  const snap = usePreV2Snapshot()
  const [busy, setBusy] = useState(false)
  if (!snap) return null

  const until = new Date(snap.createdAt + SNAPSHOT_DAYS * 86_400_000)
  const restore = async () => {
    const ok = await confirm({
      title: '¿Restaurar la copia anterior a la v2?',
      text: 'Tus datos volverán a como estaban justo antes de actualizar. Se perderá lo que hayas apuntado desde entonces.',
      confirmLabel: 'Continuar',
      destructive: true,
    })
    if (!ok) return
    const sure = await confirm({
      title: '¿Seguro?',
      text: 'Esta acción sustituye todos los datos actuales.',
      confirmLabel: 'Restaurar',
      destructive: true,
    })
    if (!sure) return
    setBusy(true)
    try {
      toast((await restorePreV2()) ? 'Copia anterior a la v2 restaurada' : 'No hay copia')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Group
      title="Copia anterior a la v2"
      footer={`Copia automática del ${longDate(toLocalDate(new Date(snap.createdAt)))}, guardada al actualizar. Disponible hasta el ${longDate(toLocalDate(until))}.`}
    >
      <button
        type="button"
        onClick={() => void restore()}
        disabled={busy}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink active:bg-fill disabled:opacity-50"
      >
        <History size={20} />
        Restaurar copia anterior a la v2
      </button>
    </Group>
  )
}
