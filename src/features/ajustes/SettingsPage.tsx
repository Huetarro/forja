import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { updateSettings, useSettings } from '@/db/settings'
import type { ThemePref } from '@/db/schema'

const THEMES: Array<{ value: ThemePref; label: string }> = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

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
      className="h-12 w-full rounded-md bg-card px-4 outline-none focus:ring-2 focus:ring-accent"
    />
  )
}

export default function SettingsPage() {
  const settings = useSettings()
  if (!settings) return null

  return (
    <>
      <PageHeader title="Ajustes" />

      <section className="space-y-6">
        <div>
          <h2 className="mb-2 px-1 text-footnote font-semibold text-ink-2">Tu nombre</h2>
          <NameField key={settings.userName} initial={settings.userName} />
        </div>

        <div>
          <h2 className="mb-2 px-1 text-footnote font-semibold text-ink-2">Tema</h2>
          <SegmentedControl
            label="Tema"
            value={settings.theme}
            options={THEMES}
            onChange={(theme) => void updateSettings({ theme })}
          />
        </div>

        <p className="tnum pt-4 text-center text-footnote text-ink-3">Forja v{__APP_VERSION__}</p>
      </section>
    </>
  )
}
