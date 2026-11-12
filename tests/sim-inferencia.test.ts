// Tests de la lógica pura de SimInferencia (SIMULADORES.md §2.4): TCL, intervalos de confianza y experimento A/B.
import { describe, expect, it } from 'vitest';
import { cdfT, cuantilT } from '../src/simuladores/estadistica/matematica';
import { desvioMuestral, media, muestra, POBLACIONES, type Poblacion } from '../src/simuladores/inferencia/poblaciones';
import { histogramaMedias, mediasMuestrales, sigmaSobreRaizN } from '../src/simuladores/inferencia/tcl';
import { cobertura, construirIntervalos, criticoT, resumenMuestra, type Confianza } from '../src/simuladores/inferencia/intervalos';
import { binomialRapida, experimento, rechaza, teoriaAB } from '../src/simuladores/inferencia/ab';
import { mulberry32 } from '../src/simuladores/azar';

const POBS: Poblacion[] = ['uniforme', 'exponencial', 'bimodal', 'dado'];
const sd = (xs: number[]) => desvioMuestral(xs);

describe('t de Student', () => {
  it('cuantiles de tablas', () => {
    expect(Math.abs(cuantilT(0.975, 29) - 2.04523)).toBeLessThan(1e-4);
    expect(Math.abs(cuantilT(0.975, 1) - 12.7062)).toBeLessThan(1e-3);
    expect(Math.abs(cuantilT(0.995, 29) - 2.75639)).toBeLessThan(1e-4);
    expect(Math.abs(cuantilT(0.95, 10) - 1.81246)).toBeLessThan(1e-4);
    expect(Math.abs(cuantilT(0.975, 1000) - 1.96234)).toBeLessThan(1e-4);
  });
  it('cdf simétrica', () => {
    expect(cdfT(0, 5)).toBeCloseTo(0.5, 12);
    expect(cdfT(1.3, 7) + cdfT(-1.3, 7)).toBeCloseTo(1, 12);
  });
});

describe('poblaciones', () => {
  it('media y desvío teóricos coinciden con los empíricos', () => {
    for (const p of POBS) {
      const xs = muestra(p, 42, 9, 0, 20000);
      const info = POBLACIONES[p];
      expect(Math.abs(media(xs) - info.mu)).toBeLessThan(0.05 * info.sigma + 0.01);
      expect(Math.abs(sd(xs) / info.sigma - 1)).toBeLessThan(0.05);
    }
  });
  it('mismo estado + misma semilla = misma muestra', () => {
    expect(muestra('exponencial', 42, 1, 7, 5)).toEqual(muestra('exponencial', 42, 1, 7, 5));
    expect(muestra('exponencial', 42, 1, 7, 5)).not.toEqual(muestra('exponencial', 43, 1, 7, 5));
  });
});

describe('TCL', () => {
  it('σ/√n es el error estándar teórico', () => {
    expect(sigmaSobreRaizN('exponencial', 25)).toBeCloseTo(0.2, 12);
    expect(sigmaSobreRaizN('dado', 1)).toBeCloseTo(Math.sqrt(35 / 12), 12);
  });
  it('exponencial n = 1 es asimétrica; n = 30 con 1000 muestras acampana y el desvío queda a menos de 10 % de σ/√n', () => {
    const m1 = mediasMuestrales('exponencial', 42, 1, 0, 1000);
    const m = media(m1), s = sd(m1);
    const asim = m1.reduce((a, x) => a + ((x - m) / s) ** 3, 0) / m1.length;
    expect(asim).toBeGreaterThan(1);
    const m30 = mediasMuestrales('exponencial', 42, 30, 0, 1000);
    const asim30 = m30.reduce((a, x) => a + ((x - media(m30)) / sd(m30)) ** 3, 0) / m30.length;
    expect(asim30).toBeLessThan(0.7);
    const teorico = sigmaSobreRaizN('exponencial', 30);
    expect(Math.abs(sd(m30) / teorico - 1)).toBeLessThan(0.1);
    expect(Math.abs(media(m30) - 1)).toBeLessThan(3 * teorico / Math.sqrt(1000) * 2);
  });
  it('vale para las cuatro poblaciones con n = 30 y 1000 muestras', () => {
    for (const p of POBS) {
      const ms = mediasMuestrales(p, 42, 30, 0, 1000);
      expect(Math.abs(sd(ms) / sigmaSobreRaizN(p, 30) - 1)).toBeLessThan(0.1);
    }
  });
  it('las muestras no dependen de cómo se pidieron (por tandas o de una)', () => {
    const junto = mediasMuestrales('bimodal', 42, 10, 0, 300);
    const tandas = [...mediasMuestrales('bimodal', 42, 10, 0, 100), ...mediasMuestrales('bimodal', 42, 10, 100, 300)];
    expect(tandas).toEqual(junto);
  });
  it('el histograma de las medias cuenta todas las muestras (dado y continuas)', () => {
    for (const p of POBS) {
      for (const n of [1, 2, 5, 30, 100]) {
        const ms = mediasMuestrales(p, 42, n, 0, 500);
        const h = histogramaMedias(ms, p, n);
        const total = h.cuentas.reduce((a, b) => a + b, 0);
        expect(total).toBeGreaterThan(450);
        expect(h.bordes.length).toBe(h.cuentas.length + 1);
      }
    }
  });
  it('la densidad del histograma integra ~1 cuando no se recorta nada', () => {
    const ms = mediasMuestrales('uniforme', 42, 30, 0, 1000);
    const h = histogramaMedias(ms, 'uniforme', 30);
    const area = h.densidades.reduce((a, d, j) => a + d * (h.bordes[j + 1]! - h.bordes[j]!), 0);
    expect(area).toBeGreaterThan(0.99);
    expect(area).toBeLessThanOrEqual(1.0000001);
  });
});

describe('intervalos de confianza', () => {
  const armar = (p: Poblacion, n: number, c: Confianza, k: number, semilla = 42) =>
    construirIntervalos(Array.from({ length: k }, (_, i) => resumenMuestra(p, semilla, i, n)), n, c, POBLACIONES[p].mu);

  it('el valor crítico crece con la confianza (intervalos más anchos al pasar de 90 % a 99 %)', () => {
    expect(criticoT(0.9, 30)).toBeLessThan(criticoT(0.95, 30));
    expect(criticoT(0.95, 30)).toBeLessThan(criticoT(0.99, 30));
    const a90 = armar('dado', 30, 0.9, 100), a99 = armar('dado', 30, 0.99, 100);
    const ancho = (xs: ReturnType<typeof armar>) => media(xs.map((x) => x.sup - x.inf));
    expect(ancho(a99)).toBeGreaterThan(ancho(a90) * 1.3);
  });
  it('con 100 intervalos al 95 % la cobertura queda entre 88 % y 100 % (todas las poblaciones, n por defecto 30)', () => {
    for (const p of POBS) {
      const cob = cobertura(armar(p, 30, 0.95, 100));
      expect(cob).toBeGreaterThanOrEqual(88);
      expect(cob).toBeLessThanOrEqual(100);
    }
  });
  it('cobertura sin intervalos es NaN y cada intervalo contiene su media', () => {
    expect(cobertura([])).toBeNaN();
    for (const x of armar('uniforme', 10, 0.95, 20)) expect(x.inf).toBeLessThan(x.media);
  });
  it('a la larga la cobertura se acerca al nivel nominal (dado, 4000 muestras)', () => {
    const cob = cobertura(armar('dado', 30, 0.95, 4000, 7));
    expect(cob).toBeGreaterThan(93);
    expect(cob).toBeLessThan(97);
  });
});

describe('experimento A/B', () => {
  it('binomialRapida tiene la media y la varianza correctas', () => {
    const r = mulberry32(5);
    const xs = Array.from({ length: 4000 }, () => binomialRapida(r, 1000, 0.12));
    expect(Math.abs(media(xs) - 120)).toBeLessThan(1);
    expect(Math.abs(sd(xs) ** 2 / (1000 * 0.12 * 0.88) - 1)).toBeLessThan(0.1);
    expect(binomialRapida(r, 50, 0)).toBe(0);
    expect(binomialRapida(r, 50, 1)).toBe(50);
    const ys = Array.from({ length: 2000 }, () => binomialRapida(r, 200, 0.9));
    expect(Math.abs(media(ys) - 180)).toBeLessThan(0.7);
  });
  it('potencia teórica: sube con n y con la diferencia; con tasaB = tasaA vale alfa', () => {
    const base = teoriaAB(0.1, 0.12, 1000, 0.05);
    expect(base.potencia).toBeGreaterThan(0.2);
    expect(base.potencia).toBeLessThan(0.4);
    expect(teoriaAB(0.1, 0.12, 5000, 0.05).potencia).toBeGreaterThan(base.potencia);
    expect(teoriaAB(0.1, 0.12, 20000, 0.05).potencia).toBeGreaterThan(0.99);
    expect(teoriaAB(0.1, 0.15, 1000, 0.05).potencia).toBeGreaterThan(base.potencia);
    expect(teoriaAB(0.1, 0.1, 1000, 0.05).potencia).toBeCloseTo(0.05, 6);
    expect(teoriaAB(0.1, 0.1, 1000, 0.01).potencia).toBeCloseTo(0.01, 6);
    expect(teoriaAB(0.1, 0.12, 1000, 0.01).potencia).toBeLessThan(base.potencia);
    expect(teoriaAB(0.1, 0.12, 1000, 0.05).zc).toBeCloseTo(1.959964, 5);
  });
  it('la potencia teórica coincide con la tasa de rechazo simulada', () => {
    const t = teoriaAB(0.1, 0.12, 1000, 0.05);
    let rech = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) if (rechaza(experimento(42, i, 0.1, 0.12, 1000), 0.05)) rech++;
    expect(Math.abs(rech / N - t.potencia)).toBeLessThan(0.04);
  });
  it('con tasaB = tasaA y 200 experimentos la tasa de rechazo queda entre 1 % y 10 % (α = 0,05)', () => {
    let rech = 0;
    for (let i = 0; i < 200; i++) if (rechaza(experimento(42, i, 0.1, 0.1, 1000), 0.05)) rech++;
    expect(rech / 200).toBeGreaterThanOrEqual(0.01);
    expect(rech / 200).toBeLessThanOrEqual(0.1);
  });
  it('el p-valor es bilateral y coherente con z', () => {
    const res = experimento(42, 0, 0.1, 0.2, 5000);
    expect(res.z).toBeGreaterThan(5);
    expect(res.pValor).toBeLessThan(1e-6);
    expect(res.difPP).toBeGreaterThan(8);
    expect(experimento(42, 3, 0.1, 0.1, 1000)).toEqual(experimento(42, 3, 0.1, 0.1, 1000));
  });
});
