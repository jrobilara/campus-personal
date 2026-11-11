// FSRS con ts-fsrs 6 (PROGRESO-JSON.md §3). API nueva: DefaultScheduler / newCard / preview / review.
import { DefaultScheduler } from 'ts-fsrs';
import type { CardSerializado, ProgresoV1, RevlogSerializado } from './esquema';
import { diaLocal, finDelDia } from './fechas';

export const CONFIG_FSRS = {
  version: 'FSRS-7',
  desiredRetention: 0.9,
  enableFuzz: false, // sin azar: el test con reloj fijo es determinista
  enableShortTerm: true,
  learningSteps: ['1m', '10m'],
  relearningSteps: ['10m'],
  maximumInterval: 36_500,
} as const;

export type Planificador = Awaited<ReturnType<typeof DefaultScheduler>>;
export type Nota = 1 | 2 | 3 | 4;

let memo: Promise<Planificador> | undefined;
export function crearPlanificador(): Promise<Planificador> {
  memo ??= DefaultScheduler({ ...CONFIG_FSRS, learningSteps: [...CONFIG_FSRS.learningSteps], relearningSteps: [...CONFIG_FSRS.relearningSteps] } as never);
  return memo;
}

export type CardFsrs = ReturnType<Planificador['newCard']>;
type RevlogFsrs = ReturnType<Planificador['review']>['revlog'];

const aIso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export function serializarCard(c: CardFsrs): CardSerializado {
  return { ...(c as object), dueAt: aIso(c.dueAt)!, lastReviewAt: aIso(c.lastReviewAt) } as CardSerializado;
}
/** Un card que pasó por JSON falla en review() con SRSSchemaError: hay que reconvertir las fechas. */
export function deserializarCard(s: CardSerializado): CardFsrs {
  return { ...s, dueAt: new Date(s.dueAt), lastReviewAt: s.lastReviewAt ? new Date(s.lastReviewAt) : null } as unknown as CardFsrs;
}
export function serializarRevlog(l: RevlogFsrs): RevlogSerializado {
  return {
    ...(l as object),
    reviewTime: aIso(l.reviewTime)!,
    dueAt: aIso(l.dueAt)!,
    lastReviewAt: aIso(l.lastReviewAt),
  } as RevlogSerializado;
}

/** Califica (versión síncrona, para usar dentro de `update` de idb-keyval). Devuelve el progreso nuevo, sin mutar el anterior. */
export function calificarSync(plan: Planificador, p: ProgresoV1, idTarjeta: string, nota: Nota, ahora: Date): ProgresoV1 {
  const previo = p.tarjetas[idTarjeta];
  const card = previo ? deserializarCard(previo.card) : plan.newCard({ now: ahora });
  const r = plan.review({ card: card as never, grade: nota, now: ahora });
  const dia = diaLocal(ahora);
  return {
    ...p,
    tarjetas: { ...p.tarjetas, [idTarjeta]: { card: serializarCard(r.card) } },
    revlog: [...p.revlog, { tarjeta: idTarjeta, log: serializarRevlog(r.revlog) }],
    diasDeEstudio: { ...p.diasDeEstudio, [dia]: (p.diasDeEstudio[dia] ?? 0) + 1 },
  };
}

export async function calificar(p: ProgresoV1, idTarjeta: string, nota: Nota, ahora: Date): Promise<ProgresoV1> {
  return calificarSync(await crearPlanificador(), p, idTarjeta, nota, ahora);
}

/** Para hoy: la tarjeta tiene estado y su dueAt es ≤ al fin del día local de `ahora`. */
export function estaParaHoy(c: CardSerializado, ahora: Date): boolean {
  return new Date(c.dueAt).getTime() <= finDelDia(ahora).getTime();
}

/** Texto corto de un intervalo: "10 min", "5 h", "4 d", "2 meses". */
export function textoIntervalo(desde: Date, hasta: Date): string {
  const min = Math.max(1, Math.round((hasta.getTime() - desde.getTime()) / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d`;
  const m = Math.round(d / 30);
  if (m < 12) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  return `${(d / 365).toFixed(1).replace('.', ',')} años`;
}

/** Intervalos que resultarían de cada botón (otra vez, difícil, bien, fácil). */
export function intervalosPrevistos(plan: Planificador, p: ProgresoV1, idTarjeta: string, ahora: Date): Record<Nota, string> {
  const previo = p.tarjetas[idTarjeta];
  const card = previo ? deserializarCard(previo.card) : plan.newCard({ now: ahora });
  const out = {} as Record<Nota, string>;
  for (const x of plan.preview({ card: card as never, now: ahora }).map((v) => v)) {
    out[x.grade as Nota] = textoIntervalo(ahora, x.card.dueAt);
  }
  return out;
}
