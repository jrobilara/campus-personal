import { expect, test, type Locator, type Page } from '@playwright/test';

// SimGrafo: un test por modo, sobre la página de pruebas. Todo determinista (semilla 42) y sin esperas por tiempo,
// salvo el modo "Auto" del recorrido, que se controla con page.clock.
const URL = 'ejemplo/simuladores/';

const figura = (page: Page, titulo: string) => page.locator('figure.sim[data-testid="sim-grafo"]', { hasText: titulo });
const lectura = (fig: Locator, clave: string) => fig.locator(`[data-lectura="${clave}"]`);
const nodo = (fig: Locator, id: string) => fig.locator(`[data-nodo="${id}"]`);
const boton = (fig: Locator, clave: string) => fig.locator(`[data-control="${clave}"]`);

test.setTimeout(120_000); // astro dev + PC cargada: hidratar las islas puede tardar
test.beforeEach(async ({ page }) => { await page.goto(URL); });

/** En `astro dev` las islas client:visible tardan en hidratar: esperar a que la isla pierda el atributo `ssr`. */
async function lista(fig: Locator) {
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.locator('astro-island:not([ssr])')).toHaveCount(1, { timeout: 90_000 });
  return fig;
}

test.describe('recorrido', () => {
  test('BFS visita por niveles y vacía la cola; DFS cambia el orden', async ({ page }) => {
    const fig = await lista(figura(page, 'Recorrido'));
    await fig.scrollIntoViewIfNeeded();
    await expect(lectura(fig, 'orden-visita')).toHaveText('—');
    await expect(lectura(fig, 'en-frontera')).toHaveText('Centro');
    await boton(fig, 'paso').click();
    await expect(lectura(fig, 'orden-visita')).toHaveText('Centro');
    await expect(lectura(fig, 'en-frontera')).toHaveText('Puerto, Norte, Oeste, Mercado, Sur');
    for (let i = 0; i < 7; i++) await boton(fig, 'paso').click();
    await expect(lectura(fig, 'en-frontera')).toHaveText('—');
    const bfs = await lectura(fig, 'orden-visita').innerText();
    expect(bfs.split(', ')).toHaveLength(8);
    await expect(boton(fig, 'paso')).toBeDisabled();

    await boton(fig, 'tipo').selectOption('dfs');
    await expect(lectura(fig, 'orden-visita')).toHaveText('—');
    for (let i = 0; i < 8; i++) await boton(fig, 'paso').click();
    const dfs = await lectura(fig, 'orden-visita').innerText();
    expect(dfs.split(', ')).toHaveLength(8);
    expect(dfs).not.toBe(bfs);
    expect(dfs.startsWith('Centro, Puerto, Norte')).toBe(true);
  });

  test('el nodo inicial se elige con clic o con teclado (Enter)', async ({ page }) => {
    const fig = await lista(figura(page, 'Recorrido'));
    await nodo(fig, 'sur').click();
    await expect(lectura(fig, 'en-frontera')).toHaveText('Sur');
    await nodo(fig, 'norte').focus();
    await page.keyboard.press('Enter');
    await expect(lectura(fig, 'en-frontera')).toHaveText('Norte');
    await expect(nodo(fig, 'norte')).toHaveAttribute('role', 'button');
    await expect(nodo(fig, 'norte')).toHaveAttribute('tabindex', '0');
  });

  test('Auto avanza solo con el reloj y se detiene al terminar', async ({ page }) => {
    const fig = await lista(figura(page, 'Recorrido'));
    await page.clock.install();
    await boton(fig, 'auto').click();
    await page.clock.runFor(2000);
    const parcial = (await lectura(fig, 'orden-visita').innerText()).split(', ').length;
    expect(parcial).toBeGreaterThan(1);
    await page.clock.runFor(12000);
    expect((await lectura(fig, 'orden-visita').innerText()).split(', ')).toHaveLength(8);
    await expect(boton(fig, 'auto')).toHaveText('Auto');
  });
});

test('camino mínimo: Dijkstra y el tráfico en la avenida central', async ({ page }) => {
  const fig = await lista(figura(page, 'Camino mínimo'));
  await expect(lectura(fig, 'costo')).toHaveText('18');
  await expect(lectura(fig, 'camino')).toHaveText('Oeste → Centro → Mercado → Colinas');
  await boton(fig, 'trafico').fill('5');
  await expect(lectura(fig, 'costo')).toHaveText('25');
  await expect(lectura(fig, 'camino')).toHaveText('Oeste → Sur → Mercado → Colinas');
  await boton(fig, 'trafico').fill('1');
  await expect(lectura(fig, 'camino')).toContainText('Centro');
  // elegir otro destino: el primer clic fija el origen y el segundo el destino
  await nodo(fig, 'puerto').click();
  await nodo(fig, 'sur').click();
  await expect(lectura(fig, 'camino')).toHaveText('Puerto → Centro → Sur');
  await expect(lectura(fig, 'costo')).toHaveText('15');
  // paso a paso: el resultado no cambia, solo se ve la exploración
  await boton(fig, 'paso').click();
  await expect(lectura(fig, 'costo')).toHaveText('15');
  await boton(fig, 'resultado').click();
  await expect(boton(fig, 'resultado')).toBeDisabled();
});

test('orden topológico: nunca antes de sus dependencias', async ({ page }) => {
  const fig = await lista(figura(page, 'Orden topológico'));
  await expect(lectura(fig, 'disponibles')).toHaveText('libc');
  await expect(lectura(fig, 'orden')).toHaveText('—');
  // un paquete bloqueado no se instala
  await nodo(fig, 'app').click();
  await expect(lectura(fig, 'orden')).toHaveText('—');
  await expect(fig.getByRole('status')).toContainText('todavía no se puede instalar');
  await boton(fig, 'paso').click();
  await expect(lectura(fig, 'orden')).toHaveText('libc');
  await expect(lectura(fig, 'disponibles')).toHaveText('zlib, openssl');
  // el usuario elige: openssl antes que zlib
  await nodo(fig, 'openssl').click();
  await expect(lectura(fig, 'orden')).toHaveText('libc, openssl');
  for (let i = 0; i < 6; i++) await boton(fig, 'paso').click();
  const orden = (await lectura(fig, 'orden').innerText()).split(', ');
  expect(orden).toHaveLength(8);
  expect(orden[0]).toBe('libc');
  expect(orden.at(-1)).toBe('app');
  expect(orden.indexOf('python')).toBeGreaterThan(orden.indexOf('zlib'));
  expect(orden.indexOf('requests')).toBeGreaterThan(orden.indexOf('curl'));
  await expect(lectura(fig, 'disponibles')).toHaveText('—');
});

test('propagar falla: con timeouts y circuit breaker la falla no sube hasta el gateway', async ({ page }) => {
  const fig = await lista(figura(page, 'Propagar falla'));
  await expect(lectura(fig, 'gateway')).toHaveText('ok');
  await nodo(fig, 'antifraude').click();
  // sin protección, la falla sube: antifraude, pagos y gateway
  await expect(lectura(fig, 'caidos')).toHaveText('3');
  await expect(lectura(fig, 'degradados')).toHaveText('0');
  await expect(lectura(fig, 'gateway')).toHaveText('caído');
  await boton(fig, 'proteccion').check();
  await expect(lectura(fig, 'caidos')).toHaveText('1');
  await expect(lectura(fig, 'degradados')).toHaveText('1');
  await expect(lectura(fig, 'gateway')).toHaveText('ok');
  await expect(nodo(fig, 'pagos')).toHaveAttribute('aria-label', /degradado/);
  // tirar pagos deja al gateway degradado
  await nodo(fig, 'pagos').click();
  await expect(lectura(fig, 'gateway')).toHaveText('degradado');
  await boton(fig, 'levantar').click();
  await expect(lectura(fig, 'caidos')).toHaveText('0');
  await expect(lectura(fig, 'gateway')).toHaveText('ok');
});

test('buscar falla: probando siempre en la mitad se encuentra en 3 pruebas o menos', async ({ page }) => {
  const fig = await lista(figura(page, 'Buscar falla'));
  await expect(lectura(fig, 'minimo-teorico')).toHaveText('3');
  await expect(lectura(fig, 'pruebas')).toHaveText('0');
  await expect(lectura(fig, 'encontrada')).toHaveText('no');
  for (let intento = 0; intento < 3; intento++) {
    for (let i = 0; i < 3 && (await lectura(fig, 'encontrada').innerText()) === 'no'; i++) await boton(fig, 'mitad').click();
    await expect(lectura(fig, 'encontrada')).toHaveText('sí');
    expect(Number(await lectura(fig, 'pruebas').innerText())).toBeLessThanOrEqual(3);
    await boton(fig, 'nueva-falla').click();
    await expect(lectura(fig, 'pruebas')).toHaveText('0');
    await expect(lectura(fig, 'encontrada')).toHaveText('no');
  }
});

test('buscar falla: probar a mano en un nodo cuenta una prueba y avisa si la señal llega', async ({ page }) => {
  const fig = await lista(figura(page, 'Buscar falla'));
  await nodo(fig, 'switch').click();
  await expect(lectura(fig, 'pruebas')).toHaveText('1');
  await expect(fig.getByRole('status')).toContainText(/La señal (no )?llega/);
});
