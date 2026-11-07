import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createSampleRoutine, onboard } from './helpers'

test('exportar e importar una copia de seguridad (y CSV)', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)
  // Un registro diario y una carrera para que la copia tenga de todo
  await page.goto('./#/running?nueva=1')
  const sheet = page.getByRole('dialog')
  await sheet.getByLabel('Distancia').fill('5')
  await sheet.getByLabel('Minutos').selectOption('25')
  await sheet.getByRole('button', { name: 'Guardar' }).click()
  await expect(sheet).toBeHidden()

  await page.getByRole('link', { name: 'Ajustes' }).click()
  await expect(page.getByText('Aún no has hecho ninguna copia.', { exact: false })).toBeVisible()

  // Exportar (sin menú de compartir en el navegador de pruebas → descarga)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar copia' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^forja-copia-\d{4}-\d{2}-\d{2}\.json$/)
  const path = await download.path()
  const json = JSON.parse(readFileSync(path, 'utf-8')) as {
    app: string
    data: Record<string, unknown[]>
  }
  expect(json.app).toBe('forja')
  expect(json.data.routines).toHaveLength(1)
  expect(json.data.runs).toHaveLength(1)
  await expect(page.getByText(/Última copia:/)).toBeVisible()

  // CSV: tres archivos
  const csvNames: string[] = []
  page.on('download', (d) => csvNames.push(d.suggestedFilename()))
  await page.getByRole('button', { name: 'Exportar a CSV' }).click()
  await expect.poll(() => csvNames.length).toBe(3)
  expect(csvNames.sort()).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^forja-carreras-/),
      expect.stringMatching(/^forja-entrenos-/),
      expect.stringMatching(/^forja-registro-diario-/),
    ]),
  )

  // Borrar todo (doble confirmación) → vuelve la bienvenida
  await page.getByRole('button', { name: 'Borrar todos los datos' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Borrar todo' }).click()
  await expect(page.getByRole('heading', { name: /Te damos la bienvenida/ })).toBeVisible()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await expect(page.getByText('Crea tu primera rutina')).toBeVisible()

  // Importar un archivo que no es válido
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.getByLabel('Elegir copia de seguridad').setInputFiles({
    name: 'otra.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hola": 1}'),
  })
  await expect(page.getByText('El archivo no es una copia de seguridad de Forja.')).toBeVisible()

  // Importar la copia buena
  await page.getByLabel('Elegir copia de seguridad').setInputFiles(path)
  await expect(page.getByRole('alertdialog')).toContainText('1 carreras')
  await page.getByRole('alertdialog').getByRole('button', { name: 'Restaurar' }).click()
  await expect(page.getByText('Copia restaurada')).toBeVisible()
  await page.getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByRole('listitem').getByRole('link', { name: /Torso A/ })).toBeVisible()
  await page.getByRole('link', { name: 'Running' }).click()
  await expect(page.getByText('5 km').first()).toBeVisible()
})

test('ajustes: unidad, temporizador de descanso y suplementos', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.getByRole('radio', { name: 'lb' }).click()
  await page.getByRole('switch', { name: 'Temporizador de descanso' }).click()
  await page.getByLabel('Duración por defecto').selectOption('60')
  await page.getByLabel('Nuevo suplemento').fill('Proteína')
  await page.getByRole('button', { name: 'Añadir suplemento' }).click()
  await expect(page.getByLabel('Nombre del suplemento Proteína')).toBeVisible()
  await page.getByRole('switch', { name: 'Magnesio activo' }).click()

  await page.getByRole('link', { name: 'Inicio' }).click()
  const hoy = page.getByRole('region', { name: 'Hoy' })
  await expect(hoy.getByRole('button', { name: 'Proteína' })).toBeVisible()
  await expect(hoy.getByRole('button', { name: 'Magnesio' })).toHaveCount(0)

  // El temporizador arranca al marcar una serie (en superseries, tras la pareja)
  await createSampleRoutine(page)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  const press = page.getByRole('region', { name: 'Press banca' })
  await press.getByLabel('Peso serie 1', { exact: true }).fill('100')
  await press.getByLabel('Reps serie 1', { exact: true }).fill('5')
  await press.getByRole('button', { name: 'Marcar serie como hecha' }).first().click()
  await expect(page.getByRole('timer', { name: /Descanso: quedan/ })).toHaveCount(0)
  const remo = page.getByRole('region', { name: 'Remo con barra' })
  await remo.getByLabel('Peso serie 1', { exact: true }).fill('60')
  await remo.getByLabel('Reps serie 1', { exact: true }).fill('8')
  await remo.getByRole('button', { name: 'Marcar serie como hecha' }).first().click()
  await expect(page.getByRole('timer', { name: /Descanso: quedan/ })).toBeVisible()
  await expect(press.getByText('lb', { exact: true }).first()).toBeVisible()
})

test('funciona sin conexión tras la primera carga', async ({ page, context }) => {
  await onboard(page)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // Asegura que el service worker controla la página
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hola, Dani' })).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Hola, Dani' })).toBeVisible()
  await page.getByRole('link', { name: 'Estadísticas' }).click()
  await expect(page.getByRole('heading', { name: 'Estadísticas' })).toBeVisible()
  await page.getByRole('link', { name: 'Running' }).click()
  await expect(page.getByRole('heading', { name: 'Running' })).toBeVisible()
  await context.setOffline(false)
})
