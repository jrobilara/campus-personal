// Intervalos de confianza t para la media: cada intervalo i es una función pura de (semilla, i, n) (módulo puro).
import { cuantilT } from '../estadistica/matematica';
import { desvioMuestral, media, muestra, type Poblacion } from './poblaciones';

export const CANAL_INTERVALOS = 2;
export const MAX_INTERVALOS = 100;
export const LOTE_INTERVALOS = 20;

export type Confianza = 0.9 | 0.95 | 0.99;

export interface Resumen { media: number; desvio: number }
export interface Intervalo { i: number; media: number; inf: number; sup: number; cubre: boolean }

/** Media y desvío de la muestra número `i` (tamaño n). */
export function resumenMuestra(p: Poblacion, semilla: number, i: number, n: number): Resumen {
  const xs = muestra(p, semilla, CANAL_INTERVALOS, i, n);
  return { media: media(xs), desvio: desvioMuestral(xs) };
}

/** Valor crítico t de dos colas para el nivel de confianza y n − 1 grados de libertad. */
export const criticoT = (confianza: Confianza, n: number) => cuantilT(1 - (1 - confianza) / 2, n - 1);

export function construirIntervalos(res: readonly Resumen[], n: number, confianza: Confianza, mu: number): Intervalo[] {
  const t = criticoT(confianza, n);
  return res.map((r, i) => {
    const mitad = (t * r.desvio) / Math.sqrt(n);
    return { i, media: r.media, inf: r.media - mitad, sup: r.media + mitad, cubre: r.media - mitad <= mu && mu <= r.media + mitad };
  });
}

/** Cobertura en % (NaN si no hay intervalos). */
export function cobertura(ints: readonly Intervalo[]): number {
  return ints.length ? (100 * ints.filter((x) => x.cubre).length) / ints.length : NaN;
}
