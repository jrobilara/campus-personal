// src/contenido/integridad.ts — reglas I1-I15 de CONTRATO-CONTENIDO.md §4.
// Función pura: no importa `astro:content` (así Vitest la usa directo).
import type { Area, Practica, TemaFrontmatter } from './esquemas';

export type Severidad = 'error' | 'aviso';
export interface Problema {
  archivo: string;
  campo: string;
  mensaje: string;
  severidad: Severidad;
  regla: string;
}
export interface EntradaTema {
  id: string;
  archivo: string;
  data: TemaFrontmatter;
  cuerpo: string;
}
export interface EntradaPractica {
  id: string;
  archivo: string;
  data: Practica;
}
export interface OpcionesIntegridad {
  estricto: boolean;
  simuladores: readonly string[];
}

/** Rutas de la app que un área no puede usar como id (I15). */
export const RUTAS_RESERVADAS = ['ejemplo', 'repaso', 'progreso', 'buscar', 'ajustes', 'pagefind', 'catalogo'] as const;

const RE_APERTURA = /^<(CasoReal|Intuicion|Formal)(\s[^>]*)?>\s*$/;
const RE_CIERRE = /^<\/(CasoReal|Intuicion|Formal)>\s*$/;
const RE_SIM = /<(Sim[A-Z][A-Za-z0-9]*)\b/g;
const RE_CITA = /<Cita\b[^>]*?\bf="([^"]*)"/g;
const RE_PROHIBIDO_IMPORT = /^(import|export)\s/;
const RE_PROHIBIDO_TITULO = /^#{1,2}\s/;
const ORDEN_SECCIONES = ['CasoReal', 'Intuicion', 'Formal'] as const;
type NombreSeccion = (typeof ORDEN_SECCIONES)[number];

export interface SeccionCuerpo {
  nombre: NombreSeccion;
  /** número de línea (1-based, dentro del cuerpo) de la apertura */
  linea: number;
  /** contenido de la sección sin los bloques de código */
  texto: string;
}
export interface AnalisisCuerpo {
  errores: { linea: number; mensaje: string }[];
  secciones: SeccionCuerpo[];
  /** nombres `Sim…` usados en todo el cuerpo (fuera de bloques de código), con repeticiones */
  simuladores: string[];
  /** ids `f` de todos los `<Cita f="…">` del cuerpo (fuera de bloques de código) */
  citas: string[];
}

/** Quita el frontmatter si `cuerpo` todavía lo trae. */
function sinFrontmatter(cuerpo: string): { texto: string; desplazamiento: number } {
  const t = cuerpo.replace(/\r\n?/g, '\n');
  const m = /^---\n[\s\S]*?\n---\n?/.exec(t);
  if (!m) return { texto: t, desplazamiento: 0 };
  return { texto: t.slice(m[0].length), desplazamiento: m[0].split('\n').length - 1 };
}

/** Analiza la forma del cuerpo de `tema.mdx` (regla I6) sin parsear MDX: regex por línea. */
export function analizarCuerpo(cuerpo: string): AnalisisCuerpo {
  const { texto } = sinFrontmatter(cuerpo);
  const lineas = texto.split('\n');
  const errores: AnalisisCuerpo['errores'] = [];
  const secciones: SeccionCuerpo[] = [];
  const sinCodigo: string[] = []; // todas las líneas fuera de bloques de código
  let enCodigo = false;
  let enComentario = false;
  let actual: { nombre: NombreSeccion; linea: number; lineas: string[] } | null = null;

  lineas.forEach((l, idx) => {
    const n = idx + 1;
    const t = l.trim();

    if (/^\s*(```|~~~)/.test(l)) {
      enCodigo = !enCodigo;
      if (!actual) errores.push({ linea: n, mensaje: 'hay contenido fuera de <CasoReal>, <Intuicion> y <Formal> (solo se permiten líneas en blanco y comentarios {/* … */})' });
      return;
    }
    if (enCodigo) return;

    if (!actual) {
      // fuera de sección: solo blancos y comentarios
      if (enComentario) {
        if (t.includes('*/}')) enComentario = false;
        return;
      }
      if (t === '') return;
      if (/^\{\/\*.*\*\/\}$/.test(t)) return;
      if (t.startsWith('{/*')) {
        enComentario = !t.includes('*/}');
        return;
      }
      const ap = RE_APERTURA.exec(t);
      if (ap) {
        actual = { nombre: ap[1] as NombreSeccion, linea: n, lineas: [] };
        return;
      }
      if (RE_PROHIBIDO_IMPORT.test(t)) {
        errores.push({ linea: n, mensaje: 'prohibido `import`/`export` en el cuerpo: los componentes llegan inyectados' });
      } else if (RE_CIERRE.test(t)) {
        errores.push({ linea: n, mensaje: `cierre ${t} sin su apertura` });
      } else {
        errores.push({ linea: n, mensaje: 'hay contenido fuera de <CasoReal>, <Intuicion> y <Formal> (solo se permiten líneas en blanco y comentarios {/* … */})' });
      }
      return;
    }

    // dentro de una sección
    const ap = RE_APERTURA.exec(t);
    if (ap) {
      errores.push({ linea: n, mensaje: `<${ap[1]}> adentro de <${actual.nombre}>: las secciones no se anidan` });
      return;
    }
    const ci = RE_CIERRE.exec(t);
    if (ci) {
      if (ci[1] !== actual.nombre) {
        errores.push({ linea: n, mensaje: `</${ci[1]}> no corresponde: está abierta <${actual.nombre}> (línea ${actual.linea})` });
      }
      secciones.push({ nombre: actual.nombre, linea: actual.linea, texto: actual.lineas.join('\n') });
      actual = null;
      return;
    }
    if (RE_PROHIBIDO_IMPORT.test(t)) {
      errores.push({ linea: n, mensaje: 'prohibido `import`/`export` en el cuerpo: los componentes llegan inyectados' });
    }
    if (RE_PROHIBIDO_TITULO.test(t)) {
      errores.push({ linea: n, mensaje: 'prohibido `#` y `##` en el cuerpo: los subtítulos son `###` o `####`' });
    }
    actual.lineas.push(l);
    sinCodigo.push(l);
  });

  const sec = actual as { nombre: NombreSeccion; linea: number } | null;
  if (sec) errores.push({ linea: sec.linea, mensaje: `<${sec.nombre}> se abre acá y nunca se cierra` });

  // exactamente una de cada una, en orden
  for (const nombre of ORDEN_SECCIONES) {
    const cuantas = secciones.filter((s) => s.nombre === nombre).length;
    if (cuantas !== 1) {
      errores.push({ linea: 1, mensaje: `tiene que haber exactamente un <${nombre}> (hay ${cuantas})` });
    }
  }
  const orden = secciones.map((s) => s.nombre).filter((n, i, a) => a.indexOf(n) === i);
  const esperado = ORDEN_SECCIONES.filter((n) => orden.includes(n));
  if (orden.join() !== esperado.join()) {
    errores.push({ linea: 1, mensaje: 'las secciones tienen que ir en este orden: <CasoReal>, <Intuicion>, <Formal>' });
  }

  const todo = sinCodigo.join('\n');
  const simuladores = [...todo.matchAll(RE_SIM)].map((m) => m[1]!);
  const citas = [...todo.matchAll(RE_CITA)].map((m) => m[1]!);
  return { errores, secciones, simuladores, citas };
}

/** Formato único de mensaje: archivo → campo: mensaje (regla). */
export function formatearProblema(p: Problema): string {
  return `[contenido] ${p.archivo} → ${p.campo}: ${p.mensaje} (regla ${p.regla})`;
}

const archivoTema = (id: string) => `src/content/temas/${id}/tema.mdx`;
const archivoPractica = (id: string) => `src/content/temas/${id}/practica.yaml`;

export function verificarIntegridad(
  areas: Area[],
  temas: EntradaTema[],
  practicas: EntradaPractica[],
  opciones: OpcionesIntegridad,
): Problema[] {
  const out: Problema[] = [];
  const err = (regla: string, archivo: string, campo: string, mensaje: string, severidad: Severidad = 'error') =>
    out.push({ regla, archivo, campo, mensaje, severidad });

  const areasPorId = new Map(areas.map((a) => [a.id, a]));
  const practicaPorId = new Map(practicas.map((p) => [p.id, p]));
  const temaPorId = new Map(temas.map((t) => [t.id, t]));

  // I15 — ids de área reservados
  areas.forEach((a) => {
    if ((RUTAS_RESERVADAS as readonly string[]).includes(a.id)) {
      err('I15', 'src/content/areas.yaml', `id=${a.id}`, `el id "${a.id}" es una ruta reservada de la app (${RUTAS_RESERVADAS.join(', ')})`);
    }
  });

  // I1 — tema.mdx y practica.yaml van de a pares
  temas.forEach((t) => {
    if (!practicaPorId.has(t.id)) err('I1', archivoPractica(t.id), 'archivo', `falta practica.yaml: el tema "${t.id}" no tiene práctica`);
  });
  practicas.forEach((p) => {
    if (!temaPorId.has(p.id)) err('I1', archivoTema(p.id), 'archivo', `falta tema.mdx: la práctica "${p.id}" no tiene tema`);
  });

  // I2 — área existente y carpeta coherente
  temas.forEach((t) => {
    const carpeta = t.id.split('/')[0]!;
    if (!areasPorId.has(t.data.area)) {
      err('I2', t.archivo, 'area', `el área "${t.data.area}" no existe en src/content/areas.yaml`);
    }
    if (t.data.ejemplo) {
      if (carpeta !== 'ejemplo') err('I2', t.archivo, 'ejemplo', `un tema con ejemplo: true tiene que vivir en temas/ejemplo/ (está en temas/${carpeta}/)`);
    } else if (carpeta === 'ejemplo') {
      err('I2', t.archivo, 'ejemplo', 'un tema en temas/ejemplo/ tiene que llevar ejemplo: true');
    } else if (carpeta !== t.data.area) {
      err('I2', t.archivo, 'area', `la carpeta del área ("${carpeta}") no coincide con area: "${t.data.area}"`);
    }
  });

  // I3 — orden único por área (el tema de ejemplo no cuenta: convive con los reales)
  const ordenes = new Map<string, string>();
  temas
    .filter((t) => !t.data.ejemplo)
    .forEach((t) => {
      const k = `${t.data.area}#${t.data.orden}`;
      const otro = ordenes.get(k);
      if (otro) err('I3', t.archivo, 'orden', `el orden ${t.data.orden} ya lo usa "${otro}" en el área "${t.data.area}"`);
      else ordenes.set(k, t.id);
    });

  // I4 — prerrequisitos existentes (aviso; error en estricto)
  temas.forEach((t) => {
    t.data.prerrequisitos.forEach((pr, i) => {
      if (pr === t.id) err('I4', t.archivo, `prerrequisitos.${i}`, 'un tema no puede ser prerrequisito de sí mismo', opciones.estricto ? 'error' : 'aviso');
      else if (!temaPorId.has(pr)) err('I4', t.archivo, `prerrequisitos.${i}`, `el tema "${pr}" no existe todavía`, opciones.estricto ? 'error' : 'aviso');
    });
  });

  // I5 — fuentes referenciadas en practica.yaml existen; las de problemas no son video ni blog
  practicas.forEach((p) => {
    const t = temaPorId.get(p.id);
    if (!t) return;
    const fuentes = new Map(t.data.fuentes.map((f) => [f.id, f]));
    const revisar = (ref: string | undefined, campo: string) => {
      if (ref !== undefined && !fuentes.has(ref)) err('I5', p.archivo, campo, `la fuente "${ref}" no está en las fuentes de tema.mdx`);
    };
    p.data.tarjetas.forEach((x, i) => revisar(x.fuente, `tarjetas.${i}.fuente`));
    p.data.ejercicios.forEach((x, i) => revisar(x.fuente, `ejercicios.${i}.fuente`));
    p.data.casos.forEach((x, i) => revisar(x.fuente, `casos.${i}.fuente`));
    p.data.problemas.forEach((x, i) => {
      revisar(x.fuente, `problemas.${i}.fuente`);
      const f = fuentes.get(x.fuente);
      if (f && (f.tipo === 'video' || f.tipo === 'blog')) {
        err('I5', p.archivo, `problemas.${i}.fuente`, `la fuente "${x.fuente}" es de tipo ${f.tipo}: un problema recomendado necesita libro, doc oficial o curso abierto`);
      }
    });
  });

  // I6-I11 — cuerpo de tema.mdx
  const usosSim = new Map<string, number>(); // por área, sin ejemplo
  temas.forEach((t) => {
    const a = analizarCuerpo(t.cuerpo);
    const campoLinea = (l: number) => `cuerpo (línea ${l})`;
    a.errores.forEach((e) => err('I6', t.archivo, campoLinea(e.linea), e.mensaje));

    // I7 — caso de guardia obligatorio
    const area = areasPorId.get(t.data.area);
    const prac = practicaPorId.get(t.id);
    if (area?.exigeCasoDeGuardia && prac && prac.data.casos.length < 1 && !t.data.ejemplo) {
      err('I7', archivoPractica(t.id), 'casos', `el área "${area.id}" exige ≥1 caso de guardia`);
    }

    // I8 — Intuicion con simulador y analogía
    const intu = a.secciones.find((s) => s.nombre === 'Intuicion');
    if (intu) {
      if (!/<Sim[A-Z]/.test(intu.texto)) err('I8', t.archivo, campoLinea(intu.linea), '<Intuicion> necesita ≥1 simulador (<Sim…>)');
      if (!/<Analogia\b/.test(intu.texto)) err('I8', t.archivo, campoLinea(intu.linea), '<Intuicion> necesita ≥1 <Analogia>');
    }

    // I9 — simuladores del catálogo
    new Set(a.simuladores).forEach((s) => {
      if (!opciones.simuladores.includes(s)) {
        err('I9', t.archivo, 'cuerpo', `<${s}> no está en el catálogo de simuladores (${opciones.simuladores.join(', ')})`);
      }
    });

    // I10 — citas a fuentes existentes con verMas: false
    const fuentes = new Map(t.data.fuentes.map((f) => [f.id, f]));
    new Set(a.citas).forEach((c) => {
      const f = fuentes.get(c);
      if (!f) err('I10', t.archivo, 'cuerpo', `<Cita f="${c}"> apunta a una fuente que no está en el frontmatter`);
      else if (f.verMas) err('I10', t.archivo, 'cuerpo', `<Cita f="${c}"> apunta a una fuente "para ver más": solo se citan las fuentes principales`);
    });

    // I11 — toda fuente principal se usa; Formal tiene ≥1 Cita
    const usadas = new Set(a.citas);
    if (prac) {
      const p = prac.data;
      [...p.tarjetas, ...p.ejercicios, ...p.casos, ...p.problemas].forEach((x) => {
        if (x.fuente) usadas.add(x.fuente);
      });
    }
    t.data.fuentes.forEach((f, i) => {
      if (!f.verMas && !usadas.has(f.id)) {
        err('I11', t.archivo, `fuentes.${i}`, `la fuente principal "${f.id}" nunca se usa: citala con <Cita f="${f.id}" /> o referenciala desde practica.yaml`);
      }
    });
    const formal = a.secciones.find((s) => s.nombre === 'Formal');
    if (formal && !/<Cita\b/.test(formal.texto)) err('I11', t.archivo, campoLinea(formal.linea), '<Formal> necesita ≥1 <Cita>');

    if (!t.data.ejemplo) usosSim.set(t.data.area, (usosSim.get(t.data.area) ?? 0) + a.simuladores.length);
  });

  // I12 / I13 — estricto: ≥3 temas y ≥2 usos de simulador por área (sin el ejemplo)
  if (opciones.estricto) {
    areas.forEach((a) => {
      const n = temas.filter((t) => t.data.area === a.id && !t.data.ejemplo).length;
      if (n < 3) err('I12', 'src/content/areas.yaml', `id=${a.id}`, `el área "${a.id}" tiene ${n === 1 ? '1 tema' : `${n} temas`} y necesita ≥3 (modo estricto)`);
      const s = usosSim.get(a.id) ?? 0;
      if (s < 2) err('I13', 'src/content/areas.yaml', `id=${a.id}`, `el área "${a.id}" usa ${s === 1 ? '1 simulador' : `${s} simuladores`} y necesita ≥2 (modo estricto)`);
    });
  }

  return out;
}
