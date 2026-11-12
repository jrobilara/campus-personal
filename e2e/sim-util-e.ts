// Utilidades de los e2e de SimFuncion, SimTransformacion2D, SimDistribucion, SimInferencia, SimBayes y SimSerieTemporal.
import { expect, type Locator, type Page } from '@playwright/test';

export const URL_SIM = 'ejemplo/simuladores/';

/** Abre la página de pruebas, esconde la barra de desarrollo de Astro (si está) y devuelve una función para ubicar figuras. */
export async function abrir(page: Page) {
  await page.goto(URL_SIM);
  await page.addStyleTag({ content: 'astro-dev-toolbar, vite-error-overlay { display: none !important; }' });
}

/** Figura por título exacto (el título de la figura, no cualquier texto que lo contenga). Espera a que la isla se hidrate. */
export async function figura(page: Page, titulo: string): Promise<Locator> {
  const fig = page.locator('figure.sim').filter({ has: page.locator('.sim-titulo', { hasText: new RegExp(`^${titulo.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`) }) });
  await expect(fig).toHaveCount(1);
  await fig.scrollIntoViewIfNeeded();
  // `client:visible`: mientras el <astro-island> tenga `ssr`, React todavía no tomó el control.
  await expect(fig.locator('astro-island[ssr]')).toHaveCount(0);
  return fig;
}

export const lectura = (fig: Locator, clave: string) => fig.locator(`[data-lectura="${clave}"]`);
export const control = (fig: Locator, clave: string) => fig.locator(`[data-control="${clave}"]`);

/** Número de una lectura con coma decimal ("16,7", "−0,5"). */
export async function numero(fig: Locator, clave: string): Promise<number> {
  const t = (await lectura(fig, clave).innerText()).trim().replace('−', '-').replace(/\./g, '').replace(',', '.');
  return Number(t);
}

/** Posición (0-1000) del slider logarítmico de ui.tsx para un valor. */
export const posLog = (valor: number, min: number, max: number) => String(Math.round((Math.log(valor / min) / Math.log(max / min)) * 1000));

/** Mueve un slider lineal. */
export const fijar = (fig: Locator, clave: string, valor: number) => control(fig, clave).fill(String(valor));
