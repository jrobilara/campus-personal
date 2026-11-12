// Funciones del simulador SimFuncion (SIMULADORES.md §2.1). Módulo puro: sin React ni DOM.

export type FuncionPreset = 'cuadratica' | 'cubica' | 'seno' | 'exponencial' | 'logistica' | 'doble-pozo' | 'error-cuadratico';

export interface Funcion {
  f: (x: number) => number;
  /** derivada primera, analítica */
  df: (x: number) => number;
  /** derivada segunda, analítica (curvatura) */
  d2f: (x: number) => number;
  /** nombre de la función como se escribe en las etiquetas */
  nombre: string;
  /** nombre de la variable del eje x */
  variable: string;
  /** descripción para lectores de pantalla */
  descripcion: string;
}

/**
 * error-cuadratico: E(w) = media de (yᵢ − w·xᵢ)² sobre 8 puntos fijos cuya pendiente real es 2.
 * Cada yᵢ es 2·xᵢ más un desvío chico y fijo (los desvíos no dependen de ninguna semilla: son datos del doc).
 */
export const PUNTOS_ERROR: ReadonlyArray<readonly [number, number]> = (() => {
  const xs = [-1.4, -1, -0.6, -0.2, 0.2, 0.6, 1, 1.4];
  const desvios = [0.15, -0.2, 0.1, 0.25, -0.15, 0.2, -0.1, -0.05];
  return xs.map((x, i) => [x, 2 * x + desvios[i]!] as const);
})();

const N_ERR = PUNTOS_ERROR.length;
const A_ERR = PUNTOS_ERROR.reduce((s, [x]) => s + x * x, 0) / N_ERR; // media de x²
const B_ERR = PUNTOS_ERROR.reduce((s, [x, y]) => s + x * y, 0) / N_ERR; // media de x·y
const C_ERR = PUNTOS_ERROR.reduce((s, [, y]) => s + y * y, 0) / N_ERR; // media de y²
/** E(w) = A·w² − 2·B·w + C, así que el mínimo está en w = B / A (≈ 2). */
export const W_OPTIMO = B_ERR / A_ERR;

const sigmoide = (x: number) => 1 / (1 + Math.exp(-x));

export const FUNCIONES: Record<FuncionPreset, Funcion> = {
  cuadratica: {
    f: (x) => x * x, df: (x) => 2 * x, d2f: () => 2,
    nombre: 'f(x) = x²', variable: 'x', descripcion: 'parábola x al cuadrado',
  },
  cubica: {
    f: (x) => x ** 3 - 3 * x, df: (x) => 3 * x * x - 3, d2f: (x) => 6 * x,
    nombre: 'f(x) = x³ − 3x', variable: 'x', descripcion: 'cúbica con un máximo y un mínimo locales',
  },
  seno: {
    f: Math.sin, df: Math.cos, d2f: (x) => -Math.sin(x),
    nombre: 'f(x) = sen x', variable: 'x', descripcion: 'onda senoidal',
  },
  exponencial: {
    f: Math.exp, df: Math.exp, d2f: Math.exp,
    nombre: 'f(x) = eˣ', variable: 'x', descripcion: 'exponencial creciente',
  },
  logistica: {
    f: sigmoide,
    df: (x) => { const s = sigmoide(x); return s * (1 - s); },
    d2f: (x) => { const s = sigmoide(x); return s * (1 - s) * (1 - 2 * s); },
    nombre: 'f(x) = 1 / (1 + e⁻ˣ)', variable: 'x', descripcion: 'curva logística en forma de S',
  },
  'doble-pozo': {
    f: (x) => x ** 4 - 3 * x * x + x, df: (x) => 4 * x ** 3 - 6 * x + 1, d2f: (x) => 12 * x * x - 6,
    nombre: 'f(x) = x⁴ − 3x² + x', variable: 'x', descripcion: 'curva con dos pozos: un mínimo local y uno global',
  },
  'error-cuadratico': {
    f: (w) => A_ERR * w * w - 2 * B_ERR * w + C_ERR,
    df: (w) => 2 * A_ERR * w - 2 * B_ERR,
    d2f: () => 2 * A_ERR,
    nombre: 'E(w) = error cuadrático medio', variable: 'w', descripcion: 'error cuadrático medio en función de la pendiente w',
  },
};

/** Raíces de f′ (mínimos y máximos), por bisección sobre el cambio de signo: sirve para marcar y testear. */
export function puntosCriticos(fn: Funcion, desde: number, hasta: number, n = 4000): number[] {
  const out: number[] = [];
  let xa = desde, ya = fn.df(xa);
  for (let i = 1; i <= n; i++) {
    const xb = desde + ((hasta - desde) * i) / n, yb = fn.df(xb);
    if (ya === 0) out.push(xa);
    else if (ya * yb < 0) {
      let lo = xa, hi = xb;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (fn.df(lo) * fn.df(m) <= 0) hi = m; else lo = m; }
      out.push((lo + hi) / 2);
    }
    xa = xb; ya = yb;
  }
  return out;
}

/** Pendiente de la secante entre x0 y x0 + h. */
export const pendienteSecante = (fn: Funcion, x0: number, h: number) => (fn.f(x0 + h) - fn.f(x0)) / h;
