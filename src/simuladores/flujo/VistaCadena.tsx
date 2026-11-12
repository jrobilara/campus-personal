// SimFlujo, modo "cadena": cada salto entre servicios suma latencia y multiplica disponibilidades.
import { useState } from 'react';
import { useMenosMovimiento } from '../../lib/tema';
import { Interruptor, Leyenda, Lecturas, Slider, type ItemLectura } from '../ui';
import { num } from '../formato';
import type { PropsSimFlujo } from '../props';
import { calcularCadena } from './cadena';
import { BarraSim, Punto, useSimulacion, type MotorBase } from './comun';
import { ANCHO_CADENA, layoutCadena, puntoCadena } from './geometria';

type Props = Extract<PropsSimFlujo, { modo: 'cadena' }>;

/** Reloj de la animación (la cadena en sí no necesita simulación: son cuentas). */
class Reloj implements MotorBase {
  t = 0;
  avanzar(dt: number) {
    this.t += dt;
  }
}

/** "Nueves" de una disponibilidad: 0,999 → 3. */
const nueves = (d: number) => -Math.log10(Math.max(1e-9, 1 - d));
const deNueves = (n: number) => Math.round((1 - Math.pow(10, -n)) * 1e6) / 1e6;
const porcentaje = (d: number) => `${num(d * 100, Math.max(1, Math.min(4, Math.ceil(nueves(d) - 1e-9) - 2)))}`;

export default function VistaCadena(props: Props) {
  const [saltos, setSaltos] = useState(props.saltos ?? 4);
  const [latencia, setLatencia] = useState(props.latenciaPorSalto ?? 20);
  const [disp, setDisp] = useState(props.disponibilidadPorServicio ?? 0.999);
  const [monolito, setMonolito] = useState(false);
  const reducido = useMenosMovimiento();
  const sim = useSimulacion({ crear: () => new Reloj(), leer: (m) => m.t });

  const r = calcularCadena({ saltos, latenciaPorSalto: latencia, disponibilidad: disp, monolito });
  const l = layoutCadena(r.servicios);
  const p = puntoCadena(reducido ? 0 : sim.motor.t, l);
  const yNodo = 52;
  const enEstaPos = reducido ? -2 : p.en;
  const etiquetaServicio = (i: number) => (monolito ? 'Monolito' : `S${i + 1}`);
  const maxLat = Math.max(r.latenciaTotal, 1);
  const anchoBarra = ANCHO_CADENA - 28 - 70;
  // barra de caída anual: toda la barra es un año (8.760 h)
  const anchoCaida = Math.max(r.caidaAnualHoras > 0 ? 2 : 0, (r.caidaAnualHoras / 8760) * anchoBarra);

  const items: ItemLectura[] = [
    { clave: 'latencia-total', etiqueta: 'Latencia total', valor: num(r.latenciaTotal, 0), unidad: 'ms' },
    { clave: 'disponibilidad-compuesta', etiqueta: 'Disponibilidad compuesta', valor: num(r.disponibilidad * 100, 2), unidad: '%' },
    { clave: 'caida-anual', etiqueta: 'Caída esperada por año', valor: num(r.caidaAnualHoras, 1), unidad: 'h' },
    { clave: 'servicios', etiqueta: 'Servicios en la cadena', valor: String(r.servicios) },
  ];

  return (
    <div className="sim-cuerpo" ref={sim.contenedor}>
      <div className="sim-lienzo">
        <svg viewBox={`0 0 ${ANCHO_CADENA} 190`} role="img" aria-label={`Una llamada atraviesa ${r.servicios} ${r.servicios === 1 ? 'servicio' : 'servicios'} y vuelve. Latencia total ${num(r.latenciaTotal, 0)} milisegundos, disponibilidad compuesta ${num(r.disponibilidad * 100, 2)} por ciento.`}>
          <path className="sfl-cable" d={`M${l.xCliente + 14} ${yNodo} L${l.xs[l.xs.length - 1]!}  ${yNodo}`} />
          <circle className="sfl-nodo cliente" cx={l.xCliente} cy={yNodo} r="14" />
          <text className="sfl-nodo-t chico" x={l.xCliente} y={yNodo + 4} textAnchor="middle">Vos</text>
          {l.xs.map((x, i) => (
            <g key={i}>
              <rect className={`sfl-nodo marca${enEstaPos === i ? ' activo' : ''}`} x={x - l.anchoNodo / 2} y={yNodo - 18} width={l.anchoNodo} height="36" rx="8" />
              <text className="sfl-nodo-t" x={x} y={yNodo + 4} textAnchor="middle">{etiquetaServicio(i)}</text>
              <text className="sfl-etq" x={x} y={yNodo + 34} textAnchor="middle">{num(r.latenciaAcumulada[i]!, 0)} ms</text>
              <text className="sfl-etq" x={x} y={yNodo + 46} textAnchor="middle">{porcentaje(r.disponibilidadAcumulada[i]!)}%</text>
            </g>
          ))}
          <Punto x={p.x} y={yNodo} reducido={reducido} clase={`sfl-punto${p.vuelta ? ' acierto' : ''}`} r={5} />

          {/* latencia acumulada */}
          <text className="sfl-etq fuerte" x="14" y="124">Latencia: cada salto suma</text>
          <g transform="translate(14 130)">
            {r.latenciaAcumulada.map((_, i) => {
              const por = monolito ? 1 : latencia;
              const w = (por / maxLat) * anchoBarra;
              return <rect key={i} className={`sfl-seg${i % 2 ? ' par' : ''}`} x={(i * por / maxLat) * anchoBarra} y="0" width={Math.max(1, w - 1)} height="12" rx="2" />;
            })}
            <text className="sfl-etq" x={anchoBarra + 8} y="10">{num(r.latenciaTotal, 0)} ms</text>
          </g>

          {/* caída esperada por año */}
          <text className="sfl-etq fuerte" x="14" y="164">Tiempo caído esperado en un año (la barra entera es un año)</text>
          <g transform="translate(14 170)">
            <rect className="sfl-barra-fondo" x="0" y="0" width={anchoBarra} height="12" rx="3" />
            <rect className="sfl-barra alerta" x="0" y="0" width={anchoCaida} height="12" rx="3" />
            <text className="sfl-etq" x={anchoBarra + 8} y="10">{num(r.caidaAnualHoras, 1)} h</text>
          </g>
        </svg>
      </div>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: 'Llamada que va' },
        { color: 'var(--ok)', texto: 'Respuesta que vuelve' },
      ]} />

      <Lecturas items={items} />

      <div className="sim-controles">
        <Slider etiqueta="Saltos (servicios)" valor={saltos} min={1} max={8} paso={1} onChange={setSaltos} clave="saltos" deshabilitado={monolito} />
        <Slider etiqueta="Latencia por salto" valor={latencia} min={1} max={Math.max(200, latencia)} paso={1} onChange={setLatencia} formato={(v) => `${num(v, 0)} ms`} clave="latencia-por-salto" deshabilitado={monolito} />
        <Slider
          etiqueta="Disponibilidad de cada servicio" valor={Math.round(nueves(disp) * 10) / 10} min={1} max={5} paso={0.1}
          onChange={(n) => setDisp(deNueves(n))} formato={() => `${porcentaje(disp)} %`} clave="disponibilidad"
        />
        <Interruptor etiqueta="Monolito (un solo salto, en memoria)" activo={monolito} onChange={setMonolito} clave="monolito" />
      </div>

      <BarraSim pausado={sim.pausado} onPausa={() => sim.setPausado(!sim.pausado)} />
      <p className="sim-nota">La animación no va a escala: sirve para ver el recorrido de ida y vuelta, no los milisegundos reales.</p>
    </div>
  );
}
