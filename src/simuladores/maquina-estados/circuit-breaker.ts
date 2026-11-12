// Circuit breaker (preset "circuit-breaker"). Módulo puro: tráfico automático de 10 pedidos/s simulados.
// El azar de cada pedido sale de una función hash de (semilla, n.º de pedido): mismo estado + misma semilla = mismas lecturas.
import { mulberry32 } from '../azar';
import { num } from '../formato';
import { ir, salida, type Cambio, type Cfg, type DefMaquina, type EstadoBase, type Linea, type Salida } from './tipos';

export type Resultado = 'ok' | 'falla';

export interface EstadoBreaker extends EstadoBase {
  semilla: number;
  /** pedidos generados hasta ahora (índice del próximo) */
  n: number;
  /** instante (ms) en que llega el próximo pedido */
  prox: number;
  /** resultados de los últimos pedidos que llegaron al servicio (hasta 20) */
  ventana: Resultado[];
  llamadas: number;
  rechazados: number;
  /** fin de la espera en `abierto` */
  hasta: number;
  /** semi-abierto: cuándo se resuelve el pedido de prueba */
  sondaVence: number;
  /** semi-abierto: índice del pedido de prueba */
  sondaN: number;
}

export const PERIODO_MS = 100; // 10 pedidos por segundo
export const TAM_VENTANA = 20;
export const MIN_MUESTRAS = 10;
export const SONDA_MS = 1000; // lo que tarda el pedido de prueba en volver

const l = (t: number, texto: string): Linea => ({ t, texto });

/** ¿El pedido n.º `n` falla con esta tasa (0-100 %)? Determinista. */
export function fallaEl(semilla: number, n: number, tasa: number): boolean {
  const r = mulberry32((semilla ^ Math.imul(n + 1, 0x9e3779b1)) >>> 0)();
  return r * 100 < tasa;
}

export const fallasEnVentana = (v: Resultado[]) => v.filter((x) => x === 'falla').length;
export const porcentajeFallas = (v: Resultado[]) => (v.length === 0 ? 0 : (100 * fallasEnVentana(v)) / v.length);

export function inicialBreaker(semilla: number): Salida<EstadoBreaker> {
  const e: EstadoBreaker = {
    estado: 'cerrado', t: 0, transiciones: 0, semilla, n: 0, prox: PERIODO_MS,
    ventana: [], llamadas: 0, rechazados: 0, hasta: 0, sondaVence: 0, sondaN: 0,
  };
  return salida(e, [l(0, 'circuito cerrado: los pedidos pasan al servicio (10 por segundo)')]);
}

const tasaDe = (cfg: Cfg) => Number(cfg.tasa ?? 0);
const umbralDe = (cfg: Cfg) => Number(cfg.umbral ?? 50);
const esperaMs = (cfg: Cfg) => Math.round(Number(cfg.espera ?? 5) * 1000);

export function avanzarBreaker(e0: EstadoBreaker, dtMs: number, cfg: Cfg): Salida<EstadoBreaker> {
  const objetivo = e0.t + dtMs;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  let e = e0;
  for (let i = 0; i < 5000; i++) {
    const tTimer = e.estado === 'abierto' ? e.hasta : e.estado === 'semi-abierto' ? e.sondaVence : Infinity;
    const sig = Math.min(tTimer, e.prox);
    if (sig > objetivo) break;
    e = { ...e, t: sig };
    if (tTimer <= e.prox) {
      if (e.estado === 'abierto') {
        // Terminó la espera: un único pedido de prueba pasa al servicio.
        e = { ...ir(e, 'semi-abierto', cambios), sondaN: e.n, sondaVence: sig + SONDA_MS, n: e.n + 1, llamadas: e.llamadas + 1 };
        log.push(l(sig, 'terminó la espera: pasa a semi-abierto y deja pasar 1 pedido de prueba'));
      } else if (fallaEl(e.semilla, e.sondaN, tasaDe(cfg))) {
        e = { ...ir(e, 'abierto', cambios), hasta: sig + esperaMs(cfg) };
        log.push(l(sig, `el pedido de prueba falló: vuelve a abierto y espera ${num(esperaMs(cfg) / 1000, 0)} s más`));
      } else {
        e = { ...ir(e, 'cerrado', cambios), ventana: [] };
        log.push(l(sig, 'el pedido de prueba anduvo: el circuito se cierra y la ventana arranca de cero'));
      }
      continue;
    }
    // Llega un pedido.
    const n = e.n;
    e = { ...e, n: n + 1, prox: e.prox + PERIODO_MS };
    if (e.estado !== 'cerrado') {
      e = { ...e, rechazados: e.rechazados + 1 };
      continue;
    }
    const res: Resultado = fallaEl(e.semilla, n, tasaDe(cfg)) ? 'falla' : 'ok';
    const ventana = [...e.ventana, res].slice(-TAM_VENTANA);
    e = { ...e, llamadas: e.llamadas + 1, ventana };
    const pct = porcentajeFallas(ventana);
    if (ventana.length >= MIN_MUESTRAS && pct >= umbralDe(cfg)) {
      e = { ...ir(e, 'abierto', cambios), hasta: sig + esperaMs(cfg) };
      log.push(l(sig, `fallaron ${fallasEnVentana(ventana)} de los últimos ${ventana.length} pedidos (${num(pct, 0)} %), umbral ${num(umbralDe(cfg), 0)} %: el circuito se abre y rechaza al instante`));
    }
  }
  return salida({ ...e, t: objetivo }, log, cambios);
}

export const defBreaker: DefMaquina<EstadoBreaker> = {
  preset: 'circuit-breaker',
  tiempoReal: true,
  diagrama: {
    altoAncho: 250,
    altoAngosto: 270,
    nodos: [
      { id: 'cerrado', lineas: ['cerrado'], x: 0, y: 0 },
      { id: 'abierto', lineas: ['abierto'], x: 1, y: 0 },
      { id: 'semi-abierto', lineas: ['semi-abierto'], x: 0.5, y: 1 },
    ],
    flechas: [
      { de: 'cerrado', a: 'abierto', etiqueta: 'fallas ≥ umbral', curva: 0 },
      { de: 'abierto', a: 'semi-abierto', etiqueta: 'pasa la espera', curva: 0 },
      { de: 'semi-abierto', a: 'cerrado', etiqueta: 'la prueba anda', curva: 0 },
      { de: 'semi-abierto', a: 'abierto', etiqueta: 'la prueba falla', curva: 26 },
    ],
  },
  eventos: [],
  controles: [
    { tipo: 'slider', clave: 'tasa', etiqueta: 'Tasa de falla del servicio', min: 0, max: 100, paso: 5, unidad: '%' },
    { tipo: 'slider', clave: 'umbral', etiqueta: 'Umbral (últimos 20 pedidos)', min: 10, max: 90, paso: 5, unidad: '%' },
    { tipo: 'slider', clave: 'espera', etiqueta: 'Espera en abierto', min: 1, max: 30, paso: 1, unidad: 's' },
  ],
  cfgInicial: { tasa: 20, umbral: 50, espera: 5 },
  inicial: inicialBreaker,
  esValido: () => false,
  aplicar: (e) => salida(e),
  avanzar: avanzarBreaker,
  lecturas: (e) => [
    { clave: 'estado', etiqueta: 'Estado', valor: e.estado, tono: e.estado === 'abierto' ? 'alerta' : e.estado === 'cerrado' ? 'buena' : undefined },
    { clave: 'transiciones', etiqueta: 'Transiciones', valor: e.transiciones },
    { clave: 'fallas-ventana', etiqueta: 'Fallas en la ventana', valor: num(porcentajeFallas(e.ventana), 0), unidad: '%' },
    { clave: 'rechazados-rapido', etiqueta: 'Rechazados al instante', valor: e.rechazados },
    { clave: 'llamadas-al-servicio', etiqueta: 'Llamadas al servicio', valor: e.llamadas },
  ],
  notasNodos: (e): Record<string, string> =>
    e.estado === 'abierto'
      ? { abierto: `reintenta en ${num(Math.max(0, e.hasta - e.t) / 1000, 1)} s` }
      : e.estado === 'semi-abierto'
        ? { 'semi-abierto': 'probando con 1 pedido…' }
        : {},
  ventana: (e) => {
    const v: ('ok' | 'falla' | 'vacio')[] = [...e.ventana];
    while (v.length < TAM_VENTANA) v.unshift('vacio');
    return v;
  },
};
