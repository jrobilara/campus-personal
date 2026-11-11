// src/simuladores/props.ts — esquemas Zod de las props de los 12 simuladores (SIMULADORES.md §2).
// No importa `astro:content`: lo usan los envoltorios .astro, la regla I9 y Vitest.
import { z } from 'astro/zod';

const base = {
  consigna: z.string().trim().min(1, 'no puede estar vacía').max(240, 'máximo 240 caracteres'),
  titulo: z.string().trim().min(1).max(80, 'máximo 80 caracteres').optional(),
};
const semilla = z.number().int().optional();
const num = (min: number, max: number) => z.number().min(min).max(max);

// 2.1 SimFuncion
const funcionPreset = z.enum(['cuadratica', 'cubica', 'seno', 'exponencial', 'logistica', 'doble-pozo', 'error-cuadratico']);
export const propsSimFuncion = z.discriminatedUnion('modo', [
  z.strictObject({
    ...base, semilla, modo: z.literal('tangente'), funcion: funcionPreset,
    x0: z.number().optional(), mostrarSecante: z.boolean().optional(),
    rango: z.tuple([z.number(), z.number()]).optional(),
  }),
  z.strictObject({
    ...base, semilla, modo: z.literal('descenso'), funcion: z.enum(['cuadratica', 'doble-pozo', 'error-cuadratico']),
    x0: z.number().optional(), tasa: z.number().positive().optional(), pasosMax: z.number().int().min(1).max(500).optional(),
  }),
  z.strictObject({
    ...base, semilla, modo: z.literal('senal'),
    componentes: z.array(z.strictObject({ frecuencia: num(1, 20), amplitud: num(0, 2) })).min(1).max(3),
    ruido: num(0, 1).optional(), muestreo: z.boolean().optional(),
    frecuenciaMuestreo: num(2, 60).optional(), filtro: z.boolean().optional(),
  }),
]);

// 2.2 SimTransformacion2D
const fila = z.tuple([z.number(), z.number()]);
export const propsSimTransformacion2D = z.strictObject({
  ...base,
  preset: z.enum(['identidad', 'rotacion-90', 'escala', 'cizalla', 'reflexion', 'proyeccion']).optional(),
  matriz: z.tuple([fila, fila]).optional(),
  editable: z.boolean().optional(),
  mostrarAutovectores: z.boolean().optional(),
  vector: z.tuple([z.number(), z.number()]).optional(),
});

// 2.3 SimDistribucion
export const propsSimDistribucion = z.strictObject({
  ...base,
  distribucion: z.enum(['binomial', 'poisson', 'normal', 'exponencial', 'uniforme']),
  parametros: z
    .strictObject({
      n: z.number().int().min(1).max(100).optional(), p: num(0, 1).optional(), lambda: num(0.1, 20).optional(),
      mu: num(-5, 5).optional(), sigma: num(0.1, 5).optional(), a: z.number().optional(), b: z.number().optional(),
    })
    .optional(),
  mostrarIntervalo: z.boolean().optional(),
  aproximacionNormal: z.boolean().optional(),
  permitirCambiarDistribucion: z.boolean().optional(),
});

// 2.4 SimInferencia
const poblacion = z.enum(['uniforme', 'exponencial', 'bimodal', 'dado']);
export const propsSimInferencia = z.discriminatedUnion('modo', [
  z.strictObject({ ...base, semilla, modo: z.literal('tcl'), poblacion, n: z.number().int().min(1).max(100).optional() }),
  z.strictObject({
    ...base, semilla, modo: z.literal('intervalos'), poblacion, n: z.number().int().min(2).max(100).optional(),
    confianza: z.union([z.literal(0.9), z.literal(0.95), z.literal(0.99)]).optional(),
  }),
  z.strictObject({
    ...base, semilla, modo: z.literal('ab'), tasaA: num(0.01, 0.99).optional(), tasaB: num(0.01, 0.99).optional(),
    nPorGrupo: z.number().int().min(100).max(20000).optional(),
    alfa: z.union([z.literal(0.01), z.literal(0.05), z.literal(0.1)]).optional(),
  }),
]);

// 2.5 SimBayes
export const propsSimBayes = z.strictObject({
  ...base,
  prevalencia: num(0.001, 0.5).optional(),
  sensibilidad: num(0.5, 0.999).optional(),
  especificidad: num(0.5, 0.999).optional(),
  poblacion: z.union([z.literal(1000), z.literal(10000)]).optional(),
  contexto: z.enum(['medico', 'alerta-seguridad', 'spam']).optional(),
});

// 2.6 SimDatos
const vista = z.enum(['tabla', 'histograma', 'caja', 'barras', 'lineas', 'dispersion', 'torta']);
export const propsSimDatos = z
  .strictObject({
    ...base, semilla,
    dataset: z.enum(['tickets-sucios', 'ventas-mensuales', 'latencias', 'anscombe', 'confusora-temperatura', 'horas-y-notas']),
    vistas: z.array(vista).min(1).max(4),
    vistaInicial: vista.optional(),
    limpieza: z.boolean().optional(),
    regresion: z.boolean().optional(),
    veredictos: z
      .partialRecord(vista, z.strictObject({ nota: z.enum(['bien', 'regular', 'mal']), porque: z.string().trim().min(1) }))
      .optional(),
  })
  .superRefine((p, ctx) => {
    if (p.vistaInicial && !p.vistas.includes(p.vistaInicial)) {
      ctx.addIssue({ code: 'custom', path: ['vistaInicial'], message: 'vistaInicial tiene que estar en vistas' });
    }
  });

// 2.7 SimTablaSQL
export const propsSimTablaSQL = z
  .strictObject({
    ...base,
    tabla: z.enum(['ventas', 'tickets', 'logins']),
    operacion: z.enum(['group-by', 'ventana']),
    funcion: z.enum(['count', 'sum', 'avg', 'max', 'row_number', 'rank', 'lag', 'suma-acumulada', 'promedio-movil']).optional(),
    particionarPor: z.string().min(1).optional(),
    ordenarPor: z.string().min(1).optional(),
    marco: z.number().int().min(1).max(5).optional(),
    editable: z.boolean().optional(),
  })
  .superRefine((p, ctx) => {
    if (!p.funcion) return;
    const agregadas = ['count', 'sum', 'avg', 'max'];
    const ok = p.operacion === 'group-by' ? agregadas.includes(p.funcion) : !agregadas.includes(p.funcion);
    if (!ok) {
      ctx.addIssue({
        code: 'custom', path: ['funcion'],
        message: p.operacion === 'group-by' ? 'group-by admite count, sum, avg o max' : 'ventana admite row_number, rank, lag, suma-acumulada o promedio-movil',
      });
    }
  });

// 2.8 SimFlujo
export const propsSimFlujo = z.discriminatedUnion('modo', [
  z.strictObject({
    ...base, semilla, modo: z.literal('balanceador'),
    servidores: z.number().int().min(1).max(8).optional(),
    algoritmo: z.enum(['round-robin', 'menos-conexiones', 'aleatorio']).optional(),
    tasaLlegada: z.number().positive().optional(), capacidadPorServidor: z.number().positive().optional(),
    servidorLento: z.boolean().optional(), cache: z.boolean().optional(), aciertoCache: num(0, 0.95).optional(),
  }),
  z.strictObject({
    ...base, semilla, modo: z.literal('cola'),
    tasaLlegada: z.number().positive().optional(), consumidores: z.number().int().min(1).optional(),
    tiempoProceso: z.number().positive().optional(), capacidadCola: z.number().int().min(1).optional(),
    etiquetas: z.enum(['mensajes', 'tickets']).optional(), slaMinutos: z.number().positive().optional(), kb: z.boolean().optional(),
  }),
  z.strictObject({ ...base, semilla, modo: z.literal('sincrono-vs-asincrono'), latenciaServicioB: num(50, 3000).optional() }),
  z.strictObject({
    ...base, semilla, modo: z.literal('cadena'),
    saltos: z.number().int().min(1).max(8).optional(), latenciaPorSalto: z.number().positive().optional(),
    disponibilidadPorServicio: num(0.9, 0.99999).optional(),
  }),
]);

// 2.9 SimMaquinaEstados
export const propsSimMaquinaEstados = z.strictObject({
  ...base, semilla,
  preset: z.enum(['circuit-breaker', 'unidad-systemd', 'proceso-linux', 'contenedor-docker', 'incidente-itil']),
  mostrarLog: z.boolean().optional(),
});

// 2.10 SimSerieTemporal
export const propsSimSerieTemporal = z.discriminatedUnion('modo', [
  z.strictObject({
    ...base, semilla, modo: z.literal('alertas'),
    escenario: z.enum(['pico-breve', 'fuga-memoria', 'disco-llenandose', 'carga-sostenida']),
    nucleos: z.number().int().min(1).max(64).optional(), umbral: z.number().optional(), duracionMin: num(0, 30).optional(),
  }),
  z.strictObject({
    ...base, semilla, modo: z.literal('respaldo'),
    frecuenciaHoras: num(1, 48).optional(), rpoObjetivoHoras: z.number().positive().optional(),
    rtoObjetivoHoras: z.number().positive().optional(), duracionRestauracionHoras: num(0.5, 12).optional(),
    respaldoProbado: z.boolean().optional(),
  }),
]);

// 2.11 SimGrafo
export const propsSimGrafo = z
  .strictObject({
    ...base, semilla,
    grafo: z.enum(['red-ciudad', 'dependencias-paquetes', 'microservicios-tienda', 'cadena-red']),
    modo: z.enum(['recorrido', 'camino-minimo', 'orden-topologico', 'propagar-falla', 'buscar-falla']),
  })
  .superRefine((p, ctx) => {
    const validos: Record<string, string[]> = {
      'red-ciudad': ['recorrido', 'camino-minimo'],
      'dependencias-paquetes': ['orden-topologico'],
      'microservicios-tienda': ['propagar-falla'],
      'cadena-red': ['buscar-falla'],
    };
    if (!validos[p.grafo]!.includes(p.modo)) {
      ctx.addIssue({ code: 'custom', path: ['modo'], message: `el grafo "${p.grafo}" admite los modos: ${validos[p.grafo]!.join(', ')}` });
    }
  });

// 2.12 SimMatrizPrioridad
const sla = z.strictObject({ respuestaMin: z.number().positive(), resolucionMin: z.number().positive() });
export const propsSimMatrizPrioridad = z.strictObject({
  ...base,
  tickets: z.enum(['mesa-lunes', 'caida-parcial']).optional(),
  slas: z.strictObject({ P1: sla, P2: sla, P3: sla, P4: sla, P5: sla }).optional(),
});

export const ESQUEMAS_SIMULADORES = {
  SimFuncion: propsSimFuncion,
  SimTransformacion2D: propsSimTransformacion2D,
  SimDistribucion: propsSimDistribucion,
  SimInferencia: propsSimInferencia,
  SimBayes: propsSimBayes,
  SimDatos: propsSimDatos,
  SimTablaSQL: propsSimTablaSQL,
  SimFlujo: propsSimFlujo,
  SimMaquinaEstados: propsSimMaquinaEstados,
  SimSerieTemporal: propsSimSerieTemporal,
  SimGrafo: propsSimGrafo,
  SimMatrizPrioridad: propsSimMatrizPrioridad,
} as const;

export type NombreSimulador = keyof typeof ESQUEMAS_SIMULADORES;
/** Catálogo de nombres para la regla I9 de integridad. */
export const NOMBRES_SIMULADORES = Object.keys(ESQUEMAS_SIMULADORES) as NombreSimulador[];

/**
 * Valida las props de un simulador. Si son inválidas, tira un Error con el archivo del tema,
 * el simulador y la prop (`[contenido] <archivo> → <Sim>.<prop>: …`).
 */
export function validarPropsSimulador(nombre: NombreSimulador, props: unknown, archivo = 'tema.mdx'): Record<string, unknown> {
  const r = ESQUEMAS_SIMULADORES[nombre].safeParse(props);
  if (r.success) return r.data as Record<string, unknown>;
  const lineas = r.error.issues.map((i) => {
    const prop = i.path.length ? i.path.join('.') : '(props)';
    return `[contenido] ${archivo} → <${nombre}> prop "${prop}": ${i.message}`;
  });
  throw new Error(lineas.join('\n'));
}
