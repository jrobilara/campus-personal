# CONTRATO DE CONTENIDO — campus-personal v1

> Autoridad: `docs/modulos/v1/SPEC.md` (READY). Este documento es el contrato entre F2 (constructor de la app) y F3 (escritores de contenido). Ninguno ve al otro: lo que no está acá, no existe. Si algo de acá choca con el SPEC, manda el SPEC y se avisa al director.
>
> Documentos hermanos: `GUIA-ESTILO.md` (cómo se escribe), `SIMULADORES.md` (catálogo de simuladores y sus props), `PROGRESO-JSON.md` (progreso en el navegador), `BRIEF-ESCRITORES.md`, `BRIEF-CONSTRUCTOR.md`.

---

## 1. Estructura de carpetas

```
src/
  content.config.ts                  ← F2. Define las 3 colecciones (copia la sección 3).
  contenido/
    esquemas.ts                      ← F2. Los esquemas Zod de la sección 3, tal cual.
    integridad.ts                    ← F2. Las reglas cruzadas de la sección 4.
    campus.ts                        ← F2. cargarCampus(): lee colecciones + corre integridad.
  content/
    areas.yaml                       ← F2 lo crea (sección 2). Los escritores NO lo tocan.
    temas/
      ejemplo/                       ← F2. El tema de ejemplo (sección 9). Nadie más lo toca.
        media-y-mediana/
          tema.mdx
          practica.yaml
      analisis-datos/                ← escritor de Análisis de datos (solo él)
        limpieza-y-eda/
          tema.mdx
          practica.yaml
        elegir-el-grafico/ …
      arquitecturas/                 ← escritor de Arquitecturas
      servidores/                    ← escritor de Servidores
      matematica-fisica/             ← escritor de Matemática y física
      probabilidad-estadistica/      ← escritor de Probabilidad y estadística
      soporte/                       ← escritor de Soporte técnico
```

Reglas de nombres:

- **Un tema = una carpeta** `src/content/temas/<area>/<slug-del-tema>/` con exactamente dos archivos: `tema.mdx` (la lección y el frontmatter) y `practica.yaml` (tarjetas, ejercicios, casos de guardia y problemas). No hay otros archivos en la carpeta (ni imágenes, ni notas).
- **Slugs** (de área y de tema): kebab-case, solo `a-z`, `0-9` y `-`, sin tildes ni eñes (`senales`, no `señales`), sin guion al principio ni al final, máximo 40 caracteres. Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- **Id del tema** (`temaId`): `<area>/<slug>`, por ejemplo `probabilidad-estadistica/bayes-falsos-positivos`. Es también la ruta de la página: `/campus-personal/probabilidad-estadistica/bayes-falsos-positivos/`.
- La carpeta del área tiene que coincidir con el campo `area` del frontmatter. Única excepción: el tema de ejemplo vive en `temas/ejemplo/` y lleva `ejemplo: true`.
- Los slugs de los 24 temas de v1 están fijados en `BRIEF-ESCRITORES.md` §7. No se inventan otros.

### 1.1 Archivo de áreas: `src/content/areas.yaml`

Lo crea F2 con este contenido exacto. Sumar un área es sumar un bloque acá (y su carpeta de temas); ninguna pantalla nombra áreas en el código.

```yaml
- id: analisis-datos
  nombre: Análisis de datos
  orden: 1
  color: "#2563eb"
  colorOscuro: "#60a5fa"
  icono: barras
  descripcion: Limpiar, explorar, graficar y consultar datos para sacar conclusiones que aguanten una pregunta incómoda.
  exigeCasoDeGuardia: false
- id: arquitecturas
  nombre: Arquitecturas y microservicios
  orden: 2
  color: "#7c3aed"
  colorOscuro: "#a78bfa"
  icono: capas
  descripcion: Cómo se parte un sistema, cómo se hablan sus piezas y qué hacer para que una falla no tire todo abajo.
  exigeCasoDeGuardia: true
- id: servidores
  nombre: Servidores
  orden: 3
  color: "#0f766e"
  colorOscuro: "#2dd4bf"
  icono: servidor
  descripcion: Linux, servicios, monitoreo, backups y contenedores, del lado de quien atiende la guardia.
  exigeCasoDeGuardia: true
- id: matematica-fisica
  nombre: Matemática y física aplicadas
  orden: 4
  color: "#b45309"
  colorOscuro: "#fbbf24"
  icono: funcion
  descripcion: Derivadas, matrices, grafos y señales, mirados desde lo que resuelven en el laburo.
  exigeCasoDeGuardia: false
- id: probabilidad-estadistica
  nombre: Probabilidad y estadística
  orden: 5
  color: "#be123c"
  colorOscuro: "#fb7185"
  icono: campana
  descripcion: Distribuciones, intervalos, pruebas A/B y Bayes para no dejarse engañar por los números.
  exigeCasoDeGuardia: false
- id: soporte
  nombre: Soporte técnico
  orden: 6
  color: "#4d7c0f"
  colorOscuro: "#a3e635"
  icono: auricular
  descripcion: Incidentes, troubleshooting con método, prioridades y SLA, y cómo hablar con el usuario.
  exigeCasoDeGuardia: true
```

`icono` sale de un conjunto cerrado de 6 íconos SVG que dibuja F2: `barras`, `capas`, `servidor`, `funcion`, `campana`, `auricular`. `color` se usa en tema claro, `colorOscuro` en tema oscuro (los dos con contraste ≥ 4.5:1 sobre el fondo respectivo para texto grande; F2 lo chequea).

---

## 2. Qué va en cada archivo del tema

| Pieza | Dónde vive | Por qué ahí |
|---|---|---|
| Título, área, orden, resumen, materias, prerrequisitos, nivel, minutos, fuentes, fecha de verificación | frontmatter de `tema.mdx` | Es metadata de la lección; Astro la valida con Zod y da archivo + campo al fallar. |
| Caso real, intuición, formal (texto, analogías, fórmulas, simuladores, citas) | cuerpo de `tema.mdx`, dentro de `<CasoReal>`, `<Intuicion>`, `<Formal>` | Es prosa con componentes; MDX es el formato natural. |
| Tarjetas, ejercicios, casos de guardia, problemas recomendados | `practica.yaml` (hermano de `tema.mdx`) | Son datos estructurados con ids estables. En YAML, Zod valida cada campo y los mínimos (`.min(6)`), y el build rompe con el archivo y la ruta exacta (`tarjetas.3.dorso`). En componentes MDX no se podrían validar mínimos ni ids en el build. |
| Práctica y Fuentes (secciones 4 y 5 de la lección) | las **dibuja el layout**, a partir de `practica.yaml` y de `fuentes` del frontmatter | Así el orden caso real → intuición → formal → práctica → fuentes queda forzado por construcción: el escritor no puede desordenarlo ni olvidarse una parte. |

**Tipos de fuente** (campo `tipo` de cada entrada de `fuentes`):

| `tipo` | Qué es | Campos obligatorios (además de `id`, `autor`, `titulo`) | ¿Respalda un dato? |
|---|---|---|---|
| `libro` | Libro o capítulo de libro (incluye ediciones libres online, como el libro SRE de Google) | `edicion`, `ubicacion` | Sí |
| `doc-oficial` | Documentación de un proyecto, proveedor, estándar o ente (man pages, RFC, Azure Architecture Center, NIST) | `url` | Sí |
| `curso-abierto` | Curso universitario abierto (MIT OCW, Khan Academy) | `url` | Sí |
| `articulo` | Artículo o paper de autor: revista, conferencia, preprint (Brewer, Gilbert-Lynch, Shannon 1948, Johari et al.) y artículos de autor reconocido en su sitio (Fowler, microservices.io) | `edicion` (revista, volumen y año, o fecha de publicación) | Sí |
| `video` | Video | `url`, `verMas: true` | No, solo "para ver más" |
| `blog` | Blog o artículo comercial sin revisión editorial | `url`, `verMas: true` | No, solo "para ver más" |

Un artículo de autor se tipa `articulo`, no `doc-oficial`: `doc-oficial` queda para documentación institucional (de un proveedor, un proyecto o un ente de normas).

---

## 3. Esquemas Zod (F2 los copia tal cual)

### 3.1 `src/contenido/esquemas.ts`

No importa `astro:content` (así Vitest lo puede usar directo). Usa `z` de `astro/zod` (Zod 4.6.7).

```ts
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
// Artículo o paper (revista, conferencia, preprint) y artículos de autor reconocido (Fowler, Richardson): fuente válida, con DOI o URL si existe.
const fuenteArticulo = z.object({
  ...baseFuente,
  tipo: z.literal('articulo'),
  edicion: texto, // revista, volumen y año, o fecha de publicación: "Communications of the ACM 56(2), 2013"
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
```

Notas para F2 sobre Zod 4: `ctx.addIssue({ code: 'custom', … })` y el parámetro `{ error }` son la forma de Zod 4. Si `astro check` marca algún uso como deprecado, se cambia la forma pero **no** el significado ni los mensajes.

### 3.2 `src/content.config.ts`

```ts
// src/content.config.ts — copiado del CONTRATO-CONTENIDO.md §3.2.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { esquemaArea, esquemaPractica, esquemaTema } from './contenido/esquemas';

const areas = defineCollection({
  loader: file('src/content/areas.yaml'),
  schema: esquemaArea,
});

// id = "<area>/<slug>" (sin el nombre del archivo), igual en las dos colecciones.
const idDeCarpeta = ({ entry }: { entry: string }) => entry.replace(/\/(tema\.mdx|practica\.yaml)$/, '');

const temas = defineCollection({
  loader: glob({ pattern: '*/*/tema.mdx', base: './src/content/temas', generateId: idDeCarpeta }),
  schema: esquemaTema,
});

const practicas = defineCollection({
  loader: glob({ pattern: '*/*/practica.yaml', base: './src/content/temas', generateId: idDeCarpeta }),
  schema: esquemaPractica,
});

export const collections = { areas, temas, practicas };
```

El patrón `*/*/tema.mdx` obliga a la profundidad exacta `temas/<area>/<tema>/tema.mdx`: un archivo en otro lugar no se carga, y la regla I2 (§4) lo detecta como "tema sin práctica" o "práctica sin tema".

---

## 4. Reglas de integridad (cruzadas entre archivos)

Zod valida cada archivo solo. Lo que cruza archivos lo valida `src/contenido/integridad.ts`, una función **pura** (sin `astro:content`, testeable con Vitest):

```ts
export type Severidad = 'error' | 'aviso';
export interface Problema { archivo: string; campo: string; mensaje: string; severidad: Severidad; regla: string }
export interface EntradaTema { id: string; archivo: string; data: TemaFrontmatter; cuerpo: string }
export interface EntradaPractica { id: string; archivo: string; data: Practica }
export function verificarIntegridad(
  areas: Area[],
  temas: EntradaTema[],
  practicas: EntradaPractica[],
  opciones: { estricto: boolean; simuladores: readonly string[] },
): Problema[];
```

`cargarCampus()` (en `src/contenido/campus.ts`, memoizada) hace `getCollection` de las tres colecciones, arma las entradas (`archivo` = `entry.filePath`, `cuerpo` = `entry.body`), llama a `verificarIntegridad` con `estricto: process.env.CAMPUS_ESTRICTO === '1'` y la lista de nombres del catálogo de `SIMULADORES.md`, imprime los avisos con `console.warn` y, si hay al menos un `error`, **tira un `Error`** con todos los errores, uno por línea, con este formato:

```
[contenido] src/content/temas/soporte/prioridad-y-sla/practica.yaml → casos: el área "soporte" exige ≥1 caso de guardia (regla I7)
```

Toda página llama a `cargarCampus()` en su frontmatter o en `getStaticPaths`, así que un error rompe `npm run build` (exit ≠ 0).

**Dos formatos de error, según quién lo detecta** (verificado en el hito 0):

- Lo que valida un esquema Zod (campos faltantes, tipos, mínimos, ids, grafo del caso, fuentes) lo imprime Astro, con la ruta del campo y el archivo en `Location`:
  ```
  [InvalidContentEntryDataError] practicas → ejemplo/media-y-mediana data does not match collection schema.
    tarjetas.0.dorso**: **tarjetas.0.dorso: Required
    Location: …/src/content/temas/ejemplo/media-y-mediana/practica.yaml:0:0
  ```
  Ese error frena el build antes de correr las reglas I1-I15 (el escritor corrige y vuelve a correr).
- Lo que valida `verificarIntegridad` (I1-I15) y las props de los componentes MDX sale con el formato `[contenido] archivo → campo: mensaje (regla Ix)` de arriba; en I6 el campo es `cuerpo (línea N)`, y en los simuladores `<SimDatos> prop "dataset": …`. Si hay varios, salen todos juntos bajo `El contenido no cumple el contrato (N errores):`.

| Regla | Qué verifica | Severidad |
|---|---|---|
| I1 | Cada `temas/<area>/<tema>/` tiene `tema.mdx` **y** `practica.yaml` (mismo id en las dos colecciones). | error |
| I2 | `data.area` existe en `areas.yaml`. La carpeta del área (primer segmento del id) es igual a `data.area`, salvo `ejemplo: true`, que obliga a la carpeta `ejemplo`. Un tema en `temas/ejemplo/` sin `ejemplo: true` es error. | error |
| I3 | `orden` no se repite entre temas de la misma área. El tema de ejemplo (`ejemplo: true`, `orden: 1` en `analisis-datos`) no cuenta: convive con un tema real de `orden: 1`. | error |
| I4 | Cada `prerrequisitos[i]` es un id de tema existente y no es el propio tema. | aviso; **error** en estricto |
| I5 | Toda `fuente` referenciada en `practica.yaml` (tarjeta, ejercicio, caso, problema) existe en `fuentes` del frontmatter. La de un problema no puede ser `video` ni `blog`. | error |
| I6 | El cuerpo de `tema.mdx` cumple la forma de la §6.1: sin `import`/`export`; exactamente un `<CasoReal …>`, un `<Intuicion>` y un `<Formal>`, en ese orden, cada uno abierto y cerrado en su propia línea; fuera de esas tres secciones solo puede haber líneas en blanco o comentarios `{/* … */}`; sin encabezados `#` ni `##`. | error |
| I7 | Si el área tiene `exigeCasoDeGuardia: true`, `practica.casos` tiene ≥1 caso. | error |
| I8 | `<Intuicion>` contiene ≥1 simulador (`<Sim…`) y ≥1 `<Analogia`. | error |
| I9 | Todo `<Sim…>` usado es un nombre del catálogo de `SIMULADORES.md`. | error |
| I10 | Todo `<Cita f="x" …/>` apunta a una fuente del frontmatter con `verMas: false`. | error |
| I11 | Cada fuente con `verMas: false` se usa al menos una vez: con `<Cita>` en el cuerpo o como `fuente` de alguna pieza de `practica.yaml`. `<Formal>` tiene ≥1 `<Cita>`. | error |
| I12 | (estricto) Cada área tiene ≥3 temas con `ejemplo: false`. | error en estricto |
| I13 | (estricto) Cada área tiene ≥2 usos de simulador sumando sus temas (sin contar el ejemplo). | error en estricto |
| I15 | El `id` de un área no puede ser una ruta reservada de la app: `ejemplo`, `repaso`, `progreso`, `buscar`, `ajustes`, `pagefind`, `catalogo`. | error |
| I14 | Los temas con `ejemplo: true` no cuentan para I12/I13 ni aparecen en portada, área, repaso, progreso ni buscador. Única excepción: con `CAMPUS_INCLUIR_EJEMPLO=1` (solo para los tests e2e de F2) el ejemplo se comporta como un tema más de su área en portada, área, repaso, progreso y catálogo, pero sigue fuera del buscador y de I12/I13. | (regla de la app) |

Cómo detecta F2 las secciones (I6) sin parsear MDX: con regex por línea sobre `cuerpo`:

- apertura: `^<(CasoReal|Intuicion|Formal)(\s[^>]*)?>\s*$`
- cierre: `^</(CasoReal|Intuicion|Formal)>\s*$`
- simuladores: `<(Sim[A-Z][A-Za-z0-9]*)\b`
- citas: `<Cita\s+f="([a-z0-9-]+)"`
- prohibidos: `^(import|export)\s`, `^#{1,2}\s`

El modo **estricto** (`CAMPUS_ESTRICTO=1`) lo prende el workflow de GitHub Actions. En local está apagado para que F2 pueda construir con solo el tema de ejemplo y cada escritor pueda validar su área sola. Cualquiera lo puede correr: `CAMPUS_ESTRICTO=1 npm run build`.

---

## 5. Ids estables (el progreso depende de esto)

- Cada tarjeta, ejercicio, caso y problema tiene un `id` local con prefijo por tipo: `t-` tarjeta, `e-` ejercicio, `c-` caso, `p-` problema. Ejemplo: `t-vpp-baja-prevalencia`.
- El **id global** lo arma la app: `<temaId>#<idLocal>`, por ejemplo `probabilidad-estadistica/bayes-falsos-positivos#t-vpp-baja-prevalencia`. Con ese id se guarda el estado FSRS (ver `PROGRESO-JSON.md`).
- **Un id publicado no se renombra nunca.** Corregir una errata o mejorar la redacción mantiene el id. Si la tarjeta pasa a preguntar **otra idea**, va con id nuevo (y la vieja se borra). Renombrar la carpeta del tema cambia todos los ids globales: está prohibido después de publicar.
- El id describe la idea, no la posición: `t-mediana-robusta`, no `t-3`.

---

## 6. El cuerpo del tema (`tema.mdx`)

### 6.1 Forma obligatoria

```mdx
---
(frontmatter)
---

<CasoReal titulo="…">

…markdown…

</CasoReal>

<Intuicion>

…markdown con ≥1 <Analogia> y ≥1 simulador…

</Intuicion>

<Formal>

…markdown con fórmulas y ≥1 <Cita>…

</Formal>
```

- **Sin `import`.** Todos los componentes de §7 llegan inyectados por la página (`<Content components={componentesMdx} />`). Usar un componente que no está en §7 o en el catálogo de simuladores rompe el build.
- **Línea en blanco** después de cada etiqueta de apertura y antes de cada cierre (`<Intuicion>`, `<Analogia>`, `<Nota>`, etc.). Sin esa línea, MDX no procesa el markdown de adentro.
- Dentro de las secciones, los subtítulos son `###` o `####`. El `<h2>` de cada sección lo pone el componente ("El caso", "La intuición", "Lo formal").
- Fórmulas en línea con `$…$`, en bloque con `$$…$$` (en su propio párrafo), vía remark-math + rehype-katex. Para una fórmula destacada con nombre, `<Formula>` (§7).
- Bloques de código con triple acento grave y lenguaje (` ```bash `, ` ```sql `, ` ```yaml `). Tablas markdown (GFM) permitidas.
- MDX se rompe con `<` y `{` sueltos en el texto: escribí "menor que", usá `&lt;` o metelo en `código` o en `$…$`. Las llaves `{}` solo dentro de `$…$`, de código o de props.
- Prohibido HTML crudo salvo `<br />`. El compilador de Astro 7 es estricto con etiquetas mal cerradas.

### 6.2 Lo que dibuja la página después de `<Formal>`

El layout del tema agrega, en este orden y sin que el escritor haga nada:

1. `<section id="practica">` "Práctica", con:
   - **Tarjetas**: vista previa del mazo (frente; el dorso se ve al tocar) y botón "Repasar este tema ahora" → `/repaso/?tema=<temaId>`.
   - **Ejercicios**: cada uno como isla autocorregible (§8).
   - **Casos de guardia**: cada uno como isla navegable (§8.4), si hay.
   - **Problemas para hacer por tu cuenta**: enunciado, fuente (autor, título, ubicación) y enlace si hay.
2. `<section id="fuentes">` "Fuentes": las fuentes con `verMas: false` en el orden del frontmatter, cada una con `id="fuente-<id>"`; abajo, "Para ver más" con las de `verMas: true`.
3. Pie: "Fuentes verificadas el <fechaVerificacion>".

El texto de tarjetas, ejercicios y casos se renderiza en el HTML estático (no solo en el cliente) para que Pagefind lo indexe.

---

## 7. Componentes MDX (API exacta)

Todos son componentes `.astro` que F2 registra en `src/components/mdx/index.ts` como `componentesMdx`. Los simuladores son envoltorios `.astro` que dibujan la isla React con `client:visible` (las directivas `client:*` no funcionan sobre componentes pasados por `components`, por eso el envoltorio). Las props de cualquier componente son datos serializables: strings, números, booleanos, arrays y objetos literales. Nunca funciones.

### 7.1 `CasoReal`

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `titulo` | `string` (≤ 90 caracteres) | sí | El gancho, como titular. Se muestra bajo el `<h2>` "El caso". |
| `children` | markdown | sí | La historia (ver largo en `GUIA-ESTILO.md`). |

```mdx
<CasoReal titulo="El lunes la API andaba 'bien' y todos se quejaban">

Son las 9:05 y el tablero dice que la latencia promedio es de 180 ms…

</CasoReal>
```

### 7.2 `Intuicion`

Sin props. `children` markdown. Tiene que contener ≥1 `<Analogia>` y ≥1 simulador (regla I8). `<h2>` "La intuición".

```mdx
<Intuicion>

Pensalo como …

</Intuicion>
```

### 7.3 `Formal`

Sin props. `children` markdown. Tiene que contener ≥1 `<Cita>` (regla I11). `<h2>` "Lo formal".

### 7.4 `Analogia`

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `titulo` | `string` | no (por defecto "Pensalo así") | Encabezado del recuadro. |
| `children` | markdown | sí | La analogía. |

```mdx
<Analogia titulo="La fila del súper">

Si en la fila hay nueve personas con dos cosas y una con el changuito lleno…

</Analogia>
```

### 7.5 `Nota` y `Ojo`

`Nota` = dato al margen que suma; `Ojo` = error común o trampa. Mismas props.

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `titulo` | `string` | no (por defecto "Nota" / "Ojo") | Encabezado del recuadro. |
| `children` | markdown | sí | El contenido, 1-4 oraciones. |

```mdx
<Ojo>

El promedio de los promedios no es el promedio total si los grupos tienen distinto tamaño.

</Ojo>
```

### 7.6 `Cita`

Marca de cita que apunta a la lista de fuentes.

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `f` | `string` (id de fuente del frontmatter, `verMas: false`) | sí | A qué fuente apunta. |
| `loc` | `string` | no | Ubicación puntual si es más fina que la de la fuente: "§2.3.1", "p. 34", "sección Restart=". |

Renderiza `<sup class="cita"><a href="#fuente-<f>">[<f>, <loc>]</a></sup>` (sin `loc`: `[<f>]`). Va pegada al final de la oración que respalda, antes del punto.

```mdx
La mediana no se mueve aunque el valor más grande se multiplique por diez<Cita f="ross" loc="§2.3.2" />.
```

### 7.7 `Formula`

Fórmula destacada, con nombre y explicación de símbolos. Para las demás fórmulas alcanza `$…$` / `$$…$$`.

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `tex` | `string` (LaTeX de KaTeX) | sí | La fórmula. Se renderiza en el build con `katex.renderToString(tex, { displayMode: true, throwOnError: true })`: un LaTeX inválido rompe el build. |
| `nombre` | `string` | no | Título corto ("Media muestral"). |
| `children` | markdown | no | "donde…": qué es cada símbolo, con `$…$`. |

`tex` va entre comillas dobles y **las barras invertidas se escriben una sola vez** (en un atributo JSX entre comillas no hay secuencias de escape): `tex="\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i"`. No uses `tex={"…"}` (ahí sí habría que duplicar las barras). Si la fórmula necesita comillas dobles, usá comillas simples para el atributo.

```mdx
<Formula nombre="Media muestral" tex="\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i">

donde $n$ es la cantidad de datos y $x_i$ cada dato.

</Formula>
```

### 7.8 `Profundizar`

Desplegable cerrado por defecto (`<details>`), para una demostración o un detalle que no todos necesitan. Solo dentro de `<Formal>`.

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `titulo` | `string` | sí | Texto del resumen desplegable. |
| `children` | markdown | sí | El detalle. |

```mdx
<Profundizar titulo="¿Por qué se divide por n − 1 en la varianza muestral?">

…

</Profundizar>
```

### 7.9 Simuladores

12 componentes `Sim…`, con sus props, en `SIMULADORES.md`. Todos comparten:

| Prop | Tipo | Obligatoria | Qué hace |
|---|---|---|---|
| `consigna` | `string` (≤ 240) | sí | Qué tiene que probar el lector: "Subí la tasa de aprendizaje hasta que el punto empiece a rebotar". Se dibuja en HTML estático, arriba del simulador. |
| `titulo` | `string` (≤ 80) | no | Título de la figura. |

Las props de cada simulador se validan con Zod en el envoltorio `.astro` durante el build: una prop inválida rompe el build con el archivo y el nombre de la prop.

```mdx
<SimDatos
  consigna="Activá 'agregar valores extremos' y mirá cuál de las dos líneas se mueve."
  dataset="latencias"
  vistas={["histograma", "caja"]}
/>
```

---

## 8. Formatos de práctica (`practica.yaml`)

### 8.1 Texto dentro del YAML ("texto corto")

Los campos de texto de `practica.yaml` (`frente`, `dorso`, `enunciado`, `explicacion`, `texto`, `consecuencia`, `contexto`, `leccion`, `justificacion`) se renderizan con un mini-formato que implementa F2, sin dependencias nuevas:

- `**negrita**`, `*itálica*`, `` `código` ``, `$fórmula$` (KaTeX en línea, renderizado en el build con `throwOnError: true`).
- Bloque de código con triple acento grave (sin resaltado), útil para SQL o comandos.
- Línea en blanco = párrafo nuevo. No hay listas, ni enlaces, ni HTML.

Para no pelear con YAML: todo texto con `:`, `#`, `$`, barras invertidas o más de una línea va como bloque literal `|`. Nunca uses comillas dobles con LaTeX adentro (en YAML entre comillas dobles `\f` es un salto de página).

### 8.2 Tarjetas

```yaml
tarjetas:
  - id: t-mediana-robusta
    frente: ¿Qué medida de centro casi no se mueve si aparece un valor extremo?
    dorso: La **mediana**, porque solo depende del valor del medio una vez ordenados los datos.
    fuente: ross        # opcional
```

### 8.3 Ejercicios

**Numérico con tolerancia y unidad.** Es correcto si `|x − respuesta| ≤ absoluta` **o** `|x − respuesta| ≤ relativa·|respuesta|` (si están las dos, alcanza con cumplir una). Si la respuesta es incorrecta y coincide (con la misma tolerancia) con algún `erroresComunes[i].valor`, se muestra esa explicación específica; si no, la `explicacion` general. Siempre después de responder se muestra la `explicacion`. Acepta coma o punto decimal. La `unidad` se muestra al lado del input (el usuario no la escribe).

```yaml
  - id: e-media-con-cuelgue
    tipo: numerico
    enunciado: |
      Cinco pedidos tardaron 120, 130, 125, 135 y 2000 ms. ¿Cuál es la latencia **media**?
    respuesta: 502
    tolerancia:
      absoluta: 0.5
    unidad: ms
    explicacion: |
      Sumás todo (2510 ms) y dividís por 5: 502 ms. Un solo pedido colgado arrastra el promedio.
    erroresComunes:
      - valor: 130
        explicacion: Eso es la mediana (el del medio al ordenar), no la media.
```

**Opción múltiple con explicación por opción.** Exactamente una `correcta: true`. Cada opción trae su `explicacion`: en las incorrectas, por qué no; en la correcta, por qué sí. Al elegir se muestra la explicación de la elegida y, si erró, también la de la correcta. Las opciones se muestran en el orden del archivo (sin mezclar, para que el SSR coincida con el cliente).

**Verdadero/falso con justificación.** `enunciado` es una afirmación; `respuesta` el valor de verdad; `justificacion` se muestra siempre después de responder.

Mínimo por tema: 3 ejercicios de al menos 2 tipos distintos.

### 8.4 Caso de guardia

Un grafo dirigido sin ciclos: nodos `decision` (texto + 2-4 opciones) y nodos `desenlace` (resultado `bien` | `regular` | `mal` + texto). Cada opción tiene `va` (a qué nodo lleva) y `consecuencia` (qué pasa por haber elegido eso; se muestra antes de pasar al nodo siguiente). Al llegar a un desenlace se muestra el resultado, el texto y la `leccion` del caso, con un botón "Probar otro camino". Mínimos: ≥2 decisiones, ≥2 desenlaces, ≥1 desenlace `bien`, todos los nodos alcanzables desde `inicio`, `inicio` es una decisión, sin ciclos. La app guarda intentos y el mejor resultado (`PROGRESO-JSON.md`).

```yaml
casos:
  - id: c-tablero-miente
    titulo: El tablero dice verde y el usuario dice rojo
    rol: Sos quien atiende la guardia de la API de turnos.
    contexto: |
      Lunes 9:10. Tres usuarios reportan que "la app tarda una eternidad".
      El tablero muestra latencia **promedio** de 180 ms, igual que siempre.
    inicio: primer-paso
    nodos:
      - id: primer-paso
        tipo: decision
        texto: ¿Qué hacés primero?
        opciones:
          - texto: Abro la distribución de latencias de la última hora (mediana y p95).
            va: ver-p95
            consecuencia: El p95 está en 4 s; la mediana en 120 ms. Hay una cola larga que el promedio tapa.
          - texto: Les contesto que el tablero está en verde, así que es la red de ellos.
            va: final-mal
            consecuencia: Los reclamos se triplican en media hora.
      # … más nodos (ver el ejemplo completo en §9)
    leccion: |
      Un promedio verde no prueba que todos estén bien: mirá la distribución antes de descartar un reclamo.
```

### 8.5 Problemas recomendados

Para hacer fuera de la app, sin corrección integrada. `fuente` es el id de una fuente del frontmatter (libro, doc oficial o curso abierto) y `ubicacion` dice dónde está el problema exacto o el material para resolverlo.

```yaml
problemas:
  - id: p-ross-cap2
    enunciado: Resolvé los problemas del capítulo 2 que piden media y mediana muestral de un conjunto de datos, y en cada uno decí cuál de las dos describe mejor el "valor típico".
    fuente: ross
    ubicacion: cap. 2, problemas del final del capítulo
    dificultad: basico
```

---

## 9. Tema de EJEMPLO completo

Lo crea F2 en `src/content/temas/ejemplo/media-y-mediana/`. Es la referencia de forma para los escritores y el fixture de los tests de F2 (tiene que validar contra el esquema y pasar todas las reglas de §4). No se lista en ningún lado (regla I14); F2 lo muestra en la ruta `/ejemplo/` para desarrollar y testear la página de tema. Como no se publica como contenido, F4 no lo verifica; igual sus datos son correctos.

### 9.1 `tema.mdx`

```mdx
---
titulo: "Media y mediana: cuándo el promedio miente"
area: analisis-datos
orden: 1
resumen: Por qué un solo valor extremo arrastra el promedio y no la mediana, y cómo elegir la medida de centro que describe de verdad a tus datos.
materias:
  - carrera: ing-informatica
    codigo: "3651"
    nombre: Probabilidad y Estadística
  - carrera: ing-informatica
    codigo: "3670"
    nombre: Ciencia de Datos
prerrequisitos: []
nivel: basico
minutos: 15
fuentes:
  - id: ross
    tipo: libro
    autor: Sheldon M. Ross
    titulo: Introduction to Probability and Statistics for Engineers and Scientists
    edicion: 6.ª ed., 2021
    editorial: Academic Press
    ubicacion: cap. 2, §2.3
  - id: nist-eda
    tipo: doc-oficial
    autor: NIST/SEMATECH
    titulo: e-Handbook of Statistical Methods — Measures of Location
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm
    ubicacion: §1.3.5.1
  - id: khan-centro
    tipo: curso-abierto
    autor: Khan Academy
    titulo: Summarizing quantitative data
    url: https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data
    verMas: true
fechaVerificacion: 2026-11-11
ejemplo: true
---

<CasoReal titulo="El tablero decía 180 ms y la gente esperaba cuatro segundos">

Lunes, 9 de la mañana. El tablero de la API muestra una latencia promedio de 180 ms, la misma de siempre. Pero llegan tres reclamos seguidos: "la app tarda una eternidad".

¿Miente el tablero? No exactamente. Promedia bien. El problema es que el promedio (media, *mean*) junta a todos en un solo número, y con que unos pocos pedidos se cuelguen, ese número deja de contar la historia de la mayoría… o de la minoría que sufre.

</CasoReal>

<Intuicion>

Hay dos maneras de decir "el valor típico". La **media** reparte el total en partes iguales. La **mediana** (*median*) es el valor que queda en el medio cuando ordenás todo.

<Analogia titulo="La reunión de egresados">

Nueve compañeros ganan un sueldo normal y uno se hizo millonario. Si promediás los diez sueldos, "en promedio" son todos ricos. Si ordenás los sueldos y mirás el del medio, ves lo que gana el compañero típico. El millonario mueve la media, pero a la mediana casi no la toca.

</Analogia>

Probalo con latencias de verdad:

<SimDatos
  consigna="Activá 'agregar valores extremos' y fijate cuál de las dos líneas (media o mediana) se corre a la derecha."
  dataset="latencias"
  vistas={["histograma", "caja"]}
/>

<Ojo>

En datos con cola a la derecha (latencias, sueldos, tamaños de archivo) la media queda por encima de la mediana. Si alguien te muestra solo la media, preguntá por la mediana y por el percentil 95.

</Ojo>

</Intuicion>

<Formal>

### Las definiciones

Para datos $x_1, \dots, x_n$:

<Formula nombre="Media muestral" tex="\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i">

donde $n$ es la cantidad de datos.

</Formula>

La **mediana muestral** se obtiene ordenando los datos: si $n$ es impar, es el valor de la posición $(n+1)/2$; si $n$ es par, es el promedio de los dos valores centrales<Cita f="ross" />.

### Robustez

Una medida es **robusta** (*robust*) si un valor atípico (*outlier*) no la mueve mucho. La mediana lo es; la media no, porque cada dato pesa lo mismo en la suma<Cita f="nist-eda" />.

| Datos (ms) | Media | Mediana |
|---|---|---|
| 120, 125, 130, 135, 140 | 130 | 130 |
| 120, 125, 130, 135, 2000 | 502 | 130 |

$$
\text{un cambio de } 140 \to 2000 \text{ mueve la media } 372 \text{ ms y la mediana } 0
$$

</Formal>
```

### 9.2 `practica.yaml`

```yaml
tarjetas:
  - id: t-media-definicion
    frente: ¿Cómo se calcula la media muestral?
    dorso: Sumás todos los datos y dividís por la cantidad de datos.
    fuente: ross
  - id: t-mediana-definicion
    frente: ¿Qué es la mediana de un conjunto de datos?
    dorso: El valor que queda en el medio cuando ordenás los datos de menor a mayor.
    fuente: ross
  - id: t-mediana-par
    frente: Si tenés una cantidad **par** de datos, ¿cuál es la mediana?
    dorso: El promedio de los dos valores centrales, una vez ordenados.
    fuente: ross
  - id: t-mediana-robusta
    frente: ¿Qué medida de centro casi no se mueve si aparece un valor extremo?
    dorso: La **mediana**, porque solo depende del valor del medio una vez ordenados los datos.
    fuente: nist-eda
  - id: t-cola-derecha
    frente: En datos con cola larga a la derecha (como latencias), ¿quién suele quedar más arriba, la media o la mediana?
    dorso: La media, porque los valores grandes de la cola la arrastran hacia arriba.
  - id: t-robusta-definicion
    frente: ¿Qué significa que una medida sea **robusta** (*robust*)?
    dorso: Que un valor atípico (*outlier*) no la cambia mucho.
    fuente: nist-eda

ejercicios:
  - id: e-media-con-cuelgue
    tipo: numerico
    enunciado: |
      Cinco pedidos tardaron 120, 130, 125, 135 y 2000 ms. ¿Cuál es la latencia **media**?
    respuesta: 502
    tolerancia:
      absoluta: 0.5
    unidad: ms
    explicacion: |
      Sumás todo: $120+130+125+135+2000 = 2510$ ms, y dividís por 5: 502 ms. Un solo pedido colgado arrastra el promedio.
    erroresComunes:
      - valor: 130
        explicacion: Eso es la mediana (el valor del medio al ordenar), no la media.
      - valor: 627.5
        explicacion: Dividiste por 4. Son 5 datos, así que se divide por 5.
  - id: e-elegir-medida
    tipo: opcion-multiple
    enunciado: Querés informar cuánto tarda "un pedido típico" de tu API, que tiene unos pocos pedidos colgados de 30 s. ¿Qué número mostrás?
    opciones:
      - texto: La media de todas las latencias.
        explicacion: Los pocos pedidos de 30 s la inflan y deja de describir al pedido típico.
      - texto: La mediana de las latencias.
        correcta: true
        explicacion: |
          Es robusta: los pedidos colgados no la mueven, así que describe al pedido típico.
      - texto: El valor máximo.
        explicacion: El máximo describe al peor caso, no al típico.
  - id: e-vf-media-mediana-iguales
    tipo: verdadero-falso
    enunciado: Si la media y la mediana de un conjunto de datos son muy distintas, es señal de asimetría o de valores extremos.
    respuesta: true
    justificacion: En datos simétricos y sin outliers las dos quedan cerca; una diferencia grande indica cola larga o valores extremos.

casos:
  - id: c-tablero-miente
    titulo: El tablero dice verde y el usuario dice rojo
    rol: Sos quien atiende la guardia de la API de turnos.
    contexto: |
      Lunes 9:10. Tres usuarios reportan que "la app tarda una eternidad".
      El tablero muestra latencia **promedio** de 180 ms, igual que siempre.
    inicio: primer-paso
    nodos:
      - id: primer-paso
        tipo: decision
        texto: ¿Qué hacés primero?
        opciones:
          - texto: Abro la distribución de latencias de la última hora (mediana y p95).
            va: ver-p95
            consecuencia: El p95 está en 4 s y la mediana en 120 ms. Hay una cola larga que el promedio tapa.
          - texto: Les contesto que el tablero está en verde, así que es la red de ellos.
            va: final-mal
            consecuencia: Los reclamos se triplican en media hora y escala tu jefe.
      - id: ver-p95
        tipo: decision
        texto: Ya sabés que un 5 % de los pedidos tarda más de 4 s. ¿Y ahora?
        opciones:
          - texto: Filtro los pedidos lentos y busco qué tienen en común (endpoint, cliente, horario).
            va: final-bien
            consecuencia: Todos los lentos son del endpoint de reportes, que arrancó a hacer una consulta sin índice.
          - texto: Reinicio todos los servidores por las dudas.
            va: final-regular
            consecuencia: La cola desaparece diez minutos y vuelve. No sabés por qué.
      - id: final-bien
        tipo: desenlace
        resultado: bien
        texto: Abrís un incidente con la causa acotada y el equipo de reportes lo corrige en una hora. Sumás el p95 al tablero.
      - id: final-regular
        tipo: desenlace
        resultado: regular
        texto: Ganaste diez minutos de calma, pero el problema sigue ahí y perdiste la evidencia en memoria.
      - id: final-mal
        tipo: desenlace
        resultado: mal
        texto: El incidente se descubre dos horas tarde y el usuario aprendió que la mesa de ayuda no le cree.
    leccion: |
      Un promedio verde no prueba que todos estén bien: mirá la distribución (mediana y p95) antes de descartar un reclamo.

problemas:
  - id: p-ross-cap2
    enunciado: Resolvé los problemas del capítulo 2 que piden media y mediana muestral, y en cada uno decí cuál de las dos describe mejor el valor típico y por qué.
    fuente: ross
    ubicacion: cap. 2, problemas del final del capítulo
    dificultad: basico
  - id: p-nist-robustez
    enunciado: Tomá las latencias de un día de algún servicio tuyo (o inventá 50 con unos pocos valores enormes). Calculá media, mediana y la media recortada al 10 % que describe el handbook, y compará cuánto se mueve cada una si duplicás el valor máximo.
    fuente: nist-eda
    ubicacion: §1.3.5.1 (media, mediana y media recortada)
    url: https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm
    dificultad: intermedio
```

Chequeo a mano de que el ejemplo cumple: 6 tarjetas, 3 ejercicios de 3 tipos, 1 caso con 2 decisiones y 3 desenlaces (uno `bien`), 2 problemas, 2 fuentes principales (`ross`, `nist-eda`) citadas en `<Formal>` y 1 "para ver más" (`khan-centro`, no citada), un `SimDatos` y una `Analogia` en `<Intuicion>`, una tabla GFM, `$…$`, `$$…$$` y una `<Formula>`.

---

## 10. Decisiones del planificador

Lo que el SPEC dejaba abierto y quedó decidido acá (todas reversibles salvo que se diga):

1. **Práctica en YAML hermano, no en frontmatter ni en componentes MDX.** Zod valida mínimos e ids en el build con ruta exacta; el MDX queda liviano para el escritor.
2. **Práctica y Fuentes las dibuja el layout.** El escritor escribe solo `<CasoReal>`, `<Intuicion>` y `<Formal>`; el orden de las cinco partes queda forzado por construcción y por la regla I6.
3. **Un tema = una carpeta con `tema.mdx` + `practica.yaml`**, ids `<area>/<slug>` con `generateId` explícito (no dependemos del slug por defecto del loader).
4. **Ids locales con prefijo (`t-`, `e-`, `c-`, `p-`) e id global `<temaId>#<idLocal>`.** Renombrar un id o una carpeta publicada pierde el progreso: prohibido.
5. **Reglas cruzadas en una función pura `verificarIntegridad`**, llamada desde todas las páginas: un error tira el build con archivo, campo y regla.
6. **Modo estricto solo en CI** (`CAMPUS_ESTRICTO=1`): ≥3 temas por área, ≥2 simuladores por área y prerrequisitos existentes. En local, apagado, para que F2 y cada escritor construyan en paralelo sin depender del resto.
7. **Videos y blogs son tipos de fuente con `verMas: true` obligatorio**; no se pueden citar con `<Cita>` ni respaldar problemas.
    - Agregado en F6a: tipo `articulo` (papers y artículos de autor), que sí respalda datos; `edicion` es obligatoria.
8. **Toda fuente principal tiene que usarse** (cita en el cuerpo o fuente de una pieza de práctica), y `<Formal>` lleva ≥1 cita. Así F4 siempre tiene de dónde agarrar cada afirmación.
9. **La marca de cita muestra el id de la fuente** (`[ross, §2.3]`) en vez de un número: no necesita contexto entre componentes y se lee bien.
10. **Sin imports ni imágenes en los temas.** Los visuales salen del catálogo de 12 simuladores; los componentes llegan inyectados.
11. **≥2 tipos de ejercicio por tema y casos de guardia con ≥2 decisiones, ≥2 desenlaces y ≥1 "bien"**, sin ciclos.
12. **"Texto corto" en el YAML**: negrita, itálica, código, `$…$` y bloques de código; F2 lo renderiza sin dependencias nuevas.
13. **El tema de ejemplo es un fixture oculto** (`ejemplo: true`, carpeta `temas/ejemplo/`, ruta `/ejemplo/`, fuera del buscador y del progreso). Está en Análisis de datos solo para tener un área válida.
14. **Los 24 slugs de tema quedan fijados** en `BRIEF-ESCRITORES.md` §7, así los prerrequisitos entre áreas apuntan a ids que van a existir.
15. **Campos en español y camelCase** (`fechaVerificacion`, `verMas`, `diasDeEstudio`) en vez de kebab-case, para que funcionen como propiedades de TypeScript sin comillas.
16. **El tiempo estimado se llama `minutos`** (entero, 5-90) y las materias de anclaje llevan carrera, código de 4 dígitos y nombre.
