import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura } from './sim-util-e';

// SimTransformacion2D (SIMULADORES.md §2.2). Las lecturas salen de la matriz de destino, no de la animación del preset.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test('identidad: det 1,00, orientación se mantiene', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await expect(lectura(fig, 'det')).toHaveText('1,00');
  await expect(lectura(fig, 'orientacion')).toHaveText('se mantiene');
  await expect(lectura(fig, 'av')).toHaveText('(1,00; 1,00)');
});

test('proyección: det 0,00 y la orientación colapsa', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await control(fig, 'preset-proyeccion').click();
  await expect(lectura(fig, 'det')).toHaveText('0,00');
  await expect(lectura(fig, 'area')).toHaveText('0,00');
  await expect(lectura(fig, 'orientacion')).toHaveText('colapsa');
  await expect(lectura(fig, 'av')).toHaveText('(1,00; 0,00)');
});

test('rotación de 90°: área 1,00 y no se deforma; Av = (−1; 1) para v = (1; 1)', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await control(fig, 'preset-rotacion-90').click();
  await expect(lectura(fig, 'area')).toHaveText('1,00');
  await expect(lectura(fig, 'det')).toHaveText('1,00');
  await expect(lectura(fig, 'orientacion')).toHaveText('se mantiene');
  await expect(lectura(fig, 'av')).toHaveText('(-1,00; 1,00)');
  await expect(lectura(fig, 'autovalores')).toHaveText('complejos');
});

test('reflexión: la orientación se invierte', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await control(fig, 'preset-reflexion').click();
  await expect(lectura(fig, 'orientacion')).toHaveText('se invierte');
  await expect(lectura(fig, 'det')).toHaveText('-1,00');
  await expect(lectura(fig, 'area')).toHaveText('1,00');
});

test('escala y cizalla: sus determinantes y autovalores', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await control(fig, 'preset-escala').click();
  await expect(lectura(fig, 'det')).toHaveText('1,00'); // 2 · 0,5
  await expect(lectura(fig, 'autovalores')).toHaveText('2,00; 0,50');
  await control(fig, 'preset-cizalla').click();
  await expect(lectura(fig, 'det')).toHaveText('1,00');
  await expect(lectura(fig, 'autovalores')).toHaveText('1,00; 1,00');
});

test('los sliders a, b, c, d editan la matriz: a = 2 duplica el área; b y c cruzados la invierten', async ({ page }) => {
  const fig = await figura(page, 'Transformación');
  await fijar(fig, 'a', 2);
  await expect(lectura(fig, 'det')).toHaveText('2,00');
  await expect(lectura(fig, 'area')).toHaveText('2,00');
  await fijar(fig, 'a', 0);
  await fijar(fig, 'd', 0);
  await fijar(fig, 'b', 1);
  await fijar(fig, 'c', 1);
  await expect(lectura(fig, 'det')).toHaveText('-1,00');
  await expect(lectura(fig, 'orientacion')).toHaveText('se invierte');
  await expect(lectura(fig, 'av')).toHaveText('(1,00; 1,00)'); // intercambia las coordenadas de (1; 1)
});

test('autovectores en "escala": un v sobre el eje x queda sobre el eje x después de aplicar A', async ({ page }) => {
  const fig = await figura(page, 'Autovectores sobre el eje');
  await expect(lectura(fig, 'av')).toHaveText('(2,00; 0,00)');
  await expect(lectura(fig, 'autovalores')).toHaveText('2,00; 0,50');
  await expect(fig.locator('.MafsView svg')).toBeVisible();
  // las dos rectas punteadas de autovectores están dibujadas
  await expect(fig.getByText(/λ = 2,00/)).toBeVisible();
  await expect(fig.getByText(/λ = 0,50/)).toBeVisible();
});

test('sin editable no hay sliders; a 320 px no hay desborde', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const fija = await figura(page, 'Autovectores sobre el eje');
  await expect(fija.locator('input[type="range"]')).toHaveCount(0);
  const editable = await figura(page, 'Transformación');
  await expect(editable.locator('input[type="range"]')).toHaveCount(4);
  for (const f of [fija, editable]) expect(await f.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});
