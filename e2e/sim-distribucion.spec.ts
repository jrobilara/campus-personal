import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura, numero } from './sim-util-e';

// SimDistribucion (SIMULADORES.md §2.3): una instancia binomial con selector de distribución, intervalo y aproximación normal.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test('binomial n = 10, p = 0,5: media 5,00 y varianza 2,50', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  await expect(lectura(fig, 'media')).toHaveText('5,00');
  await expect(lectura(fig, 'varianza')).toHaveText('2,50');
  await expect(lectura(fig, 'desvio')).toHaveText('1,58');
  // al subir n, la media se mueve: n·p
  await fijar(fig, 'n', 40);
  await expect(lectura(fig, 'media')).toHaveText('20,00');
  await expect(lectura(fig, 'varianza')).toHaveText('10,00');
});

test('poisson λ = 4: media igual a varianza, 4,00', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  await control(fig, 'distribucion').selectOption('poisson');
  await expect(lectura(fig, 'media')).toHaveText('4,00');
  await expect(lectura(fig, 'varianza')).toHaveText('4,00');
  await fijar(fig, 'lambda', 9);
  await expect(lectura(fig, 'media')).toHaveText('9,00');
  await expect(lectura(fig, 'varianza')).toHaveText('9,00');
});

test('normal μ = 0, σ = 1: P(−1 ≤ X ≤ 1) ≈ 0,6827; al subir σ la campana se ensancha y la probabilidad baja', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  await control(fig, 'distribucion').selectOption('normal');
  await expect(lectura(fig, 'media')).toHaveText('0,00');
  await expect(lectura(fig, 'desvio')).toHaveText('1,00');
  await fijar(fig, 'desde', -1);
  await fijar(fig, 'hasta', 1);
  await expect(lectura(fig, 'probabilidad-intervalo')).toHaveText('0,6827');
  const altoAntes = await fig.locator('svg [aria-label="area"], svg path').count();
  expect(altoAntes).toBeGreaterThan(0);
  await fijar(fig, 'sigma', 2);
  await expect(lectura(fig, 'desvio')).toHaveText('2,00');
  await expect(lectura(fig, 'varianza')).toHaveText('4,00');
  await expect(lectura(fig, 'probabilidad-intervalo')).toHaveText('0,3829');
});

test('exponencial λ = 1: media 1,00 y varianza 1,00', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  await control(fig, 'distribucion').selectOption('exponencial');
  await expect(lectura(fig, 'media')).toHaveText('1,00');
  await expect(lectura(fig, 'varianza')).toHaveText('1,00');
  await fijar(fig, 'lambda', 2);
  await expect(lectura(fig, 'media')).toHaveText('0,50');
  await expect(lectura(fig, 'varianza')).toHaveText('0,25');
});

test('uniforme [0, 1]: media 0,50 y varianza 0,08', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  await control(fig, 'distribucion').selectOption('uniforme');
  await expect(lectura(fig, 'media')).toHaveText('0,50');
  await expect(lectura(fig, 'varianza')).toHaveText('0,08');
});

test('binomial con la aproximación normal superpuesta: las dos probabilidades se parecen', async ({ page }) => {
  const fig = await figura(page, 'Distribución');
  const exacta = await numero(fig, 'probabilidad-intervalo');
  const aprox = await numero(fig, 'probabilidad-aproximada');
  expect(Math.abs(exacta - aprox)).toBeLessThan(0.02);
  // con n más grande la aproximación mejora o se mantiene muy cerca
  await fijar(fig, 'n', 100);
  await fijar(fig, 'desde', 40);
  await fijar(fig, 'hasta', 60);
  const e2 = await numero(fig, 'probabilidad-intervalo');
  const a2 = await numero(fig, 'probabilidad-aproximada');
  expect(Math.abs(e2 - a2)).toBeLessThan(0.02);
});

test('la figura no desborda a 320 px y los controles tienen etiqueta', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const fig = await figura(page, 'Distribución');
  expect(await fig.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  for (const input of await fig.locator('input[type="range"]').all()) {
    const id = await input.getAttribute('id');
    await expect(fig.locator(`label[for="${id}"]`)).toHaveCount(1);
  }
});
