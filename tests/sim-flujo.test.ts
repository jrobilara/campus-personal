import { describe, expect, it } from 'vitest';
import { MotorBalanceador, type ParamsBalanceador } from '../src/simuladores/flujo/balanceador';
import { MotorCola, type ParamsCola } from '../src/simuladores/flujo/cola';
import { MotorSincrono } from '../src/simuladores/flujo/sincrono';
import { calcularCadena } from '../src/simuladores/flujo/cadena';
import { percentil } from '../src/simuladores/flujo/estadistica';
import { enRuta, largoRuta, layoutBalanceador, layoutCadena, layoutCola, puntoAsinc, puntoCadena, puntoSinc, puntosBalanceador, ranura, rutaAServidor } from '../src/simuladores/flujo/geometria';
import { RED } from '../src/simuladores/flujo/sincrono';

const PASO = 0.05;
function correr(m: { avanzar(dt: number): void }, seg: number) {
  for (let i = 0; i < Math.round(seg / PASO); i++) m.avanzar(PASO);
}

const base: ParamsBalanceador = {
  servidores: 3, algoritmo: 'round-robin', tasaLlegada: 20, capacidadPorServidor: 10,
  servidorLento: false, cacheActiva: false, aciertoCache: 0.5,
};
const bal = (p: Partial<ParamsBalanceador> = {}, semilla = 42) => new MotorBalanceador({ ...base, ...p }, semilla);

describe('percentil', () => {
  it('interpola y maneja vacíos', () => {
    expect(percentil([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(percentil([0, 10], 0.95)).toBeCloseTo(9.5);
    expect(percentil([], 0.5)).toBeNaN();
  });
});

describe('balanceador', () => {
  it('es determinista con la misma semilla y cambia con otra', () => {
    const a = bal(); const b = bal(); const c = bal({}, 7);
    correr(a, 30); correr(b, 30); correr(c, 30);
    expect(a.lecturas()).toEqual(b.lecturas());
    expect(c.lecturas().p95).not.toBe(a.lecturas().p95);
  });

  it('con carga sana (20 pedidos/s en 3×10) la utilización ronda 2/3 y no hay rechazos', () => {
    const m = bal(); correr(m, 60);
    const l = m.lecturas();
    expect(l.utilizacion).toBeGreaterThan(0.5);
    expect(l.utilizacion).toBeLessThan(0.85);
    expect(l.rechazados).toBe(0);
    expect(l.p50).toBeGreaterThan(10);
    expect(l.p95).toBeGreaterThan(l.p50);
  });

  it('si la llegada supera servidores × capacidad, las colas crecen sin parar y el p95 sube todo el tiempo', () => {
    const m = bal({ tasaLlegada: 40 });
    const p95: number[] = []; const colas: number[] = [];
    for (let i = 0; i < 3; i++) {
      correr(m, 10);
      p95.push(m.lecturas().p95);
      colas.push(m.servidores.reduce((s, x) => s + x.cola.length, 0));
    }
    for (let i = 1; i < 3; i++) {
      expect(colas[i]).toBeGreaterThan(colas[i - 1]!);
      expect(p95[i]).toBeGreaterThan(p95[i - 1]!);
    }
    expect(m.lecturas().utilizacion).toBeGreaterThan(0.95);
  });

  it('una caché con 80 % de aciertos baja la utilización de los servidores y los aciertos se miden', () => {
    const sin = bal(); const con = bal({ cacheActiva: true, aciertoCache: 0.8 });
    correr(sin, 40); correr(con, 40);
    expect(con.lecturas().utilizacion).toBeLessThan(sin.lecturas().utilizacion * 0.5);
    expect(con.lecturas().aciertosCache!).toBeGreaterThan(0.7);
    expect(con.lecturas().aciertosCache!).toBeLessThan(0.9);
    expect(sin.lecturas().aciertosCache).toBeNull();
  });

  it('con un servidor lento, menos-conexiones tiene un p95 menor que round-robin', () => {
    const rr = bal({ servidorLento: true, algoritmo: 'round-robin' });
    const mc = bal({ servidorLento: true, algoritmo: 'menos-conexiones' });
    correr(rr, 30); correr(mc, 30);
    expect(mc.lecturas().p95).toBeLessThan(rr.lecturas().p95 / 3);
  });

  it('el algoritmo aleatorio también reparte', () => {
    const m = bal({ algoritmo: 'aleatorio' }); correr(m, 20);
    expect(m.servidores.every((s) => s.enServicio || s.cola.length >= 0)).toBe(true);
    expect(m.atendidos).toBeGreaterThan(300);
  });

  it('tirar un servidor lo deja caído, descuenta capacidad y cuenta lo perdido como rechazado', () => {
    const m = bal({ tasaLlegada: 40 }); correr(m, 10);
    const antes = m.rechazados;
    expect(m.tirarServidor()).toBe(true);
    expect(m.caidos).toBe(1);
    expect(m.rechazados).toBeGreaterThan(antes);
    correr(m, 5);
    expect(m.servidores[2]!.arriba).toBe(false);
    m.levantarTodos();
    expect(m.caidos).toBe(0);
  });

  it('si caen todos, todo se rechaza; la cola tiene tope y rechaza al llenarse', () => {
    const m = bal({ servidores: 1 }); m.tirarServidor(); correr(m, 5);
    expect(m.rechazados).toBeGreaterThan(50);
    const s = bal({ servidores: 1, tasaLlegada: 100 }); correr(s, 30);
    expect(s.servidores[0]!.cola.length).toBeLessThanOrEqual(100);
    expect(s.rechazados).toBeGreaterThan(0);
  });

  it('cambiar la cantidad de servidores en caliente reparte lo pendiente', () => {
    const m = bal({ tasaLlegada: 60 }); correr(m, 5);
    m.setParams({ servidores: 1 });
    expect(m.servidores.length).toBe(1);
    m.setParams({ servidores: 6 });
    expect(m.servidores.length).toBe(6);
    correr(m, 5);
    expect(m.servidores.every((s) => s.arriba)).toBe(true);
  });
});

const cola0: ParamsCola = { tasaLlegada: 5, consumidores: 2, tiempoProceso: 0.5, capacidadCola: 50, kb: 0, caido: false, sla: null };

describe('cola', () => {
  it('si la llegada supera lo que procesan los consumidores, la cola crece; al sumar consumidores se vacía', () => {
    const m = new MotorCola(cola0);
    correr(m, 20);
    const crecida = m.lecturas().enCola;
    expect(crecida).toBeGreaterThan(8);
    m.setParams({ consumidores: 6 });
    correr(m, 20);
    expect(m.lecturas().enCola).toBeLessThan(crecida / 3);
    expect(m.lecturas().enCola).toBeLessThan(5);
  });

  it('con consumidor caído no se pierde nada: se acumula y se drena al volver', () => {
    const m = new MotorCola({ ...cola0, tasaLlegada: 2, consumidores: 1, tiempoProceso: 0.3 });
    correr(m, 10);
    m.setParams({ caido: true });
    correr(m, 10);
    const acumulado = m.lecturas().enCola;
    expect(acumulado).toBeGreaterThanOrEqual(10);
    expect(m.lecturas().perdidos).toBe(0);
    m.setParams({ caido: false });
    correr(m, 40);
    expect(m.lecturas().enCola).toBeLessThan(acumulado / 3);
    expect(m.lecturas().perdidos).toBe(0);
  });

  it('se pierden mensajes solo cuando la cola está llena', () => {
    const m = new MotorCola({ ...cola0, tasaLlegada: 20, capacidadCola: 10 });
    correr(m, 20);
    expect(m.lecturas().enCola).toBeLessThanOrEqual(10);
    expect(m.lecturas().perdidos).toBeGreaterThan(50);
  });

  it('con 40 % resuelto con la KB la espera media baja', () => {
    const sin = new MotorCola({ ...cola0 }); const con = new MotorCola({ ...cola0, kb: 0.4 });
    correr(sin, 30); correr(con, 30);
    expect(con.lecturas().esperaMedia).toBeLessThan(sin.lecturas().esperaMedia * 0.7);
  });

  it('cuenta los tickets fuera de SLA (la edad supera el plazo) una sola vez', () => {
    const m = new MotorCola({ ...cola0, sla: 4 });
    correr(m, 40);
    const f = m.lecturas().fueraDeSla;
    expect(f).toBeGreaterThan(0);
    expect(f).toBeLessThanOrEqual(m.lecturas().atendidos + m.lecturas().enCola + m.params.consumidores);
    const sinSla = new MotorCola({ ...cola0 }); correr(sinSla, 40);
    expect(sinSla.lecturas().fueraDeSla).toBe(0);
  });

  it('es determinista', () => {
    const a = new MotorCola(cola0), b = new MotorCola(cola0);
    correr(a, 25); correr(b, 25);
    expect(a.lecturas()).toEqual(b.lecturas());
  });
});

describe('síncrono vs asíncrono', () => {
  it('la espera síncrona incluye la latencia de B y la asíncrona no', () => {
    const m = new MotorSincrono(200); correr(m, 10);
    expect(m.lecturas().esperaSinc).toBeCloseTo(450, 0);
    expect(m.lecturas().esperaAsinc).toBeCloseTo(160, 0);
    const lento = new MotorSincrono(1000); correr(lento, 12);
    expect(lento.lecturas().esperaSinc).toBeCloseTo(1250, 0);
    expect(lento.lecturas().esperaAsinc).toBeCloseTo(160, 0);
  });

  it('con B muy lento el asíncrono acumula pendientes pero el cliente no espera más', () => {
    const m = new MotorSincrono(2000); correr(m, 20);
    expect(m.lecturas().pendientesAsinc).toBeGreaterThan(10);
    expect(m.lecturas().esperaAsinc).toBeCloseTo(160, 0);
  });

  it('con B caído el síncrono acumula errores y el asíncrono pendientes, que bajan a 0 cuando B vuelve', () => {
    const m = new MotorSincrono(200); correr(m, 5);
    expect(m.lecturas().erroresSinc).toBe(0);
    m.setCaidoB(true); correr(m, 15);
    const l = m.lecturas();
    expect(l.erroresSinc).toBeGreaterThanOrEqual(8);
    expect(l.pendientesAsinc).toBeGreaterThanOrEqual(25);
    expect(m.lecturas().esperaSinc).toBeGreaterThan(3000);
    m.setCaidoB(false); correr(m, 40);
    expect(m.lecturas().pendientesAsinc).toBe(0);
    expect(m.lecturas().erroresSinc).toBeGreaterThanOrEqual(l.erroresSinc);
  });

  it('es determinista y el mensaje en proceso vuelve a la cola si B cae', () => {
    const m = new MotorSincrono(1500); correr(m, 3);
    expect(m.enB).not.toBeNull();
    m.setCaidoB(true);
    expect(m.enB).toBeNull();
    expect(m.cola.length).toBeGreaterThan(0);
  });
});

describe('cadena', () => {
  it('con 5 saltos de 99,9 % la disponibilidad compuesta es 99,50 %', () => {
    const r = calcularCadena({ saltos: 5, latenciaPorSalto: 20, disponibilidad: 0.999, monolito: false });
    expect((r.disponibilidad * 100).toFixed(2)).toBe('99.50');
    expect(r.latenciaTotal).toBe(100);
    expect(r.caidaAnualHoras).toBeCloseTo(43.7, 0);
  });
  it('cada salto suma la latencia por salto', () => {
    for (let n = 1; n <= 8; n++) expect(calcularCadena({ saltos: n, latenciaPorSalto: 25, disponibilidad: 0.99, monolito: false }).latenciaTotal).toBe(25 * n);
  });
  it('el monolito es un solo salto en memoria de 1 ms', () => {
    const r = calcularCadena({ saltos: 6, latenciaPorSalto: 50, disponibilidad: 0.99, monolito: true });
    expect(r.servicios).toBe(1);
    expect(r.latenciaTotal).toBe(1);
    expect(r.disponibilidad).toBeCloseTo(0.99, 10);
  });
  it('los acumulados terminan en el total', () => {
    const r = calcularCadena({ saltos: 4, latenciaPorSalto: 20, disponibilidad: 0.9, monolito: false });
    expect(r.latenciaAcumulada).toEqual([20, 40, 60, 80]);
    expect(r.disponibilidadAcumulada[3]).toBeCloseTo(0.6561, 4);
  });
});

describe('geometría de los puntos que viajan', () => {
  it('enRuta recorre la poligonal y se queda en el extremo', () => {
    const r = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(largoRuta(r)).toBe(20);
    expect(enRuta(r, 5)).toEqual({ x: 5, y: 0 });
    expect(enRuta(r, 15)).toEqual({ x: 10, y: 5 });
    expect(enRuta(r, 99)).toEqual({ x: 10, y: 10 });
  });

  it('los pedidos del balanceador viajan hacia su servidor, los aciertos se quedan en la caché y los rechazados en el balanceador', () => {
    const l = layoutBalanceador(3);
    const ll = (id: number, srv: number, acierto = false, rechazado = false) => ({ id, t: 0, srv, acierto, rechazado });
    const medio = puntosBalanceador([ll(1, 2)], 0.3, l, true);
    expect(medio).toHaveLength(1);
    expect(medio[0]!.x).toBeGreaterThan(l.xCliente);
    expect(medio[0]!.x).toBeLessThan(l.xSrv);
    expect(puntosBalanceador([ll(1, 2)], 0.65, l, true)).toHaveLength(0); // ya entró al servidor
    const fin = rutaAServidor(l, 2, true).at(-1)!;
    expect(fin).toEqual({ x: l.xSrv, y: l.ys[2] });
    const hit = puntosBalanceador([ll(2, -1, true)], 0.5, l, true)[0]!;
    expect(hit.estado).toBe('acierto');
    expect(hit.x).toBeLessThan(l.xCacheDer);
    const rech = puntosBalanceador([ll(3, -1, false, true)], 0.2, l, false)[0]!;
    expect(rech.estado).toBe('rechazo');
    expect(rech.x).toBeLessThanOrEqual(l.xLbIzq);
  });

  it('la cola ubica la cabeza junto a los consumidores y sigue hacia la izquierda', () => {
    const l = layoutCola(50, 2);
    expect(l.ranuras).toBe(50);
    expect(ranura(l, 0).x).toBeGreaterThan(ranura(l, 1).x);
    expect(ranura(l, 10).y).toBeGreaterThan(ranura(l, 0).y);
    expect(layoutCola(500, 1).ranuras).toBe(60);
    expect(l.yConsumidores).toHaveLength(2);
  });

  it('los pedidos síncronos y asíncronos avanzan por el carril correspondiente', () => {
    const m = new MotorSincrono(200);
    correr(m, 0.55);
    const s = m.sinc[0]!;
    const a = m.asinc[0]!;
    expect(puntoSinc(s, s.t0 + RED / 2)!.x).toBeGreaterThan(44);
    expect(puntoSinc(s, s.t0 + RED / 2)!.y).toBeLessThan(puntoAsinc(a, a.t0 + RED / 2)!.y);
    correr(m, 3);
    const ya = m.sinc.find((p) => p.terminado);
    expect(ya === undefined || puntoSinc(ya, ya.tFin + 5) === null).toBe(true);
    const caido = new MotorSincrono(200); caido.setCaidoB(true); correr(caido, 5);
    const p = caido.sinc.find((x) => x.resuelto && !x.ok)!;
    expect(puntoSinc(p, p.tLlegaB + 0.5)!.estado).toBe('espera');
  });

  it('el punto de la cadena va y vuelve por los servicios', () => {
    const l = layoutCadena(4);
    expect(l.xs).toHaveLength(4);
    expect(l.xs[3]! + l.anchoNodo / 2).toBeLessThanOrEqual(440);
    expect(puntoCadena(0, l).x).toBe(l.xCliente);
    const ida = puntoCadena(1.2, l);
    expect(ida.vuelta).toBe(false);
    const vuelta = puntoCadena(5 * 0.5 + 0.6 + 0.2, l);
    expect(vuelta.vuelta).toBe(true);
    expect(layoutCadena(1).xs).toHaveLength(1);
  });
});
