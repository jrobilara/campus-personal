// Catálogo para las islas (repaso, progreso, portada): áreas, temas y piezas de práctica con ids globales.
// Frente y dorso de las tarjetas ya vienen renderizados a HTML. Sin tema de ejemplo (salvo CAMPUS_INCLUIR_EJEMPLO=1, regla I14).
import type { APIRoute } from 'astro';
import { cargarCampus } from '../contenido/campus';
import { textoCorto } from '../lib/texto-corto';
import type { Catalogo } from '../progreso/tipos';

export const GET: APIRoute = async () => {
  const campus = await cargarCampus();
  const catalogo: Catalogo = {
    areas: campus.areas.map((a) => ({
      id: a.id, nombre: a.nombre, orden: a.orden, color: a.color, colorOscuro: a.colorOscuro, exigeCasoDeGuardia: a.exigeCasoDeGuardia,
    })),
    temas: campus.temas.map((t) => ({ id: t.id, area: t.area, titulo: t.data.titulo, orden: t.data.orden })),
    tarjetas: campus.temas.flatMap((t) =>
      t.practica.tarjetas.map((c) => ({
        id: `${t.id}#${c.id}`, tema: t.id, area: t.area, frenteHtml: textoCorto(c.frente), dorsoHtml: textoCorto(c.dorso),
      })),
    ),
    ejercicios: campus.temas.flatMap((t) => t.practica.ejercicios.map((e) => ({ id: `${t.id}#${e.id}`, tema: t.id, area: t.area }))),
    casos: campus.temas.flatMap((t) => t.practica.casos.map((c) => ({ id: `${t.id}#${c.id}`, tema: t.id, area: t.area }))),
  };
  return new Response(JSON.stringify(catalogo), { headers: { 'Content-Type': 'application/json' } });
};
