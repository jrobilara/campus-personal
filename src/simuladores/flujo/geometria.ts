// Geometría pura de SimFlujo (sin React ni DOM): dónde está cada punto que viaja, según el tiempo simulado.
// Las islas dibujan lo que sale de acá; así se puede testear sin navegador.
import type { Llegada } from './balanceador';
import { ENCOLAR, INTERVALO, PROC_A, RED, TIMEOUT_B, type PedidoAsinc, type PedidoSinc } from './sincrono';

export interface Pt {
  x: number;
  y: number;
}

/** Largo de una poligonal. */
export function largoRuta(ruta: readonly Pt[]): number {
  let s = 0;
  for (let i = 1; i < ruta.length; i++) s += Math.hypot(ruta[i]!.x - ruta[i - 1]!.x, ruta[i]!.y - ruta[i - 1]!.y);
  return s;
}

/** Punto a distancia `d` (en unidades del dibujo) a lo largo de una poligonal; se queda en el extremo si se pasa. */
export function enRuta(ruta: readonly Pt[], d: number): Pt {
  if (ruta.length === 0) return { x: 0, y: 0 };
  let resto = Math.max(0, d);
  for (let i = 1; i < ruta.length; i++) {
    const a = ruta[i - 1]!;
    const b = ruta[i]!;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (resto <= l) {
      const f = l === 0 ? 0 : resto / l;
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
    resto -= l;
  }
  return { ...ruta[ruta.length - 1]! };
}

const lerp = (a: number, b: number, f: number) => a + (b - a) * Math.min(1, Math.max(0, f));
const tramo = (t: number, t0: number, t1: number) => (t1 <= t0 ? 1 : Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));

/* ------------------------------------------------------------------ balanceador */

export const ANCHO_BAL = 440;
export const DURACION_VIAJE = 0.6; // s que tarda un pedido en llegar del cliente al servidor
const DESVANECE = 0.3;

export interface LayoutBalanceador {
  ancho: number;
  alto: number;
  cy: number;
  /** centro vertical de cada servidor */
  ys: number[];
  xCliente: number;
  xLbIzq: number;
  xLbDer: number;
  xCacheIzq: number;
  xCacheDer: number;
  xCodo: number;
  xSrv: number;
  anchoSrv: number;
  xCola: number;
  anchoCola: number;
}

export function layoutBalanceador(n: number): LayoutBalanceador {
  const paso = 46;
  const alto = Math.max(150, n * paso + 16);
  const ys = Array.from({ length: n }, (_, i) => (alto - n * paso) / 2 + paso * i + paso / 2);
  return {
    ancho: ANCHO_BAL, alto, cy: alto / 2, ys,
    xCliente: 40, xLbIzq: 92, xLbDer: 144, xCacheIzq: 176, xCacheDer: 222, xCodo: 241,
    xSrv: 260, anchoSrv: 74, xCola: 342, anchoCola: 86,
  };
}

/** Recorrido de un pedido hacia el servidor `i` (con o sin caché en el medio). */
export function rutaAServidor(l: LayoutBalanceador, i: number, cache: boolean): Pt[] {
  const y = l.ys[i] ?? l.cy;
  return [
    { x: l.xCliente, y: l.cy }, { x: l.xLbIzq, y: l.cy }, { x: l.xLbDer, y: l.cy },
    ...(cache ? [{ x: l.xCacheIzq, y: l.cy }, { x: l.xCacheDer, y: l.cy }] : []),
    { x: l.xCodo, y: l.cy }, { x: l.xCodo, y }, { x: l.xSrv, y },
  ].filter((p, k, a) => k === 0 || p.x !== a[k - 1]!.x || p.y !== a[k - 1]!.y);
}

export interface PuntoBal {
  id: number;
  x: number;
  y: number;
  opacidad: number;
  estado: 'normal' | 'acierto' | 'rechazo';
}

/** Puntos a dibujar para las llegadas recientes. */
export function puntosBalanceador(llegadas: readonly Llegada[], ahora: number, l: LayoutBalanceador, cache: boolean): PuntoBal[] {
  const out: PuntoBal[] = [];
  const vel = largoRuta(rutaAServidor(l, 0, cache)) / DURACION_VIAJE; // unidades por segundo
  for (const ll of llegadas) {
    const edad = ahora - ll.t;
    if (edad < 0) continue;
    let ruta: Pt[];
    let estado: PuntoBal['estado'] = 'normal';
    if (ll.acierto) {
      ruta = [{ x: l.xCliente, y: l.cy }, { x: l.xLbIzq, y: l.cy }, { x: l.xLbDer, y: l.cy }, { x: l.xCacheIzq, y: l.cy }, { x: (l.xCacheIzq + l.xCacheDer) / 2, y: l.cy }];
      estado = 'acierto';
    } else if (ll.rechazado) {
      ruta = [{ x: l.xCliente, y: l.cy }, { x: l.xLbIzq, y: l.cy }];
      estado = 'rechazo';
    } else {
      ruta = rutaAServidor(l, ll.srv, cache);
    }
    const largo = largoRuta(ruta);
    const llegaA = largo / vel;
    const p = enRuta(ruta, edad * vel);
    let opacidad = 1;
    if (edad >= llegaA) {
      if (estado === 'normal') continue; // ya entró al servidor
      opacidad = 1 - (edad - llegaA) / DESVANECE;
      if (opacidad <= 0) continue;
    }
    out.push({ id: ll.id, x: p.x, y: p.y, opacidad, estado });
  }
  return out;
}

/* ------------------------------------------------------------------ cola */

export const ANCHO_COLA = 440;
export const COLUMNAS = 10;
export const PASO_BLOQUE = 15;
export const MAX_RANURAS = 60;

export interface LayoutCola {
  ancho: number;
  alto: number;
  cy: number;
  ranuras: number;
  filas: number;
  xMarco: number;
  yMarco: number;
  anchoMarco: number;
  altoMarco: number;
  xProductor: number;
  xConsumidor: number;
  anchoConsumidor: number;
  altoConsumidor: number;
  yConsumidores: number[];
}

export function layoutCola(capacidad: number, consumidores: number): LayoutCola {
  const ranuras = Math.min(MAX_RANURAS, Math.max(1, capacidad));
  const filas = Math.ceil(ranuras / COLUMNAS);
  const altoMarco = filas * PASO_BLOQUE + 2;
  const paso = 38;
  const alto = Math.max(altoMarco + 40, consumidores * paso + 16, 130);
  const cy = alto / 2;
  const yConsumidores = Array.from({ length: consumidores }, (_, i) => (alto - consumidores * paso) / 2 + paso * i + paso / 2);
  return {
    ancho: ANCHO_COLA, alto, cy, ranuras, filas,
    xMarco: 98, yMarco: cy - altoMarco / 2, anchoMarco: COLUMNAS * PASO_BLOQUE + 2, altoMarco,
    xProductor: 44, xConsumidor: 292, anchoConsumidor: 132, altoConsumidor: 30, yConsumidores,
  };
}

/** Esquina superior izquierda de la ranura `k` (0 = la cabeza de la cola, junto a los consumidores). */
export function ranura(l: LayoutCola, k: number): Pt {
  const col = k % COLUMNAS;
  const fila = Math.floor(k / COLUMNAS);
  return { x: l.xMarco + 1 + (COLUMNAS - 1 - col) * PASO_BLOQUE, y: l.yMarco + 1 + fila * PASO_BLOQUE };
}

/* ------------------------------------------------------------------ síncrono vs asíncrono */

export const ANCHO_SINC = 440;
export const ALTO_SINC = 252;
export const X_CLIENTE = 44;
export const X_A = 168;
export const X_COLA = 236; // borde izquierdo del recuadro de la cola (carril asíncrono)
export const ANCHO_COLA_SINC = 92;
export const X_B = 384;
export const Y_SINC = 66;
export const Y_ASINC = 182;

export interface PuntoSinc {
  id: number;
  x: number;
  y: number;
  opacidad: number;
  /** pedido normal, respuesta de B, error, mensaje de confirmación (ack) */
  estado: 'pedido' | 'respuesta' | 'espera' | 'error' | 'ack';
}

/** Posición de un pedido del carril síncrono: del cliente a A, de A a B, B trabaja y la respuesta vuelve. */
export function puntoSinc(p: PedidoSinc, ahora: number): PuntoSinc | null {
  const y = Y_SINC;
  const t1 = p.t0 + RED;
  const t2 = p.tLlamada;
  const t3 = p.tLlegaB;
  if (ahora < p.t0) return null;
  if (ahora < t1) return { id: p.id, x: lerp(X_CLIENTE, X_A, tramo(ahora, p.t0, t1)), y, opacidad: 1, estado: 'pedido' };
  if (ahora < t2) return { id: p.id, x: X_A, y, opacidad: 1, estado: 'pedido' };
  if (ahora < t3 || !p.resuelto) return { id: p.id, x: lerp(X_A, X_B, tramo(ahora, t2, t3)), y, opacidad: 1, estado: 'pedido' };
  if (p.ok) {
    const t4 = t3 + p.latB;
    const t5 = t4 + RED;
    if (ahora < t4) return { id: p.id, x: X_B, y, opacidad: 1, estado: 'espera' };
    if (ahora < t5) return { id: p.id, x: lerp(X_B, X_A, tramo(ahora, t4, t5)), y, opacidad: 1, estado: 'respuesta' };
    if (ahora < p.tFin) return { id: p.id, x: lerp(X_A, X_CLIENTE, tramo(ahora, t5, p.tFin)), y, opacidad: 1, estado: 'respuesta' };
    return ahora < p.tFin + 0.4 ? { id: p.id, x: X_CLIENTE, y, opacidad: 1 - (ahora - p.tFin) / 0.4, estado: 'respuesta' } : null;
  }
  // B no contesta: el pedido espera en la puerta de B hasta que A se rinde y le avisa al cliente
  const tRinde = p.tLlamada + TIMEOUT_B;
  if (ahora < tRinde) return { id: p.id, x: X_B, y, opacidad: 1, estado: 'espera' };
  if (ahora < p.tFin) return { id: p.id, x: lerp(X_B, X_CLIENTE, tramo(ahora, tRinde, p.tFin)), y, opacidad: 1, estado: 'error' };
  return ahora < p.tFin + 0.4 ? { id: p.id, x: X_CLIENTE, y, opacidad: 1 - (ahora - p.tFin) / 0.4, estado: 'error' } : null;
}

/** Posición de un pedido del carril asíncrono: viaja hasta A, y A contesta la confirmación enseguida. */
export function puntoAsinc(a: PedidoAsinc, ahora: number): PuntoSinc | null {
  const y = Y_ASINC;
  const t1 = a.t0 + RED;
  if (ahora < a.t0) return null;
  if (ahora < t1) return { id: a.id, x: lerp(X_CLIENTE, X_A, tramo(ahora, a.t0, t1)), y, opacidad: 1, estado: 'pedido' };
  if (ahora < a.tEncola) return { id: a.id, x: X_A, y, opacidad: 1, estado: 'pedido' };
  if (ahora < a.tAck) return { id: a.id, x: lerp(X_A, X_CLIENTE, tramo(ahora, a.tEncola, a.tAck)), y, opacidad: 1, estado: 'ack' };
  return ahora < a.tAck + 0.4 ? { id: a.id, x: X_CLIENTE, y, opacidad: 1 - (ahora - a.tAck) / 0.4, estado: 'ack' } : null;
}

/** Duración mínima que el modelo le da a un pedido hasta que A termina de procesarlo (para tests). */
export const TIEMPO_EN_A = RED + PROC_A + ENCOLAR;
export const INTERVALO_PEDIDOS = INTERVALO;

/* ------------------------------------------------------------------ cadena */

export const ANCHO_CADENA = 440;

export interface LayoutCadena {
  xCliente: number;
  /** centro horizontal de cada servicio */
  xs: number[];
  anchoNodo: number;
}

export function layoutCadena(servicios: number): LayoutCadena {
  const desde = 92;
  const hasta = ANCHO_CADENA - 40;
  const paso = servicios === 1 ? 0 : (hasta - desde) / (servicios - 1);
  const anchoNodo = servicios === 1 ? 110 : Math.min(54, paso - 8);
  const xs = Array.from({ length: servicios }, (_, i) => (servicios === 1 ? (desde + hasta) / 2 : desde + paso * i));
  return { xCliente: 34, xs, anchoNodo };
}

/**
 * Posición (x) del punto que recorre la cadena en la animación: ida por todos los servicios y vuelta al cliente.
 * `fase` en segundos; cada salto dura `porSalto` s. Devuelve también el índice del servicio donde está (o -1 si es el cliente).
 */
export function puntoCadena(fase: number, l: LayoutCadena, porSalto = 0.5, pausa = 0.6): { x: number; en: number; vuelta: boolean } {
  const nodos = [l.xCliente, ...l.xs];
  const saltos = nodos.length - 1;
  const ida = saltos * porSalto;
  const ciclo = ida * 2 + pausa;
  const f = ((fase % ciclo) + ciclo) % ciclo;
  if (f < ida) {
    const k = Math.min(saltos - 1, Math.floor(f / porSalto));
    const x = lerp(nodos[k]!, nodos[k + 1]!, (f - k * porSalto) / porSalto);
    return { x, en: f - k * porSalto > porSalto / 2 ? k : k - 1, vuelta: false };
  }
  if (f < ida * 2) {
    const g = f - ida;
    const k = Math.min(saltos - 1, Math.floor(g / porSalto));
    const x = lerp(nodos[saltos - k]!, nodos[saltos - k - 1]!, (g - k * porSalto) / porSalto);
    return { x, en: -1, vuelta: true };
  }
  return { x: l.xCliente, en: -1, vuelta: true };
}
