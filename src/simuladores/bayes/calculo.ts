// Cálculo puro de SimBayes (sin React ni DOM): conteos, valores predictivos y reparto de los puntos de la grilla.

export interface EntradaBayes { prevalencia: number; sensibilidad: number; especificidad: number; poblacion: number }
export interface ConteosBayes { enfermos: number; sanos: number; vp: number; fp: number; fn: number; vn: number }
export interface ResultadoBayes extends ConteosBayes {
  /** P(condición | positivo), 0..1 (con las probabilidades exactas, no con los conteos redondeados) */
  vpp: number;
  /** P(sin condición | negativo), 0..1 */
  vpn: number;
}

/** Redondeo "mitad hacia arriba" que no se rompe por el error de coma flotante (990 · 0,95 = 940,5). */
const redondear = (x: number) => Math.floor(x + 0.5 + 1e-9);

export function calcularBayes({ prevalencia, sensibilidad, especificidad, poblacion }: EntradaBayes): ResultadoBayes {
  const enfermos = redondear(poblacion * prevalencia);
  const sanos = poblacion - enfermos;
  const vp = redondear(enfermos * sensibilidad);
  const fn = enfermos - vp;
  const vn = redondear(sanos * especificidad);
  const fp = sanos - vn;
  const pPositivo = prevalencia * sensibilidad + (1 - prevalencia) * (1 - especificidad);
  const pNegativo = prevalencia * (1 - sensibilidad) + (1 - prevalencia) * especificidad;
  return {
    enfermos, sanos, vp, fp, fn, vn,
    vpp: pPositivo > 0 ? (prevalencia * sensibilidad) / pPositivo : 0,
    vpn: pNegativo > 0 ? ((1 - prevalencia) * especificidad) / pNegativo : 0,
  };
}

export type Grupo = 'vp' | 'fn' | 'fp' | 'vn';

/**
 * Reparte `total` puntos entre los cuatro grupos (método del resto mayor) para que sumen exacto.
 * Un grupo con gente nunca se queda sin punto (se lo quita al más grande).
 */
export function repartirPuntos(c: Pick<ConteosBayes, Grupo>, total = 1000): Record<Grupo, number> {
  const claves: Grupo[] = ['vp', 'fn', 'fp', 'vn'];
  const suma = claves.reduce((s, k) => s + c[k], 0) || 1;
  const exactos = claves.map((k) => (c[k] / suma) * total);
  const base = exactos.map(Math.floor);
  let faltan = total - base.reduce((s, x) => s + x, 0);
  const orden = exactos.map((e, i) => ({ i, resto: e - Math.floor(e) })).sort((a, b) => b.resto - a.resto);
  for (const { i } of orden) { if (faltan <= 0) break; base[i]!++; faltan--; }
  const r = Object.fromEntries(claves.map((k, i) => [k, base[i]!])) as Record<Grupo, number>;
  for (const k of claves) {
    if (c[k] > 0 && r[k] === 0) {
      const mayor = claves.reduce((m, x) => (r[x] > r[m] ? x : m), 'vn' as Grupo);
      r[mayor]--; r[k] = 1;
    }
  }
  return r;
}

/** Orden de los grupos al llenar la grilla: por condición real (enfermos primero) o por resultado del test (positivos primero). */
export const ORDEN_CONDICION: Grupo[] = ['vp', 'fn', 'fp', 'vn'];
export const ORDEN_TEST: Grupo[] = ['vp', 'fp', 'fn', 'vn'];

/** Para cada punto 0..total-1 (identidad fija), a qué grupo pertenece (orden por condición). */
export function grupoPorPunto(puntos: Record<Grupo, number>): Grupo[] {
  const salida: Grupo[] = [];
  for (const g of ORDEN_CONDICION) for (let i = 0; i < puntos[g]; i++) salida.push(g);
  return salida;
}

/** Posición (índice de celda) de cada punto cuando la grilla se ordena con `orden`. */
export function celdaPorPunto(puntos: Record<Grupo, number>, orden: Grupo[]): number[] {
  const inicio: Record<string, number> = {};
  let acum = 0;
  for (const g of orden) { inicio[g] = acum; acum += puntos[g]; }
  const visto: Record<string, number> = {};
  const celdas: number[] = [];
  for (const g of ORDEN_CONDICION) {
    for (let i = 0; i < puntos[g]; i++) {
      celdas.push(inicio[g]! + (visto[g] ?? 0));
      visto[g] = (visto[g] ?? 0) + 1;
    }
  }
  return celdas;
}

export interface EtiquetasContexto {
  sujeto: string;       // "personas"
  condicion: string;    // "enfermas"
  sinCondicion: string; // "sanas"
  positivo: string;     // "test positivo"
  negativo: string;
  prevalencia: string;
  sensibilidad: string;
  especificidad: string;
  vp: string; fp: string; fn: string; vn: string;
  vppNombre: string;
}

export const CONTEXTOS: Record<'medico' | 'alerta-seguridad' | 'spam', EtiquetasContexto> = {
  medico: {
    sujeto: 'personas', condicion: 'con la enfermedad', sinCondicion: 'sin la enfermedad', positivo: 'dan positivo', negativo: 'dan negativo',
    prevalencia: 'Prevalencia (cuántas tienen la enfermedad)', sensibilidad: 'Sensibilidad (detecta a las enfermas)', especificidad: 'Especificidad (descarta a las sanas)',
    vp: 'Enfermedad y positivo', fp: 'Sin enfermedad y positivo', fn: 'Enfermedad y negativo', vn: 'Sin enfermedad y negativo',
    vppNombre: 'Si da positivo, probabilidad de tener la enfermedad',
  },
  'alerta-seguridad': {
    sujeto: 'eventos', condicion: 'ataques', sinCondicion: 'tráfico normal', positivo: 'saltan la alerta', negativo: 'no saltan la alerta',
    prevalencia: 'Prevalencia (cuántos son ataques)', sensibilidad: 'Sensibilidad (alerta ante un ataque)', especificidad: 'Especificidad (calla ante tráfico normal)',
    vp: 'Ataque con alerta', fp: 'Normal con alerta', fn: 'Ataque sin alerta', vn: 'Normal sin alerta',
    vppNombre: 'Si salta la alerta, probabilidad de que sea un ataque',
  },
  spam: {
    sujeto: 'correos', condicion: 'spam', sinCondicion: 'legítimos', positivo: 'van a spam', negativo: 'llegan a la bandeja',
    prevalencia: 'Prevalencia (cuántos son spam)', sensibilidad: 'Sensibilidad (atrapa el spam)', especificidad: 'Especificidad (deja pasar lo legítimo)',
    vp: 'Spam atrapado', fp: 'Legítimo a spam', fn: 'Spam que se cuela', vn: 'Legítimo en la bandeja',
    vppNombre: 'Si va a spam, probabilidad de que lo sea',
  },
};
