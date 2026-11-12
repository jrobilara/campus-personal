import { describe, expect, it } from 'vitest';
import { calcularBayes, celdaPorPunto, grupoPorPunto, repartirPuntos, ORDEN_TEST, ORDEN_CONDICION } from '../src/simuladores/bayes/calculo';
import { num } from '../src/simuladores/formato';

const base = { prevalencia: 0.01, sensibilidad: 0.99, especificidad: 0.95, poblacion: 1000 };

describe('SimBayes · cálculo', () => {
  it('prevalencia 1 %, sensibilidad 99 %, especificidad 95 %: vpp ≈ 16,7 % (unos 59 positivos, unos 10 verdaderos)', () => {
    const r = calcularBayes(base);
    expect(num(r.vpp * 100, 1)).toBe('16,7');
    expect(r.vp + r.fp).toBe(59);
    expect(r.vp).toBe(10);
  });
  it('prevalencia 50 %: vpp ≈ 95,2 %', () => {
    expect(num(calcularBayes({ ...base, prevalencia: 0.5 }).vpp * 100, 1)).toBe('95,2');
  });
  it('los cuatro conteos suman la población (1000 y 10 000)', () => {
    for (const poblacion of [1000, 10000] as const) {
      for (const prevalencia of [0.001, 0.0137, 0.2, 0.5]) {
        const r = calcularBayes({ ...base, prevalencia, poblacion });
        expect(r.vp + r.fp + r.fn + r.vn).toBe(poblacion);
        expect(r.vp + r.fn).toBe(r.enfermos);
      }
    }
  });
  it('con 10 000 los conteos escalan', () => {
    const r = calcularBayes({ ...base, poblacion: 10000 });
    expect(r).toMatchObject({ enfermos: 100, vp: 99, fn: 1, vn: 9405, fp: 495 });
  });
  it('vpn: casi 100 % cuando la enfermedad es rara', () => {
    expect(num(calcularBayes(base).vpn * 100, 1)).toBe('100,0');
  });
});

describe('SimBayes · grilla de puntos', () => {
  it('reparte siempre 1000 puntos y un grupo con gente nunca queda vacío', () => {
    for (const poblacion of [1000, 10000] as const) {
      for (const prevalencia of [0.001, 0.01, 0.3, 0.5]) {
        const r = calcularBayes({ ...base, prevalencia, poblacion });
        const p = repartirPuntos(r, 1000);
        expect(p.vp + p.fp + p.fn + p.vn).toBe(1000);
        for (const g of ['vp', 'fp', 'fn', 'vn'] as const) if (r[g] > 0) expect(p[g]).toBeGreaterThan(0);
      }
    }
  });
  it('con 1000 de población hay un punto por persona', () => {
    const r = calcularBayes(base);
    expect(repartirPuntos(r, 1000)).toEqual({ vp: r.vp, fn: r.fn, fp: r.fp, vn: r.vn });
  });
  it('las celdas de ambos órdenes son una permutación de 0..999', () => {
    const p = repartirPuntos(calcularBayes(base), 1000);
    expect(grupoPorPunto(p)).toHaveLength(1000);
    for (const orden of [ORDEN_CONDICION, ORDEN_TEST]) {
      const celdas = celdaPorPunto(p, orden);
      expect([...celdas].sort((a, b) => a - b)).toEqual(Array.from({ length: 1000 }, (_, i) => i));
    }
  });
});
