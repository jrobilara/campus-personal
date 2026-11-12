// Isla del simulador SimTransformacion2D (SIMULADORES.md §2.2): una matriz 2×2 como transformación del plano, sobre Mafs.
import { animate } from 'motion/react';
import { Coordinates, Line, Mafs, Polygon, Text, Vector, useMovablePoint } from 'mafs';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMenosMovimiento } from '../lib/tema';
import { num } from './formato';
import { useAnchoElemento, etiquetaEje } from './mafs-comun';
import type { PropsSimTransformacion2D } from './props';
import { Boton, Botones, Lecturas, Leyenda, Slider } from './ui';
import {
  NOMBRES_PRESET, PRESETS, aplicar, autovectores, copiar, det, mezclar, orientacion, presetDe,
  type Matriz, type PresetT, type Vec,
} from './transformacion/matriz';

const R = 6; // el plano se ve de −6 a 6 (como mínimo, a lo alto)
const LIMITE_V = 5.5;
const GRILLA = 20; // líneas de la grilla transformada a cada lado
const LARGO = 40; // hasta dónde se estira cada línea

const redondear1 = (v: number) => Math.round(v * 10) / 10;
const clampV = (v: number) => Math.min(LIMITE_V, Math.max(-LIMITE_V, v));
const par = ([x, y]: Vec) => `(${num(x)}; ${num(y)})`;
const enteros = Array.from({ length: 2 * GRILLA + 1 }, (_, i) => i - GRILLA);

export default function SimTransformacion2D({ preset, matriz, editable = false, mostrarAutovectores = false, vector = [1, 1] }: PropsSimTransformacion2D) {
  const inicial = useMemo<Matriz>(() => copiar(matriz ?? PRESETS[preset ?? 'identidad']), [matriz, preset]);
  const [m, setM] = useState<Matriz>(inicial);
  const [vis, setVis] = useState<Matriz>(inicial); // la que se dibuja: igual a `m` salvo mientras dura la animación de un preset
  const visRef = useRef<Matriz>(inicial);
  const anim = useRef<{ stop: () => void } | null>(null);
  const menosMovimiento = useMenosMovimiento();
  const idPresets = useId();

  const v = useMovablePoint(vector, {
    color: 'var(--tinta)',
    constrain: ([x, y]) => [clampV(redondear1(x)), clampV(redondear1(y))],
  });

  useEffect(() => () => anim.current?.stop(), []);

  const irA = (sig: Matriz, conAnimacion: boolean) => {
    setM(sig);
    anim.current?.stop();
    if (!conAnimacion || menosMovimiento) { visRef.current = sig; setVis(sig); return; }
    const desde = visRef.current;
    anim.current = animate(0, 1, {
      duration: 0.55, ease: 'easeInOut',
      onUpdate: (t) => { const mm = mezclar(desde, sig, t); visRef.current = mm; setVis(mm); },
      onComplete: () => { visRef.current = sig; setVis(sig); },
    });
  };
  const ponerEntrada = (i: 0 | 1, j: 0 | 1, valor: number) => {
    const sig = copiar(m);
    sig[i][j] = valor;
    irA(sig, false);
  };

  // Lecturas: siempre sobre la matriz "de destino" `m`, así no dependen de la animación.
  const d = det(m);
  const ori = orientacion(m);
  const vp: Vec = [v.x, v.y];
  const av = aplicar(m, vp);
  const eigLect = autovectores(m);
  const eigDib = useMemo(() => autovectores(vis), [vis]);

  // Dibujo, sobre `vis`.
  const [[a, b], [c, e]] = vis;
  const avVis = aplicar(vis, vp);
  const imagenCuadrado: [number, number][] = [[0, 0], [a, c], [a + b, c + e], [b, e]];

  const refLienzo = useRef<HTMLDivElement>(null);
  const ancho = useAnchoElemento(refLienzo);
  const alto = Math.round(Math.min(480, Math.max(290, ancho)));
  const presetActivo = presetDe(m);

  const etiquetaPlano = `Plano 2D con la grilla transformada por la matriz de filas (${num(m[0][0])}; ${num(m[0][1])}) y (${num(m[1][0])}; ${num(m[1][1])}). ` +
    `El vector v pasa a Av = ${par(av)}. Determinante ${num(d)}: ${ori}.`;

  return (
    <div className="sim-cuerpo" data-modo="transformacion">
      <div ref={refLienzo} className="sim-lienzo sf-lienzo" role="img" aria-label={etiquetaPlano}>
        <Mafs height={alto} pan={false} zoom={false} viewBox={{ x: [-R, R], y: [-R, R], padding: 0 }} preserveAspectRatio="contain">
          <Coordinates.Cartesian xAxis={{ lines: 2, labels: etiquetaEje }} yAxis={{ lines: 2, labels: etiquetaEje }} subdivisions={false} />

          {/* grilla transformada: la imagen de las rectas x = i e y = j */}
          {enteros.map((i) => i !== 0 && (
            <Line.Segment key={`gx${i}`} point1={aplicar(vis, [i, -LARGO])} point2={aplicar(vis, [i, LARGO])} color="var(--color-area)" weight={1} opacity={0.38} />
          ))}
          {enteros.map((j) => j !== 0 && (
            <Line.Segment key={`gy${j}`} point1={aplicar(vis, [-LARGO, j])} point2={aplicar(vis, [LARGO, j])} color="var(--color-area)" weight={1} opacity={0.38} />
          ))}
          <Line.Segment point1={aplicar(vis, [0, -LARGO])} point2={aplicar(vis, [0, LARGO])} color="var(--color-area)" weight={2} opacity={0.75} />
          <Line.Segment point1={aplicar(vis, [-LARGO, 0])} point2={aplicar(vis, [LARGO, 0])} color="var(--color-area)" weight={2} opacity={0.75} />

          {/* rectas de autovectores (solo reales) */}
          {mostrarAutovectores && eigDib.tipo === 'reales' && eigDib.rectas.map((r, i) => (
            <Line.ThroughPoints key={`eig${i}`} point1={[0, 0]} point2={r.direccion} color="var(--sf-cian)" style="dashed" weight={2.5} />
          ))}
          {mostrarAutovectores && eigDib.tipo === 'reales' && eigDib.rectas.map((r, i) => (
            <Text key={`et${i}`} x={r.direccion[0] * 4.6} y={r.direccion[1] * 4.6} attach={r.direccion[0] >= 0 ? 'ne' : 'sw'} size={12} color="var(--sf-cian)">
              {`λ = ${num(r.valor)}`}
            </Text>
          ))}

          {/* cuadrado unidad y su imagen */}
          <Polygon points={imagenCuadrado} color="var(--color-area)" fillOpacity={0.22} weight={2} />
          <Polygon points={[[0, 0], [1, 0], [1, 1], [0, 1]]} color="var(--suave)" fillOpacity={0} weight={1.5} strokeStyle="dashed" />

          {/* î y ĵ originales (tenues) y sus imágenes */}
          <Vector tail={[0, 0]} tip={[1, 0]} color="var(--sf-naranja)" weight={2} opacity={0.35} />
          <Vector tail={[0, 0]} tip={[0, 1]} color="var(--ok)" weight={2} opacity={0.35} />
          <Vector tail={[0, 0]} tip={[a, c]} color="var(--sf-naranja)" weight={3.5} />
          <Vector tail={[0, 0]} tip={[b, e]} color="var(--ok)" weight={3.5} />
          <Text x={a} y={c} attach={a >= 0 ? 'ne' : 'sw'} size={14} color="var(--sf-naranja)">î′</Text>
          <Text x={b} y={e} attach={b >= 0 ? 'nw' : 'se'} size={14} color="var(--ok)">ĵ′</Text>

          {/* v (arrastrable) y Av */}
          <Vector tail={[0, 0]} tip={vp} color="var(--suave)" weight={2.5} />
          <Vector tail={[0, 0]} tip={avVis} color="var(--sf-violeta)" weight={3.5} />
          <Text x={avVis[0]} y={avVis[1]} attach={avVis[0] >= 0 ? 'se' : 'nw'} attachDistance={10} size={14} color="var(--sf-violeta)">Av</Text>
          <Text x={vp[0]} y={vp[1]} attach={vp[0] >= 0 ? 'nw' : 'se'} attachDistance={12} size={14} color="var(--suave)">v</Text>
          {v.element}
        </Mafs>
      </div>

      <Leyenda items={[
        { color: 'var(--sf-naranja)', texto: 'î′: adónde va (1; 0)' },
        { color: 'var(--ok)', texto: 'ĵ′: adónde va (0; 1)' },
        { color: 'var(--suave)', texto: 'v (arrastralo)' },
        { color: 'var(--sf-violeta)', texto: 'Av' },
        ...(mostrarAutovectores ? [{ color: 'var(--sf-cian)', texto: 'rectas de autovectores' }] : []),
      ]} />

      <div className="sf-controles-t">
        {editable ? (
          <div className="sf-matriz" role="group" aria-label="Matriz A">
            <Slider etiqueta="a" clave="a" valor={m[0][0]} min={-3} max={3} paso={0.1} formato={(x) => num(x, 1)} onChange={(x) => ponerEntrada(0, 0, x)} />
            <Slider etiqueta="b" clave="b" valor={m[0][1]} min={-3} max={3} paso={0.1} formato={(x) => num(x, 1)} onChange={(x) => ponerEntrada(0, 1, x)} />
            <Slider etiqueta="c" clave="c" valor={m[1][0]} min={-3} max={3} paso={0.1} formato={(x) => num(x, 1)} onChange={(x) => ponerEntrada(1, 0, x)} />
            <Slider etiqueta="d" clave="d" valor={m[1][1]} min={-3} max={3} paso={0.1} formato={(x) => num(x, 1)} onChange={(x) => ponerEntrada(1, 1, x)} />
          </div>
        ) : (
          <div className="sf-matriz sf-matriz-fija" role="group" aria-label="Matriz A">
            <span>{num(m[0][0], 1)}</span><span>{num(m[0][1], 1)}</span>
            <span>{num(m[1][0], 1)}</span><span>{num(m[1][1], 1)}</span>
          </div>
        )}
        {editable && (
          <div className="sf-fila-presets">
            <span className="etiqueta" id={idPresets}>Probá una transformación</span>
            <div role="group" aria-labelledby={idPresets}>
              <Botones>
                {(Object.keys(PRESETS) as PresetT[]).map((k) => (
                  <Boton key={k} clave={`preset-${k}`} activo={presetActivo === k} onClick={() => irA(copiar(PRESETS[k]), true)}>{NOMBRES_PRESET[k]}</Boton>
                ))}
              </Botones>
            </div>
          </div>
        )}
      </div>

      <Lecturas items={[
        { clave: 'det', etiqueta: 'Determinante', valor: num(d, 2) },
        { clave: 'area', etiqueta: 'Área del cuadrado', valor: num(Math.abs(d), 2) },
        { clave: 'orientacion', etiqueta: 'Orientación', valor: ori, tono: ori === 'colapsa' ? 'alerta' : undefined },
        { clave: 'av', etiqueta: 'Av', valor: par(av) },
        { clave: 'autovalores', etiqueta: 'Autovalores λ₁; λ₂', valor: eigLect.tipo === 'complejos' ? 'complejos' : `${num(eigLect.valores[0])}; ${num(eigLect.valores[1])}` },
      ]} />
      {mostrarAutovectores && (
        <p className="sim-nota">
          {eigLect.tipo === 'complejos' && 'Esta matriz gira todo el plano: no hay ninguna recta que quede en su lugar, por eso los autovalores son complejos.'}
          {eigLect.tipo === 'reales' && eigLect.escalar && 'Esta matriz solo estira o encoge parejo: cualquier recta por el origen queda en su lugar.'}
          {eigLect.tipo === 'reales' && !eigLect.escalar && eigLect.rectas.length === 1 && 'Hay una sola recta que queda en su lugar.'}
          {eigLect.tipo === 'reales' && !eigLect.escalar && eigLect.rectas.length === 2 && 'Un vector sobre una de las rectas punteadas sigue sobre ella después de aplicar A: solo se estira por su autovalor.'}
        </p>
      )}
    </div>
  );
}
