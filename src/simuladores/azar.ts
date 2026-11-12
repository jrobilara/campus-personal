// PRNG con semilla (mulberry32) y muestreos básicos. Todo lo aleatorio de los simuladores pasa por acá:
// mismo estado de controles + misma semilla = mismo dibujo y mismas lecturas.
export type Azar = () => number;

export function mulberry32(semilla = 42): Azar {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Normal estándar (Box-Muller). */
export function normal(r: Azar): number {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}
export const exponencial = (r: Azar, lambda = 1) => -Math.log(Math.max(r(), 1e-12)) / lambda;
export const lognormal = (r: Azar, mu: number, sigma: number) => Math.exp(mu + sigma * normal(r));
export function binomial(r: Azar, n: number, p: number): number {
  let k = 0;
  for (let i = 0; i < n; i++) if (r() < p) k++;
  return k;
}
export function poisson(r: Azar, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= r(); } while (p > L);
  return k - 1;
}
export function mezclar<T>(r: Azar, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}
