// SimMatrizPrioridad (SIMULADORES.md §2.12): matriz impacto × urgencia, cola de atención con un solo agente, SLA y reloj.
// La lógica vive en matriz-prioridad/logica.ts (pura y testeada); acá solo se dibuja y se maneja el estado.
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Boton, Botones, Lecturas, Selector } from './ui';
import { useMenosMovimiento } from '../lib/tema';
import type { PropsSimMatrizPrioridad } from './props';
import {
  NIVELES, PRIORIDADES, SLAS_POR_DEFECTO, TICKETS, calcular, clasificacionInicial, duracionCorta, hhmm, mover,
  ordenLlegada, ordenPorPrioridad, prioridadDe, type Clasificaciones, type EstadoTicket, type Nivel, type Slas,
} from './matriz-prioridad/logica';

const NOMBRE_IMPACTO: Record<Nivel, string> = { A: 'Alto', M: 'Medio', B: 'Bajo' };
const NOMBRE_URGENCIA: Record<Nivel, string> = { A: 'Alta', M: 'Media', B: 'Baja' };
const NOTA = 'Matriz de ejemplo; cada organización define la suya.';

function textoEstado(e: EstadoTicket, esProximo: boolean, sla: { respuestaMin: number; resolucionMin: number }) {
  if (e.atendido) {
    const cumplio = !e.incumplido;
    return {
      linea: `Respondido a los ${e.respuestaMin} min, resuelto a los ${e.resolucionMin} min`,
      sello: cumplio ? 'Dentro del SLA' : e.motivo === 'resolucion' ? 'SLA incumplido: resolución' : 'SLA incumplido: respuesta',
      tono: cumplio ? 'ok' : 'mal',
    };
  }
  if (e.incumplido) {
    return { linea: `Esperando; el plazo de respuesta era de ${sla.respuestaMin} min`, sello: 'SLA incumplido: respuesta', tono: 'mal' };
  }
  return { linea: `${esProximo ? 'Es el próximo. ' : ''}Esperando; responder antes de los ${sla.respuestaMin} min`, sello: 'En plazo', tono: 'neutro' };
}

export default function SimMatrizPrioridad(props: PropsSimMatrizPrioridad) {
  const conjunto = props.tickets ?? 'mesa-lunes';
  const slas: Slas = (props.slas as Slas | undefined) ?? SLAS_POR_DEFECTO;
  const tickets = TICKETS[conjunto];
  const menos = useMenosMovimiento();

  const [cls, setCls] = useState<Clasificaciones>(() => clasificacionInicial(conjunto));
  const [cola, setCola] = useState<string[]>(() => ordenLlegada(conjunto));
  const [atendidos, setAtendidos] = useState(0);
  const [aviso, setAviso] = useState('');

  const n = tickets.length;
  const r = useMemo(() => calcular(conjunto, cola, atendidos, cls, slas), [conjunto, cola, atendidos, cls, slas]);
  const porId = useMemo(() => new Map(tickets.map((t, i) => [t.id, { t, llegada: i + 1 }])), [tickets]);

  const cambiar = (id: string, campo: 'impacto' | 'urgencia', v: Nivel) =>
    setCls((c) => ({ ...c, [id]: { ...c[id]!, [campo]: v } }));

  const reordenar = (nueva: string[], mensaje: string) => { setCola(nueva); setAviso(mensaje); };
  const atendidosFijos = cola.slice(0, atendidos);
  const aLlegada = () =>
    reordenar([...atendidosFijos, ...ordenLlegada(conjunto).filter((id) => !atendidosFijos.includes(id))], 'Cola en orden de llegada.');
  const aPrioridad = () =>
    reordenar([...atendidosFijos, ...ordenPorPrioridad(conjunto, cls).filter((id) => !atendidosFijos.includes(id))], 'Cola ordenada por prioridad.');
  const mueve = (idx: number, hasta: number) => {
    const nueva = mover(cola, idx, hasta, atendidos);
    if (nueva === cola) return;
    reordenar(nueva, `«${porId.get(cola[idx]!)!.t.titulo}» pasó al lugar ${hasta + 1} de la cola.`);
  };
  const avanzar = () => {
    if (atendidos >= n) return;
    const id = cola[atendidos]!;
    setAtendidos(atendidos + 1);
    setAviso(`El agente atendió «${porId.get(id)!.t.titulo}» (${porId.get(id)!.t.atencionMin} min).`);
  };
  const reiniciar = () => {
    setAtendidos(0);
    setCola(ordenLlegada(conjunto));
    setCls(clasificacionInicial(conjunto));
    setAviso('Se reinició la mesa: vuelve el orden de llegada y la clasificación original.');
  };

  const ocupacion = (ni: Nivel, nu: Nivel) => cola.filter((id) => cls[id]!.impacto === ni && cls[id]!.urgencia === nu);
  const trans = menos ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 36 };

  return (
    <div className="sim-cuerpo smp">
      <div className="sim-lienzo">
        <table className="smp-matriz">
          <caption className="smp-cap">Prioridad según impacto y urgencia</caption>
          <thead>
            <tr>
              <td className="smp-esquina" />
              {NIVELES.map((u) => <th key={u} scope="col">Urgencia {NOMBRE_URGENCIA[u].toLowerCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {NIVELES.map((i) => (
              <tr key={i}>
                <th scope="row">Impacto {NOMBRE_IMPACTO[i].toLowerCase()}</th>
                {NIVELES.map((u) => {
                  const p = prioridadDe(i, u);
                  const aca = ocupacion(i, u);
                  return (
                    <td key={u} className={`smp-celda smp-${p.toLowerCase()}`}>
                      <span className="smp-celda-p">{p}</span>
                      <span className="smp-chips">
                        {aca.map((id) => {
                          const { t, llegada } = porId.get(id)!;
                          const hecho = r.estados[id]!.atendido;
                          return (
                            <motion.span
                              key={id} layoutId={menos ? undefined : `chip-${id}`} transition={trans}
                              className={`smp-chip${hecho ? ' hecho' : ''}`} title={t.titulo}
                              role="img" aria-label={`Ticket ${llegada}: ${t.titulo}${hecho ? ' (atendido)' : ''}`}
                            >
                              {hecho ? '✓' : llegada}
                            </motion.span>
                          );
                        })}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sim-nota smp-nota">{NOTA}</p>
      </div>

      <Botones>
        <Boton clave="avanzar" onClick={avanzar} deshabilitado={atendidos >= n}>Avanzar el reloj</Boton>
        <Boton clave="orden-llegada" onClick={aLlegada}>Orden de llegada</Boton>
        <Boton clave="orden-prioridad" onClick={aPrioridad}>Ordenar por prioridad</Boton>
        <Boton clave="reiniciar" onClick={reiniciar}>Reiniciar</Boton>
      </Botones>

      <Lecturas
        items={[
          { clave: 'incumplidos', etiqueta: 'SLA incumplidos', valor: r.incumplidos, tono: r.incumplidos > 0 ? 'alerta' : atendidos === n ? 'buena' : undefined },
          { clave: 'reloj', etiqueta: 'Reloj (hh:mm desde las 09:00)', valor: hhmm(r.reloj) },
        ]}
      />
      <p className="sim-nota smp-aviso" role="status">{aviso || `Un solo agente. Atiende de arriba hacia abajo y cada ticket consume su tiempo (${tickets.map((t) => t.atencionMin).join(', ')} min).`}</p>

      <ol className="smp-cola" aria-label="Cola de atención">
        {cola.map((id, idx) => {
          const { t, llegada } = porId.get(id)!;
          const e = r.estados[id]!;
          const sla = slas[e.prioridad];
          const est = textoEstado(e, idx === atendidos, sla);
          return (
            <motion.li
              key={id} layout={menos ? false : 'position'} transition={trans}
              className={`smp-fila${e.atendido ? ' hecho' : ''}${e.incumplido ? ' mal' : ''}`}
            >
              <div className="smp-titulo">
                <span className="smp-lugar" aria-label={`Lugar ${idx + 1} en la cola`}>{idx + 1}</span>
                <div className="smp-texto">
                  <strong>{t.titulo}</strong>
                  <small>Llegó {llegada}.º · {t.detalle} · {t.atencionMin} min de atención</small>
                </div>
                <span className={`smp-prio smp-${e.prioridad.toLowerCase()}`} aria-label={`Prioridad ${e.prioridad}`}>
                  <span data-lectura={`prioridad-${id}`}>{e.prioridad}</span>
                </span>
              </div>
              <div className="smp-selects">
                <Selector
                  etiqueta="Impacto" valor={cls[id]!.impacto} clave={`impacto-${id}`}
                  opciones={NIVELES.map((x) => ({ valor: x, texto: NOMBRE_IMPACTO[x] }))}
                  onChange={(v) => cambiar(id, 'impacto', v)}
                />
                <Selector
                  etiqueta="Urgencia" valor={cls[id]!.urgencia} clave={`urgencia-${id}`}
                  opciones={NIVELES.map((x) => ({ valor: x, texto: NOMBRE_URGENCIA[x] }))}
                  onChange={(v) => cambiar(id, 'urgencia', v)}
                />
                <div className="smp-mover">
                  <button
                    type="button" className="sim-btn smp-flecha" data-control={`subir-${id}`}
                    aria-label={`Subir en la cola: ${t.titulo}`} title="Subir en la cola"
                    disabled={e.atendido || idx <= atendidos} onClick={() => mueve(idx, idx - 1)}
                  >↑</button>
                  <button
                    type="button" className="sim-btn smp-flecha" data-control={`bajar-${id}`}
                    aria-label={`Bajar en la cola: ${t.titulo}`} title="Bajar en la cola"
                    disabled={e.atendido || idx >= n - 1} onClick={() => mueve(idx, idx + 1)}
                  >↓</button>
                </div>
              </div>
              <p className="smp-estado">
                <span className={`smp-sello ${est.tono}`}>{est.sello}</span> {est.linea}
              </p>
            </motion.li>
          );
        })}
      </ol>

      <div className="sim-tabla smp-slas">
        <table>
          <caption className="smp-cap">SLA por prioridad (en este ejemplo)</caption>
          <thead><tr><th scope="col">Prioridad</th><th scope="col">Responder en</th><th scope="col">Resolver en</th></tr></thead>
          <tbody>
            {PRIORIDADES.map((p) => (
              <tr key={p}>
                <th scope="row"><span className={`smp-prio smp-${p.toLowerCase()}`}>{p}</span></th>
                <td>{duracionCorta(slas[p].respuestaMin)}</td>
                <td>{duracionCorta(slas[p].resolucionMin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sim-nota smp-nota">{NOTA}</p>
      </div>
    </div>
  );
}
