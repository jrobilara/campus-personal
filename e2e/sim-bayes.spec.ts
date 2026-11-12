import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura, numero, posLog } from './sim-util-e';

// SimBayes (SIMULADORES.md §2.5): prevalencia 1 %, sensibilidad 99 %, especificidad 95 %, 1000 personas.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test('prevalencia 1 %: vpp ≈ 16,7 % (de unos 59 positivos, unos 10 son verdaderos)', async ({ page }) => {
  const fig = await figura(page, 'Bayes');
  await expect(lectura(fig, 'vpp')).toHaveText('16,7');
  await expect(lectura(fig, 'vp')).toHaveText('10');
  const positivos = (await numero(fig, 'vp')) + (await numero(fig, 'fp'));
  expect(positivos).toBeGreaterThanOrEqual(58);
  expect(positivos).toBeLessThanOrEqual(60);
  // los cuatro conteos suman la población
  const suma = (await numero(fig, 'vp')) + (await numero(fig, 'fp')) + (await numero(fig, 'fn')) + (await numero(fig, 'vn'));
  expect(suma).toBe(1000);
  await expect(lectura(fig, 'vpn')).toHaveText('100,0');
});

test('prevalencia 50 %: vpp ≈ 95,2 %', async ({ page }) => {
  const fig = await figura(page, 'Bayes');
  await fijar(fig, 'prevalencia', Number(posLog(50, 0.1, 50)));
  await expect(lectura(fig, 'vpp')).toHaveText('95,2');
});

test('subir la especificidad al 99,9 % sube el vpp y baja los falsos positivos', async ({ page }) => {
  const fig = await figura(page, 'Bayes');
  const fp0 = await numero(fig, 'fp');
  const vpp0 = await numero(fig, 'vpp');
  await fijar(fig, 'especificidad', 99.9);
  expect(await numero(fig, 'fp')).toBeLessThan(fp0);
  expect(await numero(fig, 'vpp')).toBeGreaterThan(vpp0);
});

test('la grilla tiene 1000 puntos y se puede reordenar por resultado del test', async ({ page }) => {
  const fig = await figura(page, 'Bayes');
  await expect(fig.locator('.sb-p')).toHaveCount(1000);
  await control(fig, 'orden-test').click();
  await expect(control(fig, 'orden-test')).toHaveAttribute('aria-pressed', 'true');
  await expect(lectura(fig, 'vpp')).toHaveText('16,7'); // las lecturas no dependen del orden de los puntos
});

test('contexto "spam" con 10 000 correos: cada punto vale 10 y los conteos suman la población', async ({ page }) => {
  const fig = await figura(page, 'Spam');
  await expect(fig.locator('.sb-p')).toHaveCount(1000);
  const suma = (await numero(fig, 'vp')) + (await numero(fig, 'fp')) + (await numero(fig, 'fn')) + (await numero(fig, 'vn'));
  expect(suma).toBe(10000);
  await expect(fig).toContainText(/spam/i);
});
