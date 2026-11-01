import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('primer uso: instalación, bienvenida y pestañas', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Instala Forja en tu iPhone' })).toBeVisible()
  await onboard(page, 'Lucía')

  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  for (const [tab, title] of [
    ['Calendario', 'Calendario'],
    ['Estadísticas', 'Estadísticas'],
    ['Running', 'Running'],
    ['Ajustes', 'Ajustes'],
    ['Inicio', 'Hola, Lucía'],
  ] as const) {
    await nav.getByRole('link', { name: tab }).click()
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  }
})

test('el nombre y el tema se guardan tras recargar', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.getByRole('radio', { name: 'Oscuro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible()
})

test('manifest y service worker', async ({ page, request }) => {
  const res = await request.get('manifest.webmanifest')
  expect(res.ok()).toBeTruthy()
  const manifest = (await res.json()) as { name: string; display: string; icons: unknown[] }
  expect(manifest.name).toBe('Forja')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3)
  await page.goto('./')
  const hasSW = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready
    return Boolean(reg.active)
  })
  expect(hasSW).toBe(true)
})
