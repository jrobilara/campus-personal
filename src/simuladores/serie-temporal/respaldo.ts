// SimSerieTemporal, modo respaldo: RPO y RTO reales a partir de la frecuencia de respaldo, el momento del incidente
// y la duración de la restauración. Módulo puro.

export const HORAS_VENTANA = 72;

export interface EntradaRespaldo {
  frecuenciaHoras: number;
  incidenteHoras: number;
  duracionRestauracionHoras: number;
  respaldoProbado: boolean;
  rpoObjetivoHoras: number;
  rtoObjetivoHoras: number;
}
export interface ResultadoRespaldo {
  /** instante (h) de cada respaldo dentro de las 72 h: 0, f, 2f... */
  respaldos: number[];
  /** último respaldo hecho antes (o justo en) el incidente */
  ultimo: number;
  /** respaldo corrupto (el último, si no estaba probado) o null */
  corrupto: number | null;
  /** respaldo que efectivamente se restaura, o null si no queda ninguno válido */
  restaurado: number | null;
  rpoRealHoras: number;
  /** tiempo perdido intentando restaurar el respaldo corrupto (0 si el respaldo estaba probado) */
  intentoFallidoHoras: number;
  /** tiempo de la restauración que sí funciona (0 si no queda ningún respaldo válido) */
  restauracionHoras: number;
  /** caída total = intento fallido + restauración buena */
  rtoRealHoras: number;
  cumpleRpo: boolean;
  cumpleRto: boolean;
  /** hora en que arranca la restauración buena (después del intento fallido, si lo hubo) */
  inicioRestauracion: number;
  /** hora en que termina la restauración */
  finRestauracion: number;
}

const EPS = 1e-9;

export function calcularRespaldo(e: EntradaRespaldo): ResultadoRespaldo {
  const f = Math.max(e.frecuenciaHoras, 0.001);
  const total = Math.floor(HORAS_VENTANA / f + EPS);
  const respaldos = Array.from({ length: total + 1 }, (_, k) => k * f);
  const k = Math.floor(e.incidenteHoras / f + EPS);
  const ultimo = k * f;
  let restaurado: number | null = ultimo;
  let corrupto: number | null = null;
  if (!e.respaldoProbado) {
    corrupto = ultimo;
    restaurado = k >= 1 ? (k - 1) * f : null;
  }
  // sin ningún respaldo válido se pierde todo lo acumulado desde el inicio de la ventana
  const rpoRealHoras = restaurado === null ? e.incidenteHoras : e.incidenteHoras - restaurado;
  // Decisión de modelado (el doc no la fija): restaurar el respaldo corrupto ocupa la misma duración y falla; recién
  // después se restaura el anterior. Entonces, con el respaldo sin probar, la caída es intento fallido + restauración.
  // Si no hay ningún respaldo anterior válido, solo queda el intento fallido (no hay nada que restaurar).
  const intentoFallidoHoras = corrupto !== null ? e.duracionRestauracionHoras : 0;
  const restauracionHoras = restaurado !== null ? e.duracionRestauracionHoras : 0;
  const rtoRealHoras = intentoFallidoHoras + restauracionHoras;
  return {
    respaldos, ultimo, corrupto, restaurado, rpoRealHoras, intentoFallidoHoras, restauracionHoras, rtoRealHoras,
    cumpleRpo: rpoRealHoras <= e.rpoObjetivoHoras + EPS,
    cumpleRto: rtoRealHoras <= e.rtoObjetivoHoras + EPS,
    inicioRestauracion: e.incidenteHoras + intentoFallidoHoras,
    finRestauracion: e.incidenteHoras + rtoRealHoras,
  };
}
