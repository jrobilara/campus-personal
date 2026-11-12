// SimFlujo (SIMULADORES.md §2.8): un test por modo. Para que sean deterministas se pausa el reloj, se ajustan los
// controles, se reinicia y se adelanta con el botón (paso fijo de 50 ms, semilla 42): nada depende de sleeps.
import { expect, test, type Locator, type Page } from '@playwright/test';

const URL = 'ejemplo/simuladores/';

const escapar = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Título exacto: "Cola" no debe confundirse con "Cola de tickets" ni con la lectura "En cola" del balanceador.
const figura = (page: Page, titulo: string) =>
  page.locator('figure.sim').filter({ has: page.locator('.sim-titulo', { hasText: new RegExp(`^${escapar(titulo)}$`) }) });
const control = (fig: Locator, clave: string) => fig.locator(`[data-control="${clave}"]`);
const lectura = async (fig: Locator, clave: string) => {
  const t = (await fig.locator(`[data-lectura="${clave}"]`).textContent()) ?? '';
  return Number(t.replace(',', '.'));
};
const texto = async (fig: Locator, clave: string) => (await fig.locator(`[data-lectura="${clave}"]`).textContent()) ?? '';

/** Con `client:visible`, mientras el <astro-island> tenga `ssr` React todavía no tomó el control: hay que esperar. */
async function hidratada(fig: Locator) {
  await expect(fig).toHaveCount(1);
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.locator('astro-island[ssr]')).toHaveCount(0);
}

async function abrir(page: Page, titulo: string) {
  await page.goto(URL);
  const fig = figura(page, titulo);
  await hidratada(fig);
  await expect(control(fig, 'pausa')).toBeVisible();
  await control(fig, 'pausa').click(); // pausado: lo demás lo mueve el botón "Adelantar"
  await expect(control(fig, 'pausa')).toHaveText(/Reanudar/);
  return fig;
}
/** Reinicia con los controles actuales y adelanta `veces` × 10 s de tiempo simulado. */
async function correr(fig: Locator, veces: number) {
  await control(fig, 'reiniciar').click();
  for (let i = 0; i < veces; i++) await control(fig, 'adelantar').click();
}
const adelantar = async (fig: Locator, veces: number) => {
  for (let i = 0; i < veces; i++) await control(fig, 'adelantar').click();
};
/** Posición del slider logarítmico (0..1000) para un valor entre min y max. */
const posLog = (v: number, min: number, max: number) => String(Math.round((Math.log(v / min) / Math.log(max / min)) * 1000));

test.describe('SimFlujo · balanceador', () => {
  test('si llega más de lo que atienden los servidores, las colas crecen y el p95 sube', async ({ page }) => {
    const fig = await abrir(page, 'Balanceador');
    await control(fig, 'cache').uncheck();
    await control(fig, 'tasa-llegada').fill('50'); // 3 servidores × 10 = 30 pedidos/s
    await correr(fig, 1);
    const p95a = await lectura(fig, 'latencia-p95');
    const colaA = await lectura(fig, 'en-cola');
    await adelantar(fig, 1);
    const p95b = await lectura(fig, 'latencia-p95');
    const colaB = await lectura(fig, 'en-cola');
    expect(colaB).toBeGreaterThan(colaA);
    expect(p95b).toBeGreaterThan(p95a);
    expect(await lectura(fig, 'utilizacion')).toBeGreaterThanOrEqual(95);
    await expect(fig.locator('.sfl-capacidad')).toContainText('las colas van a crecer');
  });

  test('prender la caché al 80 % baja la utilización', async ({ page }) => {
    const fig = await abrir(page, 'Balanceador');
    await control(fig, 'cache').uncheck();
    await correr(fig, 2);
    const sin = await lectura(fig, 'utilizacion');
    await control(fig, 'cache').check();
    await control(fig, 'acierto-cache').fill('0.8');
    await correr(fig, 2);
    const con = await lectura(fig, 'utilizacion');
    expect(con).toBeLessThan(sin * 0.5);
    const aciertos = await lectura(fig, 'aciertos-cache');
    expect(aciertos).toBeGreaterThan(70);
    expect(aciertos).toBeLessThan(90);
  });

  test('con un servidor lento, menos-conexiones tiene mejor p95 que round-robin', async ({ page }) => {
    const fig = await abrir(page, 'Balanceador');
    await control(fig, 'cache').uncheck();
    await control(fig, 'servidor-lento').check();
    await control(fig, 'algoritmo').selectOption('round-robin');
    await correr(fig, 3);
    const rr = await lectura(fig, 'latencia-p95');
    await control(fig, 'algoritmo').selectOption('menos-conexiones');
    await correr(fig, 3);
    const mc = await lectura(fig, 'latencia-p95');
    expect(mc).toBeLessThan(rr / 2);
  });

  test('tirar un servidor lo deja caído y el botón de levantar vuelve a andar', async ({ page }) => {
    const fig = await abrir(page, 'Balanceador');
    await expect(control(fig, 'levantar-servidores')).toBeDisabled();
    await control(fig, 'tirar-servidor').click();
    await expect(fig.locator('.sfl-srv.caido')).toHaveCount(1);
    await expect(control(fig, 'levantar-servidores')).toBeEnabled();
    await control(fig, 'levantar-servidores').click();
    await expect(fig.locator('.sfl-srv.caido')).toHaveCount(0);
  });

  test('pausar y reanudar cambia el botón', async ({ page }) => {
    await page.goto(URL);
    const fig = figura(page, 'Balanceador');
    await hidratada(fig);
    await expect(control(fig, 'pausa')).toHaveText(/Pausar/);
    await control(fig, 'pausa').click();
    await expect(control(fig, 'pausa')).toHaveText(/Reanudar/);
    await control(fig, 'pausa').click();
    await expect(control(fig, 'pausa')).toHaveText(/Pausar/);
  });
});

test.describe('SimFlujo · cola', () => {
  test('si la llegada supera lo que procesan los consumidores la cola crece; al sumar consumidores se vacía', async ({ page }) => {
    const fig = await abrir(page, 'Cola');
    await correr(fig, 2); // 5 mensajes/s contra 2 consumidores de 0,5 s (4 por segundo)
    const crecida = await lectura(fig, 'en-cola');
    expect(crecida).toBeGreaterThan(8);
    await control(fig, 'consumidores').fill('6');
    await adelantar(fig, 2);
    expect(await lectura(fig, 'en-cola')).toBeLessThan(5);
  });

  test('con un consumidor caído no se pierde nada: se acumula y se drena al volver', async ({ page }) => {
    const fig = await abrir(page, 'Cola');
    await control(fig, 'tasa-llegada').fill('2');
    await control(fig, 'consumidores').fill('2');
    await control(fig, 'tiempo-proceso').fill('0.8');
    await correr(fig, 1);
    await control(fig, 'consumidor-caido').check();
    await adelantar(fig, 4); // 40 s con un solo consumidor (1,25/s) contra 2 llegadas por segundo
    const acumulado = await lectura(fig, 'en-cola');
    expect(acumulado).toBeGreaterThan(8);
    expect(await lectura(fig, 'perdidos')).toBe(0);
    await control(fig, 'consumidor-caido').uncheck();
    await adelantar(fig, 8); // con los dos consumidores (2,5/s) se drena de a 0,5 por segundo
    expect(await lectura(fig, 'en-cola')).toBeLessThan(acumulado / 3);
    expect(await lectura(fig, 'perdidos')).toBe(0);
  });

  test('si la cola se llena, se cuentan los perdidos', async ({ page }) => {
    const fig = await abrir(page, 'Cola');
    await control(fig, 'tasa-llegada').fill('30');
    await correr(fig, 3);
    expect(await lectura(fig, 'en-cola')).toBeLessThanOrEqual(50);
    expect(await lectura(fig, 'perdidos')).toBeGreaterThan(50);
  });

  test('tickets: con 40 % resuelto con la base de conocimiento la espera media baja, y se cuentan los fuera de SLA', async ({ page }) => {
    const fig = await abrir(page, 'Cola de tickets');
    await expect(fig.locator('[data-lectura="fuera-de-sla"]')).toBeVisible();
    await correr(fig, 8);
    const sin = await lectura(fig, 'espera-media');
    await control(fig, 'kb').fill('40');
    await correr(fig, 8);
    const con = await lectura(fig, 'espera-media');
    expect(con).toBeLessThan(sin);
    await control(fig, 'kb').fill('0');
    await control(fig, 'tasa-llegada').fill('9'); // 9 tickets/h contra 2 técnicos de 20 min (6 por hora)
    await correr(fig, 8);
    expect(await lectura(fig, 'fuera-de-sla')).toBeGreaterThan(0);
    await expect(fig.locator('[data-lectura="espera-media"] + .u')).toHaveText('min');
  });
});

test.describe('SimFlujo · síncrono vs asíncrono', () => {
  test('al subir la latencia de B, la espera síncrona sube igual y la asíncrona no', async ({ page }) => {
    const fig = await abrir(page, 'Síncrono vs asíncrono');
    await correr(fig, 1);
    const s0 = await lectura(fig, 'espera-cliente-sinc');
    const a0 = await lectura(fig, 'espera-cliente-asinc');
    await control(fig, 'latencia-b').fill(posLog(1000, 50, 3000));
    await correr(fig, 2);
    const s1 = await lectura(fig, 'espera-cliente-sinc');
    const a1 = await lectura(fig, 'espera-cliente-asinc');
    expect(s1 - s0).toBeGreaterThan(600);
    expect(Math.abs(a1 - a0)).toBeLessThan(1);
  });

  test('con B caído, el síncrono acumula errores y el asíncrono pendientes, que bajan a 0 cuando B vuelve', async ({ page }) => {
    const fig = await abrir(page, 'Síncrono vs asíncrono');
    await correr(fig, 1);
    expect(await lectura(fig, 'errores-sinc')).toBe(0);
    await control(fig, 'b-caido').check();
    await adelantar(fig, 2);
    expect(await lectura(fig, 'errores-sinc')).toBeGreaterThanOrEqual(3);
    expect(await lectura(fig, 'pendientes-asinc')).toBeGreaterThanOrEqual(10);
    await control(fig, 'b-caido').uncheck();
    await adelantar(fig, 5);
    expect(await lectura(fig, 'pendientes-asinc')).toBe(0);
  });
});

test.describe('SimFlujo · cadena', () => {
  test('con 5 saltos de 99,9 % la disponibilidad compuesta es 99,50 % y cada salto suma latencia', async ({ page }) => {
    await page.goto(URL);
    const fig = figura(page, 'Cadena');
    await hidratada(fig);
    await control(fig, 'saltos').fill('5');
    await control(fig, 'disponibilidad').fill('3'); // tres nueves: 99,9 %
    expect(await texto(fig, 'disponibilidad-compuesta')).toBe('99,50');
    expect(await texto(fig, 'latencia-total')).toBe('100'); // 5 × 20 ms
    await control(fig, 'latencia-por-salto').fill('30');
    expect(await texto(fig, 'latencia-total')).toBe('150');
    await control(fig, 'saltos').fill('6');
    expect(await texto(fig, 'latencia-total')).toBe('180');
  });

  test('el monolito es un solo salto en memoria de 1 ms', async ({ page }) => {
    await page.goto(URL);
    const fig = figura(page, 'Cadena');
    await hidratada(fig);
    await control(fig, 'monolito').check();
    expect(await texto(fig, 'latencia-total')).toBe('1');
    expect(await texto(fig, 'disponibilidad-compuesta')).toBe('99,90');
  });
});

test('con movimiento reducido las lecturas siguen funcionando y no hay errores en consola', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  const fig = await abrir(page, 'Cola');
  await control(fig, 'tasa-llegada').fill('30'); // 30 mensajes/s contra 4 por segundo: la cola crece sí o sí
  await correr(fig, 1);
  expect(await lectura(fig, 'en-cola')).toBeGreaterThan(0);
  expect(errores).toEqual([]);
  await ctx.close();
});
