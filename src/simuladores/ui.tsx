// Kit de controles y lecturas de los simuladores. Usa las clases de src/styles/sim.css.
// Reglas (SIMULADORES.md §1): controles nativos con <label> visible, lecturas con data-lectura y aria-live.
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';

interface SliderProps {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso?: number;
  onChange: (v: number) => void;
  /** cómo se muestra el valor al lado de la etiqueta (por defecto, tal cual) */
  formato?: (v: number) => string;
  /** escala logarítmica (min y max > 0) */
  log?: boolean;
  /** clave para tests: `data-control="<clave>"` en el <input> */
  clave?: string;
  deshabilitado?: boolean;
}

/** Slider nativo (`<input type="range">`) con etiqueta visible y valor. */
export function Slider({ etiqueta, valor, min, max, paso, onChange, formato, log, clave, deshabilitado }: SliderProps) {
  const id = useId();
  const aPos = (v: number) => (log ? (Math.log(v / min) / Math.log(max / min)) * 1000 : v);
  const dePos = (p: number) => (log ? min * Math.pow(max / min, p / 1000) : p);
  return (
    <div className="sim-control">
      <label htmlFor={id}>
        <span>{etiqueta}</span>
        <output htmlFor={id}>{formato ? formato(valor) : String(valor)}</output>
      </label>
      <input
        id={id} type="range" data-control={clave} disabled={deshabilitado}
        min={log ? 0 : min} max={log ? 1000 : max} step={log ? 1 : (paso ?? 'any')}
        value={aPos(valor)}
        onChange={(e) => onChange(log ? dePos(Number(e.target.value)) : Number(e.target.value))}
      />
    </div>
  );
}

export function Interruptor({ etiqueta, activo, onChange, clave }: { etiqueta: string; activo: boolean; onChange: (v: boolean) => void; clave?: string }) {
  return (
    <label className="sim-toggle">
      <input type="checkbox" data-control={clave} checked={activo} onChange={(e) => onChange(e.target.checked)} />
      <span>{etiqueta}</span>
    </label>
  );
}

export function Selector<T extends string | number>({ etiqueta, valor, opciones, onChange, clave }: {
  etiqueta: string; valor: T; opciones: { valor: T; texto: string }[]; onChange: (v: T) => void; clave?: string;
}) {
  const id = useId();
  return (
    <div className="sim-control">
      <label htmlFor={id}><span>{etiqueta}</span></label>
      <select id={id} data-control={clave} value={String(valor)} onChange={(e) => {
        const o = opciones.find((x) => String(x.valor) === e.target.value);
        if (o) onChange(o.valor);
      }}>
        {opciones.map((o) => <option key={String(o.valor)} value={String(o.valor)}>{o.texto}</option>)}
      </select>
    </div>
  );
}

export function Boton({ children, onClick, activo, deshabilitado, clave, titulo }: {
  children: ReactNode; onClick: () => void; activo?: boolean; deshabilitado?: boolean; clave?: string; titulo?: string;
}) {
  return (
    <button type="button" className={`sim-btn${activo ? ' activo' : ''}`} aria-pressed={activo === undefined ? undefined : activo} onClick={onClick} disabled={deshabilitado} data-control={clave} title={titulo}>
      {children}
    </button>
  );
}
export const Botones = ({ children }: { children: ReactNode }) => <div className="sim-botones">{children}</div>;

export interface ItemLectura { clave: string; etiqueta: string; valor: string | number; unidad?: string; tono?: 'alerta' | 'buena' }
/** Lecturas testeables: `<span data-lectura="clave">valor</span>`; la unidad va aparte. Contenedor aria-live. */
export function Lecturas({ items }: { items: ItemLectura[] }) {
  return (
    <dl className="sim-lecturas" aria-live="polite">
      {items.map((it) => (
        <div key={it.clave} className={`lectura${it.tono ? ` ${it.tono}` : ''}`}>
          <dt>{it.etiqueta}</dt>
          <dd><span data-lectura={it.clave}>{it.valor}</span>{it.unidad && <span className="u">{it.unidad}</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** `trazo`: la muestra es un segmento de línea (continua, de puntos o de guiones) en vez de un cuadradito de color. */
export type ItemLeyenda = { color: string; texto: string; trazo?: 'continuo' | 'puntos' | 'guiones' };

export function Leyenda({ items }: { items: ItemLeyenda[] }) {
  const estilo = { continuo: 'solid', puntos: 'dotted', guiones: 'dashed' } as const;
  return (
    <div className="sim-leyenda">
      {items.map((i) => (
        <span key={i.texto}>
          {i.trazo
            ? <i className="sim-trazo" style={{ borderTopColor: i.color, borderTopStyle: estilo[i.trazo] }} />
            : <i style={{ background: i.color }} />}
          {i.texto}
        </span>
      ))}
    </div>
  );
}

/** true mientras el elemento está en pantalla (para pausar las simulaciones al salir). */
export function useVisible(ref: RefObject<Element | null>): boolean {
  const [v, setV] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setV(!!e?.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return v;
}

/**
 * Simulación a paso fijo: llama a `paso(dtSegundos)` cada `pasoMs` de tiempo simulado (50 ms por defecto),
 * pausable, y se pausa sola cuando el elemento sale de pantalla o la pestaña se oculta.
 * `velocidad` multiplica el tiempo simulado (1 = tiempo real).
 */
export function useBucle(paso: (dt: number) => void, opts: { pausado: boolean; pasoMs?: number; velocidad?: number; visible?: boolean }) {
  const ref = useRef(paso);
  ref.current = paso;
  const { pausado, pasoMs = 50, velocidad = 1, visible = true } = opts;
  useEffect(() => {
    if (pausado || !visible) return;
    let raf = 0, ultimo = performance.now(), acum = 0;
    const tick = (t: number) => {
      acum += Math.min(250, t - ultimo) * velocidad;
      ultimo = t;
      let n = 0;
      while (acum >= pasoMs && n++ < 20) { ref.current(pasoMs / 1000); acum -= pasoMs; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pausado, visible, pasoMs, velocidad]);
}
