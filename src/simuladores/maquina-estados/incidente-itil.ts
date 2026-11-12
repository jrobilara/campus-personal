// Ciclo de vida de un incidente de mesa de ayuda (preset "incidente-itil"). Módulo puro.
// Flujo típico de una herramienta de mesa de ayuda; ITIL 4 no fija estos estados.
import { ir, salida, type Cambio, type Cfg, type DefMaquina, type EstadoBase, type Linea, type Salida } from './tipos';

export interface EstadoItil extends EstadoBase {
  /** prioridad calculada al clasificar (null: todavía sin clasificar) */
  prioridad: string | null;
  impacto: string | null;
  urgencia: string | null;
  problemas: number;
  cambios: number;
}

/** Cada acción de la mesa de ayuda hace pasar 5 minutos simulados. */
export const PASO_MS = 5 * 60_000;
export const INCIDENTE = 'INC-0421';

export const NIVELES_IMPACTO = ['alto', 'medio', 'bajo'] as const;
export const NIVELES_URGENCIA = ['alta', 'media', 'baja'] as const;

/** Matriz impacto × urgencia → prioridad (P1 es la más urgente). */
const MATRIZ: Record<string, Record<string, string>> = {
  alto: { alta: 'P1', media: 'P2', baja: 'P3' },
  medio: { alta: 'P2', media: 'P3', baja: 'P4' },
  bajo: { alta: 'P3', media: 'P4', baja: 'P4' },
};
export const prioridadDe = (impacto: string, urgencia: string): string => MATRIZ[impacto]?.[urgencia] ?? 'P3';

export const idProblema = (n: number) => `PRB-${String(n).padStart(4, '0')}`;
export const idCambio = (n: number) => `RFC-${String(n).padStart(4, '0')}`;

const l = (t: number, texto: string): Linea => ({ t, texto });

export function inicialItil(): Salida<EstadoItil> {
  const e: EstadoItil = { estado: 'registrado', t: 0, transiciones: 0, prioridad: null, impacto: null, urgencia: null, problemas: 0, cambios: 0 };
  return salida(e, [l(0, `${INCIDENTE} registrado: "La impresora fiscal de la caja 2 no imprime"`)]);
}

export function esValidoItil(e: EstadoItil, ev: string): boolean {
  const s = e.estado;
  switch (ev) {
    case 'clasificar': return s === 'registrado';
    case 'asignar': return s === 'clasificado' || s === 'reabierto';
    case 'pedir-datos': return s === 'en-curso';
    case 'responde': return s === 'en-espera-usuario';
    case 'solucion': return s === 'en-curso';
    case 'confirma': return s === 'resuelto';
    case 'sigue-fallando': return s === 'resuelto';
    case 'problema':
    case 'cambio': return true; // registros vinculados: no cambian el estado y se pueden pedir en cualquier momento
    default: return false;
  }
}

export function aplicarItil(e0: EstadoItil, ev: string, cfg: Cfg): Salida<EstadoItil> {
  if (!esValidoItil(e0, ev)) return salida(e0);
  const t = e0.t + PASO_MS;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  const dec = (texto: string) => log.push(l(t, texto));
  let e: EstadoItil = { ...e0, t };
  switch (ev) {
    case 'clasificar': {
      const impacto = String(cfg.impacto ?? 'alto');
      const urgencia = String(cfg.urgencia ?? 'media');
      const prioridad = prioridadDe(impacto, urgencia);
      e = { ...ir(e, 'clasificado', cambios), impacto, urgencia, prioridad };
      dec(`${INCIDENTE} clasificado: impacto ${impacto} × urgencia ${urgencia} → prioridad ${prioridad}`);
      break;
    }
    case 'asignar':
      if (e.estado === 'reabierto') dec(`${INCIDENTE} reabierto se vuelve a asignar: queda en curso`);
      else dec(`${INCIDENTE} asignado a un técnico de segundo nivel: queda en curso`);
      e = ir(e, 'en-curso', cambios);
      break;
    case 'pedir-datos':
      e = ir(e, 'en-espera-usuario', cambios);
      dec('Se le piden datos al usuario (modelo de la impresora, mensaje de error): el reloj del acuerdo de servicio se frena');
      break;
    case 'responde':
      e = ir(e, 'en-curso', cambios);
      dec('El usuario respondió: el incidente sigue en curso y el reloj del acuerdo de servicio vuelve a correr');
      break;
    case 'solucion':
      e = ir(e, 'resuelto', cambios);
      dec('Se aplicó una solución (se reinició el servicio de impresión): resuelto, falta que el usuario lo confirme');
      break;
    case 'confirma':
      e = ir(e, 'cerrado', cambios);
      dec(`El usuario confirma que anda: ${INCIDENTE} cerrado`);
      break;
    case 'sigue-fallando':
      e = ir(e, 'reabierto', cambios);
      dec('El usuario dice que sigue fallando: el incidente se reabre');
      break;
    case 'problema': {
      const problemas = e.problemas + 1;
      e = { ...e, problemas };
      dec(`Es recurrente: se abre ${idProblema(problemas)} vinculado a ${INCIDENTE} para buscar la causa raíz; el incidente sigue en ${e.estado}`);
      break;
    }
    case 'cambio': {
      const cambiosN = e.cambios + 1;
      e = { ...e, cambios: cambiosN };
      dec(`La solución necesita un cambio: se pide ${idCambio(cambiosN)} vinculado a ${INCIDENTE}; el incidente sigue en ${e.estado}`);
      break;
    }
  }
  return salida(e, log, cambios);
}

export const defItil: DefMaquina<EstadoItil> = {
  preset: 'incidente-itil',
  tiempoReal: false,
  nota: 'Flujo típico de una herramienta de mesa de ayuda; ITIL 4 no fija estos estados',
  diagrama: {
    altoAncho: 310,
    altoAngosto: 330,
    nodos: [
      { id: 'registrado', lineas: ['registrado'], x: 0, y: 0 },
      { id: 'clasificado', lineas: ['clasificado'], x: 0.5, y: 0 },
      { id: 'en-curso', lineas: ['en-curso'], x: 0.5, y: 0.5 },
      { id: 'en-espera-usuario', lineas: ['en espera', 'del usuario'], x: 1, y: 0.5, estilo: 'partido' },
      { id: 'cerrado', lineas: ['cerrado'], x: 0, y: 1 },
      { id: 'resuelto', lineas: ['resuelto'], x: 0.5, y: 1 },
      { id: 'reabierto', lineas: ['reabierto'], x: 1, y: 1 },
    ],
    flechas: [
      { de: 'registrado', a: 'clasificado', etiqueta: 'clasificar' },
      { de: 'clasificado', a: 'en-curso', etiqueta: 'asignar' },
      { de: 'en-curso', a: 'en-espera-usuario', etiqueta: 'pide datos', curva: 12 },
      { de: 'en-espera-usuario', a: 'en-curso', etiqueta: 'responde', curva: 12 },
      { de: 'en-curso', a: 'resuelto', etiqueta: 'solución' },
      { de: 'resuelto', a: 'cerrado', etiqueta: 'confirma' },
      { de: 'resuelto', a: 'reabierto', etiqueta: 'sigue fallando' },
      { de: 'reabierto', a: 'en-curso', etiqueta: 'asignar' },
    ],
  },
  eventos: [
    { id: 'clasificar', texto: 'clasificar (impacto × urgencia)' },
    { id: 'asignar', texto: 'asignar y empezar' },
    { id: 'pedir-datos', texto: 'pedir datos al usuario' },
    { id: 'responde', texto: 'el usuario responde' },
    { id: 'solucion', texto: 'aplicar solución' },
    { id: 'confirma', texto: 'el usuario confirma' },
    { id: 'sigue-fallando', texto: 'el usuario dice que sigue fallando' },
    { id: 'problema', texto: 'es recurrente: abrir problema' },
    { id: 'cambio', texto: 'la solución necesita un cambio: pedir cambio' },
  ],
  controles: [
    { tipo: 'select', clave: 'impacto', etiqueta: 'Impacto', opciones: NIVELES_IMPACTO.map((v) => ({ valor: v, texto: v })) },
    { tipo: 'select', clave: 'urgencia', etiqueta: 'Urgencia', opciones: NIVELES_URGENCIA.map((v) => ({ valor: v, texto: v })) },
  ],
  cfgInicial: { impacto: 'alto', urgencia: 'media' },
  inicial: inicialItil,
  esValido: (e, ev) => esValidoItil(e, ev),
  aplicar: aplicarItil,
  avanzar: (e, dt) => salida({ ...e, t: e.t + dt }),
  lecturas: (e) => [
    { clave: 'estado', etiqueta: 'Estado', valor: e.estado, tono: e.estado === 'reabierto' ? 'alerta' : e.estado === 'cerrado' ? 'buena' : undefined },
    { clave: 'transiciones', etiqueta: 'Transiciones', valor: e.transiciones },
    { clave: 'problemas-abiertos', etiqueta: 'Problemas abiertos', valor: e.problemas },
    { clave: 'cambios-pedidos', etiqueta: 'Cambios pedidos', valor: e.cambios },
    { clave: 'prioridad', etiqueta: 'Prioridad', valor: e.prioridad ?? '—' },
  ],
  resumen: (e) => ({
    titulo: `Ticket ${INCIDENTE}`,
    lineas: [
      'Impresora fiscal de la caja 2 sin imprimir',
      `Estado: ${e.estado} · Prioridad: ${e.prioridad ?? 'sin clasificar'}`,
      `Problemas: ${e.problemas ? Array.from({ length: e.problemas }, (_, i) => idProblema(i + 1)).join(', ') : 'ninguno'}`,
      `Cambios: ${e.cambios ? Array.from({ length: e.cambios }, (_, i) => idCambio(i + 1)).join(', ') : 'ninguno'}`,
    ],
  }),
};
