// Criterio 1 (parte visible) y estructura de las pantallas.
import { expect, test } from '@playwright/test';
import { areasDelContrato } from './util';

test('la portada lista las áreas de areas.yaml, en orden, con su descripción', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle(/Campus personal/);
  const areas = areasDelContrato();
  expect(areas).toHaveLength(6);
  const titulos = await page.locator('.indice .area-fila h3').allInnerTexts();
  expect(titulos).toEqual(areas.map((a) => a.nombre));
  for (const a of areas) await expect(page.getByText(a.descripcion, { exact: true })).toBeVisible();
});

test('de la portada a un área y de ahí a un tema; las 5 secciones están en orden', async ({ page }) => {
  await page.goto('');
  await page.getByRole('link', { name: /Análisis de datos/ }).first().click();
  await expect(page).toHaveURL(/analisis-datos\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Análisis de datos');
  await expect(page.getByRole('link', { name: 'Repasar esta área' })).toHaveAttribute('href', /repaso\/\?area=analisis-datos/);
  // con CAMPUS_INCLUIR_EJEMPLO=1 el ejemplo es un tema más de su área
  await page.getByRole('link', { name: /Media y mediana/ }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Media y mediana');
  const ids = await page.evaluate(() => {
    const orden = ['caso-real', 'intuicion', 'formal', 'practica', 'fuentes'];
    const els = orden.map((id) => document.getElementById(id));
    const ok = els.every(Boolean) && els.every((e, i) => i === 0 || !!(els[i - 1]!.compareDocumentPosition(e!) & Node.DOCUMENT_POSITION_FOLLOWING));
    return { ok, tags: els.map((e) => e?.tagName) };
  });
  expect(ids.ok, 'las secciones #caso-real, #intuicion, #formal, #practica y #fuentes existen y van en ese orden').toBe(true);
});

test('el tema de ejemplo no se indexa, la portada no lo enlaza y su práctica está completa', async ({ page }) => {
  await page.goto('ejemplo/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
  await expect(page.locator('#practica .ficha')).toHaveCount(6);
  await expect(page.locator('#practica .ejercicio')).toHaveCount(3);
  await expect(page.locator('#practica [data-testid=caso-guardia]')).toHaveCount(1);
  await expect(page.locator('#practica .problema')).toHaveCount(2);
  await expect(page.locator('#fuentes .fuente')).toHaveCount(3);
  await page.goto('');
  await expect(page.locator('a[href$="/ejemplo/"]')).toHaveCount(0);
});

test('la navegación principal lleva a repaso, progreso, buscar y ajustes', async ({ page }) => {
  await page.goto('');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  for (const [texto, ruta] of [['Repaso', 'repaso/'], ['Progreso', 'progreso/'], ['Buscar', 'buscar/'], ['Ajustes', 'ajustes/']] as const) {
    await nav.getByRole('link', { name: new RegExp(texto) }).click();
    await expect(page).toHaveURL(new RegExp(`${ruta}$`));
    await expect(nav.getByRole('link', { name: new RegExp(texto) })).toHaveAttribute('aria-current', 'page');
  }
});

test('una ruta que no existe muestra la página 404 en criollo con enlace al inicio', async ({ page }) => {
  const r = await page.goto('no-existe/');
  expect(r?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir al inicio', exact: true })).toBeVisible();
});
