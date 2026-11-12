// Motor común de SimMaquinaEstados (puro): junta la máquina de cada preset con su log y la última transición.
import { defBreaker } from './circuit-breaker';
import { defDocker } from './docker';
import { defItil } from './incidente-itil';
import { defProceso } from './proceso-linux';
import { defSystemd } from './systemd';
import type { Cambio, Cfg, DefMaquina, EstadoBase, Linea, PresetMaquina, Salida } from './tipos';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MAQUINAS: Record<PresetMaquina, DefMaquina<any>> = {
  'circuit-breaker': defBreaker,
  'unidad-systemd': defSystemd,
  'proceso-linux': defProceso,
  'contenedor-docker': defDocker,
  'incidente-itil': defItil,
};

/** Lo que adelanta el botón "Esperar 10 s" (solo en las máquinas con reloj propio). */
export const ESPERA_MS = 10_000;
const MAX_LOG = 300;

export interface Sim {
  e: EstadoBase;
  cfg: Cfg;
  log: Linea[];
  /** última transición y un contador para reiniciar la animación */
  ultima: (Cambio & { k: number }) | null;
  k: number;
}

export function crearSim(preset: PresetMaquina, semilla = 42): Sim {
  const def = MAQUINAS[preset];
  const r = def.inicial(semilla);
  return { e: r.e, cfg: { ...def.cfgInicial }, log: r.log, ultima: null, k: 0 };
}

function unir(s: Sim, r: Salida<EstadoBase>): Sim {
  const k = r.cambios.length ? s.k + 1 : s.k;
  const ultima = r.cambios.length ? { ...r.cambios[r.cambios.length - 1]!, k } : s.ultima;
  return { ...s, e: r.e, log: r.log.length ? [...s.log, ...r.log].slice(-MAX_LOG) : s.log, ultima, k };
}

export function eventoValido(preset: PresetMaquina, s: Sim, id: string): boolean {
  return MAQUINAS[preset].esValido(s.e, id, s.cfg);
}

export function aplicarEvento(preset: PresetMaquina, s: Sim, id: string): Sim {
  const def = MAQUINAS[preset];
  if (!def.esValido(s.e, id, s.cfg)) return s;
  return unir(s, def.aplicar(s.e, id, s.cfg));
}

/** Avanza el reloj simulado `dtMs` (solo importa en las máquinas con `tiempoReal`). */
export function avanzarSim(preset: PresetMaquina, s: Sim, dtMs: number): Sim {
  const def = MAQUINAS[preset];
  if (!def.tiempoReal || dtMs <= 0) return s;
  return unir(s, def.avanzar(s.e, dtMs, s.cfg));
}

export function cambiarCfg(s: Sim, clave: string, valor: number | boolean | string): Sim {
  return { ...s, cfg: { ...s.cfg, [clave]: valor } };
}

export function lecturasDe(preset: PresetMaquina, s: Sim) {
  return MAQUINAS[preset].lecturas(s.e, s.cfg);
}
