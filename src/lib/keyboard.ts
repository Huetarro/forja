import { useEffect } from 'react'

const FIELD = 'input, textarea, select, [contenteditable="true"]'

/** Oculta el teclado del iPhone quitando el foco del campo activo. */
export function hideKeyboard(): void {
  const el = document.activeElement
  if (el instanceof HTMLElement && el.matches(FIELD)) el.blur()
}

/**
 * Tocar fuera de un campo cierra el teclado (iOS no lo hace solo en una web app).
 * Tocar una etiqueta asociada a un campo no lo cierra.
 */
export function useTapOutsideHidesKeyboard(): void {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest(FIELD) || t.closest('label')) return
      hideKeyboard()
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [])
}
