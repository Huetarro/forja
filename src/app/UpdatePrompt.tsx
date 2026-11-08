import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

/** Aviso "Nueva versión disponible · Actualizar". Busca actualizaciones al abrir y cada hora. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (!reg) return
      setInterval(() => void reg.update(), 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void reg.update()
      })
    },
  })

  if (!needRefresh) return null
  return (
    <div
      role="status"
      className="fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top) + 8px)' }}
    >
      <div className="flex items-center gap-3 rounded-full bg-card py-1.5 pr-1.5 pl-4 shadow-[var(--sombra-pop)] ring-1 ring-sep">
        <RefreshCw size={16} className="text-ink-2" aria-hidden />
        <span className="text-subhead font-medium">Nueva versión disponible</span>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="min-h-9 rounded-full bg-accent px-4 text-subhead font-semibold text-on-accent"
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
