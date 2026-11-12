// Isla del simulador SimInferencia (SIMULADORES.md §2.4): teorema central del límite, intervalos de confianza y experimento A/B.
import * as Plot from '@observablehq/plot';
import { useMemo, useState } from 'react';
import { GraficoPlot, type ColoresTema } from '../lib/plot';
import { Boton, Botones, Leyenda, Lecturas, Selector, Slider } from './ui';
import { num } from './formato';
import type { PropsSimInferencia } from './props';
import { pdfNormal } from './estadistica/matematica';
import { desvioMuestral, media, muestra, POBLACIONES, type Poblacion } from './inferencia/poblaciones';
import { CANAL_TCL, histogramaMedias, mediasMuestrales, MAX_MUESTRAS_TCL, sigmaSobreRaizN } from './inferencia/tcl';
import {
  cobertura, construirIntervalos, LOTE_INTERVALOS, MAX_INTERVALOS, resumenMuestra, type Confianza,
} from './inferencia/intervalos';
import { experimento, MAX_EXPERIMENTOS, rechaza, teoriaAB, type Alfa, type Resultado } from './inferencia/ab';

const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const pct = (fraccion: number, dec = 1) => num(fraccion * 100, dec);

export default function SimInferencia(props: PropsSimInferencia) {
  const semilla = props.semilla ?? 42;
  if (props.modo === 'tcl') return <ModoTCL poblacion={props.poblacion} nInicial={props.n ?? 5} semilla={semilla} />;
  if (props.modo === 'intervalos') {
    return <ModoIntervalos poblacion={props.poblacion} nInicial={props.n ?? 30} confianzaInicial={props.confianza ?? 0.95} semilla={semilla} />;
  }
  return (
    <ModoAB
      tasaA={props.tasaA ?? 0.1} tasaBInicial={props.tasaB ?? 0.12} nInicial={props.nPorGrupo ?? 1000}
      alfaInicial={props.alfa ?? 0.05} semilla={semilla}
    />
  );
}

/* ───────────────────────────── TCL ───────────────────────────── */

function ModoTCL({ poblacion, nInicial, semilla }: { poblacion: Poblacion; nInicial: number; semilla: number }) {
  const info = POBLACIONES[poblacion];
  const [n, setN] = useState(nInicial);
  const [medias, setMedias] = useState<number[]>([]);
  const k = medias.length;

  const sacar = (cuantas: number) => {
    const hasta = Math.min(MAX_MUESTRAS_TCL, k + cuantas);
    setMedias((ms) => [...ms, ...mediasMuestrales(poblacion, semilla, n, ms.length, hasta)]);
  };
  const cambiarN = (v: number) => { setN(Math.round(v)); setMedias([]); };

  const ultimaMuestra = useMemo(
    () => (k > 0 ? muestra(poblacion, semilla, CANAL_TCL, k - 1, n) : []),
    [poblacion, semilla, n, k],
  );
  const hist = useMemo(() => histogramaMedias(medias, poblacion, n), [medias, poblacion, n]);
  const eeTeorico = sigmaSobreRaizN(poblacion, n);
  const mediaDeMedias = k ? media(medias) : NaN;
  const desvioDeMedias = k >= 2 ? desvioMuestral(medias) : NaN;
  const ultima = k ? medias[k - 1]! : null;

  return (
    <div className="sim-cuerpo">
      <div>
        <p className="si-subtitulo"><b>Población:</b> {info.nombre} · μ = {num(info.mu, 2)}, σ = {num(info.sigma, 2)}</p>
        <div className="sim-lienzo sim-plot">
          <GraficoPlot
            etiqueta={`Distribución de la población ${info.nombre}`} deps={[poblacion, ultimaMuestra]} testid="si-poblacion"
            opciones={(ancho, c) => opcionesPoblacion(poblacion, ultimaMuestra, ancho, c)}
          />
        </div>
      </div>
      <div>
        <p className="si-subtitulo">
          <b>Medias de {miles(k)} {k === 1 ? 'muestra' : 'muestras'}</b> de tamaño n = {n} · curva: Normal(μ, σ/√n)
        </p>
        <div className="sim-lienzo sim-plot">
          <GraficoPlot
            etiqueta={`Histograma de las medias de ${k} muestras de tamaño ${n}, con la normal teórica superpuesta`}
            deps={[hist, poblacion, n, ultima]} testid="si-medias"
            opciones={(ancho, c) => opcionesMedias(poblacion, n, hist, ultima, ancho, c)}
          />
        </div>
      </div>
      <Leyenda
        items={[
          { color: 'var(--color-area)', texto: 'Medias muestrales acumuladas' },
          { color: 'var(--tinta)', texto: 'Normal teórica N(μ, σ/√n)' },
          { color: 'var(--marca)', texto: 'Última muestra / su media' },
        ]}
      />
      <div className="sim-controles">
        <Slider etiqueta="n (tamaño de cada muestra)" clave="n" valor={n} min={1} max={100} paso={1} onChange={cambiarN} />
        <Botones>
          <Boton clave="una-muestra" onClick={() => sacar(1)} deshabilitado={k >= MAX_MUESTRAS_TCL}>1 muestra</Boton>
          <Boton clave="cien-muestras" onClick={() => sacar(100)} deshabilitado={k >= MAX_MUESTRAS_TCL}>100 muestras</Boton>
          <Boton clave="reiniciar" onClick={() => setMedias([])}>Reiniciar</Boton>
        </Botones>
      </div>
      <Lecturas
        items={[
          { clave: 'muestras', etiqueta: 'Muestras', valor: k },
          { clave: 'media-de-medias', etiqueta: 'Media de las medias', valor: num(mediaDeMedias, 3) },
          { clave: 'desvio-de-medias', etiqueta: 'Desvío de las medias', valor: num(desvioDeMedias, 3) },
          { clave: 'sigma-sobre-raiz-n', etiqueta: 'σ/√n teórico', valor: num(eeTeorico, 3) },
        ]}
      />
      {k === 0 && <p className="sim-nota">Todavía no hay muestras: apretá “1 muestra” o “100 muestras”.</p>}
    </div>
  );
}

function opcionesPoblacion(poblacion: Poblacion, muestraUltima: number[], ancho: number, c: ColoresTema): Plot.PlotOptions {
  const info = POBLACIONES[poblacion];
  const [x0, x1] = info.dominio;
  const marcas: Plot.Markish[] = [];
  let techo: number;
  if (info.discreta) {
    const datos = [1, 2, 3, 4, 5, 6].map((v) => ({ v, y: info.densidad(v) }));
    techo = 0.2;
    marcas.push(Plot.rectY(datos, { x1: (d) => d.v - 0.45, x2: (d) => d.v + 0.45, y: 'y', fill: c.area, fillOpacity: 0.9, rx: 2 }));
  } else {
    const g = Array.from({ length: 321 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / 320;
      return { x, y: info.densidad(x) };
    });
    techo = Math.max(...g.map((p) => p.y)) * 1.15;
    marcas.push(
      Plot.areaY(g, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.3 }),
      Plot.line(g, { x: 'x', y: 'y', stroke: c.area, strokeWidth: 2.4 }),
    );
  }
  marcas.push(
    Plot.ruleX([info.mu], { stroke: c.tinta, strokeDasharray: '4 3', strokeWidth: 1.4 }),
    Plot.ruleY([0], { stroke: c.tinta }),
  );
  if (muestraUltima.length) {
    marcas.push(Plot.ruleX(muestraUltima, { y1: 0, y2: techo * 0.12, stroke: c.marca, strokeWidth: muestraUltima.length > 40 ? 1.5 : 3, strokeOpacity: 0.95 }));
    marcas.push(Plot.ruleX(muestraUltima, { y1: 0, y2: techo * 0.12, stroke: c.tinta, strokeWidth: 0.6, strokeOpacity: 0.6 }));
  }
  return {
    width: ancho, height: ancho < 420 ? 130 : 150, marginLeft: 12, marginRight: 14, marginTop: 8, marginBottom: 28,
    x: { domain: [x0, x1], ticks: 6, tickFormat: (v: number) => num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1) },
    y: { domain: [0, techo], axis: null },
    marks: marcas,
  };
}

function opcionesMedias(
  poblacion: Poblacion, n: number, h: ReturnType<typeof histogramaMedias>, ultima: number | null, ancho: number, c: ColoresTema,
): Plot.PlotOptions {
  const info = POBLACIONES[poblacion];
  const ee = sigmaSobreRaizN(poblacion, n);
  const [x0, x1] = h.dominio;
  const barras = h.densidades.map((d, j) => ({ x1: h.bordes[j]!, x2: h.bordes[j + 1]!, y: d }));
  const curva = Array.from({ length: 241 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 240;
    return { x, y: pdfNormal(x, info.mu, ee) };
  });
  const techo = Math.max(pdfNormal(info.mu, info.mu, ee), ...h.densidades) * 1.12;
  const marcas: Plot.Markish[] = [
    Plot.rectY(barras, { x1: 'x1', x2: 'x2', y: 'y', fill: c.area, fillOpacity: 0.78, stroke: c.superficie, strokeWidth: 1, rx: 1.5 }),
    Plot.line(curva, { x: 'x', y: 'y', stroke: c.tinta, strokeWidth: 2.2, strokeDasharray: '6 4' }),
    Plot.ruleX([info.mu], { stroke: c.tinta, strokeDasharray: '4 3', strokeWidth: 1.2, strokeOpacity: 0.6 }),
    Plot.ruleY([0], { stroke: c.tinta }),
  ];
  if (ultima !== null && ultima >= x0 && ultima <= x1) {
    marcas.push(Plot.dot([{ x: ultima, y: 0 }], { x: 'x', y: 'y', symbol: 'triangle', r: 7, fill: c.marca, stroke: c.tinta, strokeWidth: 1.6, dy: -6 }));
  }
  if (!h.cuentas.some((v) => v > 0)) {
    marcas.push(Plot.text([{ x: (x0 + x1) / 2, y: techo / 2 }], { x: 'x', y: 'y', text: () => 'Todavía no hay muestras', fill: c.suave, fontSize: 13 }));
  }
  return {
    width: ancho, height: ancho < 420 ? 200 : 230, marginLeft: 12, marginRight: 14, marginTop: 8, marginBottom: 32,
    x: { domain: [x0, x1], ticks: 7, label: 'media de la muestra', labelAnchor: 'right', tickFormat: (v: number) => num(v, n >= 20 || poblacion === 'uniforme' ? 2 : 1) },
    y: { domain: [0, techo], axis: null },
    marks: marcas,
  };
}

/* ─────────────────────── Intervalos de confianza ─────────────────────── */

function ModoIntervalos({ poblacion, nInicial, confianzaInicial, semilla }: {
  poblacion: Poblacion; nInicial: number; confianzaInicial: Confianza; semilla: number;
}) {
  const info = POBLACIONES[poblacion];
  const [n, setN] = useState(nInicial);
  const [confianza, setConfianza] = useState<Confianza>(confianzaInicial);
  const [k, setK] = useState(0);

  // Cada intervalo es función pura de (semilla, i, n): al cambiar la confianza se redibujan las mismas muestras.
  const resumenes = useMemo(() => Array.from({ length: k }, (_, i) => resumenMuestra(poblacion, semilla, i, n)), [poblacion, semilla, n, k]);
  const ints = useMemo(() => construirIntervalos(resumenes, n, confianza, info.mu), [resumenes, n, confianza, info.mu]);
  const cubren = ints.filter((x) => x.cubre).length;
  const cob = cobertura(ints);

  return (
    <div className="sim-cuerpo">
      <div>
        <p className="si-subtitulo">
          <b>Población:</b> {info.nombre} · μ real = {num(info.mu, 2)} · cada rayita es el IC de una muestra de n = {n}
        </p>
        <div className="sim-lienzo sim-plot">
          <GraficoPlot
            etiqueta={`${ints.length} intervalos de confianza del ${Math.round(confianza * 100)} % apilados; ${cubren} cubren la media real`}
            deps={[ints, poblacion, n]} testid="si-intervalos"
            opciones={(ancho, c) => opcionesIntervalos(poblacion, n, ints, ancho, c)}
          />
        </div>
      </div>
      <Leyenda
        items={[
          { color: 'var(--color-area)', texto: 'Cubre la media real' },
          { color: 'var(--mal)', texto: 'No la cubre' },
          { color: 'var(--tinta)', texto: 'Media real μ' },
        ]}
      />
      <div className="sim-controles">
        <Slider etiqueta="n (tamaño de cada muestra)" clave="n" valor={n} min={2} max={100} paso={1} onChange={(v) => setN(Math.round(v))} />
        <Selector
          etiqueta="Confianza" clave="confianza" valor={confianza} onChange={setConfianza}
          opciones={[{ valor: 0.9, texto: '90 %' }, { valor: 0.95, texto: '95 %' }, { valor: 0.99, texto: '99 %' }]}
        />
        <Botones>
          <Boton clave="sacar-20" onClick={() => setK((v) => Math.min(MAX_INTERVALOS, v + LOTE_INTERVALOS))} deshabilitado={k >= MAX_INTERVALOS}>
            Sacar 20 intervalos
          </Boton>
          <Boton clave="reiniciar" onClick={() => setK(0)}>Reiniciar</Boton>
        </Botones>
      </div>
      <Lecturas
        items={[
          { clave: 'intervalos', etiqueta: 'Intervalos', valor: ints.length },
          { clave: 'cubren', etiqueta: 'Cubren la media', valor: cubren },
          { clave: 'cobertura', etiqueta: 'Cobertura', valor: Number.isNaN(cob) ? '—' : num(cob, 1), unidad: Number.isNaN(cob) ? undefined : '%' },
        ]}
      />
      {k === 0 && <p className="sim-nota">Apretá “Sacar 20 intervalos” y fijate cuántos atrapan a la media real.</p>}
    </div>
  );
}

function opcionesIntervalos(
  poblacion: Poblacion, n: number, ints: ReturnType<typeof construirIntervalos>, ancho: number, c: ColoresTema,
): Plot.PlotOptions {
  const info = POBLACIONES[poblacion];
  const mitad = 4.5 * sigmaSobreRaizN(poblacion, n);
  const lo = info.mu - mitad, hi = info.mu + mitad;
  const alto = ancho < 420 ? 330 : 400;
  const marcas: Plot.Markish[] = [
    Plot.ruleX([info.mu], { stroke: c.tinta, strokeWidth: 2.2 }),
    Plot.ruleY(ints, { y: 'i', x1: 'inf', x2: 'sup', stroke: (d) => (d.cubre ? c.area : c.mal), strokeWidth: ancho < 420 ? 2 : 2.4, strokeLinecap: 'round', clip: true }),
    Plot.dot(ints, { x: 'media', y: 'i', r: 1.7, fill: (d) => (d.cubre ? c.area : c.mal), clip: true }),
  ];
  if (!ints.length) {
    marcas.push(Plot.text([{ x: info.mu, y: 50 }], { x: 'x', y: 'y', text: () => 'Todavía no hay intervalos', fill: c.suave, fontSize: 13, dx: 0 }));
  }
  return {
    width: ancho, height: alto, marginLeft: 12, marginRight: 14, marginTop: 8, marginBottom: 32,
    x: { domain: [lo, hi], ticks: 7, label: 'media estimada', labelAnchor: 'right', tickFormat: (v: number) => num(v, hi - lo < 1 ? 2 : 1) },
    y: { domain: [-1, MAX_INTERVALOS], reverse: true, axis: null },
    marks: marcas,
  };
}

/* ─────────────────────────── Experimento A/B ─────────────────────────── */

function ModoAB({ tasaA, tasaBInicial, nInicial, alfaInicial, semilla }: {
  tasaA: number; tasaBInicial: number; nInicial: number; alfaInicial: Alfa; semilla: number;
}) {
  const [tasaB, setTasaB] = useState(tasaBInicial);
  const [n, setN] = useState(nInicial);
  const [alfa, setAlfa] = useState<Alfa>(alfaInicial);
  const [res, setRes] = useState<Resultado[]>([]);

  const teoria = useMemo(() => teoriaAB(tasaA, tasaB, n, alfa), [tasaA, tasaB, n, alfa]);
  const correr = (cuantos: number) => {
    setRes((r) => {
      const hasta = Math.min(MAX_EXPERIMENTOS, r.length + cuantos);
      const nuevos: Resultado[] = [];
      for (let i = r.length; i < hasta; i++) nuevos.push(experimento(semilla, i, tasaA, tasaB, n));
      return [...r, ...nuevos];
    });
  };
  // Si cambia la tasa verdadera o el tamaño, los experimentos viejos ya no corresponden: se descartan.
  const cambiarTasaB = (v: number) => { setTasaB(Math.round(v * 1000) / 1000); setRes([]); };
  const cambiarN = (v: number) => { setN(Math.round(v)); setRes([]); };

  const ultimo = res.length ? res[res.length - 1]! : null;
  const rechazos = res.filter((r) => rechaza(r, alfa)).length;
  const decision = ultimo ? (rechaza(ultimo, alfa) ? 'rechazo H0' : 'no rechazo H0') : '—';
  const minB = Math.min(0.05, tasaBInicial), maxB = Math.max(0.2, tasaBInicial);

  return (
    <div className="sim-cuerpo">
      <div>
        <p className="si-subtitulo">
          <b>A convierte {pct(tasaA)} %</b> · <b>B convierte {pct(tasaB)} %</b> · {miles(n)} usuarios por grupo
        </p>
        <div className="sim-lienzo sim-plot">
          <GraficoPlot
            etiqueta={`Distribución de la diferencia de tasas B menos A bajo H0 y bajo H1; potencia teórica ${pct(teoria.potencia)} %`}
            deps={[teoria, res, alfa]} testid="si-ab"
            opciones={(ancho, c) => opcionesAB(teoria, res, alfa, ancho, c)}
          />
        </div>
      </div>
      <Leyenda
        items={[
          { color: 'var(--tinta)', texto: 'H0: no hay diferencia' },
          { color: 'var(--color-area)', texto: 'H1: la diferencia real' },
          { color: 'var(--mal)', texto: 'Región de rechazo (α)' },
          { color: 'var(--marca)', texto: 'Último experimento' },
        ]}
      />
      <div className="sim-controles">
        <Slider
          etiqueta="Tasa real de B" clave="tasa-b" valor={tasaB} min={minB} max={maxB} paso={0.005}
          formato={(v) => `${pct(v)} %`} onChange={cambiarTasaB}
        />
        <Slider
          etiqueta="Usuarios por grupo" clave="n-por-grupo" valor={n} min={100} max={20000} log
          formato={(v) => miles(v)} onChange={cambiarN}
        />
        <Selector
          etiqueta="Nivel de significación α" clave="alfa" valor={alfa} onChange={setAlfa}
          opciones={[{ valor: 0.01, texto: '1 %' }, { valor: 0.05, texto: '5 %' }, { valor: 0.1, texto: '10 %' }]}
        />
        <Botones>
          <Boton clave="correr-1" onClick={() => correr(1)} deshabilitado={res.length >= MAX_EXPERIMENTOS}>Correr 1 experimento</Boton>
          <Boton clave="correr-200" onClick={() => correr(200)} deshabilitado={res.length >= MAX_EXPERIMENTOS}>Correr 200</Boton>
          <Boton clave="reiniciar" onClick={() => setRes([])}>Reiniciar</Boton>
        </Botones>
      </div>
      <Lecturas
        items={[
          { clave: 'diferencia-observada', etiqueta: 'Diferencia observada', valor: ultimo ? num(ultimo.difPP, 2) : '—', unidad: ultimo ? 'pp' : undefined },
          { clave: 'z', etiqueta: 'z', valor: ultimo ? num(ultimo.z, 2) : '—' },
          { clave: 'p-valor', etiqueta: 'p-valor', valor: ultimo ? num(ultimo.pValor, 4) : '—' },
          { clave: 'decision', etiqueta: 'Decisión', valor: decision, tono: ultimo && rechaza(ultimo, alfa) ? 'buena' : undefined },
          { clave: 'potencia', etiqueta: 'Potencia teórica', valor: pct(teoria.potencia, 1), unidad: '%' },
          { clave: 'tasa-rechazo', etiqueta: `Rechazos en ${miles(res.length)} exp.`, valor: res.length ? pct(rechazos / res.length, 1) : '—', unidad: res.length ? '%' : undefined },
        ]}
      />
      <p className="sim-nota">
        {Math.abs(tasaB - tasaA) < 1e-9
          ? `No hay diferencia real: cada rechazo es una falsa alarma. Con α = ${pct(alfa, 0)} % se esperan ${pct(alfa, 0)} de cada 100.`
          : `Si la diferencia real es de ${num((tasaB - tasaA) * 100, 1)} puntos, un experimento de este tamaño la detecta el ${pct(teoria.potencia)} % de las veces.`}
      </p>
    </div>
  );
}

function opcionesAB(t: ReturnType<typeof teoriaAB>, res: Resultado[], alfa: number, ancho: number, c: ColoresTema): Plot.PlotOptions {
  const se0 = t.se0 * 100, se1 = t.se1 * 100, delta = t.delta * 100, corte = t.corte * 100;
  const lo = Math.min(-4.5 * se0, delta - 4.5 * se1, -corte * 1.15);
  const hi = Math.max(4.5 * se0, delta + 4.5 * se1, corte * 1.15);
  const grilla = Array.from({ length: 401 }, (_, i) => lo + ((hi - lo) * i) / 400);
  const h0 = grilla.map((x) => ({ x, y: pdfNormal(x, 0, se0) }));
  const h1 = grilla.map((x) => ({ x, y: pdfNormal(x, delta, se1) }));
  const pico = Math.max(pdfNormal(0, 0, se0), pdfNormal(delta, delta, se1));
  const techo = pico * 1.15;
  const colaIzq0 = h0.filter((p) => p.x <= -corte);
  const colaDer0 = h0.filter((p) => p.x >= corte);
  const colaIzq1 = h1.filter((p) => p.x <= -corte);
  const colaDer1 = h1.filter((p) => p.x >= corte);
  const ultimo = res.length ? res[res.length - 1]! : null;
  const marcas: Plot.Markish[] = [
    Plot.areaY(h1, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.14 }),
    Plot.areaY(h0, { x: 'x', y: 'y', fill: c.tinta, fillOpacity: 0.08 }),
    Plot.areaY(colaIzq1, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.55 }),
    Plot.areaY(colaDer1, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.55 }),
    Plot.areaY(colaIzq0, { x: 'x', y: 'y', fill: c.mal, fillOpacity: 0.65 }),
    Plot.areaY(colaDer0, { x: 'x', y: 'y', fill: c.mal, fillOpacity: 0.65 }),
    Plot.line(h0, { x: 'x', y: 'y', stroke: c.tinta, strokeWidth: 2, strokeDasharray: '6 4' }),
    Plot.line(h1, { x: 'x', y: 'y', stroke: c.area, strokeWidth: 2.6 }),
    Plot.ruleX([-corte, corte], { stroke: c.mal, strokeWidth: 1.4, strokeDasharray: '3 3', y1: 0, y2: techo }),
    Plot.ruleY([0], { stroke: c.tinta }),
  ];
  if (res.length) {
    marcas.push(Plot.ruleX(res, {
      x: 'difPP', y1: 0, y2: techo * 0.07, stroke: (r: Resultado) => (rechaza(r, alfa) ? c.mal : c.suave),
      strokeOpacity: res.length > 60 ? 0.45 : 0.85, strokeWidth: 1.4,
    }));
  }
  if (ultimo) {
    marcas.push(
      Plot.ruleX([ultimo.difPP], { stroke: c.tinta, strokeWidth: 4.5, y1: 0, y2: techo * 0.9 }),
      Plot.ruleX([ultimo.difPP], { stroke: c.marca, strokeWidth: 2.4, y1: 0, y2: techo * 0.9 }),
      Plot.dot([{ x: ultimo.difPP, y: techo * 0.9 }], { x: 'x', y: 'y', r: 5, fill: c.marca, stroke: c.tinta, strokeWidth: 1.6 }),
    );
  }
  const ancho_x = hi - lo;
  return {
    width: ancho, height: ancho < 420 ? 240 : 290, marginLeft: 12, marginRight: 14, marginTop: 10, marginBottom: 44,
    x: {
      domain: [lo, hi], ticks: ancho < 420 ? 5 : 8, label: 'diferencia de tasas B − A (puntos porcentuales)', labelAnchor: 'center', labelArrow: 'none',
      tickFormat: (v: number) => num(v, ancho_x > 8 ? 0 : ancho_x > 2 ? 1 : 2),
    },
    y: { domain: [0, techo], axis: null },
    marks: marcas,
  };
}
