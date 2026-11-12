// Estadística descriptiva pura para SimDatos (sin React ni DOM).

export const suma = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
export const media = (xs: readonly number[]) => (xs.length ? suma(xs) / xs.length : NaN);

/** Cuantil por interpolación lineal (el "tipo 7" de R/NumPy, el mismo que usa Observable Plot en sus cajas). */
export function cuantil(xs: readonly number[], p: number): number {
  if (!xs.length) return NaN;
  const o = [...xs].sort((a, b) => a - b);
  const pos = (o.length - 1) * p;
  const i = Math.floor(pos);
  const f = pos - i;
  return i + 1 < o.length ? o[i]! + f * (o[i + 1]! - o[i]!) : o[i]!;
}
export const mediana = (xs: readonly number[]) => cuantil(xs, 0.5);

/** Desvío estándar muestral (n − 1). */
export function desvio(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const m = media(xs);
  return Math.sqrt(suma(xs.map((x) => (x - m) ** 2)) / (xs.length - 1));
}

export interface Cercas { q1: number; q3: number; iqr: number; bajo: number; alto: number }
/** Regla 1.5·IQR: fuera de [Q1 − 1,5·IQR, Q3 + 1,5·IQR] es un valor atípico. */
export function cercas(xs: readonly number[]): Cercas {
  const q1 = cuantil(xs, 0.25);
  const q3 = cuantil(xs, 0.75);
  const iqr = q3 - q1;
  return { q1, q3, iqr, bajo: q1 - 1.5 * iqr, alto: q3 + 1.5 * iqr };
}
export const esAtipico = (x: number, c: Cercas) => x < c.bajo || x > c.alto;

export interface Regresion { pendiente: number; ordenada: number; r: number; r2: number; n: number }
/** Recta de mínimos cuadrados de y sobre x y correlación de Pearson. */
export function regresion(x: readonly number[], y: readonly number[]): Regresion {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { pendiente: NaN, ordenada: NaN, r: NaN, r2: NaN, n };
  const mx = media(x.slice(0, n));
  const my = media(y.slice(0, n));
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - mx, dy = y[i]! - my;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  const pendiente = sxx > 0 ? sxy / sxx : NaN;
  const r = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
  return { pendiente, ordenada: my - pendiente * mx, r, r2: r * r, n };
}

export interface Barra { x0: number; x1: number; n: number }
/** Histograma con exactamente `bins` barras de igual ancho sobre [min, max] (el último intervalo incluye el máximo). */
export function histograma(xs: readonly number[], bins: number, dominio?: [number, number]): Barra[] {
  const vals = xs.filter(Number.isFinite);
  if (!vals.length) return [];
  let [min, max] = dominio ?? [Math.min(...vals), Math.max(...vals)];
  if (max <= min) { min -= 0.5; max += 0.5; }
  const ancho = (max - min) / bins;
  const barras: Barra[] = Array.from({ length: bins }, (_, i) => ({ x0: min + i * ancho, x1: min + (i + 1) * ancho, n: 0 }));
  for (const v of vals) {
    if (v < min || v > max) continue;
    const i = Math.min(bins - 1, Math.floor((v - min) / ancho));
    barras[i]!.n++;
  }
  return barras;
}

/**
 * Valores "lejísimos" del resto (más de 3 veces el percentil 98): se dejan fuera de la escala del gráfico
 * para que se vea la masa de los datos. La cola natural de una lognormal NO entra acá.
 */
export function fueraDeEscala(xs: readonly number[]): { limite: number; fuera: number[] } {
  const vals = xs.filter(Number.isFinite);
  if (!vals.length) return { limite: NaN, fuera: [] };
  const p98 = cuantil(vals, 0.98);
  const tope = p98 > 0 ? 3 * p98 : Infinity;
  const dentro = vals.filter((v) => v <= tope);
  return { limite: Math.max(...dentro), fuera: vals.filter((v) => v > tope).sort((a, b) => a - b) };
}
