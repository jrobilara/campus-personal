// Tablas de SimTablaSQL (SIMULADORES.md §2.7): constantes de 12 filas cada una, hechas a mano para que los ejemplos enseñen algo
// (empates para RANK, grupos del mismo tamaño, intentos fallidos seguidos).
export type NombreTabla = 'ventas' | 'tickets' | 'logins';
export type Celda = string | number;
export type FilaSQL = Record<string, Celda>;
export type TipoColumna = 'texto' | 'fecha' | 'numero';
export interface ColumnaSQL { clave: string; tipo: TipoColumna }
export interface TablaSQL {
  nombre: NombreTabla;
  columnas: ColumnaSQL[];
  filas: FilaSQL[];
  /** columna numérica que sumamos, promediamos, etc. (logins no tiene: usa los intentos fallidos) */
  medida: string | null;
  /** columna por la que se ordena la ventana si el escritor no dice otra */
  orden: string;
  /** columna del GROUP BY si el escritor no dice otra */
  grupo: string;
}

const ventas: FilaSQL[] = [
  { fecha: '2025-03-03', region: 'Norte', vendedor: 'Ana', monto: 1200 },
  { fecha: '2025-03-04', region: 'Sur', vendedor: 'Beto', monto: 850 },
  { fecha: '2025-03-05', region: 'Centro', vendedor: 'Carla', monto: 1500 },
  { fecha: '2025-03-07', region: 'Norte', vendedor: 'Diego', monto: 900 },
  { fecha: '2025-03-10', region: 'Sur', vendedor: 'Elena', monto: 1750 },
  { fecha: '2025-03-11', region: 'Centro', vendedor: 'Fede', monto: 1500 },
  { fecha: '2025-03-12', region: 'Norte', vendedor: 'Ana', monto: 1100 },
  { fecha: '2025-03-14', region: 'Sur', vendedor: 'Beto', monto: 850 },
  { fecha: '2025-03-17', region: 'Centro', vendedor: 'Carla', monto: 2100 },
  { fecha: '2025-03-18', region: 'Norte', vendedor: 'Diego', monto: 1450 },
  { fecha: '2025-03-20', region: 'Sur', vendedor: 'Elena', monto: 600 },
  { fecha: '2025-03-24', region: 'Centro', vendedor: 'Fede', monto: 1300 },
];

const tickets: FilaSQL[] = [
  { fecha: '2025-03-03', prioridad: 'P2', agente: 'Lucía', minutos: 45 },
  { fecha: '2025-03-03', prioridad: 'P3', agente: 'Mateo', minutos: 120 },
  { fecha: '2025-03-04', prioridad: 'P1', agente: 'Sofía', minutos: 30 },
  { fecha: '2025-03-05', prioridad: 'P2', agente: 'Tomás', minutos: 75 },
  { fecha: '2025-03-05', prioridad: 'P3', agente: 'Lucía', minutos: 95 },
  { fecha: '2025-03-06', prioridad: 'P1', agente: 'Mateo', minutos: 55 },
  { fecha: '2025-03-10', prioridad: 'P2', agente: 'Sofía', minutos: 60 },
  { fecha: '2025-03-11', prioridad: 'P3', agente: 'Tomás', minutos: 180 },
  { fecha: '2025-03-12', prioridad: 'P1', agente: 'Lucía', minutos: 30 },
  { fecha: '2025-03-13', prioridad: 'P2', agente: 'Mateo', minutos: 90 },
  { fecha: '2025-03-14', prioridad: 'P3', agente: 'Sofía', minutos: 150 },
  { fecha: '2025-03-17', prioridad: 'P1', agente: 'Tomás', minutos: 40 },
];

const logins: FilaSQL[] = [
  { usuario: 'ana', fecha_hora: '2025-03-03 08:02', resultado: 'ok' },
  { usuario: 'beto', fecha_hora: '2025-03-03 08:15', resultado: 'fallo' },
  { usuario: 'beto', fecha_hora: '2025-03-03 08:16', resultado: 'ok' },
  { usuario: 'carla', fecha_hora: '2025-03-03 09:30', resultado: 'ok' },
  { usuario: 'ana', fecha_hora: '2025-03-03 13:41', resultado: 'ok' },
  { usuario: 'carla', fecha_hora: '2025-03-04 08:55', resultado: 'fallo' },
  { usuario: 'carla', fecha_hora: '2025-03-04 08:56', resultado: 'fallo' },
  { usuario: 'carla', fecha_hora: '2025-03-04 08:58', resultado: 'ok' },
  { usuario: 'beto', fecha_hora: '2025-03-04 09:10', resultado: 'ok' },
  { usuario: 'ana', fecha_hora: '2025-03-04 17:20', resultado: 'fallo' },
  { usuario: 'ana', fecha_hora: '2025-03-05 08:05', resultado: 'ok' },
  { usuario: 'beto', fecha_hora: '2025-03-05 08:30', resultado: 'ok' },
];

export const TABLAS_SQL: Record<NombreTabla, TablaSQL> = {
  ventas: {
    nombre: 'ventas', filas: ventas, medida: 'monto', orden: 'fecha', grupo: 'region',
    columnas: [{ clave: 'fecha', tipo: 'fecha' }, { clave: 'region', tipo: 'texto' }, { clave: 'vendedor', tipo: 'texto' }, { clave: 'monto', tipo: 'numero' }],
  },
  tickets: {
    nombre: 'tickets', filas: tickets, medida: 'minutos', orden: 'fecha', grupo: 'prioridad',
    columnas: [{ clave: 'fecha', tipo: 'fecha' }, { clave: 'prioridad', tipo: 'texto' }, { clave: 'agente', tipo: 'texto' }, { clave: 'minutos', tipo: 'numero' }],
  },
  logins: {
    nombre: 'logins', filas: logins, medida: null, orden: 'fecha_hora', grupo: 'usuario',
    columnas: [{ clave: 'usuario', tipo: 'texto' }, { clave: 'fecha_hora', tipo: 'fecha' }, { clave: 'resultado', tipo: 'texto' }],
  },
};
