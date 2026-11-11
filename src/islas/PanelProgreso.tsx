import * as Plot from '@observablehq/plot';
import { useState } from 'react';
import { url } from '../lib/url';
import { GraficoPlot } from '../lib/plot';
import { useTemaActual } from '../lib/tema';
import { usePanel } from '../progreso/hooks';
import { useProgreso } from '../progreso/store';
import type { Panel } from '../progreso/metricas';

const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const fmtDia = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a!, m! - 1, d!).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }).replace('.', '');
};

export default function PanelProgreso() {
  const { panel, catalogo } = usePanel();
  const p = useProgreso();
  const tema = useTemaActual();
  const [abierta, setAbierta] = useState<string | null>(null);

  if (catalogo === undefined) return <div className="aviso mal" role="alert"><p>No pude cargar el catálogo. Abrí el sitio una vez con conexión para que quede guardado.</p></div>;
  if (!catalogo || !panel || !p) return <p className="meta" aria-busy="true">Calculando tu progreso…</p>;

  const sinNada = Object.keys(p.tarjetas).length === 0 && Object.keys(p.ejercicios).length === 0 && Object.keys(p.casos).length === 0;
  const porId = new Map(catalogo.areas.map((a) => [a.id, a]));
  const colorDe = (id: string) => (tema === 'dark' ? porId.get(id)!.colorOscuro : porId.get(id)!.color);
  const maxProx = Math.max(1, ...panel.proximos7.map((x) => x.cantidad));

  return (
    <div className="panel" data-testid="panel-progreso">
      {sinNada && (
        <div className="vacio ancho">
          <h2>Todavía no empezaste</h2>
          <p>Cuando repases tarjetas o resuelvas ejercicios, acá vas a ver cuánto dominás cada área y qué días estudiaste.</p>
          <a className="btn btn-marca" href={url('repaso/')}>Empezar el repaso</a>
        </div>
      )}

      <section className="bloque" aria-labelledby="hoy-t">
        <h2 id="hoy-t">Para hoy</h2>
        <div className="cifras">
          <div className="cifra"><strong data-testid="panel-vencidas">{panel.paraHoy.vencidas}</strong><span>vencidas</span></div>
          <div className="cifra"><strong data-testid="panel-nuevas">{panel.paraHoy.nuevas}</strong><span>nuevas</span></div>
          <div className="cifra"><strong data-testid="panel-total">{panel.paraHoy.total}</strong><span>en total</span></div>
        </div>
        <p className="fila-acciones"><a className="btn btn-marca" href={url('repaso/')}>Empezar repaso</a></p>
        <h3 style={{ fontSize: '1rem', marginTop: '1.2rem' }}>Próximos 7 días</h3>
        <div className="proximos" data-testid="proximos-7">
          {panel.proximos7.map((x) => (
            <div className="dia" key={x.dia}>
              <b>{x.cantidad}</b>
              <div className="col"><i style={{ ['--h' as string]: `${(x.cantidad / maxProx) * 100}%` }} /></div>
              <span>{fmtDia(x.dia)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bloque" aria-labelledby="dom-t">
        <h2 id="dom-t">Dominio por área</h2>
        <p className="meta">De 0 a 100: pesa tarjetas (qué tanto te acordás hoy), ejercicios y casos.</p>
        <GraficoPlot
          testid="grafico-dominio"
          etiqueta={`Dominio por área: ${panel.areas.map((a) => `${porId.get(a.id)!.nombre} ${a.dominio}`).join(', ')}`}
          deps={[panel, tema]}
          opciones={(w, c) => ({
            width: w, height: 28 + panel.areas.length * 46, marginLeft: 4, marginRight: 30, marginTop: 4, marginBottom: 24,
            x: { domain: [0, 100], label: null, ticks: 5, grid: true },
            y: { axis: null, domain: panel.areas.map((a) => porId.get(a.id)!.nombre) },
            marks: [
              Plot.barX(panel.areas, { y: (a) => porId.get(a.id)!.nombre, x: 'dominio', fill: (a) => colorDe(a.id), rx: 4, insetTop: 20, insetBottom: 4 }),
              Plot.text(panel.areas, { y: (a) => porId.get(a.id)!.nombre, x: 0, text: (a) => porId.get(a.id)!.nombre, textAnchor: 'start', dy: -14, fill: c.tinta, fontWeight: 650, fontSize: 13 }),
              Plot.text(panel.areas, { y: (a) => porId.get(a.id)!.nombre, x: 'dominio', text: (a) => String(a.dominio), dx: 14, dy: 8, fill: c.tinta, fontWeight: 700 }),
              Plot.ruleX([0], { stroke: c.tinta }),
            ],
          })}
        />
        <ul className="areas-lista">
          {panel.areas.map((a) => {
            const info = porId.get(a.id)!;
            const abierto = abierta === a.id;
            return (
              <li key={a.id} style={{ ['--area-claro' as string]: info.color, ['--area-oscuro' as string]: info.colorOscuro }}>
                <button type="button" aria-expanded={abierto} onClick={() => setAbierta(abierto ? null : a.id)}>
                  <span>{info.nombre}</span><span data-testid={`dominio-${a.id}`}>{a.dominio} %</span>
                </button>
                {abierto && (
                  <dl className="desglose">
                    <div><dt>Tarjetas: </dt><dd>{Math.round(a.tarjetas * 100)} % de memoria estimada · vistas {a.tarjetasVistas} de {a.tarjetasTotal}</dd></div>
                    <div><dt>Ejercicios: </dt><dd>{Math.round(a.ejercicios * 100)} % · resueltos bien {a.ejerciciosBien} de {a.ejerciciosTotal}</dd></div>
                    {a.casosTotal > 0 && <div><dt>Casos: </dt><dd>{Math.round(a.casos * 100)} % · hechos {a.casosHechos} de {a.casosTotal}</dd></div>}
                    <div><dt>Hoy: </dt><dd>{a.vencidasHoy} {a.vencidasHoy === 1 ? 'vencida' : 'vencidas'}</dd></div>
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bloque ancho" aria-labelledby="cal-t">
        <h2 id="cal-t">Días de estudio</h2>
        <p className="meta" data-testid="racha">
          Racha: <strong>{panel.racha} {panel.racha === 1 ? 'día' : 'días'}</strong> · Días estudiados en los últimos 30: <strong data-testid="dias-30">{panel.diasUltimos30}</strong>
        </p>
        <Calendario panel={panel} />
      </section>
    </div>
  );
}

function Calendario({ panel }: { panel: Panel }) {
  const celdas = panel.calendario.flatMap((sem, w) => sem.map((d, i) => ({ ...d, semana: w, dow: i })));
  return (
    <div className="calendario">
      <GraficoPlot
        testid="calendario"
        etiqueta="Calendario de las últimas 26 semanas con la cantidad de acciones de estudio por día"
        deps={[panel]}
        opciones={(w, c) => {
          const lado = Math.max(12, Math.min(22, Math.floor((w - 40) / 26)));
          return {
            width: Math.max(w, 26 * lado + 40), height: 7 * lado + 14, marginLeft: 34, marginTop: 4, marginBottom: 6, marginRight: 4,
            x: { axis: null, domain: Array.from({ length: 26 }, (_, i) => i) },
            y: { domain: [0, 1, 2, 3, 4, 5, 6], tickFormat: (d: number) => (d % 2 === 0 ? DIAS[d]! : ''), tickSize: 0, label: null },
            color: { type: 'ordinal', domain: [0, 1, 2, 3], range: [c.linea, mezclar(c.area, c.papel, 0.35), mezclar(c.area, c.papel, 0.65), c.area] },
            marks: [
              Plot.cell(celdas.filter((d) => !d.futuro), {
                x: 'semana', y: 'dow', fill: 'nivel', inset: 1.5, rx: 3,
                title: (d) => `${fmtDia(d.dia)}: ${d.cantidad} ${d.cantidad === 1 ? 'acción' : 'acciones'}`,
              }),
            ],
          };
        }}
      />
      <div className="leyenda-cal"><span>menos</span><Escala /><span>más</span></div>
    </div>
  );
}
const Escala = () => (
  <>{[0, 35, 65, 100].map((pct) => <i key={pct} style={{ background: pct === 0 ? 'var(--linea)' : `color-mix(in srgb, var(--color-area) ${pct}%, var(--papel))` }} />)}</>
);

/** Mezcla dos colores hex/rgb en `t` (0 = b, 1 = a), resuelto a rgb para que Plot lo entienda. */
function mezclar(a: string, b: string, t: number): string {
  const rgb = (s: string) => {
    const el = document.createElement('canvas').getContext('2d')!;
    el.fillStyle = s;
    const v = el.fillStyle as string;
    if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
    return (v.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
  };
  const ca = rgb(a), cb = rgb(b);
  return `rgb(${ca.map((x, i) => Math.round(x * t + cb[i]! * (1 - t))).join(',')})`;
}
