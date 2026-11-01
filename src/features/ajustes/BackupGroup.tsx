import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { Group } from '@/components/ui/Form'
import { exportBackup, exportCsv, importBackup, markBackupDone } from '@/db/backup'
import { useSettings } from '@/db/settings'
import { validateBackup } from '@/domain/backup'
import { capitalize, longDate, toLocalDate } from '@/domain/dates'
import { shareOrDownload } from '@/lib/share'
import { confirm, toast } from '@/stores/ui'

/** Copia de seguridad: exportar (JSON con fotos), importar y CSV. */
export function BackupGroup() {
  const settings = useSettings()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const doExport = () =>
    run(async () => {
      const file = await exportBackup()
      const r = await shareOrDownload(file, 'Copia de Forja')
      if (r !== 'cancelled') {
        await markBackupDone()
        toast(r === 'shared' ? 'Copia lista' : 'Copia descargada')
      }
    })

  const doCsv = () =>
    run(async () => {
      const r = await shareOrDownload(await exportCsv(), 'Datos de Forja (CSV)')
      if (r === 'downloaded') toast('CSV descargados')
    })

  const doImport = (file: File) =>
    run(async () => {
      let json: unknown
      try {
        json = JSON.parse(await file.text())
      } catch {
        toast('El archivo no es una copia válida')
        return
      }
      const v = validateBackup(json)
      if (!v.ok) {
        toast(v.error)
        return
      }
      const when = v.backup.exportedAt
        ? ` del ${longDate(toLocalDate(new Date(v.backup.exportedAt)))}`
        : ''
      const ok = await confirm({
        title: '¿Restaurar esta copia?',
        text: `Se sustituirán TODOS tus datos actuales por los de la copia${when}: ${v.counts.workouts} entrenos, ${v.counts.runs} carreras, ${v.counts.exercises} ejercicios y ${v.counts.photos} fotos.`,
        confirmLabel: 'Restaurar',
        destructive: true,
      })
      if (!ok) return
      await importBackup(v.backup)
      toast('Copia restaurada')
    })

  const last = settings?.lastBackupAt
  return (
    <div id="copia" className="scroll-mt-4">
      <Group
        title="Copia de seguridad"
        footer={
          (last
            ? `Última copia: ${capitalize(longDate(toLocalDate(new Date(last))))}. `
            : 'Aún no has hecho ninguna copia. ') +
          'Al exportar, elige “Guardar en Archivos” (por ejemplo, en iCloud Drive).'
        }
      >
        <Action icon={<Download size={20} />} onClick={() => void doExport()} disabled={busy}>
          Exportar copia
        </Action>
        <Action
          icon={<Upload size={20} />}
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          Importar copia
        </Action>
        <Action icon={<FileSpreadsheet size={20} />} onClick={() => void doCsv()} disabled={busy}>
          Exportar a CSV
        </Action>
      </Group>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        aria-label="Elegir copia de seguridad"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void doImport(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function Action({
  icon,
  onClick,
  disabled,
  children,
}: {
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink active:bg-fill disabled:opacity-50"
    >
      {icon}
      {children}
    </button>
  )
}
