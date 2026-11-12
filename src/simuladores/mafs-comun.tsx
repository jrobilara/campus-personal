// Piezas compartidas de los simuladores hechos con Mafs (SimFuncion y SimTransformacion2D).
import { Coordinates, Mafs } from 'mafs';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/** Ancho en px de un elemento, con ResizeObserver (320 mientras no se mide: así el SSR y el primer render ya son móviles). */
export function useAnchoElemento(ref: RefObject<Element | null>, inicial = 320): number {
  const [w, setW] = useState(inicial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setW(Math.max(1, Math.round(el.getBoundingClientRect().width)));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Etiqueta de eje con coma decimal. */
export const etiquetaEje = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');

/** Paso "lindo" (1, 2, 5 × 10ⁿ) para tener unas `objetivo` divisiones en `rango`. */
export function pasoLindo(rango: number, objetivo = 6): number {
  const crudo = rango / objetivo;
  const pot = Math.pow(10, Math.floor(Math.log10(crudo)));
  const f = crudo / pot;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pot;
}

interface LienzoProps {
  x: [number, number];
  y: [number, number];
  /** alto como proporción del ancho, entre `min` y `max` px */
  alto: { ratio: number; min: number; max: number };
  /** true: x e y con la misma escala (cuadrado = cuadrado); el alto sale del ancho */
  igualEscala?: boolean;
  etiqueta: string;
  /** pasos de las líneas de la grilla; por defecto se calculan */
  pasoX?: number;
  pasoY?: number;
  subdivisiones?: boolean;
  clase?: string;
  children: ReactNode;
}

/** Marco de un plano Mafs: mide el ancho, calcula el alto, fija la ventana, sin pan ni zoom (para no robar el scroll en el celular). */
export function Lienzo({ x, y, alto, igualEscala, etiqueta, pasoX, pasoY, subdivisiones, clase, children }: LienzoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ancho = useAnchoElemento(ref);
  const h = Math.round(Math.min(alto.max, Math.max(alto.min, ancho * alto.ratio)));
  const px = pasoX ?? pasoLindo(x[1] - x[0], Math.max(3, Math.round(ancho / 70)));
  const py = pasoY ?? pasoLindo(y[1] - y[0], Math.max(3, Math.round(h / 55)));
  return (
    <div ref={ref} className={`sim-lienzo sf-lienzo${clase ? ` ${clase}` : ''}`} role="img" aria-label={etiqueta}>
      <Mafs
        height={h} pan={false} zoom={false}
        viewBox={{ x, y, padding: 0 }}
        preserveAspectRatio={igualEscala ? 'contain' : false}
      >
        <Coordinates.Cartesian
          xAxis={{ lines: px, labels: etiquetaEje }}
          yAxis={{ lines: py, labels: etiquetaEje }}
          subdivisions={subdivisiones ? 2 : false}
        />
        {children}
      </Mafs>
    </div>
  );
}
