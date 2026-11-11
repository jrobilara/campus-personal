// Corrección de ejercicios numéricos (CONTRATO §8.3). Módulo puro: lo usa la isla y lo prueba Vitest.

export interface Tolerancia {
  absoluta?: number;
  relativa?: number;
}

/** Acepta coma o punto decimal, espacios y el signo menos tipográfico. Devuelve null si no es un número. */
export function parsearNumero(entrada: string): number | null {
  const t = entrada.trim().replace(/\s+/g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Correcto si |x − respuesta| ≤ absoluta o |x − respuesta| ≤ relativa·|respuesta| (alcanza una de las dos). */
export function dentroDeTolerancia(x: number, respuesta: number, tol: Tolerancia): boolean {
  const d = Math.abs(x - respuesta);
  const eps = 1e-9 * Math.max(1, Math.abs(respuesta));
  if (tol.absoluta !== undefined && d <= tol.absoluta + eps) return true;
  if (tol.relativa !== undefined && d <= tol.relativa * Math.abs(respuesta) + eps) return true;
  return false;
}

export type ResultadoNumerico =
  | { estado: 'invalido' }
  | { estado: 'ok'; valor: number }
  | { estado: 'error'; valor: number; errorComun?: number };

/**
 * Corrige una respuesta. Si es incorrecta y coincide (con la misma tolerancia) con algún `erroresComunes[i].valor`,
 * devuelve el índice `errorComun` para mostrar esa explicación específica.
 */
export function corregirNumerico(
  entrada: string,
  ej: { respuesta: number; tolerancia: Tolerancia; erroresComunes: { valor: number }[] },
): ResultadoNumerico {
  const valor = parsearNumero(entrada);
  if (valor === null) return { estado: 'invalido' };
  if (dentroDeTolerancia(valor, ej.respuesta, ej.tolerancia)) return { estado: 'ok', valor };
  const i = ej.erroresComunes.findIndex((e) => dentroDeTolerancia(valor, e.valor, ej.tolerancia));
  return { estado: 'error', valor, errorComun: i >= 0 ? i : undefined };
}
