// Mobile-first (SPEC, supuesto BAJO): ningún tema real desborda en horizontal a 360 px (con simuladores hidratados).
import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '../src/content/temas');
const temas = readdirSync(RAIZ)
  .filter((a) => a !== 'ejemplo')
  .flatMap((a) => readdirSync(resolve(RAIZ, a)).map((t) => `${a}/${t}`));

test.use({ viewport: { width: 360, height: 800 } });

for (const tema of temas) {
  test(`sin desborde horizontal a 360 px: ${tema}`, async ({ page }) => {
    await page.goto(`${tema}/`);
    const sims = page.locator('[data-testid^="sim-"]');
    for (let i = 0; i < (await sims.count()); i++) {
      await sims.nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300); // client:visible: deja que se hidrate
    }
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw, `scrollWidth ${sw} > ancho ${cw}`).toBeLessThanOrEqual(cw);
  });
}
