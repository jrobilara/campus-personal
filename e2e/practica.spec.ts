// Ejercicios autocorregibles y casos de guardia del tema (islas) y su efecto en el progreso.
import { expect, test } from '@playwright/test';
import { hidratado } from './util';

test('ejercicio numérico: acepta coma o punto, usa la explicación del error común y cuenta intentos', async ({ page }) => {
  await page.goto('ejemplo/');
  const ej = page.locator('.ejercicio[data-tipo=numerico]');
  await hidratado(ej);
  await expect(ej.getByTestId('intentos')).toHaveText('Intentos: 0 · Aciertos: 0');
  await ej.getByRole('textbox').fill('abc');
  await ej.getByRole('button', { name: 'Corregir' }).click();
  await expect(ej.getByRole('alert')).toContainText('Escribí un número');
  await ej.getByRole('textbox').fill('130');
  await ej.getByRole('button', { name: 'Corregir' }).click();
  await expect(ej.getByTestId('resultado-ejercicio')).toHaveAttribute('data-ok', 'false');
  await expect(ej.getByTestId('resultado-ejercicio')).toContainText('Eso es la mediana');
  await expect(ej.getByTestId('intentos')).toHaveText('Intentos: 1 · Aciertos: 0');
  await ej.getByRole('button', { name: 'Probar de nuevo' }).click();
  await ej.getByRole('textbox').fill('502,3'); // dentro de la tolerancia absoluta de 0,5, con coma
  await ej.getByRole('button', { name: 'Corregir' }).click();
  await expect(ej.getByTestId('resultado-ejercicio')).toHaveAttribute('data-ok', 'true');
  await expect(ej.getByTestId('intentos')).toHaveText('Intentos: 2 · Aciertos: 1');
  // el progreso persiste al recargar
  await page.reload();
  await hidratado(page.locator('.ejercicio[data-tipo=numerico]'));
  await expect(page.locator('.ejercicio[data-tipo=numerico]').getByTestId('intentos')).toHaveText('Intentos: 2 · Aciertos: 1');
});

test('opción múltiple y verdadero/falso: explican la elegida y la correcta', async ({ page }) => {
  await page.goto('ejemplo/');
  const om = page.locator('.ejercicio[data-tipo=opcion-multiple]');
  await hidratado(om);
  await om.getByLabel('La media de todas las latencias.').check();
  await om.getByRole('button', { name: 'Corregir' }).click();
  await expect(om.getByTestId('resultado-ejercicio')).toHaveAttribute('data-ok', 'false');
  await expect(om.getByTestId('resultado-ejercicio')).toContainText('inflan');
  await expect(om.getByTestId('resultado-ejercicio')).toContainText('robusta');
  await expect(om.locator('.opcion.correcta')).toHaveCount(1);
  const vf = page.locator('.ejercicio[data-tipo=verdadero-falso]');
  await hidratado(vf);
  await vf.getByRole('button', { name: 'Verdadero' }).click();
  await expect(vf.getByTestId('resultado-ejercicio')).toHaveAttribute('data-ok', 'true');
});

test('caso de guardia: decisión, consecuencia, desenlace con lección y "Probar otro camino"', async ({ page }) => {
  await page.goto('ejemplo/');
  const caso = page.getByTestId('caso-guardia');
  await hidratado(caso);
  await expect(caso.getByTestId('intentos-caso')).toHaveText('Intentos: 0');
  for (let i = 0; i < 8 && (await caso.getByTestId('desenlace').count()) === 0; i++) {
    await caso.locator('.decision-opciones button').first().click();
    await expect(caso.getByTestId('consecuencia')).toBeVisible();
    await caso.getByRole('button', { name: 'Seguir' }).click();
  }
  await expect(caso.getByTestId('desenlace')).toBeVisible();
  await expect(caso.getByTestId('desenlace')).toContainText('Lo que te llevás');
  await expect(caso.getByTestId('intentos-caso')).toHaveText('Intentos: 1');
  await caso.getByRole('button', { name: 'Probar otro camino' }).click();
  await expect(caso.locator('.decision-opciones button').first()).toBeVisible();
  await page.reload();
  await hidratado(page.getByTestId('caso-guardia'));
  await expect(page.getByTestId('caso-guardia').getByTestId('intentos-caso')).toHaveText('Intentos: 1');
});

test('tarjetas: el dorso está en el HTML (para el buscador) dentro de un <details>', async ({ page }) => {
  await page.goto('ejemplo/');
  const ficha = page.locator('#t-media-definicion');
  await expect(ficha.locator('details')).not.toHaveAttribute('open', '');
  await ficha.getByText('Ver respuesta').click();
  await expect(ficha).toContainText('Sumás todos los datos');
});

test('ejercicio: si falla el guardado en IndexedDB, muestra el resultado y avisa que no se guardó', async ({ page }) => {
  await page.goto('ejemplo/');
  const vf = page.locator('.ejercicio[data-tipo=verdadero-falso]');
  await hidratado(vf);
  await page.evaluate(() => { IDBObjectStore.prototype.put = () => { throw new Error('simulado'); }; });
  await vf.getByRole('button', { name: 'Verdadero' }).click();
  await expect(vf.getByTestId('resultado-ejercicio')).toBeVisible();
  await expect(vf.getByRole('alert')).toContainText('No pude guardar este resultado');
  await expect(vf.getByTestId('intentos')).toHaveText('Intentos: 0 · Aciertos: 0');
});
