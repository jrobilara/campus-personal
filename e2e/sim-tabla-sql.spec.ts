import { expect, test } from '@playwright/test';
import { abrir, control, figura, lectura } from './sim-util-a';

// SimTablaSQL (SIMULADORES.md §2.7) sobre /ejemplo/simuladores/.
test.setTimeout(120_000);
test.beforeEach(async ({ page }) => { await abrir(page); });

test('group-by por region sobre ventas deja tantas filas de salida como regiones', async ({ page }) => {
  const f = await figura(page, 'GROUP BY');
  await expect(lectura(f, 'filas-entrada')).toHaveText('12');
  await expect(lectura(f, 'filas-salida')).toHaveText('3');
  await expect(lectura(f, 'sql')).toContainText('GROUP BY region');
  await expect(lectura(f, 'sql')).toContainText('SUM(monto)');
  await expect(f.locator('[data-testid="sq-salida"] tbody tr')).toHaveCount(3);
  await expect(f.locator('[data-testid="sq-salida"] td[data-col="total_monto"]')).toHaveText(['6400', '4650', '4050']);
});

test('group-by: cambiar la columna y la función cambia el SQL y las filas de salida', async ({ page }) => {
  const f = await figura(page, 'GROUP BY');
  await control(f, 'particion').selectOption('vendedor');
  await expect(lectura(f, 'filas-salida')).toHaveText('6');
  await control(f, 'funcion').selectOption('count');
  await expect(lectura(f, 'sql')).toContainText('COUNT(*) AS cantidad');
  await expect(f.locator('[data-testid="sq-salida"] td[data-col="cantidad"]')).toHaveText(['2', '2', '2', '2', '2', '2']);
});

test('group-by: "Animar" junta las filas por grupo, las colapsa en una y muestra el resultado', async ({ page }) => {
  const f = await figura(page, 'GROUP BY');
  await expect(f.locator('[data-testid="sq-entrada"] tbody tr')).toHaveCount(12);
  await control(f, 'animar').click();
  await expect(f.locator('.sq')).toHaveAttribute('data-fase', 'animando');
  await expect(f.locator('.sq')).toHaveAttribute('data-fase', 'listo', { timeout: 15_000 });
  // colapsó: queda una fila por región, con la insignia de cuántas juntó
  await expect(f.locator('[data-testid="sq-entrada"] tbody tr')).toHaveCount(3);
  await expect(f.locator('.sq-colapso')).toHaveText(['×4', '×4', '×4']);
  await expect(lectura(f, 'filas-salida')).toHaveText('3');
  await control(f, 'restablecer').click();
  await expect(f.locator('[data-testid="sq-entrada"] tbody tr')).toHaveCount(12);
});

test('ventana: filas-salida = filas-entrada = 12 y la columna nueva aparece', async ({ page }) => {
  const f = await figura(page, 'Ventana');
  await expect(lectura(f, 'filas-entrada')).toHaveText('12');
  await expect(lectura(f, 'filas-salida')).toHaveText('12');
  await expect(lectura(f, 'sql')).toContainText('SUM(monto) OVER');
  await expect(lectura(f, 'sql')).toContainText('UNBOUNDED PRECEDING');
  await expect(f.locator('[data-testid="sq-salida"] th.sq-nueva')).toHaveText('acum_monto');
  await expect(f.locator('[data-testid="sq-salida"] tbody tr')).toHaveCount(12);
  // sin partición, la suma acumulada termina en el total de la tabla
  const ultimo = f.locator('[data-testid="sq-salida"] td[data-col="acum_monto"]').last();
  await expect(ultimo).toHaveText(String(1200 + 850 + 1500 + 900 + 1750 + 1500 + 1100 + 850 + 2100 + 1450 + 600 + 1300));
});

test('row_number particionado por region vuelve a 1 al empezar cada región', async ({ page }) => {
  const f = await figura(page, 'Numerar por región');
  await expect(lectura(f, 'sql')).toContainText('ROW_NUMBER() OVER (PARTITION BY region ORDER BY fecha)');
  await expect(f.locator('[data-testid="sq-salida"] td[data-col="nro"]')).toHaveText(['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4']);
  await expect(lectura(f, 'filas-salida')).toHaveText('12');
});

test('promedio-movil con marco = 2 resalta la fila actual y las 2 anteriores', async ({ page }) => {
  const f = await figura(page, 'Promedio móvil');
  await expect(lectura(f, 'sql')).toContainText('ROWS BETWEEN 2 PRECEDING AND CURRENT ROW');
  const entrada = f.locator('[data-testid="sq-entrada"]');
  await expect(entrada.locator('tr.sq-marco')).toHaveCount(3);
  await expect(entrada.locator('tr.sq-actual')).toHaveCount(1);
  // la actual es la última del marco: filas 0, 1 y 2 (la primera con marco completo)
  const marcadas = await entrada.locator('tr.sq-marco').evaluateAll((trs) => trs.map((t) => t.getAttribute('data-fila')));
  expect(marcadas).toEqual(['0', '1', '2']);
  expect(await entrada.locator('tr.sq-actual').getAttribute('data-fila')).toBe('2');
  // con marco 4 se marcan 5 filas
  await expect(async () => {
    await control(f, 'marco').fill('4');
    await expect(entrada.locator('tr.sq-marco')).toHaveCount(5, { timeout: 2000 });
  }).toPass({ timeout: 20_000 });
  await expect(lectura(f, 'sql')).toContainText('ROWS BETWEEN 4 PRECEDING');
});

test('ventana: tocar un valor de la columna nueva marca su cálculo', async ({ page }) => {
  const f = await figura(page, 'Promedio móvil');
  const entrada = f.locator('[data-testid="sq-entrada"]');
  await f.locator('[data-testid="sq-salida"] tr[data-fila="7"] .sq-celda-btn').click();
  await expect(entrada.locator('tr.sq-actual')).toHaveAttribute('data-fila', '7');
  await expect(entrada.locator('tr.sq-marco')).toHaveCount(3);
});

test('ventana: "Animar" calcula celda por celda y termina en reposo', async ({ page }) => {
  const f = await figura(page, 'Ventana');
  await control(f, 'animar').click();
  await expect(f.locator('.sq')).toHaveAttribute('data-fase', 'animando');
  await expect(f.locator('.sq-actual')).toHaveCount(2); // la fila activa en la entrada y en la salida
  await expect(f.locator('.sq')).toHaveAttribute('data-fase', 'reposo', { timeout: 20_000 });
  await expect(lectura(f, 'filas-salida')).toHaveText('12');
});

test('el SQL cambia al tocar la función y la partición (rank por region)', async ({ page }) => {
  const f = await figura(page, 'Ventana');
  await control(f, 'funcion').selectOption('rank');
  await control(f, 'particion').selectOption('region');
  await expect(lectura(f, 'sql')).toContainText('RANK() OVER (PARTITION BY region ORDER BY monto DESC)');
  await expect(f.locator('[data-testid="sq-salida"] td[data-col="posicion"]')).toHaveText(['1', '2', '2', '4', '1', '2', '3', '4', '1', '2', '2', '4']);
});
