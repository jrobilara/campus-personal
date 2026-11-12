// Ventanas de dibujo (rangos de x e y) para SimFuncion. Módulo puro.
import { FUNCIONES, type FuncionPreset } from './funciones';

export interface Ventana { x: [number, number]; y: [number, number] }

/** Tope vertical por función: la curva "sale" por arriba en vez de aplastar la parte interesante. */
const TOPE_Y: Record<FuncionPreset, [number, number]> = {
  cuadratica: [-1, 17],
  cubica: [-6, 6],
  seno: [-1.4, 1.4],
  exponencial: [-1, 10],
  logistica: [-0.12, 1.12],
  'doble-pozo': [-5, 10],
  'error-cuadratico': [-0.5, 8],
};

/** Ventana del modo tangente: x = rango, y = lo que ocupa la curva en ese rango, con tope y margen. */
export function ventanaTangente(funcion: FuncionPreset, rango: [number, number]): Ventana {
  const fn = FUNCIONES[funcion];
  const [a, b] = rango[0] < rango[1] ? rango : [rango[1], rango[0]];
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i <= 200; i++) {
    const y = fn.f(a + ((b - a) * i) / 200);
    if (y < mn) mn = y;
    if (y > mx) mx = y;
  }
  const [tLo, tHi] = TOPE_Y[funcion];
  let lo = Math.max(mn, tLo), hi = Math.min(mx, tHi);
  if (hi - lo < 0.5) { const m = (hi + lo) / 2; lo = m - 0.25; hi = m + 0.25; }
  const pad = (hi - lo) * 0.1;
  return { x: [a, b], y: [lo - pad, hi + pad] };
}

/** Tope vertical en el modo descenso y rango exterior donde buscar el borde de la ventana. */
const DESCENSO: Record<'cuadratica' | 'doble-pozo' | 'error-cuadratico', { tope: number; exterior: [number, number] }> = {
  cuadratica: { tope: 16, exterior: [-8, 8] },
  'doble-pozo': { tope: 12, exterior: [-5, 5] },
  'error-cuadratico': { tope: 8, exterior: [-5, 9] },
};

/**
 * Ventana del descenso: el conjunto donde f ≤ techo (un intervalo, porque estas tres funciones tienen
 * "bordes" que suben), con un poco de margen. El techo incluye f(x0) para que el punto de partida se vea.
 * `xSlider` es el intervalo (sin margen) para el slider de x0.
 */
export function ventanaDescenso(funcion: 'cuadratica' | 'doble-pozo' | 'error-cuadratico', x0: number): Ventana & { xSlider: [number, number] } {
  const fn = FUNCIONES[funcion];
  const { tope, exterior } = DESCENSO[funcion];
  const techo = Math.max(tope, fn.f(x0) * 1.08);
  let lo = Infinity, hi = -Infinity, fMin = Infinity;
  const N = 2000;
  for (let i = 0; i <= N; i++) {
    const x = exterior[0] + ((exterior[1] - exterior[0]) * i) / N;
    const y = fn.f(x);
    if (y <= techo) { if (x < lo) lo = x; if (x > hi) hi = x; if (y < fMin) fMin = y; }
  }
  if (x0 < lo) lo = x0;
  if (x0 > hi) hi = x0;
  lo = Math.floor(lo * 10) / 10;
  hi = Math.ceil(hi * 10) / 10;
  const margenX = (hi - lo) * 0.04;
  const margenY = (techo - fMin) * 0.06;
  return { x: [lo - margenX, hi + margenX], y: [fMin - margenY * 3.2, techo + margenY], xSlider: [lo, hi] };
}
