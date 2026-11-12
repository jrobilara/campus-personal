import { describe, expect, it } from 'vitest';
import {
  calcular, clasificacionInicial, duracionCorta, hhmm, mover, ordenLlegada, ordenPorPrioridad, prioridadDe,
  SLAS_POR_DEFECTO, TICKETS, type ConjuntoTickets, type Nivel,
} from '../src/simuladores/matriz-prioridad/logica';

describe('matriz impacto × urgencia', () => {
  const esperado: [Nivel, Nivel, string][] = [
    ['A', 'A', 'P1'], ['A', 'M', 'P2'], ['M', 'A', 'P2'], ['A', 'B', 'P3'], ['M', 'M', 'P3'],
    ['B', 'A', 'P3'], ['M', 'B', 'P4'], ['B', 'M', 'P4'], ['B', 'B', 'P5'],
  ];
  it.each(esperado)('(%s,%s) = %s', (i, u, p) => expect(prioridadDe(i, u)).toBe(p));
  it('impacto alto y urgencia alta da P1', () => expect(prioridadDe('A', 'A')).toBe('P1'));
});

describe('conjuntos de tickets', () => {
  it('mesa-lunes tiene 6 tickets y caida-parcial 5, con ids únicos', () => {
    expect(TICKETS['mesa-lunes']).toHaveLength(6);
    expect(TICKETS['caida-parcial']).toHaveLength(5);
    for (const k of ['mesa-lunes', 'caida-parcial'] as const) expect(new Set(TICKETS[k].map((t) => t.id)).size).toBe(TICKETS[k].length);
  });
  it('mesa-lunes incluye los seis casos del doc', () => {
    expect(TICKETS['mesa-lunes'].map((t) => t.id)).toEqual(['impresora', 'vpn-gerente', 'facturacion', 'alta-usuario', 'lentitud', 'correo']);
  });
  it('los SLA por defecto son los del doc', () => {
    expect(SLAS_POR_DEFECTO.P1).toEqual({ respuestaMin: 15, resolucionMin: 240 });
    expect(SLAS_POR_DEFECTO.P2).toEqual({ respuestaMin: 30, resolucionMin: 480 });
    expect(SLAS_POR_DEFECTO.P3).toEqual({ respuestaMin: 120, resolucionMin: 1440 });
    expect(SLAS_POR_DEFECTO.P4).toEqual({ respuestaMin: 480, resolucionMin: 4320 });
    expect(SLAS_POR_DEFECTO.P5).toEqual({ respuestaMin: 1440, resolucionMin: 7200 });
  });
  it('la facturación caída es P1 y las prioridades iniciales de mesa-lunes son las esperadas', () => {
    const cls = clasificacionInicial('mesa-lunes');
    const r = calcular('mesa-lunes', ordenLlegada('mesa-lunes'), 0, cls);
    expect(r.estados.facturacion!.prioridad).toBe('P1');
    expect(r.estados['vpn-gerente']!.prioridad).toBe('P2');
    expect(r.estados.lentitud!.prioridad).toBe('P2');
    expect(r.estados.impresora!.prioridad).toBe('P4');
    expect(r.estados['alta-usuario']!.prioridad).toBe('P5');
  });
});

describe.each(['mesa-lunes', 'caida-parcial'] as ConjuntoTickets[])('atención en %s', (c) => {
  const cls = clasificacionInicial(c);
  const n = TICKETS[c].length;
  it('en orden de llegada deja al menos un incumplido', () => {
    const r = calcular(c, ordenLlegada(c), n, cls);
    expect(r.incumplidos).toBeGreaterThanOrEqual(1);
  });
  it('por prioridad deja cero incumplidos', () => {
    const r = calcular(c, ordenPorPrioridad(c, cls), n, cls);
    expect(r.incumplidos).toBe(0);
  });
  it('el reloj es la suma de los tiempos de atención', () => {
    const suma = TICKETS[c].reduce((s, t) => s + t.atencionMin, 0);
    expect(calcular(c, ordenLlegada(c), n, cls).reloj).toBe(suma);
    expect(calcular(c, ordenLlegada(c), 0, cls).reloj).toBe(0);
  });
  it('sin atender nada no hay incumplidos', () => {
    expect(calcular(c, ordenLlegada(c), 0, cls).incumplidos).toBe(0);
  });
});

describe('mesa-lunes en detalle', () => {
  const c = 'mesa-lunes' as const;
  const cls = clasificacionInicial(c);
  it('en orden de llegada, la facturación espera detrás de la impresora y de la VPN', () => {
    const r = calcular(c, ordenLlegada(c), 6, cls);
    expect(r.estados.facturacion!.respuestaMin).toBe(35);
    expect(r.estados.facturacion!.incumplido).toBe(true);
    expect(r.estados.facturacion!.motivo).toBe('respuesta');
  });
  it('por prioridad el primero es la facturación y el orden es estable', () => {
    expect(ordenPorPrioridad(c, cls)).toEqual(['facturacion', 'vpn-gerente', 'lentitud', 'impresora', 'correo', 'alta-usuario']);
  });
  it('un pendiente cuyo plazo de respuesta ya venció también cuenta como incumplido', () => {
    const r = calcular(c, ordenLlegada(c), 2, cls); // reloj = 35 min, la facturación (P1, 15 min) sigue esperando
    expect(r.reloj).toBe(35);
    expect(r.estados.facturacion!.atendido).toBe(false);
    expect(r.estados.facturacion!.incumplido).toBe(true);
    expect(r.estados.lentitud!.incumplido).toBe(true); // P2 (30 min), también vencido
    expect(r.incumplidos).toBe(2);
  });
  it('reclasificar cambia la prioridad y el orden', () => {
    const otra = { ...cls, impresora: { impacto: 'A' as Nivel, urgencia: 'A' as Nivel } };
    expect(prioridadDe(otra.impresora.impacto, otra.impresora.urgencia)).toBe('P1');
    expect(ordenPorPrioridad(c, otra).slice(0, 2)).toEqual(['impresora', 'facturacion']);
  });
});

describe('utilidades', () => {
  it('hhmm', () => {
    expect(hhmm(0)).toBe('00:00');
    expect(hhmm(87)).toBe('01:27');
    expect(hhmm(605)).toBe('10:05');
  });
  it('duracionCorta', () => {
    expect(duracionCorta(15)).toBe('15 min');
    expect(duracionCorta(240)).toBe('4 h');
    expect(duracionCorta(1440)).toBe('1 d');
    expect(duracionCorta(4320)).toBe('3 d');
    expect(duracionCorta(7200)).toBe('5 d');
  });
  it('mover respeta los fijos', () => {
    expect(mover(['a', 'b', 'c', 'd'], 3, 2, 1)).toEqual(['a', 'b', 'd', 'c']);
    expect(mover(['a', 'b', 'c', 'd'], 1, 0, 2)).toEqual(['a', 'b', 'c', 'd']);
    expect(mover(['a', 'b', 'c'], 2, 3, 0)).toEqual(['a', 'b', 'c']);
  });
});
