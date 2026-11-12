// SimTablaSQL (SIMULADORES.md §2.7): GROUP BY y funciones de ventana sobre una tabla chica, con el SQL en vivo y una animación (motion).
// La lógica vive en sql/motor.ts (pura); acá solo se dibuja y se anima.
import { Fragment, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Boton, Botones, Lecturas, Selector, Slider } from './ui';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimTablaSQL } from './props';
import { TABLAS_SQL, type Celda, type FilaSQL } from './presets/tablas-sql';
import {
  AGREGADAS, VENTANAS, alias, configDesdeProps, consultaSQL, ejecutarGroupBy, ejecutarVentana, filaInicial, formatoCelda, ordenDeSalida,
  type Config, type Funcion,
} from './sql/motor';

const NOMBRE_FUNCION: Record<Funcion, string> = {
  count: 'COUNT(*)', sum: 'SUM', avg: 'AVG', max: 'MAX',
  row_number: 'ROW_NUMBER', rank: 'RANK', lag: 'LAG', 'suma-acumulada': 'SUM acumulada', 'promedio-movil': 'AVG móvil',
};
const PALABRAS = new Set([
  'SELECT', 'FROM', 'GROUP', 'ORDER', 'BY', 'PARTITION', 'OVER', 'ROWS', 'BETWEEN', 'AND', 'PRECEDING', 'UNBOUNDED', 'CURRENT', 'ROW',
  'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DESC', 'ASC',
]);
const FUNCIONES = new Set(['COUNT', 'SUM', 'AVG', 'MAX', 'ROW_NUMBER', 'RANK', 'LAG']);

/** Pinta las palabras clave del SQL sin cambiar el texto (la lectura `sql` sigue siendo la consulta tal cual). */
function SqlResaltado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/([A-Za-z_]+)/).map((t, i) =>
        PALABRAS.has(t) ? <span key={i} className="sq-kw">{t}</span> : FUNCIONES.has(t) ? <span key={i} className="sq-fn">{t}</span> : <Fragment key={i}>{t}</Fragment>,
      )}
    </>
  );
}

const colorDe = (n: number): CSSProperties => ({ '--sq-col': `var(--sq-c${n % 6})` }) as CSSProperties;
const esNumero = (c: Celda | null | undefined) => typeof c === 'number';
const sigla = (n: number) => `${n}.º`;

/** Qué hace el cálculo de la fila activa, en una frase. */
function explicarVentana(cfg: Config, valor: Celda | null, pos: number, tamanio: number, nMarco: number, medida: string, parte: string): string {
  const desc = cfg.sentido === 'DESC' ? ' (de mayor a menor)' : '';
  switch (cfg.funcion) {
    case 'row_number':
      return `ROW_NUMBER() numera las filas ${parte} siguiendo ${cfg.orden}${desc}. Esta es la ${sigla(pos + 1)} de ${tamanio}; cuando empieza otra partición, la cuenta vuelve a 1.`;
    case 'rank':
      return `RANK() da la posición según ${cfg.orden}${desc}: esta fila queda ${sigla(Number(valor))}. Si dos filas empatan, comparten posición y la siguiente se saltea.`;
    case 'lag':
      return valor === null
        ? `LAG() trae el valor de ${medida} de la fila anterior ${parte}. Esta es la primera, no tiene anterior y da NULL.`
        : `LAG() trae el valor de ${medida} de la fila anterior ${parte} (la marcada): ${formatoCelda(valor)}.`;
    case 'suma-acumulada':
      return `Suma ${medida} desde la primera fila ${parte} hasta esta (${nMarco} marcadas): ${formatoCelda(valor)}.`;
    default:
      return `Promedia ${medida} de esta fila y las ${cfg.marco} anteriores ${parte} (${nMarco} marcadas): ${formatoCelda(valor)}.${nMarco < cfg.marco + 1 ? ' Al arrancar la partición hay menos filas, así que promedia las que haya.' : ''}`;
  }
}

export default function SimTablaSQL(props: PropsSimTablaSQL) {
  const { tabla, operacion, editable } = props;
  const tb = TABLAS_SQL[tabla];
  const esGrupo = operacion === 'group-by';
  const menos = useMenosMovimiento();

  const [funcion, setFuncion] = useState<Funcion>(props.funcion ?? (esGrupo ? 'sum' : 'row_number'));
  const [particion, setParticion] = useState<string>(props.particionarPor ?? (esGrupo ? tb.grupo : ''));
  const [orden, setOrden] = useState<string | undefined>(props.ordenarPor);
  const [marco, setMarco] = useState(props.marco ?? 2);
  const [sel, setSel] = useState<number | null>(null);
  // Animación: null = reposo. group-by: 1 agrupar, 2 colapsar, 3 listo. ventana: índice (en el orden del resultado) de la fila que se calcula.
  const [paso, setPaso] = useState<number | null>(null);

  const cfg = useMemo(
    () => configDesdeProps({ tabla, operacion, funcion, particionarPor: particion, ordenarPor: orden, marco }),
    [tabla, operacion, funcion, particion, orden, marco],
  );
  const claveCfg = JSON.stringify(cfg);
  useEffect(() => { setPaso(null); setSel(null); }, [claveCfg]);

  const grupo = useMemo(() => (esGrupo ? ejecutarGroupBy(cfg) : null), [esGrupo, cfg]);
  const ventana = useMemo(() => (esGrupo ? null : ejecutarVentana(cfg)), [esGrupo, cfg]);
  const salida = useMemo(() => (ventana ? ordenDeSalida(ventana.filas) : []), [ventana]);
  const sql = useMemo(() => consultaSQL(cfg), [cfg]);
  const nombreNueva = alias(tabla, cfg.funcion);
  const nEntrada = tb.filas.length;
  const nSalida = grupo ? grupo.grupos.length : nEntrada;

  // ---- animación por pasos con temporizadores (nada de 50 ms: son etapas de explicación)
  const corriendo = paso !== null && (esGrupo ? paso < 3 : true);
  useEffect(() => {
    if (paso === null) return;
    if (esGrupo) {
      if (paso >= 3) return;
      const t = setTimeout(() => setPaso(paso + 1), paso === 1 ? 1200 : 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPaso(paso + 1 < salida.length ? paso + 1 : null), 650);
    return () => clearTimeout(t);
  }, [paso, esGrupo, salida.length]);

  const animar = () => setPaso(esGrupo ? 1 : 0);
  const detener = () => setPaso(esGrupo ? 3 : null);

  // ---- qué se ve en cada tabla
  const activa = ventana ? (paso !== null ? salida[paso]! : (sel ?? filaInicial(cfg, ventana.filas))) : -1;
  const filaActiva = ventana && activa >= 0 ? ventana.filas[activa]! : null;
  const enMarco = new Set(filaActiva?.marco ?? []);
  const nGrupos = grupo?.grupos.length ?? ventana?.particiones.length ?? 0;
  const colorFila = (i: number): number | null => {
    if (grupo) return grupo.grupos.findIndex((g) => g.filas.includes(i));
    if (ventana && nGrupos > 1) return ventana.filas[i]!.particion;
    return null;
  };
  const ordenEntrada = useMemo(() => {
    const idx = tb.filas.map((_, i) => i);
    if (!grupo || paso === null) return idx;
    const g = (i: number) => grupo.grupos.findIndex((x) => x.filas.includes(i));
    return idx.sort((a, b) => g(a) - g(b) || a - b);
  }, [tb, grupo, paso]);
  const primeras = new Set(grupo?.grupos.map((g) => g.filas[0]!) ?? []);
  const colapsado = esGrupo && paso !== null && paso >= 2;
  const filasEntradaVisibles = colapsado ? ordenEntrada.filter((i) => primeras.has(i)) : ordenEntrada;
  const salidaVisible = !esGrupo || paso === null || paso >= 3;

  const tr = menos ? { duration: 0 } : { duration: 0.45, ease: [0.22, 0.8, 0.25, 1] as const };
  const partes = cfg.particion && filaActiva ? `de su partición (${cfg.particion} = ${tb.filas[activa]![cfg.particion]})` : 'de la tabla (sin partición)';
  const medida = tb.medida ?? (cfg.funcion === 'lag' || cfg.funcion === 'max' ? 'fecha_hora' : 'los intentos fallidos');

  let explicacion = '';
  if (grupo) {
    const mayor = Math.max(...grupo.grupos.map((g) => g.filas.length));
    explicacion = `Las ${nEntrada} filas se juntan por ${cfg.particion}: queda una fila por cada valor distinto (${grupo.grupos.length}), con ${NOMBRE_FUNCION[cfg.funcion]} calculado sobre las filas de ese grupo. El más grande junta ${mayor}.`;
  } else if (ventana && filaActiva) {
    const tam = ventana.filas.filter((f) => f.particion === filaActiva.particion).length;
    explicacion = explicarVentana(cfg, filaActiva.valor, filaActiva.pos, tam, filaActiva.marco.length, medida, partes);
  }

  // ---- opciones de los controles
  const columnasTexto = tb.columnas.filter((c) => c.tipo === 'texto').map((c) => c.clave);
  const opcionesFuncion = (esGrupo ? AGREGADAS : VENTANAS).map((f) => ({ valor: f as Funcion, texto: NOMBRE_FUNCION[f] }));
  const opcionesParticion = [...(esGrupo ? [] : [{ valor: '', texto: '(sin partición)' }]), ...columnasTexto.map((c) => ({ valor: c, texto: c }))];
  const opcionesOrden = tb.columnas.map((c) => ({ valor: c.clave, texto: c.clave }));
  const ver = (c: Celda | null | undefined) => (c === undefined ? '' : formatoCelda(c as Celda | null));

  return (
    <div className="sim-cuerpo sq" data-operacion={operacion} data-fase={paso === null ? 'reposo' : corriendo ? 'animando' : 'listo'}>
      <div className="sq-sql-caja" aria-live="polite">
        <motion.pre
          key={sql} className="sq-sql" tabIndex={0} aria-label="Consulta SQL generada"
          initial={menos ? false : { opacity: 0.35 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        >
          <code data-lectura="sql"><SqlResaltado texto={sql} /></code>
        </motion.pre>
      </div>

      <div className="sq-tablas">
        <section className="sq-bloque" aria-label={`Tabla de entrada: ${tabla}`}>
          <p className="sq-titulo-tabla">Entrada: <code>{tabla}</code> <span>({nEntrada} filas)</span></p>
          <div className="sim-tabla sq-tabla">
            <table data-testid="sq-entrada">
              <thead>
                <tr>
                  <th className="sq-marca" scope="col"><span className="sq-solo-lector">{esGrupo ? 'Filas juntadas' : 'Marco del cálculo'}</span></th>
                  {tb.columnas.map((c) => (
                    <th key={c.clave} scope="col" className={c.clave === cfg.particion ? 'sq-clave' : c.clave === cfg.orden && !esGrupo ? 'sq-clave-orden' : undefined}>{c.clave}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filasEntradaVisibles.map((i) => {
                    const f: FilaSQL = tb.filas[i]!;
                    const c = colorFila(i);
                    const marcada = !esGrupo && enMarco.has(i);
                    const esActual = !esGrupo && i === activa;
                    const nj = grupo?.grupos.find((g) => g.filas.includes(i))?.filas.length ?? 0;
                    return (
                      <motion.tr
                        key={i} layout={menos ? false : 'position'} transition={tr}
                        exit={menos ? undefined : { opacity: 0, transition: { duration: 0.3 } }}
                        className={`sq-fila${c !== null && c >= 0 ? ' sq-con-color' : ''}${marcada ? ' sq-marco' : ''}${esActual ? ' sq-actual' : ''}`}
                        style={c !== null && c >= 0 ? colorDe(c) : undefined} data-fila={i}
                        aria-current={esActual ? 'true' : undefined}
                      >
                        <td className="sq-marca">
                          {esGrupo && colapsado && <span className="sq-colapso" title={`${nj} filas juntadas`}>×{nj}</span>}
                          {!esGrupo && marcada && <><span aria-hidden="true">{esActual ? '●' : '○'}</span><span className="sq-solo-lector">{esActual ? 'fila actual' : 'en el marco'}</span></>}
                        </td>
                        {tb.columnas.map((col) => (
                          <td key={col.clave} className={esNumero(f[col.clave]) ? 'sq-num' : undefined}>
                            {colapsado && col.clave !== cfg.particion ? <span className="sq-suspensivos" aria-hidden="true">⋯</span> : ver(f[col.clave])}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>

        <section className="sq-bloque" aria-label="Resultado de la consulta">
          <p className="sq-titulo-tabla">Resultado <span>({nSalida} {nSalida === 1 ? 'fila' : 'filas'})</span></p>
          <div className="sim-tabla sq-tabla">
            {grupo && (
              <table data-testid="sq-salida">
                <thead>
                  <tr>{grupo.columnas.map((c, k) => <th key={c} scope="col" className={k === 1 ? 'sq-nueva' : 'sq-clave'}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {grupo.grupos.map((g, k) => (
                    <motion.tr
                      key={String(g.clave)} className="sq-fila sq-con-color" style={colorDe(k)} aria-hidden={!salidaVisible || undefined}
                      initial={false} animate={salidaVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={menos ? { duration: 0 } : { duration: 0.4, delay: salidaVisible && paso !== null ? k * 0.18 : 0 }}
                    >
                      <td data-col={grupo.columnas[0]}>{ver(g.clave)}</td>
                      <td data-col={grupo.columnas[1]} className="sq-num sq-valor">{ver(g.valor)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
            {ventana && (
              <table data-testid="sq-salida">
                <thead>
                  <tr>
                    {tb.columnas.map((c) => <th key={c.clave} scope="col">{c.clave}</th>)}
                    <th scope="col" className="sq-nueva">{nombreNueva}</th>
                  </tr>
                </thead>
                <tbody>
                  {salida.map((i, k) => {
                    const f = tb.filas[i]!;
                    const vf = ventana.filas[i]!;
                    const visible = paso === null || k <= paso;
                    const c = nGrupos > 1 ? vf.particion : null;
                    return (
                      <tr
                        key={i} data-fila={i}
                        className={`sq-fila${c !== null ? ' sq-con-color' : ''}${i === activa ? ' sq-actual' : ''}`}
                        style={c !== null ? colorDe(c) : undefined}
                      >
                        {tb.columnas.map((col) => <td key={col.clave} className={esNumero(f[col.clave]) ? 'sq-num' : undefined}>{ver(f[col.clave])}</td>)}
                        <motion.td
                          className="sq-num sq-valor" data-col={nombreNueva} aria-hidden={!visible || undefined}
                          initial={false} animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                          transition={menos ? { duration: 0 } : { duration: 0.3 }}
                        >
                          <button
                            type="button" className={`sq-celda-btn${vf.valor === null ? ' sq-nulo' : ''}`} disabled={paso !== null} tabIndex={visible ? 0 : -1}
                            aria-pressed={i === activa} aria-label={`Ver cómo se calcula la fila ${i + 1}: ${formatoCelda(vf.valor)}`}
                            onClick={() => setSel(i)}
                          >
                            {formatoCelda(vf.valor)}
                          </button>
                        </motion.td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <p className="sim-nota sq-explica" aria-live="polite">{explicacion}{!esGrupo && paso === null && ' Tocá un valor de la columna nueva para ver su cálculo.'}</p>

      <Lecturas
        items={[
          { clave: 'filas-entrada', etiqueta: 'Filas de entrada', valor: nEntrada },
          { clave: 'filas-salida', etiqueta: 'Filas de salida', valor: nSalida },
        ]}
      />

      <div className="sim-controles sq-controles">
        <Botones>
          {corriendo ? (
            <Boton clave="animar" onClick={detener}>{esGrupo ? 'Saltar al final' : 'Detener'}</Boton>
          ) : (
            <Boton clave="animar" onClick={animar}>{esGrupo && paso === 3 ? 'Animar de nuevo' : 'Animar'}</Boton>
          )}
          {esGrupo && paso !== null && <Boton clave="restablecer" onClick={() => setPaso(null)}>Restablecer</Boton>}
        </Botones>
        {editable && (
          <>
            <Selector etiqueta="Función" valor={funcion} clave="funcion" opciones={opcionesFuncion} onChange={setFuncion} />
            <Selector
              etiqueta={esGrupo ? 'GROUP BY' : 'PARTITION BY'} valor={cfg.particion ?? ''} clave="particion"
              opciones={opcionesParticion} onChange={setParticion}
            />
            {!esGrupo && <Selector etiqueta="ORDER BY" valor={cfg.orden} clave="orden" opciones={opcionesOrden} onChange={setOrden} />}
            {!esGrupo && funcion === 'promedio-movil' && (
              <Slider etiqueta="Filas hacia atrás (marco)" valor={marco} min={1} max={5} paso={1} onChange={setMarco} clave="marco" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
