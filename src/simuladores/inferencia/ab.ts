// Experimento A/B: simulación de conversiones, z de dos proporciones y potencia teórica (aproximación normal). Módulo puro.
import { mulberry32, type Azar } from '../azar';
import { cdfNormal, cuantilNormal } from '../estadistica/matematica';
import { semillaDe } from './poblaciones';

export const CANAL_AB = 3;
export const MAX_EXPERIMENTOS = 2000;

export type Alfa = 0.01 | 0.05 | 0.1;

/** Binomial exacta por saltos geométricos: cuesta O(n·p) en vez de O(n). */
export function binomialRapida(r: Azar, n: number, p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return n;
  if (p > 0.5) return n - binomialRapida(r, n, 1 - p);
  const lq = Math.log1p(-p);
  let pos = -1, k = 0;
  for (;;) {
    pos += 1 + Math.floor(Math.log(Math.max(r(), 1e-300)) / lq);
    if (pos >= n) return k;
    k++;
  }
}

export interface Resultado {
  /** diferencia observada pB − pA en puntos porcentuales */
  difPP: number;
  z: number;
  pValor: number;
}

/** Prueba z bilateral de dos proporciones con varianza combinada. */
export function pruebaDosProporciones(xA: number, xB: number, n: number): Resultado {
  const pA = xA / n, pB = xB / n;
  const pc = (xA + xB) / (2 * n);
  const se = Math.sqrt((pc * (1 - pc) * 2) / n);
  const z = se > 0 ? (pB - pA) / se : 0;
  return { difPP: (pB - pA) * 100, z, pValor: Math.min(1, 2 * (1 - cdfNormal(Math.abs(z)))) };
}

/** Experimento número `i`: n usuarios por grupo con tasas verdaderas pA y pB. */
export function experimento(semilla: number, i: number, pA: number, pB: number, n: number): Resultado {
  const r = mulberry32(semillaDe(semilla, CANAL_AB, i));
  const xA = binomialRapida(r, n, pA);
  const xB = binomialRapida(r, n, pB);
  return pruebaDosProporciones(xA, xB, n);
}

export const rechaza = (res: Resultado, alfa: number) => res.pValor < alfa;

export interface Teoria {
  /** diferencia verdadera pB − pA (en fracción) */
  delta: number;
  /** error estándar de la diferencia bajo H0 (varianza combinada) y bajo H1 */
  se0: number;
  se1: number;
  /** valor crítico z de dos colas y corte de la diferencia (en fracción): |D| > corte rechaza */
  zc: number;
  corte: number;
  /** potencia teórica (0-1) con la aproximación normal */
  potencia: number;
}

export function teoriaAB(pA: number, pB: number, n: number, alfa: number): Teoria {
  const delta = pB - pA;
  const pbar = (pA + pB) / 2;
  const se0 = Math.sqrt((2 * pbar * (1 - pbar)) / n);
  const se1 = Math.sqrt((pA * (1 - pA) + pB * (1 - pB)) / n);
  const zc = cuantilNormal(1 - alfa / 2);
  const corte = zc * se0;
  const potencia = 1 - cdfNormal((corte - delta) / se1) + cdfNormal((-corte - delta) / se1);
  return { delta, se0, se1, zc, corte, potencia };
}
