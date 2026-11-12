// Motor del balanceador (SimFlujo, modo "balanceador"). Puro y determinista con semilla.
// Cada servidor es una cola M/M/1 (servicio exponencial); el balanceador reparte con round-robin,
// menos conexiones o al azar. Opcionalmente hay una caché delante de los servidores.
import { exponencial, mulberry32, type Azar } from '../azar';
import { percentil, VentanaTemporal } from './estadistica';

export type Algoritmo = 'round-robin' | 'menos-conexiones' | 'aleatorio';

export interface ParamsBalanceador {
  servidores: number;
  algoritmo: Algoritmo;
  tasaLlegada: number; // pedidos/s
  capacidadPorServidor: number; // pedidos/s de un servidor sano
  servidorLento: boolean; // el servidor 0 atiende a la mitad de velocidad
  cacheActiva: boolean;
  aciertoCache: number; // 0..0.95
}

/** Largo máximo de la cola de cada servidor: pasado esto, el pedido se rechaza. */
export const COLA_MAX = 100;
/** Latencia fija de red (cliente ↔ balanceador ↔ servidor), en segundos. */
export const LAT_RED = 0.01;
/** Latencia de un acierto de caché, en segundos. */
export const LAT_CACHE = 0.004;
/** Ventana de las métricas (utilización y percentiles), en segundos de tiempo simulado. */
export const VENTANA = 10;

export interface Pedido {
  id: number;
  tLlegada: number;
  u: number; // exponencial(1) del servicio: el tiempo real es u / (velocidad del servidor)
}

export interface Servidor {
  arriba: boolean;
  cola: Pedido[];
  enServicio: Pedido | null;
  finServicio: number;
}

export interface Llegada {
  id: number;
  t: number;
  /** servidor destino; -1 si fue acierto de caché o rechazado */
  srv: number;
  acierto: boolean;
  rechazado: boolean;
}

export interface LecturasBalanceador {
  utilizacion: number; // 0..1
  p50: number; // ms (NaN si no hay datos)
  p95: number;
  rechazados: number;
  aciertosCache: number | null; // 0..1; null si no hay caché activa o aún no hay datos
  tiempo: number;
}

export class MotorBalanceador {
  t = 0;
  params: ParamsBalanceador;
  servidores: Servidor[] = [];
  rechazados = 0;
  atendidos = 0;
  aciertos = 0;
  fallos = 0;
  recientes: Llegada[] = [];

  private readonly aLleg: Azar;
  private readonly aServ: Azar;
  private readonly aElec: Azar;
  private readonly aCache: Azar;
  private proxLlegada: number;
  private idSig = 1;
  private rr = 0;
  private muestras = new VentanaTemporal(VENTANA);
  private ocupado = 0; // ∫ (servidores ocupados) dt
  private disponible = 0; // ∫ (servidores arriba) dt
  private hist: { t: number; ocupado: number; disponible: number }[] = [{ t: 0, ocupado: 0, disponible: 0 }];

  constructor(params: ParamsBalanceador, semilla = 42) {
    this.params = { ...params };
    this.aLleg = mulberry32(semilla);
    this.aServ = mulberry32(semilla + 1);
    this.aElec = mulberry32(semilla + 2);
    this.aCache = mulberry32(semilla + 3);
    for (let i = 0; i < params.servidores; i++) this.servidores.push(this.nuevoServidor());
    this.proxLlegada = exponencial(this.aLleg, params.tasaLlegada);
  }

  private nuevoServidor(): Servidor {
    return { arriba: true, cola: [], enServicio: null, finServicio: Infinity };
  }

  /** Velocidad relativa del servidor i (1 = normal, 0,5 = lento). */
  velocidad(i: number): number {
    return this.params.servidorLento && i === 0 ? 0.5 : 1;
  }

  /** Cambia los parámetros en caliente (sliders, toggles). */
  setParams(p: Partial<ParamsBalanceador>) {
    const antes = this.params;
    const nuevo = { ...antes, ...p };
    nuevo.servidores = Math.max(1, Math.min(8, Math.round(nuevo.servidores)));
    this.params = nuevo;
    if (nuevo.tasaLlegada !== antes.tasaLlegada) {
      // proceso de Poisson sin memoria: reescalar el tiempo que falta hasta el próximo pedido
      this.proxLlegada = this.t + ((this.proxLlegada - this.t) * antes.tasaLlegada) / nuevo.tasaLlegada;
    }
    while (this.servidores.length < nuevo.servidores) this.servidores.push(this.nuevoServidor());
    if (this.servidores.length > nuevo.servidores) {
      const quitados = this.servidores.splice(nuevo.servidores);
      for (const s of quitados) for (const ped of [...(s.enServicio ? [s.enServicio] : []), ...s.cola]) this.despachar(ped);
    }
  }

  /** Cae el último servidor que sigue arriba: lo que tenía adentro se pierde (cuenta como rechazado). */
  tirarServidor(): boolean {
    for (let i = this.servidores.length - 1; i >= 0; i--) {
      const s = this.servidores[i]!;
      if (!s.arriba) continue;
      s.arriba = false;
      this.rechazados += s.cola.length + (s.enServicio ? 1 : 0);
      s.cola = [];
      s.enServicio = null;
      s.finServicio = Infinity;
      return true;
    }
    return false;
  }

  levantarTodos() {
    for (const s of this.servidores) s.arriba = true;
  }

  get caidos(): number {
    return this.servidores.filter((s) => !s.arriba).length;
  }

  private carga(s: Servidor): number {
    return s.cola.length + (s.enServicio ? 1 : 0);
  }

  private elegir(): number {
    const sirven = this.servidores.map((_, i) => i).filter((i) => this.servidores[i]!.arriba);
    if (sirven.length === 0) return -1;
    const { algoritmo } = this.params;
    if (algoritmo === 'aleatorio') return sirven[Math.floor(this.aElec() * sirven.length)]!;
    if (algoritmo === 'round-robin') {
      const n = this.servidores.length;
      for (let k = 0; k < n; k++) {
        const i = (this.rr + k) % n;
        if (this.servidores[i]!.arriba) {
          this.rr = (i + 1) % n;
          return i;
        }
      }
      return -1;
    }
    // menos-conexiones: el de menor carga; los empates se reparten girando
    const n = this.servidores.length;
    let mejor = -1;
    for (let k = 0; k < n; k++) {
      const i = (this.rr + k) % n;
      const s = this.servidores[i]!;
      if (!s.arriba) continue;
      if (mejor < 0 || this.carga(s) < this.carga(this.servidores[mejor]!)) mejor = i;
    }
    this.rr = (mejor + 1) % n;
    return mejor;
  }

  /** Manda el pedido a un servidor. Devuelve el índice o -1 si se rechazó. */
  private despachar(ped: Pedido): number {
    const i = this.elegir();
    if (i < 0) {
      this.rechazados++;
      return -1;
    }
    const s = this.servidores[i]!;
    if (!s.enServicio) this.iniciar(i, ped);
    else if (s.cola.length >= COLA_MAX) {
      this.rechazados++;
      return -1;
    } else s.cola.push(ped);
    return i;
  }

  private iniciar(i: number, ped: Pedido) {
    const s = this.servidores[i]!;
    const mu = this.params.capacidadPorServidor * this.velocidad(i);
    s.enServicio = ped;
    s.finServicio = this.t + ped.u / mu;
  }

  private llegada() {
    const id = this.idSig++;
    const p = this.params;
    if (p.cacheActiva && this.aCache() < p.aciertoCache) {
      this.aciertos++;
      this.atendidos++;
      this.muestras.agregar(this.t, (LAT_CACHE) * 1000);
      this.recientes.push({ id, t: this.t, srv: -1, acierto: true, rechazado: false });
      return;
    }
    if (p.cacheActiva) this.fallos++;
    const ped: Pedido = { id, tLlegada: this.t, u: exponencial(this.aServ, 1) };
    const srv = this.despachar(ped);
    this.recientes.push({ id, t: this.t, srv, acierto: false, rechazado: srv < 0 });
  }

  private acumular(hasta: number) {
    const d = hasta - this.t;
    if (d > 0) {
      for (const s of this.servidores) {
        if (s.arriba) this.disponible += d;
        if (s.enServicio) this.ocupado += d;
      }
    }
    this.t = hasta;
  }

  /** Avanza `dt` segundos de tiempo simulado, procesando cada evento en su instante exacto. */
  avanzar(dt: number) {
    const fin = this.t + dt;
    for (;;) {
      let te = this.proxLlegada;
      let quien = -1;
      for (let i = 0; i < this.servidores.length; i++) {
        const s = this.servidores[i]!;
        if (s.enServicio && s.finServicio < te) {
          te = s.finServicio;
          quien = i;
        }
      }
      if (te > fin) break;
      this.acumular(te);
      if (quien < 0) {
        this.llegada();
        this.proxLlegada = this.t + exponencial(this.aLleg, this.params.tasaLlegada);
      } else {
        const s = this.servidores[quien]!;
        const ped = s.enServicio!;
        this.atendidos++;
        this.muestras.agregar(this.t, (this.t - ped.tLlegada + LAT_RED) * 1000);
        s.enServicio = null;
        s.finServicio = Infinity;
        const sig = s.cola.shift();
        if (sig) this.iniciar(quien, sig);
      }
    }
    this.acumular(fin);
    this.hist.push({ t: this.t, ocupado: this.ocupado, disponible: this.disponible });
    while (this.hist.length > 2 && this.hist[1]!.t <= this.t - VENTANA) this.hist.shift();
    this.muestras.podar(this.t);
    while (this.recientes.length && this.recientes[0]!.t < this.t - 0.7) this.recientes.shift();
  }

  lecturas(): LecturasBalanceador {
    const a = this.hist[0]!;
    const b = this.hist[this.hist.length - 1]!;
    const den = b.disponible - a.disponible;
    const utilizacion = den > 1e-9 ? (b.ocupado - a.ocupado) / den : 0;
    const ord = this.muestras.ordenados();
    const total = this.aciertos + this.fallos;
    return {
      utilizacion,
      p50: percentil(ord, 0.5),
      p95: percentil(ord, 0.95),
      rechazados: this.rechazados,
      aciertosCache: this.params.cacheActiva && total > 0 ? this.aciertos / total : null,
      tiempo: this.t,
    };
  }
}
