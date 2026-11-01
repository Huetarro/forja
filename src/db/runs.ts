import { useLiveQuery } from 'dexie-react-hooks'
import { db, newId } from './db'
import type { Run } from './schema'

export type RunInput = Omit<Run, 'id' | 'createdAt'>

/** Carreras, la más reciente primero. */
export function useRuns(): Run[] | undefined {
  return useLiveQuery(async () =>
    (await db.runs.toArray()).sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
    ),
  )
}

export async function createRun(input: RunInput): Promise<string> {
  const id = newId()
  await db.runs.add({ ...input, id, createdAt: Date.now() })
  return id
}

export async function updateRun(id: string, patch: Partial<RunInput>): Promise<void> {
  await db.runs.update(id, patch)
}

export async function deleteRun(id: string): Promise<() => Promise<void>> {
  const r = await db.runs.get(id)
  await db.runs.delete(id)
  return async () => {
    if (r) await db.runs.put(r)
  }
}
