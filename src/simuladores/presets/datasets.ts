// Generadores de los datasets de SimDatos (SIMULADORES.md §2.6): funciones puras que reciben la semilla.
// Los conteos exactos del doc (200 filas, 8 duplicadas, 6 faltantes, 3 en horas, 2 outliers...) se comprueban en tests/sim-datos.test.ts.
import { lognormal, mezclar, mulberry32, normal, type Azar } from '../azar';
import { cercas } from '../datos/estadistica';

export type DatasetId = 'tickets-sucios' | 'ventas-mensuales' | 'latencias' | 'anscombe' | 'confusora-temperatura' | 'horas-y-notas';
export type Valor = string | number | null;
export type Fila = Record<string, Valor>;
export interface Columna { clave: string; etiqueta: string; unidad?: string; oculta?: boolean }

export interface Dataset {
  id: DatasetId;
  columnas: Columna[];
  filas: Fila[];
  /** variable numérica principal (media, mediana, desvío, histograma, caja) */
  principal: string;
  /** columna categórica para agrupar (caja, barras, torta, líneas) */
  grupo?: string;
  /** par (x, y) para la dispersión y la regresión */
  par: { x: string; y: string };
  /** columna numérica del eje x en las vistas de líneas */
  orden?: string;
}

const redondear = (x: number, dec = 0) => Math.round(x * 10 ** dec) / 10 ** dec;
const OFFSET: Record<DatasetId, number> = {
  'tickets-sucios': 101, 'ventas-mensuales': 202, latencias: 303, anscombe: 404, 'confusora-temperatura': 505, 'horas-y-notas': 606,
};

// ---------------------------------------------------------------- tickets-sucios
export const CATEGORIAS_TICKETS = ['Accesos', 'Correo', 'Software', 'Red', 'Hardware'] as const;
const MEDIA_TICKETS: Record<(typeof CATEGORIAS_TICKETS)[number], number> = { Accesos: 55, Correo: 70, Software: 95, Red: 110, Hardware: 130 };
export const CONTEO_TICKETS = { total: 200, duplicadas: 8, faltantes: 6, enHoras: 3, outliers: 2 } as const;
/** Valores de `minutos_resolucion` iguales o menores a este umbral se interpretan como horas (el toggle "corregir unidades"). */
export const UMBRAL_HORAS = 5;

function fechaISO(base: Date, dias: number): string {
  const d = new Date(base.getTime() + dias * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function ticketsSucios(semilla = 42): Dataset {
  const r = mulberry32(semilla + OFFSET['tickets-sucios']);
  const unicas = CONTEO_TICKETS.total - CONTEO_TICKETS.duplicadas; // 192
  const base = new Date(Date.UTC(2025, 2, 3));

  // Minutos "normales": por categoría, acotados dentro de las cercas 1,5·IQR para que no haya atípicos naturales.
  const crudo = Array.from({ length: unicas }, () => {
    const categoria = CATEGORIAS_TICKETS[Math.floor(r() * CATEGORIAS_TICKETS.length)]!;
    return { categoria, minutos: MEDIA_TICKETS[categoria] + normal(r) * 18 };
  });
  const c = cercas(crudo.map((x) => x.minutos));
  const piso = Math.max(12, c.q1 - 1.2 * c.iqr);
  const techo = c.q3 + 1.2 * c.iqr;
  const filas: Fila[] = crudo.map((x, i) => ({
    id: `T-${String(i + 1).padStart(4, '0')}`,
    categoria: x.categoria,
    minutos_resolucion: redondear(Math.min(techo, Math.max(piso, x.minutos))),
    fecha: fechaISO(base, Math.floor((i * 118) / unicas)),
  }));

  // Posiciones disjuntas para cada problema (mezcladas con la semilla, no a mano).
  const idx = mezclar(r, Array.from({ length: unicas }, (_, i) => i));
  let k = 0;
  const tomar = (n: number) => idx.slice(k, (k += n));
  const aOutliers = tomar(CONTEO_TICKETS.outliers);
  const aHoras = tomar(CONTEO_TICKETS.enHoras);
  const aFaltantes = tomar(CONTEO_TICKETS.faltantes);
  const aDuplicar = tomar(CONTEO_TICKETS.duplicadas);

  [2480, 3150].forEach((v, j) => { filas[aOutliers[j]!]!.minutos_resolucion = v; });
  [1, 1.5, 2].forEach((h, j) => { filas[aHoras[j]!]!.minutos_resolucion = h; });
  for (const i of aFaltantes) filas[i]!.minutos_resolucion = null;

  // Duplicados: copias exactas que reaparecen más adelante (una re-importación).
  const todas = [...filas];
  for (const i of [...aDuplicar].sort((a, b) => a - b)) {
    const destino = Math.min(todas.length, i + 1 + Math.floor(r() * 60));
    todas.splice(destino, 0, { ...filas[i]! });
  }
  return {
    id: 'tickets-sucios',
    columnas: [
      { clave: 'id', etiqueta: 'id' },
      { clave: 'categoria', etiqueta: 'categoría' },
      { clave: 'minutos_resolucion', etiqueta: 'minutos de resolución', unidad: 'min' },
      { clave: 'fecha', etiqueta: 'fecha' },
    ],
    filas: todas.map((f, n) => ({ ...f, dia: Math.round((Date.parse(String(f.fecha)) - base.getTime()) / 86_400_000), _n: n })),
    principal: 'minutos_resolucion', grupo: 'categoria', par: { x: 'dia', y: 'minutos_resolucion' }, orden: 'dia',
  };
}

// ---------------------------------------------------------------- ventas-mensuales
export const REGIONES = ['Norte', 'Centro', 'Sur'] as const;
export const MESES_VENTAS = 24;
export function ventasMensuales(semilla = 42): Dataset {
  const r = mulberry32(semilla + OFFSET['ventas-mensuales']);
  const filas: Fila[] = [];
  for (let t = 1; t <= MESES_VENTAS; t++) {
    const mes = new Date(Date.UTC(2024, t - 1, 1)).toISOString().slice(0, 10);
    const v: Record<(typeof REGIONES)[number], number> = {
      Norte: 90 + 5 * t + normal(r) * 6,                                  // tendencia creciente
      Centro: 150 + 38 * Math.sin(((t - 3) / 12) * 2 * Math.PI) + normal(r) * 5, // estacionalidad anual
      Sur: 118 + normal(r) * 7,                                          // plana
    };
    for (const region of REGIONES) filas.push({ mes, region, ventas: redondear(v[region]), t });
  }
  return {
    id: 'ventas-mensuales',
    columnas: [
      { clave: 'mes', etiqueta: 'mes' }, { clave: 'region', etiqueta: 'región' },
      { clave: 'ventas', etiqueta: 'ventas', unidad: 'miles de $' }, { clave: 't', etiqueta: 'mes n.º', oculta: true },
    ],
    filas, principal: 'ventas', grupo: 'region', par: { x: 't', y: 'ventas' }, orden: 't',
  };
}

// ---------------------------------------------------------------- latencias
export const MEDIANA_LATENCIAS = 120;
export const SIGMA_LATENCIAS = 0.5;
export const EXTREMOS_LATENCIAS = { cantidad: 5, valor: 30_000 } as const;
export function latencias(semilla = 42, extremos = false): Dataset {
  const r = mulberry32(semilla + OFFSET.latencias);
  const filas: Fila[] = Array.from({ length: 500 }, (_, i) => ({
    n: i + 1, latencia_ms: redondear(lognormal(r, Math.log(MEDIANA_LATENCIAS), SIGMA_LATENCIAS), 1),
  }));
  if (extremos) for (let j = 0; j < EXTREMOS_LATENCIAS.cantidad; j++) filas.push({ n: 501 + j, latencia_ms: EXTREMOS_LATENCIAS.valor });
  return {
    id: 'latencias',
    columnas: [{ clave: 'n', etiqueta: 'medición n.º' }, { clave: 'latencia_ms', etiqueta: 'latencia', unidad: 'ms' }],
    filas, principal: 'latencia_ms', par: { x: 'n', y: 'latencia_ms' }, orden: 'n',
  };
}

// ---------------------------------------------------------------- anscombe (valores publicados, Anscombe 1973)
const X123 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
export const ANSCOMBE = {
  I: { x: X123, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68] },
  II: { x: X123, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74] },
  III: { x: X123, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73] },
  IV: { x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89] },
} as const;
export type Cuarteto = keyof typeof ANSCOMBE;
export const CUARTETOS: Cuarteto[] = ['I', 'II', 'III', 'IV'];
export function anscombe(cuarteto: Cuarteto = 'I'): Dataset {
  const { x, y } = ANSCOMBE[cuarteto];
  return {
    id: 'anscombe',
    columnas: [{ clave: 'x', etiqueta: 'x' }, { clave: 'y', etiqueta: 'y' }],
    filas: x.map((xi, i) => ({ x: xi, y: y[i]!, cuarteto })),
    principal: 'y', par: { x: 'x', y: 'y' }, orden: 'x',
  };
}

// ---------------------------------------------------------------- confusora-temperatura
export const FRANJAS_TEMP = ['Hasta 22 °C', '22 a 30 °C', 'Más de 30 °C'] as const;
export const franjaTemperatura = (t: number) => (t < 22 ? 0 : t < 30 ? 1 : 2);
export function confusoraTemperatura(semilla = 42): Dataset {
  const r = mulberry32(semilla + OFFSET['confusora-temperatura']);
  const n = 120;
  const temp = Array.from({ length: n }, () => 14 + 24 * r());
  const helado = temp.map((t) => 60 + 16 * (t - 14) + normal(r) * 24);
  const golpes = temp.map((t) => 0.6 + 0.62 * (t - 14) + normal(r) * 1.0);
  // Las dos variables dependen de la temperatura y NO una de la otra: dentro de cada franja de temperatura
  // le quitamos a los golpes de calor la parte que "sigue" a los helados, así no queda relación entre ellas.
  for (let f = 0; f < 3; f++) {
    const ix = temp.map((t, i) => (franjaTemperatura(t) === f ? i : -1)).filter((i) => i >= 0);
    const mh = ix.reduce((s, i) => s + helado[i]!, 0) / ix.length;
    const mg = ix.reduce((s, i) => s + golpes[i]!, 0) / ix.length;
    let shh = 0, shg = 0;
    for (const i of ix) { shh += (helado[i]! - mh) ** 2; shg += (helado[i]! - mh) * (golpes[i]! - mg); }
    const beta = shh > 0 ? shg / shh : 0;
    for (const i of ix) golpes[i] = golpes[i]! - beta * (helado[i]! - mh);
  }
  const filas: Fila[] = temp.map((t, i) => ({
    dia: i + 1, temperatura: redondear(t, 1), ventas_helado: Math.max(0, redondear(helado[i]!)), golpes_de_calor: Math.max(0, redondear(golpes[i]!)),
  }));
  return {
    id: 'confusora-temperatura',
    columnas: [
      { clave: 'dia', etiqueta: 'día' }, { clave: 'temperatura', etiqueta: 'temperatura', unidad: '°C' },
      { clave: 'ventas_helado', etiqueta: 'ventas de helado', unidad: 'unidades' }, { clave: 'golpes_de_calor', etiqueta: 'golpes de calor', unidad: 'casos' },
    ],
    filas, principal: 'ventas_helado', par: { x: 'ventas_helado', y: 'golpes_de_calor' }, orden: 'dia',
  };
}

// ---------------------------------------------------------------- horas-y-notas
export const OUTLIER_NOTAS = { horas: 9.5, nota: 1 } as const;
export function horasYNotas(semilla = 42, outlier = false): Dataset {
  const r: Azar = mulberry32(semilla + OFFSET['horas-y-notas']);
  const filas: Fila[] = Array.from({ length: 60 }, (_, i) => {
    const horas = redondear(0.5 + 8 * r(), 1);
    const nota = Math.min(10, Math.max(1, 2 + 0.8 * horas + normal(r) * 0.9));
    return { alumno: i + 1, horas, nota: redondear(nota, 1) };
  });
  if (outlier) filas.push({ alumno: 61, horas: OUTLIER_NOTAS.horas, nota: OUTLIER_NOTAS.nota });
  return {
    id: 'horas-y-notas',
    columnas: [{ clave: 'alumno', etiqueta: 'alumno n.º' }, { clave: 'horas', etiqueta: 'horas de estudio', unidad: 'h' }, { clave: 'nota', etiqueta: 'nota' }],
    filas, principal: 'nota', par: { x: 'horas', y: 'nota' }, orden: 'alumno',
  };
}

export interface OpcionesDataset { extremos?: boolean; outlier?: boolean; cuarteto?: Cuarteto }
export function generarDataset(id: DatasetId, semilla = 42, o: OpcionesDataset = {}): Dataset {
  switch (id) {
    case 'tickets-sucios': return ticketsSucios(semilla);
    case 'ventas-mensuales': return ventasMensuales(semilla);
    case 'latencias': return latencias(semilla, o.extremos);
    case 'anscombe': return anscombe(o.cuarteto);
    case 'confusora-temperatura': return confusoraTemperatura(semilla);
    case 'horas-y-notas': return horasYNotas(semilla, o.outlier);
  }
}
