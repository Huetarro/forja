import type { Page } from '@playwright/test'

/** Salta la pantalla de instalación y completa la bienvenida. */
export async function onboard(page: Page, name = 'Dani'): Promise<void> {
  await page.goto('./')
  await page.getByRole('button', { name: 'Continuar en el navegador' }).click()
  const input = page.getByLabel('¿Cómo te llamas?')
  await input.fill(name)
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByRole('heading', { name: `Hola, ${name}` }).waitFor()
}
