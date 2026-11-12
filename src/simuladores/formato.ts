/** Número con coma decimal y `dec` decimales (las lecturas de los simuladores usan este formato). */
export function num(n: number, dec = 2): string {
  if (!Number.isFinite(n)) return '—';
  const s = n.toFixed(dec);
  return (s === `-${(0).toFixed(dec)}` ? s.slice(1) : s).replace('.', ',');
}
/** Parsea lo que muestra `num` (para los tests). */
export const desdeNum = (s: string) => Number(s.replace(',', '.'));
