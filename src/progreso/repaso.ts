// Selección de tarjetas para el repaso de hoy (PROGRESO-JSON.md §3.1). Módulo puro.
import type { Catalogo, CatalogoTarjeta } from './tipos';
import type { ProgresoV1 } from './esquema';
import { diaLocal, finDelDia } from './fechas';

export interface Filtro { tema?: string; area?: string }
export interface Cola {
  /** vencidas ya (dueAt ≤ ahora), ordenadas por dueAt */
  vencidas: CatalogoTarjeta[];
  /** en aprendizaje o repaso con dueAt más tarde hoy */
  masTarde: CatalogoTarjeta[];
  /** nuevas que entran hoy (respetando el límite diario, salvo en modo tema) */
  nuevas: CatalogoTarjeta[];
  /** nuevas que quedan fuera por el límite diario */
  nuevasFuera: number;
}

/** Cuántas tarjetas nuevas se calificaron hoy (revlog de hoy con state 0). */
export function nuevasCalificadasHoy(p: ProgresoV1, ahora: Date): number {
  const hoy = diaLocal(ahora);
  return p.revlog.filter((r) => r.log.state === 0 && diaLocal(new Date(r.log.reviewTime)) === hoy).length;
}

export function construirCola(cat: Catalogo, p: ProgresoV1, ahora: Date, nuevasPorDia: number, filtro: Filtro = {}): Cola {
  const candidatas = cat.tarjetas.filter((t) => (!filtro.tema || t.tema === filtro.tema) && (!filtro.area || t.area === filtro.area));
  const fin = finDelDia(ahora).getTime();
  const venc: { t: CatalogoTarjeta; due: number }[] = [];
  const mas: { t: CatalogoTarjeta; due: number }[] = [];
  const nuevas: CatalogoTarjeta[] = [];
  for (const t of candidatas) {
    const e = p.tarjetas[t.id];
    if (!e) { nuevas.push(t); continue; }
    const due = new Date(e.card.dueAt).getTime();
    if (due <= ahora.getTime()) venc.push({ t, due });
    else if (due <= fin) mas.push({ t, due });
  }
  const orden = (a: { due: number }, b: { due: number }) => a.due - b.due;
  venc.sort(orden);
  mas.sort(orden);
  const limite = filtro.tema ? Infinity : Math.max(0, nuevasPorDia - nuevasCalificadasHoy(p, ahora));
  const entran = limite === Infinity ? nuevas : nuevas.slice(0, limite);
  return {
    vencidas: venc.map((x) => x.t),
    masTarde: mas.map((x) => x.t),
    nuevas: entran,
    nuevasFuera: nuevas.length - entran.length,
  };
}

/** Número del contador "Para hoy": vencidas + más tarde hoy + nuevas que entran. */
export function contarParaHoy(c: Cola): number {
  return c.vencidas.length + c.masTarde.length + c.nuevas.length;
}
