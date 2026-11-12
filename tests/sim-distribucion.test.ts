// Tests de la lógica pura de SimDistribucion (SIMULADORES.md §2.3) y de la matemática compartida.
import { describe, expect, it } from 'vitest';
import { cdfNormal, cuantilNormal, erf, erfc, pdfNormal, pmfBinomial, pmfPoisson } from '../src/simuladores/estadistica/matematica';
import {
  intervaloInicial, momentos, parametrosIniciales, probIntervalo, probIntervaloAproxNormal, rangoIntervalo, soporteDiscreto,
} from '../src/simuladores/distribucion/modelo';
import { num } from '../src/simuladores/formato';

describe('erf y la normal', () => {
  it('erf coincide con valores de referencia', () => {
    expect(erf(0)).toBe(0);
    expect(Math.abs(erf(0.5) - 0.5204998778130465)).toBeLessThan(1e-9);
    expect(Math.abs(erf(1) - 0.8427007929497149)).toBeLessThan(1e-9);
    expect(Math.abs(erf(2) - 0.9953222650189527)).toBeLessThan(1e-9);
    expect(Math.abs(erf(-1) + 0.8427007929497149)).toBeLessThan(1e-9);
    expect(Math.abs(erfc(3) - 2.209049699858544e-5)).toBeLessThan(1e-12);
    expect(Math.abs(erfc(2) - 0.004677734981047266)).toBeLessThan(1e-12);
  });
  it('P(-1 ≤ Z ≤ 1) = 0,6827 y los cuantiles clásicos', () => {
    const p = cdfNormal(1) - cdfNormal(-1);
    expect(Math.abs(p - 0.6826894921370859)).toBeLessThan(1e-7);
    expect(num(p, 4)).toBe('0,6827');
    expect(Math.abs(cdfNormal(1.96) - 0.9750021048517795)).toBeLessThan(1e-7);
    expect(Math.abs(cuantilNormal(0.975) - 1.959963984540054)).toBeLessThan(1e-7);
    expect(Math.abs(cuantilNormal(0.995) - 2.5758293035489)).toBeLessThan(1e-7);
  });
  it('la cdf es simétrica y monótona; la pdf integra ~1', () => {
    for (const z of [0.1, 0.7, 1.5, 3.2]) expect(Math.abs(cdfNormal(z) + cdfNormal(-z) - 1)).toBeLessThan(1e-12);
    let s = 0;
    for (let x = -8; x < 8; x += 0.001) s += pdfNormal(x) * 0.001;
    expect(Math.abs(s - 1)).toBeLessThan(1e-6);
  });
});

describe('momentos (media, varianza, desvío)', () => {
  it('binomial n = 10, p = 0,5 → media 5,00 y varianza 2,50', () => {
    const m = momentos('binomial', parametrosIniciales('binomial'));
    expect(num(m.media, 2)).toBe('5,00');
    expect(num(m.varianza, 2)).toBe('2,50');
    expect(num(m.desvio, 2)).toBe('1,58');
  });
  it('poisson λ = 4 → media = varianza = 4,00', () => {
    const m = momentos('poisson', parametrosIniciales('poisson'));
    expect(num(m.media, 2)).toBe('4,00');
    expect(num(m.varianza, 2)).toBe('4,00');
  });
  it('normal, exponencial y uniforme por defecto', () => {
    expect(momentos('normal', parametrosIniciales('normal'))).toMatchObject({ media: 0, varianza: 1, desvio: 1 });
    expect(momentos('exponencial', parametrosIniciales('exponencial'))).toMatchObject({ media: 1, varianza: 1 });
    const u = momentos('uniforme', parametrosIniciales('uniforme'));
    expect(num(u.media, 2)).toBe('0,50');
    expect(num(u.varianza, 4)).toBe('0,0833');
  });
  it('`lambda` de la prop se aplica solo a la distribución inicial', () => {
    expect(parametrosIniciales('exponencial', { lambda: 2 })).toMatchObject({ lambdaExp: 2, lambdaPoisson: 4 });
    expect(parametrosIniciales('poisson', { lambda: 7 })).toMatchObject({ lambdaPoisson: 7, lambdaExp: 1 });
  });
});

describe('probabilidad del intervalo', () => {
  it('normal μ = 0, σ = 1, [−1, 1] → 0,6827', () => {
    const p = probIntervalo('normal', parametrosIniciales('normal'), -1, 1);
    expect(num(p, 4)).toBe('0,6827');
  });
  it('normal con otros parámetros usa la cdf estandarizada', () => {
    const par = parametrosIniciales('normal', { mu: 2, sigma: 3 });
    expect(Math.abs(probIntervalo('normal', par, -1, 5) - 0.6826894921370859)).toBeLessThan(1e-7);
  });
  it('binomial: suma de la pmf entre desde y hasta, ambos incluidos', () => {
    const par = parametrosIniciales('binomial');
    // C(10,k)/1024 para k = 4, 5, 6 → 210 + 252 + 210 = 672
    expect(probIntervalo('binomial', par, 4, 6)).toBeCloseTo(672 / 1024, 10);
    expect(probIntervalo('binomial', par, 5, 5)).toBeCloseTo(252 / 1024, 10);
    expect(probIntervalo('binomial', par, 0, 10)).toBeCloseTo(1, 10);
  });
  it('poisson: P(0 ≤ X ≤ 2) con λ = 4', () => {
    const par = parametrosIniciales('poisson');
    expect(probIntervalo('poisson', par, 0, 2)).toBeCloseTo(Math.exp(-4) * (1 + 4 + 8), 10);
  });
  it('exponencial y uniforme con la cdf', () => {
    expect(probIntervalo('exponencial', parametrosIniciales('exponencial'), 0, 1)).toBeCloseTo(1 - Math.exp(-1), 10);
    expect(probIntervalo('uniforme', parametrosIniciales('uniforme'), 0.25, 0.75)).toBeCloseTo(0.5, 10);
    expect(probIntervalo('uniforme', parametrosIniciales('uniforme', { a: 2, b: 6 }), 3, 4)).toBeCloseTo(0.25, 10);
  });
  it('las pmf suman 1 y la aproximación normal corregida se acerca en la binomial', () => {
    const par = parametrosIniciales('binomial', { n: 100, p: 0.4 });
    let s = 0;
    for (const k of soporteDiscreto('binomial', par)) s += pmfBinomial(par.n, par.p, k);
    expect(s).toBeCloseTo(1, 10);
    const exacta = probIntervalo('binomial', par, 35, 45);
    expect(Math.abs(probIntervaloAproxNormal('binomial', par, 35, 45) - exacta)).toBeLessThan(0.01);
    let sp = 0;
    for (let k = 0; k < 80; k++) sp += pmfPoisson(12, k);
    expect(sp).toBeCloseTo(1, 10);
  });
});

describe('intervalo inicial y rango de sliders', () => {
  it('normal estándar arranca en [−1, 1] (media ± desvío)', () => {
    expect(intervaloInicial('normal', parametrosIniciales('normal'))).toEqual([-1, 1]);
  });
  it('discretas con enteros dentro del soporte', () => {
    const [d, h] = intervaloInicial('binomial', parametrosIniciales('binomial'));
    expect(Number.isInteger(d) && Number.isInteger(h) && d < h && d >= 0 && h <= 10).toBe(true);
    expect(rangoIntervalo('binomial', parametrosIniciales('binomial'))).toMatchObject({ min: 0, max: 10, paso: 1 });
  });
  it('exponencial y uniforme quedan dentro del soporte', () => {
    const [d, h] = intervaloInicial('exponencial', parametrosIniciales('exponencial'));
    expect(d).toBe(0);
    expect(h).toBeGreaterThan(d);
    const [du, hu] = intervaloInicial('uniforme', parametrosIniciales('uniforme'));
    expect(du).toBeGreaterThanOrEqual(0);
    expect(hu).toBeLessThanOrEqual(1);
  });
});
