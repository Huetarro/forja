/** Exportar e importar copias, CSV y borrado total. */
import { BACKUP_APP, BACKUP_TABLES, BACKUP_VERSION, type BackupFile } from '@/domain/backup'
import { toCsv } from '@/domain/csv'
import { todayLocal } from '@/domain/dates'
import { paceSecPerKm, formatPace } from '@/domain/pace'
import { SET_TYPE_LABEL } from '@/domain/setTypes'
import { db, newId } from './db'
import { DEFAULT_SETTINGS, DEFAULT_SUPPLEMENTS, type ProgressPhoto } from './schema'
import { updateSettings } from './settings'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(url: string): Promise<Blob> {
  return (await fetch(url)).blob()
}

const allTables = () => BACKUP_TABLES.map((t) => db.table(t))

/** Genera el archivo de copia (JSON con las fotos incluidas). */
export async function exportBackup(): Promise<File> {
  const data = {} as Record<string, unknown[]>
  for (const t of BACKUP_TABLES) {
    if (t === 'photos') {
      const photos = await db.photos.toArray()
      data.photos = await Promise.all(
        photos.map(async (p) => ({ ...p, image: await blobToDataUrl(p.image) })),
      )
    } else data[t] = await db.table(t).toArray()
  }
  const file: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: data as BackupFile['data'],
  }
  return new File([JSON.stringify(file)], `forja-copia-${todayLocal()}.json`, {
    type: 'application/json',
  })
}

export async function markBackupDone(): Promise<void> {
  await updateSettings({ lastBackupAt: Date.now() })
}

/** Sustituye todos los datos por los de la copia (ya validada). */
export async function importBackup(backup: BackupFile): Promise<void> {
  const photos = await Promise.all(
    (backup.data.photos as Array<Omit<ProgressPhoto, 'image'> & { image: string }>).map(
      async (p) => ({
        ...p,
        image: await dataUrlToBlob(p.image),
      }),
    ),
  )
  await db.transaction('rw', allTables(), async () => {
    for (const t of BACKUP_TABLES) {
      await db.table(t).clear()
      const rows = t === 'photos' ? photos : backup.data[t]
      if (rows.length) await db.table(t).bulkAdd(rows)
    }
    const settings = await db.settings.get('app')
    await db.settings.put({ ...DEFAULT_SETTINGS, ...settings, id: 'app', onboarded: true })
  })
}

/** Borra todos los datos y vuelve al estado inicial (pantalla de bienvenida). */
export async function deleteAllData(): Promise<void> {
  await db.transaction('rw', allTables(), async () => {
    for (const t of BACKUP_TABLES) await db.table(t).clear()
    await db.settings.put(DEFAULT_SETTINGS)
    await db.supplements.bulkAdd(
      DEFAULT_SUPPLEMENTS.map((name, order) => ({ id: newId(), name, order, active: true })),
    )
  })
}

/** Tres CSV: entrenos con series, carreras y registro diario. */
export async function exportCsv(): Promise<File[]> {
  const [workouts, wes, sets, exercises, runs, logs, supplements] = await Promise.all([
    db.workouts.where('status').equals('terminado').toArray(),
    db.workoutExercises.toArray(),
    db.workoutSets.toArray(),
    db.exercises.toArray(),
    db.runs.toArray(),
    db.dayLogs.toArray(),
    db.supplements.toArray(),
  ])
  const exById = new Map(exercises.map((e) => [e.id, e]))
  const weById = new Map(wes.map((w) => [w.id, w]))
  const wById = new Map(workouts.map((w) => [w.id, w]))

  const setRows = sets
    .filter((s) => s.completed && wById.has(s.workoutId))
    .map((s) => {
      const w = wById.get(s.workoutId)
      const we = weById.get(s.workoutExerciseId)
      const ex = we ? exById.get(we.exerciseId) : undefined
      return {
        sort: `${w?.date}|${w?.startedAt}|${String(we?.order ?? 0).padStart(3, '0')}|${String(s.order).padStart(3, '0')}|${s.side ?? ''}`,
        row: [
          w?.date,
          w?.routineName,
          Math.round((w?.activeSeconds ?? 0) / 60),
          w?.avgHeartRate,
          w?.calories,
          w?.rating,
          w?.energy,
          ex?.name ?? 'Ejercicio eliminado',
          ex?.unit,
          s.order + 1,
          s.side === 'izq' ? 'Izq' : s.side === 'der' ? 'Der' : '',
          SET_TYPE_LABEL[s.type],
          s.weight,
          s.reps,
          ex?.metric === 'segundos' ? 'segundos' : 'reps',
          s.drops.map((d) => `${d.weight ?? ''}x${d.reps ?? ''}`).join(' / '),
          w?.deload ? 'sí' : '',
          w?.notes,
        ],
      }
    })
    .sort((a, b) => a.sort.localeCompare(b.sort))
    .map((x) => x.row)

  const entrenos = toCsv(
    [
      'Fecha',
      'Rutina',
      'Duración (min)',
      'Pulsaciones',
      'Calorías',
      'Valoración',
      'Energía',
      'Ejercicio',
      'Unidad',
      'Serie',
      'Lado',
      'Tipo',
      'Peso',
      'Reps',
      'Medida',
      'Bajadas / mini-series',
      'Descarga',
      'Notas del entreno',
    ],
    setRows,
  )
  const carreras = toCsv(
    [
      'Fecha',
      'Distancia (km)',
      'Tiempo (min)',
      'Ritmo (min/km)',
      'Pulsaciones',
      'Calorías',
      'Desnivel (m)',
      'Tipo',
      'Superficie',
      'Sensaciones',
      'Notas',
    ],
    runs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [
        r.date,
        r.distanceKm,
        Math.round((r.durationSec / 60) * 100) / 100,
        formatPace(paceSecPerKm(r.durationSec, r.distanceKm), false),
        r.avgHeartRate,
        r.calories,
        r.elevationM,
        r.type,
        r.surface,
        r.feeling,
        r.notes,
      ]),
  )
  const supl = supplements.sort((a, b) => a.order - b.order)
  const registro = toCsv(
    [
      'Fecha',
      'Descanso',
      'Alimentación',
      'Horas de sueño',
      'Estiramientos',
      'Peso (kg)',
      ...supl.map((s) => s.name),
      'Notas',
    ],
    logs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((l) => [
        l.date,
        l.rest,
        l.nutrition ?? '',
        l.sleepHours,
        l.stretching,
        l.bodyWeight,
        ...supl.map((s) => l.supplements[s.id] === true),
        l.notes,
      ]),
  )
  const d = todayLocal()
  const f = (name: string, text: string) =>
    new File([text], `forja-${name}-${d}.csv`, { type: 'text/csv' })
  return [f('entrenos', entrenos), f('carreras', carreras), f('registro-diario', registro)]
}
