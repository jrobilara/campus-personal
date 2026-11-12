// Isla del simulador SimSerieTemporal (SIMULADORES.md §2.10): alertas sobre métricas de 24 h y respaldos (RPO/RTO).
import * as Plot from '@observablehq/plot';
import { useMemo, useState } from 'react';
import { GraficoPlot, type ColoresTema } from '../lib/plot';
import { leerVar } from '../lib/tema';
import { Interruptor, Leyenda, Lecturas, Selector, Slider, type ItemLectura } from './ui';
import { num } from './formato';
import type { PropsSimSerieTemporal } from './props';
import {
  analizarEscenario, generarEscenario, horaHHMM, MIN_DIA, pendienteRegresion, type Escenario,
} from './serie-temporal/series';
import { calcularRespaldo, HORAS_VENTANA, type ResultadoRespaldo } from './serie-temporal/respaldo';

type Props = PropsSimSerieTemporal;
const hh = (h: number) => `${String(Math.round(h)).padStart(2, '0')}:00`;

export default function SimSerieTemporal(props: Props) {
  return props.modo === 'alertas' ? <Alertas {...props} /> : <Respaldo {...props} />;
}

// ───────────────────────── alertas ─────────────────────────

type PropsAlertas = Extract<Props, { modo: 'alertas' }>;

function Alertas({ escenario, nucleos = 4, umbral: umbralProp, duracionMin = 0, semilla = 42 }: PropsAlertas) {
  const esc = useMemo(() => generarEscenario(escenario, semilla, nucleos), [escenario, semilla, nucleos]);
  const esLoad = escenario === 'carga-sostenida';
  const esDisco = escenario === 'disco-llenandose';
  const [umbral, setUmbral] = useState(umbralProp ?? esc.umbralInicial);
  const [duracion, setDuracion] = useState(duracionMin);
  const [ventana, setVentana] = useState(1);
  const [predictiva, setPredictiva] = useState(false);
  const [serieId, setSerieId] = useState(esc.principal);

  const a = useMemo(
    () => analizarEscenario(esc, serieId, { umbral, duracionMin: duracion, ventana, predictiva: esDisco && predictiva }),
    [esc, serieId, umbral, duracion, ventana, predictiva, esDisco],
  );
  const conPredictiva = esDisco && predictiva;
  const lecturas: ItemLectura[] = [
    { clave: 'alertas', etiqueta: 'Alertas disparadas', valor: a.alertas, tono: a.alertas > 0 ? 'alerta' : undefined },
    { clave: 'minutos-en-alerta', etiqueta: 'Tiempo en alerta', valor: a.minutosEnAlerta, unidad: 'min' },
    { clave: 'primer-aviso', etiqueta: 'Primer aviso', valor: a.primerAvisoMin === null ? '—' : horaHHMM(a.primerAvisoMin), unidad: a.primerAvisoMin === null ? undefined : 'h' },
  ];
  if (esDisco) {
    lecturas.push({
      clave: 'horas-de-anticipacion', etiqueta: 'Anticipación (hasta el 100 %)',
      valor: a.anticipacionHoras === null ? '—' : num(a.anticipacionHoras, 1), unidad: a.anticipacionHoras === null ? undefined : 'h',
      tono: a.anticipacionHoras !== null && a.anticipacionHoras >= 3 ? 'buena' : undefined,
    });
  }

  const unidad = esc.unidad;
  const umbralMax = unidad === '%' ? 100 : esc.ymax;
  const resumen =
    a.alertas === 0
      ? 'Con estos ajustes la alerta no se dispara nunca.'
      : `Primer aviso a las ${horaHHMM(a.primerAvisoMin!)}; ${a.alertas === 1 ? '1 alerta' : `${a.alertas} alertas`} y ${a.minutosEnAlerta} minutos en alerta.`;

  return (
    <div className="sim-cuerpo">
      <div className="sim-lienzo sim-plot">
        <GraficoPlot
          etiqueta={`${esc.metrica} durante 24 horas con el umbral en ${num(umbral, unidad === '%' ? 0 : 1)}. ${resumen}`}
          deps={[esc, a, umbral, nucleos, esLoad, serieId, ventana, conPredictiva]}
          opciones={(ancho, c) => opcionesAlertas({ ancho, c, esc, a, umbral, nucleos, esLoad, serieId, ventana, conPredictiva })}
          testid="grafico-alertas"
        />
        <Leyenda items={[
          ...(esLoad
            ? esc.series.map((x) => ({
                color: x.id === serieId ? 'var(--color-area)' : 'var(--suave)',
                texto: x.id === serieId ? `${x.etiqueta} (vigilado)` : x.etiqueta,
                trazo: x.id === 'load1' ? ('puntos' as const) : x.id === 'load15' ? ('guiones' as const) : ('continuo' as const),
              }))
            : [{ color: 'var(--color-area)', texto: esc.metrica }]),
          { color: 'color-mix(in srgb, var(--mal) 28%, transparent)', texto: 'Alerta disparada' },
          { color: 'var(--mal)', texto: 'Umbral' },
          ...(esLoad ? [{ color: 'var(--suave)', texto: `Núcleos (${nucleos})` }] : []),
          ...(conPredictiva ? [{ color: 'var(--aviso)', texto: 'Proyección a 100 %' }] : []),
        ]} />
        <p className="sim-nota" data-testid="resumen-alertas">{resumen}</p>
      </div>
      <div className="sim-controles sst-controles">
        <Slider clave="umbral" etiqueta={`Umbral (${esLoad ? 'load' : unidad})`} valor={umbral} min={0} max={umbralMax} paso={unidad === '%' ? 1 : 0.5}
          formato={(v) => num(v, unidad === '%' ? 0 : 1)} onChange={setUmbral} deshabilitado={conPredictiva} />
        <Slider clave="duracion" etiqueta="Duración sostenida (for:)" valor={duracion} min={0} max={30} paso={1} formato={(v) => `${v} min`} onChange={setDuracion} />
        <Slider clave="ventana" etiqueta="Ventana de promedio" valor={ventana} min={1} max={15} paso={1} formato={(v) => `${v} min`} onChange={setVentana} />
        {esLoad && (
          <Selector clave="metrica" etiqueta="Promedio que vigila la alerta" valor={serieId} onChange={setSerieId}
            opciones={esc.series.map((s) => ({ valor: s.id, texto: s.etiqueta }))} />
        )}
        {esDisco && (
          <Interruptor clave="predictiva" etiqueta="Alerta predictiva (avisa si se llena en menos de 4 h)" activo={predictiva} onChange={setPredictiva} />
        )}
      </div>
      <Lecturas items={lecturas} />
    </div>
  );
}

function opcionesAlertas({ ancho, c, esc, a, umbral, nucleos, esLoad, serieId, ventana, conPredictiva }: {
  ancho: number; c: ColoresTema; esc: Escenario; a: ReturnType<typeof analizarEscenario>; umbral: number;
  nucleos: number; esLoad: boolean; serieId: string; ventana: number; conPredictiva: boolean;
}): Plot.PlotOptions {
  const angosto = ancho < 480;
  const ymax = esc.ymax;
  // franjas donde la alerta está disparada (tramos consecutivos de enAlerta)
  const franjas: { x1: number; x2: number }[] = [];
  for (let m = 0; m < MIN_DIA; m++) {
    if (!a.enAlerta[m]) continue;
    let f = m;
    while (f + 1 < MIN_DIA && a.enAlerta[f + 1]) f++;
    franjas.push({ x1: m / 60, x2: (f + 1) / 60 });
    m = f;
  }
  const puntos = (v: readonly number[]) => v.map((y, m) => ({ x: m / 60, y }));
  const marks: Plot.Markish[] = [
    Plot.rect(franjas, { x1: 'x1', x2: 'x2', y1: 0, y2: ymax, fill: c.mal, fillOpacity: 0.16 }),
    Plot.ruleY([0]),
  ];
  if (esLoad) {
    for (const s of esc.series) {
      const sel = s.id === serieId;
      marks.push(Plot.line(puntos(s.valores), {
        x: 'x', y: 'y', stroke: sel ? c.area : c.suave, strokeWidth: sel ? (ventana > 1 ? 1 : 2.2) : 1.1,
        strokeDasharray: s.id === 'load1' ? '2 2' : s.id === 'load15' ? '7 3' : undefined, strokeOpacity: sel ? (ventana > 1 ? 0.4 : 1) : 0.75,
      }));
    }
    marks.push(Plot.ruleY([nucleos], { stroke: c.suave, strokeDasharray: '3 3' }));
    marks.push(Plot.text([{ x: 24, y: nucleos }], { x: 'x', y: 'y', text: () => `${nucleos} núcleos`, textAnchor: 'end', dy: 11, fill: c.suave, fontSize: 11 }));
  } else {
    marks.push(Plot.line(puntos(a.cruda), { x: 'x', y: 'y', stroke: c.area, strokeWidth: ventana > 1 ? 1 : 2, strokeOpacity: ventana > 1 ? 0.4 : 1 }));
  }
  if (ventana > 1) marks.push(Plot.line(puntos(a.evaluada), { x: 'x', y: 'y', stroke: c.tinta, strokeWidth: 2.2 }));
  if (!conPredictiva) {
    marks.push(Plot.ruleY([umbral], { stroke: c.mal, strokeWidth: 1.6, strokeDasharray: '6 4' }));
    marks.push(Plot.text([{ x: 0, y: umbral }], { x: 'x', y: 'y', text: () => `umbral ${num(umbral, esc.unidad === '%' ? 0 : 1)}`, textAnchor: 'start', dy: -7, dx: 4, fill: c.mal, fontSize: 11, fontWeight: 600 }));
  }
  for (const m of esc.marcas) {
    marks.push(Plot.ruleX([m.minuto / 60], { stroke: c.linea, strokeDasharray: '2 3' }));
    marks.push(Plot.text([{ x: m.minuto / 60, y: ymax }], { x: 'x', y: 'y', text: () => m.texto, textAnchor: 'end', dx: -4, dy: 10, fill: c.suave, fontSize: 11 }));
  }
  // marcadores de aviso y, con alerta predictiva, la recta proyectada hasta el 100 %
  const avisos = a.episodios.filter((e) => e.disparo !== null).map((e) => ({ x: e.disparo! / 60, y: a.evaluada[e.disparo!]! }));
  if (conPredictiva && a.primerAvisoMin !== null) {
    const m0 = a.primerAvisoMin;
    const pend = m0 >= 59 ? pendienteRegresion(a.evaluada, m0) : 0;
    if (pend > 0) {
      const mFin = m0 + (100 - a.evaluada[m0]!) / pend;
      marks.push(Plot.line([{ x: m0 / 60, y: a.evaluada[m0]! }, { x: mFin / 60, y: 100 }], { x: 'x', y: 'y', stroke: c.mal, strokeWidth: 1.8, strokeDasharray: '5 4' }));
    }
  }
  marks.push(Plot.dot(avisos, { x: 'x', y: 'y', r: 5, fill: c.mal, stroke: c.superficie, strokeWidth: 2 }));
  return {
    width: ancho, height: angosto ? 250 : 310, marginLeft: esc.unidad === '%' ? 48 : 38, marginRight: 22, marginTop: 14, marginBottom: 32, // marginRight 22: '24:00' del borde derecho necesita ~16 px; marginLeft 48 con '%': '100 %' no entra en 38
    x: { domain: [0, 24], ticks: angosto ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24], tickFormat: hh, label: null },
    y: { domain: [0, ymax], grid: true, label: null, tickFormat: esc.unidad === '%' ? (d: number) => `${d} %` : (d: number) => String(d) },
    marks,
  };
}

// ───────────────────────── respaldo ─────────────────────────

type PropsRespaldo = Extract<Props, { modo: 'respaldo' }>;

function Respaldo({
  frecuenciaHoras = 24, rpoObjetivoHoras = 4, rtoObjetivoHoras = 2, duracionRestauracionHoras = 3, respaldoProbado = true,
}: PropsRespaldo) {
  const [frecuencia, setFrecuencia] = useState(frecuenciaHoras);
  const [incidente, setIncidente] = useState(47);
  const [duracion, setDuracion] = useState(duracionRestauracionHoras);
  const [probado, setProbado] = useState(respaldoProbado);

  const r = useMemo(
    () => calcularRespaldo({
      frecuenciaHoras: frecuencia, incidenteHoras: incidente, duracionRestauracionHoras: duracion,
      respaldoProbado: probado, rpoObjetivoHoras, rtoObjetivoHoras,
    }),
    [frecuencia, incidente, duracion, probado, rpoObjetivoHoras, rtoObjetivoHoras],
  );
  const lecturas: ItemLectura[] = [
    { clave: 'rpo-real-horas', etiqueta: `RPO real (objetivo ${num(rpoObjetivoHoras, 1)} h)`, valor: num(r.rpoRealHoras, 1), unidad: 'h' },
    { clave: 'rto-real-horas', etiqueta: `RTO real (objetivo ${num(rtoObjetivoHoras, 1)} h)`, valor: num(r.rtoRealHoras, 1), unidad: 'h' },
    { clave: 'cumple-rpo', etiqueta: 'Cumple el RPO', valor: r.cumpleRpo ? 'sí' : 'no', tono: r.cumpleRpo ? 'buena' : 'alerta' },
    { clave: 'cumple-rto', etiqueta: 'Cumple el RTO', valor: r.cumpleRto ? 'sí' : 'no', tono: r.cumpleRto ? 'buena' : 'alerta' },
  ];
  const resumen = textoRespaldo(r, incidente);

  return (
    <div className="sim-cuerpo">
      <div className="sim-lienzo sim-plot">
        <GraficoPlot
          etiqueta={`Datos acumulados durante 72 horas con respaldos cada ${frecuencia} horas. ${resumen}`}
          deps={[r, incidente]}
          opciones={(ancho, c) => opcionesRespaldo(ancho, c, r, incidente)}
          testid="grafico-respaldo"
        />
        <Leyenda items={[
          { color: 'var(--color-area)', texto: 'Datos acumulados' },
          { color: 'var(--linea-fuerte)', texto: 'Respaldo' },
          { color: 'color-mix(in srgb, var(--mal) 35%, transparent)', texto: 'Datos perdidos (RPO)' },
          ...(r.corrupto !== null ? [{ color: 'color-mix(in srgb, var(--mal) 45%, transparent)', texto: 'Intento fallido (respaldo corrupto)' }] : []),
          { color: 'color-mix(in srgb, var(--aviso) 50%, transparent)', texto: r.corrupto !== null ? 'Restauración del anterior' : 'Restauración (sistema caído)' },
        ]} />
        <p className="sim-nota sst-nota" data-testid="resumen-respaldo">{resumen}</p>
        {r.corrupto !== null && (
          <p className="sim-nota sst-nota" data-testid="nota-rto">
            <b>Por qué el RTO suma dos tramos:</b> con el respaldo sin probar, primero se intenta restaurar el último
            ({num(r.intentoFallidoHoras, 1)} h) y falla porque está corrupto.
            {r.restaurado !== null
              ? ` Recién ahí se restaura el anterior (otras ${num(r.restauracionHoras, 1)} h): el sistema está caído ${num(r.rtoRealHoras, 1)} h en total.`
              : ' Como no hay uno anterior, no queda nada para restaurar.'}
          </p>
        )}
      </div>
      <div className="sim-controles sst-controles">
        <Slider clave="frecuencia" etiqueta="Un respaldo cada" valor={frecuencia} min={1} max={48} paso={1} formato={(v) => `${v} h`} onChange={setFrecuencia} />
        <Slider clave="incidente" etiqueta="Momento del incidente" valor={incidente} min={0} max={HORAS_VENTANA} paso={0.5} formato={(v) => `hora ${num(v, 1)}`} onChange={setIncidente} />
        <Slider clave="restauracion" etiqueta="Duración de la restauración" valor={duracion} min={0.5} max={12} paso={0.5} formato={(v) => `${num(v, 1)} h`} onChange={setDuracion} />
        <Interruptor clave="probado" etiqueta="El respaldo fue probado (restauración de ensayo)" activo={probado} onChange={setProbado} />
      </div>
      <Lecturas items={lecturas} />
    </div>
  );
}

function textoRespaldo(r: ResultadoRespaldo, incidente: number): string {
  const perdidos = `Perdés ${num(r.rpoRealHoras, 1)} h de datos`;
  if (r.corrupto !== null && r.restaurado === null) {
    return `El único respaldo (hora ${num(r.corrupto, 0)}) está corrupto y no hay uno anterior: se pierde todo lo acumulado (${num(r.rpoRealHoras, 1)} h) y el intento de restaurar te deja ${num(r.rtoRealHoras, 1)} h caído.`;
  }
  if (r.corrupto !== null) {
    return `El último respaldo (hora ${num(r.corrupto, 0)}) está corrupto: el intento falla (${num(r.intentoFallidoHoras, 1)} h) y se restaura el anterior (hora ${num(r.restaurado!, 0)}, otras ${num(r.restauracionHoras, 1)} h). ${perdidos} y quedás ${num(r.rtoRealHoras, 1)} h caído.`;
  }
  return `Se restaura el respaldo de la hora ${num(r.restaurado!, 1)}, ${num(incidente - r.restaurado!, 1)} h antes del incidente. ${perdidos} y quedás ${num(r.rtoRealHoras, 1)} h caído.`;
}

function opcionesRespaldo(ancho: number, c: ColoresTema, r: ResultadoRespaldo, incidente: number): Plot.PlotOptions {
  const angosto = ancho < 480;
  const fin = Math.min(HORAS_VENTANA, r.finRestauracion);
  // datos: crecen hasta el incidente; tras la restauración arrancan desde el respaldo restaurado
  const base = r.restaurado ?? 0;
  const antes = [{ x: 0, y: 0 }, { x: incidente, y: incidente }];
  const despues = r.finRestauracion < HORAS_VENTANA
    ? [{ x: r.finRestauracion, y: base }, { x: HORAS_VENTANA, y: base + (HORAS_VENTANA - r.finRestauracion) }]
    : [];
  const ymax = HORAS_VENTANA;
  const marks: Plot.Markish[] = [
    Plot.areaY(antes, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.22 }),
    Plot.lineY(antes, { x: 'x', y: 'y', stroke: c.area, strokeWidth: 2 }),
  ];
  if (despues.length) {
    marks.push(Plot.areaY(despues, { x: 'x', y: 'y', fill: c.area, fillOpacity: 0.12 }));
    marks.push(Plot.lineY(despues, { x: 'x', y: 'y', stroke: c.area, strokeWidth: 2, strokeDasharray: '4 3' }));
  }
  // datos perdidos: entre el respaldo restaurado y el incidente
  if (incidente - base > 0) {
    marks.push(Plot.rect([{ x1: base, x2: incidente }], { x1: 'x1', x2: 'x2', y1: 0, y2: ymax, fill: c.mal, fillOpacity: 0.16 }));
  }
  // caída: intento fallido sobre el respaldo corrupto (si hay) y después la restauración buena
  const aviso = leerVar('--aviso') || c.suave;
  const finFallido = Math.min(HORAS_VENTANA, r.inicioRestauracion);
  const tramos: { x1: number; x2: number; texto: string; color: string }[] = [];
  if (r.intentoFallidoHoras > 0) tramos.push({ x1: incidente, x2: finFallido, texto: 'intento fallido', color: c.mal });
  if (r.restauracionHoras > 0) tramos.push({ x1: finFallido, x2: fin, texto: r.corrupto !== null ? 'restauración del anterior' : 'restauración', color: aviso });
  const visibles = tramos.filter((t) => t.x2 - t.x1 > 0.05);
  marks.push(Plot.rect(visibles, { x1: 'x1', x2: 'x2', y1: 0, y2: ymax, fill: 'color', fillOpacity: 0.3 }));
  marks.push(Plot.ruleX(visibles.slice(1), { x: 'x1', stroke: c.tinta, strokeWidth: 1, strokeDasharray: '2 2' }));
  // rótulos girados dentro de cada franja (la franja es angosta: 3 h de 72 son unos 15 px)
  marks.push(Plot.text(visibles, {
    x: (t: { x1: number; x2: number }) => (t.x1 + t.x2) / 2, y: ymax * 0.5, text: 'texto', rotate: -90, fill: c.tinta, fontSize: 10.5, fontWeight: 700,
    stroke: c.superficie, strokeWidth: 3, textAnchor: 'middle',
  }));
  // marcas de cada respaldo
  const buenos = r.respaldos.filter((t) => t !== r.corrupto && t !== r.restaurado);
  marks.push(Plot.ruleX(buenos, { stroke: c.linea, strokeWidth: 1 }));
  marks.push(Plot.ruleX(r.respaldos.filter((t) => t === r.restaurado), { stroke: c.ok, strokeWidth: 2.4 }));
  if (r.corrupto !== null) {
    marks.push(Plot.ruleX([r.corrupto], { stroke: c.mal, strokeWidth: 2, strokeDasharray: '3 3' }));
    marks.push(Plot.text([{ x: r.corrupto, y: ymax * 0.93 }], { x: 'x', y: 'y', text: () => 'corrupto', fill: c.mal, fontSize: 11, fontWeight: 700, textAnchor: 'end', dx: -4 }));
    marks.push(Plot.dot([{ x: r.corrupto, y: r.corrupto }], { x: 'x', y: 'y', symbol: 'times', r: 7, stroke: c.mal, strokeWidth: 2.4 }));
  }
  marks.push(Plot.ruleX([incidente], { stroke: c.mal, strokeWidth: 2.4 }));
  marks.push(Plot.text([{ x: incidente, y: ymax }], { x: 'x', y: 'y', text: () => 'incidente', fill: c.mal, fontSize: 11, fontWeight: 700, textAnchor: incidente > 56 ? 'end' : 'start', dx: incidente > 56 ? -5 : 5, dy: 10 }));
  if (r.restaurado !== null) {
    marks.push(Plot.text([{ x: r.restaurado, y: 2 }], { x: 'x', y: 'y', text: () => 'restaurado', fill: c.ok, fontSize: 11, fontWeight: 700, textAnchor: r.restaurado > 56 ? 'end' : 'start', dx: r.restaurado > 56 ? -4 : 4, dy: -4 }));
  }
  marks.push(Plot.ruleY([0]));
  return {
    width: ancho, height: angosto ? 250 : 300, marginLeft: 38, marginRight: 14, marginTop: 14, marginBottom: 32,
    x: { domain: [0, HORAS_VENTANA], ticks: angosto ? [0, 24, 48, 72] : [0, 12, 24, 36, 48, 60, 72], tickFormat: (d: number) => `${d} h`, label: null },
    y: { domain: [0, ymax], grid: true, ticks: 4, tickFormat: () => '', label: 'datos acumulados →' },
    marks,
  };
}
