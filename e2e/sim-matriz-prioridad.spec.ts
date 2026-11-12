import { expect, test, type Locator, type Page } from '@playwright/test';

const URL = 'ejemplo/simuladores/';
const figura = (page: Page, titulo: string) => page.locator('figure.sim[data-testid="sim-matriz-prioridad"]', { hasText: titulo });
const lectura = (fig: Locator, clave: string) => fig.locator(`[data-lectura="${clave}"]`);
const control = (fig: Locator, clave: string) => fig.locator(`[data-control="${clave}"]`);

test.setTimeout(120_000); // astro dev + PC cargada: hidratar las islas puede tardar
test.beforeEach(async ({ page }) => { await page.goto(URL); });

/** En `astro dev` las islas client:visible tardan en hidratar: esperar a que la isla pierda el atributo `ssr`. */
async function lista(fig: Locator) {
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.locator('astro-island:not([ssr])')).toHaveCount(1, { timeout: 90_000 });
  return fig;
}

test('impacto alto y urgencia alta da P1; reclasificar mueve el ticket en la matriz', async ({ page }) => {
  const fig = await lista(figura(page, 'Mesa del lunes'));
  await expect(lectura(fig, 'prioridad-facturacion')).toHaveText('P1');
  await expect(lectura(fig, 'prioridad-impresora')).toHaveText('P4');
  await control(fig, 'impacto-impresora').selectOption('A');
  await expect(lectura(fig, 'prioridad-impresora')).toHaveText('P2');
  await control(fig, 'urgencia-impresora').selectOption('A');
  await expect(lectura(fig, 'prioridad-impresora')).toHaveText('P1');
  await control(fig, 'impacto-impresora').selectOption('B');
  await control(fig, 'urgencia-impresora').selectOption('B');
  await expect(lectura(fig, 'prioridad-impresora')).toHaveText('P5');
});

test('mesa-lunes: en orden de llegada hay SLA incumplidos; por prioridad, ninguno', async ({ page }) => {
  const fig = await lista(figura(page, 'Mesa del lunes'));
  await expect(lectura(fig, 'incumplidos')).toHaveText('0');
  await expect(lectura(fig, 'reloj')).toHaveText('00:00');
  for (let i = 0; i < 6; i++) await control(fig, 'avanzar').click();
  expect(Number(await lectura(fig, 'incumplidos').innerText())).toBeGreaterThanOrEqual(1);
  await expect(lectura(fig, 'reloj')).toHaveText('01:27');
  await expect(control(fig, 'avanzar')).toBeDisabled();

  await control(fig, 'reiniciar').click();
  await expect(lectura(fig, 'reloj')).toHaveText('00:00');
  await control(fig, 'orden-prioridad').click();
  for (let i = 0; i < 6; i++) await control(fig, 'avanzar').click();
  await expect(lectura(fig, 'incumplidos')).toHaveText('0');
  await expect(lectura(fig, 'reloj')).toHaveText('01:27');
});

test('reordenar a mano con los botones subir y bajar', async ({ page }) => {
  const fig = await lista(figura(page, 'Mesa del lunes'));
  const filas = fig.locator('ol.smp-cola > li');
  await expect(filas.first()).toContainText('impresora');
  await expect(control(fig, 'subir-impresora')).toBeDisabled();
  // llevar la facturación (3.º) al primer lugar
  await control(fig, 'subir-facturacion').click();
  await control(fig, 'subir-facturacion').click();
  await expect(filas.first()).toContainText('facturación');
  await expect(control(fig, 'subir-facturacion')).toBeDisabled();
  // con la facturación primero ya no vence: solo queda la impresora a los 22 min detrás de la VPN y la facturación
  for (let i = 0; i < 3; i++) await control(fig, 'avanzar').click();
  await expect(lectura(fig, 'reloj')).toHaveText('00:47');
  // lo ya atendido queda fijo
  await expect(control(fig, 'bajar-facturacion')).toBeDisabled();
});

test('hay botones con nombre accesible y la nota fija de la matriz', async ({ page }) => {
  const fig = await lista(figura(page, 'Mesa del lunes'));
  await expect(fig.getByText('Matriz de ejemplo; cada organización define la suya.').first()).toBeVisible();
  await expect(fig.getByRole('button', { name: /Subir en la cola: .*facturación/ })).toBeVisible();
});

test('caída parcial: 5 tickets y los dos ERP caídos son P1', async ({ page }) => {
  const fig = await lista(figura(page, 'Caída parcial'));
  await expect(fig.locator('ol.smp-cola > li')).toHaveCount(5);
  await expect(lectura(fig, 'prioridad-erp-sucursal')).toHaveText('P1');
  await expect(lectura(fig, 'prioridad-cajas-tarjeta')).toHaveText('P1');
  for (let i = 0; i < 5; i++) await control(fig, 'avanzar').click();
  expect(Number(await lectura(fig, 'incumplidos').innerText())).toBeGreaterThanOrEqual(1);
  await control(fig, 'reiniciar').click();
  await control(fig, 'orden-prioridad').click();
  for (let i = 0; i < 5; i++) await control(fig, 'avanzar').click();
  await expect(lectura(fig, 'incumplidos')).toHaveText('0');
});
