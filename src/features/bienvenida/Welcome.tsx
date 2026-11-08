import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { updateSettings } from '@/db/settings'
import type { ThemePref } from '@/db/schema'
import { applyTheme } from '@/lib/theme'

const THEMES: Array<{ value: ThemePref; label: string }> = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

export function Welcome() {
  const [name, setName] = useState('Dani')
  const [theme, setTheme] = useState<ThemePref>('auto')

  const changeTheme = (t: ThemePref) => {
    setTheme(t)
    applyTheme(t)
  }

  const start = async () => {
    await updateSettings({ userName: name.trim() || 'Dani', theme, onboarded: true })
  }

  return (
    <div className="pt-safe pb-safe px-safe mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="flex flex-1 flex-col justify-center py-10">
        <img
          src={`${import.meta.env.BASE_URL}pwa-192.png`}
          alt=""
          width={72}
          height={72}
          className="mb-6 rounded-[18px]"
        />
        <h1 className="font-display text-large font-bold tracking-tight">
          Te damos la bienvenida a Forja
        </h1>
        <p className="mt-2 text-body text-ink-2">
          Apunta tus entrenos de gimnasio y tus carreras. Todo se queda en tu móvil.
        </p>

        <label className="mt-10 block">
          <span className="mb-2 block px-1 text-footnote font-semibold text-ink-2">
            ¿Cómo te llamas?
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            enterKeyHint="done"
            maxLength={30}
            className="h-13 w-full rounded-md bg-card px-4 text-body font-medium outline-none focus:ring-2 focus:ring-focus"
          />
        </label>

        <div className="mt-6">
          <span className="mb-2 block px-1 text-footnote font-semibold text-ink-2">Tema</span>
          <SegmentedControl label="Tema" value={theme} options={THEMES} onChange={changeTheme} />
        </div>
      </div>

      <div className="pb-6">
        <Button size="lg" block onClick={() => void start()}>
          Empezar
        </Button>
      </div>
    </div>
  )
}
