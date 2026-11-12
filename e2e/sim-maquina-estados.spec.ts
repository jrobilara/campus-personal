import { expect, test, type Locator, type Page } from '@playwright/test';

// SimMaquinaEstados (SIMULADORES.md §2.9): un test por preset sobre la página de pruebas.
// El reloj de las máquinas con tiempo (breaker, systemd, docker) corre en vivo; el botón "Esperar 10 s" lo adelanta sin dormir.
const URL = 'ejemplo/simuladores/';

async function abrir(page: Page, titulo: string): Promise<Locator> {
  await page.goto(URL);
  const fig = page.locator('figure.sim', { hasText: titulo }).first();
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.locator('.sm[data-listo="true"]')).toBeVisible(); // ya hidratada
  return fig;
}
const lect = (fig: Locator, clave: string) => fig.locator(`[data-lectura="${clave}"]`);
const ctrl = (fig: Locator, clave: string) => fig.locator(`[data-control="${clave}"]`);
const log = (fig: Locator) => fig.locator('[data-registro="log"]');
const evento = (fig: Locator, id: string) => ctrl(fig, `evento-${id}`).click();
const esperar = (fig: Locator) => ctrl(fig, 'esperar').click();
const reiniciar = (fig: Locator) => ctrl(fig, 'reiniciar').click();
const num = async (l: Locator) => Number((await l.innerText()).replace(',', '.'));

test.describe('SimMaquinaEstados', () => {
  test('circuit-breaker: con 80 % de falla abre, deja de llamar al servicio, y al bajar a 0 % pasa por semi-abierto y cierra', async ({ page }) => {
    const fig = await abrir(page, 'Circuit breaker');
    await expect(lect(fig, 'estado')).toHaveText('cerrado');
    await ctrl(fig, 'espera').fill('15');
    await ctrl(fig, 'umbral').fill('50');
    await ctrl(fig, 'tasa').fill('80');
    await expect(lect(fig, 'estado')).toHaveText('abierto');
    await expect(fig.locator('[data-nodo="abierto"]')).toHaveAttribute('data-activo', 'true');
    const llamadas = await num(lect(fig, 'llamadas-al-servicio'));
    const rechazados = await num(lect(fig, 'rechazados-rapido'));
    expect(llamadas).toBeGreaterThanOrEqual(10);
    await esperar(fig); // 10 s simulados con el circuito abierto (la espera es de 15 s)
    await expect(lect(fig, 'estado')).toHaveText('abierto');
    expect(await num(lect(fig, 'llamadas-al-servicio'))).toBe(llamadas);
    expect(await num(lect(fig, 'rechazados-rapido'))).toBeGreaterThan(rechazados + 90);
    await ctrl(fig, 'tasa').fill('0');
    await esperar(fig); // se cumple la espera y el pedido de prueba anda
    await expect(lect(fig, 'estado')).toHaveText('cerrado');
    await expect(lect(fig, 'transiciones')).toHaveText('3');
    await expect(log(fig)).toContainText('pasa a semi-abierto');
    await expect(log(fig)).toContainText('el pedido de prueba anduvo');
  });

  test('unidad-systemd: con Restart=on-failure una muerte pasa por activating, vuelve a active y suma 1 reinicio', async ({ page }) => {
    const fig = await abrir(page, 'systemd');
    await expect(lect(fig, 'estado')).toHaveText('active');
    await evento(fig, 'muere');
    await expect(lect(fig, 'estado')).toHaveText('activating');
    await expect(lect(fig, 'estado')).toHaveText('active');
    await expect(lect(fig, 'reinicios')).toHaveText('1');
    await expect(log(fig)).toContainText('app.service: Main process exited, code=exited, status=1/FAILURE');
  });

  test('unidad-systemd: 5 muertes en menos de 10 s simulados dejan failed con start-limit-hit; esperar 10 s vacía la ventana', async ({ page }) => {
    const fig = await abrir(page, 'systemd');
    for (let i = 0; i < 4; i++) {
      await evento(fig, 'muere');
      await expect(lect(fig, 'estado')).toHaveText('active');
    }
    await expect(lect(fig, 'muertes-recientes')).toHaveText('4');
    await evento(fig, 'muere');
    await expect(lect(fig, 'estado')).toHaveText('failed');
    await expect(log(fig)).toContainText('start-limit-hit');
    await evento(fig, 'reset-failed');
    await expect(lect(fig, 'estado')).toHaveText('inactive');
    // si las muertes quedan fuera de la ventana de 10 s, el límite no se dispara
    await reiniciar(fig);
    await evento(fig, 'muere');
    await expect(lect(fig, 'estado')).toHaveText('active');
    await esperar(fig);
    await expect(lect(fig, 'muertes-recientes')).toHaveText('0');
  });

  test('unidad-systemd: sin Restart, una muerte deja failed directo', async ({ page }) => {
    const fig = await abrir(page, 'systemd');
    await ctrl(fig, 'restart').uncheck();
    await evento(fig, 'muere');
    await expect(lect(fig, 'estado')).toHaveText('failed');
    await expect(lect(fig, 'reinicios')).toHaveText('0');
    await expect(ctrl(fig, 'evento-muere')).toBeDisabled();
    await expect(ctrl(fig, 'evento-reset-failed')).toBeEnabled();
  });

  test('proceso-linux: exit lleva a Z y sigue en la tabla hasta wait(); la letra de ps acompaña', async ({ page }) => {
    const fig = await abrir(page, 'Proceso Linux');
    await expect(lect(fig, 'estado-ps')).toHaveText('R');
    await expect(lect(fig, 'pid')).toHaveText('4242');
    await expect(ctrl(fig, 'evento-wait')).toBeDisabled();
    await evento(fig, 'exit');
    await expect(lect(fig, 'estado-ps')).toHaveText('Z');
    await expect(fig.locator('.sm-term')).toContainText('<defunct>');
    await expect(ctrl(fig, 'evento-sigstop')).toBeDisabled();
    await evento(fig, 'wait');
    await expect(fig.locator('.sm-term')).toContainText('ya no figura');
  });

  test('proceso-linux: en D, SIGSTOP queda pendiente y se aplica recién al salir de D', async ({ page }) => {
    const fig = await abrir(page, 'Proceso Linux');
    await evento(fig, 'pide-disco');
    await expect(lect(fig, 'estado-ps')).toHaveText('D');
    await evento(fig, 'sigstop');
    await expect(lect(fig, 'estado-ps')).toHaveText('D');
    await expect(log(fig)).toContainText('señal pendiente');
    await expect(ctrl(fig, 'evento-sigstop')).toBeDisabled();
    await evento(fig, 'llega-dato');
    await expect(lect(fig, 'estado-ps')).toHaveText('T');
    await expect(lect(fig, 'senal-pendiente')).toHaveText('ninguna');
  });

  test('contenedor-docker: con política no, salir con código 1 deja exited', async ({ page }) => {
    const fig = await abrir(page, 'Contenedor');
    await expect(lect(fig, 'estado')).toHaveText('running');
    await ctrl(fig, 'politica').selectOption('no');
    await esperar(fig);
    await evento(fig, 'exit1');
    await expect(lect(fig, 'estado')).toHaveText('exited');
    await expect(lect(fig, 'codigo-salida')).toHaveText('1');
    await expect(lect(fig, 'reinicios')).toHaveText('0');
  });

  test('contenedor-docker: regla de los 10 s, antes de 10 s de uptime la política no rige; después, sí', async ({ page }) => {
    const fig = await abrir(page, 'Contenedor');
    await ctrl(fig, 'politica').selectOption('on-failure');
    // salida temprana: exited, sin reiniciar
    await evento(fig, 'exit1');
    await expect(lect(fig, 'estado')).toHaveText('exited');
    await expect(lect(fig, 'reinicios')).toHaveText('0');
    await expect(log(fig)).toContainText('salió antes de los 10 s: la política de reinicio no se aplica');
    // arranque exitoso: docker start, esperar 10 s y recién ahí la salida pasa por restarting
    await evento(fig, 'start');
    await expect(lect(fig, 'estado')).toHaveText('running');
    await esperar(fig);
    expect(await num(lect(fig, 'uptime'))).toBeGreaterThanOrEqual(10);
    await expect(log(fig)).toContainText('lleva 10 s en running');
    await evento(fig, 'exit1');
    await expect(lect(fig, 'estado')).toHaveText('restarting');
    await expect(lect(fig, 'reinicios')).toHaveText('1');
    await expect(lect(fig, 'estado')).toHaveText('running'); // vuelve solo tras 1 s simulado
    expect(await num(lect(fig, 'uptime'))).toBeLessThan(3); // el uptime arrancó de nuevo
  });

  test('contenedor-docker: con always, docker stop deja exited y vuelve recién con reiniciar el daemon', async ({ page }) => {
    const fig = await abrir(page, 'Contenedor');
    await ctrl(fig, 'politica').selectOption('always');
    await esperar(fig);
    await evento(fig, 'stop');
    await expect(lect(fig, 'estado')).toHaveText('exited');
    await expect(lect(fig, 'codigo-salida')).toHaveText('143');
    await esperar(fig);
    await expect(lect(fig, 'estado')).toHaveText('exited');
    await evento(fig, 'daemon');
    await expect(lect(fig, 'estado')).toHaveText('running');
  });

  test('contenedor-docker: con unless-stopped, docker stop no vuelve ni con reiniciar el daemon', async ({ page }) => {
    const fig = await abrir(page, 'Contenedor');
    await ctrl(fig, 'politica').selectOption('unless-stopped');
    await esperar(fig);
    await evento(fig, 'stop');
    await evento(fig, 'daemon');
    await expect(lect(fig, 'estado')).toHaveText('exited');
    await expect(log(fig)).toContainText('unless-stopped lo respeta');
  });

  test('incidente-itil: recorre el ciclo, reabre desde resuelto y suma problemas y cambios sin cambiar el estado', async ({ page }) => {
    const fig = await abrir(page, 'Incidente');
    await expect(fig).toContainText('ITIL 4 no fija estos estados');
    await expect(lect(fig, 'estado')).toHaveText('registrado');
    await expect(ctrl(fig, 'evento-confirma')).toBeDisabled();
    await ctrl(fig, 'impacto').selectOption('alto');
    await ctrl(fig, 'urgencia').selectOption('alta');
    await evento(fig, 'clasificar');
    await expect(lect(fig, 'estado')).toHaveText('clasificado');
    await expect(lect(fig, 'prioridad')).toHaveText('P1');
    await evento(fig, 'asignar');
    await evento(fig, 'pedir-datos');
    await expect(lect(fig, 'estado')).toHaveText('en-espera-usuario');
    await evento(fig, 'responde');
    await evento(fig, 'problema');
    await expect(lect(fig, 'problemas-abiertos')).toHaveText('1');
    await expect(lect(fig, 'estado')).toHaveText('en-curso');
    await evento(fig, 'cambio');
    await expect(lect(fig, 'cambios-pedidos')).toHaveText('1');
    await evento(fig, 'solucion');
    await expect(lect(fig, 'estado')).toHaveText('resuelto');
    await evento(fig, 'sigue-fallando');
    await expect(lect(fig, 'estado')).toHaveText('reabierto');
    await evento(fig, 'asignar');
    await evento(fig, 'solucion');
    await evento(fig, 'confirma');
    await expect(lect(fig, 'estado')).toHaveText('cerrado');
    await expect(log(fig)).toContainText('PRB-0001');
  });
});
