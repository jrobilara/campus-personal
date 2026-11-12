import { expect, test } from '@playwright/test';
import { abrir, control, figura, lectura, numero } from './sim-util-a';

// SimDatos sobre /ejemplo/simuladores/ (semilla 42 por defecto: los datasets son siempre los mismos).

test.setTimeout(120_000);
test.beforeEach(async ({ page }) => { await abrir(page); });

test('tickets-sucios: quitar duplicados baja las filas de 200 a 192 y quitar faltantes a 186', async ({ page }) => {
  const f = await figura(page, 'Tickets');
  await expect(lectura(f, 'filas')).toHaveText('200');
  await expect(lectura(f, 'faltantes')).toHaveText('6');
  await control(f, 'quitar-duplicados').check();
  await expect(lectura(f, 'filas')).toHaveText('192');
  await control(f, 'quitar-faltantes').check();
  await expect(lectura(f, 'filas')).toHaveText('186');
  await expect(lectura(f, 'faltantes')).toHaveText('0');
});

test('tickets-sucios: corregir unidades sube la media y marcar outliers encuentra los 2 atípicos', async ({ page }) => {
  const f = await figura(page, 'Tickets');
  const antes = await numero(f, 'media');
  await control(f, 'corregir-unidades').check();
  expect(await numero(f, 'media')).toBeGreaterThan(antes);
  await control(f, 'quitar-duplicados').check();
  await control(f, 'quitar-faltantes').check();
  await control(f, 'marcar-outliers').check();
  await expect(lectura(f, 'atipicos')).toHaveText('2');
});

test('tickets-sucios: las vistas tabla, histograma y caja cambian con los botones', async ({ page }) => {
  const f = await figura(page, 'Tickets');
  await expect(f.locator('.sd-tabla')).toBeVisible();
  await expect(f.locator('.sd-tabla tbody tr')).toHaveCount(200);
  await expect(f.locator('.sd-tabla tr.sd-dup')).toHaveCount(8);
  await control(f, 'vista-histograma').click();
  await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  await expect(f.getByTestId('sd-fuera')).toContainText('2 valores');
  await control(f, 'vista-caja').click();
  await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  await expect(control(f, 'vista-caja')).toHaveAttribute('aria-pressed', 'true');
});

test('latencias: la media queda a la derecha de la mediana y con valores extremos sube más de 200 ms', async ({ page }) => {
  const f = await figura(page, 'Latencias');
  await expect(lectura(f, 'filas')).toHaveText('500');
  const media = await numero(f, 'media');
  const mediana = await numero(f, 'mediana');
  expect(media).toBeGreaterThan(mediana);
  await control(f, 'extremos').check();
  await expect(lectura(f, 'filas')).toHaveText('505');
  expect((await numero(f, 'media')) - media).toBeGreaterThan(200);
  expect(Math.abs((await numero(f, 'mediana')) - mediana)).toBeLessThan(2);
  await expect(f.getByTestId('sd-fuera')).toBeVisible();
});

test('latencias: el slider de bins cambia la cantidad de barras', async ({ page }) => {
  const f = await figura(page, 'Latencias');
  const barras = f.locator('[data-testid="sd-grafico"] [aria-label="rect"] rect');
  await expect(barras).toHaveCount(20);
  await control(f, 'bins').fill('35');
  await expect(barras).toHaveCount(35);
  await control(f, 'vista-caja').click();
  await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  await expect(control(f, 'bins')).toHaveCount(0);
});

test('anscombe: los cuatro cuartetos dan r = 0,82 y pendiente 0,50', async ({ page }) => {
  const f = await figura(page, 'Anscombe');
  for (const q of ['I', 'II', 'III', 'IV']) {
    await control(f, 'cuarteto').selectOption(q);
    await expect(lectura(f, 'r')).toHaveText('0,82');
    await expect(lectura(f, 'pendiente')).toHaveText('0,50');
    await expect(lectura(f, 'media')).toHaveText('7,50');
    await expect(lectura(f, 'filas')).toHaveText('11');
  }
});

test('anscombe: "ver los cuatro juntos" dibuja los 44 puntos en una grilla de 2 × 2', async ({ page }) => {
  const f = await figura(page, 'Anscombe');
  await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(11);
  await control(f, 'cuatro').check();
  await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(44);
});

test('confusora-temperatura: r alto en conjunto y casi nulo dentro de cada franja de temperatura', async ({ page }) => {
  const f = await figura(page, 'Confusora');
  expect(await numero(f, 'r')).toBeGreaterThan(0.8);
  await expect(lectura(f, 'r-frio')).toHaveCount(0);
  await control(f, 'colorear').check();
  for (const franja of ['frio', 'templado', 'calor']) {
    expect(Math.abs(await numero(f, `r-${franja}`))).toBeLessThan(0.2);
  }
  expect(await numero(f, 'r')).toBeGreaterThan(0.8);
});

test('horas-y-notas: agregar un outlier suma un alumno y baja la pendiente', async ({ page }) => {
  const f = await figura(page, 'Horas y notas');
  await expect(lectura(f, 'filas')).toHaveText('60');
  const antes = await numero(f, 'pendiente');
  expect(antes).toBeGreaterThan(0.65);
  await control(f, 'outlier').check();
  await expect(lectura(f, 'filas')).toHaveText('61');
  expect(await numero(f, 'pendiente')).toBeLessThan(antes - 0.1);
});

test('ventas-mensuales: cambia de vista y cada una dibuja lo suyo', async ({ page }) => {
  const f = await figura(page, 'Ventas');
  await expect(lectura(f, 'filas')).toHaveText('72');
  await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible(); // barras
  await control(f, 'vista-torta').click();
  await expect(f.locator('.sd-torta-svg circle')).toHaveCount(3);
  await expect(f.locator('.sd-torta-ref li')).toHaveCount(3);
  await control(f, 'vista-lineas').click();
  await expect(f.locator('[data-testid="sd-grafico"] [aria-label="line"] path')).toHaveCount(3);
  await control(f, 'vista-dispersion').click();
  await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(72);
});

test('veredictos: la vista activa muestra su etiqueta y el porqué', async ({ page }) => {
  const f = await figura(page, 'Elegir el gráfico');
  await expect(f.getByTestId('sd-veredicto')).toContainText('Una torta no muestra');
  await expect(lectura(f, 'veredicto')).toHaveText('mal');
  await control(f, 'vista-lineas').click();
  await expect(lectura(f, 'veredicto')).toHaveText('bien');
  await expect(f.getByTestId('sd-veredicto')).toContainText('tendencia');
});

test('las lecturas son aria-live y usan coma decimal', async ({ page }) => {
  const f = await figura(page, 'Latencias');
  await expect(f.locator('dl.sim-lecturas')).toHaveAttribute('aria-live', 'polite');
  expect(await lectura(f, 'media').innerText()).toMatch(/^\d+,\d{2}$/);
});
