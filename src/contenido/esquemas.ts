// src/contenido/esquemas.ts — copiado del CONTRATO-CONTENIDO.md §3.1. No editar sin cambiar el contrato.
import { z } from 'astro/zod';

// ---------- Básicos ----------
export const RE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RE_TEMA_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RE_HTTPS = /^https:\/\/\S+$/;

const texto = z.string().trim().min(1, 'no puede estar vacío');
const slug = z
  .string()
  .max(40, 'máximo 40 caracteres')
  .regex(RE_SLUG, 'tiene que ser kebab-case sin tildes (a-z, 0-9 y guiones)');
const url = z.string().regex(RE_HTTPS, 'tiene que ser una URL que empiece con https://');
const idLocal = (prefijo: 't' | 'e' | 'c' | 'p') =>
  z
    .string()
    .max(60, 'máximo 60 caracteres')
    .regex(
      new RegExp(`^${prefijo}-[a-z0-9]+(?:-[a-z0-9]+)*$`),
      `el id tiene que empezar con "${prefijo}-" y seguir en kebab-case sin tildes`,
    );
const nivel = z.enum(['basico', 'intermedio', 'avanzado']);

// ---------- Áreas (src/content/areas.yaml) ----------
export const esquemaArea = z.object({
  id: slug,
  nombre: texto.max(40),
  orden: z.number().int().min(1),
  color: z.string().regex(/^#[0-9a-f]{6}$/, 'color en hex minúscula, ej. "#2563eb"'),
  colorOscuro: z.string().regex(/^#[0-9a-f]{6}$/, 'color en hex minúscula, ej. "#60a5fa"'),
  icono: z.enum(['barras', 'capas', 'servidor', 'funcion', 'campana', 'auricular']),
  descripcion: texto.max(200),
  exigeCasoDeGuardia: z.boolean(),
});
export type Area = z.infer<typeof esquemaArea>;

// ---------- Fuentes (frontmatter del tema) ----------
const baseFuente = {
  id: z
    .string()
    .max(30, 'máximo 30 caracteres')
    .regex(RE_SLUG, 'id de fuente en kebab-case, ej. "ross" o "itil4-incidentes"'),
  autor: texto, // persona(s) u organización: "Sheldon M. Ross", "Axelos", "MIT OpenCourseWare"
  titulo: texto,
};
const fuenteLibro = z.object({
  ...baseFuente,
  tipo: z.literal('libro'),
  edicion: texto, // "6.ª ed., 2021"
  editorial: texto.optional(),
  ubicacion: texto, // capítulo/sección: "cap. 2, §2.3"
  url: url.optional(),
  verMas: z.boolean().default(false),
});
const fuenteDocOficial = z.object({
  ...baseFuente,
  tipo: z.literal('doc-oficial'),
  url,
  ubicacion: texto.optional(), // sección o página dentro de la doc
  edicion: texto.optional(), // versión o año: "systemd 257", "ITIL 4, 2019"
  verMas: z.boolean().default(false),
});
const fuenteCursoAbierto = z.object({
  ...baseFuente,
  tipo: z.literal('curso-abierto'),
  url,
  ubicacion: texto.optional(), // "Lecture 12", "Unidad 3"
  edicion: texto.optional(), // "Fall 2010"
  verMas: z.boolean().default(false),
});
// Artículo o paper (revista, conferencia, RFC académico): fuente válida, con DOI o URL si existe.
const fuenteArticulo = z.object({
  ...baseFuente,
  tipo: z.literal('articulo'),
  edicion: texto, // revista, volumen y año: "Communications of the ACM 56(2), 2013"
  ubicacion: texto.optional(), // sección o páginas
  url: url.optional(),
  verMas: z.boolean().default(false),
});
const verMasObligatorio = z.literal(true, {
  error: 'videos y blogs solo pueden ir como "para ver más": poné verMas: true',
});
const fuenteVideo = z.object({
  ...baseFuente,
  tipo: z.literal('video'),
  url,
  edicion: texto.optional(),
  ubicacion: texto.optional(),
  verMas: verMasObligatorio,
});
const fuenteBlog = z.object({
  ...baseFuente,
  tipo: z.literal('blog'),
  url,
  edicion: texto.optional(),
  ubicacion: texto.optional(),
  verMas: verMasObligatorio,
});
export const esquemaFuente = z.discriminatedUnion('tipo', [
  fuenteLibro,
  fuenteDocOficial,
  fuenteCursoAbierto,
  fuenteArticulo,
  fuenteVideo,
  fuenteBlog,
]);
export type Fuente = z.infer<typeof esquemaFuente>;

// ---------- Materias UNLaM de anclaje ----------
export const esquemaMateria = z.object({
  carrera: z.enum(['ing-informatica', 'lic-gestion-tecnologia']),
  codigo: z.string().regex(/^\d{4}$/, 'código de materia de 4 dígitos, ej. "3651"'),
  nombre: texto,
});

// ---------- Frontmatter del tema (tema.mdx) ----------
export const esquemaTema = z
  .object({
    titulo: texto.max(80),
    area: slug,
    orden: z.number().int().min(1).max(99),
    resumen: texto.min(40, 'el resumen tiene que tener al menos 40 caracteres').max(240),
    materias: z.array(esquemaMateria).min(1, 'poné al menos una materia UNLaM de anclaje'),
    prerrequisitos: z
      .array(z.string().regex(RE_TEMA_ID, 'prerrequisito con forma "<area>/<slug>"'))
      .default([]),
    nivel,
    minutos: z.number().int().min(5).max(90),
    fuentes: z.array(esquemaFuente).min(2),
    fechaVerificacion: z.coerce.date(),
    ejemplo: z.boolean().default(false),
  })
  .superRefine((t, ctx) => {
    const principales = t.fuentes.filter((f) => !f.verMas);
    if (principales.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['fuentes'],
        message: `hacen falta ≥2 fuentes que no sean "para ver más" (hay ${principales.length})`,
      });
    }
    const vistos = new Set<string>();
    t.fuentes.forEach((f, i) => {
      if (vistos.has(f.id)) {
        ctx.addIssue({ code: 'custom', path: ['fuentes', i, 'id'], message: `id de fuente repetido: "${f.id}"` });
      }
      vistos.add(f.id);
    });
  });
export type TemaFrontmatter = z.infer<typeof esquemaTema>;

// ---------- Práctica (practica.yaml) ----------
const refFuente = z.string().regex(RE_SLUG, 'id de una fuente del frontmatter');

export const esquemaTarjeta = z.object({
  id: idLocal('t'),
  frente: texto.max(200),
  dorso: texto.max(400),
  fuente: refFuente.optional(),
});

const ejercicioNumerico = z.object({
  id: idLocal('e'),
  tipo: z.literal('numerico'),
  enunciado: texto,
  respuesta: z.number(),
  tolerancia: z.object({
    absoluta: z.number().nonnegative().optional(),
    relativa: z.number().min(0).max(0.5).optional(), // 0.02 = ±2 %
  }),
  unidad: z.string().max(20), // "ms", "%", "GB", "" si es adimensional
  explicacion: texto, // la resolución correcta, paso a paso
  erroresComunes: z
    .array(z.object({ valor: z.number(), explicacion: texto }))
    .default([]),
  fuente: refFuente.optional(),
});
const ejercicioOpcionMultiple = z.object({
  id: idLocal('e'),
  tipo: z.literal('opcion-multiple'),
  enunciado: texto,
  opciones: z
    .array(z.object({ texto: texto.max(200), correcta: z.boolean().default(false), explicacion: texto }))
    .min(3, 'mínimo 3 opciones')
    .max(5, 'máximo 5 opciones'),
  fuente: refFuente.optional(),
});
const ejercicioVerdaderoFalso = z.object({
  id: idLocal('e'),
  tipo: z.literal('verdadero-falso'),
  enunciado: texto, // una afirmación
  respuesta: z.boolean(),
  justificacion: texto,
  fuente: refFuente.optional(),
});
export const esquemaEjercicio = z.discriminatedUnion('tipo', [
  ejercicioNumerico,
  ejercicioOpcionMultiple,
  ejercicioVerdaderoFalso,
]);
export type Ejercicio = z.infer<typeof esquemaEjercicio>;

const idNodo = z.string().max(40).regex(RE_SLUG, 'id de nodo en kebab-case');
const nodoDecision = z.object({
  id: idNodo,
  tipo: z.literal('decision'),
  texto, // qué está pasando ahora y qué hay que decidir
  opciones: z
    .array(z.object({ texto: texto.max(160), va: idNodo, consecuencia: texto }))
    .min(2, 'una decisión necesita al menos 2 opciones')
    .max(4, 'máximo 4 opciones por decisión'),
});
const nodoDesenlace = z.object({
  id: idNodo,
  tipo: z.literal('desenlace'),
  resultado: z.enum(['bien', 'regular', 'mal']),
  texto, // cómo terminó la guardia
});
export const esquemaCaso = z.object({
  id: idLocal('c'),
  titulo: texto.max(80),
  rol: texto.max(160), // "Sos el de guardia de la API de pagos un viernes a la noche."
  contexto: texto, // la situación inicial
  inicio: idNodo,
  nodos: z.array(z.discriminatedUnion('tipo', [nodoDecision, nodoDesenlace])).min(4),
  leccion: texto, // la idea que queda, en 1-3 oraciones
  fuente: refFuente.optional(),
});
export type Caso = z.infer<typeof esquemaCaso>;

export const esquemaProblema = z.object({
  id: idLocal('p'),
  enunciado: texto,
  fuente: refFuente, // id de una fuente del frontmatter (libro, doc oficial o curso abierto)
  ubicacion: texto, // "cap. 5, problema 12", "Problem Set 3, ej. 2", "sección 4.2"
  url: url.optional(),
  dificultad: nivel,
});

export const esquemaPractica = z
  .object({
    tarjetas: z.array(esquemaTarjeta).min(6, 'cada tema necesita ≥6 tarjetas'),
    ejercicios: z.array(esquemaEjercicio).min(3, 'cada tema necesita ≥3 ejercicios'),
    casos: z.array(esquemaCaso).default([]),
    problemas: z.array(esquemaProblema).min(2, 'cada tema necesita ≥2 problemas recomendados'),
  })
  .superRefine((p, ctx) => {
    // 1. ids únicos dentro del tema (tarjetas, ejercicios, casos y problemas juntos)
    const ids = new Map<string, string>();
    const anotar = (id: string, path: (string | number)[]) => {
      if (ids.has(id)) ctx.addIssue({ code: 'custom', path, message: `id repetido "${id}" (ya está en ${ids.get(id)})` });
      else ids.set(id, path.join('.'));
    };
    p.tarjetas.forEach((t, i) => anotar(t.id, ['tarjetas', i, 'id']));
    p.ejercicios.forEach((e, i) => anotar(e.id, ['ejercicios', i, 'id']));
    p.casos.forEach((c, i) => anotar(c.id, ['casos', i, 'id']));
    p.problemas.forEach((q, i) => anotar(q.id, ['problemas', i, 'id']));

    // 2. ejercicios: ≥2 tipos distintos; reglas por tipo
    if (new Set(p.ejercicios.map((e) => e.tipo)).size < 2) {
      ctx.addIssue({ code: 'custom', path: ['ejercicios'], message: 'usá al menos 2 tipos de ejercicio distintos' });
    }
    p.ejercicios.forEach((e, i) => {
      if (e.tipo === 'opcion-multiple') {
        const correctas = e.opciones.filter((o) => o.correcta).length;
        if (correctas !== 1) {
          ctx.addIssue({ code: 'custom', path: ['ejercicios', i, 'opciones'], message: `tiene que haber exactamente 1 opción correcta (hay ${correctas})` });
        }
      }
      if (e.tipo === 'numerico' && e.tolerancia.absoluta === undefined && e.tolerancia.relativa === undefined) {
        ctx.addIssue({ code: 'custom', path: ['ejercicios', i, 'tolerancia'], message: 'poné tolerancia.absoluta, tolerancia.relativa o las dos' });
      }
    });

    // 3. casos de guardia: grafo bien formado
    p.casos.forEach((c, i) => {
      const base = ['casos', i];
      const porId = new Map(c.nodos.map((n) => [n.id, n]));
      if (porId.size !== c.nodos.length) ctx.addIssue({ code: 'custom', path: [...base, 'nodos'], message: 'hay ids de nodo repetidos' });
      const inicio = porId.get(c.inicio);
      if (!inicio) {
        ctx.addIssue({ code: 'custom', path: [...base, 'inicio'], message: `el nodo de inicio "${c.inicio}" no existe` });
        return;
      }
      if (inicio.tipo !== 'decision') ctx.addIssue({ code: 'custom', path: [...base, 'inicio'], message: 'el caso tiene que arrancar con una decisión' });
      c.nodos.forEach((n, j) => {
        if (n.tipo === 'decision') n.opciones.forEach((o, k) => {
          if (!porId.has(o.va)) ctx.addIssue({ code: 'custom', path: [...base, 'nodos', j, 'opciones', k, 'va'], message: `la opción apunta a un nodo que no existe: "${o.va}"` });
        });
      });
      // alcanzables y sin ciclos (DFS con colores)
      const estado = new Map<string, 0 | 1 | 2>();
      let ciclo = false;
      const visitar = (id: string) => {
        const n = porId.get(id);
        if (!n) return;
        if (estado.get(id) === 1) { ciclo = true; return; }
        if (estado.get(id) === 2) return;
        estado.set(id, 1);
        if (n.tipo === 'decision') n.opciones.forEach((o) => visitar(o.va));
        estado.set(id, 2);
      };
      visitar(c.inicio);
      if (ciclo) ctx.addIssue({ code: 'custom', path: [...base, 'nodos'], message: 'el caso tiene un ciclo: toda decisión tiene que avanzar hacia un desenlace' });
      c.nodos.forEach((n, j) => {
        if (!estado.has(n.id)) ctx.addIssue({ code: 'custom', path: [...base, 'nodos', j], message: `el nodo "${n.id}" no se alcanza desde el inicio` });
      });
      const decisiones = c.nodos.filter((n) => n.tipo === 'decision').length;
      const desenlaces = c.nodos.filter((n) => n.tipo === 'desenlace');
      if (decisiones < 2) ctx.addIssue({ code: 'custom', path: [...base, 'nodos'], message: 'un caso necesita ≥2 nodos de decisión' });
      if (desenlaces.length < 2) ctx.addIssue({ code: 'custom', path: [...base, 'nodos'], message: 'un caso necesita ≥2 desenlaces' });
      if (!desenlaces.some((d) => d.tipo === 'desenlace' && d.resultado === 'bien')) {
        ctx.addIssue({ code: 'custom', path: [...base, 'nodos'], message: 'un caso necesita ≥1 desenlace con resultado "bien"' });
      }
    });
  });
export type Practica = z.infer<typeof esquemaPractica>;
