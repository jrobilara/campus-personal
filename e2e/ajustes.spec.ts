import { expect, test } from '@playwright/test';

test('el tema se elige en Ajustes y se mantiene al recargar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('ajustes/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByText('Oscuro', { exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('ajustes/');
  await page.getByText('Claro', { exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('"Del sistema" sigue prefers-color-scheme, también cuando cambia', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('sin parpadeo: el tema ya está puesto antes de que cargue la hoja de estilos de la isla', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('campus:ajustes', JSON.stringify({ tema: 'oscuro', nuevasPorDia: 10 })));
  await page.goto('');
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
  const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(fondo).toBe('rgb(13, 20, 27)');
});

test('las tarjetas nuevas por día aceptan 0-50 y avisan si el valor no sirve', async ({ page }) => {
  await page.goto('ajustes/');
  const campo = page.getByRole('spinbutton');
  await campo.fill('99');
  await expect(page.getByRole('alert')).toContainText('de 0 a 50');
  await campo.fill('7');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('spinbutton')).toHaveValue('7');
});
