// Motor "síncrono vs asíncrono" (SimFlujo): el mismo flujo de pedidos entra por dos carriles.
//  - Síncrono: Cliente → A → B. A llama a B y se queda esperando; el cliente espera todo.
//  - Asíncrono: Cliente → A → cola → B. A deja el mensaje en la cola y le contesta al cliente enseguida.
// Tiempos en segundos de tiempo simulado. Puro y determinista (los pedidos llegan a intervalos fijos).
import { UltimasN } from './estadistica';

/** Un salto de red entre dos piezas. */
export const RED = 0.05;
/** Lo que tarda A en procesar el pedido antes de llamar a B o encolar. */
export const PROC_A = 0.05;
/** Lo que tarda A en dejar el mensaje en la cola. */
export const ENCOLAR = 0.01;
/** Cuánto espera A la respuesta de B antes de rendirse (más que la latencia máxima de B). */
export const TIMEOUT_B = 3.5;
/** Un pedido nuevo cada 0,5 s (2 pedidos/s). */
export const INTERVALO = 0.5;

export interface PedidoSinc {
  id: number;
  t0: number;
  /** instante en que A llama a B */
  tLlamada: number;
  /** instante en que el pedido llega a B (o se vence el intento) */
  tLlegaB: number;
  resuelto: boolean;
  ok: boolean;
  latB: number;
  /** instante en que el cliente recibe la respuesta (Infinity hasta resolverse) */
  tFin: number;
  terminado: boolean;
}

export interface PedidoAsinc {
  id: number;
  t0: number;
  tEncola: number;
  tAck: number;
  ackContado: boolean;
}

export interface LecturasSinc {
  esperaSinc: number; // ms
  esperaAsinc: number; // ms
  erroresSinc: number;
  pendientesAsinc: number;
  tiempo: number;
}

export class MotorSincrono {
  t = 0;
  latenciaB: number; // segundos
  caidoB = false;
  sinc: PedidoSinc[] = [];
  asinc: PedidoAsinc[] = [];
  cola: number[] = []; // ids de mensajes esperando en la cola
  enB: { id: number; fin: number } | null = null;
  procesadosB = 0;
  erroresSinc = 0;

  private proxCreacion = INTERVALO;
  private idSig = 1;
  private esperasSinc = new UltimasN(5);
  private esperasAsinc = new UltimasN(5);
  private encolando: PedidoAsinc[] = [];

  constructor(latenciaBms = 200) {
    this.latenciaB = latenciaBms / 1000;
  }

  setLatenciaB(ms: number) {
    this.latenciaB = ms / 1000;
  }

  setCaidoB(caido: boolean) {
    if (caido === this.caidoB) return;
    this.caidoB = caido;
    if (caido && this.enB) {
      // el mensaje en proceso no se confirmó: vuelve al frente de la cola
      this.cola.unshift(this.enB.id);
      this.enB = null;
    }
    if (!caido) this.asignarB();
  }

  private asignarB() {
    if (this.caidoB || this.enB || this.cola.length === 0) return;
    const id = this.cola.shift()!;
    this.enB = { id, fin: this.t + this.latenciaB };
  }

  private crear() {
    const id = this.idSig++;
    const t0 = this.t;
    const tLlamada = t0 + RED + PROC_A;
    this.sinc.push({ id, t0, tLlamada, tLlegaB: tLlamada + RED, resuelto: false, ok: false, latB: 0, tFin: Infinity, terminado: false });
    const tEncola = t0 + RED + PROC_A + ENCOLAR;
    const a: PedidoAsinc = { id, t0, tEncola, tAck: tEncola + RED, ackContado: false };
    this.asinc.push(a);
    this.encolando.push(a);
  }

  avanzar(dt: number) {
    const fin = this.t + dt;
    for (;;) {
      let te = this.proxCreacion;
      let tipo: 'crear' | 'encola' | 'b' = 'crear';
      const enc = this.encolando[0];
      if (enc && enc.tEncola < te) {
        te = enc.tEncola;
        tipo = 'encola';
      }
      if (this.enB && this.enB.fin < te) {
        te = this.enB.fin;
        tipo = 'b';
      }
      if (te > fin) break;
      this.t = te;
      if (tipo === 'crear') {
        this.crear();
        this.proxCreacion += INTERVALO;
      } else if (tipo === 'encola') {
        this.encolando.shift();
        this.cola.push(enc!.id);
        this.asignarB();
      } else {
        this.procesadosB++;
        this.enB = null;
        this.asignarB();
      }
    }
    this.t = fin;
    // carril síncrono: resolver los que llegan a B y cerrar los que ya terminaron
    for (const p of this.sinc) {
      if (!p.resuelto && this.t >= p.tLlegaB) {
        p.resuelto = true;
        p.latB = this.latenciaB;
        p.ok = !this.caidoB;
        p.tFin = p.ok ? p.tLlegaB + p.latB + RED + RED : p.tLlamada + TIMEOUT_B + RED;
      }
      if (p.resuelto && !p.terminado && this.t >= p.tFin) {
        p.terminado = true;
        this.esperasSinc.agregar((p.tFin - p.t0) * 1000);
        if (!p.ok) this.erroresSinc++;
      }
    }
    for (const a of this.asinc) {
      if (!a.ackContado && this.t >= a.tAck) {
        a.ackContado = true;
        this.esperasAsinc.agregar((a.tAck - a.t0) * 1000);
      }
    }
    // descartar lo que ya no se dibuja (terminó hace más de 1 s)
    this.sinc = this.sinc.filter((p) => !p.terminado || this.t - p.tFin < 1);
    this.asinc = this.asinc.filter((a) => !a.ackContado || this.t - a.tAck < 1);
  }

  /** ¿Hay un pedido síncrono sin respuesta? (el cliente está bloqueado) */
  get clienteEsperando(): boolean {
    return this.sinc.some((p) => !p.terminado);
  }

  lecturas(): LecturasSinc {
    return {
      esperaSinc: this.esperasSinc.cantidad ? this.esperasSinc.media() : 0,
      esperaAsinc: this.esperasAsinc.cantidad ? this.esperasAsinc.media() : 0,
      erroresSinc: this.erroresSinc,
      pendientesAsinc: this.cola.length,
      tiempo: this.t,
    };
  }
}
