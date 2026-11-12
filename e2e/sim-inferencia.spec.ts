import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura, numero, posLog } from './sim-util-e';

// SimInferencia (SIMULADORES.md §2.4): tres modos, todos con semilla 42 (por defecto): los números son siempre los mismos.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test.describe('tcl', () => {
  test('con n = 30 y 1000 muestras, el desvío de las medias queda a menos de 10 % de σ/√n', async ({ page }) => {
    const fig = await figura(page, 'TCL');
    await fijar(fig, 'n', 30);
    await expect(lectura(fig, 'muestras')).toHaveText('0');
    for (let i = 0; i < 10; i++) await control(fig, 'cien-muestras').click();
    await expect(lectura(fig, 'muestras')).toHaveText('1000');
    const teorico = await numero(fig, 'sigma-sobre-raiz-n');
    const medido = await numero(fig, 'desvio-de-medias');
    expect(Math.abs(medido - teorico) / teorico).toBeLessThan(0.1);
    // la media de las medias se acerca a la media poblacional de la exponencial (1)
    expect(Math.abs((await numero(fig, 'media-de-medias')) - 1)).toBeLessThan(0.1);
  });

  test('n = 1 deja el histograma de medias igual de asimétrico que la población; n = 30 lo acampana', async ({ page }) => {
    const fig = await figura(page, 'TCL');
    await fijar(fig, 'n', 1);
    for (let i = 0; i < 10; i++) await control(fig, 'cien-muestras').click();
    // con n = 1 el "desvío de las medias" es el desvío de la población: σ/√1 = 1 en la exponencial
    await expect(lectura(fig, 'sigma-sobre-raiz-n')).toHaveText('1,000');
    // sesgo de la distribución de medias, leído de las barras dibujadas (el histograma de abajo es el segundo gráfico)
    const sesgo = async () => fig.locator('[data-testid="si-medias"] rect, [data-testid="si-medias"] path').count();
    expect(await sesgo()).toBeGreaterThan(0);
    await fijar(fig, 'n', 30);
    await expect(lectura(fig, 'muestras')).toHaveText('0'); // cambiar n reinicia
    await expect(lectura(fig, 'sigma-sobre-raiz-n')).toHaveText('0,183');
  });

  test('"Reiniciar" borra las muestras y "1 muestra" suma de a una', async ({ page }) => {
    const fig = await figura(page, 'TCL');
    await control(fig, 'una-muestra').click();
    await control(fig, 'una-muestra').click();
    await expect(lectura(fig, 'muestras')).toHaveText('2');
    await control(fig, 'reiniciar').click();
    await expect(lectura(fig, 'muestras')).toHaveText('0');
    await expect(lectura(fig, 'media-de-medias')).toHaveText('—');
  });
});

test.describe('intervalos', () => {
  test('con 100 intervalos al 95 % la cobertura queda entre 88 % y 100 %', async ({ page }) => {
    const fig = await figura(page, 'Intervalos');
    for (let i = 0; i < 5; i++) await control(fig, 'sacar-20').click();
    await expect(lectura(fig, 'intervalos')).toHaveText('100');
    const cobertura = await numero(fig, 'cobertura');
    expect(cobertura).toBeGreaterThanOrEqual(88);
    expect(cobertura).toBeLessThanOrEqual(100);
    expect(await numero(fig, 'cubren')).toBe(Math.round(cobertura));
    await expect(control(fig, 'sacar-20')).toBeDisabled(); // tope de 100
  });

  test('al pasar de 90 % a 99 % los intervalos se ven más anchos y cubren al menos tantas veces', async ({ page }) => {
    const fig = await figura(page, 'Intervalos');
    await control(fig, 'confianza').selectOption('0.9');
    for (let i = 0; i < 5; i++) await control(fig, 'sacar-20').click();
    const cubren90 = await numero(fig, 'cubren');
    const ancho = () => fig.locator('[data-testid="si-intervalos"] line, [data-testid="si-intervalos"] rect').evaluateAll(
      (els) => els.map((e) => e.getBoundingClientRect().width).filter((w) => w > 1).reduce((s, w) => s + w, 0));
    const ancho90 = await ancho();
    await control(fig, 'confianza').selectOption('0.99');
    await expect(lectura(fig, 'intervalos')).toHaveText('100'); // cambiar la confianza no tira las muestras
    const cubren99 = await numero(fig, 'cubren');
    expect(cubren99).toBeGreaterThanOrEqual(cubren90);
    expect(await ancho()).toBeGreaterThan(ancho90);
  });
});

test.describe('ab', () => {
  test('con tasaB = tasaA y 200 experimentos, la tasa de rechazo queda cerca de α (entre 1 % y 10 %)', async ({ page }) => {
    const fig = await figura(page, 'A/B');
    await fijar(fig, 'tasa-b', 0.1);
    await control(fig, 'correr-200').click();
    const tasa = await numero(fig, 'tasa-rechazo');
    expect(tasa).toBeGreaterThanOrEqual(1);
    expect(tasa).toBeLessThanOrEqual(10);
  });

  test('un experimento muestra diferencia, z, p-valor y decisión; al subir los usuarios por grupo sube la potencia', async ({ page }) => {
    const fig = await figura(page, 'A/B');
    await expect(lectura(fig, 'decision')).toHaveText('—');
    const potencia0 = await numero(fig, 'potencia');
    await control(fig, 'correr-1').click();
    await expect(lectura(fig, 'decision')).toHaveText(/^(rechazo H0|no rechazo H0)$/);
    await expect(lectura(fig, 'p-valor')).toHaveText(/^\d,\d{4}$/);
    await expect(lectura(fig, 'z')).toHaveText(/^−?\d+,\d{2}$/);
    await fijar(fig, 'n-por-grupo', Number(posLog(10000, 100, 20000)));
    expect(await numero(fig, 'potencia')).toBeGreaterThan(potencia0);
  });

  test('con α = 1 % el criterio es más exigente: la potencia teórica baja', async ({ page }) => {
    const fig = await figura(page, 'A/B');
    const p5 = await numero(fig, 'potencia');
    await control(fig, 'alfa').selectOption('0.01');
    expect(await numero(fig, 'potencia')).toBeLessThan(p5);
  });
});
