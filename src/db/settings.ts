import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { DEFAULT_SETTINGS, type Settings } from './schema'

/** Ajustes actuales; `undefined` mientras carga. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(async () => (await db.settings.get('app')) ?? DEFAULT_SETTINGS)
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  const current = (await db.settings.get('app')) ?? DEFAULT_SETTINGS
  await db.settings.put({ ...current, ...patch, id: 'app' })
}
