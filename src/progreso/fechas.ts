// Fechas en el día local del navegador (los tests fijan TZ=America/Argentina/Buenos_Aires).
const dos = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` en hora local. */
export function diaLocal(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}
/** 23:59:59.999 del día local de `d`. */
export function finDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
export function inicioDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function sumarDias(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}
/** Parsea `YYYY-MM-DD` como medianoche local. */
export function desdeDia(dia: string): Date {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(a!, m! - 1, d!);
}
