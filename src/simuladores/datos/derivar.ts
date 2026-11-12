// Derivados de SimDatos (sin React ni DOM): limpieza, lecturas y datos de cada vista.
import {
  CATEGORIAS_TICKETS, FRANJAS_TEMP, REGIONES, UMBRAL_HORAS, franjaTemperatura, type Dataset, type Fila,
} from '../presets/datasets';
import { cercas, desvio, esAtipico, fueraDeEscala, media, mediana, regresion, suma, type Cercas, type Regresion } from './estadistica';

export type Vista = 'tabla' | 'histograma' | 'caja' | 'barras' | 'lineas' | 'dispersion' | 'torta';

export interface Limpieza { sinDuplicados: boolean; sinFaltantes: boolean; corregirUnidades: boolean; marcarOutliers: boolean }
export const SIN_LIMPIEZA: Limpieza = { sinDuplicados: false, sinFaltantes: false, corregirUnidades: false, marcarOutliers: false };

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Aplica los toggles de limpieza de `tickets-sucios` (en este orden: duplicados, faltantes, unidades). */
export function aplicarLimpieza(filas: Fila[], l: Limpieza): Fila[] {
  let r = filas;
  if (l.sinDuplicados) {
    const vistos = new Set<unknown>();
    r = r.filter((f) => (vistos.has(f.id) ? false : (vistos.add(f.id), true)));
  }
  if (l.sinFaltantes) r = r.filter((f) => f.minutos_resolucion !== null);
  if (l.corregirUnidades) {
    r = r.map((f) => (num(f.minutos_resolucion) && f.minutos_resolucion <= UMBRAL_HORAS ? { ...f, minutos_resolucion: f.minutos_resolucion * 60 } : f));
  }
  return r;
}

/** Para cada fila, ¿es una repetición (mismo `id` que una fila anterior)? */
export function repetidas(filas: Fila[]): boolean[] {
  const vistos = new Set<unknown>();
  return filas.map((f) => (vistos.has(f.id) ? true : (vistos.add(f.id), false)));
}

export const valoresDe = (filas: Fila[], clave: string): number[] => filas.map((f) => f[clave]).filter(num);

export interface Resumen {
  filas: number; media: number; mediana: number; desvio: number; faltantes: number; outliers: number; cercas: Cercas;
}
export function resumir(ds: Dataset, filas: Fila[]): Resumen {
  const v = valoresDe(filas, ds.principal);
  const c = cercas(v);
  return {
    filas: filas.length, media: media(v), mediana: mediana(v), desvio: desvio(v),
    faltantes: filas.length - v.length, outliers: v.filter((x) => esAtipico(x, c)).length, cercas: c,
  };
}

export interface Pares { x: number[]; y: number[]; filas: Fila[] }
export function paresDe(ds: Dataset, filas: Fila[]): Pares {
  const ok = filas.filter((f) => num(f[ds.par.x]) && num(f[ds.par.y]));
  return { x: ok.map((f) => f[ds.par.x] as number), y: ok.map((f) => f[ds.par.y] as number), filas: ok };
}
export const regresionDe = (ds: Dataset, filas: Fila[]): Regresion => { const p = paresDe(ds, filas); return regresion(p.x, p.y); };

/** Regresión dentro de cada franja de temperatura (confusora-temperatura). */
export function regresionPorFranja(ds: Dataset, filas: Fila[]): Regresion[] {
  return FRANJAS_TEMP.map((_, f) => {
    const sub = filas.filter((fi) => num(fi.temperatura) && franjaTemperatura(fi.temperatura) === f);
    return regresionDe(ds, sub);
  });
}

// ---------------------------------------------------------------- barras / torta
export interface ItemGrupo { nombre: string; valor: number }
export interface Grupos { titulo: string; unidad: string; items: ItemGrupo[] }

function porTramos(valores: number[], cortes: number[], nombres: string[]): ItemGrupo[] {
  const cuenta = nombres.map(() => 0);
  for (const v of valores) { let i = cortes.findIndex((c) => v < c); if (i < 0) i = cortes.length; cuenta[i]!++; }
  return nombres.map((nombre, i) => ({ nombre, valor: cuenta[i]! }));
}

export function agrupar(ds: Dataset, filas: Fila[]): Grupos {
  switch (ds.id) {
    case 'tickets-sucios': {
      const items = CATEGORIAS_TICKETS.map((c) => ({ nombre: c, valor: filas.filter((f) => f.categoria === c).length }));
      return { titulo: 'Tickets por categoría', unidad: 'tickets', items: items.sort((a, b) => b.valor - a.valor) };
    }
    case 'ventas-mensuales':
      return { titulo: 'Ventas totales por región', unidad: 'miles de $', items: REGIONES.map((r) => ({ nombre: r, valor: suma(valoresDe(filas.filter((f) => f.region === r), 'ventas')) })) };
    case 'latencias':
      return { titulo: 'Mediciones por tramo de latencia', unidad: 'mediciones', items: porTramos(valoresDe(filas, 'latencia_ms'), [100, 150, 250], ['Menos de 100 ms', '100 a 150 ms', '150 a 250 ms', '250 ms o más']) };
    case 'anscombe':
      return { titulo: 'Puntos por tramo de y', unidad: 'puntos', items: porTramos(valoresDe(filas, 'y'), [6, 8, 10], ['y menor que 6', '6 a 8', '8 a 10', '10 o más']) };
    case 'confusora-temperatura':
      return { titulo: 'Días por franja de temperatura', unidad: 'días', items: FRANJAS_TEMP.map((n, i) => ({ nombre: n, valor: filas.filter((f) => num(f.temperatura) && franjaTemperatura(f.temperatura) === i).length })) };
    case 'horas-y-notas':
      return { titulo: 'Alumnos por tramo de nota', unidad: 'alumnos', items: porTramos(valoresDe(filas, 'nota'), [4, 6, 8], ['Menos de 4', '4 a 6', '6 a 8', '8 o más']) };
  }
}

// ---------------------------------------------------------------- líneas
export interface Serie { nombre: string; puntos: { x: number; y: number }[] }
export interface Series { xEtiqueta: string; yEtiqueta: string; series: Serie[] }

const zeta = (v: number[]) => { const m = media(v), s = desvio(v) || 1; return v.map((x) => (x - m) / s); };

export function seriesDe(ds: Dataset, filas: Fila[]): Series {
  switch (ds.id) {
    case 'ventas-mensuales':
      return { xEtiqueta: 'Mes (1 = enero de 2024)', yEtiqueta: 'Ventas (miles de $)', series: REGIONES.map((r) => ({
        nombre: r, puntos: filas.filter((f) => f.region === r).map((f) => ({ x: f.t as number, y: f.ventas as number })),
      })) };
    case 'tickets-sucios': {
      const porSemana = new Map<number, number>();
      for (const f of filas) { if (!num(f.dia)) continue; const s = Math.floor(f.dia / 7) + 1; porSemana.set(s, (porSemana.get(s) ?? 0) + 1); }
      const semanas = [...porSemana.keys()].sort((a, b) => a - b);
      return { xEtiqueta: 'Semana', yEtiqueta: 'Tickets por semana', series: [{ nombre: 'Tickets', puntos: semanas.map((s) => ({ x: s, y: porSemana.get(s)! })) }] };
    }
    case 'latencias':
      return { xEtiqueta: 'Medición n.º', yEtiqueta: 'Latencia (ms)', series: [{ nombre: 'Latencia', puntos: filas.filter((f) => num(f.latencia_ms)).map((f) => ({ x: f.n as number, y: f.latencia_ms as number })) }] };
    case 'anscombe': {
      const p = filas.map((f) => ({ x: f.x as number, y: f.y as number })).sort((a, b) => a.x - b.x);
      return { xEtiqueta: 'x', yEtiqueta: 'y', series: [{ nombre: 'y', puntos: p }] };
    }
    case 'confusora-temperatura': {
      const dias = filas.map((f) => f.dia as number);
      const h = zeta(valoresDe(filas, 'ventas_helado')), g = zeta(valoresDe(filas, 'golpes_de_calor')), t = zeta(valoresDe(filas, 'temperatura'));
      const mk = (nombre: string, v: number[]) => ({ nombre, puntos: dias.map((x, i) => ({ x, y: v[i]! })) });
      return { xEtiqueta: 'Día', yEtiqueta: 'Valor estandarizado (z)', series: [mk('Temperatura', t), mk('Helados', h), mk('Golpes de calor', g)] };
    }
    case 'horas-y-notas':
      return { xEtiqueta: 'Alumno n.º', yEtiqueta: 'Nota', series: [{ nombre: 'Nota', puntos: filas.map((f) => ({ x: f.alumno as number, y: f.nota as number })) }] };
  }
}

// ---------------------------------------------------------------- lecturas y escala (para la UI de SimDatos)
/** Datasets donde la regresión es el tema: si el escritor no dice `regresion`, se muestra igual. */
export const CON_REGRESION_POR_DEFECTO = new Set<Dataset['id']>(['anscombe', 'confusora-temperatura', 'horas-y-notas']);
export const hayRegresion = (ds: Dataset, prop?: boolean) => prop ?? CON_REGRESION_POR_DEFECTO.has(ds.id);

export interface LecturasDatos extends Resumen { regresion: Regresion | null; porFranja: Regresion[] | null }
/** Todo lo que muestran las lecturas, sin formatear. `colorear` agrega la regresión dentro de cada franja de temperatura. */
export function lecturasDe(ds: Dataset, filas: Fila[], conRegresion: boolean, colorear = false): LecturasDatos {
  return {
    ...resumir(ds, filas),
    regresion: conRegresion ? regresionDe(ds, filas) : null,
    porFranja: conRegresion && colorear && ds.id === 'confusora-temperatura' ? regresionPorFranja(ds, filas) : null,
  };
}

/** Valores "lejísimos" de la variable principal: quedan fuera de la escala de los gráficos (y se avisa). */
export function escalaPrincipal(ds: Dataset, filas: Fila[]): { limite: number; fuera: number[] } {
  return fueraDeEscala(valoresDe(filas, ds.principal));
}
