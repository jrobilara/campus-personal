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
