// SimBayes (SIMULADORES.md §2.5): grilla de puntos + árbol de frecuencias para ver por qué un test "bueno" da muchos falsos positivos.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Boton, Lecturas, Slider } from './ui';
import { num } from './formato';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimBayes } from './props';
import {
  CONTEXTOS, ORDEN_CONDICION, ORDEN_TEST, calcularBayes, celdaPorPunto, grupoPorPunto, repartirPuntos, type Grupo,
} from './bayes/calculo';

const COLUMNAS = 50;
const FILAS = 20;
const TOTAL_PUNTOS = COLUMNAS * FILAS; // 1000
const CELDA = 10;

const aPct = (f: number) => Math.round(f * 1000) / 10;
/** Dos cifras significativas: el slider logarítmico queda en valores "redondos" (0,31 %, 1,0 %, 12 %). */
function ajustarPrevalencia(pct: number) {
  const s = Number(pct.toPrecision(2));
  return Math.min(50, Math.max(0.1, s));
}
const fmtPrev = (v: number) => `${num(v, v < 1 ? 2 : v < 10 ? 1 : 0)} %`;
const fmtPct1 = (v: number) => `${num(v, 1)} %`;

type Orden = 'condicion' | 'test';

export default function SimBayes(props: PropsSimBayes) {
  const { contexto = 'medico', poblacion = 1000 } = props;
  const et = CONTEXTOS[contexto];
  const [prev, setPrev] = useState(() => ajustarPrevalencia(aPct(props.prevalencia ?? 0.01)));
  const [sens, setSens] = useState(() => aPct(props.sensibilidad ?? 0.99));
  const [esp, setEsp] = useState(() => aPct(props.especificidad ?? 0.95));
  const [orden, setOrden] = useState<Orden>('condicion');
  const [ola, setOla] = useState(false);
  const menos = useMenosMovimiento();
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const r = useMemo(
    () => calcularBayes({ prevalencia: prev / 100, sensibilidad: sens / 100, especificidad: esp / 100, poblacion }),
    [prev, sens, esp, poblacion],
  );
  const puntos = useMemo(() => repartirPuntos(r, TOTAL_PUNTOS), [r]);
  const grupos = useMemo(() => grupoPorPunto(puntos), [puntos]);
  const celdas = useMemo(
    () => celdaPorPunto(puntos, orden === 'condicion' ? ORDEN_CONDICION : ORDEN_TEST),
    [puntos, orden],
  );

  const cambiarOrden = (o: Orden) => {
    if (o === orden) return;
    setOrden(o);
    setOla(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setOla(false), 900);
  };

  const unidad = poblacion / TOTAL_PUNTOS;
  const positivos = r.vp + r.fp;
  const nombreGrupo: Record<Grupo, string> = { vp: et.vp, fp: et.fp, fn: et.fn, vn: et.vn };
  const resumen = `Grilla de ${TOTAL_PUNTOS} puntos: ${r.vp} verdaderos positivos, ${r.fp} falsos positivos, ${r.fn} falsos negativos y ${r.vn} verdaderos negativos.`;
  const transicion = menos ? { duration: 0 } : { type: 'spring' as const, stiffness: 140, damping: 22 };
  const pctVerdaderos = r.vpp * 100;

  return (
    <div className="sim-cuerpo sb">
      <div className="sim-lienzo">
        <div className="sb-cab">
          <span className="sb-cab-t" id="sb-orden-t">Agrupar los puntos por</span>
          <div className="sim-botones" role="group" aria-labelledby="sb-orden-t">
            <Boton clave="orden-condicion" activo={orden === 'condicion'} onClick={() => cambiarOrden('condicion')}>Realidad</Boton>
            <Boton clave="orden-test" activo={orden === 'test'} onClick={() => cambiarOrden('test')}>Resultado del test</Boton>
          </div>
        </div>
        <svg viewBox={`0 0 ${COLUMNAS * CELDA} ${FILAS * CELDA}`} role="img" aria-label={resumen} className="sb-grilla">
          {grupos.map((g, i) => {
            const c = celdas[i]!;
            const x = (c % COLUMNAS) * CELDA + CELDA / 2;
            const y = Math.floor(c / COLUMNAS) * CELDA + CELDA / 2;
            return (
              <circle
                key={i} r={3.7} cx={0} cy={0} className={`sb-p sb-${g}`}
                style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: ola ? `${(c % COLUMNAS) * 9}ms` : undefined }}
              />
            );
          })}
        </svg>
        <p className="sim-nota sb-nota">
          Cada punto representa {unidad === 1 ? `1 de las ${poblacion.toLocaleString('es-AR')} ${et.sujeto}` : `${unidad} ${et.sujeto}`}
          {' '}({poblacion.toLocaleString('es-AR')} en total).
        </p>
        <ul className="sb-leyenda">
          {(['vp', 'fp', 'fn', 'vn'] as Grupo[]).map((g) => (
            <li key={g}>
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.4" className={`sb-${g}`} /></svg>
              <span>{nombreGrupo[g]}</span>
              <strong>{r[g].toLocaleString('es-AR')}</strong>
            </li>
          ))}
        </ul>
      </div>

      <Arbol r={r} poblacion={poblacion} et={et} />

      <div className="sb-positivos">
        <p className="sb-positivos-t">
          De unas <strong>{positivos.toLocaleString('es-AR')}</strong> {et.sujeto} que {et.positivo}, unas <strong>{r.vp.toLocaleString('es-AR')}</strong> son
          positivos verdaderos ({num(pctVerdaderos, 1)} %).
        </p>
        <div className="sb-barra" role="img" aria-label={`${num(pctVerdaderos, 1)} % de los positivos son verdaderos`}>
          <motion.div className="sb-barra-vp" initial={false} animate={{ width: `${pctVerdaderos}%` }} transition={transicion} />
          <motion.div className="sb-barra-fp" initial={false} animate={{ width: `${100 - pctVerdaderos}%` }} transition={transicion} />
        </div>
        <div className="sb-barra-pie">
          <span><i className="sb-vp" />Positivos verdaderos</span>
          <span>Falsos positivos<i className="sb-fp" /></span>
        </div>
      </div>

      <div className="sim-controles">
        <Slider clave="prevalencia" etiqueta={et.prevalencia} valor={prev} min={0.1} max={50} log formato={fmtPrev}
          onChange={(v) => setPrev(ajustarPrevalencia(v))} />
        <Slider clave="sensibilidad" etiqueta={et.sensibilidad} valor={sens} min={50} max={99.9} paso={0.1} formato={fmtPct1} onChange={setSens} />
        <Slider clave="especificidad" etiqueta={et.especificidad} valor={esp} min={50} max={99.9} paso={0.1} formato={fmtPct1} onChange={setEsp} />
      </div>

      <Lecturas items={[
        { clave: 'vp', etiqueta: 'Verdaderos positivos', valor: r.vp },
        { clave: 'fp', etiqueta: 'Falsos positivos', valor: r.fp },
        { clave: 'fn', etiqueta: 'Falsos negativos', valor: r.fn },
        { clave: 'vn', etiqueta: 'Verdaderos negativos', valor: r.vn },
        { clave: 'vpp', etiqueta: 'Valor predictivo positivo', valor: num(r.vpp * 100, 1), unidad: '%', tono: r.vpp < 0.5 ? 'alerta' : 'buena' },
        { clave: 'vpn', etiqueta: 'Valor predictivo negativo', valor: num(r.vpn * 100, 1), unidad: '%' },
      ]} />
    </div>
  );
}

function Arbol({ r, poblacion, et }: { r: ReturnType<typeof calcularBayes>; poblacion: number; et: (typeof CONTEXTOS)['medico'] }) {
  const f = (n: number) => n.toLocaleString('es-AR');
  const hoja = (cx: number, g: Grupo, texto: string) => (
    <g key={g} transform={`translate(${cx - 37} 124)`} className={`sb-hoja sb-hoja-${g}`}>
      <rect width="74" height="46" rx="8" />
      <text x="37" y="20" textAnchor="middle" className="sb-n">{f(r[g])}</text>
      <text x="37" y="36" textAnchor="middle" className="sb-t">{texto}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 320 174" className="sb-arbol" role="img"
      aria-label={`Árbol: de ${f(poblacion)} ${et.sujeto}, ${f(r.enfermos)} ${et.condicion} (${f(r.vp)} positivos y ${f(r.fn)} negativos) y ${f(r.sanos)} ${et.sinCondicion} (${f(r.fp)} positivos y ${f(r.vn)} negativos).`}>
      <g className="sb-lineas" fill="none">
        <path d="M160 40 V50 H80 V60 M160 50 H240 V60" />
        <path d="M80 106 V115 H41 V124 M80 115 H119 V124" />
        <path d="M240 106 V115 H201 V124 M240 115 H279 V124" />
      </g>
      <g transform="translate(95 2)" className="sb-raiz">
        <rect width="130" height="38" rx="8" />
        <text x="65" y="17" textAnchor="middle" className="sb-n">{f(poblacion)}</text>
        <text x="65" y="31" textAnchor="middle" className="sb-t">{et.sujeto}</text>
      </g>
      <g transform="translate(10 60)" className="sb-medio sb-medio-e">
        <rect width="140" height="46" rx="8" />
        <text x="70" y="20" textAnchor="middle" className="sb-n">{f(r.enfermos)}</text>
        <text x="70" y="36" textAnchor="middle" className="sb-t">{et.condicion}</text>
      </g>
      <g transform="translate(170 60)" className="sb-medio sb-medio-s">
        <rect width="140" height="46" rx="8" />
        <text x="70" y="20" textAnchor="middle" className="sb-n">{f(r.sanos)}</text>
        <text x="70" y="36" textAnchor="middle" className="sb-t">{et.sinCondicion}</text>
      </g>
      {hoja(41, 'vp', 'VP · positivo')}
      {hoja(119, 'fn', 'FN · negativo')}
      {hoja(201, 'fp', 'FP · positivo')}
      {hoja(279, 'vn', 'VN · negativo')}
    </svg>
  );
}
