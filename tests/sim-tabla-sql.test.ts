import { describe, expect, it } from 'vitest';
import { TABLAS_SQL, type NombreTabla } from '../src/simuladores/presets/tablas-sql';
import { propsSimTablaSQL } from '../src/simuladores/props';
import {
  configDesdeProps, consultaSQL, ejecutarGroupBy, ejecutarVentana, filaInicial, formatoCelda, ordenDeSalida, type Config, type Funcion, type Operacion,
} from '../src/simuladores/sql/motor';

const cfg = (tabla: NombreTabla, operacion: Operacion, extra: Partial<{ funcion: Funcion; particionarPor: string; ordenarPor: string; marco: number }> = {}): Config =>
  configDesdeProps({ tabla, operacion, ...extra });

describe('SimTablaSQL: tablas de ejemplo', () => {
  it('cada tabla tiene 12 filas con las columnas del contrato', () => {
    expect(TABLAS_SQL.ventas.filas).toHaveLength(12);
    expect(TABLAS_SQL.tickets.filas).toHaveLength(12);
    expect(TABLAS_SQL.logins.filas).toHaveLength(12);
    expect(TABLAS_SQL.ventas.columnas.map((c) => c.clave)).toEqual(['fecha', 'region', 'vendedor', 'monto']);
    expect(TABLAS_SQL.tickets.columnas.map((c) => c.clave)).toEqual(['fecha', 'prioridad', 'agente', 'minutos']);
    expect(TABLAS_SQL.logins.columnas.map((c) => c.clave)).toEqual(['usuario', 'fecha_hora', 'resultado']);
  });
  it('todas las filas tienen todas las columnas', () => {
    for (const t of Object.values(TABLAS_SQL)) for (const f of t.filas) for (const c of t.columnas) expect(f[c.clave]).toBeDefined();
  });
});

describe('SimTablaSQL: GROUP BY', () => {
  it('por region sobre ventas deja una fila por región', () => {
    const { grupos, columnas } = ejecutarGroupBy(cfg('ventas', 'group-by', { particionarPor: 'region' }));
    expect(grupos.map((g) => g.clave)).toEqual(['Centro', 'Norte', 'Sur']);
    expect(columnas).toEqual(['region', 'total_monto']);
    expect(grupos.reduce((s, g) => s + g.filas.length, 0)).toBe(12);
  });
  it('sum, count, avg y max dan los valores a mano', () => {
    const norte = (f: Funcion) => ejecutarGroupBy(cfg('ventas', 'group-by', { funcion: f, particionarPor: 'region' })).grupos.find((g) => g.clave === 'Norte')!.valor;
    expect(norte('sum')).toBe(1200 + 900 + 1100 + 1450);
    expect(norte('count')).toBe(4);
    expect(norte('avg')).toBe((1200 + 900 + 1100 + 1450) / 4);
    expect(norte('max')).toBe(1450);
  });
  it('por defecto agrupa por la columna natural de la tabla y suma', () => {
    const c = cfg('tickets', 'group-by');
    expect(c.funcion).toBe('sum');
    expect(c.particion).toBe('prioridad');
    expect(ejecutarGroupBy(c).grupos).toHaveLength(3);
  });
  it('logins: sum cuenta los intentos fallidos por usuario', () => {
    const g = ejecutarGroupBy(cfg('logins', 'group-by', { funcion: 'sum', particionarPor: 'usuario' })).grupos;
    expect(Object.fromEntries(g.map((x) => [x.clave, x.valor]))).toEqual({ ana: 1, beto: 1, carla: 2 });
  });
  it('el texto SQL tiene GROUP BY y la función', () => {
    const q = consultaSQL(cfg('ventas', 'group-by', { funcion: 'avg', particionarPor: 'region' }));
    expect(q).toContain('SELECT region, AVG(monto) AS prom_monto');
    expect(q).toContain('GROUP BY region');
  });
});

describe('SimTablaSQL: funciones de ventana', () => {
  it('toda ventana conserva las 12 filas', () => {
    for (const f of ['row_number', 'rank', 'lag', 'suma-acumulada', 'promedio-movil'] as const) {
      expect(ejecutarVentana(cfg('ventas', 'ventana', { funcion: f })).filas).toHaveLength(12);
    }
  });
  it('row_number particionado por region vuelve a 1 al empezar cada región', () => {
    const c = cfg('ventas', 'ventana', { funcion: 'row_number', particionarPor: 'region', ordenarPor: 'fecha' });
    const v = ejecutarVentana(c);
    const nros = ordenDeSalida(v.filas).map((i) => v.filas[i]!.valor);
    expect(nros).toEqual([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
    expect(v.particiones).toEqual(['Centro', 'Norte', 'Sur']);
  });
  it('row_number sin partición numera de 1 a 12 por fecha', () => {
    const v = ejecutarVentana(cfg('ventas', 'ventana'));
    expect(v.filas.map((f) => f.valor)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('rank comparte posición en los empates y saltea la siguiente', () => {
    const c = cfg('ventas', 'ventana', { funcion: 'rank', particionarPor: 'region' });
    expect(c.orden).toBe('monto');
    expect(c.sentido).toBe('DESC');
    const v = ejecutarVentana(c);
    const centro = tb(v, 'Centro');
    expect(centro).toEqual([1, 2, 2, 4]); // 2100, 1500, 1500, 1300
    const sur = tb(v, 'Sur');
    expect(sur).toEqual([1, 2, 2, 4]); // 1750, 850, 850, 600
  });
  it('lag da NULL en la primera fila de cada partición y el valor anterior en el resto', () => {
    const v = ejecutarVentana(cfg('ventas', 'ventana', { funcion: 'lag', particionarPor: 'region', ordenarPor: 'fecha' }));
    const norte = ordenDeSalida(v.filas).filter((i) => v.filas[i]!.particion === 1).map((i) => v.filas[i]!.valor);
    expect(norte).toEqual([null, 1200, 900, 1100]);
  });
  it('suma-acumulada va sumando dentro de la partición', () => {
    const v = ejecutarVentana(cfg('ventas', 'ventana', { funcion: 'suma-acumulada', particionarPor: 'region', ordenarPor: 'fecha' }));
    const norte = ordenDeSalida(v.filas).filter((i) => v.filas[i]!.particion === 1).map((i) => v.filas[i]!.valor);
    expect(norte).toEqual([1200, 2100, 3200, 4650]);
  });
  it('promedio-movil con marco 2 promedia la fila actual y las 2 anteriores', () => {
    const c = cfg('tickets', 'ventana', { funcion: 'promedio-movil', marco: 2, ordenarPor: 'fecha' });
    const v = ejecutarVentana(c);
    // minutos en orden de fecha: 45, 120, 30, 75, ...
    expect(v.filas[2]!.marco).toEqual([0, 1, 2]);
    expect(v.filas[2]!.valor).toBeCloseTo((45 + 120 + 30) / 3, 10);
    expect(v.filas[0]!.marco).toEqual([0]); // al arrancar, hay menos filas
    expect(v.filas[5]!.marco).toHaveLength(3);
    expect(filaInicial(c, v.filas)).toBe(2); // la primera con el marco completo
  });
  it('el marco crece con la prop marco (1..5)', () => {
    for (const m of [1, 3, 5]) {
      const c = cfg('tickets', 'ventana', { funcion: 'promedio-movil', marco: m, ordenarPor: 'fecha' });
      expect(ejecutarVentana(c).filas[11]!.marco).toHaveLength(m + 1);
    }
    expect(cfg('tickets', 'ventana', { funcion: 'promedio-movil', marco: 9 }).marco).toBe(5);
  });
  it('el SQL de una ventana lleva PARTITION BY, ORDER BY y el marco', () => {
    const q = consultaSQL(cfg('tickets', 'ventana', { funcion: 'promedio-movil', marco: 2, particionarPor: 'prioridad', ordenarPor: 'fecha' }));
    expect(q).toContain('AVG(minutos) OVER (');
    expect(q).toContain('PARTITION BY prioridad');
    expect(q).toContain('ORDER BY fecha');
    expect(q).toContain('ROWS BETWEEN 2 PRECEDING AND CURRENT ROW');
    expect(q.trimEnd().endsWith('ORDER BY prioridad, fecha;')).toBe(true);
  });
  it('una columna inexistente se descarta y cae al valor por defecto', () => {
    expect(cfg('ventas', 'group-by', { particionarPor: 'nada' }).particion).toBe('region');
    expect(cfg('ventas', 'ventana', { particionarPor: 'nada' }).particion).toBeNull();
  });
  it('logins: el promedio móvil usa la tasa de fallos (0/1)', () => {
    const v = ejecutarVentana(cfg('logins', 'ventana', { funcion: 'promedio-movil', marco: 2 }));
    expect(v.filas).toHaveLength(12);
    for (const f of v.filas) expect(f.valor as number).toBeGreaterThanOrEqual(0);
  });
});

describe('SimTablaSQL: formato y esquema', () => {
  it('formatoCelda usa coma decimal y NULL', () => {
    expect(formatoCelda(1200)).toBe('1200');
    expect(formatoCelda(1233.3333)).toBe('1233,33');
    expect(formatoCelda(null)).toBe('NULL');
    expect(formatoCelda('Norte')).toBe('Norte');
  });
  it('el esquema rechaza una función que no corresponde a la operación', () => {
    expect(propsSimTablaSQL.safeParse({ consigna: 'x', tabla: 'ventas', operacion: 'group-by', funcion: 'rank' }).success).toBe(false);
    expect(propsSimTablaSQL.safeParse({ consigna: 'x', tabla: 'ventas', operacion: 'ventana', funcion: 'rank' }).success).toBe(true);
  });
});

function tb(v: ReturnType<typeof ejecutarVentana>, region: string) {
  const p = v.particiones.indexOf(region);
  return ordenDeSalida(v.filas).filter((i) => v.filas[i]!.particion === p).map((i) => v.filas[i]!.valor);
}
