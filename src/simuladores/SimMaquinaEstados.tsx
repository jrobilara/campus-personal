// SimMaquinaEstados (SIMULADORES.md §2.9): diagrama de estados con el estado actual resaltado, eventos válidos, log con hora simulada y controles propios de cada preset.
// La lógica de cada máquina vive en ./maquina-estados/*.ts (módulos puros, con tests); acá solo se dibuja.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Boton, Botones, Interruptor, Lecturas, Leyenda, Selector, Slider, useBucle, useVisible } from './ui';
import { num } from './formato';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimMaquinaEstados } from './props';
import { armarPlano } from './maquina-estados/geometria';
import { ARRANQUE_OK_MS, type EstadoDocker } from './maquina-estados/docker';
import { ESPERA_MS, MAQUINAS, aplicarEvento, avanzarSim, cambiarCfg, crearSim, eventoValido, lecturasDe, type Sim } from './maquina-estados/motor';
import { RAFAGA, VENTANA_MS, muertesRecientes, type EstadoSystemd } from './maquina-estados/systemd';
import { hora, type NodoDef } from './maquina-estados/tipos';

const ALERTA = new Set(['failed', 'abierto', 'zombie', 'reabierto', 'restarting']);
const ANCHO_ANGOSTO = 540;

export default function SimMaquinaEstados(props: PropsSimMaquinaEstados) {
  const { preset, mostrarLog = true, semilla = 42 } = props;
  const def = MAQUINAS[preset];
  const [sim, setSim] = useState<Sim>(() => crearSim(preset, semilla));
  const [pausado, setPausado] = useState(false);
  // Marca de hidratación: el HTML del servidor ya muestra todo, pero recién con esto los controles responden.
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  const raiz = useRef<HTMLDivElement>(null);
  const visible = useVisible(raiz);

  useBucle((dt) => setSim((s) => avanzarSim(preset, s, Math.round(dt * 1000))), {
    pausado: pausado || !def.tiempoReal,
    visible,
  });

  const evento = (id: string) => setSim((s) => aplicarEvento(preset, s, id));
  const lecturas = lecturasDe(preset, sim);
  const estado = String(sim.e.estado);

  return (
    <div className="sim-cuerpo sm" ref={raiz} data-preset={preset} data-listo={listo ? 'true' : 'false'}>
      <div className="sm-grilla">
        <div className="sm-izq">
          <Diagrama preset={preset} sim={sim} />
          {def.nota && <p className="sim-nota sm-nota">{def.nota}</p>}
          {def.ventana && <VentanaPedidos preset={preset} sim={sim} />}
        </div>
        <div className="sm-der">
          <Lecturas items={lecturas} />
          {def.controles.length > 0 && (
            <div className="sim-controles sm-controles">
              {def.controles.map((c) => {
                if (c.tipo === 'slider') {
                  const v = Number(sim.cfg[c.clave]);
                  return (
                    <Slider
                      key={c.clave} clave={c.clave} etiqueta={c.etiqueta} min={c.min} max={c.max} paso={c.paso}
                      valor={v} formato={(x) => `${num(x, 0)} ${c.unidad}`}
                      onChange={(x) => setSim((s) => cambiarCfg(s, c.clave, x))}
                    />
                  );
                }
                if (c.tipo === 'toggle') {
                  return (
                    <Interruptor
                      key={c.clave} clave={c.clave} etiqueta={c.etiqueta} activo={Boolean(sim.cfg[c.clave])}
                      onChange={(x) => setSim((s) => cambiarCfg(s, c.clave, x))}
                    />
                  );
                }
                return (
                  <Selector
                    key={c.clave} clave={c.clave} etiqueta={c.etiqueta} valor={String(sim.cfg[c.clave])} opciones={c.opciones}
                    onChange={(x) => setSim((s) => cambiarCfg(s, c.clave, x))}
                  />
                );
              })}
            </div>
          )}
          {preset === 'contenedor-docker' && <MedidorUptime e={sim.e as EstadoDocker} />}
          {preset === 'unidad-systemd' && <MedidorMuertes e={sim.e as EstadoSystemd} limite={Boolean(sim.cfg.limite)} />}
          {def.eventos.length > 0 && (
            <div className="sm-eventos" role="group" aria-label="Eventos">
              <p className="sm-sub">Eventos (solo los que valen desde «{estado}»)</p>
              <Botones>
                {def.eventos.map((ev) => (
                  <Boton key={ev.id} clave={`evento-${ev.id}`} deshabilitado={!eventoValido(preset, sim, ev.id)} onClick={() => evento(ev.id)}>
                    {ev.texto}
                  </Boton>
                ))}
              </Botones>
            </div>
          )}
          <Botones>
            {def.tiempoReal && (
              <>
                <Boton clave="pausa" activo={pausado} onClick={() => setPausado((p) => !p)} titulo="Pausa o reanuda el reloj simulado">
                  {pausado ? '▶ Seguir' : '⏸ Pausar'}
                </Boton>
                <Boton clave="esperar" onClick={() => setSim((s) => avanzarSim(preset, s, ESPERA_MS))} titulo="Adelanta el reloj simulado 10 segundos">
                  Esperar 10 s
                </Boton>
              </>
            )}
            <Boton clave="reiniciar" onClick={() => { setSim(crearSim(preset, semilla)); setPausado(false); }} titulo="Vuelve al estado inicial">
              Empezar de nuevo
            </Boton>
          </Botones>
          {def.resumen && <Terminal sim={sim} preset={preset} />}
        </div>
      </div>
      {mostrarLog && <Registro sim={sim} />}
    </div>
  );
}

/* ---------- diagrama ---------- */

function Diagrama({ preset, sim }: { preset: PropsSimMaquinaEstados['preset']; sim: Sim }) {
  const def = MAQUINAS[preset];
  const caja = useRef<HTMLDivElement>(null);
  const [angosto, setAngosto] = useState(false);
  const menos = useMenosMovimiento();

  useEffect(() => {
    const el = caja.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => setAngosto(el.clientWidth > 0 && el.clientWidth < ANCHO_ANGOSTO);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plano = useMemo(() => armarPlano(def.diagrama, angosto), [def, angosto]);
  const estado = String(sim.e.estado);
  const notas = def.notasNodos?.(sim.e, sim.cfg) ?? {};
  const activa = plano.cajas.find((c) => c.id === estado);
  const ult = sim.ultima;
  const idxViva = ult ? plano.flechas.findIndex((f) => f.de === ult.de && f.a === ult.a) : -1;
  const viva = idxViva >= 0 ? plano.flechas[idxViva] : undefined;
  const nodos = new Map<string, NodoDef>(def.diagrama.nodos.map((n) => [n.id, n]));

  return (
    <div className="sim-lienzo sm-lienzo" ref={caja}>
      <svg
        viewBox={`0 0 ${plano.W} ${plano.H}`} role="img" className="sm-svg"
        aria-label={`Diagrama de estados. Estado actual: ${estado}.`}
      >
        <defs>
          <filter id="sm-sombra" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="currentColor" floodOpacity="0.18" />
          </filter>
        </defs>
        {plano.flechas.map((f, i) => (
          <g key={`${f.de}-${f.a}-${i}`} className={`sm-flecha${i === idxViva ? ' viva' : ''}`} data-flecha={`${f.de}>${f.a}`}>
            <path d={f.d} fill="none" key={i === idxViva ? `v${ult?.k}` : 'n'} />
            <polygon points={f.punta} />
          </g>
        ))}
        {plano.flechas.map((f, i) => {
          const et = def.diagrama.flechas[i]?.etiqueta;
          return et ? <text key={`t${i}`} className="sm-etiqueta" x={f.etiqueta.x} y={f.etiqueta.y} textAnchor="middle" dominantBaseline="middle">{et}</text> : null;
        })}
        {activa && (
          <motion.rect
            className="sm-anillo" rx={13} ry={13} aria-hidden
            initial={false}
            animate={{ x: activa.cx - activa.w / 2 - 5, y: activa.cy - activa.h / 2 - 5, width: activa.w + 10, height: activa.h + 10 }}
            transition={menos ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26 }}
          />
        )}
        {plano.cajas.map((c) => {
          const n = nodos.get(c.id)!;
          const es = c.id === estado;
          const clases = ['sm-nodo', es ? 'activo' : '', es && ALERTA.has(c.id) ? 'alerta' : '', n.fantasma ? 'fantasma' : ''].filter(Boolean).join(' ');
          const x0 = c.cx - c.w / 2, y0 = c.cy - c.h / 2;
          return (
            <g key={c.id} className={clases} data-nodo={c.id} data-activo={es ? 'true' : 'false'} aria-current={es ? 'true' : undefined}>
              <rect x={x0} y={y0} width={c.w} height={c.h} rx={10} ry={10} filter={es ? 'url(#sm-sombra)' : undefined} />
              <NodoTexto n={n} cx={c.cx} cy={c.cy} />
              {notas[c.id] && <text className="sm-nota-nodo" x={c.cx} y={y0 + c.h + 14} textAnchor="middle">{notas[c.id]}</text>}
            </g>
          );
        })}
        {!menos && viva && ult && <Pulso key={ult.k} puntos={viva.puntos} />}
      </svg>
    </div>
  );
}

function NodoTexto({ n, cx, cy }: { n: NodoDef; cx: number; cy: number }) {
  if (n.estilo === 'letra') {
    return (
      <>
        <text className="sm-letra" x={cx} y={cy - 2} textAnchor="middle">{n.lineas[0]}</text>
        <text className="sm-sub-nodo" x={cx} y={cy + 14} textAnchor="middle">{n.lineas[1]}</text>
      </>
    );
  }
  if (n.lineas.length > 1) {
    return (
      <>
        <text className="sm-texto" x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle">{n.lineas[0]}</text>
        <text className="sm-texto" x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle">{n.lineas[1]}</text>
      </>
    );
  }
  return <text className="sm-texto" x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">{n.lineas[0]}</text>;
}

/** Ficha que viaja por la flecha de la última transición. */
function Pulso({ puntos }: { puntos: { x: number; y: number }[] }) {
  return (
    <motion.circle
      className="sm-pulso" r={5.5} aria-hidden
      initial={{ cx: puntos[0]!.x, cy: puntos[0]!.y, opacity: 1 }}
      animate={{ cx: puntos.map((p) => p.x), cy: puntos.map((p) => p.y), opacity: [1, 1, 1, 0] }}
      transition={{ duration: 0.75, ease: 'easeInOut', opacity: { duration: 0.75, times: [0, 0.6, 0.9, 1] } }}
    />
  );
}

/* ---------- piezas de cada preset ---------- */

function VentanaPedidos({ preset, sim }: { preset: PropsSimMaquinaEstados['preset']; sim: Sim }) {
  const v = MAQUINAS[preset].ventana!(sim.e);
  const umbral = Number(sim.cfg.umbral ?? 50);
  return (
    <div className="sm-ventana">
      <p className="sm-sub">Últimos 20 pedidos que llegaron al servicio (umbral: {num(umbral, 0)} % de fallas)</p>
      <div className="sm-pedidos" role="img" aria-label={`${v.filter((x) => x === 'falla').length} fallas entre los últimos ${v.filter((x) => x !== 'vacio').length} pedidos`}>
        {v.map((r, i) => <i key={i} className={`sm-pedido ${r}`} />)}
      </div>
      <Leyenda items={[
        { color: 'var(--ok)', texto: 'respondió bien' },
        { color: 'var(--mal)', texto: 'falló' },
      ]} />
    </div>
  );
}

function MedidorUptime({ e }: { e: EstadoDocker }) {
  const f = Math.min(1, e.uptime / ARRANQUE_OK_MS);
  const listo = e.uptime >= ARRANQUE_OK_MS;
  const corre = e.estado === 'running';
  return (
    <div className="sm-medidor">
      <p className="sm-sub">
        Regla de los 10 s: la política de reinicio solo rige si el contenedor estuvo al menos 10 s en running
      </p>
      <div className={`sm-barra${listo && corre ? ' lista' : ''}`} role="img" aria-label={`Uptime ${num(e.uptime / 1000, 1)} de 10 segundos`}>
        <i style={{ width: `${f * 100}%` }} />
      </div>
      <p className="sim-nota">
        {e.estado === 'running'
          ? listo ? 'Arranque exitoso: si sale con código 1, la política lo reinicia.' : `Todavía no cuenta como arranque exitoso: si sale ahora, queda exited sin reinicio (faltan ${num((ARRANQUE_OK_MS - e.uptime) / 1000, 1)} s).`
          : e.estado === 'paused' ? 'En pausa: el uptime no corre.' : 'El uptime solo corre mientras el contenedor está en running.'}
      </p>
    </div>
  );
}

function MedidorMuertes({ e, limite }: { e: EstadoSystemd; limite: boolean }) {
  const m = muertesRecientes(e);
  return (
    <div className="sm-medidor">
      <p className="sm-sub">Muertes en los últimos {VENTANA_MS / 1000} s simulados{limite ? ` (con ${RAFAGA} la unidad queda failed)` : ' (sin límite de arranques)'}</p>
      <div className="sm-pips" role="img" aria-label={`${m} muertes recientes`}>
        {Array.from({ length: RAFAGA }, (_, i) => <i key={i} className={`sm-pip${i < m ? ' llena' : ''}${!limite ? ' sin-limite' : ''}`} />)}
      </div>
    </div>
  );
}

function Terminal({ sim, preset }: { sim: Sim; preset: PropsSimMaquinaEstados['preset'] }) {
  const r = MAQUINAS[preset].resumen!(sim.e, sim.cfg);
  return (
    <figure className="sm-term" aria-label={r.titulo}>
      <figcaption>$ {r.titulo}</figcaption>
      <pre>{r.lineas.join('\n')}</pre>
    </figure>
  );
}

function Registro({ sim }: { sim: Sim }) {
  const ul = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ul.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sim.log.length]);
  return (
    <div className="sm-registro">
      <p className="sm-sub">Registro (hora simulada)</p>
      <ul className="sim-log" data-registro="log" ref={ul} role="log" aria-label="Registro de transiciones">
        {sim.log.map((l, i) => (
          <li key={i}><span className="sm-hora">{hora(l.t)}</span> {l.texto}</li>
        ))}
      </ul>
    </div>
  );
}

