import { describe, expect, it } from 'vitest';
import {
  ANSCOMBE, CONTEO_TICKETS, CUARTETOS, anscombe, confusoraTemperatura, generarDataset, horasYNotas, latencias, ticketsSucios,
  UMBRAL_HORAS, EXTREMOS_LATENCIAS,
} from '../src/simuladores/presets/datasets';
import { cercas, cuantil, desvio, fueraDeEscala, histograma, media, mediana, regresion } from '../src/simuladores/datos/estadistica';
import {
  SIN_LIMPIEZA, agrupar, aplicarLimpieza, paresDe, regresionDe, regresionPorFranja, repetidas, resumir, seriesDe, valoresDe,
} from '../src/simuladores/datos/derivar';
import { num } from '../src/simuladores/formato';

describe('estadística', () => {
  it('media, mediana, cuantiles y desvío muestral', () => {
    const xs = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(media(xs)).toBe(5);
    expect(mediana(xs)).toBe(4.5);
    expect(cuantil([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75);
    expect(desvio(xs)).toBeCloseTo(2.138, 3);
  });
  it('regla 1.5·IQR', () => {
    const c = cercas([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
    expect(c.alto).toBeLessThan(100);
    expect(c.alto).toBeGreaterThan(9);
  });
  it('el histograma tiene exactamente `bins` barras y suma todos los valores', () => {
    const xs = Array.from({ length: 137 }, (_, i) => Math.sin(i) * 50 + 100);
    for (const b of [5, 20, 50]) {
      const h = histograma(xs, b);
      expect(h).toHaveLength(b);
      expect(h.reduce((s, x) => s + x.n, 0)).toBe(137);
    }
  });
  it('fueraDeEscala separa solo los valores lejísimos, no la cola natural', () => {
    const l = latencias(42, true);
    const { fuera } = fueraDeEscala(valoresDe(l.filas, 'latencia_ms'));
    expect(fuera).toEqual(Array(5).fill(30_000));
    expect(fueraDeEscala(valoresDe(latencias(42).filas, 'latencia_ms')).fuera).toEqual([]);
  });
});

describe('tickets-sucios: conteos exactos del doc', () => {
  const ds = ticketsSucios(42);
  it('200 filas con 8 duplicadas', () => {
    expect(ds.filas).toHaveLength(CONTEO_TICKETS.total);
    expect(repetidas(ds.filas).filter(Boolean)).toHaveLength(8);
    expect(aplicarLimpieza(ds.filas, { ...SIN_LIMPIEZA, sinDuplicados: true })).toHaveLength(192);
  });
  it('6 con minutos vacíos, y ninguno entre las duplicadas', () => {
    expect(ds.filas.filter((f) => f.minutos_resolucion === null)).toHaveLength(6);
    const ids = ds.filas.map((f) => f.id);
    const repetidos = new Set(ids.filter((id, i) => ids.indexOf(id) !== i));
    expect(ds.filas.filter((f) => f.minutos_resolucion === null && repetidos.has(f.id))).toHaveLength(0);
  });
  it('"quitar duplicados" → 192 filas y "quitar faltantes" → 186', () => {
    const a = aplicarLimpieza(ds.filas, { ...SIN_LIMPIEZA, sinDuplicados: true });
    expect(resumir(ds, a).filas).toBe(192);
    const b = aplicarLimpieza(ds.filas, { ...SIN_LIMPIEZA, sinDuplicados: true, sinFaltantes: true });
    expect(resumir(ds, b).filas).toBe(186);
    expect(resumir(ds, b).faltantes).toBe(0);
    expect(resumir(ds, ds.filas).faltantes).toBe(6);
  });
  it('3 cargadas en horas (valores 1-5) y 2 outliers de más de 2000 minutos', () => {
    const v = valoresDe(ds.filas, 'minutos_resolucion');
    expect(v.filter((x) => x <= UMBRAL_HORAS)).toHaveLength(3);
    expect(v.filter((x) => x <= UMBRAL_HORAS).every((x) => x >= 1 && x <= 5)).toBe(true);
    expect(v.filter((x) => x > 2000)).toHaveLength(2);
  });
  it('"corregir unidades" (×60) deja las 3 filas en minutos razonables', () => {
    const f = aplicarLimpieza(ds.filas, { ...SIN_LIMPIEZA, corregirUnidades: true });
    const v = valoresDe(f, 'minutos_resolucion');
    expect(v.filter((x) => x <= UMBRAL_HORAS)).toHaveLength(0);
    expect(v.filter((x) => x >= 60 && x <= 120).length).toBeGreaterThanOrEqual(3);
  });
  it('con todo limpio, la regla 1.5·IQR marca exactamente los 2 outliers', () => {
    const f = aplicarLimpieza(ds.filas, { sinDuplicados: true, sinFaltantes: true, corregirUnidades: true, marcarOutliers: true });
    const r = resumir(ds, f);
    expect(r.outliers).toBe(2);
    expect(r.filas).toBe(186);
  });
  it('es determinista con la misma semilla y cambia con otra', () => {
    expect(ticketsSucios(42)).toEqual(ds);
    expect(ticketsSucios(7)).not.toEqual(ds);
    for (const s of [1, 7, 99, 2024]) {
      const d = ticketsSucios(s);
      expect(d.filas).toHaveLength(200);
      expect(repetidas(d.filas).filter(Boolean)).toHaveLength(8);
      expect(d.filas.filter((f) => f.minutos_resolucion === null)).toHaveLength(6);
      expect(aplicarLimpieza(d.filas, { ...SIN_LIMPIEZA, sinDuplicados: true, sinFaltantes: true })).toHaveLength(186);
    }
  });
});

describe('latencias', () => {
  const base = latencias(42);
  const v = valoresDe(base.filas, 'latencia_ms');
  it('500 latencias, mediana cerca de 120 ms, media a la derecha de la mediana', () => {
    expect(base.filas).toHaveLength(500);
    expect(mediana(v)).toBeGreaterThan(110);
    expect(mediana(v)).toBeLessThan(130);
    expect(media(v)).toBeGreaterThan(mediana(v));
    // σ ≈ 0,5 en escala log
    expect(desvio(v.map(Math.log))).toBeGreaterThan(0.45);
    expect(desvio(v.map(Math.log))).toBeLessThan(0.55);
  });
  it('"agregar valores extremos": suma 5 de 30 000, la media sube más de 200 ms y la mediana cambia menos de 2 ms', () => {
    const ext = valoresDe(latencias(42, true).filas, 'latencia_ms');
    expect(ext).toHaveLength(500 + EXTREMOS_LATENCIAS.cantidad);
    expect(media(ext) - media(v)).toBeGreaterThan(200);
    expect(Math.abs(mediana(ext) - mediana(v))).toBeLessThan(2);
  });
  it('los primeros 500 valores no cambian al agregar extremos', () => {
    expect(latencias(42, true).filas.slice(0, 500)).toEqual(base.filas);
  });
});

describe('anscombe (valores publicados de 1973)', () => {
  it('los cuatro cuartetos tienen r = 0,82, media de y 7,50 y recta y = 3,00 + 0,50·x', () => {
    for (const q of CUARTETOS) {
      const ds = anscombe(q);
      expect(ds.filas).toHaveLength(11);
      const rg = regresionDe(ds, ds.filas);
      expect(num(rg.r, 2)).toBe('0,82');
      expect(num(rg.pendiente, 2)).toBe('0,50');
      expect(num(rg.ordenada, 2)).toBe('3,00');
      expect(num(media(valoresDe(ds.filas, 'y')), 2)).toBe('7,50');
      expect(num(media(valoresDe(ds.filas, 'x')), 1)).toBe('9,0');
    }
  });
  it('trae los valores publicados', () => {
    expect(ANSCOMBE.I.y[0]).toBe(8.04);
    expect(ANSCOMBE.IV.x[7]).toBe(19);
    expect(ANSCOMBE.IV.y[7]).toBe(12.5);
    expect(ANSCOMBE.III.y[2]).toBe(12.74);
  });
});

describe('confusora-temperatura', () => {
  const ds = confusoraTemperatura(42);
  it('120 días; helados y golpes de calor muy correlacionados en conjunto', () => {
    expect(ds.filas).toHaveLength(120);
    expect(regresionDe(ds, ds.filas).r).toBeGreaterThan(0.8);
  });
  it('dentro de cada franja de temperatura casi no hay relación', () => {
    const rs = regresionPorFranja(ds, ds.filas);
    expect(rs).toHaveLength(3);
    for (const r of rs) expect(Math.abs(r.r)).toBeLessThan(0.2);
  });
  it('vale para otras semillas', () => {
    for (const s of [1, 7, 99]) {
      const d = confusoraTemperatura(s);
      expect(regresionDe(d, d.filas).r).toBeGreaterThan(0.8);
      for (const r of regresionPorFranja(d, d.filas)) expect(Math.abs(r.r)).toBeLessThan(0.2);
    }
  });
});

describe('horas-y-notas', () => {
  it('60 alumnos con nota ≈ 2 + 0,8·horas', () => {
    const ds = horasYNotas(42);
    expect(ds.filas).toHaveLength(60);
    const r = regresionDe(ds, ds.filas);
    expect(r.pendiente).toBeGreaterThan(0.65);
    expect(r.pendiente).toBeLessThan(0.95);
    expect(r.ordenada).toBeGreaterThan(1.2);
    expect(r.ordenada).toBeLessThan(2.8);
  });
  it('"agregar un outlier" suma un alumno y baja la pendiente', () => {
    const a = regresionDe(horasYNotas(42), horasYNotas(42).filas);
    const dsB = horasYNotas(42, true);
    expect(dsB.filas).toHaveLength(61);
    expect(regresionDe(dsB, dsB.filas).pendiente).toBeLessThan(a.pendiente - 0.1);
  });
});

describe('ventas-mensuales y vistas derivadas', () => {
  const ds = generarDataset('ventas-mensuales', 42);
  it('24 meses × 3 regiones', () => {
    expect(ds.filas).toHaveLength(72);
    const norte = ds.filas.filter((f) => f.region === 'Norte').map((f) => f.ventas as number);
    expect(norte[23]! - norte[0]!).toBeGreaterThan(70);
  });
  it('las agrupaciones suman lo esperado en cada dataset', () => {
    expect(agrupar(ds, ds.filas).items).toHaveLength(3);
    const t = ticketsSucios(42);
    expect(agrupar(t, t.filas).items.reduce((s, i) => s + i.valor, 0)).toBe(200);
    const l = latencias(42);
    expect(agrupar(l, l.filas).items.reduce((s, i) => s + i.valor, 0)).toBe(500);
    const a = anscombe('II');
    expect(agrupar(a, a.filas).items.reduce((s, i) => s + i.valor, 0)).toBe(11);
  });
  it('las series de líneas existen para todos los datasets', () => {
    for (const id of ['tickets-sucios', 'ventas-mensuales', 'latencias', 'anscombe', 'confusora-temperatura', 'horas-y-notas'] as const) {
      const d = generarDataset(id, 42);
      const s = seriesDe(d, d.filas);
      expect(s.series.length).toBeGreaterThan(0);
      expect(s.series.every((x) => x.puntos.length > 1)).toBe(true);
      expect(paresDe(d, d.filas).x.length).toBeGreaterThan(5);
    }
  });
  it('regresion() coincide con una recta exacta', () => {
    const r = regresion([1, 2, 3, 4], [3, 5, 7, 9]);
    expect(r.pendiente).toBeCloseTo(2);
    expect(r.ordenada).toBeCloseTo(1);
    expect(r.r2).toBeCloseTo(1);
  });
});
