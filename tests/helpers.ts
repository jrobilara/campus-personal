// Carga el ejemplo (y las áreas) desde el disco, como lo haría la app, para armar fixtures por mutación.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { esquemaArea, esquemaPractica, esquemaTema, type Area, type Practica, type TemaFrontmatter } from '../src/contenido/esquemas';
import type { EntradaPractica, EntradaTema } from '../src/contenido/integridad';

const RAIZ = resolve(import.meta.dirname, 'fixtures/contenido');

export function separarFrontmatter(mdx: string): { frontmatter: unknown; cuerpo: string } {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(mdx.replace(/\r\n?/g, '\n'));
  if (!m) throw new Error('el .mdx no tiene frontmatter');
  return { frontmatter: parse(m[1]!), cuerpo: m[2]! };
}

export const leerBase = (nombre: 'tema.mdx' | 'practica.yaml') => readFileSync(resolve(RAIZ, 'base', nombre), 'utf8');

export function cargarAreas(): Area[] {
  return (parse(readFileSync(resolve(RAIZ, 'areas.yaml'), 'utf8')) as unknown[]).map((a) => esquemaArea.parse(a));
}
export function frontmatterBase(): TemaFrontmatter {
  return esquemaTema.parse(separarFrontmatter(leerBase('tema.mdx')).frontmatter);
}
export function practicaBase(): Practica {
  return esquemaPractica.parse(parse(leerBase('practica.yaml')));
}
export function cuerpoBase(): string {
  return separarFrontmatter(leerBase('tema.mdx')).cuerpo;
}

/** Un tema real (no ejemplo) armado a partir del ejemplo, con otro id/área/orden. */
export function temaReal(id: string, cambios: { orden?: number; cuerpo?: string; data?: Partial<TemaFrontmatter>; practica?: Partial<Practica> } = {}) {
  const [area] = id.split('/') as [string];
  const tema: EntradaTema = {
    id,
    archivo: `src/content/temas/${id}/tema.mdx`,
    data: { ...structuredClone(frontmatterBase()), area, orden: cambios.orden ?? 1, ejemplo: false, ...cambios.data },
    cuerpo: cambios.cuerpo ?? cuerpoBase(),
  };
  const practica: EntradaPractica = {
    id,
    archivo: `src/content/temas/${id}/practica.yaml`,
    data: { ...structuredClone(practicaBase()), ...cambios.practica },
  };
  return { tema, practica };
}

/** El tema de ejemplo, tal cual está en el contrato. */
export function temaEjemplo() {
  const id = 'ejemplo/media-y-mediana';
  return {
    tema: { id, archivo: `src/content/temas/${id}/tema.mdx`, data: frontmatterBase(), cuerpo: cuerpoBase() } satisfies EntradaTema,
    practica: { id, archivo: `src/content/temas/${id}/practica.yaml`, data: practicaBase() } satisfies EntradaPractica,
  };
}

/** Rutas (path) de los issues de un safeParse fallido, p. ej. "tarjetas" o "casos.0.nodos". */
export function rutasDeError(r: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }): string[] {
  return (r.error?.issues ?? []).map((i) => i.path.map(String).join('.'));
}
