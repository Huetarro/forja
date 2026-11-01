import { create } from 'zustand'

export interface Toast {
  id: number
  text: string
  undo?: () => void | Promise<void>
}

export interface ConfirmRequest {
  title: string
  text?: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  resolve: (ok: boolean) => void
}

interface UIState {
  toasts: Toast[]
  confirmReq: ConfirmRequest | null
  showToast: (text: string, undo?: Toast['undo']) => void
  dismissToast: (id: number) => void
  setConfirm: (req: ConfirmRequest | null) => void
}

let nextId = 1

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  confirmReq: null,
  showToast: (text, undo) => {
    const id = nextId++
    set({ toasts: [{ id, text, undo }] })
    setTimeout(() => get().dismissToast(id), undo ? 6000 : 3000)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  setConfirm: (confirmReq) => set({ confirmReq }),
}))

/** Muestra un aviso temporal, con "Deshacer" opcional. */
export function toast(text: string, undo?: Toast['undo']): void {
  useUI.getState().showToast(text, undo)
}

/** Pide confirmación. Devuelve true si se acepta. */
export function confirm(opts: Omit<ConfirmRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    useUI.getState().setConfirm({
      ...opts,
      resolve: (ok) => {
        useUI.getState().setConfirm(null)
        resolve(ok)
      },
    })
  })
}
