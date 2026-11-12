// Álgebra 2×2 de SimTransformacion2D (SIMULADORES.md §2.2). Módulo puro.

export type Matriz = [[number, number], [number, number]];
export type Vec = [number, number];
export type PresetT = 'identidad' | 'rotacion-90' | 'escala' | 'cizalla' | 'reflexion' | 'proyeccion';

export const PRESETS: Record<PresetT, Matriz> = {
  identidad: [[1, 0], [0, 1]],
  'rotacion-90': [[0, -1], [1, 0]],
  escala: [[2, 0], [0, 0.5]],
  cizalla: [[1, 1], [0, 1]],
  reflexion: [[1, 0], [0, -1]],
  proyeccion: [[1, 0], [0, 0]],
};

export const NOMBRES_PRESET: Record<PresetT, string> = {
  identidad: 'Identidad',
  'rotacion-90': 'Rotación 90°',
  escala: 'Escala',
  cizalla: 'Cizalla',
  reflexion: 'Reflexión',
  proyeccion: 'Proyección',
};

export const copiar = (m: Matriz): Matriz => [[m[0][0], m[0][1]], [m[1][0], m[1][1]]];
export const iguales = (p: Matriz, q: Matriz) => p[0][0] === q[0][0] && p[0][1] === q[0][1] && p[1][0] === q[1][0] && p[1][1] === q[1][1];
export const presetDe = (m: Matriz): PresetT | null =>
  (Object.keys(PRESETS) as PresetT[]).find((k) => iguales(PRESETS[k], m)) ?? null;

export const det = (m: Matriz) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
export const aplicar = (m: Matriz, v: Vec): Vec => [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
export const mezclar = (p: Matriz, q: Matriz, t: number): Matriz => [
  [p[0][0] + (q[0][0] - p[0][0]) * t, p[0][1] + (q[0][1] - p[0][1]) * t],
  [p[1][0] + (q[1][0] - p[1][0]) * t, p[1][1] + (q[1][1] - p[1][1]) * t],
];

export type Orientacion = 'se mantiene' | 'se invierte' | 'colapsa';
/** |det| < 0,005 cuenta como "colapsa": es lo que se lee como 0,00 en la lectura, así que texto y número no se contradicen. */
export const UMBRAL_COLAPSO = 0.005;
export function orientacion(m: Matriz): Orientacion {
  const d = det(m);
  if (Math.abs(d) < UMBRAL_COLAPSO) return 'colapsa';
  return d > 0 ? 'se mantiene' : 'se invierte';
}

export type Autovectores =
  | { tipo: 'complejos' }
  | {
      tipo: 'reales';
      /** autovalores ordenados de mayor a menor */
      valores: [number, number];
      /** una dirección unitaria por autovalor distinto; [] si A es múltiplo de la identidad (todo vector es autovector) */
      rectas: Array<{ valor: number; direccion: Vec }>;
      /** A = λ·I: toda recta por el origen es autovector */
      escalar: boolean;
    };

/**
 * Fórmula cerrada de 2×2: λ = tr/2 ± √(tr²/4 − det). Si el discriminante es negativo, los autovalores son complejos.
 * Autovector de λ: un v ≠ 0 con (A − λI)v = 0. De cada fila de (A − λI) sale un candidato:
 *   (b, λ − a)   o   (λ − d, c)   — se elige la de mayor norma (si las dos son nulas, A = λI).
 */
export function autovectores(m: Matriz): Autovectores {
  const [[a, b], [c, d]] = m;
  const mitad = (a + d) / 2;
  const disc = mitad * mitad - (a * d - b * c);
  const EPS = 1e-9;
  if (disc < -EPS) return { tipo: 'complejos' };
  const raiz = Math.sqrt(Math.max(0, disc));
  const l1 = mitad + raiz, l2 = mitad - raiz;
  const direccionDe = (l: number): Vec | null => {
    const u: Vec = [b, l - a], w: Vec = [l - d, c];
    const nu = Math.hypot(...u), nw = Math.hypot(...w);
    const v = nu >= nw ? u : w;
    const n = Math.max(nu, nw);
    return n < EPS ? null : [v[0] / n, v[1] / n];
  };
  if (raiz < EPS) {
    const dir = direccionDe(l1);
    return dir ? { tipo: 'reales', valores: [l1, l1], rectas: [{ valor: l1, direccion: dir }], escalar: false }
      : { tipo: 'reales', valores: [l1, l1], rectas: [], escalar: true };
  }
  const rectas: Array<{ valor: number; direccion: Vec }> = [];
  for (const l of [l1, l2]) {
    const dir = direccionDe(l);
    if (dir) rectas.push({ valor: l, direccion: dir });
  }
  return { tipo: 'reales', valores: [l1, l2], rectas, escalar: false };
}
