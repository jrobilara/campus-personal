// Criterio 7: el buscador (Pagefind) funciona bajo el subpath.
import { expect, test } from '@playwright/test';

test('el buscador encuentra páginas del sitio construido y los resultados respetan el subpath', async ({ page }) => {
  const fallos: string[] = [];
  page.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/campus-personal/')) fallos.push(`${r.status()} ${r.url()}`); });
  await page.goto('buscar/');
  await page.getByRole('searchbox').fill('repaso');
  await expect(page.getByTestId('resultados')).toBeVisible();
  const links = await page.locator('[data-testid=resultados] a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
  expect(links.length).toBeGreaterThan(0);
  for (const l of links) expect(l).toMatch(/^\/campus-personal\//);
  expect(fallos).toEqual([]);
});

test('sin coincidencias, el buscador lo dice y sugiere qué probar', async ({ page }) => {
  await page.goto('buscar/');
  await page.getByRole('searchbox').fill('zzzqqqxxx');
  await expect(page.getByRole('heading', { name: /No encontré nada/ })).toBeVisible();
});

test('el índice no incluye el repaso, el progreso, los ajustes, el buscador ni el tema de ejemplo', async ({ page }) => {
  await page.goto('buscar/');
  for (const q of ['mediana', 'exportar', 'repaso', 'tarjeta', 'progreso']) {
    await page.getByRole('searchbox').fill(q);
    await expect(page.getByTestId('resultados').or(page.getByRole('heading', { name: /No encontré nada/ }))).toBeVisible();
    const links = await page.locator('[data-testid=resultados] a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
    for (const l of links) expect(l, `"${q}" no debería devolver ${l}`).not.toMatch(/\/(ejemplo|repaso|progreso|ajustes|buscar)\//);
  }
});

// se activa cuando entre el contenido de F3: el director lo destraba en F6
test.fixme('buscar "varianza" devuelve el tema que la trata (y "varianzas" también)', async ({ page }) => {
  await page.goto('buscar/');
  await page.getByRole('searchbox').fill('varianza');
  await expect(page.locator('[data-testid=resultados] a[href$="probabilidad-estadistica/variables-y-distribuciones/"]')).toBeVisible();
  await page.getByRole('searchbox').fill('varianzas');
  await expect(page.locator('[data-testid=resultados] a[href$="probabilidad-estadistica/variables-y-distribuciones/"]')).toBeVisible();
});
