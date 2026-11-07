/** Copia interna previa a la v2: restaurarla y borrarla pasados 30 días. */
import { useLiveQuery } from 'dexie-react-hooks'
import { db, PRE_V2_SNAPSHOT_ID, V1_TABLES } from './db'
import { DEFAULT_SETTINGS, type Settings } from './schema'

export const SNAPSHOT_DAYS = 30
const DAY_MS = 86_400_000

export function snapshotExpired(createdAt: number, now = Date.now()): boolean {
  return now - createdAt > SNAPSHOT_DAYS * DAY_MS
}

/** Fecha de la copia previa a la v2 si sigue disponible; null si no hay. */
export function usePreV2Snapshot(): { createdAt: number } | null | undefined {
  return useLiveQuery(async () => {
    const s = await db.snapshots.get(PRE_V2_SNAPSHOT_ID)
    if (!s || snapshotExpired(s.createdAt)) return null
    return { createdAt: s.createdAt }
  })
}

/** Borra la copia previa a la v2 cuando han pasado 30 días (los datos reales no se tocan). */
export async function purgeOldSnapshot(now = Date.now()): Promise<void> {
  const s = await db.snapshots.get(PRE_V2_SNAPSHOT_ID)
  if (s && snapshotExpired(s.createdAt, now)) await db.snapshots.delete(PRE_V2_SNAPSHOT_ID)
}

/**
 * Vuelve a los datos tal como estaban antes de la v2. La copia se conserva (se puede
 * repetir) y el plan semanal no se vuelve a cargar solo.
 */
export async function restorePreV2(): Promise<boolean> {
  const snap = await db.snapshots.get(PRE_V2_SNAPSHOT_ID)
  if (!snap) return false
  const tables = V1_TABLES.map((t) => db.table(t))
  await db.transaction('rw', tables, async () => {
    for (const t of V1_TABLES) {
      await db.table(t).clear()
      const rows = snap.data[t] ?? []
      if (rows.length) await db.table(t).bulkAdd(rows)
    }
    const settings = (await db.settings.get('app')) as Settings | undefined
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      ...settings,
      id: 'app',
      planV2Pending: false,
      preV2SnapshotAt: snap.createdAt,
    })
  })
  return true
}
