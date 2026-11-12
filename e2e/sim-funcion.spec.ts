import { expect, test } from '@playwright/test';
import { abrir, control, figura, fijar, lectura, numero, posLog } from './sim-util-e';

// SimFuncion: un test por modo (tangente, descenso, señal), con los criterios de "Qué tiene que verse" de SIMULADORES.md §2.1.
test.setTimeout(120_000); // la página de pruebas trae los 40 simuladores y la máquina suele estar cargada
test.beforeEach(async ({ page }) => { await abrir(page); });

test.describe('tangente', () => {
  test('en la cuadrática con x0 = 0 la tangente es horizontal: derivada 0,00', async ({ page }) => {
    const fig = await figura(page, 'Tangente');
    await expect(lectura(fig, 'derivada')).toHaveText('2,00'); // x0 = 1 por defecto
    await fijar(fig, 'x0', 0);
    await expect(lectura(fig, 'derivada')).toHaveText('0,00');
    await expect(lectura(fig, 'fx0')).toHaveText('0,00');
  });

  test('al llevar h a 0,01 la pendiente de la secante queda a menos de 0,05 de la derivada', async ({ page }) => {
    const fig = await figura(page, 'Tangente');
    await expect(lectura(fig, 'pendiente-secante')).toHaveText('3,00'); // h = 1: (2² − 1²) / 1
    await fijar(fig, 'h', 0.01);
    const d = await numero(fig, 'derivada');
    const s = await numero(fig, 'pendiente-secante');
    expect(Math.abs(s - d)).toBeLessThan(0.05);
  });
});

test.describe('descenso', () => {
  test('cuadrática con tasa 0,1: el punto baja hacia 0 y el estado es convergiendo', async ({ page }) => {
    const fig = await figura(page, 'Tasa en la parábola');
    await expect(lectura(fig, 'estado')).toHaveText('convergiendo');
    await expect(lectura(fig, 'paso')).toHaveText('0');
    await control(fig, 'paso-10').click();
    await expect(lectura(fig, 'paso')).toHaveText('10');
    expect(await numero(fig, 'x')).toBeLessThan(0.5);
    expect(await numero(fig, 'x')).toBeGreaterThan(0);
    await expect(lectura(fig, 'estado')).toHaveText('convergiendo');
    // la barra de estado del gráfico acompaña a la lectura
    await expect(fig.locator('.sf-estado-barra')).toContainText('Convergiendo');
  });

  test('con tasa 1,1 los puntos saltan de lado a lado alejándose: divergiendo', async ({ page }) => {
    const fig = await figura(page, 'Tasa en la parábola');
    await fijar(fig, 'tasa', Number(posLog(1.1, 0.001, 1.5)));
    await control(fig, 'paso-1').click();
    const x1 = await numero(fig, 'x');
    expect(x1).toBeLessThan(0); // pasó al otro lado
    await control(fig, 'paso-1').click();
    const x2 = await numero(fig, 'x');
    expect(x2).toBeGreaterThan(0);
    expect(Math.abs(x2)).toBeGreaterThan(Math.abs(x1));
    await expect(lectura(fig, 'estado')).toHaveText('divergiendo');
    await expect(fig.locator('.sf-estado-barra')).toContainText('Divergiendo');
    await control(fig, 'reiniciar').click();
    await expect(lectura(fig, 'paso')).toHaveText('0');
    await expect(lectura(fig, 'x')).toHaveText('3,000');
  });

  test('con una tasa grande pero estable el punto oscila de un lado al otro', async ({ page }) => {
    const fig = await figura(page, 'Tasa en la parábola');
    await fijar(fig, 'tasa', Number(posLog(0.9, 0.001, 1.5))); // factor |1 − 2·0,9| = 0,8 con signo negativo
    await control(fig, 'paso-10').click();
    await expect(lectura(fig, 'estado')).toHaveText('oscilando');
    await expect(fig.locator('.sf-estado-barra')).toContainText('Oscilando');
  });

  test('doble pozo desde x0 = 2 con tasa 0,01 se queda en el mínimo local (x ≈ 1,13), no en el global', async ({ page }) => {
    const fig = await figura(page, 'Descenso');
    await fijar(fig, 'x0', 2);
    await fijar(fig, 'tasa', Number(posLog(0.01, 0.001, 1.5)));
    for (let i = 0; i < 5; i++) await control(fig, 'paso-10').click();
    await expect(lectura(fig, 'paso')).toHaveText('50');
    expect(Math.abs((await numero(fig, 'x')) - 1.13)).toBeLessThan(0.03);
    await expect(lectura(fig, 'estado')).toHaveText('convergiendo');
    await expect(control(fig, 'paso-1')).toBeDisabled(); // llegó al máximo de pasos
  });

  test('el gráfico tiene los rótulos en español y estados de x₀, el punto actual, los mínimos y los ejes', async ({ page }) => {
    const fig = await figura(page, 'Descenso');
    const svg = fig.locator('svg.MafsView');
    await expect(svg.getByText('mínimo global')).toBeVisible();
    await expect(svg.getByText('mínimo local')).toBeVisible();
    await expect(svg.getByText('x₀ · inicio')).toBeVisible();
    await expect(fig.locator('.sf-eje-titulo')).toContainText('f(x)');
    await expect(fig.locator('.sf-eje-pie')).toContainText('x:');
    await control(fig, 'paso-1').click();
    await expect(svg.getByText(/x₁ · ahora|x₀ · inicio/).first()).toBeVisible();
  });

  test('con pasos acumulados, los números de los pasos no se pisan entre sí', async ({ page }) => {
    const fig = await figura(page, 'Tasa en la parábola');
    for (let i = 0; i < 3; i++) await control(fig, 'paso-10').click();
    const cajas = await fig.locator('svg.MafsView text[style*="font-weight"]').evaluateAll((els) =>
      els.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent ?? '', x: r.x, y: r.y, w: r.width, h: r.height }; }));
    expect(cajas.length).toBeGreaterThan(2);
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i]!, b = cajas[j]!;
        const seSuperponen = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        // los rótulos numerados (solo dígitos) no se pisan entre sí; los de x₀/mínimo pueden rozar la curva pero no a un número
        if (/^\d+$/.test(a.t) && /^\d+$/.test(b.t)) expect(seSuperponen, `"${a.t}" pisa a "${b.t}"`).toBe(false);
      }
    }
  });
});

test.describe('descenso a 390 px', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('ningún rótulo del gráfico queda cortado y no hay desborde horizontal', async ({ page }) => {
    for (const titulo of ['Descenso', 'Tasa en la parábola']) {
      const fig = await figura(page, titulo);
      await control(fig, 'paso-10').click();
      const dentro = await fig.locator('svg.MafsView').evaluate((svg) => {
        const caja = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('text[style*="font-weight"]')].map((t) => {
          const r = t.getBoundingClientRect();
          return { t: t.textContent, ok: r.left >= caja.left - 1 && r.right <= caja.right + 1 && r.top >= caja.top - 1 && r.bottom <= caja.bottom + 1 };
        });
      });
      for (const d of dentro) expect(d.ok, `rótulo "${d.t}" cortado en "${titulo}"`).toBe(true);
      const caja = await fig.boundingBox();
      expect(caja!.width).toBeLessThanOrEqual(390);
      expect(await fig.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
  });
});

test.describe('señal', () => {
  test('componente de 10 Hz muestreada a 12 Hz: aparece el alias de 2 Hz; con fs ≥ 21 Hz no hay alias', async ({ page }) => {
    const fig = await figura(page, 'Señal');
    await expect(lectura(fig, 'frecuencia-max')).toHaveText('10');
    await expect(lectura(fig, 'alias')).toHaveText('—'); // fs = 40 Hz
    await fijar(fig, 'frecuencia-muestreo', 12);
    await expect(lectura(fig, 'nyquist')).toHaveText('6');
    await expect(lectura(fig, 'alias')).toHaveText('2');
    await fijar(fig, 'frecuencia-muestreo', 21);
    await expect(lectura(fig, 'alias')).toHaveText('—');
  });

  test('el filtro pasa-bajos con corte en 5 Hz saca la componente de 10 Hz', async ({ page }) => {
    const fig = await figura(page, 'Señal');
    await expect(lectura(fig, 'componentes-filtradas')).toHaveText('0');
    await control(fig, 'filtro').check();
    await fijar(fig, 'corte', 5);
    await expect(lectura(fig, 'componentes-filtradas')).toHaveText('1');
    await fijar(fig, 'corte', 12);
    await expect(lectura(fig, 'componentes-filtradas')).toHaveText('0');
  });
});
