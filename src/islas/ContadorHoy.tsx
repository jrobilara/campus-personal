import { useParaHoy } from '../progreso/hooks';

/** Insignia del contador "Para hoy" en la navegación. Vacía (oculta) si no toca nada. */
export default function ContadorHoy() {
  const hoy = useParaHoy();
  const n = hoy?.total ?? 0;
  return (
    <span className="insignia" data-testid="contador-hoy" aria-label={n ? `${n} para hoy` : undefined} role={n ? 'img' : undefined}>
      {n > 0 ? (n > 99 ? '99+' : n) : ''}
    </span>
  );
}
