// Formato ProgresoV1 (PROGRESO-JSON.md §2.2). Módulo puro: no importa nada del navegador ni de astro:content.
import { z } from 'astro/zod';

const RE_ID_GLOBAL = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*#[tecp]-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RE_DIA = /^\d{4}-\d{2}-\d{2}$/;
const iso = z.iso.datetime({ offset: true });

const idGlobal = z.string().regex(RE_ID_GLOBAL);

/** Card de ts-fsrs 6 serializado (fechas como string ISO). looseObject: tolera campos nuevos de versiones futuras. */
export const esquemaCardSerializado = z.looseObject({
  stability: z.number().nonnegative(),
  stabilityFast: z.number().nonnegative(),
  difficulty: z.number().nonnegative(),
  dueAt: iso,
  lastReviewAt: iso.nullable(),
  state: z.number().int().min(0).max(3),
  scheduleStatus: z.string(),
  cardId: z.string(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  scheduledDays: z.number().nonnegative(),
  learningStep: z.number().int().nonnegative(),
});

export const esquemaRevlogSerializado = z.looseObject({
  rating: z.number().int().min(1).max(4),
  state: z.number().int().min(0).max(3),
  reviewTime: iso,
  dueAt: iso,
  lastReviewAt: iso.nullable(),
  stability: z.number(),
  stabilityFast: z.number(),
  difficulty: z.number(),
  scheduledDays: z.number(),
  learningStep: z.number().int(),
  scheduleStatus: z.string(),
  cardId: z.string(),
});

const resultadoCaso = z.enum(['bien', 'regular', 'mal']);

export const esquemaProgresoV1 = z
  .object({
    app: z.literal('campus-personal'),
    version: z.literal(1),
    exportadoEn: iso.nullable(),
    fsrs: z.object({ libreria: z.string(), modelo: z.string() }),
    tarjetas: z.record(idGlobal, z.object({ card: esquemaCardSerializado })),
    revlog: z.array(z.object({ tarjeta: idGlobal, log: esquemaRevlogSerializado })),
    ejercicios: z
      .record(
        idGlobal,
        z.object({
          intentos: z.number().int().min(1),
          aciertos: z.number().int().min(0),
          ultimoResultado: z.enum(['acierto', 'error']),
          ultimoEn: iso,
        }),
      )
      .refine((r) => Object.values(r).every((e) => e.aciertos <= e.intentos), 'aciertos no puede superar intentos'),
    casos: z.record(
      idGlobal,
      z.object({ intentos: z.number().int().min(1), mejorResultado: resultadoCaso, ultimoResultado: resultadoCaso, ultimoEn: iso }),
    ),
    diasDeEstudio: z.record(z.string().regex(RE_DIA), z.number().int().min(1)),
  })
  .superRefine((p, ctx) => {
    // Prefijo por colección: t- en tarjetas, e- en ejercicios, c- en casos.
    const prefijo = (coleccion: string, ids: string[], pref: string) =>
      ids.forEach((id) => {
        if (!id.split('#')[1]?.startsWith(`${pref}-`)) {
          ctx.addIssue({ code: 'custom', path: [coleccion, id], message: `el id tiene que ser de ${coleccion} (empieza con "${pref}-" después del #)` });
        }
      });
    prefijo('tarjetas', Object.keys(p.tarjetas), 't');
    prefijo('ejercicios', Object.keys(p.ejercicios), 'e');
    prefijo('casos', Object.keys(p.casos), 'c');
    p.revlog.forEach((r, i) => {
      if (!r.tarjeta.split('#')[1]?.startsWith('t-')) {
        ctx.addIssue({ code: 'custom', path: ['revlog', i, 'tarjeta'], message: 'el id tiene que ser de una tarjeta (empieza con "t-" después del #)' });
      }
    });
  });

export type ProgresoV1 = z.infer<typeof esquemaProgresoV1>;
export type CardSerializado = z.infer<typeof esquemaCardSerializado>;
export type RevlogSerializado = z.infer<typeof esquemaRevlogSerializado>;

export const VERSION_ACTUAL = 1;

export const progresoVacio = (): ProgresoV1 => ({
  app: 'campus-personal',
  version: 1,
  exportadoEn: null,
  fsrs: { libreria: 'ts-fsrs@6.0.0', modelo: 'FSRS-7' },
  tarjetas: {},
  revlog: [],
  ejercicios: {},
  casos: {},
  diasDeEstudio: {},
});
