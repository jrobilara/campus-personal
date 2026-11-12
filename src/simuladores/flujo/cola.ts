// Motor de la cola productor → cola → consumidores (SimFlujo, modo "cola"). Puro y determinista con semilla.
// Unidad de tiempo del motor: segundos (mensajes) u horas de mesa (tickets); la isla convierte para mostrar.
import { exponencial, mulberry32, type Azar } from '../azar';
import { UltimasN } from './estadistica';

export interface ParamsCola {
  tasaLlegada: number; // por unidad de tiempo
  consumidores: number;
  tiempoProceso: number; // media, en unidades de tiempo
  capacidadCola: number;
  /** fracción 0..1 de ítems resueltos con la base de conocimiento (tardan {@link FACTOR_KB} del tiempo) */
  kb: number;
  /** el último consumidor está caído: sus ítems vuelven a la cola, no se pierden */
  caido: boolean;
  /** SLA en unidades de tiempo; null = no se cuenta */
  sla: number | null;
}

/** Un ítem resuelto con la base de conocimiento tarda esta fracción del tiempo normal. */
export const FACTOR_KB = 0.2;

export interface Item {
  id: number;
  t0: number;
  u: number; // exponencial(1) del servicio
  kb: boolean;
  fuera: boolean;
}

export interface Consumidor {
  item: Item | null;
  inicio: number;
  fin: number;
}

export interface LecturasCola {
  enCola: number;
  esperaMedia: number; // en unidades de tiempo del motor (NaN si no hay datos)
  perdidos: number;
  fueraDeSla: number;
  atendidos: number;
  tiempo: number;
}

export class MotorCola {
  t = 0;
  params: ParamsCola;
  cola: Item[] = [];
  consumidores: Consumidor[] = [];
  perdidos = 0;
  atendidos = 0;
  fueraDeSla = 0;
  /** ítems que entraron en el último avance (para animar), con su id */
  nuevos: { id: number; perdido: boolean }[] = [];

  private readonly aLleg: Azar;
  private readonly aServ: Azar;
  private readonly aKb: Azar;
  private proxLlegada: number;
  private idSig = 1;
  private esperas = new UltimasN(40);

  constructor(params: ParamsCola, semilla = 42) {
    this.params = { ...params };
    this.aLleg = mulberry32(semilla);
    this.aServ = mulberry32(semilla + 1);
    this.aKb = mulberry32(semilla + 2);
    this.proxLlegada = exponencial(this.aLleg, params.tasaLlegada);
    this.ajustarConsumidores();
    this.asignar();
  }

  /** ¿Está el consumidor i trabajando? (existe y no es el caído) */
  activo(i: number): boolean {
    return i < this.params.consumidores && !(this.params.caido && i === this.params.consumidores - 1);
  }

  private ajustarConsumidores() {
    const n = this.params.consumidores;
    while (this.consumidores.length < n) this.consumidores.push({ item: null, inicio: 0, fin: Infinity });
    if (this.consumidores.length > n) {
      for (const c of this.consumidores.splice(n)) if (c.item) this.cola.unshift(c.item);
    }
    for (let i = 0; i < this.consumidores.length; i++) {
      const c = this.consumidores[i]!;
      if (!this.activo(i) && c.item) {
        this.cola.unshift(c.item); // el mensaje no se pierde: vuelve al frente
        c.item = null;
        c.fin = Infinity;
      }
    }
  }

  setParams(p: Partial<ParamsCola>) {
    const antes = this.params;
    this.params = { ...antes, ...p };
    this.params.consumidores = Math.max(1, Math.round(this.params.consumidores));
    if (this.params.tasaLlegada !== antes.tasaLlegada) {
      this.proxLlegada = this.t + ((this.proxLlegada - this.t) * antes.tasaLlegada) / this.params.tasaLlegada;
    }
    this.ajustarConsumidores();
    this.asignar();
  }

  /** Asigna ítems de la cola a los consumidores libres. */
  private asignar() {
    for (let i = 0; i < this.consumidores.length; i++) {
      if (!this.activo(i)) continue;
      const c = this.consumidores[i]!;
      if (c.item || this.cola.length === 0) continue;
      const it = this.cola.shift()!;
      this.esperas.agregar(this.t - it.t0);
      c.item = it;
      c.inicio = this.t;
      c.fin = this.t + it.u * this.params.tiempoProceso * (it.kb ? FACTOR_KB : 1);
    }
  }

  private marcarSla(it: Item, edad: number) {
    const sla = this.params.sla;
    if (sla != null && !it.fuera && edad > sla) {
      it.fuera = true;
      this.fueraDeSla++;
    }
  }

  private llegada() {
    const id = this.idSig++;
    const it: Item = { id, t0: this.t, u: exponencial(this.aServ, 1), kb: this.aKb() < this.params.kb, fuera: false };
    if (this.cola.length >= this.params.capacidadCola) {
      this.perdidos++;
      this.nuevos.push({ id, perdido: true });
      return;
    }
    this.cola.push(it);
    this.nuevos.push({ id, perdido: false });
    this.asignar();
  }

  avanzar(dt: number) {
    const fin = this.t + dt;
    this.nuevos = [];
    for (;;) {
      let te = this.proxLlegada;
      let quien = -1;
      for (let i = 0; i < this.consumidores.length; i++) {
        const c = this.consumidores[i]!;
        if (c.item && c.fin < te) {
          te = c.fin;
          quien = i;
        }
      }
      if (te > fin) break;
      this.t = te;
      if (quien < 0) {
        this.llegada();
        this.proxLlegada = this.t + exponencial(this.aLleg, this.params.tasaLlegada);
      } else {
        const c = this.consumidores[quien]!;
        const it = c.item!;
        this.atendidos++;
        this.marcarSla(it, this.t - it.t0);
        c.item = null;
        c.fin = Infinity;
        this.asignar();
      }
    }
    this.t = fin;
    if (this.params.sla != null) {
      for (const it of this.cola) this.marcarSla(it, this.t - it.t0);
      for (const c of this.consumidores) if (c.item) this.marcarSla(c.item, this.t - c.item.t0);
    }
  }

  lecturas(): LecturasCola {
    return {
      enCola: this.cola.length,
      esperaMedia: this.esperas.media(),
      perdidos: this.perdidos,
      fueraDeSla: this.fueraDeSla,
      atendidos: this.atendidos,
      tiempo: this.t,
    };
  }
}
