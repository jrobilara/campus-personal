import { describe, expect, it } from 'vitest';
import { analizarCuerpo, formatearProblema, verificarIntegridad, type Problema } from '../src/contenido/integridad';
import { NOMBRES_SIMULADORES } from '../src/simuladores/props';
import { cargarAreas, cuerpoBase, temaEjemplo, temaReal } from './helpers';

const lax = { estricto: false, simuladores: NOMBRES_SIMULADORES };
const estricto = { estricto: true, simuladores: NOMBRES_SIMULADORES };
const reglas = (ps: Problema[], regla: string) => ps.filter((p) => p.regla === regla);
const errores = (ps: Problema[]) => ps.filter((p) => p.severidad === 'error');

/** Un tema real de Análisis de datos + el ejemplo, que es la configuración sana de partida. */
function mundo() {
  const e = temaEjemplo();
  const r = temaReal('analisis-datos/limpieza-y-eda');
  return { areas: cargarAreas(), temas: [e.tema, r.tema], practicas: [e.practica, r.practica], r };
}
const correr = (m: ReturnType<typeof mundo>, op = lax) => verificarIntegridad(m.areas, m.temas, m.practicas, op);

describe('integridad: el contrato sano no da problemas', () => {
  it('ejemplo solo, modo normal', () => {
    const e = temaEjemplo();
    expect(verificarIntegridad(cargarAreas(), [e.tema], [e.practica], lax)).toEqual([]);
  });
  it('ejemplo + una copia como tema real', () => {
    expect(correr(mundo())).toEqual([]);
  });
});

describe('I1 — tema.mdx y practica.yaml van de a pares', () => {
  it('tema sin práctica', () => {
    const m = mundo();
    m.practicas.pop();
    const p = reglas(correr(m), 'I1');
    expect(p).toHaveLength(1);
    expect(p[0]!.archivo).toBe('src/content/temas/analisis-datos/limpieza-y-eda/practica.yaml');
  });
  it('práctica sin tema', () => {
    const m = mundo();
    m.temas.pop();
    const p = reglas(correr(m), 'I1');
    expect(p).toHaveLength(1);
    expect(p[0]!.archivo).toMatch(/tema\.mdx$/);
  });
});

describe('I2 — área existente y carpeta coherente', () => {
  it('área inexistente', () => {
    const m = mundo();
    m.r.tema.data.area = 'cocina';
    const p = reglas(correr(m), 'I2');
    expect(p.some((x) => x.campo === 'area' && x.mensaje.includes('cocina'))).toBe(true);
  });
  it('carpeta distinta del campo area', () => {
    const m = mundo();
    m.r.tema.data.area = 'soporte';
    expect(reglas(correr(m), 'I2').some((x) => x.mensaje.includes('no coincide'))).toBe(true);
  });
  it('ejemplo: true fuera de temas/ejemplo/', () => {
    const m = mundo();
    m.r.tema.data.ejemplo = true;
    expect(reglas(correr(m), 'I2').some((x) => x.campo === 'ejemplo')).toBe(true);
  });
  it('tema en temas/ejemplo/ sin ejemplo: true', () => {
    const m = mundo();
    m.temas[0]!.data.ejemplo = false;
    expect(reglas(correr(m), 'I2').some((x) => x.campo === 'ejemplo')).toBe(true);
  });
});

describe('I3 — orden único por área', () => {
  it('dos temas reales con el mismo orden', () => {
    const m = mundo();
    const otro = temaReal('analisis-datos/elegir-el-grafico', { orden: 1 });
    m.temas.push(otro.tema);
    m.practicas.push(otro.practica);
    const p = reglas(correr(m), 'I3');
    expect(p).toHaveLength(1);
    expect(p[0]!.campo).toBe('orden');
  });
  it('el ejemplo (orden 1) convive con un tema real de orden 1', () => {
    expect(reglas(correr(mundo()), 'I3')).toEqual([]);
  });
});

describe('I4 — prerrequisitos', () => {
  it('inexistente: aviso en normal, error en estricto', () => {
    const m = mundo();
    m.r.tema.data.prerrequisitos = ['soporte/no-existe'];
    expect(reglas(correr(m), 'I4')[0]!.severidad).toBe('aviso');
    expect(reglas(correr(m, estricto), 'I4')[0]!.severidad).toBe('error');
  });
  it('sí mismo', () => {
    const m = mundo();
    m.r.tema.data.prerrequisitos = ['analisis-datos/limpieza-y-eda'];
    expect(reglas(correr(m), 'I4')).toHaveLength(1);
  });
  it('existente: sin problema', () => {
    const m = mundo();
    m.r.tema.data.prerrequisitos = ['ejemplo/media-y-mediana'];
    expect(reglas(correr(m), 'I4')).toEqual([]);
  });
});

describe('I5 — fuentes referenciadas en practica.yaml', () => {
  it('tarjeta con una fuente que no existe', () => {
    const m = mundo();
    m.r.practica.data.tarjetas[0]!.fuente = 'fantasma';
    const p = reglas(correr(m), 'I5');
    expect(p).toHaveLength(1);
    expect(p[0]!.campo).toBe('tarjetas.0.fuente');
  });
  it('problema respaldado por un video', () => {
    const m = mundo();
    const f = m.r.tema.data.fuentes[2]!;
    m.r.tema.data.fuentes[2] = { ...f, tipo: 'video', verMas: true } as typeof f;
    m.r.practica.data.problemas[0]!.fuente = f.id;
    const p = reglas(correr(m), 'I5');
    expect(p.some((x) => x.campo === 'problemas.0.fuente' && x.mensaje.includes('video'))).toBe(true);
  });
});

describe('I6 — forma del cuerpo', () => {
  const con = (cuerpo: string) => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpo;
    return reglas(correr(m), 'I6');
  };
  it('el ejemplo cumple', () => {
    expect(analizarCuerpo(cuerpoBase()).errores).toEqual([]);
  });
  it('import en el cuerpo', () => {
    expect(con("import X from './x';\n\n" + cuerpoBase()).some((p) => p.mensaje.includes('import'))).toBe(true);
  });
  it('falta <Formal>', () => {
    const c = cuerpoBase().replace(/<Formal>[\s\S]*<\/Formal>/, '');
    expect(con(c).some((p) => p.mensaje.includes('exactamente un <Formal>'))).toBe(true);
  });
  it('dos <CasoReal>', () => {
    const c = cuerpoBase() + '\n<CasoReal titulo="otro">\n\nx\n\n</CasoReal>\n';
    expect(con(c).some((p) => p.mensaje.includes('exactamente un <CasoReal> (hay 2)'))).toBe(true);
  });
  it('secciones en otro orden', () => {
    const m = /(<CasoReal[\s\S]*?<\/CasoReal>)\s*(<Intuicion>[\s\S]*?<\/Intuicion>)/.exec(cuerpoBase())!;
    const c = cuerpoBase().replace(m[0], `${m[2]}\n\n${m[1]}`);
    expect(con(c).some((p) => p.mensaje.includes('orden'))).toBe(true);
  });
  it('encabezado # o ## adentro de una sección', () => {
    const c = cuerpoBase().replace('### Las definiciones', '## Las definiciones');
    expect(con(c).some((p) => p.mensaje.includes('`#` y `##`'))).toBe(true);
  });
  it('un # dentro de un bloque de código NO es un encabezado', () => {
    const c = cuerpoBase().replace('### Robustez', '### Robustez\n\n```bash\n# un comentario\n```\n');
    expect(con(c)).toEqual([]);
  });
  it('texto suelto fuera de las secciones', () => {
    expect(con(cuerpoBase() + '\nTexto suelto.\n').some((p) => p.mensaje.includes('fuera de'))).toBe(true);
  });
  it('comentarios {/* */} fuera de las secciones están permitidos', () => {
    expect(con('{/* nota del autor */}\n\n' + cuerpoBase())).toEqual([]);
  });
  it('sección que nunca se cierra', () => {
    const c = cuerpoBase().replace('</Formal>', '');
    expect(con(c).some((p) => p.mensaje.includes('nunca se cierra'))).toBe(true);
  });
  it('secciones anidadas', () => {
    const c = cuerpoBase().replace('<Analogia titulo="La reunión de egresados">', '<Formal>\n\n<Analogia titulo="La reunión de egresados">');
    expect(con(c).some((p) => p.mensaje.includes('no se anidan'))).toBe(true);
  });
});

describe('I7 — caso de guardia en áreas que lo exigen', () => {
  it('área que exige y práctica sin casos', () => {
    const m = mundo();
    m.areas.find((a) => a.id === 'analisis-datos')!.exigeCasoDeGuardia = true;
    m.r.practica.data.casos = [];
    const p = reglas(correr(m), 'I7');
    expect(p).toHaveLength(1);
    expect(p[0]!.campo).toBe('casos');
  });
  it('área que exige y práctica con caso: sin problema', () => {
    const m = mundo();
    m.areas.find((a) => a.id === 'analisis-datos')!.exigeCasoDeGuardia = true;
    expect(reglas(correr(m), 'I7')).toEqual([]);
  });
});

describe('I8 — Intuicion con simulador y analogía', () => {
  it('sin simulador', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace(/<SimDatos[\s\S]*?\/>/, '');
    expect(reglas(correr(m), 'I8').some((p) => p.mensaje.includes('simulador'))).toBe(true);
  });
  it('sin analogía', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace(/<Analogia[\s\S]*?<\/Analogia>/, '');
    expect(reglas(correr(m), 'I8').some((p) => p.mensaje.includes('Analogia'))).toBe(true);
  });
});

describe('I9 — simuladores del catálogo', () => {
  it('nombre inventado', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace('<SimDatos', '<SimInventado');
    const p = reglas(correr(m), 'I9');
    expect(p.some((x) => x.mensaje.includes('SimInventado'))).toBe(true);
  });
  it('los 12 nombres del catálogo', () => {
    expect([...NOMBRES_SIMULADORES].sort()).toEqual(
      ['SimBayes', 'SimDatos', 'SimDistribucion', 'SimFlujo', 'SimFuncion', 'SimGrafo', 'SimInferencia', 'SimMaquinaEstados', 'SimMatrizPrioridad', 'SimSerieTemporal', 'SimTablaSQL', 'SimTransformacion2D'],
    );
  });
});

describe('I10 — citas a fuentes principales', () => {
  it('cita a una fuente inexistente', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace('<Cita f="nist-eda" />', '<Cita f="nadie" />');
    expect(reglas(correr(m), 'I10').some((p) => p.mensaje.includes('"nadie"'))).toBe(true);
  });
  it('cita a una fuente "para ver más"', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace('<Cita f="nist-eda" />', '<Cita f="khan-centro" />');
    expect(reglas(correr(m), 'I10').some((p) => p.mensaje.includes('para ver más'))).toBe(true);
  });
  it('f no es la primera prop', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace('<Cita f="nist-eda" />', '<Cita loc="p. 3" f="nadie" />');
    expect(reglas(correr(m), 'I10')).toHaveLength(1);
  });
});

describe('I11 — toda fuente principal se usa; Formal cita', () => {
  it('fuente principal sin uso', () => {
    const m = mundo();
    // nist-eda se cita una vez en el cuerpo y en 2 tarjetas + 1 problema: se la quita de todos lados
    m.r.tema.cuerpo = cuerpoBase().replace('<Cita f="nist-eda" />', '');
    m.r.practica.data.tarjetas.forEach((t) => { if (t.fuente === 'nist-eda') delete t.fuente; });
    m.r.practica.data.problemas.forEach((p) => { if (p.fuente === 'nist-eda') p.fuente = 'ross'; });
    const p = reglas(correr(m), 'I11');
    expect(p.some((x) => x.campo === 'fuentes.1' && x.mensaje.includes('nist-eda'))).toBe(true);
  });
  it('<Formal> sin ninguna <Cita>', () => {
    const m = mundo();
    m.r.tema.cuerpo = cuerpoBase().replace(/<Cita f="[a-z-]+" \/>/g, '');
    expect(reglas(correr(m), 'I11').some((x) => x.mensaje.includes('<Formal>'))).toBe(true);
  });
});

describe('I12 / I13 — modo estricto: ≥3 temas y ≥2 simuladores por área', () => {
  it('modo normal: no se exige', () => {
    expect(reglas(correr(mundo()), 'I12')).toEqual([]);
    expect(reglas(correr(mundo()), 'I13')).toEqual([]);
  });
  it('estricto: las 6 áreas fallan (el ejemplo no cuenta) y el mensaje dice archivo, campo y regla', () => {
    const p = correr(mundo(), estricto);
    expect(reglas(p, 'I12')).toHaveLength(6);
    expect(reglas(p, 'I13')).toHaveLength(6);
    expect(formatearProblema(reglas(p, 'I12')[0]!)).toBe(
      '[contenido] src/content/areas.yaml → id=analisis-datos: el área "analisis-datos" tiene 1 tema y necesita ≥3 (modo estricto) (regla I12)',
    );
  });
  it('estricto: solo el ejemplo → 0 temas', () => {
    const e = temaEjemplo();
    const p = verificarIntegridad(cargarAreas(), [e.tema], [e.practica], estricto);
    expect(reglas(p, 'I12').find((x) => x.campo === 'id=analisis-datos')!.mensaje).toContain('tiene 0 temas');
  });
  it('estricto: un área con 3 temas y 2+ simuladores pasa', () => {
    const m = mundo();
    for (const [slug, orden] of [['elegir-el-grafico', 2], ['sql-analitico', 3]] as const) {
      const t = temaReal(`analisis-datos/${slug}`, { orden });
      m.temas.push(t.tema);
      m.practicas.push(t.practica);
    }
    const p = correr(m, estricto);
    expect(p.filter((x) => x.campo === 'id=analisis-datos')).toEqual([]);
  });
});

describe('I14 (parte pura) — el ejemplo no cuenta para I3, I12 ni I13', () => {
  it('ya cubierto arriba; el resto de I14 (portada, repaso, buscador) lo cubre el e2e con CAMPUS_INCLUIR_EJEMPLO=1', () => {
    expect(errores(correr(mundo()))).toEqual([]);
  });
});

describe('I15 — ids de área reservados', () => {
  it.each(['ejemplo', 'repaso', 'progreso', 'buscar', 'ajustes', 'pagefind', 'catalogo'])('área "%s"', (id) => {
    const m = mundo();
    m.areas[0]!.id = id;
    expect(reglas(correr(m), 'I15').some((p) => p.campo === `id=${id}`)).toBe(true);
  });
});
