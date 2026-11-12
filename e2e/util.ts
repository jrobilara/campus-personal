import { expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export interface AreaYaml { id: string; nombre: string; orden: number; descripcion: string }
export const areasDelContrato = (): AreaYaml[] =>
  (parse(readFileSync(resolve(import.meta.dirname, '../src/content/areas.yaml'), 'utf8')) as AreaYaml[]).sort((a, b) => a.orden - b.orden);

/** Día fijo para que el reloj de los tests no dependa de la fecha real (13:00 en Buenos Aires). */
export const DIA_FIJO = new Date('2026-03-10T13:00:00-03:00');
export const unaSemanaDespues = new Date(DIA_FIJO.getTime() + 6 * 86_400_000);

/** Espera a que la isla `client:visible` que contiene el locator esté hidratada. */
export async function hidratado(loc: Locator) {
  await loc.scrollIntoViewIfNeeded();
  await expect(loc.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', /.*/, { timeout: 15_000 });
}

/** Califica `n` tarjetas del repaso con la nota dada (1-4). */
export async function calificar(page: Page, n: number, nota = 3) {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: /Mostrar respuesta/ }).click();
    await page.locator(`[data-nota="${nota}"]`).click();
  }
}

export async function numerosDelPanel(page: Page) {
  await page.goto('progreso/');
  await expect(page.getByTestId('panel-progreso')).toBeVisible();
  await expect(page.getByTestId('grafico-dominio').locator('svg')).toBeVisible();
  const areas = areasDelContrato();
  const dominios: Record<string, string> = {};
  for (const a of areas) dominios[a.id] = (await page.getByTestId(`dominio-${a.id}`).first().innerText()).trim();
  return {
    dominios,
    vencidas: await page.getByTestId('panel-vencidas').innerText(),
    nuevas: await page.getByTestId('panel-nuevas').innerText(),
    total: await page.getByTestId('panel-total').innerText(),
    dias30: await page.getByTestId('dias-30').innerText(),
    racha: (await page.getByTestId('racha').innerText()).replace(/\s+/g, ' '),
    proximos: (await page.getByTestId('proximos-7').innerText()).replace(/\s+/g, ' '),
  };
}
