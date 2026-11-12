// Geometría de los diagramas de estados (pura): cajas, flechas curvas y puntos para animar un pulso a lo largo de la flecha.
import type { DiagramaDef } from './tipos';

export interface Caja { id: string; cx: number; cy: number; w: number; h: number }
export interface Pt { x: number; y: number }
export interface FlechaGeom {
  de: string;
  a: string;
  d: string;
  punta: string;
  etiqueta: Pt;
  puntos: Pt[];
}
export interface Plano { W: number; H: number; cajas: Caja[]; flechas: FlechaGeom[]; angosto: boolean }

export const ANCHO_VISTA = 640;
export const ANCHO_VISTA_ANGOSTO = 340;

/** Punto del borde del rectángulo `c` en la dirección de (px, py), con una separación `sep`. */
export function bordeHacia(c: Caja, px: number, py: number, sep = 3): Pt {
  const dx = px - c.cx, dy = py - c.cy;
  const hw = c.w / 2 + sep, hh = c.h / 2 + sep;
  if (dx === 0 && dy === 0) return { x: c.cx, y: c.cy };
  const k = Math.min(dx !== 0 ? hw / Math.abs(dx) : Infinity, dy !== 0 ? hh / Math.abs(dy) : Infinity);
  return { x: c.cx + dx * k, y: c.cy + dy * k };
}

const cuad = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

/** Flecha de `a` a `b`: curva cuadrática cuyo control se corre `curva` unidades hacia el costado. */
export function flechaGeom(a: Caja, b: Caja, curva: number): FlechaGeom {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ctl: Pt = { x: (a.cx + b.cx) / 2 + nx * curva, y: (a.cy + b.cy) / 2 + ny * curva };
  // Si la curva es muy cerrada puede apuntar al propio nodo: se apunta al otro centro.
  const s = bordeHacia(a, ctl.x, ctl.y);
  const e = bordeHacia(b, ctl.x, ctl.y, 4);
  const tx = e.x - ctl.x, ty = e.y - ctl.y;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl, uy = ty / tl;
  const L = 9, A = 4.5;
  const base = { x: e.x - ux * L, y: e.y - uy * L };
  const punta = `${e.x.toFixed(1)},${e.y.toFixed(1)} ${(base.x - uy * A).toFixed(1)},${(base.y + ux * A).toFixed(1)} ${(base.x + uy * A).toFixed(1)},${(base.y - ux * A).toFixed(1)}`;
  const fin = base;
  const d = `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${ctl.x.toFixed(1)},${ctl.y.toFixed(1)} ${fin.x.toFixed(1)},${fin.y.toFixed(1)}`;
  const m = cuad(s, ctl, fin, 0.5);
  const lado = curva === 0 ? 1 : Math.sign(curva);
  const etiqueta = { x: m.x + nx * lado * 10, y: m.y + ny * lado * 10 };
  const puntos: Pt[] = [];
  for (let i = 0; i <= 12; i++) puntos.push(cuad(s, ctl, e, i / 12));
  return { de: a.id, a: b.id, d, punta, etiqueta, puntos };
}

/** Arma el plano (cajas y flechas) de un diagrama para el ancho ancho o angosto. */
export function armarPlano(def: DiagramaDef, angosto: boolean): Plano {
  const W = angosto ? ANCHO_VISTA_ANGOSTO : ANCHO_VISTA;
  const H = angosto ? def.altoAngosto : def.altoAncho;
  const w = angosto ? 96 : 112;
  const h = 46;
  const padX = w / 2 + 6;
  const padTop = h / 2 + 8;
  const padBot = h / 2 + 22; // lugar para la nota debajo del nodo
  const k = W / ANCHO_VISTA;
  const cajas: Caja[] = def.nodos.map((n) => ({
    id: n.id,
    cx: padX + n.x * (W - 2 * padX),
    cy: padTop + n.y * (H - padTop - padBot),
    w,
    h,
  }));
  const porId = new Map(cajas.map((c) => [c.id, c]));
  const flechas = def.flechas.map((f) => flechaGeom(porId.get(f.de)!, porId.get(f.a)!, (f.curva ?? 0) * (angosto ? Math.max(k, 0.9) : 1)));
  return { W, H, cajas, flechas, angosto };
}
