// SimGrafo: los 4 grafos del catálogo con posiciones fijas (sin layout automático). Módulo puro.
// Coordenadas en el espacio del viewBox de cada grafo.

export type IdGrafo = 'red-ciudad' | 'dependencias-paquetes' | 'microservicios-tienda' | 'cadena-red';

export interface NodoG {
  id: string;
  etiqueta: string;
  x: number;
  y: number;
  /** ancho del rótulo en el dibujo (solo grafos con nodos rectangulares) */
  w?: number;
}
export interface AristaG {
  /** extremo origen (en grafos no dirigidos, un extremo cualquiera) */
  de: string;
  a: string;
  /** minutos de viaje (red-ciudad) */
  peso?: number;
  /** arista marcada: la avenida central, cuyo peso multiplica el slider de tráfico */
  avenida?: boolean;
}
export interface GrafoDef {
  id: IdGrafo;
  ancho: number;
  alto: number;
  dirigido: boolean;
  forma: 'circulo' | 'rect';
  nodos: NodoG[];
  aristas: AristaG[];
}

// 8 barrios, aristas con peso en minutos. La avenida central es Centro–Mercado.
export const RED_CIUDAD: GrafoDef = {
  id: 'red-ciudad', ancho: 460, alto: 330, dirigido: false, forma: 'circulo',
  nodos: [
    { id: 'puerto', etiqueta: 'Puerto', x: 55, y: 60 },
    { id: 'norte', etiqueta: 'Norte', x: 185, y: 38 },
    { id: 'parque', etiqueta: 'Parque', x: 330, y: 55 },
    { id: 'colinas', etiqueta: 'Colinas', x: 415, y: 160 },
    { id: 'oeste', etiqueta: 'Oeste', x: 45, y: 205 },
    { id: 'centro', etiqueta: 'Centro', x: 195, y: 155 },
    { id: 'mercado', etiqueta: 'Mercado', x: 330, y: 170 },
    { id: 'sur', etiqueta: 'Sur', x: 230, y: 285 },
  ],
  aristas: [
    { de: 'puerto', a: 'norte', peso: 6 },
    { de: 'puerto', a: 'oeste', peso: 7 },
    { de: 'puerto', a: 'centro', peso: 8 },
    { de: 'norte', a: 'parque', peso: 7 },
    { de: 'norte', a: 'centro', peso: 5 },
    { de: 'parque', a: 'colinas', peso: 9 },
    { de: 'parque', a: 'mercado', peso: 6 },
    { de: 'centro', a: 'mercado', peso: 4, avenida: true },
    { de: 'centro', a: 'oeste', peso: 9 },
    { de: 'centro', a: 'sur', peso: 7 },
    { de: 'mercado', a: 'colinas', peso: 5 },
    { de: 'mercado', a: 'sur', peso: 8 },
    { de: 'oeste', a: 'sur', peso: 12 },
  ],
};

// DAG de 8 paquetes. La arista va de la dependencia al paquete que la necesita (libc → zlib: libc va primero).
export const DEPENDENCIAS_PAQUETES: GrafoDef = {
  id: 'dependencias-paquetes', ancho: 360, alto: 400, dirigido: true, forma: 'rect',
  nodos: [
    { id: 'libc', etiqueta: 'libc', x: 180, y: 38, w: 64 },
    { id: 'zlib', etiqueta: 'zlib', x: 100, y: 125, w: 64 },
    { id: 'openssl', etiqueta: 'openssl', x: 260, y: 125, w: 78 },
    { id: 'python', etiqueta: 'python', x: 100, y: 212, w: 72 },
    { id: 'curl', etiqueta: 'curl', x: 260, y: 212, w: 64 },
    { id: 'numpy', etiqueta: 'numpy', x: 70, y: 298, w: 70 },
    { id: 'requests', etiqueta: 'requests', x: 220, y: 298, w: 88 },
    { id: 'app', etiqueta: 'app', x: 145, y: 372, w: 64 },
  ],
  aristas: [
    { de: 'libc', a: 'zlib' },
    { de: 'libc', a: 'openssl' },
    { de: 'zlib', a: 'python' },
    { de: 'openssl', a: 'curl' },
    { de: 'python', a: 'numpy' },
    { de: 'python', a: 'requests' },
    { de: 'curl', a: 'requests' },
    { de: 'numpy', a: 'app' },
    { de: 'requests', a: 'app' },
  ],
};

// La arista va de quien llama al servicio llamado (gateway → pagos: el gateway depende de pagos).
export const MICROSERVICIOS_TIENDA: GrafoDef = {
  id: 'microservicios-tienda', ancho: 440, alto: 300, dirigido: true, forma: 'rect',
  nodos: [
    { id: 'gateway', etiqueta: 'gateway', x: 220, y: 42, w: 84 },
    { id: 'catalogo', etiqueta: 'catalogo', x: 46, y: 140, w: 78 },
    { id: 'carrito', etiqueta: 'carrito', x: 132, y: 140, w: 74 },
    { id: 'pagos', etiqueta: 'pagos', x: 220, y: 140, w: 70 },
    { id: 'envios', etiqueta: 'envios', x: 308, y: 140, w: 70 },
    { id: 'usuarios', etiqueta: 'usuarios', x: 394, y: 140, w: 78 },
    { id: 'antifraude', etiqueta: 'antifraude', x: 190, y: 245, w: 92 },
    { id: 'inventario', etiqueta: 'inventario', x: 330, y: 245, w: 92 },
  ],
  aristas: [
    { de: 'gateway', a: 'catalogo' },
    { de: 'gateway', a: 'carrito' },
    { de: 'gateway', a: 'pagos' },
    { de: 'gateway', a: 'envios' },
    { de: 'gateway', a: 'usuarios' },
    { de: 'pagos', a: 'antifraude' },
    { de: 'envios', a: 'inventario' },
  ],
};

// Cadena de 9 nodos y 8 tramos, en serpiente (3 filas de 3) para que entre bien en pantallas angostas.
export const CADENA_RED: GrafoDef = {
  id: 'cadena-red', ancho: 400, alto: 290, dirigido: false, forma: 'rect',
  nodos: [
    { id: 'pc', etiqueta: 'PC', x: 70, y: 50, w: 84 },
    { id: 'placa', etiqueta: 'placa de red', x: 200, y: 50, w: 100 },
    { id: 'cable', etiqueta: 'cable', x: 330, y: 50, w: 84 },
    { id: 'switch', etiqueta: 'switch', x: 330, y: 145, w: 84 },
    { id: 'router', etiqueta: 'router', x: 200, y: 145, w: 84 },
    { id: 'firewall', etiqueta: 'firewall', x: 70, y: 145, w: 84 },
    { id: 'proveedor', etiqueta: 'proveedor', x: 70, y: 240, w: 92 },
    { id: 'dns', etiqueta: 'DNS', x: 200, y: 240, w: 84 },
    { id: 'servidor', etiqueta: 'servidor', x: 330, y: 240, w: 84 },
  ],
  aristas: [
    { de: 'pc', a: 'placa' },
    { de: 'placa', a: 'cable' },
    { de: 'cable', a: 'switch' },
    { de: 'switch', a: 'router' },
    { de: 'router', a: 'firewall' },
    { de: 'firewall', a: 'proveedor' },
    { de: 'proveedor', a: 'dns' },
    { de: 'dns', a: 'servidor' },
  ],
};

export const GRAFOS: Record<IdGrafo, GrafoDef> = {
  'red-ciudad': RED_CIUDAD,
  'dependencias-paquetes': DEPENDENCIAS_PAQUETES,
  'microservicios-tienda': MICROSERVICIOS_TIENDA,
  'cadena-red': CADENA_RED,
};

export const etiquetaDe = (g: GrafoDef, id: string): string => g.nodos.find((n) => n.id === id)?.etiqueta ?? id;
export const indiceDe = (g: GrafoDef, id: string): number => g.nodos.findIndex((n) => n.id === id);
