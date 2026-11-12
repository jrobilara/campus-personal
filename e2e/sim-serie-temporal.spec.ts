import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura, numero } from './sim-util-e';

// SimSerieTemporal (SIMULADORES.md §2.10): alertas sobre cuatro escenarios y respaldos con RPO/RTO.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test.describe('alertas', () => {
  test('pico-breve: con umbral 90 y duración 0 hay 1 alerta; con duración de 5 min, ninguna', async ({ page }) => {
    const fig = await figura(page, 'Pico breve');
    await expect(lectura(fig, 'alertas')).toHaveText('1');
    await expect(lectura(fig, 'minutos-en-alerta')).toHaveText('3');
    await expect(lectura(fig, 'primer-aviso')).toHaveText('10:30');
    await fijar(fig, 'duracion', 5);
    await expect(lectura(fig, 'alertas')).toHaveText('0');
    await expect(lectura(fig, 'primer-aviso')).toHaveText('—');
  });

  test('disco-llenandose: la alerta predictiva avisa con 3 h o más; el umbral en 95 % avisa con 1 h (hora 21)', async ({ page }) => {
    const fig = await figura(page, 'Disco');
    await fijar(fig, 'umbral', 95);
    await expect(lectura(fig, 'primer-aviso')).toHaveText('21:00');
    await expect(lectura(fig, 'horas-de-anticipacion')).toHaveText('1,0');
    await control(fig, 'predictiva').check();
    expect(await numero(fig, 'horas-de-anticipacion')).toBeGreaterThanOrEqual(3);
  });

  test('carga-sostenida: el promedio de 15 min es más calmo que el de 1 min ante los picos', async ({ page }) => {
    const fig = await figura(page, 'Carga');
    await expect(fig.locator('[data-control="metrica"]')).toBeVisible();
    await expect(lectura(fig, 'alertas')).toBeVisible();
    const alertas1 = await numero(fig, 'alertas');
    await control(fig, 'metrica').selectOption({ index: 2 });
    const alertas15 = await numero(fig, 'alertas');
    expect(alertas15).toBeLessThanOrEqual(alertas1);
  });

  test('carga-sostenida: la leyenda distingue las curvas de 1, 5 y 15 min', async ({ page }) => {
    const fig = await figura(page, 'Carga');
    const leyenda = fig.locator('.sim-leyenda');
    for (const t of ['Load 1 min', 'Load 5 min', 'Load 15 min']) await expect(leyenda.getByText(t)).toBeVisible();
    // cada curva tiene su trazo (de puntos, continuo, de guiones) y el que vigila la alerta se marca
    await expect(leyenda.locator('.sim-trazo')).toHaveCount(3);
    await expect(leyenda.getByText('Load 5 min (vigilado)')).toBeVisible();
    await control(fig, 'metrica').selectOption({ index: 2 });
    await expect(leyenda.getByText('Load 15 min (vigilado)')).toBeVisible();
  });

  test('fuga-memoria: sube hasta el reinicio y el umbral dispara una vez', async ({ page }) => {
    const fig = await figura(page, 'Memoria');
    await expect(lectura(fig, 'alertas')).toBeVisible();
    expect(await numero(fig, 'alertas')).toBeGreaterThanOrEqual(1);
    expect(await numero(fig, 'minutos-en-alerta')).toBeGreaterThan(0);
  });
});

test.describe('respaldo', () => {
  test('cada 24 h y el incidente 23 h después del respaldo: RPO 23,0 y no cumple contra 4 h', async ({ page }) => {
    const fig = await figura(page, 'Respaldo');
    await expect(lectura(fig, 'rpo-real-horas')).toHaveText('23,0');
    await expect(lectura(fig, 'cumple-rpo')).toHaveText('no');
    await expect(lectura(fig, 'rto-real-horas')).toHaveText('3,0');
    await expect(fig.locator('[data-testid="nota-rto"]')).toHaveCount(0); // probado: sin intento fallido
  });

  test('con respaldo cada 4 h el RPO se cumple', async ({ page }) => {
    const fig = await figura(page, 'Respaldo');
    await fijar(fig, 'frecuencia', 4);
    await expect(lectura(fig, 'cumple-rpo')).toHaveText('sí');
    expect(await numero(fig, 'rpo-real-horas')).toBeLessThanOrEqual(4);
  });

  test('con respaldoProbado apagado la pérdida salta un respaldo atrás (suma la frecuencia)', async ({ page }) => {
    const fig = await figura(page, 'Respaldo');
    await control(fig, 'probado').uncheck();
    await expect(lectura(fig, 'rpo-real-horas')).toHaveText('47,0'); // 23 + 24
    await expect(lectura(fig, 'cumple-rpo')).toHaveText('no');
  });

  test('con respaldoProbado apagado el RTO suma el intento fallido: 2 × la duración de la restauración', async ({ page }) => {
    const fig = await figura(page, 'Respaldo');
    await fijar(fig, 'restauracion', 1);
    await expect(lectura(fig, 'rto-real-horas')).toHaveText('1,0');
    await expect(lectura(fig, 'cumple-rto')).toHaveText('sí'); // objetivo de 2 h
    await control(fig, 'probado').uncheck();
    await expect(lectura(fig, 'rto-real-horas')).toHaveText('2,0');
    await expect(lectura(fig, 'cumple-rto')).toHaveText('sí');
    await fijar(fig, 'restauracion', 1.5);
    await expect(lectura(fig, 'rto-real-horas')).toHaveText('3,0');
    await expect(lectura(fig, 'cumple-rto')).toHaveText('no');
    // el gráfico rotula los dos tramos y la nota explica la suma
    const grafico = fig.locator('[data-testid="grafico-respaldo"]');
    await expect(grafico.getByText('intento fallido')).toBeVisible();
    await expect(grafico.getByText('restauración del anterior')).toBeVisible();
    await expect(fig.locator('[data-testid="nota-rto"]')).toContainText('suma dos tramos');
    // al volver a probado, vuelve el RTO simple y desaparece la nota
    await control(fig, 'probado').check();
    await expect(lectura(fig, 'rto-real-horas')).toHaveText('1,5');
    await expect(fig.locator('[data-testid="nota-rto"]')).toHaveCount(0);
  });

  test('a 390 px el gráfico y la nota no desbordan', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const fig = await figura(page, 'Respaldo');
    await control(fig, 'probado').uncheck();
    expect(await fig.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await expect(fig.locator('[data-testid="nota-rto"]')).toBeVisible();
  });
});

test.describe('a 390 px', () => {
  test.use({ viewport: { width: 390, height: 800 } });
  test('la etiqueta "24:00" del eje no queda cortada', async ({ page }) => {
    await abrir(page);
    const fig = await figura(page, 'Carga');
    const svg = fig.locator('[data-testid="grafico-alertas"] svg').first();
    await expect(svg).toBeVisible();
    const marco = (await svg.boundingBox())!;
    const etiqueta = (await svg.getByText('24:00').first().boundingBox())!;
    expect(etiqueta.x + etiqueta.width, 'la etiqueta se sale del SVG por la derecha').toBeLessThanOrEqual(marco.x + marco.width);
  });
});
