import { describe, expect, it } from 'vitest';
import { PRESETS, aplicar, autovectores, copiar, det, iguales, mezclar, orientacion, presetDe, type Matriz } from '../src/simuladores/transformacion/matriz';
import { num } from '../src/simuladores/formato';

describe('SimTransformacion2D · presets del doc', () => {
  it('las 6 matrices son las del doc', () => {
    expect(PRESETS).toEqual({
      identidad: [[1, 0], [0, 1]],
      'rotacion-90': [[0, -1], [1, 0]],
      escala: [[2, 0], [0, 0.5]],
      cizalla: [[1, 1], [0, 1]],
      reflexion: [[1, 0], [0, -1]],
      proyeccion: [[1, 0], [0, 0]],
    });
  });
  it('proyeccion: det = 0,00 y la orientación colapsa', () => {
    expect(num(det(PRESETS.proyeccion))).toBe('0,00');
    expect(orientacion(PRESETS.proyeccion)).toBe('colapsa');
  });
  it('rotacion-90: área |det| = 1,00, se mantiene, y gira (1; 1) a (−1; 1)', () => {
    expect(num(Math.abs(det(PRESETS['rotacion-90'])))).toBe('1,00');
    expect(orientacion(PRESETS['rotacion-90'])).toBe('se mantiene');
    expect(aplicar(PRESETS['rotacion-90'], [1, 1])).toEqual([-1, 1]);
  });
  it('reflexion: la orientación se invierte (det −1)', () => {
    expect(det(PRESETS.reflexion)).toBe(-1);
    expect(orientacion(PRESETS.reflexion)).toBe('se invierte');
  });
  it('escala y cizalla: determinantes 1 y 1; identidad se mantiene', () => {
    expect(det(PRESETS.escala)).toBe(1);
    expect(det(PRESETS.cizalla)).toBe(1);
    expect(orientacion(PRESETS.identidad)).toBe('se mantiene');
  });
  it('un determinante que se lee 0,00 cuenta como colapsa: texto y número no se contradicen', () => {
    const casi: Matriz = [[1, 0], [0, 0.004]];
    expect(num(det(casi))).toBe('0,00');
    expect(orientacion(casi)).toBe('colapsa');
    expect(orientacion([[1, 0], [0, 0.006]])).toBe('se mantiene');
  });
});

describe('SimTransformacion2D · autovectores', () => {
  it('escala: autovalores 2 y 0,5, y un v sobre el eje x queda sobre el eje x', () => {
    const e = autovectores(PRESETS.escala);
    expect(e.tipo).toBe('reales');
    if (e.tipo !== 'reales') return;
    expect(e.valores).toEqual([2, 0.5]);
    expect(e.rectas).toHaveLength(2);
    const av = aplicar(PRESETS.escala, [1, 0]);
    expect(av).toEqual([2, 0]);
    const r2 = e.rectas.find((r) => r.valor === 2)!;
    expect(Math.abs(r2.direccion[1])).toBeCloseTo(0, 12);
  });
  it('rotacion-90: autovalores complejos', () => {
    expect(autovectores(PRESETS['rotacion-90']).tipo).toBe('complejos');
  });
  it('cizalla: una sola recta (el eje x), autovalor doble 1', () => {
    const e = autovectores(PRESETS.cizalla);
    expect(e.tipo === 'reales' && e.rectas).toHaveLength(1);
    if (e.tipo === 'reales') {
      expect(e.valores).toEqual([1, 1]);
      expect(Math.abs(e.rectas[0]!.direccion[1])).toBeCloseTo(0, 12);
    }
  });
  it('identidad: todo vector es autovector (escalar) y reflexion: autovalores 1 y −1', () => {
    const i = autovectores(PRESETS.identidad);
    expect(i.tipo === 'reales' && i.escalar).toBe(true);
    const r = autovectores(PRESETS.reflexion);
    expect(r.tipo === 'reales' && r.valores).toEqual([1, -1]);
  });
  it('cada recta cumple A·d = λ·d para matrices cualesquiera con autovalores reales', () => {
    for (const m of [[[3, 1], [0, 2]], [[2, 1], [1, 2]], [[-1, 2], [3, 0.5]], PRESETS.proyeccion] as Matriz[]) {
      const e = autovectores(m);
      if (e.tipo !== 'reales') continue;
      for (const r of e.rectas) {
        const ad = aplicar(m, r.direccion);
        expect(ad[0]).toBeCloseTo(r.valor * r.direccion[0], 9);
        expect(ad[1]).toBeCloseTo(r.valor * r.direccion[1], 9);
      }
    }
  });
});

describe('SimTransformacion2D · utilidades', () => {
  it('presetDe reconoce un preset y devuelve null para una matriz editada', () => {
    expect(presetDe(copiar(PRESETS.escala))).toBe('escala');
    expect(presetDe([[2, 0], [0, 0.6]])).toBeNull();
    expect(iguales(PRESETS.escala, copiar(PRESETS.escala))).toBe(true);
  });
  it('mezclar interpola entre dos matrices (animación entre presets)', () => {
    expect(mezclar(PRESETS.identidad, PRESETS.escala, 0)).toEqual(PRESETS.identidad);
    expect(mezclar(PRESETS.identidad, PRESETS.escala, 1)).toEqual(PRESETS.escala);
    expect(mezclar(PRESETS.identidad, PRESETS.escala, 0.5)).toEqual([[1.5, 0], [0, 0.75]]);
  });
  it('copiar no comparte filas con el original', () => {
    const c = copiar(PRESETS.identidad);
    c[0][0] = 9;
    expect(PRESETS.identidad[0][0]).toBe(1);
  });
});
