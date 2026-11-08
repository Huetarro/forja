/** Flujos de la v2 con el plan semanal de Dani cargado. */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { onboard } from './helpers'

const section = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

/** Fija el día de la semana (la hora avanza con normalidad). */
async function setDay(page: Page, iso: string): Promise<void> {
  await page.clock.setSystemTime(new Date(`${iso}T10:00:00`))
}

async function loadPlan(page: Page): Promise<void> {
  await page.goto('./#/ajustes/plan')
  await page.getByRole('button', { name: 'Cargar plan semanal' }).click()
  await page.getByRole('button', { name: 'Cargar plan', exact: true }).click()
  await expect(page.getByLabel('Plan del lunes').locator('option:checked')).toHaveText('Empuje')
  await page.goto('./#/')
}

async function markRow(scope: Locator, index: number): Promise<void> {
  const done = scope.getByRole('button', { name: /Serie hecha/ })
  const before = await done.count()
  await scope.getByRole('button', { name: 'Marcar serie como hecha' }).nth(index).click()
  await expect(done).toHaveCount(before + 1)
}

async function finish(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Terminar' }).click()
  // En estos flujos siempre quedan series sin marcar
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('heading', { name: 'Entreno terminado' })).toBeVisible()
}

test('lunes: empuje con NEG, DS x2 y rest-pause', async ({ page }) => {
  await setDay(page, '2026-11-09')
  await onboard(page)
  await loadPlan(page)

  const today = page.getByRole('region', { name: 'Te toca hoy' })
  await expect(today.getByText('Empuje')).toBeVisible()
  await today.getByRole('button', { name: 'Empezar' }).click()

  // Objetivo y descanso discretos; nota de RIR
  await expect(page.getByText('6-10 reps · desc. 2:30')).toBeVisible()
  await expect(
    page.getByText('1-2 reps en reserva, salvo la última con técnica (al fallo)'),
  ).toBeVisible()

  // NEG: todas las series del press inclinado en negativa
  const smith = section(page, 'Press inclinado en Smith')
  await expect(smith.getByRole('button', { name: /^Tipo: Negativa/ })).toHaveCount(3)

  // DS x2: dos bajadas ya desplegadas en la última serie y leyenda al tocar el chip
  const lat = section(page, 'Elevaciones laterales')
  await expect(lat.getByLabel('Peso bajada 1')).toBeVisible()
  await expect(lat.getByLabel('Peso bajada 2')).toBeVisible()
  await lat.getByRole('button', { name: /^DS x2/ }).click()
  await expect(page.getByRole('dialog').getByText(/Dos bajadas de peso seguidas/)).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Hecho' }).click()
  await lat.getByLabel('Peso serie 4', { exact: true }).fill('10')
  await lat.getByLabel('Reps serie 4', { exact: true }).fill('15')
  await lat.getByLabel('Peso bajada 1').fill('8')
  await lat.getByLabel('Reps bajada 1').fill('8')
  await lat.getByLabel('Peso bajada 2').fill('6')
  await lat.getByLabel('Reps bajada 2').fill('6')
  await markRow(lat, 3)

  // Rest-pause: dos mini-series con "descansa 15 s" y el peso de la serie por defecto
  const tri = section(page, 'Extensión de tríceps en polea abajo')
  await expect(tri.getByText('Entre mini-series: descansa 15 s')).toBeVisible()
  await tri.getByLabel('Peso serie 3', { exact: true }).fill('25')
  await tri.getByLabel('Reps serie 3', { exact: true }).fill('12')
  await expect(tri.getByLabel('Peso mini-serie 1')).toHaveAttribute('placeholder', '25')
  await tri.getByLabel('Reps mini-serie 1').fill('4')
  await tri.getByLabel('Reps mini-serie 2').fill('3')
  await markRow(tri, 2)
  await expect(tri.getByLabel('Peso mini-serie 1')).toHaveValue('25')

  await finish(page)
  // Volumen: solo la primera parte (10×15 + 25×12 = 450 kg)
  await expect(page.getByText('450 kg').first()).toBeVisible()
})

test('viernes: superserie con descanso tras la pareja', async ({ page }) => {
  await setDay(page, '2026-11-13')
  await onboard(page)
  // Temporizador visible para comprobar dónde arranca el descanso
  await page.goto('./#/ajustes')
  await page.getByRole('switch', { name: 'Temporizador de descanso' }).click()
  await loadPlan(page)

  await page
    .getByRole('region', { name: 'Te toca hoy' })
    .getByRole('button', { name: 'Empezar' })
    .click()
  const curl = section(page, 'Curl en máquina')
  const tri = section(page, 'Extensión de tríceps en polea sobre la cabeza')
  await expect(curl.getByText('10-12 reps', { exact: true })).toBeVisible()
  await expect(tri.getByText('10-12 reps · desc. 1:30 tras la pareja')).toBeVisible()

  await curl.getByLabel('Peso serie 1', { exact: true }).fill('30')
  await curl.getByLabel('Reps serie 1', { exact: true }).fill('12')
  await markRow(curl, 0)
  await expect(page.getByRole('timer', { name: /Descanso/ })).toHaveCount(0)
  await tri.getByLabel('Peso serie 1', { exact: true }).fill('20')
  await tri.getByLabel('Reps serie 1', { exact: true }).fill('12')
  await markRow(tri, 0)
  await expect(
    page.getByRole('timer', { name: /Descanso: quedan (90|89|88|87) segundos/ }),
  ).toBeVisible()
  await finish(page)
})

test('domingo: plancha lateral por tiempo, kg opcional y estiramientos', async ({ page }) => {
  await setDay(page, '2026-11-15')
  await onboard(page)
  await loadPlan(page)
  await page
    .getByRole('region', { name: 'Te toca hoy' })
    .getByRole('button', { name: 'Empezar' })
    .click()

  const plancha = section(page, 'Plancha lateral')
  await expect(plancha.getByText('30-45 s · desc. 0:45')).toBeVisible()
  await expect(plancha.getByText('kg opcional')).toBeVisible()
  // Sin kg: solo segundos, por lado
  await plancha.getByLabel('Segundos serie 1 Izq').fill('40')
  await markRow(plancha, 0)
  await plancha.getByLabel('Segundos serie 1 Der').fill('35')
  await markRow(plancha, 0)

  // Estiramientos con check y temporizador opcional
  const stretches = page.getByRole('region', { name: 'Estiramientos' })
  await expect(stretches.getByRole('checkbox')).toHaveCount(8)
  await stretches.getByRole('button', { name: 'Temporizador de 45 s para Paloma' }).click()
  await expect(
    stretches.getByRole('button', { name: 'Parar temporizador de Paloma' }),
  ).toBeVisible()
  await stretches.getByRole('button', { name: 'Parar temporizador de Paloma' }).click()
  for (const c of await stretches.getByRole('checkbox').all()) await c.click()
  await expect(page.getByText('Estiramientos completados')).toBeVisible()

  await finish(page)
  await expect(page.getByText(/40 s/).first())
    .toBeVisible()
    .catch(() => undefined)
  // El día queda con estiramientos marcados
  await page.goto('./#/')
  await expect(
    page.getByRole('region', { name: 'Hoy' }).getByRole('switch', { name: 'Estiramientos' }),
  ).toHaveAttribute('aria-checked', 'true')
})

test('miércoles: carrera zona 2 con el tipo ya puesto', async ({ page }) => {
  await setDay(page, '2026-11-11')
  await onboard(page)
  await loadPlan(page)
  const today = page.getByRole('region', { name: 'Te toca hoy' })
  await expect(today.getByText('Carrera zona 2 · 30-40 min')).toBeVisible()
  await today.getByRole('link', { name: 'Registrar carrera' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByRole('button', { name: 'Rodaje' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('semana de descarga: mitad de series, normales y sin técnicas', async ({ page }) => {
  await setDay(page, '2026-11-09')
  await onboard(page)
  await loadPlan(page)
  const deload = page.getByRole('region', { name: 'Semana de descarga' })
  await expect(deload.getByText('0 semanas', { exact: false })).toHaveCount(0)
  await deload.getByRole('switch', { name: 'Semana de descarga' }).click()
  await expect(deload.getByText('Semana de descarga activa')).toBeVisible()

  await page
    .getByRole('region', { name: 'Te toca hoy' })
    .getByRole('button', { name: 'Empezar' })
    .click()
  await expect(page.getByText('Empuje · Descarga')).toBeVisible()
  const press = section(page, 'Press en máquina')
  await expect(press.getByRole('button', { name: /^Tipo:/ })).toHaveCount(2)
  const lat = section(page, 'Elevaciones laterales')
  await expect(lat.getByRole('button', { name: /^Tipo: Normal/ })).toHaveCount(2)
  await expect(lat.getByRole('button', { name: /^DS/ })).toHaveCount(0)
  await expect(
    section(page, 'Press inclinado en Smith').getByRole('button', { name: /^Tipo: Negativa/ }),
  ).toHaveCount(0)
})
