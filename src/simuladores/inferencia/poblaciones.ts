// Poblaciones de SimInferencia (SIMULADORES.md §2.4): uniforme, exponencial, bimodal y dado.
// Cada una trae su media y desvío exactos, el muestreo con PRNG y la densidad (o pmf) para dibujarla.
import { mulberry32, normal, type Azar } from '../azar';
import { pdfNormal } from '../estadistica/matematica';

export type Poblacion = 'uniforme' | 'exponencial' | 'bimodal' | 'dado';

export interface InfoPoblacion {
  nombre: string;
  /** media y desvío exactos */
  mu: number;
  sigma: number;
  discreta: boolean;
  /** rango en el que se dibuja la población */
  dominio: [number, number];
  muestrear: (r: Azar) => number;
  /** densidad (continuas) o P(X = x) (dado) */
  densidad: (x: number) => number;
}

const BIMODAL = { m1: 2.5, m2: 7.5, s: 0.8 };

export const POBLACIONES: Record<Poblacion, InfoPoblacion> = {
  uniforme: {
    nombre: 'Uniforme en [0, 1]',
    mu: 0.5, sigma: Math.sqrt(1 / 12), discreta: false, dominio: [0, 1],
    muestrear: (r) => r(),
    densidad: (x) => (x >= 0 && x <= 1 ? 1 : 0),
  },
  exponencial: {
    nombre: 'Exponencial (λ = 1)',
    mu: 1, sigma: 1, discreta: false, dominio: [0, 6],
    muestrear: (r) => -Math.log(Math.max(r(), 1e-12)),
    densidad: (x) => (x < 0 ? 0 : Math.exp(-x)),
  },
  bimodal: {
    nombre: 'Bimodal (dos campanas)',
    mu: (BIMODAL.m1 + BIMODAL.m2) / 2,
    sigma: Math.sqrt(BIMODAL.s ** 2 + ((BIMODAL.m2 - BIMODAL.m1) / 2) ** 2),
    discreta: false, dominio: [-0.5, 10.5],
    muestrear: (r) => (r() < 0.5 ? BIMODAL.m1 : BIMODAL.m2) + BIMODAL.s * normal(r),
    densidad: (x) => 0.5 * pdfNormal(x, BIMODAL.m1, BIMODAL.s) + 0.5 * pdfNormal(x, BIMODAL.m2, BIMODAL.s),
  },
  dado: {
    nombre: 'Dado equilibrado',
    mu: 3.5, sigma: Math.sqrt(35 / 12), discreta: true, dominio: [0.5, 6.5],
    muestrear: (r) => 1 + Math.floor(r() * 6),
    densidad: (x) => (Number.isInteger(x) && x >= 1 && x <= 6 ? 1 / 6 : 0),
  },
};

export const NOMBRE_POBLACION: Record<Poblacion, string> = {
  uniforme: 'uniforme', exponencial: 'exponencial', bimodal: 'bimodal', dado: 'dado',
};

/** Semilla derivada de (semilla, canal, índice): cada muestra es una función pura del estado, no del orden de los clics. */
export function semillaDe(semilla: number, canal: number, indice: number): number {
  let h = (semilla | 0) ^ Math.imul(canal + 1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) ^ Math.imul(indice + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** La muestra número `indice` de tamaño `n` (determinista dada la semilla). */
export function muestra(p: Poblacion, semilla: number, canal: number, indice: number, n: number): number[] {
  const r = mulberry32(semillaDe(semilla, canal, indice));
  const info = POBLACIONES[p];
  return Array.from({ length: n }, () => info.muestrear(r));
}

export const media = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Desvío muestral (n − 1). */
export function desvioMuestral(xs: readonly number[]): number {
  if (xs.length < 2) return NaN;
  const m = media(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}
