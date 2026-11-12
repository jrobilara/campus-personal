// SimSerieTemporal, modo alertas: series sintéticas de 24 h (un punto por minuto) y lógica de alertas.
// Módulo puro (sin React ni DOM): lo prueba Vitest. Todo lo aleatorio sale de la semilla.
import { mulberry32, normal } from '../azar';

export const MIN_DIA = 1440;

export type EscenarioSerie = 'pico-breve' | 'fuga-memoria' | 'disco-llenandose' | 'carga-sostenida';

export interface SerieDef {
  id: string;
  etiqueta: string;
  valores: number[];
}
export interface MarcaEvento {
  minuto: number;
  texto: string;
}
export interface Escenario {
  series: SerieDef[];
  /** serie que vigilan las alertas por defecto */
  principal: string;
  metrica: string;
  unidad: '%' | '';
  ymax: number;
  /** umbral inicial razonable en la unidad de la métrica */
  umbralInicial: number;
  marcas: MarcaEvento[];
}

const acotar = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Escenarios del doc (§2.10): 24 h, un punto por minuto. */
export function generarEscenario(esc: EscenarioSerie, semilla = 42, nucleos = 4): Escenario {
  const r = mulberry32(semilla);
  const ruido = Array.from({ length: MIN_DIA }, () => normal(r));

  if (esc === 'pico-breve') {
    // CPU % estable en 30 con un pico de 3 min a 95 (10:30 a 10:32)
    const v = ruido.map((z) => acotar(30 + z * 1.2, 0, 100));
    for (const m of [630, 631, 632]) v[m] = acotar(95 + ruido[m]! * 0.8, 0, 100);
    return {
      series: [{ id: 'cpu', etiqueta: 'CPU', valores: v }], principal: 'cpu', metrica: 'Uso de CPU', unidad: '%',
      ymax: 100, umbralInicial: 90, marcas: [],
    };
  }
  if (esc === 'fuga-memoria') {
    // memoria % que sube lineal de 40 a 97 en 20 h; a las 20:00 el proceso se reinicia y vuelve a subir
    // la oscilación es suave y más lenta que la pendiente (0,0475 %/min): la serie sube siempre y no "rebota" en el umbral
    const fase = ruido[0]! * Math.PI;
    const v = ruido.map((_, m) => {
      const t = m < 1200 ? m : m - 1200;
      return acotar(40 + (57 * t) / 1200 + 0.2 * Math.sin((2 * Math.PI * m) / 37 + fase), 0, 100);
    });
    return {
      series: [{ id: 'memoria', etiqueta: 'Memoria', valores: v }], principal: 'memoria', metrica: 'Uso de memoria', unidad: '%',
      ymax: 100, umbralInicial: 90, marcas: [{ minuto: 1200, texto: 'reinicio' }],
    };
  }
  if (esc === 'disco-llenandose') {
    // estable en 70 hasta la hora 16; desde ahí sube 5 puntos por hora y llega a 100 % en la hora 22
    const v = Array.from({ length: MIN_DIA }, (_, m) => (m < 960 ? 70 : Math.min(100, 70 + ((m - 960) * 5) / 60)));
    return {
      series: [{ id: 'disco', etiqueta: 'Disco', valores: v }], principal: 'disco', metrica: 'Uso de disco', unidad: '%',
      ymax: 100, umbralInicial: 90, marcas: [{ minuto: 1320, texto: 'disco lleno' }],
    };
  }
  // carga-sostenida: procesos en cola de ejecución (instantáneo) con tres picos cortos y una hora sostenida en 6
  const inst = ruido.map((z) => Math.max(0.2, 1.2 + z * 0.25));
  for (const [ini, valor] of [[370, 8], [580, 7.5], [1020, 8]] as const) for (let m = ini; m < ini + 2; m++) inst[m] = valor;
  for (let m = 780; m < 840; m++) inst[m] = 6 + ruido[m]! * 0.2;
  const ewma = (tau: number) => {
    const a = 1 - Math.exp(-1 / tau);
    const out: number[] = [];
    let prev = 1.2;
    for (const x of inst) { prev = prev + a * (x - prev); out.push(prev); }
    return out;
  };
  return {
    series: [
      { id: 'load1', etiqueta: 'Load 1 min', valores: ewma(1) },
      { id: 'load5', etiqueta: 'Load 5 min', valores: ewma(5) },
      { id: 'load15', etiqueta: 'Load 15 min', valores: ewma(15) },
    ],
    principal: 'load5', metrica: 'Load average', unidad: '', ymax: Math.max(8, Math.ceil(nucleos * 2)),
    umbralInicial: nucleos, marcas: [],
  };
}

/** Promedio móvil hacia atrás de `ventana` puntos (1 = sin suavizar). */
export function promedioMovil(v: readonly number[], ventana: number): number[] {
  const w = Math.max(1, Math.round(ventana));
  if (w === 1) return [...v];
  const out: number[] = [];
  let suma = 0;
  for (let i = 0; i < v.length; i++) {
    suma += v[i]!;
    if (i >= w) suma -= v[i - w]!;
    out.push(suma / Math.min(w, i + 1));
  }
  return out;
}

/** Condición de umbral: el valor llegó o superó el umbral. */
export const condicionUmbral = (v: readonly number[], umbral: number): boolean[] => v.map((x) => x >= umbral);

/** Pendiente (por minuto) de la regresión lineal de los `ventana` puntos que terminan en `i`. */
export function pendienteRegresion(v: readonly number[], i: number, ventana = 60): number {
  const n = ventana;
  const ini = i - n + 1;
  const xm = (n - 1) / 2;
  let ym = 0;
  for (let k = 0; k < n; k++) ym += v[ini + k]!;
  ym /= n;
  let sxy = 0, sxx = 0;
  for (let k = 0; k < n; k++) { sxy += (k - xm) * (v[ini + k]! - ym); sxx += (k - xm) * (k - xm); }
  return sxy / sxx;
}

/**
 * Alerta predictiva: regresión lineal sobre la última hora; avisa si, siguiendo esa recta, la métrica llega
 * al tope (100 %) en menos de `horizonteMin` minutos (4 h por defecto). Si ya está en el tope, también avisa.
 */
export function condicionPredictiva(v: readonly number[], opts: { ventana?: number; horizonteMin?: number; tope?: number } = {}): boolean[] {
  const { ventana = 60, horizonteMin = 240, tope = 100 } = opts;
  return v.map((x, i) => {
    if (x >= tope) return true;
    if (i < ventana - 1) return false;
    const s = pendienteRegresion(v, i, ventana);
    return s > 1e-9 && (tope - x) / s < horizonteMin;
  });
}

export interface Episodio {
  inicio: number;
  /** último minuto con la condición verdadera (inclusive) */
  fin: number;
  /** minuto en que la alerta se dispara (null si la condición no se sostuvo `duracionMin`) */
  disparo: number | null;
}
export interface ResultadoAlertas {
  episodios: Episodio[];
  alertas: number;
  minutosEnAlerta: number;
  primerAvisoMin: number | null;
  /** true en cada minuto en que la alerta está disparada */
  enAlerta: boolean[];
}

/**
 * Como el `for:` de una regla de alerta: la alerta dispara cuando la condición lleva `duracionMin` minutos
 * seguidos verdadera (0 o 1 = al primer minuto) y queda disparada hasta que la condición se corta.
 */
export function evaluarAlertas(cond: readonly boolean[], duracionMin: number): ResultadoAlertas {
  const requeridos = Math.max(1, Math.ceil(duracionMin));
  const episodios: Episodio[] = [];
  const enAlerta = new Array<boolean>(cond.length).fill(false);
  let i = 0;
  while (i < cond.length) {
    if (!cond[i]) { i++; continue; }
    let j = i;
    while (j + 1 < cond.length && cond[j + 1]) j++;
    const largo = j - i + 1;
    const disparo = largo >= requeridos ? i + requeridos - 1 : null;
    if (disparo !== null) for (let m = disparo; m <= j; m++) enAlerta[m] = true;
    episodios.push({ inicio: i, fin: j, disparo });
    i = j + 1;
  }
  const disparados = episodios.filter((e) => e.disparo !== null);
  return {
    episodios,
    alertas: disparados.length,
    minutosEnAlerta: enAlerta.filter(Boolean).length,
    primerAvisoMin: disparados.length ? disparados[0]!.disparo : null,
    enAlerta,
  };
}

/** Primer minuto en que la serie llega al tope (disco lleno), o null. */
export function minutoLleno(v: readonly number[], tope = 100): number | null {
  const i = v.findIndex((x) => x >= tope - 1e-9);
  return i < 0 ? null : i;
}

/** Horas entre el primer aviso y el momento en que el disco se llena (null si no hubo aviso o no se llena). */
export function horasDeAnticipacion(primerAvisoMin: number | null, valores: readonly number[]): number | null {
  const lleno = minutoLleno(valores);
  if (primerAvisoMin === null || lleno === null) return null;
  return Math.max(0, lleno - primerAvisoMin) / 60;
}

/** hh:mm de un minuto del día. */
export function horaHHMM(minuto: number): string {
  const h = Math.floor(minuto / 60), m = minuto % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Evaluación completa de un escenario con los controles del simulador. */
export function analizarEscenario(
  esc: Escenario, serieId: string,
  { umbral, duracionMin, ventana, predictiva }: { umbral: number; duracionMin: number; ventana: number; predictiva: boolean },
) {
  const cruda = (esc.series.find((s) => s.id === serieId) ?? esc.series[0]!).valores;
  const evaluada = promedioMovil(cruda, ventana);
  const cond = predictiva ? condicionPredictiva(evaluada) : condicionUmbral(evaluada, umbral);
  const res = evaluarAlertas(cond, duracionMin);
  return { cruda, evaluada, ...res, anticipacionHoras: horasDeAnticipacion(res.primerAvisoMin, cruda) };
}
