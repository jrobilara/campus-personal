// SimFuncion · modo descenso por gradiente (SIMULADORES.md §2.1).
import { Line, Plot, Point, Polyline, Text } from 'mafs';
import { useMemo, useState } from 'react';
import { Boton, Botones, Leyenda, Lecturas, Slider } from '../ui';
import { num } from '../formato';
import { Lienzo } from '../mafs-comun';
import { estadoDescenso, sigueVivo, trayectoria } from './descenso';
import { FUNCIONES, puntosCriticos } from './funciones';
import { ventanaDescenso } from './ventana';

type FuncionDescenso = 'cuadratica' | 'doble-pozo' | 'error-cuadratico';
interface Props { funcion: FuncionDescenso; x0?: number; tasa?: number; pasosMax?: number }

/** Número para lecturas: con coma, y en notación científica si es enorme (la divergencia produce valores gigantes). */
const numLectura = (n: number, dec: number) => (Math.abs(n) >= 1e6 ? n.toExponential(2).replace('.', ',').replace('e+', 'e') : num(n, dec));

const TASA_MIN = 0.001, TASA_MAX = 1.5;

const ROTULO_ESTADO = { convergiendo: 'Convergiendo', oscilando: 'Oscilando', divergiendo: 'Divergiendo' } as const;
const MENSAJES = {
  convergiendo: 'cada paso te deja más cerca del mínimo.',
  oscilando: 'el punto salta de un lado al otro del pozo y no termina de acercarse.',
  divergiendo: 'los pasos se agrandan y el punto se aleja del mínimo.',
} as const;

const SUBINDICES = '₀₁₂₃₄₅₆₇₈₉';
const subindice = (n: number) => String(n).split('').map((d) => SUBINDICES[Number(d)]).join('');
/** El rótulo de x₀ se omite si el punto actual (que tiene su propio rótulo) cae encima. */
const k0Separado = (xs: number[], paso: number, lejos: (a: number, b: number) => boolean) => lejos(xs[0]!, xs[paso]!);

export default function ModoDescenso({ funcion, x0: x0Prop = 3, tasa: tasaProp = 0.1, pasosMax = 50 }: Props) {
  const fn = FUNCIONES[funcion];
  const [x0, setX0] = useState(x0Prop);
  const [tasa, setTasa] = useState(Math.min(TASA_MAX, Math.max(TASA_MIN, tasaProp)));
  const [pedidos, setPedidos] = useState(0);

  // La ventana se fija con la x0 de la prop (no con el slider) para que el gráfico no se mueva mientras jugás.
  const ventana = useMemo(() => ventanaDescenso(funcion, x0Prop), [funcion, x0Prop]);
  const xs = useMemo(() => trayectoria(fn, x0, tasa, Math.min(pedidos, pasosMax)), [fn, x0, tasa, pedidos, pasosMax]);
  const paso = xs.length - 1;
  const xk = xs[paso]!;
  const estado = estadoDescenso(fn, xs, tasa);
  const factor = Math.abs(1 - tasa * fn.d2f(xk));
  const terminado = paso >= pasosMax || !sigueVivo(xs);

  const minimos = useMemo(() => {
    const [lo, hi] = ventana.x;
    const m = puntosCriticos(fn, lo, hi).filter((x) => fn.d2f(x) > 0).map((x) => ({ x, y: fn.f(x) })).sort((p, q) => p.y - q.y);
    return m.map((p, i) => ({ ...p, texto: m.length === 1 ? 'mínimo' : i === 0 ? 'mínimo global' : 'mínimo local' }));
  }, [fn, ventana]);

  const techoY = ventana.y[1] * 40;
  const pto = (x: number): [number, number] => [x, Math.max(-techoY, Math.min(techoY, fn.f(x)))];
  const reiniciar = () => setPedidos(0);

  // Rótulos: x₀, el punto actual y unos pocos pasos numerados (se descartan los que quedarían encima de otro).
  const [rx, ry] = [ventana.x[1] - ventana.x[0], ventana.y[1] - ventana.y[0]];
  const enVentana = (x: number) => x >= ventana.x[0] && x <= ventana.x[1] && fn.f(x) <= ventana.y[1] && fn.f(x) >= ventana.y[0];
  const lejos = (a: number, b: number) => Math.hypot((a - b) / rx, (0.7 * (fn.f(a) - fn.f(b))) / ry) >= 0.07;
  const conRotulo = [0, paso].filter((k, i, v) => v.indexOf(k) === i);
  const numerados: number[] = [];
  for (let k = 1; k < paso; k++) {
    if (!enVentana(xs[k]!)) continue;
    if (conRotulo.concat(numerados).every((j) => lejos(xs[j]!, xs[k]!))) numerados.push(k);
  }
  /** Hacia dónde abrir el rótulo para que no se corte en el borde del gráfico y quede del lado de adentro del pozo. */
  const ancla = (x: number): 'sw' | 'se' | 's' => {
    const fx = (x - ventana.x[0]) / rx;
    return fx > 0.62 ? 'sw' : fx < 0.38 ? 'se' : 's';
  };
  // En Mafs 'attach' = hacia dónde queda el ancla respecto del texto: 's…' deja el texto ARRIBA del punto; en diagonal la distancia se reparte entre los dos ejes.
  const dist = (x: number, base: number) => (ancla(x) === 's' ? base : base * 1.4);
  const afuera = !enVentana(xk);
  const v = fn.variable;
  const tituloY = funcion === 'error-cuadratico' ? 'E(w): el error que queremos achicar' : 'f(x): la altura que queremos achicar';
  const pieX = funcion === 'error-cuadratico' ? 'w: la pendiente que prueba el modelo' : 'x: la posición del punto';
  const mensaje = MENSAJES[estado];

  return (
    <div className="sim-cuerpo" data-modo="descenso">
      <div className={`sf-estado-barra ${estado}`} aria-hidden="true">
        <span className="sf-estado-punto" />
        <span><b>{ROTULO_ESTADO[estado]}</b> · {mensaje}{afuera && ' El punto ya salió del gráfico.'}</span>
      </div>
      <div className="sf-pila">
        <p className="sf-eje-titulo">{tituloY}</p>
        <Lienzo
          x={ventana.x} y={ventana.y} alto={{ ratio: 0.72, min: 230, max: 340 }}
          etiqueta={`Gráfico de ${fn.descripcion} con los pasos del descenso por gradiente: va por el paso ${paso}, en ${v} = ${num(xk, 3)}`}
        >
          <Plot.OfX y={fn.f} domain={[ventana.x[0], ventana.x[1]]} color="var(--color-area)" weight={3} />
          {minimos.map((m) => (
            <g key={m.texto}>
              <Point x={m.x} y={m.y} color="var(--ok)" svgCircleProps={{ r: 5, style: { fill: 'var(--superficie)', stroke: 'var(--ok)', strokeWidth: 2.5 } }} />
              <Line.Segment point1={[m.x, m.y]} point2={[m.x, ventana.y[0]]} color="var(--ok)" style="dashed" weight={1} opacity={0.55} />
              <Text x={m.x} y={ventana.y[0]} attach="s" attachDistance={18} size={12} color="var(--ok)" svgTextProps={{ style: { fontWeight: 700 } }}>{m.texto}</Text>
            </g>
          ))}
          {paso > 0 && <Polyline points={xs.map(pto)} color="var(--sf-naranja)" weight={2} strokeOpacity={0.85} fillOpacity={0} />}
          {xs.map((x, k) => {
            if (k === paso || k === 0) return null;
            const [px, py] = pto(x);
            // los puntos nuevos aparecen en cascada (CSS; con reduced-motion no se anima)
            return <Point key={k} x={px} y={py} color="var(--sf-naranja)" opacity={0.55 + 0.45 * (k / Math.max(1, paso))}
              svgCircleProps={{ r: 4, className: 'sf-pop', style: { animationDelay: `${(k % 10) * 35}ms` } }} />;
          })}
          {numerados.map((k) => (
            <Text key={`n${k}`} x={xs[k]!} y={fn.f(xs[k]!)} attach={ancla(xs[k]!)} attachDistance={dist(xs[k]!, 12)} size={11} color="var(--sf-naranja)" svgTextProps={{ style: { fontWeight: 700 } }}>{String(k)}</Text>
          ))}
          <Line.Segment point1={[xk, Math.max(ventana.y[0], pto(xk)[1])]} point2={[xk, ventana.y[0]]} color="var(--sf-naranja)" style="dashed" weight={1.5} opacity={0.6} />
          {paso > 0 && <Point x={pto(xs[0]!)[0]} y={pto(xs[0]!)[1]} color="var(--sf-naranja)" svgCircleProps={{ r: 6, style: { fill: 'var(--superficie)', stroke: 'var(--sf-naranja)', strokeWidth: 2.5 } }} />}
          <Point x={pto(xk)[0]} y={pto(xk)[1]} color="var(--sf-naranja)" svgCircleProps={{ r: 8, style: { stroke: 'var(--superficie)', strokeWidth: 2 } }} />
          {!afuera && <Text x={xk} y={fn.f(xk)} attach={ancla(xk)} attachDistance={dist(xk, 20)} size={13} color="var(--sf-naranja)" svgTextProps={{ style: { fontWeight: 800 } }}>
            {paso === 0 ? `${v}₀ · inicio` : `${v}${subindice(paso)} · ahora`}
          </Text>}
          {paso > 0 && enVentana(xs[0]!) && k0Separado(xs, paso, lejos) && (
            <Text x={xs[0]!} y={fn.f(xs[0]!)} attach={ancla(xs[0]!)} attachDistance={dist(xs[0]!, 18)} size={12} color="var(--sf-naranja)" svgTextProps={{ style: { fontWeight: 700 } }}>{`${v}₀ · inicio`}</Text>
          )}
        </Lienzo>
        <p className="sf-eje-pie">{pieX}</p>
      </div>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: fn.nombre },
        { color: 'var(--sf-naranja)', texto: `pasos ${fn.variable}ₖ₊₁ = ${fn.variable}ₖ − tasa·f′(${fn.variable}ₖ)` },
      ]} />

      <div className="sim-controles">
        <Slider etiqueta="Tasa de aprendizaje" clave="tasa" valor={tasa} min={TASA_MIN} max={TASA_MAX} log
          formato={(v) => num(v, v < 0.01 ? 4 : v < 0.1 ? 3 : 2)} onChange={(v) => { setTasa(v); reiniciar(); }} />
        <Slider etiqueta={`Punto de partida (${fn.variable}₀)`} clave="x0" valor={x0} min={ventana.xSlider[0]} max={ventana.xSlider[1]} paso={0.05}
          formato={(v) => num(v)} onChange={(v) => { setX0(v); reiniciar(); }} />
      </div>

      <Botones>
        <Boton clave="paso-1" deshabilitado={terminado} onClick={() => setPedidos(Math.min(pasosMax, paso + 1))}>1 paso</Boton>
        <Boton clave="paso-10" deshabilitado={terminado} onClick={() => setPedidos(Math.min(pasosMax, paso + 10))}>10 pasos</Boton>
        <Boton clave="reiniciar" onClick={reiniciar}>Reiniciar</Boton>
      </Botones>

      <Lecturas items={[
        { clave: 'paso', etiqueta: 'Paso', valor: paso },
        { clave: 'x', etiqueta: fn.variable, valor: numLectura(xk, 3) },
        { clave: 'fx', etiqueta: funcion === 'error-cuadratico' ? 'E(w)' : 'f(x)', valor: numLectura(fn.f(xk), 3) },
        { clave: 'estado', etiqueta: 'Estado', valor: estado, tono: estado === 'divergiendo' ? 'alerta' : estado === 'convergiendo' ? 'buena' : undefined },
        { clave: 'factor', etiqueta: 'Factor |1 − tasa·f″|', valor: numLectura(factor, 2) },
      ]} />
      <p className="sim-nota">
        Si el factor es menor que 1 cada paso achica la distancia al mínimo; si es mayor que 1 la agranda y el descenso se dispara.
        {paso >= pasosMax && ` Llegaste al máximo de ${pasosMax} pasos: reiniciá para probar de nuevo.`}
      </p>
    </div>
  );
}
