import { describe, expect, it } from 'vitest';
import {
  busquedaInicial, dijkstra, disponibles, distanciaDesdeFalla, encontrada, esOrdenValido, estadosServicios, minimoTeorico,
  nodoEnLaMitad, ordenKahn, predecesores, probarNodo, recorridoPasos, tramoDeFalla, vecinos,
} from '../src/simuladores/grafo/algoritmos';
import {
  CADENA_RED, DEPENDENCIAS_PAQUETES, GRAFOS, MICROSERVICIOS_TIENDA, RED_CIUDAD, etiquetaDe,
} from '../src/simuladores/grafo/grafos';

describe('grafos del catálogo (doc §2.11)', () => {
  it('conteos', () => {
    expect(RED_CIUDAD.nodos).toHaveLength(8);
    expect(DEPENDENCIAS_PAQUETES.nodos).toHaveLength(8);
    expect(MICROSERVICIOS_TIENDA.nodos).toHaveLength(8);
    expect(CADENA_RED.nodos).toHaveLength(9);
    expect(CADENA_RED.aristas).toHaveLength(8);
    expect(RED_CIUDAD.aristas.filter((a) => a.avenida)).toHaveLength(1);
  });
  it('todas las aristas apuntan a nodos que existen y los ids son únicos', () => {
    for (const g of Object.values(GRAFOS)) {
      const ids = g.nodos.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const e of g.aristas) { expect(ids).toContain(e.de); expect(ids).toContain(e.a); }
      for (const n of g.nodos) { expect(n.x).toBeGreaterThan(0); expect(n.x).toBeLessThan(g.ancho); expect(n.y).toBeLessThan(g.alto); }
    }
  });
  it('microservicios: gateway llama a 5 servicios; pagos → antifraude y envios → inventario', () => {
    expect(vecinos(MICROSERVICIOS_TIENDA, 'gateway')).toEqual(['catalogo', 'carrito', 'pagos', 'envios', 'usuarios']);
    expect(vecinos(MICROSERVICIOS_TIENDA, 'pagos')).toEqual(['antifraude']);
    expect(vecinos(MICROSERVICIOS_TIENDA, 'envios')).toEqual(['inventario']);
  });
  it('la cadena de red tiene los nodos del doc en orden', () => {
    expect(CADENA_RED.nodos.map((n) => n.etiqueta)).toEqual(['PC', 'placa de red', 'cable', 'switch', 'router', 'firewall', 'proveedor', 'DNS', 'servidor']);
  });
});

describe('recorrido BFS/DFS', () => {
  const inicio = 'centro';
  it('BFS visita los 8 barrios por niveles', () => {
    const pasos = recorridoPasos(RED_CIUDAD, inicio, 'bfs');
    const fin = pasos.at(-1)!;
    expect(fin.visitados).toHaveLength(8);
    expect(new Set(fin.visitados).size).toBe(8);
    expect(fin.frontera).toEqual([]);
    expect(pasos[0]!.frontera).toEqual(['centro']);
    expect(pasos[0]!.visitados).toEqual([]);
    // nivel 1 = vecinos de Centro, por orden de nodo
    expect(fin.visitados.slice(0, 6)).toEqual(['centro', 'puerto', 'norte', 'oeste', 'mercado', 'sur']);
    expect(pasos[1]!.frontera).toEqual(['puerto', 'norte', 'oeste', 'mercado', 'sur']);
  });
  it('DFS se mete en profundidad (pila) y difiere de BFS', () => {
    const bfs = recorridoPasos(RED_CIUDAD, inicio, 'bfs').at(-1)!.visitados;
    const dfs = recorridoPasos(RED_CIUDAD, inicio, 'dfs');
    const orden = dfs.at(-1)!.visitados;
    expect(orden).toHaveLength(8);
    expect(new Set(orden).size).toBe(8);
    expect(orden).not.toEqual(bfs);
    // cada nodo visitado (salvo el primero) es vecino de algún nodo ya visitado
    orden.slice(1).forEach((n, i) => expect(orden.slice(0, i + 1).some((m) => vecinos(RED_CIUDAD, m).includes(n))).toBe(true));
    // la frontera de la pila no repite nodos
    for (const p of dfs) expect(new Set(p.frontera).size).toBe(p.frontera.length);
    expect(orden.slice(0, 3)).toEqual(['centro', 'puerto', 'norte']);
  });
  it('cada paso visita exactamente un nodo nuevo', () => {
    const pasos = recorridoPasos(RED_CIUDAD, 'oeste', 'dfs');
    pasos.forEach((p, i) => expect(p.visitados).toHaveLength(i));
  });
});

describe('Dijkstra en red-ciudad', () => {
  it('Oeste → Colinas pasa por la avenida central con tráfico normal (costo 18)', () => {
    const r = dijkstra(RED_CIUDAD, 'oeste', 'colinas', 1);
    expect(r.costo).toBe(18);
    expect(r.camino.map((id) => etiquetaDe(RED_CIUDAD, id))).toEqual(['Oeste', 'Centro', 'Mercado', 'Colinas']);
  });
  it('si el tráfico encarece la avenida, el camino cambia (por el Sur, costo 25)', () => {
    const r = dijkstra(RED_CIUDAD, 'oeste', 'colinas', 5);
    expect(r.costo).toBe(25);
    expect(r.camino).toEqual(['oeste', 'sur', 'mercado', 'colinas']);
    // el cambio ocurre entre ×2,5 y ×3
    expect(dijkstra(RED_CIUDAD, 'oeste', 'colinas', 2.5).camino).toContain('centro');
    expect(dijkstra(RED_CIUDAD, 'oeste', 'colinas', 3).camino).not.toContain('centro');
  });
  it('el costo nunca baja al subir el tráfico y es simétrico', () => {
    let prev = 0;
    for (let f = 1; f <= 5; f += 0.5) {
      const c = dijkstra(RED_CIUDAD, 'oeste', 'colinas', f).costo;
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
    expect(dijkstra(RED_CIUDAD, 'colinas', 'oeste', 1).costo).toBe(18);
  });
  it('los pasos cierran nodos en orden de distancia creciente y terminan en el destino', () => {
    const r = dijkstra(RED_CIUDAD, 'oeste', 'colinas', 1);
    const ultimo = r.pasos.at(-1)!;
    expect(ultimo.actual).toBe('colinas');
    const dists = r.pasos.slice(1).map((p) => p.dist[p.actual!]!);
    expect(dists).toEqual([...dists].sort((a, b) => a - b));
    expect(r.pasos[0]!.cerrados).toEqual([]);
  });
  it('origen = destino cuesta 0', () => {
    const r = dijkstra(RED_CIUDAD, 'sur', 'sur');
    expect(r.costo).toBe(0);
    expect(r.camino).toEqual(['sur']);
  });
});

describe('orden topológico (Kahn)', () => {
  it('arranca con libc como único disponible', () => {
    expect(disponibles(DEPENDENCIAS_PAQUETES, [])).toEqual(['libc']);
  });
  it('el orden completo nunca pone un paquete antes de sus dependencias', () => {
    const orden = ordenKahn(DEPENDENCIAS_PAQUETES);
    expect(orden).toHaveLength(8);
    expect(esOrdenValido(DEPENDENCIAS_PAQUETES, orden)).toBe(true);
    expect(orden[0]).toBe('libc');
    expect(orden.at(-1)).toBe('app');
  });
  it('cualquier elección de disponibles da un orden válido', () => {
    for (const pick of [0, 1, -1]) {
      const orden: string[] = [];
      while (orden.length < 8) {
        const d = disponibles(DEPENDENCIAS_PAQUETES, orden);
        orden.push(d.at(pick) ?? d[0]!);
      }
      expect(esOrdenValido(DEPENDENCIAS_PAQUETES, orden)).toBe(true);
    }
  });
  it('un orden con un paquete antes de su dependencia es inválido', () => {
    expect(esOrdenValido(DEPENDENCIAS_PAQUETES, ['zlib', 'libc'])).toBe(false);
    expect(predecesores(DEPENDENCIAS_PAQUETES, 'requests')).toEqual(['python', 'curl']);
  });
});

describe('propagación de fallas', () => {
  const g = MICROSERVICIOS_TIENDA;
  const cuenta = (e: Record<string, string>, t: string) => Object.values(e).filter((x) => x === t).length;
  it('todo ok si no se tira nada', () => {
    const e = estadosServicios(g, new Set(), true);
    expect(cuenta(e, 'ok')).toBe(8);
  });
  it('con timeouts, tirar antifraude deja pagos degradado y el gateway ok', () => {
    const e = estadosServicios(g, new Set(['antifraude']), true);
    expect(e.antifraude).toBe('caído');
    expect(e.pagos).toBe('degradado');
    expect(e.gateway).toBe('ok');
    expect(cuenta(e, 'caído')).toBe(1);
    expect(cuenta(e, 'degradado')).toBe(1);
  });
  it('sin timeouts, la misma falla tira pagos y el gateway', () => {
    const e = estadosServicios(g, new Set(['antifraude']), false);
    expect(e.pagos).toBe('caído');
    expect(e.gateway).toBe('caído');
    expect(cuenta(e, 'caído')).toBe(3);
    expect(cuenta(e, 'degradado')).toBe(0);
  });
  it('con timeouts, tirar pagos deja el gateway degradado', () => {
    const e = estadosServicios(g, new Set(['pagos']), true);
    expect(e.gateway).toBe('degradado');
    expect(e.antifraude).toBe('ok');
  });
  it('la distancia de la cascada crece hacia arriba', () => {
    const d = distanciaDesdeFalla(g, new Set(['antifraude']));
    expect(d).toEqual({ antifraude: 0, pagos: 1, gateway: 2 });
  });
});

describe('buscar la falla (búsqueda binaria)', () => {
  it('mínimo teórico = ⌈log₂ 8⌉ = 3', () => {
    expect(minimoTeorico(8)).toBe(3);
  });
  it('probando siempre en la mitad se encuentra en ≤ 3 pruebas, con cualquier falla', () => {
    for (let falla = 0; falla < 8; falla++) {
      let e = busquedaInicial(8);
      while (!encontrada(e)) e = probarNodo(e, nodoEnLaMitad(e), falla);
      expect(e.pruebas.length).toBeLessThanOrEqual(3);
      expect(e.lo).toBe(falla);
    }
  });
  it('probar en el servidor o en la PC no ayuda', () => {
    const e0 = busquedaInicial(8);
    expect(probarNodo(e0, 0, 5)).toMatchObject({ lo: 0, hi: 7 });
    expect(probarNodo(e0, 8, 5)).toMatchObject({ lo: 0, hi: 7 });
  });
  it('la señal llega solo hasta el nodo anterior a la falla', () => {
    const e = probarNodo(probarNodo(busquedaInicial(8), 4, 5), 6, 5);
    expect(e.pruebas).toEqual([{ nodo: 4, llega: true }, { nodo: 6, llega: false }]);
    expect(e).toMatchObject({ lo: 4, hi: 5 });
  });
  it('la falla escondida sale de la semilla: determinista y cambia con cada "nueva falla"', () => {
    expect(tramoDeFalla(42, 0, 8)).toBe(tramoDeFalla(42, 0, 8));
    const todas = new Set(Array.from({ length: 12 }, (_, i) => tramoDeFalla(42, i, 8)));
    expect(todas.size).toBeGreaterThan(3);
    for (const t of todas) { expect(t).toBeGreaterThanOrEqual(0); expect(t).toBeLessThan(8); }
  });
});
