// Descenso por gradiente: xₖ₊₁ = xₖ − tasa·f′(xₖ). Módulo puro.
import type { Funcion } from './funciones';

export type EstadoDescenso = 'convergiendo' | 'oscilando' | 'divergiendo';

/** Si |x| pasa de este valor la trayectoria se corta: ya es evidente que diverge y los números se vuelven ruido. */
export const LIMITE_X = 1e4;

/** Trayectoria x₀, x₁, …, xₙ (se corta antes de n si se pasa de LIMITE_X o deja de ser finita). */
export function trayectoria(fn: Funcion, x0: number, tasa: number, pasos: number): number[] {
  const xs = [x0];
  let x = x0;
  for (let k = 0; k < pasos; k++) {
    x = x - tasa * fn.df(x);
    if (!Number.isFinite(x)) break;
    xs.push(x);
    if (Math.abs(x) > LIMITE_X) break;
  }
  return xs;
}

/** Cuántos pasos se pueden dar todavía (false si la trayectoria ya se disparó y se cortó). */
export const sigueVivo = (xs: number[]) => Math.abs(xs[xs.length - 1]!) <= LIMITE_X;

/**
 * Criterio del estado (lo explica la UI al lado de la lectura):
 *
 * Idea de fondo. En una zona donde f es una parábola (f″ = k > 0), un paso multiplica el error por
 * r = 1 − tasa·k:  |r| < 1 → converge;  r < 0 → además salta de un lado al otro (oscila);  |r| > 1 → se aleja.
 * Con tasa = 1,1 sobre x² (k = 2): r = −1,2 → divergiendo, como pide el doc.
 *
 * 1) Con menos de 3 pasos todavía no hay historia que mirar: se usa ese factor r con la curvatura k = f″
 *    del punto actual. Si k ≤ 0 (cima de un pozo), el paso va cuesta abajo igual: convergiendo.
 * 2) Con 3 pasos o más se mira lo que pasó de verdad en los últimos 4 pasos (sirve para curvas que
 *    no son parábolas, como el doble pozo, donde k cambia):
 *      - si el último paso es casi nulo (< 1e-3): convergiendo (llegó);
 *      - si los pasos alternan de signo en toda la ventana: oscilando, o divergiendo si crecen (|último| > 1,02·|primero|);
 *      - si no alternan: divergiendo si crecen, convergiendo si no.
 *    Una trayectoria cortada por LIMITE_X, o no finita, es divergiendo.
 */
export function estadoDescenso(fn: Funcion, xs: number[], tasa: number): EstadoDescenso {
  const ultimo = xs[xs.length - 1]!;
  if (!Number.isFinite(ultimo) || Math.abs(ultimo) > LIMITE_X) return 'divergiendo';
  const pasos = xs.length - 1;
  if (pasos < 3) {
    const k = fn.d2f(ultimo);
    if (k <= 0) return 'convergiendo';
    const r = 1 - tasa * k;
    if (Math.abs(r) > 1) return 'divergiendo';
    return r < 0 ? 'oscilando' : 'convergiendo';
  }
  const ventana: number[] = [];
  for (let i = Math.max(1, xs.length - 4); i < xs.length; i++) ventana.push(xs[i]! - xs[i - 1]!);
  const primero = ventana[0]!, fin = ventana[ventana.length - 1]!;
  if (Math.abs(fin) < 1e-3) return 'convergiendo';
  const alterna = ventana.every((s, i) => i === 0 || s * ventana[i - 1]! < 0);
  const crece = Math.abs(fin) > 1.02 * Math.abs(primero);
  if (alterna) return crece ? 'divergiendo' : 'oscilando';
  return crece ? 'divergiendo' : 'convergiendo';
}
