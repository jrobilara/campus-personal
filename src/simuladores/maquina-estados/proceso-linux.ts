// Máquina del proceso de Linux (preset "proceso-linux"): estados con la letra de `ps`. Módulo puro.
import { ir, salida, type Cambio, type DefMaquina, type EstadoBase, type Linea, type Salida } from './tipos';

export const PID = 4242;

export interface EstadoProceso extends EstadoBase {
  /** SIGSTOP recibido mientras estaba en D: queda pendiente hasta que salga de la espera de E/S */
  pendienteStop: boolean;
}

/** id del estado → letra de `ps` */
export const LETRA: Record<string, string> = {
  ejecutable: 'R',
  durmiendo: 'S',
  'espera-es': 'D',
  detenido: 'T',
  zombie: 'Z',
  'fuera-de-la-tabla': '—',
};

/** Cada evento hace avanzar el reloj simulado 1 s. */
const PASO_MS = 1000;

export function inicialProceso(): Salida<EstadoProceso> {
  const e: EstadoProceso = { estado: 'ejecutable', t: 0, transiciones: 0, pendienteStop: false };
  return salida(e, [{ t: 0, texto: `proceso ${PID} (trabajador) en ejecución: R` }]);
}

export function esValidoProceso(e: EstadoProceso, ev: string): boolean {
  const s = e.estado;
  switch (ev) {
    case 'pide-disco': return s === 'ejecutable';
    case 'llega-dato': return s === 'espera-es' || s === 'durmiendo';
    case 'espera-tecla': return s === 'ejecutable';
    case 'sigstop': return (s === 'ejecutable' || s === 'durmiendo' || s === 'espera-es') && !e.pendienteStop;
    case 'sigcont': return s === 'detenido' || (s === 'espera-es' && e.pendienteStop);
    case 'exit': return s === 'ejecutable' || s === 'durmiendo';
    case 'wait': return s === 'zombie';
    default: return false;
  }
}

export function aplicarProceso(e0: EstadoProceso, ev: string): Salida<EstadoProceso> {
  if (!esValidoProceso(e0, ev)) return salida(e0);
  const t = e0.t + PASO_MS;
  const cambios: Cambio[] = [];
  const log: Linea[] = [];
  const dec = (texto: string) => log.push({ t, texto });
  let e: EstadoProceso = { ...e0, t };
  switch (ev) {
    case 'pide-disco':
      e = ir(e, 'espera-es', cambios);
      dec(`R → D: el proceso pide disco y queda en espera de E/S no interrumpible`);
      break;
    case 'llega-dato':
      if (e.estado === 'espera-es' && e.pendienteStop) {
        e = ir({ ...e, pendienteStop: false }, 'detenido', cambios);
        dec('llega el dato: el proceso sale de D y recién ahí se aplica la señal pendiente SIGSTOP → T');
      } else if (e.estado === 'espera-es') {
        e = ir(e, 'ejecutable', cambios);
        dec('D → R: llega el dato del disco, el proceso vuelve a ser ejecutable');
      } else {
        e = ir(e, 'ejecutable', cambios);
        dec('S → R: llega el dato y se despierta al proceso');
      }
      break;
    case 'espera-tecla':
      e = ir(e, 'durmiendo', cambios);
      dec('R → S: el proceso espera una tecla y se duerme (se lo puede interrumpir)');
      break;
    case 'sigstop':
      if (e.estado === 'espera-es') {
        e = { ...e, pendienteStop: true };
        dec(`SIGSTOP enviada a ${PID}: señal pendiente (en D no se atiende hasta salir de la E/S)`);
      } else {
        const de = LETRA[e.estado];
        e = ir(e, 'detenido', cambios);
        dec(`${de} → T: SIGSTOP detiene al proceso`);
      }
      break;
    case 'sigcont':
      if (e.estado === 'espera-es') {
        e = { ...e, pendienteStop: false };
        dec('SIGCONT descarta la SIGSTOP pendiente; el proceso sigue en D');
      } else {
        e = ir(e, 'ejecutable', cambios);
        dec('T → R: SIGCONT reanuda el proceso');
      }
      break;
    case 'exit': {
      const de = LETRA[e.estado];
      e = ir(e, 'zombie', cambios);
      dec(`${de} → Z: exit(0). El proceso queda como zombie en la tabla hasta que el padre haga wait()`);
      break;
    }
    case 'wait':
      e = ir(e, 'fuera-de-la-tabla', cambios);
      dec(`Z → fuera: el padre hace wait() y el kernel libera la entrada ${PID} de la tabla de procesos`);
      break;
  }
  return salida(e, log, cambios);
}

export const defProceso: DefMaquina<EstadoProceso> = {
  preset: 'proceso-linux',
  tiempoReal: false,
  diagrama: {
    altoAncho: 330,
    altoAngosto: 340,
    nodos: [
      { id: 'detenido', lineas: ['T', 'detenido'], x: 0.5, y: 0, estilo: 'letra' },
      { id: 'durmiendo', lineas: ['S', 'durmiendo'], x: 0, y: 0.5, estilo: 'letra' },
      { id: 'ejecutable', lineas: ['R', 'ejecutable'], x: 0.5, y: 0.5, estilo: 'letra' },
      { id: 'espera-es', lineas: ['D', 'espera de E/S'], x: 1, y: 0.5, estilo: 'letra' },
      { id: 'zombie', lineas: ['Z', 'zombie'], x: 0.5, y: 1, estilo: 'letra' },
      { id: 'fuera-de-la-tabla', lineas: ['fuera de', 'la tabla'], x: 1, y: 1, estilo: 'partido', fantasma: true },
    ],
    flechas: [
      { de: 'ejecutable', a: 'espera-es', etiqueta: 'pide disco', curva: 16 },
      { de: 'espera-es', a: 'ejecutable', etiqueta: 'llega el dato', curva: 16 },
      { de: 'ejecutable', a: 'durmiendo', etiqueta: 'espera tecla', curva: 16 },
      { de: 'durmiendo', a: 'ejecutable', etiqueta: 'llega el dato', curva: 16 },
      { de: 'ejecutable', a: 'detenido', etiqueta: 'SIGSTOP', curva: 16 },
      { de: 'detenido', a: 'ejecutable', etiqueta: 'SIGCONT', curva: 16 },
      { de: 'durmiendo', a: 'detenido', etiqueta: 'SIGSTOP' },
      { de: 'espera-es', a: 'detenido', etiqueta: 'SIGSTOP pendiente' },
      { de: 'ejecutable', a: 'zombie', etiqueta: 'exit' },
      { de: 'durmiendo', a: 'zombie', etiqueta: 'exit' },
      { de: 'zombie', a: 'fuera-de-la-tabla', etiqueta: 'wait()' },
    ],
  },
  eventos: [
    { id: 'pide-disco', texto: 'pide disco' },
    { id: 'llega-dato', texto: 'llega el dato' },
    { id: 'espera-tecla', texto: 'espera una tecla' },
    { id: 'sigstop', texto: 'SIGSTOP' },
    { id: 'sigcont', texto: 'SIGCONT' },
    { id: 'exit', texto: 'termina (exit)' },
    { id: 'wait', texto: 'el padre hace wait()' },
  ],
  controles: [],
  cfgInicial: {},
  inicial: inicialProceso,
  esValido: (e, ev) => esValidoProceso(e, ev),
  aplicar: (e, ev) => aplicarProceso(e, ev),
  avanzar: (e, dt) => salida({ ...e, t: e.t + dt }),
  lecturas: (e) => [
    { clave: 'estado', etiqueta: 'Estado', valor: e.estado, tono: e.estado === 'zombie' ? 'alerta' : undefined },
    { clave: 'transiciones', etiqueta: 'Transiciones', valor: e.transiciones },
    { clave: 'pid', etiqueta: 'PID', valor: PID },
    { clave: 'estado-ps', etiqueta: 'STAT de ps', valor: LETRA[e.estado] ?? '—' },
    { clave: 'senal-pendiente', etiqueta: 'Señal pendiente', valor: e.pendienteStop ? 'SIGSTOP' : 'ninguna' },
  ],
  resumen: (e) => ({
    titulo: `ps -o pid,stat,cmd -p ${PID}`,
    lineas:
      e.estado === 'fuera-de-la-tabla'
        ? ['  PID STAT CMD', '(el proceso ya no figura en la tabla)']
        : ['  PID STAT CMD', ` ${PID} ${(LETRA[e.estado] ?? '').padEnd(4)} ${e.estado === 'zombie' ? '[trabajador] <defunct>' : './trabajador'}`],
  }),
};
