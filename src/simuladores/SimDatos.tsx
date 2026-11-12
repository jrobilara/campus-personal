// SimDatos (SIMULADORES.md §2.6): un dataset, varias vistas, limpieza y regresión (Observable Plot vía GraficoPlot).
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Boton, Botones, Interruptor, Lecturas, Selector, Slider, type ItemLectura } from './ui';
import { num } from './formato';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimDatos } from './props';
import { CUARTETOS, generarDataset, type Cuarteto } from './presets/datasets';
import { SIN_LIMPIEZA, aplicarLimpieza, escalaPrincipal, hayRegresion, lecturasDe, type Limpieza, type Vista } from './datos/derivar';
import {
  NotaFuera, VistaBarras, VistaCaja, VistaDispersion, VistaHistograma, VistaLineas, VistaTabla, VistaTorta, etiquetaColumna,
} from './datos/vistas';

const NOMBRE_VISTA: Record<Vista, string> = {
  tabla: 'Tabla', histograma: 'Histograma', caja: 'Caja', barras: 'Barras', lineas: 'Líneas', dispersion: 'Dispersión', torta: 'Torta',
};
const NOTA_TEXTO = { bien: 'Bien', regular: 'Regular', mal: 'Mal' } as const;
const FRANJA_CLAVE = ['frio', 'templado', 'calor'] as const;

export default function SimDatos(props: PropsSimDatos) {
  const { dataset, vistas, semilla = 42, veredictos } = props;
  const [vista, setVista] = useState<Vista>(props.vistaInicial ?? vistas[0]!);
  const [bins, setBins] = useState(20);
  const [lim, setLim] = useState<Limpieza>(SIN_LIMPIEZA);
  const [extremos, setExtremos] = useState(false);
  const [outlier, setOutlier] = useState(false);
  const [cuarteto, setCuarteto] = useState<Cuarteto>('I');
  const [cuatro, setCuatro] = useState(false);
  const [colorear, setColorear] = useState(false);
  const menos = useMenosMovimiento();
  const montado = useRef(false);
  useEffect(() => { montado.current = true; }, []);

  const ds = useMemo(() => generarDataset(dataset, semilla, { extremos, outlier, cuarteto }), [dataset, semilla, extremos, outlier, cuarteto]);
  const filas = useMemo(() => (dataset === 'tickets-sucios' ? aplicarLimpieza(ds.filas, lim) : ds.filas), [ds, dataset, lim]);
  const conRegresion = hayRegresion(ds, props.regresion);
  const lec = useMemo(() => lecturasDe(ds, filas, conRegresion, colorear), [ds, filas, conRegresion, colorear]);
  const escala = useMemo(() => escalaPrincipal(ds, filas), [ds, filas]);

  const unidad = ds.columnas.find((c) => c.clave === ds.principal)?.unidad;
  const items: ItemLectura[] = [
    { clave: 'filas', etiqueta: 'Filas', valor: String(lec.filas) },
    { clave: 'media', etiqueta: 'Media', valor: num(lec.media, 2), unidad },
    { clave: 'mediana', etiqueta: 'Mediana', valor: num(lec.mediana, 2), unidad },
    { clave: 'desvio', etiqueta: 'Desvío', valor: num(lec.desvio, 2), unidad },
    { clave: 'faltantes', etiqueta: 'Faltantes', valor: String(lec.faltantes), tono: lec.faltantes > 0 ? 'alerta' : undefined },
  ];
  if (lim.marcarOutliers) items.push({ clave: 'atipicos', etiqueta: 'Atípicos (1,5·IQR)', valor: String(lec.outliers), tono: lec.outliers > 0 ? 'alerta' : undefined });
  if (lec.regresion) {
    items.push(
      { clave: 'r', etiqueta: 'Correlación r', valor: num(lec.regresion.r, 2) },
      { clave: 'r2', etiqueta: 'R²', valor: num(lec.regresion.r2, 2) },
      { clave: 'pendiente', etiqueta: 'Pendiente', valor: num(lec.regresion.pendiente, 2) },
    );
  }
  if (lec.porFranja && vista === 'dispersion') {
    lec.porFranja.forEach((m, i) => items.push({ clave: `r-${FRANJA_CLAVE[i]}`, etiqueta: `r dentro de la franja ${i + 1}`, valor: num(m.r, 2) }));
  }

  const ver = veredictos?.[vista];
  const cambiarVista = (v: Vista) => setVista(v);
  const sw = (k: keyof Limpieza) => (v: boolean) => setLim((l) => ({ ...l, [k]: v }));
  const columnaPrincipal = etiquetaColumna(ds, ds.principal);

  return (
    <div className="sim-cuerpo sd" data-dataset={dataset}>
      {vistas.length > 1 && (
        <div className="sd-vistas" role="group" aria-label="Vista del dataset">
          <Botones>
            {vistas.map((v) => (
              <Boton key={v} clave={`vista-${v}`} activo={v === vista} onClick={() => cambiarVista(v)}>{NOMBRE_VISTA[v]}</Boton>
            ))}
          </Botones>
        </div>
      )}

      <motion.div
        key={vista}
        className="sim-lienzo sim-plot sd-vista"
        data-vista={vista}
        initial={montado.current && !menos ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {vista === 'tabla' && <VistaTabla ds={ds} filas={filas} marcarOutliers={lim.marcarOutliers} cercasPrincipal={lec.cercas} corregidas={lim.corregirUnidades} />}
        {vista === 'histograma' && <VistaHistograma ds={ds} filas={filas} bins={bins} resumen={lec} escala={escala} marcar={lim.marcarOutliers} />}
        {vista === 'caja' && <VistaCaja ds={ds} filas={filas} escala={escala} marcar={lim.marcarOutliers} resumen={lec} />}
        {vista === 'barras' && <VistaBarras ds={ds} filas={filas} />}
        {vista === 'torta' && <VistaTorta ds={ds} filas={filas} />}
        {vista === 'lineas' && <VistaLineas ds={ds} filas={filas} escala={escala} />}
        {vista === 'dispersion' && (
          <VistaDispersion
            ds={ds} filas={filas}
            o={{ regresion: conRegresion, colorear, marcar: lim.marcarOutliers, resumen: lec, escala, conOutlier: outlier, cuatro }}
          />
        )}
        {vista !== 'tabla' && vista !== 'barras' && vista !== 'torta' && <NotaFuera ds={ds} escala={escala} />}
      </motion.div>

      {ver && (
        <div className={`sd-veredicto sd-v-${ver.nota}`} data-testid="sd-veredicto" role="note">
          <strong>Esta vista: <span data-lectura="veredicto">{ver.nota}</span></strong>
          <span className="sd-v-etq" aria-hidden="true">{NOTA_TEXTO[ver.nota]}</span>
          <p>{ver.porque}</p>
        </div>
      )}

      <Lecturas items={items} />

      <div className="sim-controles sd-controles">
        {vista === 'histograma' && (
          <Slider etiqueta={`Cantidad de barras (bins)`} valor={bins} min={5} max={50} paso={1} onChange={setBins} clave="bins" />
        )}
        {dataset === 'tickets-sucios' && (
          <fieldset className="sd-grupo">
            <legend>Limpieza de {columnaPrincipal.split(' (')[0]}</legend>
            <Interruptor etiqueta="Quitar duplicados" activo={lim.sinDuplicados} onChange={sw('sinDuplicados')} clave="quitar-duplicados" />
            <Interruptor etiqueta="Quitar faltantes" activo={lim.sinFaltantes} onChange={sw('sinFaltantes')} clave="quitar-faltantes" />
            <Interruptor etiqueta="Corregir unidades (horas ×60)" activo={lim.corregirUnidades} onChange={sw('corregirUnidades')} clave="corregir-unidades" />
            <Interruptor etiqueta="Marcar outliers (1,5·IQR)" activo={lim.marcarOutliers} onChange={sw('marcarOutliers')} clave="marcar-outliers" />
          </fieldset>
        )}
        {dataset === 'latencias' && <Interruptor etiqueta="Agregar valores extremos (5 de 30 000 ms)" activo={extremos} onChange={setExtremos} clave="extremos" />}
        {dataset === 'horas-y-notas' && <Interruptor etiqueta="Agregar un outlier" activo={outlier} onChange={setOutlier} clave="outlier" />}
        {dataset === 'anscombe' && (
          <>
            <Selector
              etiqueta="Cuarteto" valor={cuarteto} clave="cuarteto" onChange={setCuarteto}
              opciones={CUARTETOS.map((q) => ({ valor: q, texto: `Cuarteto ${q}` }))}
            />
            {vista === 'dispersion' && <Interruptor etiqueta="Ver los cuatro juntos" activo={cuatro} onChange={setCuatro} clave="cuatro" />}
          </>
        )}
        {dataset === 'confusora-temperatura' && vista === 'dispersion' && (
          <Interruptor etiqueta="Colorear por temperatura (3 franjas)" activo={colorear} onChange={setColorear} clave="colorear" />
        )}
      </div>
    </div>
  );
}
