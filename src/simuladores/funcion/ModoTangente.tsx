// SimFuncion · modo tangente/secante (SIMULADORES.md §2.1).
import { Line, MovablePoint, Plot, Point, Text } from 'mafs';

import { useMemo, useState } from 'react';
import { Leyenda, Lecturas, Slider } from '../ui';
import { num } from '../formato';
import { Lienzo } from '../mafs-comun';
import { FUNCIONES, pendienteSecante, type FuncionPreset } from './funciones';
import { ventanaTangente } from './ventana';

interface Props { funcion: FuncionPreset; x0?: number; mostrarSecante?: boolean; rango?: [number, number] }

const Segment = Line.Segment;
const redondear = (v: number, paso: number) => Math.round(v / paso) * paso;

export default function ModoTangente({ funcion, x0: x0Prop, mostrarSecante = true, rango = [-4, 4] }: Props) {
  const fn = FUNCIONES[funcion];
  const [a, b] = rango[0] < rango[1] ? rango : [rango[1], rango[0]];
  const clamp = (v: number) => Math.min(b, Math.max(a, v));
  const [x0, setX0] = useState(() => clamp(x0Prop ?? 1));
  const [h, setH] = useState(1);
  const ventana = useMemo(() => ventanaTangente(funcion, [a, b]), [funcion, a, b]);

  const y0 = fn.f(x0);
  const derivada = fn.df(x0);
  const secante = pendienteSecante(fn, x0, h);
  const xq = x0 + h, yq = fn.f(xq);

  return (
    <div className="sim-cuerpo" data-modo="tangente">
      <Lienzo
        x={ventana.x} y={ventana.y} alto={{ ratio: 0.72, min: 230, max: 340 }}
        etiqueta={`Gráfico de ${fn.descripcion}, con la recta tangente en x = ${num(x0)}${mostrarSecante ? ' y la secante hasta x + h' : ''}`}
      >
        <Plot.OfX y={fn.f} domain={[ventana.x[0], ventana.x[1]]} color="var(--color-area)" weight={3} />
        {mostrarSecante && (
          <>
            {/* catetos del triángulo de la secante: "h" a lo ancho y "Δf" a lo alto */}
            <Segment point1={[x0, y0]} point2={[xq, y0]} color="var(--sf-violeta)" style="dashed" weight={1.5} opacity={0.7} />
            <Segment point1={[xq, y0]} point2={[xq, yq]} color="var(--sf-violeta)" style="dashed" weight={1.5} opacity={0.7} />
            <Line.ThroughPoints point1={[x0, y0]} point2={[xq, yq]} color="var(--sf-violeta)" weight={2} opacity={0.9} />
            <Text x={(x0 + xq) / 2} y={y0} attach="s" attachDistance={6} size={13} color="var(--sf-violeta)">h</Text>
            <Point x={xq} y={yq} color="var(--sf-violeta)" svgCircleProps={{ r: 5 }} />
          </>
        )}
        <Line.PointSlope point={[x0, y0]} slope={derivada} color="var(--sf-naranja)" weight={2.5} />
        <MovablePoint
          point={[x0, y0]} color="var(--tinta)"
          constrain={([x]) => { const c = clamp(x); return [c, fn.f(c)]; }}
          onMove={([x]) => setX0(clamp(redondear(x, 0.01)))}
        />
      </Lienzo>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: fn.nombre },
        { color: 'var(--sf-naranja)', texto: 'recta tangente' },
        ...(mostrarSecante ? [{ color: 'var(--sf-violeta)', texto: 'secante entre x y x + h' }] : []),
      ]} />

      <div className="sim-controles">
        <Slider etiqueta="Punto x" clave="x0" valor={x0} min={a} max={b} paso={0.05} formato={(v) => num(v)} onChange={(v) => setX0(clamp(v))} />
        {mostrarSecante && (
          <Slider etiqueta="Separación h" clave="h" valor={h} min={0.01} max={2} paso={0.01} formato={(v) => num(v)} onChange={setH} />
        )}
      </div>

      <Lecturas items={[
        { clave: 'fx0', etiqueta: 'f(x)', valor: num(y0, 2) },
        { clave: 'derivada', etiqueta: 'Derivada f′(x)', valor: num(derivada, 2), tono: 'buena' },
        ...(mostrarSecante ? [{ clave: 'pendiente-secante', etiqueta: 'Pendiente de la secante', valor: num(secante, 2) }] : []),
      ]} />
      <p className="sim-nota">Arrastrá el punto sobre la curva o usá los sliders.{mostrarSecante && ' Achicá h: la secante se va pegando a la tangente.'}</p>
    </div>
  );
}
