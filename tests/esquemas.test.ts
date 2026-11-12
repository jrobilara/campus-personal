import { describe, expect, it } from 'vitest';
import { esquemaPractica, esquemaTema, esquemaArea } from '../src/contenido/esquemas';
import { cargarAreas, leerBase, practicaBase, rutasDeError, separarFrontmatter } from './helpers';
import { parse } from 'yaml';

const crudoPractica = () => parse(leerBase('practica.yaml')) as Record<string, any>;
const crudoTema = () => separarFrontmatter(leerBase('tema.mdx')).frontmatter as Record<string, any>;

describe('esquemas: el tema de ejemplo valida', () => {
  it('frontmatter de tema.mdx', () => {
    const r = esquemaTema.safeParse(crudoTema());
    expect(r.error?.issues).toBeUndefined();
    expect(r.success).toBe(true);
  });
  it('practica.yaml', () => {
    const r = esquemaPractica.safeParse(crudoPractica());
    expect(r.error?.issues).toBeUndefined();
    expect(r.success).toBe(true);
  });
  it('areas.yaml (las 6 áreas)', () => {
    const areas = cargarAreas();
    expect(areas).toHaveLength(6);
    expect(areas.map((a) => a.orden)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(areas.filter((a) => a.exigeCasoDeGuardia).map((a) => a.id)).toEqual(['arquitecturas', 'servidores', 'soporte']);
  });
  it('un área con ícono fuera del conjunto cerrado falla', () => {
    const r = esquemaArea.safeParse({ ...cargarAreas()[0], icono: 'cohete' });
    expect(rutasDeError(r)).toContain('icono');
  });
});

describe('esquemas: mutaciones que tienen que fallar, con su ruta', () => {
  it('5 tarjetas → tarjetas', () => {
    const p = crudoPractica();
    p.tarjetas = p.tarjetas.slice(0, 5);
    const r = esquemaPractica.safeParse(p);
    expect(r.success).toBe(false);
    expect(rutasDeError(r)).toContain('tarjetas');
  });
  it('una tarjeta sin dorso → tarjetas.0.dorso', () => {
    const p = crudoPractica();
    delete p.tarjetas[0].dorso;
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('tarjetas.0.dorso');
  });
  it('opción múltiple con 2 correctas → ejercicios.1.opciones', () => {
    const p = crudoPractica();
    p.ejercicios[1].opciones[0].correcta = true;
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('ejercicios.1.opciones');
  });
  it('numérico sin tolerancia → ejercicios.0.tolerancia', () => {
    const p = crudoPractica();
    p.ejercicios[0].tolerancia = {};
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('ejercicios.0.tolerancia');
  });
  it('solo un tipo de ejercicio → ejercicios', () => {
    const p = crudoPractica();
    p.ejercicios = p.ejercicios.filter((e: any) => e.tipo === 'numerico');
    p.ejercicios.push({ ...p.ejercicios[0], id: 'e-otro-1' }, { ...p.ejercicios[0], id: 'e-otro-2' });
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('ejercicios');
  });
  it('caso con ciclo → casos.0.nodos', () => {
    const p = crudoPractica();
    // ver-p95 vuelve a primer-paso
    p.casos[0].nodos[1].opciones[1].va = 'primer-paso';
    const r = esquemaPractica.safeParse(p);
    expect(rutasDeError(r)).toContain('casos.0.nodos');
    expect(r.error?.issues.some((i) => i.message.includes('ciclo'))).toBe(true);
  });
  it('caso con un nodo inalcanzable → casos.0.nodos.<j>', () => {
    const p = crudoPractica();
    p.casos[0].nodos.push({ id: 'huerfano', tipo: 'desenlace', resultado: 'mal', texto: 'Nadie llega acá.' });
    const r = esquemaPractica.safeParse(p);
    expect(rutasDeError(r)).toContain('casos.0.nodos.5');
    expect(r.error?.issues.some((i) => i.message.includes('no se alcanza'))).toBe(true);
  });
  it('caso con opción que apunta a un nodo inexistente → casos.0.nodos.0.opciones.1.va', () => {
    const p = crudoPractica();
    p.casos[0].nodos[0].opciones[1].va = 'no-existe';
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('casos.0.nodos.0.opciones.1.va');
  });
  it('id con prefijo t- usado en un ejercicio → ejercicios.0.id', () => {
    const p = crudoPractica();
    p.ejercicios[0].id = 't-media-con-cuelgue';
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('ejercicios.0.id');
  });
  it('id repetido entre piezas → ruta del segundo', () => {
    const p = crudoPractica();
    p.tarjetas[1].id = p.tarjetas[0].id;
    expect(rutasDeError(esquemaPractica.safeParse(p))).toContain('tarjetas.1.id');
  });
  it('fuente video sin verMas → fuentes.<i>.verMas', () => {
    const t = crudoTema();
    t.fuentes.push({ id: 'yt', tipo: 'video', autor: 'Alguien', titulo: 'Un video', url: 'https://example.com/v' });
    const r = esquemaTema.safeParse(t);
    expect(rutasDeError(r)).toContain('fuentes.3.verMas');
    expect(r.error?.issues.some((i) => i.message.includes('para ver más'))).toBe(true);
  });
  it('fuente `articulo`: vale como fuente principal y pide la revista o conferencia (edicion)', () => {
    const t = crudoTema();
    t.fuentes.push({ id: 'dean-tail', tipo: 'articulo', autor: 'Jeffrey Dean y Luiz André Barroso', titulo: 'The Tail at Scale', edicion: 'Communications of the ACM 56(2), 2013', url: 'https://doi.org/10.1145/2408776.2408794' });
    const ok = esquemaTema.parse(t);
    const art = ok.fuentes.find((f) => f.id === 'dean-tail')!;
    expect(art.tipo).toBe('articulo');
    expect(art.verMas).toBe(false); // un artículo no es "para ver más" por defecto
    const sin = crudoTema();
    sin.fuentes.push({ id: 'dean-tail', tipo: 'articulo', autor: 'X', titulo: 'Y' });
    expect(rutasDeError(esquemaTema.safeParse(sin))).toContain('fuentes.3.edicion');
    const http = crudoTema();
    http.fuentes.push({ id: 'dean-tail', tipo: 'articulo', autor: 'X', titulo: 'Y', edicion: '2013', url: 'http://inseguro.com' });
    expect(rutasDeError(esquemaTema.safeParse(http))).toContain('fuentes.3.url');
  });
  it('una sola fuente principal → fuentes', () => {
    const t = crudoTema();
    t.fuentes[1].verMas = true;
    const r = esquemaTema.safeParse(t);
    expect(rutasDeError(r)).toContain('fuentes');
    expect(r.error?.issues.some((i) => i.message.includes('≥2 fuentes'))).toBe(true);
  });
  it('fuente con id repetido → fuentes.<i>.id', () => {
    const t = crudoTema();
    t.fuentes[1].id = 'ross';
    expect(rutasDeError(esquemaTema.safeParse(t))).toContain('fuentes.1.id');
  });
  it('resumen corto, sin materias, minutos fuera de rango', () => {
    const t = crudoTema();
    t.resumen = 'corto';
    t.materias = [];
    t.minutos = 200;
    const rutas = rutasDeError(esquemaTema.safeParse(t));
    expect(rutas).toEqual(expect.arrayContaining(['resumen', 'materias', 'minutos']));
  });
  it('slug con tilde o mayúsculas → area', () => {
    const t = crudoTema();
    t.area = 'Análisis';
    expect(rutasDeError(esquemaTema.safeParse(t))).toContain('area');
  });
  it('el ejemplo parseado queda con ejemplo: true y fecha como Date', () => {
    const r = esquemaTema.parse(crudoTema());
    expect(r.ejemplo).toBe(true);
    expect(r.fechaVerificacion).toBeInstanceOf(Date);
    expect(practicaBase().casos).toHaveLength(1);
  });
});
