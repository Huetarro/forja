import { expect, test, type Page } from '@playwright/test'
import { createSampleRoutine, logSet, onboard } from './helpers'

const section = (page: Page, name: string) => page.getByRole('region', { name })

async function check(page: Page, block: string, index: number) {
  const scope = section(page, block)
  const done = scope.getByRole('button', { name: /Serie hecha/ })
  const before = await done.count()
  await scope.getByRole('button', { name: 'Marcar serie como hecha' }).nth(index).click()
  // Espera a que la fila quede marcada antes de seguir
  await expect(done).toHaveCount(before + 1)
}

test('entreno completo con dropset, negativa, unilateral y superserie; cierre y resumen', async ({
  page,
}) => {
  await onboard(page)
  await createSampleRoutine(page)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await expect(page.getByRole('timer').first()).toBeVisible()

  // Press banca: serie 1 normal, serie 2 dropset con una bajada, serie 3 negativa
  const press = section(page, 'Press banca')
  await logSet(press, 'serie 1', '80', '8')
  await check(page, 'Press banca', 0)
  await expect(press.getByRole('button', { name: /Serie hecha/ })).toHaveCount(1)

  await press
    .getByRole('button', { name: /Tipo: Normal/ })
    .nth(1)
    .click() // → Calentamiento
  await press.getByRole('button', { name: /Tipo: Calentamiento/ }).click() // → Dropset
  await expect(press.getByRole('button', { name: /Tipo: Dropset/ })).toBeVisible()
  await press.getByRole('button', { name: 'bajada' }).click()
  await press.getByLabel('Peso bajada 1').fill('60')
  await press.getByLabel('Reps bajada 1').fill('6')
  await press.getByLabel('Peso serie 2', { exact: true }).fill('80')
  await expect(press.getByLabel('Peso bajada 1')).toHaveValue('60')

  // Negativa en la tercera fila
  const typeButtons = press.getByRole('button', { name: /^Tipo:/ })
  await typeButtons.nth(2).click()
  await typeButtons.nth(2).click()
  await typeButtons.nth(2).click()
  await expect(typeButtons.nth(2)).toHaveAccessibleName(/Negativa/)

  // Unilateral: hay filas Izq y Der
  const curl = section(page, 'Curl concentrado')
  await expect(curl.getByText('Izq').first()).toBeVisible()
  await expect(curl.getByText('Der').first()).toBeVisible()
  await curl.getByLabel('Peso serie 1 Izq').fill('14')
  await curl.getByLabel('Reps serie 1 Izq').fill('10')
  await curl.getByLabel('Peso serie 1 Der').fill('14')
  await curl.getByLabel('Reps serie 1 Der').fill('9')
  await check(page, 'Curl concentrado', 0)
  await check(page, 'Curl concentrado', 0) // la siguiente sin marcar pasa a ser la primera

  // RIR
  await curl.getByRole('button', { name: /^RIR/ }).first().click()
  await curl.getByRole('radio', { name: '2' }).click()

  // Pausar y reanudar
  await page.getByRole('button', { name: 'Pausar' }).click()
  await expect(page.getByText('En pausa')).toBeVisible()
  await page.getByRole('button', { name: 'Reanudar' }).click()

  // Terminar: series sin marcar → descartar
  await page.getByRole('button', { name: 'Terminar' }).click()
  await expect(page.getByRole('alertdialog')).toContainText('sin marcar')
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  // Cambiaron los tipos de serie → pregunta si actualizar la rutina
  await expect(page.getByRole('alertdialog')).toContainText('Actualizar la rutina')
  await page.getByRole('button', { name: 'Solo este entreno' }).click()

  // Datos de cierre
  await page.getByLabel('Pulsaciones medias').fill('128')
  await page.getByLabel('Calorías').fill('420')
  await page.getByRole('radio', { name: 'Valoración del entreno: 4' }).click()
  await page.getByRole('radio', { name: 'Energía: 5' }).click()
  await page.getByLabel('Peso corporal').fill('78,4')
  await page.getByLabel('Notas del entreno').fill('Buenas sensaciones')
  await page.getByRole('button', { name: 'Guardar' }).click()

  // Resumen
  await expect(page.getByRole('heading', { name: '¡Entreno terminado!' })).toBeVisible()
  await expect(page.getByText('Series efectivas')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Compartir' })).toBeVisible()
  // Volumen: 80×8 + 14×10 + 14×9 = 906 kg
  await expect(page.getByText('906 kg').first()).toBeVisible()

  // Historial y detalle
  await page.getByRole('button', { name: 'Listo' }).click()
  await page.goto('./#/historial')
  await page.getByRole('link', { name: /Torso A/ }).click()
  await expect(page.getByText('128 ppm')).toBeVisible()
  await expect(page.getByText('Buenas sensaciones')).toBeVisible()
})

test('cerrar y recuperar un entreno en curso', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await logSet(section(page, 'Press banca'), 'serie 1', '82,5', '6')
  await check(page, 'Press banca', 0)
  await section(page, 'Press banca').getByLabel('Peso serie 2', { exact: true }).fill('85')

  // Simula cerrar la app y volver a abrirla
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Press banca' })).toBeVisible()
  const press = section(page, 'Press banca')
  await expect(press.getByLabel('Peso serie 1', { exact: true })).toHaveValue('82,5')
  await expect(press.getByLabel('Peso serie 2', { exact: true })).toHaveValue('85')
  await expect(press.getByRole('button', { name: /Serie hecha/ })).toHaveCount(1)

  // Desde Inicio también se ve la tarjeta del entreno en curso
  await page.goto('./#/calendario')
  await page.getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByRole('link', { name: /Entreno en curso: Torso A/ })).toBeVisible()
})

test('anterior, prerrelleno, "Sube peso" y récord en la segunda sesión', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)

  // Sesión 1: Press banca 3×(80×8) con RIR 2
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  const press = section(page, 'Press banca')
  for (let i = 1; i <= 3; i++) {
    await logSet(press, `serie ${i}`, '80', '8')
    await press
      .getByRole('button', { name: /^RIR/ })
      .nth(i - 1)
      .click()
    await press.getByRole('radio', { name: '2' }).click()
  }
  for (let i = 0; i < 3; i++) await check(page, 'Press banca', 0)
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('button', { name: 'Listo' }).click()

  // Sesión 2: aparece "Anterior", prerrelleno y "Sube peso"
  await page.goto('./#/')
  await page.getByRole('button', { name: 'Empezar', exact: true }).click()
  const press2 = section(page, 'Press banca')
  await expect(press2.getByText('Sube peso')).toBeVisible()
  await expect(press2.getByText('80 × 8').first()).toBeVisible()
  await expect(press2.getByLabel('Peso serie 1', { exact: true })).toHaveAttribute(
    'placeholder',
    '80',
  )

  // Marcar sin tocar acepta los valores anteriores
  await check(page, 'Press banca', 0)
  await expect(press2.getByLabel('Peso serie 1', { exact: true })).toHaveValue('80')

  // Récord de peso
  await logSet(press2, 'serie 2', '85', '5')
  await check(page, 'Press banca', 0)
  await expect(page.getByText(/¡Récord!/)).toBeVisible()
})

test('añadir un entreno olvidado y editarlo desde el historial', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)
  await page.getByRole('button', { name: 'Añadir entreno pasado' }).click()
  await page.getByLabel('Minutos').fill('15')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Torso A' })).toBeVisible()
  await expect(page.getByText('1 h 15 min')).toBeVisible()

  await logSet(section(page, 'Press banca'), 'serie 1', '70', '10')
  await check(page, 'Press banca', 0)
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByText('70 kg × 10')).toBeVisible()

  // Eliminar con deshacer
  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByRole('button', { name: 'Eliminar entreno' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await page.goto('./#/historial')
  await expect(page.getByRole('link', { name: /Torso A/ })).toBeVisible()
})
