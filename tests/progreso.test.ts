// Progreso: FSRS con reloj fijo (criterio 4), serialización, import/export (criterio 5) y métricas del panel.
import { describe, expect, it } from 'vitest';
import { progresoVacio, type ProgresoV1 } from '../src/progreso/esquema';
import { calificar, calificarSync, crearPlanificador, deserializarCard, estaParaHoy, textoIntervalo } from '../src/progreso/fsrs';
import { almacenEnMemoria, analizarImport, CLAVE_ANTES, CLAVE_PROGRESO, confirmarImport, contarHuerfanos, deshacerImportacion, exportarProgreso, importarProgreso, leerProgresoDe, limpiarHuerfanos, reiniciarProgreso } from '../src/progreso/importar';
import { calcularPanel, calcularRacha, nivelDeIntensidad } from '../src/progreso/metricas';
import { construirCola, contarParaHoy } from '../src/progreso/repaso';
import { diaLocal } from '../src/progreso/fechas';
import type { Catalogo } from '../src/progreso/tipos';

const T1 = 'analisis-datos/limpieza-y-eda#t-uno';
const T2 = 'analisis-datos/limpieza-y-eda#t-dos';
const T3 = 'soporte/prioridad-y-sla#t-tres';
const catalogo: Catalogo = {
  areas: [
    { id: 'analisis-datos', nombre: 'Análisis de datos', orden: 1, color: '#2563eb', colorOscuro: '#60a5fa', exigeCasoDeGuardia: false },
    { id: 'soporte', nombre: 'Soporte técnico', orden: 2, color: '#4d7c0f', colorOscuro: '#a3e635', exigeCasoDeGuardia: true },
  ],
  temas: [
    { id: 'analisis-datos/limpieza-y-eda', area: 'analisis-datos', titulo: 'Limpieza', orden: 1 },
    { id: 'soporte/prioridad-y-sla', area: 'soporte', titulo: 'Prioridad', orden: 1 },
  ],
  tarjetas: [
    { id: T1, tema: 'analisis-datos/limpieza-y-eda', area: 'analisis-datos', frenteHtml: '<p>a</p>', dorsoHtml: '<p>b</p>' },
    { id: T2, tema: 'analisis-datos/limpieza-y-eda', area: 'analisis-datos', frenteHtml: '<p>c</p>', dorsoHtml: '<p>d</p>' },
    { id: T3, tema: 'soporte/prioridad-y-sla', area: 'soporte', frenteHtml: '<p>e</p>', dorsoHtml: '<p>f</p>' },
  ],
  ejercicios: [{ id: 'analisis-datos/limpieza-y-eda#e-uno', tema: 'analisis-datos/limpieza-y-eda', area: 'analisis-datos' }],
  casos: [{ id: 'soporte/prioridad-y-sla#c-uno', tema: 'soporte/prioridad-y-sla', area: 'soporte' }],
};

const AHORA = new Date('2026-01-01T12:00:00-03:00');

async function progresoDeEjemplo(): Promise<ProgresoV1> {
  let p = progresoVacio();
  p = await calificar(p, T1, 3, AHORA);
  p = await calificar(p, T2, 4, AHORA);
  p = {
    ...p,
    ejercicios: { 'analisis-datos/limpieza-y-eda#e-uno': { intentos: 2, aciertos: 1, ultimoResultado: 'acierto', ultimoEn: AHORA.toISOString() } },
    casos: { 'soporte/prioridad-y-sla#c-uno': { intentos: 1, mejorResultado: 'regular', ultimoResultado: 'regular', ultimoEn: AHORA.toISOString() } },
  };
  return p;
}

describe('FSRS con reloj fijo (criterio 4)', () => {
  it('califica "Bien" una tarjeta nueva y vuelve a "para hoy" recién el día de su dueAt', async () => {
    const p = await calificar(progresoVacio(), T1, 3, AHORA);
    const card = p.tarjetas[T1]!.card;
    const due = new Date(card.dueAt);
    expect(due.getTime()).toBeGreaterThan(AHORA.getTime());
    // el día local de `due`: 23:59:59 del día anterior → no toca; 00:00:00 del día de due → toca
    const diaDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const anterior = new Date(diaDue.getTime() - 1000);
    expect(estaParaHoy(card, anterior)).toBe(false);
    expect(estaParaHoy(card, diaDue)).toBe(true);
    expect(estaParaHoy(card, AHORA)).toBe(false);
  });

  it('agrega un renglón al revlog y suma 1 al día de estudio', async () => {
    const p = await calificar(progresoVacio(), T1, 3, AHORA);
    expect(p.revlog).toHaveLength(1);
    expect(p.revlog[0]!.log.state).toBe(0);
    expect(p.diasDeEstudio[diaLocal(AHORA)]).toBe(1);
  });

  it('es inmutable: no toca el progreso anterior', async () => {
    const p0 = progresoVacio();
    await calificar(p0, T1, 3, AHORA);
    expect(p0).toEqual(progresoVacio());
  });

  it('un card que pasó por JSON se puede volver a calificar (trampa SRSSchemaError)', async () => {
    const p = await calificar(progresoVacio(), T1, 3, AHORA);
    const viaJson = JSON.parse(JSON.stringify(p)) as ProgresoV1;
    const plan = await crearPlanificador();
    const dosDias = new Date(AHORA.getTime() + 3 * 86_400_000);
    expect(() => plan.review({ card: viaJson.tarjetas[T1]!.card as never, grade: 3, now: dosDias })).toThrow(); // sin reconvertir falla
    const c = deserializarCard(viaJson.tarjetas[T1]!.card);
    expect(c.dueAt).toBeInstanceOf(Date);
    const p2 = calificarSync(plan, viaJson, T1, 3, dosDias);
    expect(p2.tarjetas[T1]!.card.reps).toBe(2);
  });

  it('"Otra vez" deja la tarjeta para más tarde hoy; "Fácil" la manda lejos', async () => {
    const a = await calificar(progresoVacio(), T1, 1, AHORA);
    const f = await calificar(progresoVacio(), T1, 4, AHORA);
    expect(estaParaHoy(a.tarjetas[T1]!.card, AHORA)).toBe(true);
    expect(estaParaHoy(f.tarjetas[T1]!.card, AHORA)).toBe(false);
  });

  it('textoIntervalo', () => {
    const d = (min: number) => new Date(AHORA.getTime() + min * 60_000);
    expect(textoIntervalo(AHORA, d(1))).toBe('1 min');
    expect(textoIntervalo(AHORA, d(180))).toBe('3 h');
    expect(textoIntervalo(AHORA, d(60 * 24 * 4))).toBe('4 d');
    expect(textoIntervalo(AHORA, d(60 * 24 * 60))).toBe('2 meses');
  });
});

describe('cola del repaso', () => {
  it('nuevas respetan el límite diario y el modo tema lo ignora', () => {
    const p = progresoVacio();
    expect(contarParaHoy(construirCola(catalogo, p, AHORA, 2))).toBe(2);
    expect(construirCola(catalogo, p, AHORA, 2).nuevasFuera).toBe(1);
    expect(construirCola(catalogo, p, AHORA, 0, { tema: 'analisis-datos/limpieza-y-eda' }).nuevas).toHaveLength(2);
    expect(construirCola(catalogo, p, AHORA, 10, { area: 'soporte' }).nuevas.map((t) => t.id)).toEqual([T3]);
  });
  it('las calificadas hoy cuentan contra el límite; una vencida aparece en su día', async () => {
    const p = await calificar(progresoVacio(), T1, 3, AHORA);
    expect(construirCola(catalogo, p, AHORA, 3).nuevas).toHaveLength(2);
    expect(construirCola(catalogo, p, AHORA, 1).nuevas).toHaveLength(0);
    const luego = new Date(p.tarjetas[T1]!.card.dueAt);
    expect(construirCola(catalogo, p, luego, 0).vencidas.map((t) => t.id)).toEqual([T1]);
  });
  it('las tarjetas huérfanas nunca entran', async () => {
    const p = await calificar(progresoVacio(), 'borrado/tema#t-viejo', 1, AHORA);
    expect(contarParaHoy(construirCola(catalogo, p, AHORA, 0))).toBe(0);
  });
});

describe('import / export (criterio 5)', () => {
  it('serialización: exportar → importar en un almacén vacío da el mismo progreso', async () => {
    const p = await progresoDeEjemplo();
    const { nombre, texto } = exportarProgreso(p, AHORA);
    expect(nombre).toBe('campus-progreso-2026-01-01.json');
    const vacio = almacenEnMemoria();
    const r = await importarProgreso(texto, vacio, AHORA);
    expect(r.ok).toBe(true);
    expect(await leerProgresoDe(vacio)).toEqual({ ...p, exportadoEn: null });
  });

  it('import válido: calcularPanel da los mismos números antes y después', async () => {
    const p = await progresoDeEjemplo();
    const vacio = almacenEnMemoria();
    await importarProgreso(exportarProgreso(p, AHORA).texto, vacio, AHORA);
    const despues = await leerProgresoDe(vacio);
    const antes = await calcularPanel(catalogo, p, AHORA);
    expect(await calcularPanel(catalogo, despues, AHORA)).toEqual(antes);
  });

  const casosInvalidos: [string, (p: ProgresoV1) => string, RegExp][] = [
    ['texto que no es JSON', () => 'esto no es json {', /no es un JSON válido/],
    ['JSON de otra app', (p) => JSON.stringify({ ...p, app: 'otra-app' }), /no es un progreso del campus/],
    ['version 2', (p) => JSON.stringify({ ...p, version: 2 }), /versión más nueva.*v2/],
    ['dueAt inválido', (p) => JSON.stringify({ ...p, tarjetas: { [T1]: { card: { ...p.tarjetas[T1]!.card, dueAt: 'ayer' } } } }), /tarjetas\..*dueAt/],
    ['aciertos mayores que intentos', (p) => JSON.stringify({ ...p, ejercicios: { 'a/b#e-x': { intentos: 1, aciertos: 5, ultimoResultado: 'error', ultimoEn: AHORA.toISOString() } } }), /aciertos/],
    ['id de tarjeta con prefijo de ejercicio', (p) => JSON.stringify({ ...p, tarjetas: { 'a/b#e-x': p.tarjetas[T1] } }), /tarjetas/],
  ];
  for (const [nombre, armar, mensaje] of casosInvalidos) {
    it(`si el JSON es inválido (${nombre}) avisa y el almacén queda idéntico`, async () => {
      const P = await progresoDeEjemplo();
      const almacen = almacenEnMemoria({ [CLAVE_PROGRESO]: P });
      const antes = structuredClone([...almacen.datos.entries()]);
      const r = await importarProgreso(armar(P), almacen, AHORA);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(mensaje);
      expect([...almacen.datos.entries()]).toEqual(antes);
      expect(almacen.datos.has(CLAVE_ANTES)).toBe(false);
    });
  }

  it('el análisis informa como máximo 5 problemas', () => {
    const p = progresoVacio();
    const malo = { ...p, diasDeEstudio: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`fecha-${i}`, 1])) };
    const r = analizarImport(JSON.stringify(malo));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.split('\n').length).toBeLessThanOrEqual(6);
  });

  it('al confirmar se guarda la copia previa; deshacer la restaura; reiniciar borra todo', async () => {
    const P = await progresoDeEjemplo();
    const almacen = almacenEnMemoria({ [CLAVE_PROGRESO]: P });
    const otro = await calificar(progresoVacio(), T3, 3, AHORA);
    await confirmarImport(otro, almacen);
    expect((await leerProgresoDe(almacen)).tarjetas).toHaveProperty([T3]);
    expect(almacen.datos.get(CLAVE_ANTES)).toEqual(P);
    expect(await deshacerImportacion(almacen)).toBe(true);
    expect(await leerProgresoDe(almacen)).toEqual(P);
    expect(almacen.datos.has(CLAVE_ANTES)).toBe(false);
    expect(await deshacerImportacion(almacen)).toBe(false);
    await reiniciarProgreso(almacen);
    expect(almacen.datos.size).toBe(0);
  });

  it('huérfanos: se conservan al importar, se cuentan y se pueden limpiar', async () => {
    let p = await progresoDeEjemplo();
    p = await calificar(p, 'tema-viejo/borrado#t-x', 3, AHORA);
    const a = analizarImport(exportarProgreso(p, AHORA).texto, catalogo);
    expect(a.ok && a.resumen.huerfanos).toBe(1);
    expect(a.ok && Object.keys(a.progreso.tarjetas)).toContain('tema-viejo/borrado#t-x');
    expect(contarHuerfanos(p, catalogo)).toBe(1);
    const limpio = limpiarHuerfanos(p, catalogo);
    expect(contarHuerfanos(limpio, catalogo)).toBe(0);
    expect(limpio.revlog.every((r) => r.tarjeta !== 'tema-viejo/borrado#t-x')).toBe(true);
  });

  it('un archivo de la misma versión con campos extra de ts-fsrs se acepta (looseObject)', async () => {
    const p = await progresoDeEjemplo();
    const raro = structuredClone(p) as ProgresoV1;
    (raro.tarjetas[T1]!.card as Record<string, unknown>).campoNuevo = 123;
    expect(analizarImport(JSON.stringify(raro)).ok).toBe(true);
  });
});

describe('métricas del panel', () => {
  it('dominio: sin progreso es 0; los huérfanos y el ejemplo no cuentan', async () => {
    const panel = await calcularPanel(catalogo, progresoVacio(), AHORA);
    expect(panel.areas.map((a) => a.dominio)).toEqual([0, 0]);
    const conHuerfano = await calificar(progresoVacio(), 'otro/tema#t-x', 4, AHORA);
    expect((await calcularPanel(catalogo, conHuerfano, AHORA)).areas.map((a) => a.dominio)).toEqual([0, 0]);
  });
  it('dominio pesa 0,7 tarjetas + 0,3 ejercicios sin casos, y 0,6 / 0,3 / 0,1 con casos', async () => {
    const p = await progresoDeEjemplo();
    const panel = await calcularPanel(catalogo, p, AHORA);
    const ad = panel.areas.find((a) => a.id === 'analisis-datos')!;
    expect(ad.ejercicios).toBe(1);
    expect(ad.tarjetasVistas).toBe(2);
    // 2 tarjetas de 2 recién calificadas: retención ≈ 1
    expect(ad.tarjetas).toBeGreaterThan(0.95);
    expect(ad.dominio).toBe(Math.round(100 * (0.7 * ad.tarjetas + 0.3 * 1)));
    const so = panel.areas.find((a) => a.id === 'soporte')!;
    expect(so.casos).toBe(0.5);
    expect(so.dominio).toBe(Math.round(100 * (0.6 * 0 + 0.3 * 0 + 0.1 * 0.5)));
  });
  it('la retención baja con el tiempo si no repasás', async () => {
    const p = await progresoDeEjemplo();
    const hoy = (await calcularPanel(catalogo, p, AHORA)).areas[0]!.dominio;
    const luego = (await calcularPanel(catalogo, p, new Date(AHORA.getTime() + 90 * 86_400_000))).areas[0]!.dominio;
    expect(luego).toBeLessThan(hoy);
  });
  it('para hoy, próximos 7 días y calendario de 26 semanas', async () => {
    const p = await progresoDeEjemplo();
    const panel = await calcularPanel(catalogo, p, AHORA);
    expect(panel.paraHoy.total).toBe(1); // solo T3 es nueva y ninguna de las vistas toca hoy
    expect(panel.proximos7).toHaveLength(7);
    expect(panel.calendario).toHaveLength(26);
    expect(panel.calendario.every((s) => s.length === 7)).toBe(true);
    const hoyCelda = panel.calendario.flat().find((c) => c.dia === diaLocal(AHORA))!;
    expect(hoyCelda.cantidad).toBe(2);
    expect(hoyCelda.nivel).toBe(1);
  });
  it('racha: días consecutivos que terminan hoy o ayer', () => {
    const dias = { '2025-12-30': 1, '2025-12-31': 3, '2026-01-01': 2 };
    expect(calcularRacha(dias, AHORA)).toBe(3);
    expect(calcularRacha({ '2025-12-30': 1, '2025-12-31': 1 }, AHORA)).toBe(2); // terminó ayer
    expect(calcularRacha({ '2025-12-29': 1 }, AHORA)).toBe(0);
    expect(nivelDeIntensidad(0)).toBe(0);
    expect(nivelDeIntensidad(5)).toBe(1);
    expect(nivelDeIntensidad(6)).toBe(2);
    expect(nivelDeIntensidad(16)).toBe(3);
  });
});
