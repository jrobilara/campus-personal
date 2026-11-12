// Señal = suma de senoidales (más un "ruido" hecho también de senoidales, así todo es analítico: sin FFT). Módulo puro.
import { mulberry32 } from '../azar';

export interface Componente { frecuencia: number; amplitud: number }

/** Una senoidal a·sen(2π·f·t + fase). El ruido se arma como muchas senoidales chicas de fase al azar. */
export interface Linea { frecuencia: number; amplitud: number; fase: number; tipo: 'senal' | 'ruido' }

/** El ruido ocupa las frecuencias enteras 1…FRECUENCIA_RUIDO_MAX Hz. */
export const FRECUENCIA_RUIDO_MAX = 30;
/** Amplitud base de cada línea de ruido cuando `ruido` = 1 (el valor eficaz total ronda 0,45). */
const AMPLITUD_RUIDO = 0.12;

/** Líneas de ruido deterministas: misma semilla y mismo nivel → mismas fases y amplitudes. */
export function lineasRuido(semilla: number, ruido: number): Linea[] {
  if (ruido <= 0) return [];
  const azar = mulberry32(semilla);
  const out: Linea[] = [];
  for (let f = 1; f <= FRECUENCIA_RUIDO_MAX; f++) {
    const u = azar(), fase = azar() * 2 * Math.PI; // se sortean siempre los dos para que la fase de cada f no dependa del nivel
    out.push({ frecuencia: f, amplitud: AMPLITUD_RUIDO * ruido * (0.7 + 0.6 * u), fase, tipo: 'ruido' });
  }
  return out;
}

export const lineasDeComponentes = (comps: Componente[]): Linea[] =>
  comps.map((c) => ({ frecuencia: c.frecuencia, amplitud: c.amplitud, fase: 0, tipo: 'senal' as const }));

export function valor(lineas: Linea[], t: number): number {
  let s = 0;
  for (const l of lineas) s += l.amplitud * Math.sin(2 * Math.PI * l.frecuencia * t + l.fase);
  return s;
}

/** Filtro pasa-bajos ideal: deja pasar frecuencia ≤ corte. */
export const pasaBajos = (lineas: Linea[], corte: number) => lineas.filter((l) => l.frecuencia <= corte);

/** Cuántas componentes de la señal (con amplitud > 0) corta el filtro. */
export const componentesFiltradas = (comps: Componente[], corte: number) =>
  comps.filter((c) => c.amplitud > 0 && c.frecuencia > corte).length;

/** Frecuencia más alta de la señal (ignora las de amplitud 0), o null si no hay ninguna. */
export function frecuenciaMax(comps: Componente[]): number | null {
  const fs = comps.filter((c) => c.amplitud > 0).map((c) => c.frecuencia);
  return fs.length ? Math.max(...fs) : null;
}

/**
 * Frecuencia aparente (con signo) de una senoidal de frecuencia f muestreada a fs:
 * f = m·fs + δ con δ en [−fs/2, fs/2] → las muestras son las de una senoidal de frecuencia δ.
 * Si δ < 0 la senoidal aparente va "dada vuelta" (el signo entra en la fórmula de sen(2π·δ·t)).
 */
export const frecuenciaAparente = (f: number, fs: number) => f - fs * Math.round(f / fs);

/** Una componente se pliega (alias) si supera la frecuencia de Nyquist fs/2. */
export const sePliega = (f: number, fs: number) => f > fs / 2 + 1e-9;

/** Frecuencias de alias (únicas, ascendentes) de las componentes de la señal que superan Nyquist. */
export function aliasesDe(comps: Componente[], fs: number): number[] {
  const set = new Set<number>();
  for (const c of comps) {
    if (c.amplitud > 0 && sePliega(c.frecuencia, fs)) set.add(Math.round(Math.abs(frecuenciaAparente(c.frecuencia, fs)) * 1000) / 1000);
  }
  return [...set].sort((a, b) => a - b);
}

/** Reconstrucción por alias: cada línea pasa a ser a·sen(2π·δ·t + fase) con δ su frecuencia aparente. Pasa por todas las muestras. */
export const reconstruccionAlias = (lineas: Linea[], fs: number): Linea[] =>
  lineas.map((l) => ({ ...l, frecuencia: frecuenciaAparente(l.frecuencia, fs) }));

export interface Barra { frecuencia: number; amplitud: number; tipo: 'senal' | 'ruido'; estado: 'activa' | 'filtrada' }

/** Espectro de barras (analítico): una barra por componente y una por línea de ruido; con filtro, las que pasan del corte quedan "filtradas". */
export function espectro(comps: Componente[], ruido: Linea[], corte: number | null): Barra[] {
  const estado = (f: number) => (corte !== null && f > corte ? 'filtrada' : 'activa') as 'activa' | 'filtrada';
  return [
    ...ruido.map((l) => ({ frecuencia: l.frecuencia, amplitud: l.amplitud, tipo: 'ruido' as const, estado: estado(l.frecuencia) })),
    ...comps.filter((c) => c.amplitud > 0).map((c) => ({ frecuencia: c.frecuencia, amplitud: c.amplitud, tipo: 'senal' as const, estado: estado(c.frecuencia) })),
  ];
}

/** Instantes de muestreo dentro de 1 s: n/fs. */
export function instantesMuestreo(fs: number): number[] {
  const out: number[] = [];
  for (let n = 0; n / fs <= 1 + 1e-9; n++) out.push(n / fs);
  return out;
}

/** Formato de Hz: entero si lo es, un decimal si no (coma decimal). */
export function hz(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}
