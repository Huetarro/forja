import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Archive, ChevronRight, Dumbbell, Trash2 } from 'lucide-react'
import { Group, Row, Switch } from '@/components/ui/Form'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select } from '@/components/ui/Select'
import { deleteAllData } from '@/db/backup'
import type { ThemePref } from '@/db/schema'
import { updateSettings, useSettings } from '@/db/settings'
import { confirm, toast } from '@/stores/ui'
import { BackupGroup } from './BackupGroup'
import { SampleDataGroup } from './SampleDataGroup'
import { SupplementsEditor } from './SupplementsEditor'

const THEMES: Array<{ value: ThemePref; label: string }> = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

const REST_OPTIONS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 240, 300]
const fmtRest = (s: number) =>
  s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`

function NameField({ initial }: { initial: string }) {
  const [name, setName] = useState(initial)
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={() => void updateSettings({ userName: name.trim() || 'Dani' })}
      enterKeyHint="done"
      maxLength={30}
      aria-label="Tu nombre"
      className="min-h-12 w-full bg-transparent px-4 outline-none"
    />
  )
}

export default function SettingsPage() {
  const settings = useSettings()
  const { hash } = useLocation()

  // Enlace directo a una sección (p. ej. #copia desde el aviso de Inicio)
  useEffect(() => {
    if (!hash || !settings) return
    const t = setTimeout(
      () => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }),
      150,
    )
    return () => clearTimeout(t)
  }, [hash, settings])

  if (!settings) return null

  const wipe = async () => {
    const first = await confirm({
      title: '¿Borrar todos los datos?',
      text: 'Se eliminarán entrenos, rutinas, ejercicios, carreras, registro diario y fotos de este móvil.',
      confirmLabel: 'Continuar',
      destructive: true,
    })
    if (!first) return
    const second = await confirm({
      title: 'Esta acción no se puede deshacer',
      text: 'Si no tienes una copia de seguridad, perderás todo. ¿Borrar definitivamente?',
      confirmLabel: 'Borrar todo',
      destructive: true,
    })
    if (!second) return
    window.location.hash = '#/'
    await deleteAllData()
    toast('Datos borrados')
  }

  return (
    <>
      <PageHeader title="Ajustes" />

      <div className="space-y-6">
        <Group title="Tu nombre">
          <NameField key={settings.userName} initial={settings.userName} />
        </Group>

        <section>
          <h3 className="mb-1.5 px-4 text-footnote font-medium text-ink-2">Tema</h3>
          <SegmentedControl
            label="Tema"
            value={settings.theme}
            options={THEMES}
            onChange={(theme) => void updateSettings({ theme })}
          />
        </section>

        <Group
          title="Entreno"
          footer="La unidad se aplica a los ejercicios nuevos; cada ejercicio puede ir en kg o en lb."
        >
          <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-1.5">
            <span className="text-body">Unidad por defecto</span>
            <div className="w-36">
              <SegmentedControl
                label="Unidad por defecto"
                value={settings.defaultUnit}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'lb', label: 'lb' },
                ]}
                onChange={(defaultUnit) => void updateSettings({ defaultUnit })}
              />
            </div>
          </div>
          <Row label="Temporizador de descanso">
            <Switch
              label="Temporizador de descanso"
              checked={settings.restTimer.visible}
              onChange={(visible) =>
                void updateSettings({ restTimer: { ...settings.restTimer, visible } })
              }
            />
          </Row>
          {settings.restTimer.visible && (
            <Row label="Duración por defecto" htmlFor="rest-seconds">
              <Select
                id="rest-seconds"
                value={settings.restTimer.seconds}
                onChange={(e) =>
                  void updateSettings({
                    restTimer: { ...settings.restTimer, seconds: Number(e.target.value) },
                  })
                }
              >
                {REST_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {fmtRest(s)}
                  </option>
                ))}
              </Select>
            </Row>
          )}
        </Group>
        {settings.restTimer.visible && (
          <p className="-mt-4 px-4 text-footnote text-ink-2">
            Arranca al marcar una serie. Avisa con sonido y en pantalla mientras la app esté abierta
            (iOS no permite avisar con la app cerrada). Cada ejercicio puede tener su propio
            descanso.
          </p>
        )}

        <SupplementsEditor />

        <Group>
          <SettingsLink to="/ejercicios" icon={<Dumbbell size={20} />}>
            Biblioteca de ejercicios
          </SettingsLink>
          <SettingsLink to="/archivados" icon={<Archive size={20} />}>
            Rutinas y programas archivados
          </SettingsLink>
        </Group>

        <BackupGroup />

        <SampleDataGroup />

        <Group title="Zona peligrosa">
          <button
            type="button"
            onClick={() => void wipe()}
            className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-danger"
          >
            <Trash2 size={20} /> Borrar todos los datos
          </button>
        </Group>

        <p className="tnum pt-2 text-center text-footnote text-ink-3">Forja v{__APP_VERSION__}</p>
      </div>
    </>
  )
}

function SettingsLink({
  to,
  icon,
  children,
}: {
  to: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link to={to} className="flex min-h-12 items-center gap-3 px-4 active:bg-fill">
      <span className="text-accent-ink">{icon}</span>
      <span className="flex-1 text-body">{children}</span>
      <ChevronRight size={18} className="text-ink-3" aria-hidden />
    </Link>
  )
}
