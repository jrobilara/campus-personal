// SimGrafo: algoritmos puros (BFS/DFS, Dijkstra, Kahn, propagación de fallas, búsqueda binaria de una falla).
// Sin React ni DOM: los prueba Vitest. Los desempates son siempre por el orden de los nodos en el grafo.
import { mulberry32 } from '../azar';
import { indiceDe, type AristaG, type GrafoDef } from './grafos';

// ───────────────────────── vecinos ─────────────────────────

/** Vecinos de un nodo (en grafos no dirigidos, ambos sentidos; en dirigidos, los que el nodo llama), por orden de nodo. */
export function vecinos(g: GrafoDef, id: string): string[] {
  const out = new Set<string>();
  for (const e of g.aristas) {
    if (e.de === id) out.add(e.a);
    else if (!g.dirigido && e.a === id) out.add(e.de);
  }
  return [...out].sort((a, b) => indiceDe(g, a) - indiceDe(g, b));
}

/** Nodos de los que `id` depende (aristas que llegan a él). */
export function predecesores(g: GrafoDef, id: string): string[] {
  return g.aristas.filter((e) => e.a === id).map((e) => e.de).sort((a, b) => indiceDe(g, a) - indiceDe(g, b));
}

// ───────────────────────── recorrido BFS / DFS ─────────────────────────

export type TipoRecorrido = 'bfs' | 'dfs';
export interface EstadoRecorrido {
  /** orden de visita hasta ahora */
  visitados: string[];
  /** nodos descubiertos y pendientes, en el orden en que se van a visitar (primero = el próximo) */
  frontera: string[];
  /** quién puso a cada nodo en la frontera (arista del árbol de recorrido) */
  padre: Record<string, string>;
  /** último nodo visitado */
  actual: string | null;
}

/** Todos los estados del recorrido: [0] es el inicial (solo el nodo de partida en la frontera) y cada paso visita un nodo. */
export function recorridoPasos(g: GrafoDef, inicio: string, tipo: TipoRecorrido): EstadoRecorrido[] {
  const estados: EstadoRecorrido[] = [];
  const visitados: string[] = [];
  const padre: Record<string, string> = {};
  const descubiertos = new Set<string>([inicio]);
  // estructura interna: BFS = cola (se saca del principio); DFS = pila (se saca del final)
  let pendientes: string[] = [inicio];
  const instantanea = (actual: string | null): EstadoRecorrido => ({
    visitados: [...visitados],
    frontera: tipo === 'bfs' ? [...pendientes] : [...pendientes].reverse(),
    padre: { ...padre },
    actual,
  });
  estados.push(instantanea(null));
  while (pendientes.length) {
    const u = tipo === 'bfs' ? pendientes.shift()! : pendientes.pop()!;
    visitados.push(u);
    const nuevos = vecinos(g, u).filter((v) => !visitados.includes(v) && (tipo === 'dfs' || !descubiertos.has(v)));
    if (tipo === 'bfs') {
      for (const v of nuevos) { descubiertos.add(v); padre[v] = u; pendientes.push(v); }
    } else {
      // pila sin duplicados: si el vecino ya estaba esperando, se lo "re-apila" encima (así el orden es el del DFS recursivo)
      pendientes = pendientes.filter((p) => !nuevos.includes(p));
      for (const v of [...nuevos].reverse()) { padre[v] = u; pendientes.push(v); }
    }
    estados.push(instantanea(u));
  }
  return estados;
}

// ───────────────────────── Dijkstra ─────────────────────────

export const pesoEfectivo = (e: AristaG, factorAvenida: number): number => (e.peso ?? 1) * (e.avenida ? factorAvenida : 1);

export interface PasoDijkstra {
  /** nodo cerrado en este paso (null en el estado inicial) */
  actual: string | null;
  cerrados: string[];
  /** distancia provisoria conocida de cada nodo alcanzado */
  dist: Record<string, number>;
  previo: Record<string, string>;
}
export interface ResultadoDijkstra {
  pasos: PasoDijkstra[];
  costo: number;
  camino: string[];
}

/** Dijkstra de `origen` a `destino` (corta cuando el destino se cierra). `pasos[0]` es el estado inicial. */
export function dijkstra(g: GrafoDef, origen: string, destino: string, factorAvenida = 1): ResultadoDijkstra {
  const dist: Record<string, number> = { [origen]: 0 };
  const previo: Record<string, string> = {};
  const cerrados: string[] = [];
  const pasos: PasoDijkstra[] = [{ actual: null, cerrados: [], dist: { ...dist }, previo: { ...previo } }];
  while (true) {
    let u: string | null = null;
    for (const n of g.nodos) {
      if (cerrados.includes(n.id) || dist[n.id] === undefined) continue;
      if (u === null || dist[n.id]! < dist[u]!) u = n.id;
    }
    if (u === null) break;
    cerrados.push(u);
    for (const e of g.aristas) {
      const v = e.de === u ? e.a : !g.dirigido && e.a === u ? e.de : null;
      if (v === null || cerrados.includes(v)) continue;
      const d = dist[u]! + pesoEfectivo(e, factorAvenida);
      if (dist[v] === undefined || d < dist[v]! - 1e-12) { dist[v] = d; previo[v] = u; }
    }
    pasos.push({ actual: u, cerrados: [...cerrados], dist: { ...dist }, previo: { ...previo } });
    if (u === destino) break;
  }
  const camino: string[] = [];
  if (dist[destino] !== undefined) for (let c: string | undefined = destino; c !== undefined; c = previo[c]) camino.unshift(c);
  return { pasos, costo: dist[destino] ?? Infinity, camino };
}

// ───────────────────────── orden topológico (Kahn) ─────────────────────────

/** Paquetes que todavía no están en `orden` y ya tienen todas sus dependencias cumplidas (grado de entrada pendiente 0). */
export function disponibles(g: GrafoDef, orden: readonly string[]): string[] {
  return g.nodos
    .filter((n) => !orden.includes(n.id) && predecesores(g, n.id).every((p) => orden.includes(p)))
    .map((n) => n.id);
}
/** Cuántas dependencias de `id` siguen sin instalarse. */
export const dependenciasPendientes = (g: GrafoDef, id: string, orden: readonly string[]): number =>
  predecesores(g, id).filter((p) => !orden.includes(p)).length;

/** Kahn eligiendo siempre el primer disponible. */
export function ordenKahn(g: GrafoDef): string[] {
  const orden: string[] = [];
  while (orden.length < g.nodos.length) {
    const d = disponibles(g, orden);
    if (!d.length) break; // ciclo: no es un DAG
    orden.push(d[0]!);
  }
  return orden;
}
/** Ningún nodo aparece antes de sus dependencias. */
export function esOrdenValido(g: GrafoDef, orden: readonly string[]): boolean {
  return g.aristas.every((e) => {
    const i = orden.indexOf(e.de), j = orden.indexOf(e.a);
    return j < 0 || (i >= 0 && i < j);
  });
}

// ───────────────────────── propagación de fallas ─────────────────────────

export type EstadoServicio = 'ok' | 'degradado' | 'caído';

/**
 * Estado de cada servicio. Sin protección, una dependencia caída tira a quien la llama (y así hacia arriba).
 * Con timeouts y circuit breaker, el que depende de un servicio caído queda `degradado` y la falla no sigue subiendo.
 */
export function estadosServicios(g: GrafoDef, tirados: ReadonlySet<string>, protegido: boolean): Record<string, EstadoServicio> {
  const memo: Record<string, EstadoServicio> = {};
  const estado = (id: string): EstadoServicio => {
    if (memo[id]) return memo[id]!;
    let r: EstadoServicio;
    if (tirados.has(id)) r = 'caído';
    else {
      const hijos = vecinos(g, id).map(estado);
      r = hijos.includes('caído') ? (protegido ? 'degradado' : 'caído') : 'ok';
    }
    return (memo[id] = r);
  };
  for (const n of g.nodos) estado(n.id);
  return memo;
}

/** Saltos desde el servicio tirado más cercano hacia arriba (para escalonar la animación de la cascada). */
export function distanciaDesdeFalla(g: GrafoDef, tirados: ReadonlySet<string>): Record<string, number> {
  const d: Record<string, number> = {};
  let cola = [...tirados];
  for (const t of cola) d[t] = 0;
  while (cola.length) {
    const sig: string[] = [];
    for (const id of cola) for (const p of predecesores(g, id)) if (d[p] === undefined) { d[p] = d[id]! + 1; sig.push(p); }
    cola = sig;
  }
  return d;
}

// ───────────────────────── buscar una falla (búsqueda binaria) ─────────────────────────

/** Tramos de una cadena de `nodos` nodos. */
export const tramosDe = (nodos: number) => nodos - 1;
/** ⌈log₂ tramos⌉ */
export const minimoTeorico = (tramos: number) => Math.ceil(Math.log2(tramos));

/** Tramo (0-based; el tramo j une el nodo j con el j+1) donde está escondida la falla número `intento`. */
export function tramoDeFalla(semilla: number, intento: number, tramos: number): number {
  const r = mulberry32((semilla + intento * 7919) >>> 0);
  r(); // descarta la primera salida (semillas chicas dan valores parecidos)
  return Math.floor(r() * tramos);
}
/** Probar "hasta acá" en el nodo k (0 = PC): la señal llega si no hay falla en ninguno de los k tramos anteriores. */
export const senalLlega = (falla: number, nodo: number): boolean => falla >= nodo;

export interface EstadoBusqueda {
  /** tramos que todavía pueden tener la falla: de `lo` a `hi` (inclusive) */
  lo: number;
  hi: number;
  pruebas: { nodo: number; llega: boolean }[];
}
export const busquedaInicial = (tramos: number): EstadoBusqueda => ({ lo: 0, hi: tramos - 1, pruebas: [] });
export const encontrada = (e: EstadoBusqueda): boolean => e.lo === e.hi;

export function probarNodo(e: EstadoBusqueda, nodo: number, falla: number): EstadoBusqueda {
  const llega = senalLlega(falla, nodo);
  return {
    lo: llega ? Math.max(e.lo, nodo) : e.lo,
    hi: llega ? e.hi : Math.min(e.hi, nodo - 1),
    pruebas: [...e.pruebas, { nodo, llega }],
  };
}
/** Nodo donde conviene probar: el que parte en dos mitades los tramos que quedan. */
export const nodoEnLaMitad = (e: EstadoBusqueda): number => e.lo + Math.ceil((e.hi - e.lo + 1) / 2);
