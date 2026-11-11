// src/contenido/campus.ts — cargarCampus(): lee las colecciones y corre la integridad (CONTRATO §4).
import { getCollection, type CollectionEntry } from 'astro:content';
import { formatearProblema, verificarIntegridad, type Problema } from './integridad';
import { NOMBRES_SIMULADORES } from '../simuladores/props';
import type { Area, Practica, TemaFrontmatter } from './esquemas';

export interface TemaCargado {
  /** `<area>/<slug>` (también la ruta de la página) */
  id: string;
  area: string;
  slug: string;
  archivo: string;
  data: TemaFrontmatter;
  /** entrada de la colección, para `render(entry)` */
  entry: CollectionEntry<'temas'>;
  practica: Practica;
  archivoPractica: string;
}
export interface Campus {
  areas: Area[];
  /** todos los temas, ejemplo incluido */
  todosLosTemas: TemaCargado[];
  /** temas reales (sin ejemplo), salvo CAMPUS_INCLUIR_EJEMPLO=1 que suma el ejemplo (regla I14) */
  temas: TemaCargado[];
  ejemplo: TemaCargado | undefined;
  avisos: Problema[];
  estricto: boolean;
}

let memo: Promise<Campus> | undefined;

export function cargarCampus(): Promise<Campus> {
  memo ??= construir();
  return memo;
}

async function construir(): Promise<Campus> {
  const [areasRaw, temasRaw, practicasRaw] = await Promise.all([
    getCollection('areas'),
    getCollection('temas'),
    getCollection('practicas'),
  ]);
  const estricto = process.env.CAMPUS_ESTRICTO === '1';
  const incluirEjemplo = process.env.CAMPUS_INCLUIR_EJEMPLO === '1';

  const areas = areasRaw.map((a) => a.data).sort((a, b) => a.orden - b.orden);
  const entradasTema = temasRaw.map((t) => ({
    id: t.id,
    archivo: t.filePath ?? `src/content/temas/${t.id}/tema.mdx`,
    data: t.data,
    cuerpo: t.body ?? '',
  }));
  const entradasPractica = practicasRaw.map((p) => ({
    id: p.id,
    archivo: p.filePath ?? `src/content/temas/${p.id}/practica.yaml`,
    data: p.data,
  }));

  const problemas = verificarIntegridad(areas, entradasTema, entradasPractica, {
    estricto,
    simuladores: NOMBRES_SIMULADORES,
  });
  const avisos = problemas.filter((p) => p.severidad === 'aviso');
  const errores = problemas.filter((p) => p.severidad === 'error');
  avisos.forEach((p) => console.warn(formatearProblema(p)));
  if (errores.length > 0) {
    throw new Error(
      `El contenido no cumple el contrato (${errores.length} ${errores.length === 1 ? 'error' : 'errores'}):\n` +
        errores.map(formatearProblema).join('\n'),
    );
  }

  const practicaPorId = new Map(practicasRaw.map((p) => [p.id, p]));
  const todosLosTemas: TemaCargado[] = temasRaw
    .map((entry) => {
      const p = practicaPorId.get(entry.id)!; // I1 garantiza el par
      const slug = entry.id.split('/')[1]!;
      return {
        id: entry.id,
        area: entry.data.area,
        slug,
        archivo: entry.filePath ?? '',
        data: entry.data,
        entry,
        practica: p.data,
        archivoPractica: p.filePath ?? '',
      };
    })
    .sort((a, b) => a.data.orden - b.data.orden);

  return {
    areas,
    todosLosTemas,
    temas: todosLosTemas.filter((t) => incluirEjemplo || !t.data.ejemplo),
    ejemplo: todosLosTemas.find((t) => t.data.ejemplo),
    avisos,
    estricto,
  };
}
