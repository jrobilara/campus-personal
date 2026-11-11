// Progreso en el navegador: idb-keyval + suscripción para que las islas se actualicen (también entre pestañas).
import { del, get, set, update } from 'idb-keyval';
import { useSyncExternalStore } from 'react';
import { esquemaProgresoV1, progresoVacio, type ProgresoV1 } from './esquema';
import { calificarSync, crearPlanificador, type Nota } from './fsrs';
import { diaLocal } from './fechas';
import { CLAVE_PROGRESO, type Almacen } from './importar';

export const almacenIdb: Almacen = {
  leer: (c) => get(c),
  escribir: (c, v) => set(c, v),
  borrar: (c) => del(c),
};

let cache: ProgresoV1 | null = null;
let cargando: Promise<void> | null = null;
const oyentes = new Set<() => void>();
const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('campus-progreso') : null;

const notificar = () => oyentes.forEach((f) => f());
const interpretar = (crudo: unknown): ProgresoV1 => {
  if (crudo === undefined) return progresoVacio();
  const r = esquemaProgresoV1.safeParse(crudo);
  if (!r.success) { console.warn('[progreso] el progreso guardado no es válido; empiezo vacío', r.error.issues[0]); return progresoVacio(); }
  return r.data;
};

export async function recargar(): Promise<ProgresoV1> {
  cache = interpretar(await get(CLAVE_PROGRESO));
  notificar();
  return cache;
}
function asegurarCarga() {
  if (!cache && !cargando) cargando = recargar().then(() => { cargando = null; });
}
if (canal) canal.onmessage = () => { void recargar(); };

export async function leerProgreso(): Promise<ProgresoV1> {
  return cache ?? (await recargar());
}

/** Escritura atómica (transacción de idb-keyval): dos pestañas no se pisan a mitad de una escritura. */
export async function mutar(fn: (p: ProgresoV1) => ProgresoV1): Promise<ProgresoV1> {
  let nuevo = progresoVacio();
  await update<unknown>(CLAVE_PROGRESO, (viejo) => { nuevo = fn(interpretar(viejo)); return nuevo; });
  cache = nuevo;
  notificar();
  canal?.postMessage('cambio');
  return nuevo;
}

/** Después de importar, deshacer o reiniciar: vuelve a leer y avisa a las demás pestañas. */
export async function avisarCambioExterno() {
  await recargar();
  canal?.postMessage('cambio');
}

/** `null` mientras carga (y en el servidor). */
export function useProgreso(): ProgresoV1 | null {
  return useSyncExternalStore(
    (cb) => { oyentes.add(cb); asegurarCarga(); return () => oyentes.delete(cb); },
    () => cache,
    () => null,
  );
}

// ---------- Acciones (cada una suma 1 a diasDeEstudio) ----------
const sumarDia = (p: ProgresoV1, ahora: Date) => {
  const d = diaLocal(ahora);
  return { ...p.diasDeEstudio, [d]: (p.diasDeEstudio[d] ?? 0) + 1 };
};

export function registrarEjercicio(id: string, ok: boolean) {
  const ahora = new Date();
  return mutar((p) => {
    const prev = p.ejercicios[id];
    return {
      ...p,
      ejercicios: { ...p.ejercicios, [id]: { intentos: (prev?.intentos ?? 0) + 1, aciertos: (prev?.aciertos ?? 0) + (ok ? 1 : 0), ultimoResultado: ok ? 'acierto' : 'error', ultimoEn: ahora.toISOString() } },
      diasDeEstudio: sumarDia(p, ahora),
    };
  });
}

const PUNTOS = { bien: 2, regular: 1, mal: 0 } as const;
export function registrarCaso(id: string, resultado: 'bien' | 'regular' | 'mal') {
  const ahora = new Date();
  return mutar((p) => {
    const prev = p.casos[id];
    const mejor = prev && PUNTOS[prev.mejorResultado] >= PUNTOS[resultado] ? prev.mejorResultado : resultado;
    return {
      ...p,
      casos: { ...p.casos, [id]: { intentos: (prev?.intentos ?? 0) + 1, mejorResultado: mejor, ultimoResultado: resultado, ultimoEn: ahora.toISOString() } },
      diasDeEstudio: sumarDia(p, ahora),
    };
  });
}

export async function calificarTarjeta(id: string, nota: Nota) {
  const plan = await crearPlanificador();
  const ahora = new Date();
  return mutar((p) => calificarSync(plan, p, id, nota, ahora));
}
