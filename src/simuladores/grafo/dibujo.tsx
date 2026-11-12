// SimGrafo: piezas de dibujo SVG (nodos, aristas con flecha, rótulos). Sin lógica de algoritmos.
import type { KeyboardEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import type { AristaG, GrafoDef, NodoG } from './grafos';

export const RADIO = 29;
export const ALTO_RECT = 32;

const nodoPorId = (g: GrafoDef, id: string): NodoG => g.nodos.find((n) => n.id === id)!;

/** Distancia desde el centro del nodo hasta su borde en la dirección (ux, uy). */
function alBorde(g: GrafoDef, n: NodoG, ux: number, uy: number): number {
  if (g.forma === 'circulo') return RADIO;
  const hw = (n.w ?? 70) / 2, hh = ALTO_RECT / 2;
  return Math.min(hw / Math.max(Math.abs(ux), 1e-9), hh / Math.max(Math.abs(uy), 1e-9));
}

interface PropsArista {
  g: GrafoDef;
  arista: AristaG;
  clase?: string;
  /** texto en el punto medio (peso, por ejemplo) */
  rotulo?: string;
  rotuloClase?: string;
  /** dibuja la línea creciendo de punta a punta (camino mínimo) */
  animada?: boolean;
  sinMovimiento?: boolean;
  grosor?: number;
}

export function Arista({ g, arista, clase = '', rotulo, rotuloClase = '', animada, sinMovimiento, grosor }: PropsArista) {
  const a = nodoPorId(g, arista.de), b = nodoPorId(g, arista.a);
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const sep = 3;
  const x1 = a.x + ux * (alBorde(g, a, ux, uy) + sep), y1 = a.y + uy * (alBorde(g, a, ux, uy) + sep);
  const x2 = b.x - ux * (alBorde(g, b, ux, uy) + sep), y2 = b.y - uy * (alBorde(g, b, ux, uy) + sep);
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const estilo = grosor ? { strokeWidth: grosor } : undefined;
  // la línea de una arista dirigida termina en la base de la flecha
  const fin = g.dirigido ? { x: x2 - ux * 9, y: y2 - uy * 9 } : { x: x2, y: y2 };
  return (
    <g className={`sg-arista ${clase}`} aria-hidden="true">
      {animada ? (
        <motion.line
          x1={x1} y1={y1} x2={fin.x} y2={fin.y} style={estilo}
          initial={sinMovimiento ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ) : (
        <line x1={x1} y1={y1} x2={fin.x} y2={fin.y} style={estilo} />
      )}
      {g.dirigido && (
        <path
          className="sg-flecha"
          d={`M ${x2} ${y2} L ${x2 - ux * 10 - uy * 5} ${y2 - uy * 10 + ux * 5} L ${x2 - ux * 10 + uy * 5} ${y2 - uy * 10 - ux * 5} Z`}
        />
      )}
      {rotulo !== undefined && (
        <g className={`sg-rotulo ${rotuloClase}`} transform={`translate(${mx} ${my})`}>
          <rect x={-(rotulo.length * 4.2 + 6)} y={-9.5} width={rotulo.length * 8.4 + 12} height={19} rx={9.5} />
          <text textAnchor="middle" dy="0.34em">{rotulo}</text>
        </g>
      )}
    </g>
  );
}

interface PropsNodo {
  g: GrafoDef;
  nodo: NodoG;
  clase?: string;
  /** texto accesible completo; si hay `onActivar` el nodo es un botón */
  aria: string;
  presionado?: boolean;
  onActivar?: () => void;
  /** número chico en la esquina (orden de visita, de instalación…) */
  insignia?: string | number;
  /** texto debajo del nodo */
  sub?: string;
  subClase?: string;
  /** demora (s) del cambio de color, para escalonar una cascada */
  demora?: number;
  children?: ReactNode;
}

export function NodoSvg({ g, nodo, clase = '', aria, presionado, onActivar, insignia, sub, subClase = '', demora = 0 }: PropsNodo) {
  const circ = g.forma === 'circulo';
  const hw = (nodo.w ?? 70) / 2;
  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivar?.(); }
  };
  const yInsignia = circ ? -RADIO + 3 : -ALTO_RECT / 2 + 1;
  const xInsignia = circ ? RADIO - 3 : hw - 2;
  return (
    <g
      className={`sg-nodo ${clase}`} transform={`translate(${nodo.x} ${nodo.y})`}
      role="button" tabIndex={0} aria-label={aria} aria-pressed={presionado}
      onClick={onActivar} onKeyDown={alTeclado} data-nodo={nodo.id}
      style={demora ? { transitionDelay: `${demora}s` } : undefined}
    >
      {circ ? <circle className="sg-aro" r={RADIO + 6} /> : <rect className="sg-aro" x={-hw - 6} y={-ALTO_RECT / 2 - 6} width={hw * 2 + 12} height={ALTO_RECT + 12} rx={13} />}
      {circ
        ? <circle className="sg-forma" r={RADIO} style={demora ? { transitionDelay: `${demora}s` } : undefined} />
        : <rect className="sg-forma" x={-hw} y={-ALTO_RECT / 2} width={hw * 2} height={ALTO_RECT} rx={9} style={demora ? { transitionDelay: `${demora}s` } : undefined} />}
      <text className="sg-texto" textAnchor="middle" dy="0.35em">{nodo.etiqueta}</text>
      {insignia !== undefined && (
        <g className="sg-insignia" transform={`translate(${xInsignia} ${yInsignia})`}>
          <circle r={10} />
          <text textAnchor="middle" dy="0.35em">{insignia}</text>
        </g>
      )}
      {sub && <text className={`sg-sub ${subClase}`} textAnchor="middle" y={(circ ? RADIO : ALTO_RECT / 2) + 14}>{sub}</text>}
    </g>
  );
}

/** Contenedor SVG con viewBox del grafo y ancho 100 %. */
export function Lienzo({ g, etiqueta, children }: { g: GrafoDef; etiqueta: string; children: ReactNode }) {
  return (
    <div className="sim-lienzo sg-lienzo">
      <svg viewBox={`0 0 ${g.ancho} ${g.alto}`} role="group" aria-label={etiqueta} className="sg-svg">
        {children}
      </svg>
    </div>
  );
}
