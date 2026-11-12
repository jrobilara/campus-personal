// Teorema central del límite: medias muestrales acumuladas e histograma (módulo puro).
import { media, muestra, POBLACIONES, type Poblacion } from './poblaciones';

export const CANAL_TCL = 1;
export const MAX_MUESTRAS_TCL = 10000;

/** Medias de las muestras `desde`..`hasta - 1` (tamaño n). */
export function mediasMuestrales(p: Poblacion, semilla: number, n: number, desde: number, hasta: number): number[] {
  const out: number[] = [];
  for (let i = desde; i < hasta; i++) out.push(media(muestra(p, semilla, CANAL_TCL, i, n)));
  return out;
}

export interface Histograma {
  bordes: number[];
  cuentas: number[];
  /** densidad = cuentas / (total · ancho de cada barra) */
  densidades: number[];
  dominio: [number, number];
}

/** Error estándar teórico σ/√n. */
export const sigmaSobreRaizN = (p: Poblacion, n: number) => POBLACIONES[p].sigma / Math.sqrt(n);

/**
 * Histograma de las medias en torno a μ (±4,2 σ/√n; más cola derecha en la exponencial).
 * En el dado, las medias caen en una grilla de paso 1/n: las barras se alinean a esa grilla para que no haya huecos falsos.
 */
export function histogramaMedias(medias: readonly number[], p: Poblacion, n: number, barras = 32): Histograma {
  const info = POBLACIONES[p];
  const s = sigmaSobreRaizN(p, n);
  const cola = p === 'exponencial' ? 6 : 4.2;
  const [dLo, dHi] = info.dominio;
  let lo = Math.max(dLo, info.mu - 4.2 * s);
  let hi = Math.min(dHi, info.mu + cola * s);
  const bordes: number[] = [];
  const cuentas: number[] = [];
  if (info.discreta) {
    const sumaLo = Math.max(n, Math.ceil((info.mu - 4.2 * s) * n));
    const sumaHi = Math.min(6 * n, Math.floor((info.mu + 4.2 * s) * n));
    const puntos = Math.max(1, sumaHi - sumaLo + 1);
    const m = Math.ceil(puntos / barras);
    const nb = Math.ceil(puntos / m);
    for (let j = 0; j <= nb; j++) bordes.push((sumaLo + j * m - 0.5) / n);
    for (let j = 0; j < nb; j++) cuentas.push(0);
    for (const v of medias) {
      const j = Math.floor((Math.round(v * n) - sumaLo) / m);
      if (j >= 0 && j < nb) cuentas[j]!++;
    }
    lo = bordes[0]!; hi = bordes[nb]!;
  } else {
    const ancho = (hi - lo) / barras;
    for (let j = 0; j <= barras; j++) bordes.push(lo + j * ancho);
    for (let j = 0; j < barras; j++) cuentas.push(0);
    for (const v of medias) {
      const j = Math.floor((v - lo) / ancho);
      if (j >= 0 && j < barras) cuentas[j]!++;
      else if (v === hi) cuentas[barras - 1]!++;
    }
  }
  const total = Math.max(1, medias.length);
  const densidades = cuentas.map((c, j) => c / (total * (bordes[j + 1]! - bordes[j]!)));
  return { bordes, cuentas, densidades, dominio: [lo, hi] };
}
