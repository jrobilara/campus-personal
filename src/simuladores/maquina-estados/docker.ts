// Máquina del contenedor de Docker con política de reinicio (preset "contenedor-docker"). Módulo puro.
import { num } from '../formato';
import { ir, salida, type Cambio, type Cfg, type DefMaquina, type EstadoBase, type Linea, type Salida } from './tipos';

export type Politica = 'no' | 'on-failure' | 'always' | 'unless-stopped';

export interface EstadoDocker extends EstadoBase {
  reinicios: number;
  /** último código de salida (null: todavía no salió) */
  codigo: number | null;
  /** lo paró alguien con `docker stop` / `docker kill` (lo respeta `unless-stopped`) */
  detenidoAMano: boolean;
  /** desde cuándo está en `restarting` */
  desde: number;
  /** tiempo simulado (ms) que lleva en `running` desde el último arranque; corre solo en `running` */
  uptime: number;
}

export const REINICIO_MS = 1000;
/**
 * Regla de los 10 segundos (doc oficial de Docker, "Start containers automatically", Restart policy details):
 * una política de reinicio solo rige si el contenedor arrancó con éxito, es decir, si estuvo al menos 10 s en `running`.
 */
export const ARRANQUE_OK_MS = 10_000;

const politicaDe = (cfg: Cfg) => String(cfg.politica ?? 'no') as Politica;
const l = (t: number, texto: string): Linea => ({ t, texto });

export function inicialDocker(): Salida<EstadoDocker> {
  const e: EstadoDocker = { estado: 'running', t: 0, transiciones: 0, reinicios: 0, codigo: null, detenidoAMano: false, desde: 0, uptime: 0 };
  return salida(e, [l(0, 'contenedor miapp en ejecución (running), uptime 0,0 s')]);
}

export function esValidoDocker(e: EstadoDocker, ev: string): boolean {
  const s = e.estado;
  switch (ev) {
    case 'create': return s === 'removed';
    case 'start': return s === 'created' || s === 'exited';
    case 'stop': return s === 'running' || s === 'restarting';
    case 'pause': return s === 'running';
    case 'unpause': return s === 'paused';
    case 'kill': return s === 'running';
    case 'rm': return s === 'created' || s === 'exited';
    case 'exit1': return s === 'running';
    case 'daemon': return s === 'exited';
    default: return false;
  }
}

export function aplicarDocker(e0: EstadoDocker, ev: string, cfg: Cfg): Salida<EstadoDocker> {
  if (!esValidoDocker(e0, ev)) return salida(e0);
  const pol = politicaDe(cfg);
  const t = e0.t;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  let e = e0;
  switch (ev) {
    case 'create':
      e = { ...ir(e, 'created', cambios), reinicios: 0, codigo: null, detenidoAMano: false, uptime: 0 };
      log.push(l(t, 'docker create: contenedor nuevo creado (created)'));
      break;
    case 'start':
      e = { ...ir(e, 'running', cambios), detenidoAMano: false, uptime: 0 };
      log.push(l(t, 'docker start: el contenedor arranca (running); el uptime vuelve a 0'));
      break;
    case 'stop':
      if (e.estado === 'restarting') {
        e = { ...ir(e, 'exited', cambios), detenidoAMano: true, uptime: 0 };
        log.push(l(t, `docker stop: se cancela el reinicio pendiente, queda exited (${e.codigo ?? 0})`));
      } else {
        e = { ...ir(e, 'exited', cambios), codigo: 143, detenidoAMano: true, uptime: 0 };
        log.push(l(t, 'docker stop: SIGTERM, el proceso sale con código 143 (exited). Parado a mano: la política no lo reinicia'));
      }
      break;
    case 'pause':
      e = ir(e, 'paused', cambios);
      log.push(l(t, 'docker pause: se congelan los procesos (paused); el uptime queda quieto'));
      break;
    case 'unpause':
      e = ir(e, 'running', cambios);
      log.push(l(t, 'docker unpause: los procesos siguen (running); el uptime sigue corriendo'));
      break;
    case 'kill':
      e = { ...ir(e, 'exited', cambios), codigo: 137, detenidoAMano: true, uptime: 0 };
      log.push(l(t, 'docker kill: SIGKILL, el proceso sale con código 137 (exited)'));
      break;
    case 'rm':
      e = { ...ir(e, 'removed', cambios), uptime: 0 };
      log.push(l(t, 'docker rm: el contenedor se elimina (removed)'));
      break;
    case 'exit1': {
      const seg = num(e.uptime / 1000, 1);
      if (pol === 'no') {
        e = { ...ir(e, 'exited', cambios), codigo: 1, uptime: 0 };
        log.push(l(t, `el proceso principal sale con código 1 (uptime ${seg} s): política no, no se reinicia (exited)`));
      } else if (e.uptime < ARRANQUE_OK_MS) {
        // Regla de los 10 s: el arranque todavía no cuenta como exitoso, así que la política no rige.
        e = { ...ir(e, 'exited', cambios), codigo: 1, uptime: 0 };
        log.push(l(t, `el proceso principal sale con código 1 (uptime ${seg} s): salió antes de los 10 s: la política de reinicio no se aplica (exited)`));
      } else {
        const reinicios = e.reinicios + 1;
        e = { ...ir(e, 'restarting', cambios), codigo: 1, reinicios, desde: t, uptime: 0 };
        log.push(l(t, `el proceso principal sale con código 1 (uptime ${seg} s): política ${pol}, se programa el reinicio n.º ${reinicios} (restarting)`));
      }
      break;
    }
    case 'daemon':
      if (pol === 'always' || (pol === 'unless-stopped' && !e.detenidoAMano)) {
        e = { ...ir(e, 'running', cambios), detenidoAMano: false, uptime: 0 };
        log.push(l(t, `dockerd reiniciado: la política ${pol} vuelve a levantar el contenedor (running)`));
      } else {
        const motivo = pol === 'unless-stopped' ? 'lo paraste a mano y unless-stopped lo respeta' : `la política ${pol} no lo levanta`;
        log.push(l(t, `dockerd reiniciado: ${motivo}; sigue exited`));
      }
      break;
  }
  return salida(e, log, cambios);
}

export function avanzarDocker(e0: EstadoDocker, dtMs: number): Salida<EstadoDocker> {
  const objetivo = e0.t + dtMs;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  let e = e0;
  // El reloj de uptime corre solo mientras está `running` (en pausa o reiniciándose no cuenta).
  let corre: number | null = e.estado === 'running' ? e.t : null;
  if (e.estado === 'restarting' && e.desde + REINICIO_MS <= objetivo) {
    const v = e.desde + REINICIO_MS;
    e = ir({ ...e, t: v, uptime: 0 }, 'running', cambios);
    log.push(l(v, `reinicio n.º ${e.reinicios} completo: el contenedor vuelve a running (uptime 0,0 s)`));
    corre = v;
  }
  if (corre !== null) {
    const antes = e.uptime;
    const despues = antes + (objetivo - corre);
    e = { ...e, uptime: despues };
    if (antes < ARRANQUE_OK_MS && despues >= ARRANQUE_OK_MS) {
      log.push(l(corre + (ARRANQUE_OK_MS - antes), 'lleva 10 s en running: el arranque cuenta como exitoso y la política de reinicio ya rige'));
    }
  }
  return salida({ ...e, t: objetivo }, log, cambios);
}

const ESTADO_PS = (e: EstadoDocker): string | null => {
  switch (e.estado) {
    case 'running': return `Up ${Math.floor(e.uptime / 1000)} seconds`;
    case 'paused': return 'Up (Paused)';
    case 'exited': return `Exited (${e.codigo ?? 0})`;
    case 'restarting': return `Restarting (${e.codigo ?? 1})`;
    case 'created': return 'Created';
    default: return null;
  }
};

export const defDocker: DefMaquina<EstadoDocker> = {
  preset: 'contenedor-docker',
  tiempoReal: true,
  diagrama: {
    altoAncho: 320,
    altoAngosto: 330,
    nodos: [
      { id: 'created', lineas: ['created'], x: 0, y: 0 },
      { id: 'running', lineas: ['running'], x: 0.5, y: 0 },
      { id: 'paused', lineas: ['paused'], x: 1, y: 0 },
      { id: 'removed', lineas: ['removed'], x: 0, y: 1 },
      { id: 'exited', lineas: ['exited'], x: 0.5, y: 1 },
      { id: 'restarting', lineas: ['restarting'], x: 1, y: 1 },
    ],
    flechas: [
      { de: 'created', a: 'running', etiqueta: 'start' },
      { de: 'running', a: 'paused', etiqueta: 'pause', curva: 14 },
      { de: 'paused', a: 'running', etiqueta: 'unpause', curva: 14 },
      { de: 'running', a: 'exited', etiqueta: 'stop · kill · exit', curva: 20 },
      { de: 'exited', a: 'running', etiqueta: 'start · daemon', curva: 20 },
      { de: 'running', a: 'restarting', etiqueta: 'exit + política (≥ 10 s)', curva: 18 },
      { de: 'restarting', a: 'running', etiqueta: 'tras 1 s', curva: 18 },
      { de: 'restarting', a: 'exited', etiqueta: 'stop' },
      { de: 'exited', a: 'removed', etiqueta: 'rm' },
      { de: 'created', a: 'removed', etiqueta: 'rm', curva: 16 },
      { de: 'removed', a: 'created', etiqueta: 'create', curva: 16 },
    ],
  },
  eventos: [
    { id: 'create', texto: 'docker create' },
    { id: 'start', texto: 'docker start' },
    { id: 'stop', texto: 'docker stop' },
    { id: 'pause', texto: 'docker pause' },
    { id: 'unpause', texto: 'docker unpause' },
    { id: 'kill', texto: 'docker kill' },
    { id: 'rm', texto: 'docker rm' },
    { id: 'exit1', texto: 'el proceso principal sale con código 1' },
    { id: 'daemon', texto: 'reiniciar el daemon' },
  ],
  controles: [
    {
      tipo: 'select', clave: 'politica', etiqueta: 'Política de reinicio (--restart)',
      opciones: ['no', 'on-failure', 'always', 'unless-stopped'].map((v) => ({ valor: v, texto: v })),
    },
  ],
  cfgInicial: { politica: 'no' },
  inicial: inicialDocker,
  esValido: (e, ev) => esValidoDocker(e, ev),
  aplicar: aplicarDocker,
  avanzar: (e, dt) => avanzarDocker(e, dt),
  lecturas: (e) => [
    { clave: 'estado', etiqueta: 'Estado', valor: e.estado, tono: e.estado === 'running' ? 'buena' : e.estado === 'restarting' ? 'alerta' : undefined },
    { clave: 'transiciones', etiqueta: 'Transiciones', valor: e.transiciones },
    { clave: 'reinicios', etiqueta: 'Reinicios', valor: e.reinicios },
    { clave: 'codigo-salida', etiqueta: 'Código de salida', valor: e.codigo === null ? '—' : e.codigo },
    {
      clave: 'uptime', etiqueta: 'Uptime (la política rige desde los 10 s)', valor: num(e.uptime / 1000, 1), unidad: 's',
      tono: e.estado === 'running' && e.uptime >= ARRANQUE_OK_MS ? 'buena' : undefined,
    },
  ],
  resumen: (e, cfg) => {
    const st = ESTADO_PS(e);
    return {
      titulo: 'docker ps -a',
      lineas: [
        'NOMBRE  IMAGEN      RESTART         STATUS',
        st ? `miapp   miapp:1.4   ${politicaDe(cfg).padEnd(14)}  ${st}` : '(no hay contenedores)',
      ],
    };
  },
};
