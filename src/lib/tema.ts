// Utilidades de tema (claro/oscuro) para islas con gráficos que necesitan colores resueltos (Plot, canvas).
import { useEffect, useState } from 'react';

export type TemaActual = 'light' | 'dark';

const actual = (): TemaActual => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** Tema vigente; se actualiza cuando cambia `data-theme` en <html>. */
export function useTemaActual(): TemaActual {
  const [t, setT] = useState<TemaActual>(actual);
  useEffect(() => {
    const mo = new MutationObserver(() => setT(actual()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setT(actual());
    return () => mo.disconnect();
  }, []);
  return t;
}

/** Valor resuelto de una variable CSS del tema (ej. `--tinta`). */
export function leerVar(nombre: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(nombre).trim();
}

/** Respeta prefers-reduced-motion. */
export function useMenosMovimiento(): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}
