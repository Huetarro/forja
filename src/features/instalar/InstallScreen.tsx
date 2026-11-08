import { Share, SquarePlus, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  onContinue: () => void
}

const STEPS = [
  { icon: Share, text: 'Toca el botón Compartir de Safari, abajo en el centro.' },
  { icon: SquarePlus, text: 'Elige “Añadir a pantalla de inicio” y pulsa Añadir.' },
  { icon: Smartphone, text: 'Abre Forja desde su icono, como cualquier app.' },
]

export function InstallScreen({ onContinue }: Props) {
  return (
    <div className="pt-safe pb-safe px-safe mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="flex flex-1 flex-col justify-center py-10">
        <img
          src={`${import.meta.env.BASE_URL}pwa-192.png`}
          alt=""
          width={88}
          height={88}
          className="mb-6 rounded-[22px]"
        />
        <h1 className="font-display text-large font-bold tracking-tight">
          Instala Forja en tu iPhone
        </h1>
        <p className="mt-2 text-body text-ink-2">
          Funciona sin conexión y se abre a pantalla completa. Son tres toques.
        </p>

        <ol className="mt-8 space-y-3">
          {STEPS.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-center gap-4 rounded-card bg-card p-4">
              <span className="tnum grid size-8 shrink-0 place-items-center rounded-full bg-fill text-subhead font-bold text-ink-2">
                {i + 1}
              </span>
              <span className="flex-1 text-subhead">{text}</span>
              <Icon size={22} className="shrink-0 text-ink-2" aria-hidden />
            </li>
          ))}
        </ol>

        <p className="mt-6 text-footnote text-ink-2">
          Tus datos se guardan solo en este móvil, dentro de la app instalada. Lo que hagas en una
          pestaña de Safari no aparecerá en la app.
        </p>
      </div>

      <div className="pb-6">
        <Button variant="plain" block onClick={onContinue}>
          Continuar en el navegador
        </Button>
      </div>
    </div>
  )
}
