// Vistas de SimDatos (tabla, histograma, caja, barras, líneas, dispersión, torta). Los cálculos viven en derivar.ts / estadistica.ts.
import * as Plot from '@observablehq/plot';
import { GraficoPlot, type ColoresTema } from '../../lib/plot';
import { leerVar } from '../../lib/tema';
import { Leyenda } from '../ui';
import { num } from '../formato';
import { FRANJAS_TEMP, UMBRAL_HORAS, franjaTemperatura, type Dataset, type Fila } from '../presets/datasets';
import { cercas, esAtipico, histograma, media } from './estadistica';
import {
  agrupar, paresDe, regresionDe, regresionPorFranja, repetidas, seriesDe, valoresDe,
  type Resumen,
} from './derivar';
import { anscombe, CUARTETOS } from '../presets/datasets';

const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Paleta categórica del simulador (variables --sd-c1..5 de sim.css, con versión clara y oscura). */
export const paleta = (): string[] => [1, 2, 3, 4, 5].map((i) => leerVar(`--sd-c${i}`));
/** Lo mismo para el HTML de la leyenda (se resuelve en CSS, sirve en el servidor). */
const PALETA_CSS = [1, 2, 3, 4, 5].map((i) => `var(--sd-c${i})`);

const fmtEje = (d: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(d);
const fmtEntero = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);

export function etiquetaColumna(ds: Dataset, clave: string): string {
  const c = ds.columnas.find((x) => x.clave === clave);
  if (!c) return clave;
  return c.unidad ? `${c.etiqueta} (${c.unidad})` : c.etiqueta;
}
const unidadDe = (ds: Dataset, clave: string) => ds.columnas.find((x) => x.clave === clave)?.unidad ?? '';

const altoPara = (ancho: number, prop = 0.58, min = 230, max = 360) => Math.round(Math.min(max, Math.max(min, ancho * prop)));

export interface Escala { limite: number; fuera: number[] }

/** Aviso cuando hay valores que no entran en la escala del gráfico. */
export function NotaFuera({ ds, escala }: { ds: Dataset; escala: Escala }) {
  if (!escala.fuera.length) return null;
  const u = unidadDe(ds, ds.principal);
  const lista = [...new Set(escala.fuera)].map((v) => fmtEntero(v)).join(' y ');
  const n = escala.fuera.length;
  return (
    <p className="sim-nota sd-fuera" data-testid="sd-fuera">
      {n === 1 ? 'Un valor' : `${n} valores`} de {lista}{u ? ` ${u}` : ''} {n === 1 ? 'queda' : 'quedan'} fuera de la escala del gráfico: si no, el resto se vería aplastado.
    </p>
  );
}

// ================================================================= tabla
export function VistaTabla({ ds, filas, marcarOutliers, cercasPrincipal, corregidas }: {
  ds: Dataset; filas: Fila[]; marcarOutliers: boolean; cercasPrincipal: Resumen['cercas']; corregidas: boolean;
}) {
  const columnas = ds.columnas.filter((c) => !c.oculta);
  const rep = repetidas(filas);
  const MAX = 200;
  const visibles = filas.slice(0, MAX);
  const esTickets = ds.id === 'tickets-sucios';
  const hayRep = rep.some(Boolean);
  const hayVacias = filas.some((f) => f[ds.principal] === null);
  const hayHoras = esTickets && !corregidas && filas.some((f) => { const v = f[ds.principal]; return esNumero(v) && v <= UMBRAL_HORAS; });
  const hayAtipicos = marcarOutliers && filas.some((f) => { const v = f[ds.principal]; return esNumero(v) && esAtipico(v, cercasPrincipal); });
  return (
    <div>
      <div className="sim-tabla sd-tabla" tabIndex={0} role="region" aria-label="Filas del dataset">
        <table>
          <caption className="sd-solo-lector">Filas del dataset</caption>
          <thead>
            <tr>
              <th scope="col" className="sd-n">#</th>
              {columnas.map((c) => <th key={c.clave} scope="col">{c.etiqueta}{c.unidad ? ` (${c.unidad})` : ''}</th>)}
              {esTickets && <th scope="col">aviso</th>}
            </tr>
          </thead>
          <tbody>
            {visibles.map((f, i) => {
              const v = f[ds.principal];
              const vacio = v === null;
              const horas = esTickets && !corregidas && esNumero(v) && v <= UMBRAL_HORAS;
              const atipico = marcarOutliers && esNumero(v) && esAtipico(v, cercasPrincipal);
              const clases = [rep[i] ? 'sd-dup' : '', atipico ? 'sd-atip' : ''].filter(Boolean).join(' ');
              const avisos = [rep[i] && 'duplicada', vacio && 'vacío', horas && '¿horas?', atipico && 'atípico'].filter(Boolean).join(' · ');
              return (
                <tr key={`${i}-${String(f.id ?? f.mes ?? f.n ?? f.dia ?? f.alumno ?? i)}`} className={clases}>
                  <td className="sd-n">{i + 1}</td>
                  {columnas.map((c) => {
                    const x = f[c.clave];
                    const raro = (c.clave === ds.principal) && (vacio || horas || atipico);
                    return (
                      <td key={c.clave} className={`${typeof x === 'number' ? 'sd-num' : ''}${raro ? ' sd-raro' : ''}`}>
                        {x === null ? <em>vacío</em> : typeof x === 'number' ? num(x, Number.isInteger(x) ? 0 : 2) : x}
                      </td>
                    );
                  })}
                  {esTickets && <td className="sd-aviso">{avisos}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filas.length > MAX && <p className="sim-nota">Se muestran las primeras {MAX} de {filas.length} filas.</p>}
      {(hayRep || hayVacias || hayHoras || hayAtipicos) && (
        <p className="sim-nota sd-claves">
          {hayRep && <span><i className="sd-marca sd-m-dup" />fila repetida</span>}
          {hayVacias && <span><i className="sd-marca sd-m-vacio" />dato faltante</span>}
          {hayHoras && <span><i className="sd-marca sd-m-vacio" />¿cargada en horas?</span>}
          {hayAtipicos && <span><i className="sd-marca sd-m-atip" />valor atípico (1,5·IQR)</span>}
        </p>
      )}
    </div>
  );
}

// ================================================================= histograma
export function VistaHistograma({ ds, filas, bins, resumen, escala, marcar }: {
  ds: Dataset; filas: Fila[]; bins: number; resumen: Resumen; escala: Escala; marcar: boolean;
}) {
  const etiqueta = etiquetaColumna(ds, ds.principal);
  return (
    <div>
      <GraficoPlot
        testid="sd-grafico"
        etiqueta={`Histograma de ${etiqueta} con ${bins} barras. Media ${num(resumen.media, 2)}, mediana ${num(resumen.mediana, 2)}.`}
        deps={[ds, filas, bins, resumen, escala, marcar]}
        opciones={(ancho, c) => {
          const p = paleta();
          const vals = valoresDe(filas, ds.principal).filter((v) => v <= escala.limite);
          const min = Math.min(...vals);
          const lo = min >= 0 ? 0 : min;
          const hi = Math.max(escala.limite, resumen.media) * 1.04;
          const barras = histograma(vals, bins, [lo, hi]);
          const dentro = (x: number) => x >= lo && x <= hi;
          const marcas: Plot.Markish[] = [
            Plot.rectY(barras, { x1: 'x0', x2: 'x1', y: 'n', fill: c.area, fillOpacity: 0.85, inset: 0.4 }),
            Plot.ruleY([0], { stroke: c.linea }),
          ];
          if (marcar) {
            const lim = [resumen.cercas.bajo, resumen.cercas.alto].filter(dentro);
            marcas.push(
              Plot.ruleX(lim, { stroke: c.mal, strokeWidth: 1.5, strokeDasharray: '2 3' }),
              Plot.text(lim.map((x) => ({ x })), { x: 'x', text: () => 'límite 1,5·IQR', frameAnchor: 'bottom', dy: -4, dx: 5, textAnchor: 'start', fill: c.mal, fontSize: 11 }),
            );
          }
          // Las dos etiquetas van juntas, a un lado de la línea más lejana, para que no se pisen ni tapen el eje.
          const xa = Math.max(resumen.media, resumen.mediana);
          const xb = Math.min(resumen.media, resumen.mediana);
          const ancha = ancho - 44 - 14;
          const aLaDerecha = ((xa - lo) / (hi - lo)) * ancha < ancha * 0.6;
          const etiqueta2 = (x: number, t: string, color: string, dy: number) => Plot.text([{ x }], {
            x: 'x', text: () => t, frameAnchor: 'top', textAnchor: aLaDerecha ? 'start' : 'end', dx: aLaDerecha ? 6 : -6, dy,
            fill: color, fontWeight: 700, fontSize: 12, stroke: c.superficie, strokeWidth: 3, paintOrder: 'stroke',
          });
          marcas.push(
            Plot.ruleX([resumen.mediana], { stroke: p[3], strokeWidth: 2.5, strokeDasharray: '6 3' }),
            Plot.ruleX([resumen.media], { stroke: p[1], strokeWidth: 2.5 }),
            etiqueta2(aLaDerecha ? xa : xb, `media ${num(resumen.media, 1)}`, p[1]!, 8),
            etiqueta2(aLaDerecha ? xa : xb, `mediana ${num(resumen.mediana, 1)}`, p[3]!, 26),
          );
          return {
            width: ancho, height: altoPara(ancho), marginLeft: 44, marginRight: 14, marginBottom: 42,
            x: { domain: [lo, hi], label: etiqueta, tickFormat: fmtEje, labelAnchor: 'right', ticks: Math.max(3, Math.floor(ancho / 90)) },
            y: { label: 'Cantidad', grid: true, tickFormat: fmtEje },
            marks: marcas,
          };
        }}
      />
      <Leyenda items={[{ color: PALETA_CSS[1]!, texto: 'Media (sensible a los extremos)' }, { color: PALETA_CSS[3]!, texto: 'Mediana (el valor del medio)' }]} />
    </div>
  );
}

// ================================================================= caja
export function VistaCaja({ ds, filas, escala, marcar, resumen }: {
  ds: Dataset; filas: Fila[]; escala: Escala; marcar: boolean; resumen: Resumen;
}) {
  const etiqueta = etiquetaColumna(ds, ds.principal);
  const grupo = ds.grupo;
  return (
    <div>
      <GraficoPlot
        testid="sd-grafico"
        etiqueta={`Diagrama de caja de ${etiqueta}${grupo ? ` por ${grupo}` : ''}.`}
        deps={[ds, filas, escala, marcar, resumen]}
        opciones={(ancho, c) => {
          const p = paleta();
          const datos = filas
            .filter((f) => esNumero(f[ds.principal]) && (f[ds.principal] as number) <= escala.limite)
            .map((f) => ({ v: f[ds.principal] as number, g: grupo ? String(f[grupo]) : 'Todos' }));
          const grupos = [...new Set(datos.map((d) => d.g))];
          const medias = grupos.map((g) => ({ g, m: media(datos.filter((d) => d.g === g).map((d) => d.v)) }));
          const atipicos = marcar
            ? grupos.flatMap((g) => {
                const vs = datos.filter((d) => d.g === g).map((d) => d.v);
                const k = cercas(vs);
                return vs.filter((v) => esAtipico(v, k)).map((v) => ({ g, v }));
              })
            : [];
          const hi = Math.max(escala.limite, ...medias.map((m) => m.m)) * 1.04;
          const lo = Math.min(...datos.map((d) => d.v));
          return {
            width: ancho, height: grupo ? Math.max(200, 56 + grupos.length * 40) : 170,
            marginLeft: grupo ? 76 : 14, marginRight: 14, marginBottom: 42, marginTop: 10,
            x: { label: etiqueta, grid: true, tickFormat: fmtEje, labelAnchor: 'right', domain: [lo >= 0 ? 0 : lo, hi], ticks: Math.max(3, Math.floor(ancho / 90)) },
            y: { domain: grupos, label: null, axis: grupo ? 'left' : null },
            marks: [
              Plot.boxX(datos, { x: 'v', y: 'g', fill: c.area, fillOpacity: 0.35, stroke: c.area, strokeWidth: 1.6, r: 3.2 }),
              ...(atipicos.length ? [Plot.dot(atipicos, { x: 'v', y: 'g', stroke: c.mal, fill: c.mal, r: 4 })] : []),
              Plot.dot(medias, { x: 'm', y: 'g', symbol: 'diamond', r: 6, fill: p[1], stroke: c.superficie, strokeWidth: 1.5 }),
            ],
          };
        }}
      />
      <Leyenda items={[{ color: PALETA_CSS[1]!, texto: `Rombo: media (${num(resumen.media, 1)})` }, { color: 'var(--color-area)', texto: 'Caja: del 25 % al 75 % de los datos; la línea del medio es la mediana' }]} />
    </div>
  );
}

// ================================================================= barras
export function VistaBarras({ ds, filas }: { ds: Dataset; filas: Fila[] }) {
  const g = agrupar(ds, filas);
  const total = g.items.reduce((s, i) => s + i.valor, 0);
  return (
    <div>
      <p className="sd-subtitulo">{g.titulo}</p>
      <GraficoPlot
        testid="sd-grafico"
        etiqueta={`Gráfico de barras: ${g.titulo}. ${g.items.map((i) => `${i.nombre} ${fmtEntero(i.valor)}`).join(', ')}.`}
        deps={[ds, filas]}
        opciones={(ancho, c) => ({
          width: ancho, height: 64 + g.items.length * 38, marginLeft: ancho < 420 ? 112 : 128, marginRight: 52, marginTop: 8, marginBottom: 32,
          x: { label: g.unidad, grid: true, tickFormat: fmtEje, labelAnchor: 'right', ticks: Math.max(3, Math.floor(ancho / 100)) },
          y: { domain: g.items.map((i) => i.nombre), label: null },
          marks: [
            Plot.barX(g.items, { x: 'valor', y: 'nombre', fill: c.area, rx: 3 }),
            Plot.text(g.items, { x: 'valor', y: 'nombre', text: (d: { valor: number }) => fmtEntero(d.valor), textAnchor: 'start', dx: 6, fontWeight: 700, fill: c.tinta }),
            Plot.ruleX([0], { stroke: c.linea }),
          ],
        })}
      />
      <p className="sim-nota">Total: {fmtEntero(total)} {g.unidad}</p>
    </div>
  );
}

// ================================================================= torta (SVG propio: Plot 0.6 no trae sectores)
export function VistaTorta({ ds, filas }: { ds: Dataset; filas: Fila[] }) {
  const g = agrupar(ds, filas);
  const total = g.items.reduce((s, i) => s + i.valor, 0) || 1;
  let acum = 0;
  const trozos = g.items.map((it, i) => {
    const pct = (it.valor / total) * 100;
    const t = { ...it, pct, desde: acum, color: `var(--sd-c${(i % 5) + 1})` };
    acum += pct;
    return t;
  });
  return (
    <div>
      <p className="sd-subtitulo">{g.titulo}</p>
      <div className="sd-torta">
        <svg viewBox="0 0 100 100" role="img" aria-label={`Gráfico de torta: ${g.titulo}. ${trozos.map((t) => `${t.nombre} ${num(t.pct, 1)} %`).join(', ')}.`} className="sd-torta-svg">
          <g transform="rotate(-90 50 50)">
            {trozos.map((t) => (
              <circle
                key={t.nombre} cx="50" cy="50" r="25" fill="none" stroke={t.color} strokeWidth="50" pathLength={100}
                strokeDasharray={`${Math.max(0, t.pct - (t.pct > 0.6 ? 0.5 : 0))} ${100 - Math.max(0, t.pct - (t.pct > 0.6 ? 0.5 : 0))}`}
                strokeDashoffset={-t.desde} className="sd-trozo"
              />
            ))}
          </g>
        </svg>
        <ul className="sd-torta-ref">
          {trozos.map((t) => (
            <li key={t.nombre}>
              <i style={{ background: t.color }} />
              <span>{t.nombre}</span>
              <strong>{num(t.pct, 1)} %</strong>
              <small>{fmtEntero(t.valor)} {g.unidad}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ================================================================= líneas
export function VistaLineas({ ds, filas, escala }: { ds: Dataset; filas: Fila[]; escala: Escala }) {
  const s = seriesDe(ds, filas);
  const recorta = ds.id === 'latencias';
  const series = s.series.map((x) => ({ ...x, puntos: recorta ? x.puntos.filter((q) => q.y <= escala.limite) : x.puntos }));
  return (
    <div>
      <GraficoPlot
        testid="sd-grafico"
        etiqueta={`Gráfico de líneas: ${s.yEtiqueta} según ${s.xEtiqueta}. Series: ${series.map((x) => x.nombre).join(', ')}.`}
        deps={[ds, filas, escala]}
        opciones={(ancho, c) => {
          const p = paleta();
          const datos = series.flatMap((x) => x.puntos.map((q) => ({ ...q, serie: x.nombre })));
          const multiples = series.length > 1;
          const pocos = (series[0]?.puntos.length ?? 0) <= 30;
          return {
            width: ancho, height: altoPara(ancho, 0.6), marginLeft: 46, marginRight: 14, marginBottom: 42,
            x: { label: s.xEtiqueta, tickFormat: fmtEje, labelAnchor: 'right', ticks: Math.max(3, Math.floor(ancho / 80)) },
            y: { label: s.yEtiqueta, grid: true, tickFormat: fmtEje, labelAnchor: 'top' },
            color: { domain: series.map((x) => x.nombre), range: multiples ? p.slice(0, series.length) : [c.area] },
            marks: [
              Plot.line(datos, { x: 'x', y: 'y', stroke: 'serie', strokeWidth: recorta ? 1.2 : 2.2, strokeLinejoin: 'round' }),
              ...(pocos ? [Plot.dot(datos, { x: 'x', y: 'y', fill: 'serie', r: 2.6, stroke: c.superficie, strokeWidth: 0.8 })] : []),
              Plot.ruleY([0], { stroke: c.linea }),
            ],
          };
        }}
      />
      {series.length > 1 && <Leyenda items={series.map((x, i) => ({ color: PALETA_CSS[i] ?? '', texto: x.nombre }))} />}
    </div>
  );
}

// ================================================================= dispersión
export interface OpcionesDispersion {
  regresion: boolean; colorear: boolean; marcar: boolean; resumen: Resumen; escala: Escala; conOutlier: boolean; cuatro: boolean;
}

function extremosX(xs: number[]): [number, number] { return [Math.min(...xs), Math.max(...xs)]; }
const recta = (m: { pendiente: number; ordenada: number }, [a, b]: [number, number]) => [
  { x: a, y: m.ordenada + m.pendiente * a }, { x: b, y: m.ordenada + m.pendiente * b },
];

export function VistaDispersion({ ds, filas, o }: { ds: Dataset; filas: Fila[]; o: OpcionesDispersion }) {
  const { regresion, colorear, marcar, resumen, escala, conOutlier, cuatro } = o;
  const etX = etiquetaColumna(ds, ds.par.x);
  const etY = etiquetaColumna(ds, ds.par.y);

  if (cuatro && ds.id === 'anscombe') return <DispersionCuarteto regresion={regresion} />;

  const esPrincipalY = ds.par.y === ds.principal;
  const porRegion = ds.id === 'ventas-mensuales';
  const franjas = ds.id === 'confusora-temperatura' && colorear;
  const leyenda = franjas ? [...FRANJAS_TEMP] : porRegion ? ['Norte', 'Centro', 'Sur'] : [];
  const coloresDe = (p: string[]) => (franjas ? [p[0]!, p[3]!, p[1]!] : [p[0]!, p[1]!, p[2]!]);
  const rg = regresionDe(ds, filas);

  return (
    <div>
      <GraficoPlot
        testid="sd-grafico"
        etiqueta={`Gráfico de dispersión de ${etY} según ${etX}.${regresion ? ` Recta de mínimos cuadrados, r = ${num(rg.r, 2)}.` : ''}`}
        deps={[ds, filas, regresion, colorear, marcar, resumen, escala, conOutlier]}
        opciones={(ancho, c) => {
          const coloresGrupo = coloresDe(paleta());
          const pares = paresDe(ds, filas).filas.filter((f) => !(esPrincipalY && (f[ds.par.y] as number) > escala.limite));
          const temp = (f: Fila) => (esNumero(f.temperatura) ? FRANJAS_TEMP[franjaTemperatura(f.temperatura)]! : '');
          const grupoDe = (f: Fila) => (franjas ? temp(f) : porRegion ? String(f.region) : 'todos');
          const datos = pares.map((f) => ({
            x: f[ds.par.x] as number, y: f[ds.par.y] as number, g: grupoDe(f),
            atipico: marcar && esPrincipalY && esAtipico(f[ds.par.y] as number, resumen.cercas),
            extra: conOutlier && ds.id === 'horas-y-notas' && f.alumno === 61,
          }));
          const [x0, x1] = extremosX(datos.map((d) => d.x));
          const conGrupos = leyenda.length > 0;
          const marcas: Plot.Markish[] = [
            Plot.dot(datos, {
              x: 'x', y: 'y', r: 4.2, fillOpacity: 0.8, stroke: c.superficie, strokeWidth: 0.8,
              ...(conGrupos ? { fill: 'g' } : { fill: c.area }),
              title: (d: { x: number; y: number }) => `${etX}: ${fmtEje(d.x)}\n${etY}: ${fmtEje(d.y)}`,
            }),
          ];
          const resaltados = datos.filter((d) => d.atipico || d.extra);
          if (resaltados.length) marcas.push(Plot.dot(resaltados, { x: 'x', y: 'y', r: 8, stroke: c.mal, strokeWidth: 2, fill: 'none' }));
          if (regresion) {
            if (franjas) {
              marcas.push(Plot.line(recta(rg, [x0, x1]), { x: 'x', y: 'y', stroke: c.suave, strokeWidth: 2, strokeDasharray: '6 4' }));
              regresionPorFranja(ds, filas).forEach((m, i) => {
                const xs = pares.filter((f) => esNumero(f.temperatura) && franjaTemperatura(f.temperatura) === i).map((f) => f[ds.par.x] as number);
                if (xs.length > 2 && Number.isFinite(m.pendiente)) {
                  marcas.push(Plot.line(recta(m, extremosX(xs)), { x: 'x', y: 'y', stroke: coloresGrupo[i], strokeWidth: 3 }));
                }
              });
            } else {
              if (conOutlier && ds.id === 'horas-y-notas') {
                const sin = { ...ds, filas: ds.filas.filter((f) => f.alumno !== 61) };
                marcas.push(Plot.line(recta(regresionDe(sin, sin.filas), [x0, x1]), { x: 'x', y: 'y', stroke: c.suave, strokeWidth: 2, strokeDasharray: '6 4' }));
              }
              marcas.push(Plot.line(recta(rg, [x0, x1]), { x: 'x', y: 'y', stroke: c.tinta, strokeWidth: 2.4 }));
            }
            marcas.push(Plot.text([{ t: `r = ${num(rg.r, 2)}` }], {
              text: 't', frameAnchor: 'top-left', dx: 8, dy: 6, fontWeight: 700, fontSize: 13, fill: c.tinta, stroke: c.superficie, strokeWidth: 3, paintOrder: 'stroke',
            }));
          }
          return {
            width: ancho, height: altoPara(ancho, 0.68, 260, 380), marginLeft: 48, marginRight: 14, marginBottom: 44,
            x: { label: etX, grid: true, tickFormat: fmtEje, labelAnchor: 'right', ticks: Math.max(3, Math.floor(ancho / 80)) },
            y: { label: etY, grid: true, tickFormat: fmtEje, labelAnchor: 'top' },
            color: conGrupos ? { domain: leyenda, range: coloresGrupo.slice(0, leyenda.length) } : undefined,
            marks: marcas,
          };
        }}
      />
      <Leyenda items={[
        ...leyenda.map((t, i) => ({ color: coloresDe(PALETA_CSS)[i] ?? '', texto: t })),
        ...(regresion && !franjas ? [{ color: 'var(--tinta)', texto: 'Recta de mínimos cuadrados' }] : []),
        ...(regresion && franjas ? [{ color: 'var(--suave)', texto: 'Recta de todos los días juntos' }, { color: 'var(--tinta)', texto: 'Rectas dentro de cada franja' }] : []),
        ...(regresion && conOutlier && ds.id === 'horas-y-notas' ? [{ color: 'var(--suave)', texto: 'Recta sin el outlier' }] : []),
      ]} />
    </div>
  );
}

/** Los cuatro cuartetos de Anscombe en una grilla de 2 × 2 con la misma escala. */
function DispersionCuarteto({ regresion }: { regresion: boolean }) {
  return (
    <GraficoPlot
      testid="sd-grafico"
      etiqueta="Los cuatro cuartetos de Anscombe: mismas medias, misma recta y r = 0,82, pero nubes de puntos muy distintas."
      deps={[regresion]}
      opciones={(ancho, c) => {
        const celda = (q: string) => ({ fx: q === 'I' || q === 'III' ? 'a' : 'b', fy: q === 'I' || q === 'II' ? 'arriba' : 'abajo' });
        const todos = CUARTETOS.flatMap((q) => {
          const ds = anscombe(q);
          const m = regresionDe(ds, ds.filas);
          return ds.filas.map((f) => ({ x: f.x as number, y: f.y as number, q, ...celda(q), r: m.r, a: m.ordenada, b: m.pendiente }));
        });
        const etiquetas = CUARTETOS.map((q) => {
          const ds = anscombe(q);
          return { q, ...celda(q), texto: `${q}${regresion ? ` · r = ${num(regresionDe(ds, ds.filas).r, 2)}` : ''}` };
        });
        const rectas = CUARTETOS.flatMap((q) => {
          const ds = anscombe(q);
          const m = regresionDe(ds, ds.filas);
          return [3, 20].map((x) => ({ x, y: m.ordenada + m.pendiente * x, ...celda(q) }));
        });
        return {
          width: ancho, height: altoPara(ancho, 0.95, 300, 460), marginLeft: 36, marginRight: 10, marginBottom: 40, marginTop: 8,
          x: { label: 'x', domain: [2, 20], grid: true, labelAnchor: 'right' },
          y: { label: 'y', domain: [2, 14], grid: true, labelAnchor: 'top' },
          fx: { axis: null, domain: ['a', 'b'] }, fy: { axis: null, domain: ['arriba', 'abajo'] },
          marks: [
            Plot.frame({ stroke: c.linea }),
            ...(regresion ? [Plot.line(rectas, { x: 'x', y: 'y', fx: 'fx', fy: 'fy', stroke: c.tinta, strokeWidth: 2 })] : []),
            Plot.dot(todos, { x: 'x', y: 'y', fx: 'fx', fy: 'fy', r: 3.8, fill: c.area, fillOpacity: 0.85, stroke: c.superficie, strokeWidth: 0.8 }),
            Plot.text(etiquetas, { fx: 'fx', fy: 'fy', text: 'texto', frameAnchor: 'top-left', dx: 6, dy: 6, fontWeight: 700, fill: c.tinta }),
          ],
        };
      }}
    />
  );
}

export type { ColoresTema };
