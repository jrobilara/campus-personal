import { describe, expect, it } from 'vitest';
import { FUNCIONES, PUNTOS_ERROR, W_OPTIMO, pendienteSecante, puntosCriticos } from '../src/simuladores/funcion/funciones';
import { estadoDescenso, sigueVivo, trayectoria, LIMITE_X } from '../src/simuladores/funcion/descenso';
import {
  aliasesDe, componentesFiltradas, espectro, frecuenciaAparente, frecuenciaMax, instantesMuestreo, lineasDeComponentes, lineasRuido,
  pasaBajos, sePliega, valor, hz,
} from '../src/simuladores/funcion/senal';
import { num } from '../src/simuladores/formato';

const ultimo = (xs: number[]) => xs[xs.length - 1]!;

describe('SimFuncion · tangente', () => {
  it('cuadrática con x0 = 0: la derivada vale 0,00 (tangente horizontal)', () => {
    expect(num(FUNCIONES.cuadratica.df(0))).toBe('0,00');
  });
  it('con h = 0,01 la pendiente de la secante queda a menos de 0,05 de la derivada, en todas las funciones', () => {
    for (const k of Object.keys(FUNCIONES) as (keyof typeof FUNCIONES)[]) {
      for (const x0 of [-2, -0.5, 1, 2.5]) {
        const fn = FUNCIONES[k];
        expect(Math.abs(pendienteSecante(fn, x0, 0.01) - fn.df(x0)), `${k} en ${x0}`).toBeLessThan(0.05 * Math.max(1, Math.abs(fn.d2f(x0)) / 2 + 1));
      }
    }
  });
  it('cuadrática: f(2) = 4, f′(2) = 4 y la secante entre 2 y 3 tiene pendiente 5', () => {
    expect(FUNCIONES.cuadratica.f(2)).toBe(4);
    expect(FUNCIONES.cuadratica.df(2)).toBe(4);
    expect(pendienteSecante(FUNCIONES.cuadratica, 2, 1)).toBe(5);
  });
  it('las derivadas analíticas coinciden con las numéricas en todas las funciones', () => {
    for (const k of Object.keys(FUNCIONES) as (keyof typeof FUNCIONES)[]) {
      const fn = FUNCIONES[k];
      for (const x of [-1.7, -0.3, 0.4, 1.9]) {
        const e = 1e-5;
        expect(fn.df(x)).toBeCloseTo((fn.f(x + e) - fn.f(x - e)) / (2 * e), 4);
        expect(fn.d2f(x)).toBeCloseTo((fn.df(x + e) - fn.df(x - e)) / (2 * e), 4);
      }
    }
  });
});

describe('SimFuncion · funciones del doc', () => {
  it('doble-pozo: mínimo local cerca de x ≈ 1,13 y global cerca de x ≈ −1,30', () => {
    const minimos = puntosCriticos(FUNCIONES['doble-pozo'], -3, 3).filter((x) => FUNCIONES['doble-pozo'].d2f(x) > 0);
    expect(minimos).toHaveLength(2);
    expect(minimos[0]!).toBeCloseTo(-1.3, 1);
    expect(minimos[1]!).toBeCloseTo(1.13, 2);
    expect(FUNCIONES['doble-pozo'].f(minimos[0]!)).toBeLessThan(FUNCIONES['doble-pozo'].f(minimos[1]!));
  });
  it('error-cuadratico: 8 puntos fijos con pendiente real 2 y mínimo en w ≈ 2', () => {
    expect(PUNTOS_ERROR).toHaveLength(8);
    expect(W_OPTIMO).toBeGreaterThan(1.9);
    expect(W_OPTIMO).toBeLessThan(2.1);
    const E = FUNCIONES['error-cuadratico'];
    const directo = (w: number) => PUNTOS_ERROR.reduce((s, [x, y]) => s + (y - w * x) ** 2, 0) / PUNTOS_ERROR.length;
    for (const w of [-1, 0, 1.5, 2, 3]) expect(E.f(w)).toBeCloseTo(directo(w), 10);
    expect(E.df(W_OPTIMO)).toBeCloseTo(0, 10);
  });
  it('cúbica x³ − 3x, seno, exponencial y logística valen lo que dice el doc', () => {
    expect(FUNCIONES.cubica.f(2)).toBe(2);
    expect(FUNCIONES.seno.f(Math.PI / 2)).toBeCloseTo(1, 12);
    expect(FUNCIONES.exponencial.f(0)).toBe(1);
    expect(FUNCIONES.logistica.f(0)).toBe(0.5);
  });
});

describe('SimFuncion · descenso por gradiente', () => {
  const Q = FUNCIONES.cuadratica;
  it('cuadrática con tasa 0,1 desde x0 = 3: baja hacia 0 y el estado es convergiendo', () => {
    const xs = trayectoria(Q, 3, 0.1, 50);
    expect(xs).toHaveLength(51);
    expect(xs[1]).toBeCloseTo(2.4, 12); // 3 − 0,1·6
    expect(Math.abs(ultimo(xs))).toBeLessThan(1e-4);
    expect(estadoDescenso(Q, xs, 0.1)).toBe('convergiendo');
    expect(estadoDescenso(Q, xs.slice(0, 1), 0.1)).toBe('convergiendo');
  });
  it('tasa 1,1 (factor |1 − 2·tasa| = 1,2 > 1): los puntos saltan de lado a lado alejándose → divergiendo', () => {
    const xs = trayectoria(Q, 3, 1.1, 10);
    for (let i = 1; i < xs.length; i++) expect(Math.sign(xs[i]!)).toBe(-Math.sign(xs[i - 1]!));
    expect(Math.abs(xs[3]!)).toBeGreaterThan(Math.abs(xs[1]!));
    expect(estadoDescenso(Q, xs, 1.1)).toBe('divergiendo');
    expect(estadoDescenso(Q, xs.slice(0, 2), 1.1)).toBe('divergiendo'); // ya con 1 paso se sabe
  });
  it('una tasa grande pero estable (0,9: factor −0,8) oscila de un lado al otro sin alejarse', () => {
    const xs = trayectoria(Q, 3, 0.9, 6);
    expect(estadoDescenso(Q, xs, 0.9)).toBe('oscilando');
    expect(estadoDescenso(Q, xs.slice(0, 2), 0.9)).toBe('oscilando');
  });
  it('tasa 1 sobre x²: salta entre 3 y −3 para siempre (factor −1): no converge, no explota', () => {
    const xs = trayectoria(Q, 3, 1, 10);
    expect(xs.map(Math.abs).every((v) => Math.abs(v - 3) < 1e-9)).toBe(true);
  });
  it('doble-pozo desde x0 = 2 con tasa 0,01: se queda en el mínimo local (x ≈ 1,13), no en el global', () => {
    const D = FUNCIONES['doble-pozo'];
    const xs = trayectoria(D, 2, 0.01, 50);
    expect(num(ultimo(xs), 3)).not.toBe(num(-1.3, 3));
    expect(ultimo(xs)).toBeGreaterThan(1);
    const largo = trayectoria(D, 2, 0.01, 5000);
    expect(ultimo(largo)).toBeCloseTo(1.13, 2);
  });
  it('una trayectoria que se dispara se corta en LIMITE_X y queda marcada como divergiendo', () => {
    const xs = trayectoria(Q, 3, 1.5, 500);
    expect(xs.length).toBeLessThan(500);
    expect(Math.abs(ultimo(xs))).toBeGreaterThan(LIMITE_X);
    expect(sigueVivo(xs)).toBe(false);
    expect(estadoDescenso(Q, xs, 1.5)).toBe('divergiendo');
  });
  it('error-cuadratico: el descenso encuentra la pendiente w ≈ 2', () => {
    const xs = trayectoria(FUNCIONES['error-cuadratico'], 0, 0.3, 50);
    expect(ultimo(xs)).toBeCloseTo(W_OPTIMO, 3);
  });
});

describe('SimFuncion · señal', () => {
  it('con una componente de 10 Hz y fs = 12 Hz el alias es de 2 Hz; con fs ≥ 21 Hz no hay alias', () => {
    const comps = [{ frecuencia: 10, amplitud: 1 }];
    expect(aliasesDe(comps, 12)).toEqual([2]);
    expect(sePliega(10, 12)).toBe(true);
    expect(aliasesDe(comps, 21)).toEqual([]);
    expect(aliasesDe(comps, 40)).toEqual([]);
    expect(aliasesDe(comps, 20)).toEqual([]); // justo Nyquist: no se pliega
  });
  it('la frecuencia aparente de 10 Hz muestreada a 12 Hz es −2 Hz (senoidal dada vuelta), de módulo 2', () => {
    expect(frecuenciaAparente(10, 12)).toBe(-2);
    expect(frecuenciaAparente(3, 40)).toBe(3);
  });
  it('el alias pasa exactamente por las muestras', () => {
    const lineas = lineasDeComponentes([{ frecuencia: 10, amplitud: 1 }]);
    const alias = lineas.map((l) => ({ ...l, frecuencia: frecuenciaAparente(l.frecuencia, 12) }));
    for (const t of instantesMuestreo(12)) expect(valor(alias, t)).toBeCloseTo(valor(lineas, t), 9);
  });
  it('filtro pasa-bajos con corte 5 Hz: una componente de 10 Hz sale del espectro y de la señal', () => {
    const comps = [{ frecuencia: 3, amplitud: 1 }, { frecuencia: 10, amplitud: 0.5 }];
    expect(componentesFiltradas(comps, 5)).toBe(1);
    expect(componentesFiltradas(comps, 30)).toBe(0);
    const barras = espectro(comps, [], 5);
    expect(barras.find((b) => b.frecuencia === 10)!.estado).toBe('filtrada');
    expect(barras.find((b) => b.frecuencia === 3)!.estado).toBe('activa');
    expect(pasaBajos(lineasDeComponentes(comps), 5)).toHaveLength(1);
  });
  it('frecuencia máxima ignora las componentes de amplitud 0', () => {
    expect(frecuenciaMax([{ frecuencia: 3, amplitud: 1 }, { frecuencia: 10, amplitud: 0 }])).toBe(3);
    expect(frecuenciaMax([{ frecuencia: 10, amplitud: 0 }])).toBeNull();
  });
  it('el ruido es determinista con la semilla y sin ruido no hay líneas', () => {
    expect(lineasRuido(42, 0)).toEqual([]);
    expect(lineasRuido(42, 0.5)).toEqual(lineasRuido(42, 0.5));
    expect(lineasRuido(42, 0.5)).not.toEqual(lineasRuido(7, 0.5));
  });
  it('los instantes de muestreo cubren 1 s: fs + 1 muestras; hz() usa coma decimal', () => {
    expect(instantesMuestreo(12)).toHaveLength(13);
    expect(hz(12)).toBe('12');
    expect(hz(2.5)).toBe('2,5');
  });
});
