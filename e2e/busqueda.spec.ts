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
  await page.getByRole('searchbox').fill('kwxjkvbnm');
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

// criterio 7 del SPEC: con el contenido real de F3 (destrabado en F6a)
test('buscar "varianza" devuelve el tema que la trata (y "varianzas" también)', async ({ page }) => {
  await page.goto('buscar/');
  await page.getByRole('searchbox').fill('varianza');
  await expect(page.locator('[data-testid=resultados] a[href$="probabilidad-estadistica/variables-y-distribuciones/"]')).toBeVisible();
  await page.getByRole('searchbox').fill('varianzas');
  await expect(page.locator('[data-testid=resultados] a[href$="probabilidad-estadistica/variables-y-distribuciones/"]')).toBeVisible();
});

// El texto duplicado de KaTeX (MathML oculto + anotación con el LaTeX fuente) no entra al índice. Pagefind también encuentra por prefijo
// ("zzz" cae en palabras que empiezan con "z"), así que no alcanza con mirar si hay resultados: se mira que ningún extracto traiga
// el LaTeX fuente ni la "zzz" que salía de pegar el z de la fórmula con su copia MathML y su anotación.
test('las fórmulas no ensucian el índice: ningún resultado trae LaTeX fuente ni la fórmula triplicada', async ({ page }) => {
  await page.goto('buscar/');
  for (const q of ['zzz', 'frac', 'operatorname', 'mid', 'binom']) {
    await page.getByRole('searchbox').fill(q);
    await expect(page.getByTestId('resultados').or(page.getByRole('heading', { name: /No encontré nada/ }))).toBeVisible();
    await page.waitForTimeout(700); // el buscador espera 150 ms y después consulta el índice: evita leer los resultados de la consulta anterior
    const texto = (await page.locator('[data-testid=resultados]').allInnerTexts()).join('\n');
    expect(texto, `"${q}" devolvió LaTeX fuente`).not.toMatch(/\\(frac|operatorname|mid|sum|sqrt|binom|left|right|cdot)\b/);
    expect(texto, `"${q}" devolvió una fórmula triplicada`).not.toMatch(/zzz/i);
  }
  // y el buscador sigue funcionando con texto normal
  await page.getByRole('searchbox').fill('varianza');
  await expect(page.locator('[data-testid=resultados] a[href$="probabilidad-estadistica/variables-y-distribuciones/"]')).toBeVisible();
});
