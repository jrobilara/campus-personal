// Métricas del panel (PROGRESO-JSON.md §5). `ahora` inyectable; sin temas de ejemplo ni huérfanos (el catálogo ya no los trae).
import type { Catalogo } from './tipos';
import type { ProgresoV1 } from './esquema';
import { crearPlanificador, deserializarCard } from './fsrs';
import { construirCola } from './repaso';
import { diaLocal, finDelDia, sumarDias } from './fechas';

export interface DominioArea {
  id: string;
  dominio: number; // 0-100
  tarjetas: number; // T_a, 0-1
  ejercicios: number; // E_a, 0-1
  casos: number; // C_a, 0-1
  tarjetasVistas: number;
  tarjetasTotal: number;
  ejerciciosBien: number;
  ejerciciosTotal: number;
  casosHechos: number;
  casosTotal: number;
  vencidasHoy: number;
}
export interface Panel {
  areas: DominioArea[];
  paraHoy: { vencidas: number; nuevas: number; total: number };
  proximos7: { dia: string; cantidad: number }[];
  /** 26 semanas, de la más vieja a la actual, cada una con 7 días (lun-dom). */
  calendario: { dia: string; cantidad: number; nivel: 0 | 1 | 2 | 3; futuro: boolean }[][];
  racha: number;
  diasUltimos30: number;
}

export const nivelDeIntensidad = (n: number): 0 | 1 | 2 | 3 => (n <= 0 ? 0 : n <= 5 ? 1 : n <= 15 ? 2 : 3);

export function calcularRacha(dias: Record<string, number>, ahora: Date): number {
  let d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  if (!dias[diaLocal(d)]) d = sumarDias(d, -1); // la racha puede terminar ayer
  let n = 0;
  while (dias[diaLocal(d)]) { n++; d = sumarDias(d, -1); }
  return n;
}

export async function calcularPanel(cat: Catalogo, p: ProgresoV1, ahora: Date, nuevasPorDia = 10): Promise<Panel> {
  const plan = await crearPlanificador();
  const fin = finDelDia(ahora).getTime();

  const areas: DominioArea[] = cat.areas
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((a) => {
      const tarj = cat.tarjetas.filter((t) => t.area === a.id);
      const ejs = cat.ejercicios.filter((e) => e.area === a.id);
      const cs = cat.casos.filter((c) => c.area === a.id);
      let suma = 0, vistas = 0, vencidasHoy = 0;
      for (const t of tarj) {
        const e = p.tarjetas[t.id];
        if (!e) continue;
        vistas++;
        const c = deserializarCard(e.card);
        if (c.lastReviewAt) {
          const dias = Math.max(0, plan.chrono.difference(c.lastReviewAt, ahora));
          suma += Math.min(1, Math.max(0, plan.model.forgettingCurve(c as never, dias)));
        }
        if (new Date(e.card.dueAt).getTime() <= fin) vencidasHoy++;
      }
      const T = tarj.length ? suma / tarj.length : 0;
      const ejBien = ejs.filter((e) => p.ejercicios[e.id]?.ultimoResultado === 'acierto').length;
      const E = ejs.length ? ejBien / ejs.length : 0;
      const puntos = { bien: 1, regular: 0.5, mal: 0 } as const;
      const casosHechos = cs.filter((c) => p.casos[c.id]).length;
      const C = cs.length ? cs.reduce((s, c) => s + (p.casos[c.id] ? puntos[p.casos[c.id]!.mejorResultado] : 0), 0) / cs.length : 0;
      const dominio = cs.length ? Math.round(100 * (0.6 * T + 0.3 * E + 0.1 * C)) : Math.round(100 * (0.7 * T + 0.3 * E));
      return {
        id: a.id, dominio, tarjetas: T, ejercicios: E, casos: C,
        tarjetasVistas: vistas, tarjetasTotal: tarj.length, ejerciciosBien: ejBien, ejerciciosTotal: ejs.length,
        casosHechos, casosTotal: cs.length, vencidasHoy,
      };
    });

  const cola = construirCola(cat, p, ahora, nuevasPorDia);
  const paraHoy = {
    vencidas: cola.vencidas.length + cola.masTarde.length,
    nuevas: cola.nuevas.length,
    total: cola.vencidas.length + cola.masTarde.length + cola.nuevas.length,
  };

  const proximos7 = Array.from({ length: 7 }, (_, i) => ({ dia: diaLocal(sumarDias(ahora, i + 1)), cantidad: 0 }));
  const idxDia = new Map(proximos7.map((x, i) => [x.dia, i]));
  for (const t of cat.tarjetas) {
    const e = p.tarjetas[t.id];
    if (!e) continue;
    const i = idxDia.get(diaLocal(new Date(e.card.dueAt)));
    if (i !== undefined) proximos7[i]!.cantidad++;
  }

  // Calendario: 26 columnas (semanas lun-dom); la última contiene a `ahora`.
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const dowLunes = (hoy.getDay() + 6) % 7; // 0 = lunes
  const lunesActual = sumarDias(hoy, -dowLunes);
  const calendario = Array.from({ length: 26 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const dia = sumarDias(lunesActual, (w - 25) * 7 + d);
      const k = diaLocal(dia);
      const cantidad = p.diasDeEstudio[k] ?? 0;
      return { dia: k, cantidad, nivel: nivelDeIntensidad(cantidad), futuro: dia.getTime() > hoy.getTime() };
    }),
  );
  let ultimos30 = 0;
  for (let i = 0; i < 30; i++) if (p.diasDeEstudio[diaLocal(sumarDias(hoy, -i))]) ultimos30++;
  return { areas, paraHoy, proximos7, calendario, racha: calcularRacha(p.diasDeEstudio, ahora), diasUltimos30: ultimos30 };
}
