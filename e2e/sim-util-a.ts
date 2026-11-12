// Utilidades de los e2e de SimDatos y SimTablaSQL.
import { expect, type Locator, type Page } from '@playwright/test';

export const URL_SIM = 'ejemplo/simuladores/';

/** Abre la página de pruebas y esconde la barra de desarrollo de Astro (si está). */
export async function abrir(page: Page) {
  // Se inyecta antes de que cargue la página: así sobrevive a un reload por HMR del servidor de desarrollo compartido.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = 'astro-dev-toolbar, vite-error-overlay { display: none !important; }';
      document.head.append(st);
    });
  });
  await page.goto(URL_SIM);
}

/** Figura por título exacto; espera a que la isla se hidrate (`client:visible`). */
export async function figura(page: Page, titulo: string): Promise<Locator> {
  const fig = page.locator('figure.sim').filter({ has: page.locator('.sim-titulo', { hasText: new RegExp(`^${titulo.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`) }) });
  await expect(fig).toHaveCount(1);
  await fig.scrollIntoViewIfNeeded();
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
