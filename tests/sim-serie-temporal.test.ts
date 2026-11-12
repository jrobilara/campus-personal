import { describe, expect, it } from 'vitest';
import {
  analizarEscenario, condicionPredictiva, evaluarAlertas, generarEscenario, horaHHMM, MIN_DIA, promedioMovil,
  type EscenarioSerie,
} from '../src/simuladores/serie-temporal/series';
import { calcularRespaldo } from '../src/simuladores/serie-temporal/respaldo';

const base = { umbral: 90, duracionMin: 0, ventana: 1, predictiva: false };

describe('escenarios de SimSerieTemporal', () => {
  it.each(['pico-breve', 'fuga-memoria', 'disco-llenandose', 'carga-sostenida'] as EscenarioSerie[])('%s tiene 1440 puntos por serie', (e) => {
    const esc = generarEscenario(e);
    for (const s of esc.series) expect(s.valores).toHaveLength(MIN_DIA);
    expect(esc.series).toHaveLength(e === 'carga-sostenida' ? 3 : 1);
  });

  it('es determinista con la semilla y cambia con otra', () => {
    expect(generarEscenario('pico-breve', 7).series[0]!.valores).toEqual(generarEscenario('pico-breve', 7).series[0]!.valores);
    expect(generarEscenario('pico-breve', 7).series[0]!.valores).not.toEqual(generarEscenario('pico-breve', 8).series[0]!.valores);
  });

  it('pico-breve: estable en 30 con un pico de 3 min a 95', () => {
    const v = generarEscenario('pico-breve').series[0]!.valores;
    const altos = v.filter((x) => x > 60);
    expect(altos).toHaveLength(3);
    for (const x of altos) expect(Math.abs(x - 95)).toBeLessThan(5);
    const resto = v.filter((x) => x <= 60);
    expect(resto.reduce((a, b) => a + b, 0) / resto.length).toBeCloseTo(30, 0);
  });

  it('fuga-memoria: sube de 40 a ~97 en 20 h y se reinicia', () => {
    const v = generarEscenario('fuga-memoria').series[0]!.valores;
    expect(v[0]).toBeCloseTo(40, -1);
    expect(v[1199]!).toBeGreaterThan(94);
    expect(v[1199]!).toBeLessThan(100);
    expect(v[1200]!).toBeLessThan(45);
  });

  it('disco-llenandose: 70 hasta la hora 16, +5 por hora, 100 % en la hora 22', () => {
    const v = generarEscenario('disco-llenandose').series[0]!.valores;
    expect(v[0]).toBe(70);
    expect(v[959]).toBe(70);
    expect(v[16 * 60 + 60]).toBeCloseTo(75, 9);
    expect(v[21 * 60]).toBeCloseTo(95, 9);
    expect(v[22 * 60]).toBe(100);
    expect(v[1439]).toBe(100);
  });

  it('carga-sostenida: una hora sostenida en 6 con 4 núcleos', () => {
    const esc = generarEscenario('carga-sostenida', 42, 4);
    const [l1, l5, l15] = esc.series.map((s) => s.valores);
    expect(l15![13 * 60 + 59]!).toBeGreaterThan(5.5);
    expect(l5![13 * 60 + 59]!).toBeGreaterThan(5.5);
    expect(l1![13 * 60 + 59]!).toBeGreaterThan(5.5);
    // antes de la hora sostenida el load15 queda por debajo de los núcleos
    expect(Math.max(...l15!.slice(0, 780))).toBeLessThan(4);
    expect(esc.umbralInicial).toBe(4);
  });
});

describe('alertas (doc §2.10)', () => {
  const pico = generarEscenario('pico-breve');
  it('pico-breve con umbral 90 y duración 0: 1 alerta', () => {
    const r = analizarEscenario(pico, 'cpu', base);
    expect(r.alertas).toBe(1);
    expect(r.minutosEnAlerta).toBe(3);
    expect(horaHHMM(r.primerAvisoMin!)).toBe('10:30');
  });
  it('con duración 5: 0 alertas y primer aviso —', () => {
    const r = analizarEscenario(pico, 'cpu', { ...base, duracionMin: 5 });
    expect(r.alertas).toBe(0);
    expect(r.primerAvisoMin).toBeNull();
    expect(r.minutosEnAlerta).toBe(0);
  });
  it('con duración 3 todavía dispara (3 min sostenidos) y a los 2 minutos del pico', () => {
    const r = analizarEscenario(pico, 'cpu', { ...base, duracionMin: 3 });
    expect(r.alertas).toBe(1);
    expect(r.primerAvisoMin).toBe(632);
  });
  it('una ventana de promedio de 15 min apaga la alerta del pico', () => {
    expect(analizarEscenario(pico, 'cpu', { ...base, ventana: 15 }).alertas).toBe(0);
  });
  it('promedioMovil: ventana 1 es identidad y ventana 3 promedia hacia atrás', () => {
    expect(promedioMovil([1, 2, 3, 4], 1)).toEqual([1, 2, 3, 4]);
    expect(promedioMovil([3, 6, 9, 12], 3)).toEqual([3, 4.5, 6, 9]);
  });
  it('evaluarAlertas cuenta episodios separados', () => {
    const r = evaluarAlertas([true, true, false, true, false, true, true, true], 2);
    expect(r.alertas).toBe(2);
    expect(r.episodios.map((e) => e.disparo)).toEqual([1, null, 6]);
    expect(r.minutosEnAlerta).toBe(1 + 2);
  });

  const disco = generarEscenario('disco-llenandose');
  it('disco: umbral en 95 % avisa a las 21:00, con 1 h de anticipación', () => {
    const r = analizarEscenario(disco, 'disco', { ...base, umbral: 95 });
    expect(r.alertas).toBe(1);
    expect(horaHHMM(r.primerAvisoMin!)).toBe('21:00');
    expect(r.anticipacionHoras).toBeCloseTo(1, 5);
  });
  it('disco: la alerta predictiva avisa con >= 3 h de anticipación', () => {
    const r = analizarEscenario(disco, 'disco', { ...base, predictiva: true });
    expect(r.anticipacionHoras!).toBeGreaterThanOrEqual(3);
    expect(r.anticipacionHoras!).toBeLessThanOrEqual(4);
    // y no avisa mientras el disco está estable
    expect(condicionPredictiva(disco.series[0]!.valores).slice(0, 960).some(Boolean)).toBe(false);
  });
  it('memoria: el umbral de 90 % avisa antes del reinicio', () => {
    const r = analizarEscenario(generarEscenario('fuga-memoria'), 'memoria', base);
    expect(r.alertas).toBe(1);
    expect(r.primerAvisoMin!).toBeLessThan(1200);
    expect(r.primerAvisoMin!).toBeGreaterThan(1000);
  });
  it('carga: los picos cortos no disparan load5 > 4 pero la hora sostenida sí', () => {
    const esc = generarEscenario('carga-sostenida');
    const r = analizarEscenario(esc, 'load5', { ...base, umbral: 4 });
    expect(r.alertas).toBe(1);
    expect(r.primerAvisoMin!).toBeGreaterThanOrEqual(780);
    expect(r.primerAvisoMin!).toBeLessThan(840);
    // el load de 1 min sí se asusta con los picos
    expect(analizarEscenario(esc, 'load1', { ...base, umbral: 4 }).alertas).toBeGreaterThan(1);
  });
});

describe('respaldo (RPO/RTO)', () => {
  const entrada = { frecuenciaHoras: 24, incidenteHoras: 47, duracionRestauracionHoras: 3, respaldoProbado: true, rpoObjetivoHoras: 4, rtoObjetivoHoras: 2 };
  it('cada 24 h y el incidente 23 h después de un respaldo: RPO 23 y no cumple 4 h', () => {
    const r = calcularRespaldo(entrada);
    expect(r.rpoRealHoras).toBe(23);
    expect(r.cumpleRpo).toBe(false);
    expect(r.rtoRealHoras).toBe(3);
    expect(r.cumpleRto).toBe(false);
    expect(r.respaldos).toEqual([0, 24, 48, 72]);
  });
  it('cada 4 h cumple el RPO en cualquier momento', () => {
    for (let t = 0; t <= 72; t += 0.5) expect(calcularRespaldo({ ...entrada, frecuenciaHoras: 4, incidenteHoras: t }).cumpleRpo).toBe(true);
  });
  it('sin probar, la pérdida salta un respaldo hacia atrás (suma la frecuencia)', () => {
    const r = calcularRespaldo({ ...entrada, respaldoProbado: false });
    expect(r.rpoRealHoras).toBe(23 + 24);
    expect(r.corrupto).toBe(24);
    expect(r.restaurado).toBe(0);
    const r2 = calcularRespaldo({ ...entrada, frecuenciaHoras: 6, incidenteHoras: 35, respaldoProbado: false });
    expect(r2.rpoRealHoras).toBe(5 + 6);
  });
  it('sin respaldo anterior válido se pierde todo lo acumulado', () => {
    const r = calcularRespaldo({ ...entrada, incidenteHoras: 10, respaldoProbado: false });
    expect(r.restaurado).toBeNull();
    expect(r.rpoRealHoras).toBe(10);
  });
  it('sin probar, el RTO suma el intento fallido sobre el respaldo corrupto: 2 × la duración', () => {
    const r = calcularRespaldo({ ...entrada, duracionRestauracionHoras: 3, respaldoProbado: false });
    expect(r.intentoFallidoHoras).toBe(3);
    expect(r.restauracionHoras).toBe(3);
    expect(r.rtoRealHoras).toBe(6);
    expect(r.inicioRestauracion).toBe(50);
    expect(r.finRestauracion).toBe(53);
    expect(r.cumpleRto).toBe(false);
    // con la duración justa para el objetivo: probado cumple, sin probar ya no
    const ok = calcularRespaldo({ ...entrada, duracionRestauracionHoras: 1.5, rtoObjetivoHoras: 2 });
    expect(ok.cumpleRto).toBe(true);
    const mal = calcularRespaldo({ ...entrada, duracionRestauracionHoras: 1.5, rtoObjetivoHoras: 2, respaldoProbado: false });
    expect(mal.rtoRealHoras).toBe(3);
    expect(mal.cumpleRto).toBe(false);
  });
  it('probado: sin intento fallido, el RTO es solo la duración de la restauración', () => {
    const r = calcularRespaldo(entrada);
    expect(r.intentoFallidoHoras).toBe(0);
    expect(r.rtoRealHoras).toBe(3);
  });
  it('sin respaldo anterior válido, solo queda el intento fallido', () => {
    const r = calcularRespaldo({ ...entrada, incidenteHoras: 10, respaldoProbado: false });
    expect(r.restauracionHoras).toBe(0);
    expect(r.rtoRealHoras).toBe(3);
  });
  it('el RTO es la duración de la restauración y cumple si no la supera', () => {
    const r = calcularRespaldo({ ...entrada, duracionRestauracionHoras: 1.5 });
    expect(r.rtoRealHoras).toBe(1.5);
    expect(r.cumpleRto).toBe(true);
  });
});
