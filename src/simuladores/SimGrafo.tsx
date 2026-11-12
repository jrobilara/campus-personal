// SimGrafo (SIMULADORES.md §2.11): grafos con posiciones fijas y cinco modos (recorrido, camino mínimo,
// orden topológico, propagación de fallas y búsqueda de una falla). Los algoritmos viven en grafo/algoritmos.ts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Boton, Botones, Interruptor, Leyenda, Lecturas, Selector, Slider, useBucle, useVisible } from './ui';
import { num } from './formato';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimGrafo } from './props';
import { GRAFOS, etiquetaDe, type GrafoDef } from './grafo/grafos';
import {
  busquedaInicial, dependenciasPendientes, dijkstra, disponibles, distanciaDesdeFalla, encontrada, estadosServicios,
  minimoTeorico, nodoEnLaMitad, pesoEfectivo, predecesores, probarNodo, recorridoPasos, tramoDeFalla, tramosDe,
  type TipoRecorrido,
} from './grafo/algoritmos';
import { Arista, Lienzo, NodoSvg } from './grafo/dibujo';

const lista = (g: GrafoDef, ids: readonly string[], sep = ', ') => (ids.length ? ids.map((i) => etiquetaDe(g, i)).join(sep) : '—');
const minutos = (n: number) => num(n, Number.isInteger(n) ? 0 : 1);

export default function SimGrafo(props: PropsSimGrafo) {
  const g = GRAFOS[props.grafo];
  switch (props.modo) {
    case 'recorrido': return <Recorrido g={g} />;
    case 'camino-minimo': return <CaminoMinimo g={g} />;
    case 'orden-topologico': return <OrdenTopologico g={g} />;
    case 'propagar-falla': return <PropagarFalla g={g} />;
    case 'buscar-falla': return <BuscarFalla g={g} semilla={props.semilla ?? 42} />;
  }
}

// ───────────────────────── recorrido BFS / DFS ─────────────────────────

function Recorrido({ g }: { g: GrafoDef }) {
  const [tipo, setTipo] = useState<TipoRecorrido>('bfs');
  const [inicio, setInicio] = useState('centro');
  const [paso, setPaso] = useState(0);
  const [auto, setAuto] = useState(false);
  const menos = useMenosMovimiento();
  const raiz = useRef<HTMLDivElement>(null);
  const visible = useVisible(raiz);
  const acum = useRef(0);

  const pasos = useMemo(() => recorridoPasos(g, inicio, tipo), [g, inicio, tipo]);
  const ultimo = pasos.length - 1;
  const p = Math.min(paso, ultimo);
  const est = pasos[p]!;
  const fin = p >= ultimo;

  useBucle((dt) => {
    acum.current += dt;
    if (acum.current >= 0.8) { acum.current = 0; setPaso((x) => Math.min(x + 1, ultimo)); }
  }, { pausado: !auto || fin, visible });
  useEffect(() => { if (fin && auto) setAuto(false); }, [fin, auto]);

  const reiniciar = (nuevo?: { inicio?: string; tipo?: TipoRecorrido }) => {
    setPaso(0); setAuto(false); acum.current = 0;
    if (nuevo?.inicio) setInicio(nuevo.inicio);
    if (nuevo?.tipo) setTipo(nuevo.tipo);
  };
  const alAuto = () => {
    if (fin) { setPaso(0); acum.current = 0; setAuto(true); } else setAuto(!auto);
  };

  const nuevoEnFrontera = p > 0 ? est.frontera.filter((n) => !pasos[p - 1]!.frontera.includes(n)) : [];
  const mensaje = p === 0
    ? `Nodo inicial: ${etiquetaDe(g, inicio)}. Tocá “Paso” o “Auto”; para cambiar el inicio, tocá otro barrio.`
    : `${fin ? 'Terminó. ' : ''}Se visitó ${etiquetaDe(g, est.actual!)}${nuevoEnFrontera.length ? ` y se ${tipo === 'bfs' ? 'encoló' : 'apiló'}: ${lista(g, nuevoEnFrontera)}` : ' (no hay vecinos nuevos)'}.`;

  const hijos = Object.entries(est.padre).filter(([v]) => est.visitados.includes(v) || est.frontera.includes(v));
  return (
    <div className="sim-cuerpo sg" ref={raiz}>
      <div className="sg-envuelto">
        <Lienzo g={g} etiqueta="Mapa de ocho barrios con minutos de viaje">
          {g.aristas.map((e) => {
            const enArbol = hijos.some(([v, u]) => (e.de === u && e.a === v) || (e.a === u && e.de === v));
            return <Arista key={`${e.de}-${e.a}`} g={g} arista={e} clase={enArbol ? 'arbol' : ''} rotulo={String(e.peso)} />;
          })}
          {g.nodos.map((n) => {
            const visitado = est.visitados.includes(n.id);
            const enFrontera = est.frontera.includes(n.id);
            const clase = [visitado && 'visitado', est.actual === n.id && 'actual', enFrontera && 'frontera', inicio === n.id && 'inicio']
              .filter(Boolean).join(' ');
            const estadoTxt = visitado ? 'visitado' : enFrontera ? 'en la frontera' : 'sin descubrir';
            return (
              <NodoSvg
                key={n.id} g={g} nodo={n} clase={clase} presionado={inicio === n.id}
                aria={`${n.etiqueta}, ${estadoTxt}${inicio === n.id ? ', nodo inicial' : ''}. Elegir como nodo inicial.`}
                onActivar={() => reiniciar({ inicio: n.id })}
                insignia={visitado ? est.visitados.indexOf(n.id) + 1 : undefined}
              />
            );
          })}
        </Lienzo>

        <div className="sg-lado">
          <div className="sg-frontera" data-tipo={tipo}>
            <h4 className="sg-frontera-t">{tipo === 'bfs' ? 'Cola (sale el de la izquierda)' : 'Pila (sale el de arriba)'}</h4>
            <ul className={`sg-fichas ${tipo === 'bfs' ? 'cola' : 'pila'}`} aria-label={tipo === 'bfs' ? 'Cola de nodos por visitar' : 'Pila de nodos por visitar'}>
              <AnimatePresence initial={false} mode="popLayout">
                {est.frontera.map((id, i) => (
                  <motion.li
                    key={id} layout={!menos}
                    initial={menos ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    exit={menos ? { opacity: 0 } : { opacity: 0, scale: 0.6 }} transition={{ duration: menos ? 0 : 0.25 }}
                    className={`sg-ficha${i === 0 ? ' proxima' : ''}`}
                  >
                    {etiquetaDe(g, id)}
                  </motion.li>
                ))}
              </AnimatePresence>
              {est.frontera.length === 0 && <li className="sg-vacia">{fin ? 'vacía: no queda nada por visitar' : 'vacía'}</li>}
            </ul>
          </div>
          <Leyenda items={[
            { color: 'var(--color-area)', texto: 'Visitado (número = orden)' },
            { color: 'var(--marca)', texto: 'Recién visitado' },
            { color: 'var(--aviso)', texto: 'En la frontera' },
          ]} />
        </div>
      </div>

      <div className="sim-controles">
        <Selector
          etiqueta="Recorrido" valor={tipo} clave="tipo"
          opciones={[{ valor: 'bfs', texto: 'BFS: a lo ancho (cola)' }, { valor: 'dfs', texto: 'DFS: a lo hondo (pila)' }]}
          onChange={(v) => reiniciar({ tipo: v })}
        />
        <Botones>
          <Boton clave="paso" onClick={() => { setAuto(false); setPaso(Math.min(p + 1, ultimo)); }} deshabilitado={fin}>Paso</Boton>
          <Boton clave="auto" onClick={alAuto} activo={auto && !fin}>{auto && !fin ? 'Pausar' : 'Auto'}</Boton>
          <Boton clave="reiniciar" onClick={() => reiniciar()}>Reiniciar</Boton>
        </Botones>
      </div>
      <p className="sim-nota sg-estado" role="status">{mensaje}</p>
      <Lecturas items={[
        { clave: 'orden-visita', etiqueta: 'Orden de visita', valor: lista(g, est.visitados) },
        { clave: 'en-frontera', etiqueta: tipo === 'bfs' ? 'En la cola' : 'En la pila', valor: lista(g, est.frontera) },
      ]} />
    </div>
  );
}

// ───────────────────────── camino mínimo (Dijkstra) ─────────────────────────

function CaminoMinimo({ g }: { g: GrafoDef }) {
  const [origen, setOrigen] = useState('oeste');
  const [destino, setDestino] = useState('colinas');
  const [eligiendo, setEligiendo] = useState<'origen' | 'destino'>('origen');
  const [factor, setFactor] = useState(1);
  /** null = se muestra el resultado completo */
  const [paso, setPaso] = useState<number | null>(null);
  const menos = useMenosMovimiento();

  const r = useMemo(() => dijkstra(g, origen, destino, factor), [g, origen, destino, factor]);
  const ultimo = r.pasos.length - 1;
  const p = paso === null ? ultimo : Math.min(paso, ultimo);
  const enCurso = paso !== null && p < ultimo;
  const est = r.pasos[p]!;
  const enCamino = new Set(r.camino);
  const caminoCompleto = !enCurso;
  const tramosCamino = new Set(r.camino.slice(1).map((v, i) => `${r.camino[i]}|${v}`));
  const esTramo = (de: string, a: string) => tramosCamino.has(`${de}|${a}`) || tramosCamino.has(`${a}|${de}`);

  const elegir = (id: string) => {
    if (eligiendo === 'origen') { setOrigen(id); setEligiendo('destino'); } else { setDestino(id); setEligiendo('origen'); }
    setPaso(null);
  };

  const mensaje = enCurso
    ? `Paso ${p} de ${ultimo}: se cierra ${etiquetaDe(g, est.actual ?? origen)}${est.actual ? ` a ${minutos(est.dist[est.actual]!)} min del origen` : ''}. Dijkstra siempre cierra el nodo abierto más cercano.`
    : origen === destino
      ? 'Origen y destino son el mismo barrio: no hay que viajar.'
      : `Camino de menor costo: ${lista(g, r.camino, ' → ')}, ${minutos(r.costo)} min.${factor > 1 ? ` La avenida central cuesta ×${num(factor, 1)}.` : ''}`;

  return (
    <div className="sim-cuerpo sg">
      <div className="sg-envuelto una">
        <Lienzo g={g} etiqueta="Mapa de ocho barrios: elegí origen y destino para ver el camino de menor costo">
          {g.aristas.map((e) => {
            const w = pesoEfectivo(e, factor);
            const marcada = caminoCompleto && esTramo(e.de, e.a);
            const clase = [e.avenida && 'avenida', marcada && 'camino'].filter(Boolean).join(' ');
            return (
              <Arista
                key={`${e.de}-${e.a}-${marcada}-${factor}-${origen}-${destino}`} g={g} arista={e} clase={clase}
                rotulo={minutos(w)} rotuloClase={e.avenida ? 'avenida' : ''} animada={marcada} sinMovimiento={menos}
                grosor={e.avenida ? 2.5 + factor : undefined}
              />
            );
          })}
          {g.nodos.map((n) => {
            const cerrado = est.cerrados.includes(n.id);
            const clase = [
              cerrado && enCurso && 'visitado', caminoCompleto && enCamino.has(n.id) && 'camino',
              n.id === origen && 'origen', n.id === destino && 'destino', est.actual === n.id && enCurso && 'actual',
            ].filter(Boolean).join(' ');
            const d = est.dist[n.id];
            return (
              <NodoSvg
                key={n.id} g={g} nodo={n} clase={clase}
                aria={`${n.etiqueta}${n.id === origen ? ', origen' : ''}${n.id === destino ? ', destino' : ''}. Elegir como ${eligiendo}.`}
                onActivar={() => elegir(n.id)}
                insignia={n.id === origen ? 'A' : n.id === destino ? 'B' : undefined}
                sub={enCurso && d !== undefined ? `${minutos(d)} min${cerrado ? ' ✓' : ''}` : undefined}
                subClase={cerrado ? 'cerrado' : ''}
              />
            );
          })}
        </Lienzo>
      </div>
      <Leyenda items={[
        { color: 'var(--color-area)', texto: 'Camino de menor costo' },
        { color: 'var(--aviso)', texto: 'Avenida central (el tráfico la encarece)' },
        { color: 'var(--marca)', texto: 'Origen (A) y destino (B)' },
      ]} />

      <div className="sim-controles">
        <div className="sim-control">
          <span className="etiqueta">El próximo clic en el mapa elige…</span>
          <Botones>
            <Boton clave="elegir-origen" activo={eligiendo === 'origen'} onClick={() => setEligiendo('origen')}>el origen (A)</Boton>
            <Boton clave="elegir-destino" activo={eligiendo === 'destino'} onClick={() => setEligiendo('destino')}>el destino (B)</Boton>
          </Botones>
        </div>
        <Slider
          etiqueta="Tráfico en la avenida central" valor={factor} min={1} max={5} paso={0.5} clave="trafico"
          formato={(v) => `×${num(v, 1)}`} onChange={(v) => setFactor(v)}
        />
        <Botones>
          <Boton clave="paso" onClick={() => setPaso(paso === null ? 1 : Math.min(paso + 1, ultimo))} deshabilitado={paso !== null && p >= ultimo}>Paso</Boton>
          <Boton clave="resultado" onClick={() => setPaso(null)} deshabilitado={paso === null}>Ver el resultado</Boton>
        </Botones>
      </div>
      <p className="sim-nota sg-estado" role="status">{mensaje}</p>
      <Lecturas items={[
        { clave: 'costo', etiqueta: 'Costo del camino', valor: minutos(r.costo), unidad: 'min' },
        { clave: 'camino', etiqueta: 'Camino', valor: lista(g, r.camino, ' → ') },
      ]} />
    </div>
  );
}

// ───────────────────────── orden topológico (Kahn) ─────────────────────────

function OrdenTopologico({ g }: { g: GrafoDef }) {
  const [orden, setOrden] = useState<string[]>([]);
  const [aviso, setAviso] = useState('');
  const disp = disponibles(g, orden);
  const completo = orden.length === g.nodos.length;

  const instalar = (id: string) => {
    setOrden((o) => [...o, id]);
    setAviso(`Se instaló ${etiquetaDe(g, id)}.`);
  };
  const tocar = (id: string) => {
    if (orden.includes(id)) { setAviso(`${etiquetaDe(g, id)} ya está instalado (lugar ${orden.indexOf(id) + 1}).`); return; }
    if (!disp.includes(id)) {
      const faltan = predecesores(g, id).filter((x) => !orden.includes(x));
      setAviso(`${etiquetaDe(g, id)} todavía no se puede instalar: antes necesita ${lista(g, faltan)}.`);
      return;
    }
    instalar(id);
  };

  return (
    <div className="sim-cuerpo sg">
      <div className="sg-envuelto una">
        <Lienzo g={g} etiqueta="Dependencias entre ocho paquetes: cada flecha va del paquete que se instala antes al que lo necesita">
          {g.aristas.map((e) => (
            <Arista key={`${e.de}-${e.a}`} g={g} arista={e} clase={orden.includes(e.de) ? 'cumplida' : ''} />
          ))}
          {g.nodos.map((n) => {
            const instalado = orden.includes(n.id);
            const libre = disp.includes(n.id);
            const falta = dependenciasPendientes(g, n.id, orden);
            const estado = instalado ? 'instalado' : libre ? 'disponible' : 'bloqueado';
            return (
              <NodoSvg
                key={n.id} g={g} nodo={n} clase={estado}
                aria={`${n.etiqueta}, ${instalado ? `instalado, lugar ${orden.indexOf(n.id) + 1}` : libre ? 'disponible para instalar' : `bloqueado, le faltan ${falta} dependencias`}.`}
                onActivar={() => tocar(n.id)}
                insignia={instalado ? orden.indexOf(n.id) + 1 : undefined}
                sub={instalado ? undefined : libre ? 'disponible' : `espera ${falta}`}
                subClase={libre ? 'bueno' : ''}
              />
            );
          })}
        </Lienzo>
      </div>
      <Leyenda items={[
        { color: 'var(--color-area)', texto: 'Instalado (número = orden)' },
        { color: 'var(--ok)', texto: 'Disponible: sin dependencias pendientes' },
        { color: 'var(--linea-fuerte)', texto: 'Bloqueado: espera dependencias' },
      ]} />
      <div className="sim-controles">
        <Botones>
          <Boton clave="paso" onClick={() => instalar(disp[0]!)} deshabilitado={completo}>Paso</Boton>
          <Boton clave="reiniciar" onClick={() => { setOrden([]); setAviso('Se vació la lista: no hay nada instalado.'); }} deshabilitado={orden.length === 0}>Reiniciar</Boton>
        </Botones>
        <p className="sim-nota">“Paso” instala el primero disponible; también podés tocar vos un paquete disponible.</p>
      </div>
      <p className="sim-nota sg-estado" role="status">
        {completo ? `Listo: los 8 paquetes quedaron instalados y ninguno antes de sus dependencias. ${aviso}` : aviso || 'Solo libc no depende de nada: por ahí se empieza.'}
      </p>
      <Lecturas items={[
        { clave: 'orden', etiqueta: 'Orden de instalación', valor: lista(g, orden) },
        { clave: 'disponibles', etiqueta: 'Disponibles ahora', valor: lista(g, disp) },
      ]} />
    </div>
  );
}

// ───────────────────────── propagar una falla ─────────────────────────

function PropagarFalla({ g }: { g: GrafoDef }) {
  const [tirados, setTirados] = useState<string[]>([]);
  const [protegido, setProtegido] = useState(false);
  const menos = useMenosMovimiento();
  const set = useMemo(() => new Set(tirados), [tirados]);
  const estados = useMemo(() => estadosServicios(g, set, protegido), [g, set, protegido]);
  const dist = useMemo(() => distanciaDesdeFalla(g, set), [g, set]);
  const caidos = Object.values(estados).filter((e) => e === 'caído').length;
  const degradados = Object.values(estados).filter((e) => e === 'degradado').length;
  const gateway = estados.gateway!;

  const alternar = (id: string) => setTirados((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const clases = { ok: 'ok', degradado: 'deg', 'caído': 'caido' } as const;

  const afectados = Object.entries(estados).filter(([id, e]) => e !== 'ok' && !set.has(id)).map(([id]) => id);
  const mensaje = tirados.length === 0
    ? 'Todo anda. Tocá un servicio para tirarlo y mirá hasta dónde llega la falla.'
    : `Tirado${tirados.length > 1 ? 's' : ''}: ${lista(g, tirados)}. ${afectados.length
        ? `${protegido ? 'Con timeouts y circuit breaker' : 'Sin protección'}, ${afectados.map((id) => `${etiquetaDe(g, id)} queda ${estados[id]}`).join(' y ')}.`
        : 'Nadie depende de ese servicio, así que no se propaga.'}`;

  return (
    <div className="sim-cuerpo sg">
      <div className="sg-envuelto una">
        <Lienzo g={g} etiqueta="Servicios de una tienda: el gateway llama a cinco servicios y estos a otros dos">
          {g.aristas.map((e) => (
            <Arista key={`${e.de}-${e.a}`} g={g} arista={e} clase={estados[e.a] === 'caído' ? 'caida' : estados[e.a] === 'degradado' ? 'deg' : ''} />
          ))}
          {g.nodos.map((n) => {
            const e = estados[n.id]!;
            const d = dist[n.id];
            return (
              <NodoSvg
                key={n.id} g={g} nodo={n} clase={clases[e]} presionado={set.has(n.id)}
                aria={`${n.etiqueta}: ${e}. ${set.has(n.id) ? 'Tocá para levantarlo.' : 'Tocá para tirarlo.'}`}
                onActivar={() => alternar(n.id)}
                sub={e} subClase={clases[e]}
                demora={menos || d === undefined ? 0 : d * 0.3}
              />
            );
          })}
        </Lienzo>
      </div>
      <Leyenda items={[
        { color: 'var(--ok)', texto: 'ok' },
        { color: 'var(--aviso)', texto: 'degradado (anda con funciones recortadas)' },
        { color: 'var(--mal)', texto: 'caído' },
      ]} />
      <div className="sim-controles">
        <Interruptor etiqueta="Con timeouts y circuit breaker" activo={protegido} onChange={setProtegido} clave="proteccion" />
        <Botones>
          <Boton clave="levantar" onClick={() => setTirados([])} deshabilitado={tirados.length === 0}>Levantar todo</Boton>
        </Botones>
      </div>
      <p className="sim-nota sg-estado" role="status">{mensaje}</p>
      <Lecturas items={[
        { clave: 'caidos', etiqueta: 'Servicios caídos', valor: caidos, tono: caidos > 0 ? 'alerta' : undefined },
        { clave: 'degradados', etiqueta: 'Servicios degradados', valor: degradados },
        { clave: 'gateway', etiqueta: 'Gateway', valor: gateway, tono: gateway === 'ok' ? 'buena' : 'alerta' },
      ]} />
    </div>
  );
}

// ───────────────────────── buscar una falla escondida ─────────────────────────

function BuscarFalla({ g, semilla }: { g: GrafoDef; semilla: number }) {
  const tramos = tramosDe(g.nodos.length);
  const [intento, setIntento] = useState(0);
  const [bus, setBus] = useState(() => busquedaInicial(tramos));
  const [aviso, setAviso] = useState('');
  const falla = useMemo(() => tramoDeFalla(semilla, intento, tramos), [semilla, intento, tramos]);
  const hallada = encontrada(bus);
  const minimo = minimoTeorico(tramos);

  const probar = (k: number) => {
    if (hallada) { setAviso('Ya encontraste la falla: tocá “Nueva falla” para buscar otra.'); return; }
    const nuevo = probarNodo(bus, k, falla);
    setBus(nuevo);
    const llega = falla >= k;
    if (encontrada(nuevo)) {
      setAviso(`Falla encontrada entre ${etiquetaDe(g, g.nodos[nuevo.lo]!.id)} y ${etiquetaDe(g, g.nodos[nuevo.lo + 1]!.id)}, en ${nuevo.pruebas.length} pruebas (mínimo teórico: ${minimo}).`);
    } else {
      setAviso(llega
        ? `La señal llega hasta ${etiquetaDe(g, g.nodos[k]!.id)}: la falla está más adelante. Quedan ${nuevo.hi - nuevo.lo + 1} tramos posibles.`
        : `La señal no llega a ${etiquetaDe(g, g.nodos[k]!.id)}: la falla está antes. Quedan ${nuevo.hi - nuevo.lo + 1} tramos posibles.`);
    }
  };
  const nueva = () => { setIntento(intento + 1); setBus(busquedaInicial(tramos)); setAviso('Hay una falla nueva escondida en algún tramo.'); };
  const ultimaPrueba = (k: number) => [...bus.pruebas].reverse().find((x) => x.nodo === k);

  return (
    <div className="sim-cuerpo sg">
      <div className="sg-envuelto una">
        <Lienzo g={g} etiqueta="Cadena de nueve equipos, de la PC al servidor, con una falla escondida en uno de los ocho tramos">
          {g.aristas.map((e, j) => {
            const clase = hallada && j === bus.lo ? 'falla' : j < bus.lo || j > bus.hi ? 'descartado' : 'sospecha';
            return <Arista key={`${e.de}-${e.a}`} g={g} arista={e} clase={clase} />;
          })}
          {g.nodos.map((n, k) => {
            const u = ultimaPrueba(k);
            return (
              <NodoSvg
                key={n.id} g={g} nodo={n} clase={u ? (u.llega ? 'llega' : 'nollega') : ''}
                aria={`Probar hasta ${n.etiqueta}${u ? `: la última vez ${u.llega ? 'la señal llegaba' : 'la señal no llegaba'}` : ''}.`}
                onActivar={() => probar(k)}
                sub={u ? (u.llega ? '✓ llega' : '✗ no llega') : undefined}
                subClase={u ? (u.llega ? 'bueno' : 'malo') : ''}
              />
            );
          })}
        </Lienzo>
      </div>
      <Leyenda items={[
        { color: 'var(--aviso)', texto: 'Tramo que todavía puede tener la falla' },
        { color: 'var(--linea-fuerte)', texto: 'Tramo descartado' },
        { color: 'var(--mal)', texto: 'Falla encontrada' },
      ]} />
      <div className="sim-controles">
        <p className="sim-nota">Tocá un equipo para “probar hasta acá”: te dice si la señal llega desde la PC hasta ahí.</p>
        <Botones>
          <Boton clave="mitad" onClick={() => probar(nodoEnLaMitad(bus))} deshabilitado={hallada} titulo="Prueba en el equipo que parte en dos los tramos que quedan">Probar en la mitad</Boton>
          <Boton clave="nueva-falla" onClick={nueva}>Nueva falla</Boton>
        </Botones>
      </div>
      <p className="sim-nota sg-estado" role="status">{aviso || 'Hay una falla escondida en un tramo. Probá hasta encontrarla con la menor cantidad de pruebas.'}</p>
      <Lecturas items={[
        { clave: 'pruebas', etiqueta: 'Pruebas hechas', valor: bus.pruebas.length },
        { clave: 'minimo-teorico', etiqueta: 'Mínimo teórico (⌈log₂ 8⌉)', valor: minimo },
        { clave: 'encontrada', etiqueta: 'Falla encontrada', valor: hallada ? 'sí' : 'no', tono: hallada ? 'buena' : undefined },
      ]} />
    </div>
  );
}
