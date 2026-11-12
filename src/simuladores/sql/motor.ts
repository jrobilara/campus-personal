// Motor de SimTablaSQL (sin React ni DOM): ejecuta GROUP BY y funciones de ventana sobre las tablas de ejemplo
// y arma el texto SQL equivalente. Todo es puro: la misma configuración da siempre el mismo resultado.
import { TABLAS_SQL, type Celda, type FilaSQL, type NombreTabla, type TablaSQL } from '../presets/tablas-sql';

export type Agregada = 'count' | 'sum' | 'avg' | 'max';
export type FuncionVentana = 'row_number' | 'rank' | 'lag' | 'suma-acumulada' | 'promedio-movil';
export type Funcion = Agregada | FuncionVentana;
export type Operacion = 'group-by' | 'ventana';
export type Sentido = 'ASC' | 'DESC';

export const AGREGADAS: Agregada[] = ['count', 'sum', 'avg', 'max'];
export const VENTANAS: FuncionVentana[] = ['row_number', 'rank', 'lag', 'suma-acumulada', 'promedio-movil'];
export const esAgregada = (f: Funcion): f is Agregada => (AGREGADAS as string[]).includes(f);

export interface PropsMotor {
  tabla: NombreTabla; operacion: Operacion; funcion?: Funcion; particionarPor?: string; ordenarPor?: string; marco?: number;
}
export interface Config {
  tabla: NombreTabla; operacion: Operacion; funcion: Funcion;
  /** columna del GROUP BY (siempre hay) o del PARTITION BY (null = una sola partición) */
  particion: string | null;
  orden: string; sentido: Sentido; marco: number;
}

const columnasDe = (t: NombreTabla) => TABLAS_SQL[t].columnas.map((c) => c.clave);
export const esNumerica = (t: NombreTabla, col: string) => TABLAS_SQL[t].columnas.find((c) => c.clave === col)?.tipo === 'numero';

/** Orden por defecto de la ventana: RANK ordena por la medida (para que haya empates), el resto por fecha. */
export function ordenPorDefecto(t: NombreTabla, f: Funcion): string {
  const tb = TABLAS_SQL[t];
  if (f === 'rank') return tb.medida ?? 'resultado';
  return tb.orden;
}
/** Sentido por defecto: los rankings de números van de mayor a menor. */
export const sentidoPorDefecto = (t: NombreTabla, col: string, f: Funcion): Sentido => (esNumerica(t, col) && (f === 'rank' || f === 'row_number') ? 'DESC' : 'ASC');

/** Completa lo que el escritor no dijo y descarta lo que no existe en la tabla. */
export function configDesdeProps(p: PropsMotor): Config {
  const tb = TABLAS_SQL[p.tabla];
  const cols = columnasDe(p.tabla);
  const funcion: Funcion = p.funcion ?? (p.operacion === 'group-by' ? 'sum' : 'row_number');
  const valida = (c?: string) => (c && cols.includes(c) ? c : undefined);
  const particion = p.operacion === 'group-by' ? (valida(p.particionarPor) ?? tb.grupo) : (valida(p.particionarPor) ?? null);
  const orden = valida(p.ordenarPor) ?? ordenPorDefecto(p.tabla, funcion);
  return {
    tabla: p.tabla, operacion: p.operacion, funcion, particion, orden,
    sentido: sentidoPorDefecto(p.tabla, orden, funcion), marco: Math.min(5, Math.max(1, Math.round(p.marco ?? 2))),
  };
}

// ---------------------------------------------------------------- la medida de cada tabla
const CASE_FALLO = "CASE WHEN resultado = 'fallo' THEN 1 ELSE 0 END";
/** Expresión SQL sobre la que actúa la función (en `logins` no hay números: se cuentan los intentos fallidos). */
export function expresionMedida(t: NombreTabla, f: Funcion): string {
  const tb = TABLAS_SQL[t];
  if (tb.medida) return tb.medida;
  return f === 'max' || f === 'lag' ? 'fecha_hora' : CASE_FALLO;
}
export function valorMedida(fila: FilaSQL, t: NombreTabla, f: Funcion): Celda {
  const tb = TABLAS_SQL[t];
  if (tb.medida) return fila[tb.medida]!;
  return f === 'max' || f === 'lag' ? fila.fecha_hora! : fila.resultado === 'fallo' ? 1 : 0;
}

const ALIAS: Record<NombreTabla, Record<Exclude<Funcion, 'count' | 'row_number' | 'rank'>, string>> = {
  ventas: { sum: 'total_monto', avg: 'prom_monto', max: 'max_monto', lag: 'monto_anterior', 'suma-acumulada': 'acum_monto', 'promedio-movil': 'prom_movil' },
  tickets: { sum: 'total_minutos', avg: 'prom_minutos', max: 'max_minutos', lag: 'minutos_anterior', 'suma-acumulada': 'acum_minutos', 'promedio-movil': 'prom_movil' },
  logins: { sum: 'fallos', avg: 'tasa_fallos', max: 'ultimo_login', lag: 'login_anterior', 'suma-acumulada': 'acum_fallos', 'promedio-movil': 'tasa_movil' },
};
export function alias(t: NombreTabla, f: Funcion): string {
  if (f === 'count') return 'cantidad';
  if (f === 'row_number') return 'nro';
  if (f === 'rank') return 'posicion';
  return ALIAS[t][f];
}

// ---------------------------------------------------------------- el texto SQL
export function expresionFuncion(c: Config): string {
  const m = expresionMedida(c.tabla, c.funcion);
  switch (c.funcion) {
    case 'count': return 'COUNT(*)';
    case 'sum': case 'suma-acumulada': return `SUM(${m})`;
    case 'avg': case 'promedio-movil': return `AVG(${m})`;
    case 'max': return `MAX(${m})`;
    case 'row_number': return 'ROW_NUMBER()';
    case 'rank': return 'RANK()';
    case 'lag': return `LAG(${m})`;
  }
}

/** La consulta equivalente, en varias líneas. El texto de la lectura `sql`. */
export function consultaSQL(c: Config): string {
  const nombre = alias(c.tabla, c.funcion);
  if (c.operacion === 'group-by') {
    const k = c.particion!;
    return [`SELECT ${k}, ${expresionFuncion(c)} AS ${nombre}`, `FROM ${c.tabla}`, `GROUP BY ${k}`, `ORDER BY ${k};`].join('\n');
  }
  const partir = c.particion ? `PARTITION BY ${c.particion}` : '';
  const ordenar = `ORDER BY ${c.orden}${c.sentido === 'DESC' ? ' DESC' : ''}`;
  const marco = c.funcion === 'suma-acumulada' ? 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW'
    : c.funcion === 'promedio-movil' ? `ROWS BETWEEN ${c.marco} PRECEDING AND CURRENT ROW` : '';
  const f = expresionFuncion(c);
  if (!marco) return [`SELECT *,`, `       ${f} OVER (${[partir, ordenar].filter(Boolean).join(' ')}) AS ${nombre}`, `FROM ${c.tabla};`].join('\n');
  return [
    `SELECT *,`, `       ${f} OVER (`,
    ...(partir ? [`         ${partir}`] : []), `         ${ordenar}`, `         ${marco}`,
    `       ) AS ${nombre}`, `FROM ${c.tabla};`,
  ].join('\n');
}

// ---------------------------------------------------------------- GROUP BY
export interface GrupoSalida { clave: Celda; valor: Celda; /** índices de las filas de entrada que se juntaron */ filas: number[] }
const comparar = (a: Celda, b: Celda) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'es'));

export function ejecutarGroupBy(c: Config): { columnas: string[]; grupos: GrupoSalida[] } {
  const tb = TABLAS_SQL[c.tabla];
  const k = c.particion!;
  const porClave = new Map<string, number[]>();
  tb.filas.forEach((f, i) => { const s = String(f[k]); porClave.set(s, [...(porClave.get(s) ?? []), i]); });
  const grupos = [...porClave.values()].map((idx) => {
    const vals = idx.map((i) => valorMedida(tb.filas[i]!, c.tabla, c.funcion));
    const nums = vals.filter((v): v is number => typeof v === 'number');
    let valor: Celda;
    switch (c.funcion) {
      case 'count': valor = idx.length; break;
      case 'sum': valor = nums.reduce((s, x) => s + x, 0); break;
      case 'avg': valor = nums.reduce((s, x) => s + x, 0) / nums.length; break;
      default: valor = vals.reduce((m, v) => (comparar(v, m) > 0 ? v : m)); // max
    }
    return { clave: tb.filas[idx[0]!]![k]!, valor, filas: idx };
  });
  grupos.sort((a, b) => comparar(a.clave, b.clave));
  return { columnas: [k, alias(c.tabla, c.funcion)], grupos };
}

// ---------------------------------------------------------------- funciones de ventana
export interface FilaVentana {
  /** valor de la columna nueva (null = NULL) */
  valor: Celda | null;
  /** posición dentro de su partición, ya ordenada (0 = la primera) */
  pos: number;
  /** índice de partición (según la primera aparición) */
  particion: number;
  /** filas de entrada que entran en el cálculo de esta fila (incluye a la propia) */
  marco: number[];
}

export function ejecutarVentana(c: Config): { columna: string; filas: FilaVentana[]; particiones: string[] } {
  const tb: TablaSQL = TABLAS_SQL[c.tabla];
  const grupos = new Map<string, number[]>();
  tb.filas.forEach((f, i) => { const s = c.particion ? String(f[c.particion]) : ''; grupos.set(s, [...(grupos.get(s) ?? []), i]); });
  const dir = c.sentido === 'DESC' ? -1 : 1;
  const filas: FilaVentana[] = tb.filas.map(() => ({ valor: null, pos: 0, particion: 0, marco: [] }));
  const nombres: string[] = [];
  [...grupos.entries()].forEach(([clave, idx], p) => {
    nombres.push(clave);
    const orden = [...idx].sort((a, b) => dir * comparar(tb.filas[a]![c.orden]!, tb.filas[b]![c.orden]!) || a - b);
    const medida = (i: number) => valorMedida(tb.filas[i]!, c.tabla, c.funcion);
    orden.forEach((i, pos) => {
      let valor: Celda | null = null;
      let marco: number[] = [i];
      switch (c.funcion) {
        case 'row_number': valor = pos + 1; marco = orden.slice(0, pos + 1); break;
        case 'rank': {
          const menores = orden.filter((j) => dir * comparar(tb.filas[j]![c.orden]!, tb.filas[i]![c.orden]!) < 0).length;
          valor = menores + 1; marco = orden; break;
        }
        case 'lag': valor = pos > 0 ? medida(orden[pos - 1]!) : null; marco = pos > 0 ? [orden[pos - 1]!, i] : [i]; break;
        case 'suma-acumulada': marco = orden.slice(0, pos + 1); valor = marco.reduce((s, j) => s + (medida(j) as number), 0); break;
        case 'promedio-movil': marco = orden.slice(Math.max(0, pos - c.marco), pos + 1); valor = marco.reduce((s, j) => s + (medida(j) as number), 0) / marco.length; break;
        default: break;
      }
      filas[i] = { valor, pos, particion: p, marco };
    });
  });
  return { columna: alias(c.tabla, c.funcion), filas, particiones: nombres };
}

/** Fila de entrada que se muestra seleccionada al empezar: la primera con el marco completo (o la última). */
export function filaInicial(c: Config, filas: FilaVentana[]): number {
  if (c.funcion !== 'promedio-movil') return Math.min(filas.length - 1, c.funcion === 'lag' ? 1 : 0);
  const completa = filas.findIndex((f) => f.marco.length === c.marco + 1);
  return completa >= 0 ? completa : filas.length - 1;
}

/** Formato de una celda de salida (coma decimal). */
export function formatoCelda(v: Celda | null): string {
  if (v === null) return 'NULL';
  if (typeof v === 'string') return v;
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',');
}
