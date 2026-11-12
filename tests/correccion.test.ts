import { describe, expect, it } from 'vitest';
import { corregirNumerico, dentroDeTolerancia, parsearNumero } from '../src/lib/correccion';

describe('parsearNumero', () => {
  it('acepta coma o punto, espacios y menos tipográfico', () => {
    expect(parsearNumero('12,5')).toBe(12.5);
    expect(parsearNumero(' 12.5 ')).toBe(12.5);
    expect(parsearNumero('−3')).toBe(-3);
    expect(parsearNumero('+7')).toBe(7);
    expect(parsearNumero('.5')).toBe(0.5);
    expect(parsearNumero('1 000')).toBe(1000);
  });
  it('rechaza lo que no es un número', () => {
    for (const t of ['', 'abc', '1,2,3', '12ms', '1e5', '--1', 'NaN', 'Infinity']) expect(parsearNumero(t), t).toBeNull();
  });
});

describe('tolerancia (CONTRATO §8.3)', () => {
  it('absoluta, relativa, y alcanza con cumplir una de las dos', () => {
    expect(dentroDeTolerancia(502.5, 502, { absoluta: 0.5 })).toBe(true);
    expect(dentroDeTolerancia(502.6, 502, { absoluta: 0.5 })).toBe(false);
    expect(dentroDeTolerancia(510, 500, { relativa: 0.02 })).toBe(true);
    expect(dentroDeTolerancia(511, 500, { relativa: 0.02 })).toBe(false);
    expect(dentroDeTolerancia(511, 500, { absoluta: 0.1, relativa: 0.05 })).toBe(true);
    expect(dentroDeTolerancia(0.1 + 0.2, 0.3, { absoluta: 0 })).toBe(true); // sin falsos errores por punto flotante
  });
});

describe('corregirNumerico', () => {
  const ej = { respuesta: 502, tolerancia: { absoluta: 0.5 }, erroresComunes: [{ valor: 130 }, { valor: 627.5 }] };
  it('ok, error, error común y entrada inválida', () => {
    expect(corregirNumerico('502', ej)).toEqual({ estado: 'ok', valor: 502 });
    expect(corregirNumerico('502,4', ej).estado).toBe('ok');
    expect(corregirNumerico('600', ej)).toEqual({ estado: 'error', valor: 600, errorComun: undefined });
    expect(corregirNumerico('130', ej)).toEqual({ estado: 'error', valor: 130, errorComun: 0 });
    expect(corregirNumerico('627,5', ej)).toMatchObject({ errorComun: 1 });
    expect(corregirNumerico('mucho', ej)).toEqual({ estado: 'invalido' });
  });
});
