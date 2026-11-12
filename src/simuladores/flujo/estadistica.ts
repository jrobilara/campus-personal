// Utilidades estadísticas puras del simulador de flujo (sin React ni DOM).

/** Percentil `p` (0..1) con interpolación lineal sobre un arreglo ya ordenado. NaN si está vacío. */
export function percentil(ordenados: readonly number[], p: number): number {
  const n = ordenados.length;
  if (n === 0) return NaN;
  if (n === 1) return ordenados[0]!;
  const k = (n - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(k);
  const hi = Math.ceil(k);
  return ordenados[lo]! + (ordenados[hi]! - ordenados[lo]!) * (k - lo);
}

/** Muestras (t, valor) de los últimos `ancho` segundos de tiempo simulado. */
export class VentanaTemporal {
  private items: { t: number; v: number }[] = [];
  constructor(private readonly ancho: number) {}
  agregar(t: number, v: number) {
    this.items.push({ t, v });
  }
  podar(ahora: number) {
    const corte = ahora - this.ancho;
    let i = 0;
    while (i < this.items.length && this.items[i]!.t < corte) i++;
    if (i > 0) this.items.splice(0, i);
  }
  get cantidad() {
    return this.items.length;
  }
  ordenados(): number[] {
    return this.items.map((x) => x.v).sort((a, b) => a - b);
  }
}

/** Promedio móvil de las últimas `n` muestras. */
export class UltimasN {
  private v: number[] = [];
  constructor(private readonly n: number) {}
  agregar(x: number) {
    this.v.push(x);
    if (this.v.length > this.n) this.v.shift();
  }
  get cantidad() {
    return this.v.length;
  }
  media(): number {
    return this.v.length ? this.v.reduce((a, b) => a + b, 0) / this.v.length : NaN;
  }
}
