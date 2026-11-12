// Tipos comunes de las máquinas de estados de SimMaquinaEstados (módulos puros: sin React ni DOM).
// Cada máquina es una función pura: (estado, evento, config) → nuevo estado + líneas de log.
// El tiempo simulado `t` va en milisegundos enteros, para que no haya errores de redondeo.

export type Cfg = Record<string, number | boolean | string>;

export interface Linea { t: number; texto: string }
export interface Cambio { de: string; a: string }

/** Campos que tiene todo estado de máquina. */
export interface EstadoBase {
  estado: string;
  /** reloj simulado en ms desde el inicio */
  t: number;
  transiciones: number;
}

export interface Salida<E> { e: E; log: Linea[]; cambios: Cambio[] }

export interface EventoDef { id: string; texto: string }

export type ControlDef =
  | { tipo: 'slider'; clave: string; etiqueta: string; min: number; max: number; paso: number; unidad: string }
  | { tipo: 'toggle'; clave: string; etiqueta: string }
  | { tipo: 'select'; clave: string; etiqueta: string; opciones: { valor: string; texto: string }[] };

/** Posición en fracciones (0..1) dentro del área útil del diagrama. */
export interface NodoDef {
  id: string;
  lineas: string[];
  x: number;
  y: number;
  /** 'letra': primera línea grande (la letra de `ps`); 'partido': dos líneas iguales */
  estilo?: 'letra' | 'partido';
  /** nodo punteado (estado terminal que no es un estado "real") */
  fantasma?: boolean;
}
export interface FlechaDef { de: string; a: string; etiqueta?: string; curva?: number }
export interface DiagramaDef {
  nodos: NodoDef[];
  flechas: FlechaDef[];
  altoAncho: number;
  altoAngosto: number;
}

export interface LecturaDef {
  clave: string;
  etiqueta: string;
  valor: string | number;
  unidad?: string;
  tono?: 'alerta' | 'buena';
}
export interface Resumen { titulo: string; lineas: string[] }

export type PresetMaquina = 'circuit-breaker' | 'unidad-systemd' | 'proceso-linux' | 'contenedor-docker' | 'incidente-itil';

export interface DefMaquina<E extends EstadoBase = EstadoBase> {
  preset: PresetMaquina;
  diagrama: DiagramaDef;
  eventos: EventoDef[];
  controles: ControlDef[];
  cfgInicial: Cfg;
  /** true: el reloj corre solo (hay temporizadores); false: el tiempo avanza solo con cada evento */
  tiempoReal: boolean;
  inicial(semilla: number): Salida<E>;
  esValido(e: E, evento: string, cfg: Cfg): boolean;
  aplicar(e: E, evento: string, cfg: Cfg): Salida<E>;
  /** avanza el reloj simulado `dtMs` milisegundos (temporizadores, tráfico automático) */
  avanzar(e: E, dtMs: number, cfg: Cfg): Salida<E>;
  lecturas(e: E, cfg: Cfg): LecturaDef[];
  resumen?(e: E, cfg: Cfg): Resumen;
  /** texto chico debajo de un nodo (por ejemplo, la cuenta regresiva del breaker) */
  notasNodos?(e: E, cfg: Cfg): Record<string, string>;
  /** últimos pedidos del breaker: 'ok' | 'falla' | 'vacio' */
  ventana?(e: E): ('ok' | 'falla' | 'vacio')[];
  /** nota fija debajo del diagrama */
  nota?: string;
}

/** Hora simulada HH:MM:SS (el día arranca a las 10:00:00). */
export function hora(tMs: number): string {
  const s = 10 * 3600 + Math.floor(tMs / 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600) % 24)}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

/** Cambia de estado sumando una transición y registrándola en `cambios` (si el estado es el mismo, no hace nada). */
export function ir<E extends EstadoBase>(e: E, a: string, cambios: Cambio[]): E {
  if (e.estado === a) return e;
  cambios.push({ de: e.estado, a });
  return { ...e, estado: a, transiciones: e.transiciones + 1 };
}

export const salida = <E>(e: E, log: Linea[] = [], cambios: Cambio[] = []): Salida<E> => ({ e, log, cambios });
