// Isla del simulador SimDistribucion (SIMULADORES.md §2.3): distribuciones discretas y continuas con Observable Plot.
import * as Plot from '@observablehq/plot';
import { useMemo, useState } from 'react';
import { GraficoPlot, type ColoresTema } from '../lib/plot';
import { Leyenda, Lecturas, Selector, Slider } from './ui';
import { num } from './formato';
import type { PropsSimDistribucion } from './props';
import {
  DISTRIBUCIONES, NOMBRE_DISTRIBUCION, densidad, dominio, esDiscreta, intervaloInicial, momentos, parametrosIniciales,
  pmf, probIntervalo, probIntervaloAproxNormal, rangoIntervalo, soporteDiscreto, techoY, type Distribucion, type Par,
} from './distribucion/modelo';

const PUNTOS_CURVA = 360;

/** Texto de la distribución: "X ~ Binomial(n = 10, p = 0,50)". */
function formula(d: Distribucion, par: Par): string {
  switch (d) {
    case 'binomial': return `X ~ Binomial(n = ${par.n}, p = ${num(par.p, 2)})`;
    case 'poisson': return `X ~ Poisson(λ = ${num(par.lambdaPoisson, 1)})`;
    case 'normal': return `X ~ Normal(μ = ${num(par.mu, 1)}, σ = ${num(par.sigma, 1)})`;
    case 'exponencial': return `X ~ Exponencial(λ = ${num(par.lambdaExp, 1)})`;
    case 'uniforme': return `X ~ Uniforme(a = ${num(par.a, 1)}, b = ${num(par.b, 1)})`;
  }
}

/** Puntos (x, densidad) de una continua entre x0 y x1; la uniforme lleva escalones verticales. */
function curva(d: Distribucion, par: Par, x0: number, x1: number): { x: number; y: number }[] {
  const xs: number[] = [];
  for (let i = 0; i <= PUNTOS_CURVA; i++) xs.push(x0 + ((x1 - x0) * i) / PUNTOS_CURVA);
  if (d === 'uniforme') {
    const e = (par.b - par.a) * 1e-9;
    for (const x of [par.a - e, par.a, par.b, par.b + e]) if (x > x0 && x < x1) xs.push(x);
    xs.sort((p, q) => p - q);
  }
  return xs.map((x) => ({ x, y: densidad(d, par, x) }));
}

function opcionesGrafico(
  d: Distribucion, par: Par, intervalo: [number, number] | null, aproximar: boolean, ancho: number, c: ColoresTema,
): Plot.PlotOptions {
  const { media, desvio } = momentos(d, par);
  const [x0, x1] = dominio(d, par);
  const techo = techoY(d, par);
  const marcas: Plot.Markish[] = [
    Plot.gridY({ stroke: c.linea, strokeOpacity: 0.6 }),
    Plot.rect([{ a: media - desvio, b: media + desvio }], { x1: 'a', x2: 'b', y1: 0, y2: techo, fill: c.marca, fillOpacity: 0.28 }),
  ];
  if (esDiscreta(d)) {
    const datos = soporteDiscreto(d, par).map((k) => ({
      k, p: pmf(d, par, k), dentro: !intervalo || (k >= intervalo[0] && k <= intervalo[1]),
    }));
    marcas.push(Plot.rectY(datos, {
      x1: (r) => r.k - 0.5, x2: (r) => r.k + 0.5, y: 'p', fill: c.area, fillOpacity: (r) => (r.dentro ? 0.95 : 0.3),
      stroke: c.superficie, strokeWidth: par.n > 60 && d === 'binomial' ? 0.4 : 1, rx: 1.5,
    }));
    if (aproximar && desvio > 1e-9) {
      const g = curva('normal', { ...par, mu: media, sigma: desvio }, x0, x1);
      marcas.push(Plot.line(g, { x: 'x', y: 'y', stroke: c.tinta, strokeWidth: 2, strokeDasharray: '5 4', curve: 'monotone-x' }));
    }
  } else {
    const g = curva(d, par, x0, x1);
    marcas.push(Plot.areaY(g, { x: 'x', y: 'y', fill: c.area, fillOpacity: intervalo ? 0.14 : 0.3 }));
    if (intervalo) {
      const sombra = curva(d, par, intervalo[0], intervalo[1]);
      marcas.push(Plot.areaY(sombra, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.7 }));
    }
    marcas.push(Plot.line(g, { x: 'x', y: 'y', stroke: c.area, strokeWidth: 2.6, strokeLinejoin: 'round' }));
  }
  if (intervalo) {
    // En las discretas el intervalo cubre las barras completas (k ± 0,5).
    const bordes = esDiscreta(d) ? [intervalo[0] - 0.5, intervalo[1] + 0.5] : intervalo;
    marcas.push(Plot.ruleX(bordes, { stroke: c.area, strokeWidth: 2, strokeOpacity: 0.9, y1: 0, y2: techo }));
  }
  marcas.push(
    Plot.ruleX([media], { stroke: c.tinta, strokeWidth: 1.5, strokeDasharray: '4 3' }),
    Plot.text([{ x: media, y: techo }], { x: 'x', y: 'y', text: () => `media ${num(media, 2)}`, textAnchor: media > (x0 + x1) / 2 ? 'end' : 'start', dx: media > (x0 + x1) / 2 ? -5 : 5, dy: 12, fill: c.tinta, fontWeight: 600 }),
    Plot.ruleY([0], { stroke: c.tinta }),
  );
  return {
    width: ancho,
    height: ancho < 420 ? 240 : 300,
    marginLeft: 46, marginRight: 14, marginTop: 10, marginBottom: 34,
    x: { domain: [x0, x1], label: 'x', labelAnchor: 'right', ticks: esDiscreta(d) ? Math.max(3, Math.min(11, Math.floor(ancho / 55))) : 8, tickFormat: (v: number) => num(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1) },
    y: { domain: [0, techo], label: esDiscreta(d) ? 'P(X = x)' : 'densidad', ticks: 5, tickFormat: (v: number) => num(v, v >= 1 ? 1 : 2) },
    marks: marcas,
  };
}

export default function SimDistribucion(props: PropsSimDistribucion) {
  const { distribucion: inicial, parametros, mostrarIntervalo = false, aproximacionNormal = false, permitirCambiarDistribucion = false } = props;
  const [dist, setDist] = useState<Distribucion>(inicial);
  const [par, setPar] = useState<Par>(() => parametrosIniciales(inicial, parametros));
  const [iv, setIv] = useState<[number, number]>(() => intervaloInicial(inicial, parametrosIniciales(inicial, parametros)));

  const discreta = esDiscreta(dist);
  const mom = useMemo(() => momentos(dist, par), [dist, par]);
  const rango = useMemo(() => rangoIntervalo(dist, par), [dist, par]);
  // El intervalo guardado se acota al rango vigente (cambiar n o σ no lo deja afuera).
  const desde = Math.min(rango.max, Math.max(rango.min, iv[0]));
  const hasta = Math.min(rango.max, Math.max(rango.min, iv[1]));
  const prob = useMemo(() => probIntervalo(dist, par, desde, hasta), [dist, par, desde, hasta]);
  const probAprox = useMemo(
    () => (discreta && aproximacionNormal ? probIntervaloAproxNormal(dist, par, desde, hasta) : null),
    [dist, par, desde, hasta, discreta, aproximacionNormal],
  );

  const poner = (cambio: Partial<Par>) => setPar((p) => ({ ...p, ...cambio }));
  const cambiarDistribucion = (d: Distribucion) => {
    setDist(d);
    setIv(intervaloInicial(d, par));
  };
  const ponerDesde = (v: number) => setIv([v, Math.max(v, hasta)]);
  const ponerHasta = (v: number) => setIv([Math.min(v, desde), v]);

  const intervalo: [number, number] | null = mostrarIntervalo ? [desde, hasta] : null;
  const deps = [dist, par, desde, hasta, mostrarIntervalo, aproximacionNormal];
  const etiquetaGrafico = `Gráfico de ${formula(dist, par)}: media ${num(mom.media, 2)}, desvío ${num(mom.desvio, 2)}.`;
  const nf = (v: number) => num(v, discreta ? 0 : rango.paso < 0.1 ? 2 : 1);

  const leyenda = [
    { color: 'var(--color-area)', texto: discreta ? 'Probabilidad de cada valor' : 'Densidad' },
    { color: 'var(--marca)', texto: 'Media ± 1 desvío' },
    ...(aproximacionNormal && discreta ? [{ color: 'var(--tinta)', texto: 'Normal con la misma media y varianza' }] : []),
  ];

  return (
    <div className="sim-cuerpo">
      <div className="sd-cabecera">
        <span className="sd-formula">{formula(dist, par)}</span>
        {mostrarIntervalo && (
          <span className="sd-prob">
            P({nf(desde)} ≤ X ≤ {nf(hasta)}) = <b>{num(prob, 4)}</b>
          </span>
        )}
      </div>
      <div className="sim-lienzo sim-plot">
        <GraficoPlot
          etiqueta={etiquetaGrafico} deps={deps} testid="sd-grafico"
          opciones={(ancho, c) => opcionesGrafico(dist, par, intervalo, aproximacionNormal, ancho, c)}
        />
      </div>
      <Leyenda items={leyenda} />
      <div className="sim-controles">
        {permitirCambiarDistribucion && (
          <Selector
            etiqueta="Distribución" clave="distribucion" valor={dist} onChange={cambiarDistribucion}
            opciones={DISTRIBUCIONES.map((d) => ({ valor: d, texto: NOMBRE_DISTRIBUCION[d] }))}
          />
        )}
        {dist === 'binomial' && (
          <>
            <Slider etiqueta="n (intentos)" clave="n" valor={par.n} min={1} max={100} paso={1} onChange={(v) => poner({ n: Math.round(v) })} />
            <Slider etiqueta="p (probabilidad de éxito)" clave="p" valor={par.p} min={0} max={1} paso={0.01} formato={(v) => num(v, 2)} onChange={(v) => poner({ p: v })} />
          </>
        )}
        {dist === 'poisson' && (
          <Slider etiqueta="λ (tasa media)" clave="lambda" valor={par.lambdaPoisson} min={0.1} max={20} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ lambdaPoisson: v })} />
        )}
        {dist === 'normal' && (
          <>
            <Slider etiqueta="μ (media)" clave="mu" valor={par.mu} min={-5} max={5} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ mu: v })} />
            <Slider etiqueta="σ (desvío)" clave="sigma" valor={par.sigma} min={0.1} max={5} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ sigma: v })} />
          </>
        )}
        {dist === 'exponencial' && (
          <Slider etiqueta="λ (tasa)" clave="lambda" valor={par.lambdaExp} min={0.1} max={20} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ lambdaExp: v })} />
        )}
        {dist === 'uniforme' && (
          <>
            <Slider etiqueta="a (mínimo)" clave="a" valor={par.a} min={-5} max={9.9} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ a: v, b: Math.max(par.b, v + 0.1) })} />
            <Slider etiqueta="b (máximo)" clave="b" valor={par.b} min={-4.9} max={10} paso={0.1} formato={(v) => num(v, 1)} onChange={(v) => poner({ b: v, a: Math.min(par.a, v - 0.1) })} />
          </>
        )}
        {mostrarIntervalo && (
          <>
            <Slider etiqueta="desde" clave="desde" valor={desde} min={rango.min} max={rango.max} paso={rango.paso} formato={nf} onChange={ponerDesde} />
            <Slider etiqueta="hasta" clave="hasta" valor={hasta} min={rango.min} max={rango.max} paso={rango.paso} formato={nf} onChange={ponerHasta} />
          </>
        )}
      </div>
      <Lecturas
        items={[
          { clave: 'media', etiqueta: 'Media', valor: num(mom.media, 2) },
          { clave: 'varianza', etiqueta: 'Varianza', valor: num(mom.varianza, 2) },
          { clave: 'desvio', etiqueta: 'Desvío', valor: num(mom.desvio, 2) },
          ...(mostrarIntervalo ? [{ clave: 'probabilidad-intervalo', etiqueta: 'P(desde ≤ X ≤ hasta)', valor: num(prob, 4), tono: 'buena' as const }] : []),
          ...(probAprox !== null ? [{ clave: 'probabilidad-aproximada', etiqueta: 'Con la normal (corregida)', valor: num(probAprox, 4) }] : []),
        ]}
      />
    </div>
  );
}

