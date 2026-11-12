// Lógica pura de SimMatrizPrioridad (SIMULADORES.md §2.12): matriz impacto × urgencia, tickets, SLA y reloj.
// Sin React ni DOM: se testea con Vitest.

export type Nivel = 'A' | 'M' | 'B'; // alto/alta, medio/media, bajo/baja
export type Prioridad = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export const PRIORIDADES: Prioridad[] = ['P1', 'P2', 'P3', 'P4', 'P5'];
export const NIVELES: Nivel[] = ['A', 'M', 'B'];

export type Slas = Record<Prioridad, { respuestaMin: number; resolucionMin: number }>;

export const SLAS_POR_DEFECTO: Slas = {
  P1: { respuestaMin: 15, resolucionMin: 240 },
  P2: { respuestaMin: 30, resolucionMin: 480 },
  P3: { respuestaMin: 120, resolucionMin: 1440 },
  P4: { respuestaMin: 480, resolucionMin: 4320 },
  P5: { respuestaMin: 1440, resolucionMin: 7200 },
};

/** Matriz impacto × urgencia → prioridad (la del doc; cada organización define la suya). */
const MATRIZ: Record<Nivel, Record<Nivel, Prioridad>> = {
  A: { A: 'P1', M: 'P2', B: 'P3' },
  M: { A: 'P2', M: 'P3', B: 'P4' },
  B: { A: 'P3', M: 'P4', B: 'P5' },
};

export function prioridadDe(impacto: Nivel, urgencia: Nivel): Prioridad {
  return MATRIZ[impacto][urgencia];
}

export interface Ticket {
  id: string;
  titulo: string;
  detalle: string;
  /** clasificación inicial razonable (el aprendiz puede cambiarla) */
  impacto: Nivel;
  urgencia: Nivel;
  /** minutos de un agente para atenderlo */
  atencionMin: number;
}

export type ConjuntoTickets = 'mesa-lunes' | 'caida-parcial';

export const TICKETS: Record<ConjuntoTickets, Ticket[]> = {
  // 6 tickets de un lunes, en orden de llegada. Llegan todos juntos a las 09:00 (reloj en 00:00).
  'mesa-lunes': [
    { id: 'impresora', titulo: 'La impresora del segundo piso no imprime', detalle: 'Contabilidad usa la del primer piso mientras tanto.', impacto: 'B', urgencia: 'M', atencionMin: 25 },
    { id: 'vpn-gerente', titulo: 'Un gerente no se conecta por VPN', detalle: 'Está de viaje y presenta a las 11.', impacto: 'M', urgencia: 'A', atencionMin: 10 },
    { id: 'facturacion', titulo: 'El sistema de facturación está caído', detalle: 'Nadie puede facturar, en ninguna sucursal.', impacto: 'A', urgencia: 'A', atencionMin: 12 },
    { id: 'alta-usuario', titulo: 'Alta de usuario para alguien que entra el viernes', detalle: 'Cuenta, correo y permisos básicos.', impacto: 'B', urgencia: 'B', atencionMin: 15 },
    { id: 'lentitud', titulo: 'Todo anda lento desde hace una hora', detalle: 'Se queja toda la oficina; todavía se puede trabajar.', impacto: 'A', urgencia: 'M', atencionMin: 15 },
    { id: 'correo', titulo: 'A un usuario no le llega el correo', detalle: 'Puede usar el celular mientras tanto.', impacto: 'B', urgencia: 'M', atencionMin: 10 },
  ],
  // 5 tickets durante una caída del ERP en una sucursal.
  'caida-parcial': [
    { id: 'reporte', titulo: 'El reporte mensual de ventas no carga', detalle: 'Se necesita para el cierre de la semana que viene.', impacto: 'M', urgencia: 'B', atencionMin: 20 },
    { id: 'clave-erp', titulo: 'Un vendedor olvidó su clave del ERP', detalle: 'Hoy atiende por teléfono.', impacto: 'B', urgencia: 'M', atencionMin: 10 },
    { id: 'erp-sucursal', titulo: 'El ERP no abre en la sucursal Norte', detalle: 'Las cajas no pueden facturar ni consultar stock.', impacto: 'A', urgencia: 'A', atencionMin: 12 },
    { id: 'stock-deposito', titulo: 'El depósito no ve el stock actualizado', detalle: 'Prepara pedidos con datos de ayer.', impacto: 'M', urgencia: 'M', atencionMin: 15 },
    { id: 'cajas-tarjeta', titulo: 'Las cajas de Norte no cobran con tarjeta', detalle: 'Cobran solo en efectivo; hay cola en el local.', impacto: 'A', urgencia: 'A', atencionMin: 12 },
  ],
};

export interface Clasificacion {
  impacto: Nivel;
  urgencia: Nivel;
}

export type Clasificaciones = Record<string, Clasificacion>;

export function clasificacionInicial(c: ConjuntoTickets): Clasificaciones {
  return Object.fromEntries(TICKETS[c].map((t) => [t.id, { impacto: t.impacto, urgencia: t.urgencia }]));
}

/** Orden de llegada: el de la lista de tickets. */
export function ordenLlegada(c: ConjuntoTickets): string[] {
  return TICKETS[c].map((t) => t.id);
}

/** Orden por prioridad (P1 primero); a igual prioridad, el que llegó antes. */
export function ordenPorPrioridad(c: ConjuntoTickets, cls: Clasificaciones): string[] {
  const num = (id: string) => Number(prioridadDe(cls[id]!.impacto, cls[id]!.urgencia).slice(1));
  return TICKETS[c]
    .map((t, i) => ({ id: t.id, i }))
    .sort((a, b) => num(a.id) - num(b.id) || a.i - b.i)
    .map((x) => x.id);
}

export interface EstadoTicket {
  id: string;
  prioridad: Prioridad;
  /** ya fue atendido */
  atendido: boolean;
  /** minutos desde que llegó hasta que empezó la atención (si ya empezó) */
  respuestaMin: number | null;
  /** minutos desde que llegó hasta que terminó (si ya terminó) */
  resolucionMin: number | null;
  incumplido: boolean;
  /** cuál de los dos plazos se pasó */
  motivo: 'respuesta' | 'resolucion' | null;
}

export interface Resultado {
  estados: Record<string, EstadoTicket>;
  incumplidos: number;
  /** minutos transcurridos */
  reloj: number;
}

/**
 * Calcula todo el estado a partir de la cola de atención (orden completo) y cuántos tickets ya se atendieron.
 * Un solo agente: cada ticket consume su `atencionMin`. Todos los tickets llegan en el minuto 0.
 * Un ticket incumple si empezó a atenderse (o sigue esperando) pasado su plazo de respuesta,
 * o si terminó pasado su plazo de resolución.
 */
export function calcular(c: ConjuntoTickets, cola: string[], atendidos: number, cls: Clasificaciones, slas: Slas = SLAS_POR_DEFECTO): Resultado {
  const porId = new Map(TICKETS[c].map((t) => [t.id, t]));
  const estados: Record<string, EstadoTicket> = {};
  let reloj = 0;
  let incumplidos = 0;
  cola.forEach((id, idx) => {
    const t = porId.get(id)!;
    const prioridad = prioridadDe(cls[id]!.impacto, cls[id]!.urgencia);
    const sla = slas[prioridad];
    const hecho = idx < atendidos;
    let respuesta: number | null = null;
    let resolucion: number | null = null;
    let motivo: EstadoTicket['motivo'] = null;
    if (hecho) {
      respuesta = reloj;
      resolucion = reloj + t.atencionMin;
      reloj = resolucion;
      if (respuesta > sla.respuestaMin) motivo = 'respuesta';
      else if (resolucion > sla.resolucionMin) motivo = 'resolucion';
    }
    estados[id] = { id, prioridad, atendido: hecho, respuestaMin: respuesta, resolucionMin: resolucion, incumplido: false, motivo };
  });
  // los pendientes ya vencidos según el reloj actual
  for (const id of cola) {
    const e = estados[id]!;
    if (!e.atendido && reloj > slas[e.prioridad].respuestaMin) e.motivo = 'respuesta';
    e.incumplido = e.motivo !== null;
    if (e.incumplido) incumplidos++;
  }
  return { estados, incumplidos, reloj };
}

/** hh:mm de una cantidad de minutos. */
export function hhmm(min: number): string {
  const m = Math.round(min);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Texto corto de una duración en minutos: "15 min", "4 h", "1 d". */
export function duracionCorta(min: number): string {
  if (min < 60) return `${min} min`;
  if (min < 1440) return `${min / 60 === Math.round(min / 60) ? min / 60 : (min / 60).toFixed(1).replace('.', ',')} h`;
  const d = min / 1440;
  return `${d === Math.round(d) ? d : d.toFixed(1).replace('.', ',')} d`;
}

/** Mueve el elemento en la posición `desde` a `hasta` dentro de `lista`, sin tocar las posiciones < `fijos`. */
export function mover(lista: string[], desde: number, hasta: number, fijos: number): string[] {
  if (desde < fijos || hasta < fijos || hasta >= lista.length || desde >= lista.length || desde === hasta) return lista;
  const r = [...lista];
  const [x] = r.splice(desde, 1);
  r.splice(hasta, 0, x!);
  return r;
}
