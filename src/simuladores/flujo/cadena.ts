// Cálculo de la cadena de servicios (SimFlujo, modo "cadena"): latencia que se suma y disponibilidad que se multiplica.

export interface ParamsCadena {
  saltos: number;
  latenciaPorSalto: number; // ms
  disponibilidad: number; // 0..1 por servicio
  monolito: boolean;
}

/** Latencia de una llamada dentro del mismo proceso (ms). */
export const LATENCIA_MONOLITO = 1;
const HORAS_ANIO = 8760;

export interface ResultadoCadena {
  /** cantidad de servicios en la cadena (1 si es monolito) */
  servicios: number;
  latenciaTotal: number; // ms
  /** disponibilidad compuesta, 0..1 = Π disponibilidades */
  disponibilidad: number;
  /** horas de caída esperadas por año con esa disponibilidad */
  caidaAnualHoras: number;
  /** latencia acumulada después de cada servicio */
  latenciaAcumulada: number[];
  /** disponibilidad acumulada después de cada servicio */
  disponibilidadAcumulada: number[];
}

export function calcularCadena(p: ParamsCadena): ResultadoCadena {
  const servicios = p.monolito ? 1 : Math.max(1, Math.round(p.saltos));
  const lat = p.monolito ? LATENCIA_MONOLITO : p.latenciaPorSalto;
  const latenciaAcumulada: number[] = [];
  const disponibilidadAcumulada: number[] = [];
  let l = 0;
  let d = 1;
  for (let i = 0; i < servicios; i++) {
    l += lat;
    d *= p.disponibilidad;
    latenciaAcumulada.push(l);
    disponibilidadAcumulada.push(d);
  }
  return { servicios, latenciaTotal: l, disponibilidad: d, caidaAnualHoras: (1 - d) * HORAS_ANIO, latenciaAcumulada, disponibilidadAcumulada };
}
