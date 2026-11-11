// Exportar, importar (reemplazo, no merge), deshacer, limpiar huérfanos y reiniciar (PROGRESO-JSON.md §4).
// Todo contra la interfaz `Almacen`: en producción idb-keyval, en Vitest un Map en memoria.
import { esquemaProgresoV1, progresoVacio, VERSION_ACTUAL, type ProgresoV1 } from './esquema';
import type { Catalogo } from './tipos';

export const CLAVE_PROGRESO = 'campus:progreso';
export const CLAVE_ANTES = 'campus:progreso-antes-de-importar';

export interface Almacen {
  leer(clave: string): Promise<unknown>;
  escribir(clave: string, valor: unknown): Promise<void>;
  borrar(clave: string): Promise<void>;
}

/** Almacén en memoria (tests). */
export function almacenEnMemoria(inicial: Record<string, unknown> = {}): Almacen & { datos: Map<string, unknown> } {
  const datos = new Map<string, unknown>(Object.entries(inicial));
  return {
    datos,
    leer: async (c) => (datos.has(c) ? structuredClone(datos.get(c)) : undefined),
    escribir: async (c, v) => { datos.set(c, structuredClone(v)); },
    borrar: async (c) => { datos.delete(c); },
  };
}

/** Lee el progreso guardado; si no hay o está dañado, devuelve uno vacío. */
export async function leerProgresoDe(almacen: Almacen): Promise<ProgresoV1> {
  const crudo = await almacen.leer(CLAVE_PROGRESO);
  if (crudo === undefined) return progresoVacio();
  const r = esquemaProgresoV1.safeParse(crudo);
  return r.success ? r.data : progresoVacio();
}

export function exportarProgreso(p: ProgresoV1, ahora: Date): { nombre: string; texto: string } {
  const d = ahora;
  const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { nombre: `campus-progreso-${dia}.json`, texto: JSON.stringify({ ...p, exportadoEn: ahora.toISOString() }, null, 2) };
}

type MigracionDe = (x: Record<string, unknown>) => Record<string, unknown>;
/** Migraciones migrarDeV<n>, en orden. En v1 no hay ninguna. */
export const MIGRACIONES: Record<number, MigracionDe> = {};

export interface ResumenImport {
  tarjetas: number;
  dias: number;
  exportadoEn: string | null;
  huerfanos: number;
}
export type Analisis = { ok: true; progreso: ProgresoV1; resumen: ResumenImport } | { ok: false; error: string };

/** Pasos 1 a 4 de §4.2: no escribe nada. */
export function analizarImport(texto: string, catalogo?: Catalogo): Analisis {
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' };
  }
  if (typeof crudo !== 'object' || crudo === null || (crudo as { app?: unknown }).app !== 'campus-personal') {
    return { ok: false, error: 'Este archivo no es un progreso del campus.' };
  }
  let obj = crudo as Record<string, unknown>;
  const v = obj.version;
  if (typeof v === 'number' && v > VERSION_ACTUAL) {
    return { ok: false, error: `El archivo es de una versión más nueva de la app (v${v}). Actualizá la página e intentá de nuevo.` };
  }
  if (typeof v === 'number' && v < VERSION_ACTUAL) {
    for (let n = v; n < VERSION_ACTUAL; n++) {
      const m = MIGRACIONES[n];
      if (!m) return { ok: false, error: `No sé migrar un archivo de la versión v${n}.` };
      obj = m(obj);
    }
  }
  const r = esquemaProgresoV1.safeParse(obj);
  if (!r.success) {
    const problemas = r.error.issues.slice(0, 5).map((i) => `${i.path.join('.') || '(archivo)'}: ${i.message}`);
    return { ok: false, error: `El archivo tiene datos inválidos:\n${problemas.join('\n')}` };
  }
  return { ok: true, progreso: r.data, resumen: resumir(r.data, catalogo) };
}

export function resumir(p: ProgresoV1, catalogo?: Catalogo): ResumenImport {
  return { tarjetas: Object.keys(p.tarjetas).length, dias: Object.keys(p.diasDeEstudio).length, exportadoEn: p.exportadoEn, huerfanos: catalogo ? contarHuerfanos(p, catalogo) : 0 };
}

/** Paso 6: guarda una copia del progreso actual y después escribe el importado (con exportadoEn: null). */
export async function confirmarImport(progreso: ProgresoV1, almacen: Almacen): Promise<void> {
  const actual = await almacen.leer(CLAVE_PROGRESO);
  if (actual !== undefined) await almacen.escribir(CLAVE_ANTES, actual);
  else await almacen.borrar(CLAVE_ANTES);
  await almacen.escribir(CLAVE_PROGRESO, { ...progreso, exportadoEn: null });
}

/** Análisis + confirmación en un paso (lo usan los tests). Si el análisis falla, el almacén no se toca. */
export async function importarProgreso(texto: string, almacen: Almacen, _ahora: Date, catalogo?: Catalogo): Promise<Analisis> {
  const a = analizarImport(texto, catalogo);
  if (a.ok) await confirmarImport(a.progreso, almacen);
  return a;
}

export async function hayCopiaPrevia(almacen: Almacen): Promise<boolean> {
  return (await almacen.leer(CLAVE_ANTES)) !== undefined;
}
export async function deshacerImportacion(almacen: Almacen): Promise<boolean> {
  const copia = await almacen.leer(CLAVE_ANTES);
  if (copia === undefined) return false;
  await almacen.escribir(CLAVE_PROGRESO, copia);
  await almacen.borrar(CLAVE_ANTES);
  return true;
}
export async function reiniciarProgreso(almacen: Almacen): Promise<void> {
  await almacen.borrar(CLAVE_PROGRESO);
  await almacen.borrar(CLAVE_ANTES);
}

function idsDelCatalogo(c: Catalogo) {
  return {
    tarjetas: new Set(c.tarjetas.map((t) => t.id)),
    ejercicios: new Set(c.ejercicios.map((t) => t.id)),
    casos: new Set(c.casos.map((t) => t.id)),
  };
}
export function contarHuerfanos(p: ProgresoV1, c: Catalogo): number {
  const ids = idsDelCatalogo(c);
  return (
    Object.keys(p.tarjetas).filter((k) => !ids.tarjetas.has(k)).length +
    Object.keys(p.ejercicios).filter((k) => !ids.ejercicios.has(k)).length +
    Object.keys(p.casos).filter((k) => !ids.casos.has(k)).length
  );
}
export function limpiarHuerfanos(p: ProgresoV1, c: Catalogo): ProgresoV1 {
  const ids = idsDelCatalogo(c);
  const filtrar = <T,>(o: Record<string, T>, ok: Set<string>) => Object.fromEntries(Object.entries(o).filter(([k]) => ok.has(k)));
  return {
    ...p,
    tarjetas: filtrar(p.tarjetas, ids.tarjetas),
    revlog: p.revlog.filter((r) => ids.tarjetas.has(r.tarjeta)),
    ejercicios: filtrar(p.ejercicios, ids.ejercicios),
    casos: filtrar(p.casos, ids.casos),
  };
}
