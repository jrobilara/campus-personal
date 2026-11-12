// Criterio 4 en el navegador: calificar una tarjeta la saca de "para hoy" y vuelve recién en su fecha.
import { expect, test } from '@playwright/test';
import { calificar, DIA_FIJO, unaSemanaDespues } from './util';

test('calificar "Bien" baja el contador; adelantar el reloj a su fecha lo hace volver', async ({ page }) => {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('');
  // con el contenido real hay más tarjetas nuevas que el tope diario: "para hoy" = tope por defecto (10)
  await expect(page.getByTestId('para-hoy')).toHaveText('10');
  await expect(page.locator('nav [data-testid=contador-hoy]')).toHaveText('10');

  await page.goto('repaso/');
  await expect(page.getByTestId('tarjeta-repaso')).toBeVisible();
  await expect(page.getByTestId('repaso-restantes')).toHaveText('Faltan 10');
  await calificar(page, 1, 3);
  await expect(page.getByTestId('repaso-restantes')).toHaveText('Faltan 9');
  // los botones muestran el intervalo que resultaría
  await page.getByRole('button', { name: /Mostrar respuesta/ }).click();
  await expect(page.locator('[data-nota="3"] small')).toHaveText(/\d+ (min|h|d|meses?)/);

  await page.goto('');
  await expect(page.getByTestId('para-hoy')).toHaveText('9');

  await page.clock.setFixedTime(unaSemanaDespues);
  await page.reload();
  await expect(page.getByTestId('para-hoy')).toHaveText('11'); // tope de 10 nuevas de ese día + la vencida
  await page.goto('repaso/');
  await expect(page.getByTestId('repaso-restantes')).toHaveText('Faltan 11');
});

test('atajos de teclado: espacio muestra la respuesta y 1-4 califican; al terminar hay resumen', async ({ page }) => {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('repaso/?tema=ejemplo/media-y-mediana');
  await expect(page.getByTestId('tarjeta-repaso')).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Space');
    await expect(page.getByTestId('dorso')).toBeVisible();
    await page.keyboard.press('4'); // Fácil: se va lejos
    await expect(page.getByTestId('repaso-restantes')).toHaveText(i === 5 ? 'Terminaste' : `Faltan ${5 - i}`);
  }
  await expect(page.getByTestId('repaso-fin')).toContainText('repasaste 6 tarjetas');
});

test('"Otra vez" deja la tarjeta para más tarde hoy y el resumen lo avisa', async ({ page }) => {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('repaso/?tema=ejemplo/media-y-mediana');
  await calificar(page, 1, 1); // Otra vez: vuelve en 1 minuto
  await calificar(page, 5, 4);
  await expect(page.getByTestId('repaso-fin')).toContainText('Te quedan 1 para más tarde hoy');
});

test('el límite diario de tarjetas nuevas se respeta (Ajustes)', async ({ page }) => {
  await page.clock.setFixedTime(DIA_FIJO);
  await page.goto('ajustes/');
  await page.getByRole('spinbutton').fill('2');
  await page.goto('');
  await expect(page.getByTestId('para-hoy')).toHaveText('2');
  await page.goto('repaso/');
  await calificar(page, 2, 4);
  await expect(page.getByTestId('repaso-fin')).toContainText(/Hay \d+ tarjetas nuevas más/); // el resto del contenido real queda para otro día
});
