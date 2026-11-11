// Observable Plot dentro de React: imperativo, se reemplaza el nodo en cada cambio (trampa 12).
import * as Plot from '@observablehq/plot';
import { useEffect, useRef, useState, type DependencyList } from 'react';
import { leerVar, useTemaActual } from './tema';

export interface ColoresTema { tinta: string; suave: string; linea: string; papel: string; superficie: string; marca: string; ok: string; mal: string; area: string }

export function coloresDelTema(el?: Element): ColoresTema {
  return {
    tinta: leerVar('--tinta', el), suave: leerVar('--suave', el), linea: leerVar('--linea', el), papel: leerVar('--papel', el),
    superficie: leerVar('--superficie', el), marca: leerVar('--marca', el), ok: leerVar('--ok', el), mal: leerVar('--mal', el), area: leerVar('--color-area', el),
  };
}

/** Ancho del contenedor (se actualiza con ResizeObserver). */
export function useAncho(ref: React.RefObject<HTMLElement | null>, inicial = 320): number {
  const [w, setW] = useState(inicial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(220, Math.floor(el.clientWidth))));
    ro.observe(el);
    setW(Math.max(220, Math.floor(el.clientWidth)));
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

interface Props {
  /** Construye las opciones de Plot con el ancho y los colores del tema vigente. */
  opciones: (ancho: number, c: ColoresTema) => Plot.PlotOptions;
  deps: DependencyList;
  etiqueta: string;
  className?: string;
  testid?: string;
}

export function GraficoPlot({ opciones, deps, etiqueta, className = 'grafico', testid }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ancho = useAncho(ref);
  const tema = useTemaActual();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = coloresDelTema(el);
    const svg = Plot.plot({ style: { background: 'transparent', color: c.tinta, fontFamily: 'var(--f-texto)', fontSize: '12px' }, ...opciones(ancho, c) });
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', etiqueta);
    el.replaceChildren(svg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ancho, tema, ...deps]);
  return <div ref={ref} className={className} data-testid={testid} />;
}
