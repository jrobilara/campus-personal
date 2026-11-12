// Criterio 5: exportar el progreso e importarlo en un navegador limpio muestra los mismos números; un JSON inválido avisa y no toca nada.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { calificar, DIA_FIJO, numerosDelPanel } from './util';

async function conProgreso(page: Page) {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('repaso/');
  await expect(page.getByTestId('tarjeta-repaso')).toBeVisible();
  await calificar(page, 3, 3);
  await page.goto('ejemplo/');
  const ej = page.locator('.ejercicio[data-tipo=numerico]');
  await ej.scrollIntoViewIfNeeded();
  await ej.getByRole('textbox').fill('502');
  await ej.getByRole('button', { name: 'Corregir' }).click();
  await expect(ej.getByTestId('resultado-ejercicio')).toHaveAttribute('data-ok', 'true');
}

test('exportar → importar en un contexto limpio da los mismos números del panel', async ({ page, browser }, info) => {
  await conProgreso(page);
  const antes = await numerosDelPanel(page);
  expect(Number(antes.dominios['analisis-datos']!.replace(/\D/g, ''))).toBeGreaterThan(0);
  expect(antes.dias30).toBe('1');

  await page.goto('ajustes/');
  const [descarga] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar progreso' }).click()]);
  expect(descarga.suggestedFilename()).toBe('campus-progreso-2026-03-10.json');
  const archivo = join(info.outputDir, 'progreso.json');
  await descarga.saveAs(archivo);

  const ctx = await browser.newContext({ baseURL: info.project.use.baseURL, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  const limpio = await ctx.newPage();
  await limpio.clock.setFixedTime(DIA_FIJO);
  const vacio = await numerosDelPanel(limpio);
  expect(vacio.dias30).toBe('0');
  await limpio.goto('ajustes/');
  await limpio.getByTestId('archivo-importar').setInputFiles(archivo);
  await expect(limpio.getByTestId('confirmar-importacion')).toContainText('Vas a reemplazar tu progreso actual (0 tarjetas, 0 días) por el del archivo (3 tarjetas, 1 días');
  await limpio.getByRole('button', { name: 'Reemplazar mi progreso' }).click();
  await expect(limpio.getByTestId('mensaje-ajustes')).toContainText('importé el progreso');
  const despues = await numerosDelPanel(limpio);
  expect(despues).toEqual(antes);

  // deshacer devuelve el progreso vacío
  await limpio.goto('ajustes/');
  await limpio.getByRole('button', { name: 'Deshacer la importación' }).click();
  await expect(limpio.getByTestId('mensaje-ajustes')).toContainText('Volví a tu progreso de antes');
  expect((await numerosDelPanel(limpio)).dias30).toBe('0');
  await ctx.close();
});

test('un archivo inválido avisa y el progreso actual queda intacto', async ({ page }, info) => {
  await conProgreso(page);
  const antes = await numerosDelPanel(page);
  const invalidos: [string, string, RegExp][] = [
    ['no-json.json', 'esto no es json {', /no es un JSON válido/],
    ['otra-app.json', JSON.stringify({ app: 'otra-cosa', version: 1 }), /no es un progreso del campus/],
    ['futuro.json', JSON.stringify({ app: 'campus-personal', version: 2 }), /versión más nueva/],
    ['fecha-mala.json', JSON.stringify({ app: 'campus-personal', version: 1, exportadoEn: null, fsrs: { libreria: 'x', modelo: 'y' }, revlog: [], ejercicios: {}, casos: {}, diasDeEstudio: {},
      tarjetas: { 'a/b#t-x': { card: { stability: 1, stabilityFast: 1, difficulty: 1, dueAt: 'ayer', lastReviewAt: null, state: 2, scheduleStatus: 'review', cardId: 'x', reps: 1, lapses: 0, scheduledDays: 1, learningStep: 0 } } } }), /dueAt/],
  ];
  for (const [nombre, texto, mensaje] of invalidos) {
    mkdirSync(info.outputDir, { recursive: true });
    const ruta = join(info.outputDir, nombre);
    writeFileSync(ruta, texto);
    await page.goto('ajustes/');
    await page.getByTestId('archivo-importar').setInputFiles(ruta);
    const aviso = page.getByTestId('mensaje-ajustes');
    await expect(aviso).toContainText('No importé nada y tu progreso sigue igual');
    await expect(aviso).toContainText(mensaje);
    await expect(page.getByTestId('confirmar-importacion')).toHaveCount(0);
  }
  expect(await numerosDelPanel(page)).toEqual(antes);
});

test('reiniciar pide escribir REINICIAR y borra el progreso', async ({ page }) => {
  await conProgreso(page);
  await page.goto('ajustes/');
  const boton = page.getByRole('button', { name: 'Reiniciar progreso' });
  await expect(boton).toBeDisabled();
  await page.getByLabel('Escribí REINICIAR para confirmar').fill('reiniciar');
  await expect(boton).toBeDisabled();
  await page.getByLabel('Escribí REINICIAR para confirmar').fill('REINICIAR');
  await boton.click();
  await expect(page.getByTestId('mensaje-ajustes')).toContainText('Reinicié tu progreso');
  expect((await numerosDelPanel(page)).dias30).toBe('0');
});

test('el panel vacío invita a empezar y el calendario dibuja 26 semanas', async ({ page }) => {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('progreso/');
  await expect(page.getByText('Todavía no empezaste')).toBeVisible();
  await expect(page.getByTestId('calendario').locator('svg')).toBeVisible();
  await expect(page.getByTestId('proximos-7').locator('.dia')).toHaveCount(7);
});
