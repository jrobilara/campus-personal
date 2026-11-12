// SimFuncion · modo señal: suma de senoidales, ruido, muestreo (alias) y filtro (SIMULADORES.md §2.1).
import { Line, Plot, Point, Polygon, Text } from 'mafs';
import { useMemo, useState } from 'react';
import { Interruptor, Leyenda, Lecturas, Slider } from '../ui';
import { num } from '../formato';
import { Lienzo } from '../mafs-comun';
import {
  aliasesDe, componentesFiltradas, espectro, frecuenciaAparente, frecuenciaMax, FRECUENCIA_RUIDO_MAX, hz, instantesMuestreo,
  lineasDeComponentes, lineasRuido, pasaBajos, reconstruccionAlias, sePliega, valor, type Componente,
} from './senal';

interface Props {
  componentes: Componente[]; ruido?: number; muestreo?: boolean; frecuenciaMuestreo?: number; filtro?: boolean; semilla?: number;
}

const Segment = Line.Segment;
const T: [number, number] = [-0.02, 1.02];
const sube = (v: number, escalones: number[]) => escalones.find((e) => v <= e) ?? Math.ceil(v);

/** Corte inicial del filtro: a mitad de camino entre la componente más grave y la más aguda (si hay una sola, la mitad). */
function corteInicial(comps: Componente[]): number {
  const fs = comps.map((c) => c.frecuencia);
  const mn = Math.min(...fs), mx = Math.max(...fs);
  return Math.min(30, Math.max(1, Math.round(mx > mn ? (mn + mx) / 2 : mx / 2)));
}

const rect = (f: number, ancho: number, alto: number): [number, number][] =>
  [[f - ancho / 2, 0], [f + ancho / 2, 0], [f + ancho / 2, alto], [f - ancho / 2, alto]];
const datos = (o: Record<string, string | number>) => o as unknown as React.SVGProps<SVGPolygonElement>;

export default function ModoSenal({ componentes, ruido: ruidoProp = 0, muestreo = false, frecuenciaMuestreo = 40, filtro = false, semilla = 42 }: Props) {
  const [comps, setComps] = useState<Componente[]>(() => componentes.map((c) => ({ ...c })));
  const [ruido, setRuido] = useState(ruidoProp);
  const [muestreoOn, setMuestreoOn] = useState(muestreo);
  const [fs, setFs] = useState(Math.min(60, Math.max(2, frecuenciaMuestreo)));
  const [filtroOn, setFiltroOn] = useState(false);
  const [corte, setCorte] = useState(() => corteInicial(componentes));

  const cambiar = (i: number, parte: Partial<Componente>) => setComps((cs) => cs.map((c, j) => (j === i ? { ...c, ...parte } : c)));

  const m = useMemo(() => {
    const senal = lineasDeComponentes(comps);
    const rr = lineasRuido(semilla, ruido);
    const todas = [...senal, ...rr];
    const efectivas = filtroOn ? pasaBajos(todas, corte) : todas;
    const efectivasComps = filtroOn ? comps.filter((c) => c.frecuencia <= corte) : comps;
    const muestras = muestreoOn ? instantesMuestreo(fs).map((t) => ({ t, y: valor(efectivas, t) })) : [];
    const recon = muestreoOn ? reconstruccionAlias(efectivas, fs) : [];
    const maxAbs = Math.max(0.5, ...Array.from({ length: 121 }, (_, i) => Math.abs(valor(todas, i / 120))));
    const maxAmp = Math.max(0.5, ...comps.map((c) => c.amplitud), ...rr.map((l) => l.amplitud));
    return { todas, efectivas, rr, muestras, recon, barras: espectro(comps, rr, filtroOn ? corte : null), efectivasComps, yTiempo: sube(maxAbs * 1.08, [1.2, 1.6, 2, 3, 4, 6, 8]), yEsp: sube(maxAmp * 1.18, [0.6, 1, 1.5, 2, 2.5]) };
  }, [comps, ruido, muestreoOn, fs, filtroOn, corte, semilla]);

  const fMax = frecuenciaMax(comps);
  const alias = muestreoOn ? aliasesDe(m.efectivasComps, fs) : [];
  const nFiltradas = filtroOn ? componentesFiltradas(comps, corte) : 0;
  const nyquist = fs / 2;

  return (
    <div className="sim-cuerpo" data-modo="senal">
      <div className="sf-pila">
        <p className="sf-eje-titulo">Señal en el tiempo (1 segundo)</p>
        <Lienzo
          x={T} y={[-m.yTiempo, m.yTiempo]} alto={{ ratio: 0.5, min: 170, max: 250 }} pasoX={0.25}
          etiqueta={`Señal en el tiempo, suma de ${comps.length} senoidales${muestreoOn ? ', con sus muestras y la curva reconstruida' : ''}`}
        >
          {filtroOn && <Plot.OfX y={(t) => valor(m.todas, t)} domain={T} color="var(--suave)" weight={1.5} opacity={0.5} />}
          <Plot.OfX y={(t) => valor(m.efectivas, t)} domain={T} color="var(--color-area)" weight={2.5} />
          {muestreoOn && <Plot.OfX y={(t) => valor(m.recon, t)} domain={T} color="var(--mal)" weight={2} style="dashed" />}
          {m.muestras.map((p, i) => (
            <Point key={i} x={p.t} y={p.y} color="var(--tinta)" svgCircleProps={{ r: 3.5, style: { stroke: 'var(--superficie)', strokeWidth: 1.5 } }} />
          ))}
        </Lienzo>
        <p className="sf-eje-pie">tiempo (s)</p>

        <p className="sf-eje-titulo">Espectro: cuánta amplitud hay en cada frecuencia</p>
        <Lienzo
          x={[0, FRECUENCIA_RUIDO_MAX + 1]} y={[-m.yEsp * 0.04, m.yEsp]} alto={{ ratio: 0.38, min: 140, max: 190 }} pasoX={5}
          etiqueta={`Espectro de barras: ${comps.filter((c) => c.amplitud > 0).map((c) => `${hz(c.frecuencia)} hercios con amplitud ${num(c.amplitud)}`).join(', ') || 'sin componentes'}`}
        >
          {muestreoOn && nyquist < FRECUENCIA_RUIDO_MAX + 1 && (
            <>
              <Polygon points={[[nyquist, 0], [FRECUENCIA_RUIDO_MAX + 1, 0], [FRECUENCIA_RUIDO_MAX + 1, m.yEsp], [nyquist, m.yEsp]]} color="var(--mal)" fillOpacity={0.07} weight={0} />
              <Segment point1={[nyquist, 0]} point2={[nyquist, m.yEsp]} color="var(--mal)" style="dashed" weight={1.5} />
              <Text x={nyquist} y={m.yEsp} attach="se" attachDistance={4} size={11} color="var(--mal)">{`Nyquist ${hz(nyquist)} Hz`}</Text>
            </>
          )}
          {filtroOn && (
            <>
              <Segment point1={[corte, 0]} point2={[corte, m.yEsp]} color="var(--ok)" weight={2} />
              <Text x={corte} y={m.yEsp * 0.92} attach="w" attachDistance={4} size={11} color="var(--ok)">{`corte ${hz(corte)} Hz`}</Text>
            </>
          )}
          {m.barras.map((b) => (
            <Polygon
              key={`${b.tipo}-${b.frecuencia}`}
              points={rect(b.frecuencia, b.tipo === 'senal' ? 0.8 : 0.4, b.amplitud)}
              color={b.estado === 'filtrada' ? 'var(--suave)' : b.tipo === 'senal' ? 'var(--color-area)' : 'var(--suave)'}
              fillOpacity={b.estado === 'filtrada' ? 0 : b.tipo === 'senal' ? 0.85 : 0.5}
              strokeStyle={b.estado === 'filtrada' ? 'dashed' : 'solid'} weight={b.estado === 'filtrada' ? 1 : 0}
              svgPolygonProps={datos({ 'data-barra': b.tipo, 'data-frec': b.frecuencia, 'data-estado': b.estado })}
            />
          ))}
          {muestreoOn && m.efectivasComps.filter((c) => c.amplitud > 0 && sePliega(c.frecuencia, fs)).map((c) => (
            <Polygon
              key={`alias-${c.frecuencia}`}
              points={rect(Math.abs(frecuenciaAparente(c.frecuencia, fs)), 0.5, c.amplitud)}
              color="var(--mal)" fillOpacity={0.75} weight={0}
              svgPolygonProps={datos({ 'data-barra': 'alias', 'data-frec': Math.abs(frecuenciaAparente(c.frecuencia, fs)) })}
            />
          ))}
        </Lienzo>
        <p className="sf-eje-pie">frecuencia (Hz)</p>
      </div>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: filtroOn ? 'señal filtrada' : 'señal' },
        ...(filtroOn ? [{ color: 'var(--suave)', texto: 'señal original' }] : []),
        ...(muestreoOn ? [{ color: 'var(--tinta)', texto: 'muestras' }, { color: 'var(--mal)', texto: 'reconstruida desde las muestras (alias)' }] : []),
        ...(ruido > 0 ? [{ color: 'var(--suave)', texto: 'barras chicas: piso de ruido' }] : []),
      ]} />

      <div className="sim-controles">
        {comps.map((c, i) => (
          <div key={i} className="sf-par">
            <Slider etiqueta={comps.length > 1 ? `Frecuencia ${i + 1}` : 'Frecuencia'} clave={`frecuencia-${i + 1}`} valor={c.frecuencia} min={1} max={20} paso={Number.isInteger(c.frecuencia) ? 1 : 0.5}
              formato={(v) => `${hz(v)} Hz`} onChange={(v) => cambiar(i, { frecuencia: v })} />
            <Slider etiqueta={comps.length > 1 ? `Amplitud ${i + 1}` : 'Amplitud'} clave={`amplitud-${i + 1}`} valor={c.amplitud} min={0} max={2} paso={0.05}
              formato={(v) => num(v)} onChange={(v) => cambiar(i, { amplitud: v })} />
          </div>
        ))}
        <Slider etiqueta="Ruido" clave="ruido" valor={ruido} min={0} max={1} paso={0.05} formato={(v) => num(v)} onChange={setRuido} />
        {muestreo && (
          <div className="sf-par">
            <Interruptor etiqueta="Muestrear la señal" clave="muestreo" activo={muestreoOn} onChange={setMuestreoOn} />
            <Slider etiqueta="Frecuencia de muestreo" clave="frecuencia-muestreo" valor={fs} min={2} max={60} paso={1}
              formato={(v) => `${v} Hz`} onChange={setFs} deshabilitado={!muestreoOn} />
          </div>
        )}
        {filtro && (
          <div className="sf-par">
            <Interruptor etiqueta="Filtro pasa-bajos" clave="filtro" activo={filtroOn} onChange={setFiltroOn} />
            <Slider etiqueta="Corte del filtro" clave="corte" valor={corte} min={1} max={30} paso={1}
              formato={(v) => `${v} Hz`} onChange={setCorte} deshabilitado={!filtroOn} />
          </div>
        )}
      </div>

      <Lecturas items={[
        { clave: 'frecuencia-max', etiqueta: 'Frecuencia máxima', valor: fMax === null ? '—' : hz(fMax), unidad: fMax === null ? undefined : 'Hz' },
        ...(muestreo ? [
          { clave: 'nyquist', etiqueta: 'Nyquist (fs/2)', valor: muestreoOn ? hz(nyquist) : '—', unidad: muestreoOn ? 'Hz' : undefined },
          { clave: 'alias', etiqueta: 'Alias', valor: alias.length ? alias.map(hz).join('; ') : '—', unidad: alias.length ? 'Hz' : undefined, tono: alias.length ? ('alerta' as const) : undefined },
        ] : []),
        ...(filtro ? [{ clave: 'componentes-filtradas', etiqueta: 'Componentes filtradas', valor: nFiltradas }] : []),
      ]} />
      {muestreo && <p className="sim-nota">Para no perder información hay que muestrear a más del doble de la frecuencia más alta. Si no, aparece un alias: una frecuencia falsa más grave.</p>}
    </div>
  );
}
