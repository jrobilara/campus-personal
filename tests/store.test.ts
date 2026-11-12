// store.ts contra un idb-keyval falso: escrituras sobre datos dañados y carreras entre lectura y escritura.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const bd = new Map<string, unknown>();
const ctl = { falla: false, retrasoLectura: null as null | Promise<void> };

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (k: string) => {
    if (ctl.falla) throw new Error('IndexedDB bloqueado');
    const v = structuredClone(bd.get(k));
    if (ctl.retrasoLectura) await ctl.retrasoLectura;
    return v;
  }),
  set: vi.fn(async (k: string, v: unknown) => { bd.set(k, structuredClone(v)); }),
  del: vi.fn(async (k: string) => { bd.delete(k); }),
  update: vi.fn(async (k: string, fn: (v: unknown) => unknown) => { bd.set(k, structuredClone(fn(structuredClone(bd.get(k))))); }),
}));

import { CLAVE_PROGRESO, CLAVE_PROGRESO_DANADO } from '../src/progreso/importar';
import { leerProgreso, mutar, recargar, registrarEjercicio } from '../src/progreso/store';

const ID = 'analisis-datos/limpieza-y-eda#e-uno';

beforeEach(() => { bd.clear(); ctl.falla = false; ctl.retrasoLectura = null; });

describe('store', () => {
  it('antes de escribir sobre un progreso guardado que no pasa el esquema, deja una copia aparte', async () => {
    const danado = { app: 'campus-personal', version: 1, tarjetas: 'roto' };
    bd.set(CLAVE_PROGRESO, danado);
    await registrarEjercicio(ID, true);
    expect(bd.get(CLAVE_PROGRESO_DANADO)).toEqual(danado);
    expect((bd.get(CLAVE_PROGRESO) as { ejercicios: object }).ejercicios).toHaveProperty(ID);
  });

  it('no crea copia si lo guardado es válido o no hay nada', async () => {
    await registrarEjercicio(ID, true);
    await registrarEjercicio(ID, false);
    expect(bd.has(CLAVE_PROGRESO_DANADO)).toBe(false);
  });

  it('si IndexedDB falla al leer, recargar no se rechaza (las islas no se quedan cargando para siempre)', async () => {
    ctl.falla = true;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(recargar()).resolves.toHaveProperty('app', 'campus-personal'); // conserva la caché que ya tenía
    warn.mockRestore();
  });

  it('una lectura que arrancó antes de una escritura no pisa la caché con datos viejos', async () => {
    await mutar((p) => p); // caché inicial
    let soltar!: () => void;
    ctl.retrasoLectura = new Promise<void>((r) => { soltar = r; });
    const lectura = recargar(); // lee el estado viejo (vacío) y queda esperando
    ctl.retrasoLectura = null;
    await registrarEjercicio(ID, true);
    soltar();
    await lectura;
    expect((await leerProgreso()).ejercicios).toHaveProperty(ID);
  });
});
