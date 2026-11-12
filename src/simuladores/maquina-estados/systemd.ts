// Máquina de la unidad de systemd (preset "unidad-systemd"). Módulo puro.
import { num } from '../formato';
import { ir, salida, type Cambio, type Cfg, type DefMaquina, type EstadoBase, type Linea, type Salida } from './tipos';

export interface EstadoSystemd extends EstadoBase {
  /** reinicios automáticos hechos por Restart=on-failure */
  reinicios: number;
  /** instantes (ms) de las muertes recientes, para la ventana de StartLimitIntervalSec */
  muertes: number[];
  resultado: 'exit-code' | 'start-limit-hit' | null;
  /** desde cuándo está en `activating` / `deactivating` */
  desde: number;
  /** un `systemctl restart` espera a que termine de parar para volver a arrancar */
  reiniciarAlParar: boolean;
}

export const ACTIVANDO_MS = 1000;
export const DESACTIVANDO_MS = 1000;
export const VENTANA_MS = 10_000;
export const RAFAGA = 5;

const P = 'servidor systemd[1]: ';
const DESCRIPCION = 'app.service - Aplicación de ejemplo';

const l = (t: number, texto: string): Linea => ({ t, texto: P + texto });

export function inicialSystemd(): Salida<EstadoSystemd> {
  const e: EstadoSystemd = { estado: 'active', t: 0, transiciones: 0, reinicios: 0, muertes: [], resultado: null, desde: 0, reiniciarAlParar: false };
  return salida(e, [l(0, `Started ${DESCRIPCION}.`)]);
}

export function esValidoSystemd(e: EstadoSystemd, ev: string): boolean {
  switch (ev) {
    case 'start': return e.estado === 'inactive';
    case 'stop':
    case 'restart':
    case 'muere': return e.estado === 'active';
    case 'reset-failed': return e.estado === 'failed';
    default: return false;
  }
}

export const muertesRecientes = (e: EstadoSystemd) => e.muertes.filter((m) => e.t - m < VENTANA_MS).length;

export function aplicarSystemd(e0: EstadoSystemd, ev: string, cfg: Cfg): Salida<EstadoSystemd> {
  if (!esValidoSystemd(e0, ev)) return salida(e0);
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  const t = e0.t;
  let e = e0;
  switch (ev) {
    case 'start':
      e = { ...ir(e, 'activating', cambios), desde: t };
      log.push(l(t, `Starting ${DESCRIPCION}...`));
      break;
    case 'stop':
      e = { ...ir(e, 'deactivating', cambios), desde: t, reiniciarAlParar: false };
      log.push(l(t, `Stopping ${DESCRIPCION}...`));
      break;
    case 'restart':
      e = { ...ir(e, 'deactivating', cambios), desde: t, reiniciarAlParar: true };
      log.push(l(t, `Stopping ${DESCRIPCION}...`));
      break;
    case 'reset-failed':
      e = { ...ir(e, 'inactive', cambios), muertes: [], resultado: null };
      log.push(l(t, 'app.service: Failed state reset (reset-failed).'));
      break;
    case 'muere': {
      const muertes = [...e.muertes.filter((m) => t - m < VENTANA_MS), t];
      log.push(l(t, 'app.service: Main process exited, code=exited, status=1/FAILURE'));
      if (!cfg.restart) {
        e = { ...ir(e, 'failed', cambios), muertes, resultado: 'exit-code' };
        log.push(l(t, "app.service: Failed with result 'exit-code'."));
      } else if (cfg.limite && muertes.length >= RAFAGA) {
        e = { ...ir(e, 'failed', cambios), muertes, resultado: 'start-limit-hit' };
        log.push(l(t, 'app.service: Start request repeated too quickly.'));
        log.push(l(t, "app.service: Failed with result 'start-limit-hit'."));
        log.push(l(t, `Failed to start ${DESCRIPCION}.`));
      } else {
        const reinicios = e.reinicios + 1;
        e = { ...ir(e, 'activating', cambios), muertes, reinicios, desde: t };
        log.push(l(t, "app.service: Failed with result 'exit-code'."));
        log.push(l(t, `app.service: Scheduled restart job, restart counter is at ${reinicios}.`));
        log.push(l(t, `Starting ${DESCRIPCION}...`));
      }
      break;
    }
  }
  return salida(e, log, cambios);
}

const vence = (e: EstadoSystemd): number | null =>
  e.estado === 'activating' ? e.desde + ACTIVANDO_MS : e.estado === 'deactivating' ? e.desde + DESACTIVANDO_MS : null;

export function avanzarSystemd(e0: EstadoSystemd, dtMs: number): Salida<EstadoSystemd> {
  const objetivo = e0.t + dtMs;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  let e = e0;
  for (let i = 0; i < 20; i++) {
    const v = vence(e);
    if (v === null || v > objetivo) break;
    e = { ...e, t: v };
    if (e.estado === 'activating') {
      e = ir(e, 'active', cambios);
      log.push(l(v, `Started ${DESCRIPCION}.`));
    } else if (e.reiniciarAlParar) {
      log.push(l(v, `Stopped ${DESCRIPCION}.`));
      e = { ...ir(e, 'activating', cambios), desde: v, reiniciarAlParar: false };
      log.push(l(v, `Starting ${DESCRIPCION}...`));
    } else {
      e = ir(e, 'inactive', cambios);
      log.push(l(v, `Stopped ${DESCRIPCION}.`));
    }
  }
  return salida({ ...e, t: objetivo }, log, cambios);
}

const ACTIVE: Record<string, string> = {
  active: 'active (running)',
  inactive: 'inactive (dead)',
  activating: 'activating (start)',
  deactivating: 'deactivating (stop-sigterm)',
};

export const defSystemd: DefMaquina<EstadoSystemd> = {
  preset: 'unidad-systemd',
  tiempoReal: true,
  diagrama: {
    altoAncho: 270,
    altoAngosto: 270,
    nodos: [
      { id: 'activating', lineas: ['activating'], x: 0.5, y: 0 },
      { id: 'active', lineas: ['active'], x: 1, y: 0 },
      { id: 'inactive', lineas: ['inactive'], x: 0, y: 0.72 },
      { id: 'deactivating', lineas: ['deactivating'], x: 0.5, y: 0.72 },
      { id: 'failed', lineas: ['failed'], x: 1, y: 0.72 },
    ],
    flechas: [
      { de: 'inactive', a: 'activating', etiqueta: 'start' },
      { de: 'activating', a: 'active', etiqueta: 'arrancó', curva: 14 },
      { de: 'active', a: 'activating', etiqueta: 'muere + Restart', curva: 14 },
      { de: 'active', a: 'deactivating', etiqueta: 'stop · restart' },
      { de: 'deactivating', a: 'inactive', etiqueta: 'paró' },
      { de: 'deactivating', a: 'activating', etiqueta: 'restart' },
      { de: 'active', a: 'failed', etiqueta: 'muere' },
      { de: 'failed', a: 'inactive', etiqueta: 'reset-failed', curva: 86 },
    ],
  },
  eventos: [
    { id: 'start', texto: 'systemctl start' },
    { id: 'stop', texto: 'systemctl stop' },
    { id: 'restart', texto: 'systemctl restart' },
    { id: 'muere', texto: 'el proceso muere (exit 1)' },
    { id: 'reset-failed', texto: 'systemctl reset-failed' },
  ],
  controles: [
    { tipo: 'toggle', clave: 'restart', etiqueta: 'Restart=on-failure' },
    { tipo: 'toggle', clave: 'limite', etiqueta: 'StartLimitBurst=5 en StartLimitIntervalSec=10' },
  ],
  cfgInicial: { restart: true, limite: true },
  inicial: inicialSystemd,
  esValido: (e, ev) => esValidoSystemd(e, ev),
  aplicar: aplicarSystemd,
  avanzar: (e, dt) => avanzarSystemd(e, dt),
  lecturas: (e) => [
    { clave: 'estado', etiqueta: 'Estado', valor: e.estado, tono: e.estado === 'failed' ? 'alerta' : e.estado === 'active' ? 'buena' : undefined },
    { clave: 'transiciones', etiqueta: 'Transiciones', valor: e.transiciones },
    { clave: 'reinicios', etiqueta: 'Reinicios automáticos', valor: e.reinicios },
    { clave: 'muertes-recientes', etiqueta: 'Muertes en los últimos 10 s', valor: muertesRecientes(e) },
    { clave: 'reloj', etiqueta: 'Reloj simulado', valor: num(e.t / 1000, 1), unidad: 's' },
  ],
  resumen: (e, cfg) => ({
    titulo: 'systemctl status app.service',
    lineas: [
      `${e.estado === 'failed' ? '×' : '●'} ${'app.service - Aplicación de ejemplo'}`,
      `     Active: ${e.estado === 'failed' ? `failed (Result: ${e.resultado ?? 'exit-code'})` : ACTIVE[e.estado]}`,
      `    Restart: ${cfg.restart ? 'on-failure' : 'no'}${cfg.limite ? ' · StartLimitBurst=5 / 10 s' : ' · sin límite de arranques'}`,
    ],
  }),
};
