// Ningún recurso bajo /campus-personal/ responde 404, y ninguna fórmula quedó con error de KaTeX.
import { expect, test } from '@playwright/test';

const PAGINAS = ['', 'analisis-datos/', 'ejemplo/', 'ejemplo/simuladores/', 'repaso/', 'progreso/', 'buscar/', 'ajustes/'];

for (const ruta of PAGINAS) {
  test(`sin 404 de recursos ni errores de consola en /${ruta}`, async ({ page }) => {
    const fallos: string[] = [];
    const errores: string[] = [];
    page.on('response', (r) => { if (r.status() >= 400 && new URL(r.url()).pathname.startsWith('/campus-personal/')) fallos.push(`${r.status()} ${r.url()}`); });
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    // pasamos por toda la página para que se hidraten las islas client:visible
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    await page.waitForLoadState('networkidle');
    expect(fallos).toEqual([]);
    expect(errores).toEqual([]);
    await expect(page.locator('.katex-error')).toHaveCount(0);
  });
}

test('las fórmulas del tema de ejemplo se renderizan con KaTeX', async ({ page }) => {
  await page.goto('ejemplo/');
  await expect(page.locator('.katex').first()).toBeVisible();
  await expect(page.locator('.katex-display').first()).toBeVisible();
  await expect(page.locator('table').first()).toBeVisible(); // GFM
});
