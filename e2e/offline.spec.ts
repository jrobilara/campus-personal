// Criterio 6: sin red, después de una primera visita, abren la portada y un tema ya visitado.
import { expect, test } from '@playwright/test';

test('offline: la portada y un tema visitado cargan sin red', async ({ page, context }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Acordate');
  await page.goto('ejemplo/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Media y mediana');

  // el service worker tiene que estar activo y controlando la página
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15_000 }).toBe(true);

  await context.setOffline(true);
  await page.goto('');
  await expect(page).toHaveTitle(/Campus personal/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Acordate');
  await page.goto('ejemplo/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Media y mediana');
  // las piezas que no se visitaron también quedaron guardadas (se precachea todo el sitio)
  await page.goto('progreso/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu progreso');
  await expect(page.getByTestId('panel-progreso')).toBeVisible(); // usa catalogo.json desde el caché
});

test('el manifest declara el subpath y el sitio se puede instalar', async ({ page }) => {
  await page.goto('');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/campus-personal/manifest.webmanifest');
  const m = await (await page.request.get(href!)).json();
  expect(m).toMatchObject({ name: 'Campus personal', lang: 'es', display: 'standalone', scope: '/campus-personal/', start_url: '/campus-personal/' });
});
