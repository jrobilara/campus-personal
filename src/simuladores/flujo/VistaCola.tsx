// SimFlujo, modo "cola": productor → cola (bloques apilados) → consumidores.
// Con etiquetas="tickets" el tiempo del motor está en horas (tasa en tickets/hora, proceso en minutos) y corre 15 min por segundo.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useMenosMovimiento } from '../../lib/tema';
import { Interruptor, Leyenda, Lecturas, Slider, type ItemLectura } from '../ui';
import { num } from '../formato';
import type { PropsSimFlujo } from '../props';
import { FACTOR_KB, MotorCola, type ParamsCola } from './cola';
import { BarraSim, useSimulacion } from './comun';
import { layoutCola, ranura } from './geometria';

type Props = Extract<PropsSimFlujo, { modo: 'cola' }>;

/** Horas de mesa que pasan por cada segundo simulado en el modo tickets (15 minutos). */
const ESCALA_TICKETS = 0.25;
const MAX_TRANSITORIOS = 40;

interface Transitorio {
  id: number;
  perdido: boolean;
  t: number;
}

export default function VistaCola(props: Props) {
  const tickets = props.etiquetas === 'tickets';
  const escala = tickets ? ESCALA_TICKETS : 1;
  const [tasa, setTasa] = useState(props.tasaLlegada ?? 5);
  const [consumidores, setConsumidores] = useState(props.consumidores ?? 2);
  // mensajes: segundos por mensaje; tickets: minutos por ticket
  const [proceso, setProceso] = useState(props.tiempoProceso ?? (tickets ? 20 : 0.5));
  const [kb, setKb] = useState(0);
  const [caido, setCaido] = useState(false);
  const capacidad = props.capacidadCola ?? 50;
  const reducido = useMenosMovimiento();
  const transitorios = useRef<Transitorio[]>([]);

  const aMotor = (): ParamsCola => ({
    tasaLlegada: tasa,
    consumidores,
    tiempoProceso: tickets ? proceso / 60 : proceso,
    capacidadCola: capacidad,
    kb: kb / 100,
    caido,
    sla: tickets && props.slaMinutos != null ? props.slaMinutos / 60 : null,
  });

  const sim = useSimulacion({
    escala,
    crear: () => { transitorios.current = []; return new MotorCola(aMotor(), props.semilla ?? 42); },
    leer: (m) => m.lecturas(),
    alPaso: (m) => {
      if (!m.nuevos.length) return;
      for (const n of m.nuevos) transitorios.current.push({ id: n.id, perdido: n.perdido, t: m.t });
      if (transitorios.current.length > MAX_TRANSITORIOS) transitorios.current.splice(0, transitorios.current.length - MAX_TRANSITORIOS);
    },
  });
  const { motor, lect } = sim;

  useEffect(() => {
    motor.setParams(aMotor());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasa, consumidores, proceso, kb, caido, motor]);

  const l = layoutCola(capacidad, consumidores);
  const visibles = motor.cola.slice(0, l.ranuras);
  const extra = motor.cola.length - visibles.length;
  const vida = 0.6 * escala;
  const recientes = reducido ? [] : transitorios.current.filter((x) => motor.t - x.t >= 0 && motor.t - x.t < vida);

  const esperaVista = (x: number) => (tickets ? x * 60 : x);
  const items: ItemLectura[] = [
    { clave: 'en-cola', etiqueta: tickets ? 'Tickets en cola' : 'Mensajes en cola', valor: String(lect.enCola), tono: lect.enCola >= capacidad ? 'alerta' : undefined },
    { clave: 'espera-media', etiqueta: 'Espera media', valor: num(esperaVista(lect.esperaMedia), 1), unidad: tickets ? 'min' : 's' },
    { clave: 'perdidos', etiqueta: tickets ? 'Tickets perdidos' : 'Mensajes perdidos', valor: String(lect.perdidos), tono: lect.perdidos > 0 ? 'alerta' : undefined },
  ];
  if (tickets && props.slaMinutos != null) {
    items.push({ clave: 'fuera-de-sla', etiqueta: 'Fuera de SLA', valor: String(lect.fueraDeSla), tono: lect.fueraDeSla > 0 ? 'alerta' : 'buena' });
  }

  const fKb = kb / 100;
  const factorKb = 1 - fKb + fKb * FACTOR_KB; // fracción del tiempo normal que tarda en promedio un ítem
  const enPie = Math.max(0, consumidores - (caido ? 1 : 0));
  const capProceso = ((tickets ? 60 : 1) / proceso / factorKb) * enPie;
  const unidad = tickets ? 'tickets/h' : 'mensajes/s';
  const maxTasa = Math.max(30, Math.ceil(tasa / 5) * 5);
  const maxProceso = Math.max(tickets ? 90 : 2, Math.ceil(proceso));
  const minProceso = Math.min(tickets ? 5 : 0.05, proceso);
  const maxConsumidores = Math.max(8, consumidores);

  return (
    <div className="sim-cuerpo" ref={sim.contenedor}>
      <div className="sim-lienzo">
        <svg viewBox={`0 0 ${l.ancho} ${l.alto}`} role="img" aria-label={`Diagrama animado: un ${tickets ? 'canal de usuarios' : 'productor'} manda ${tickets ? 'tickets' : 'mensajes'} a una cola que atienden ${consumidores} ${tickets ? 'técnicos' : 'consumidores'}.`}>
          {/* productor */}
          <circle className="sfl-nodo marca" cx={l.xProductor} cy={l.cy} r="22" />
          <text className="sfl-nodo-t chico" x={l.xProductor} y={l.cy + 4} textAnchor="middle">{tickets ? 'Pedidos' : 'Envía'}</text>
          <text className="sfl-etq" x={l.xProductor} y={l.cy + 38} textAnchor="middle">{tickets ? 'Usuarios' : 'Productor'}</text>
          <path className="sfl-cable" d={`M${l.xProductor + 22} ${l.cy} L${l.xMarco} ${l.cy}`} />

          {/* cola */}
          <rect className="sfl-marco" x={l.xMarco} y={l.yMarco} width={l.anchoMarco} height={l.altoMarco} rx="6" />
          {Array.from({ length: l.ranuras }, (_, k) => {
            const p = ranura(l, k);
            return <rect key={k} className="sfl-ranura" x={p.x} y={p.y} width="13" height="13" rx="3" />;
          })}
          <g>
            {visibles.map((it, k) => {
              const p = ranura(l, k);
              return (
                <motion.g
                  key={it.id}
                  initial={reducido ? false : { x: p.x - 18, y: p.y, opacity: 0 }}
                  animate={{ x: p.x, y: p.y, opacity: 1 }}
                  transition={reducido ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
                >
                  <rect className={`sfl-bloque${it.fuera ? ' fuera' : it.kb ? ' kb' : ''}`} width="13" height="13" rx="3" />
                </motion.g>
              );
            })}
          </g>
          {extra > 0 && <text className="sfl-etq" x={l.xMarco + l.anchoMarco} y={l.yMarco + l.altoMarco + 13} textAnchor="end">+{extra} más en la cola</text>}
          <text className="sfl-etq" x={l.xMarco} y={l.yMarco - 6}>Cola (capacidad {capacidad})</text>

          {/* ítems recién llegados */}
          {recientes.map((x) =>
            x.perdido ? (
              <motion.rect
                key={`p${x.id}`} className="sfl-bloque fuera" width="13" height="13" rx="3"
                x={l.xMarco - 20} y={l.cy - 7}
                initial={{ opacity: 1, translateY: 0 }} animate={{ opacity: 0, translateY: 26 }} transition={{ duration: 0.55, ease: 'easeIn' }}
              />
            ) : (
              <motion.circle
                key={`e${x.id}`} className="sfl-punto" r="4" cy={l.cy}
                initial={{ cx: l.xProductor + 20, opacity: 1 }} animate={{ cx: l.xMarco, opacity: 0.1 }} transition={{ duration: 0.3, ease: 'linear' }}
              />
            ),
          )}

          {/* consumidores */}
          {motor.consumidores.map((c, i) => {
            const y = l.yConsumidores[i]!;
            const activo = motor.activo(i);
            const frac = c.item ? Math.min(1, Math.max(0, (motor.t - c.inicio) / Math.max(1e-9, c.fin - c.inicio))) : 0;
            return (
              <g key={i}>
                <path className={`sfl-cable${activo ? '' : ' caido'}`} d={`M${l.xMarco + l.anchoMarco} ${l.cy} L${l.xMarco + l.anchoMarco + 20} ${l.cy} L${l.xMarco + l.anchoMarco + 20} ${y} L${l.xConsumidor} ${y}`} />
                <rect className={`sfl-srv${!activo ? ' caido' : c.item ? ' ocupado' : ''}`} x={l.xConsumidor} y={y - 15} width={l.anchoConsumidor} height="30" rx="8" />
                <rect className="sfl-progreso" x={l.xConsumidor + 4} y={y + 8} width={(l.anchoConsumidor - 8) * frac} height="4" rx="2" />
                <text className="sfl-nodo-t chico" x={l.xConsumidor + 8} y={y - 1}>{tickets ? 'Técnico' : 'Consumidor'} {i + 1}</text>
                <text className="sfl-etq" x={l.xConsumidor + l.anchoConsumidor - 6} y={y - 1} textAnchor="end">
                  {!activo ? 'caído' : c.item ? (c.item.kb ? 'KB' : 'trabaja') : 'libre'}
                </text>
                {!activo && <path className="sfl-cruz" d={`M${l.xConsumidor + 6} ${y - 10} L${l.xConsumidor + l.anchoConsumidor - 6} ${y + 10} M${l.xConsumidor + l.anchoConsumidor - 6} ${y - 10} L${l.xConsumidor + 6} ${y + 10}`} />}
              </g>
            );
          })}
        </svg>
      </div>

      <p className={`sim-nota sfl-capacidad${tasa > capProceso ? ' alerta' : ''}`}>
        Llegan {num(tasa, 0)} {unidad}; el equipo, con {tickets ? 'técnicos' : 'consumidores'} en pie, resuelve {num(capProceso, 1)} {unidad}.
        {tasa > capProceso ? ' Entra más de lo que sale: la cola va a crecer.' : ''}
      </p>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: tickets ? 'Ticket esperando' : 'Mensaje esperando' },
        ...(tickets && kb > 0 ? [{ color: 'var(--ok)', texto: 'Se resuelve con la base de conocimiento' }] : []),
        ...(tickets && props.slaMinutos != null ? [{ color: 'var(--mal)', texto: 'Fuera de SLA' }] : [{ color: 'var(--mal)', texto: 'Perdido (cola llena)' }]),
      ]} />

      <Lecturas items={items} />

      <div className="sim-controles">
        <Slider etiqueta={tickets ? 'Tickets que llegan' : 'Mensajes que llegan'} valor={tasa} min={1} max={maxTasa} paso={1} onChange={setTasa} formato={(v) => `${num(v, 0)} ${tickets ? '/h' : '/s'}`} clave="tasa-llegada" />
        <Slider etiqueta={tickets ? 'Técnicos' : 'Consumidores'} valor={consumidores} min={1} max={maxConsumidores} paso={1} onChange={setConsumidores} clave="consumidores" />
        <Slider
          etiqueta={tickets ? 'Tiempo por ticket' : 'Tiempo de proceso'} valor={proceso} min={minProceso} max={maxProceso} paso={tickets ? 1 : 0.05}
          onChange={setProceso} formato={(v) => (tickets ? `${num(v, 0)} min` : `${num(v, 2)} s`)} clave="tiempo-proceso"
        />
        {props.kb && <Slider etiqueta="% resuelto con la base de conocimiento" valor={kb} min={0} max={100} paso={5} onChange={setKb} formato={(v) => `${num(v, 0)} %`} clave="kb" />}
        <Interruptor etiqueta={tickets ? 'Un técnico caído' : 'Un consumidor caído'} activo={caido} onChange={setCaido} clave="consumidor-caido" />
      </div>

      <BarraSim
        pausado={sim.pausado} onPausa={() => sim.setPausado(!sim.pausado)} onReiniciar={sim.reiniciar}
        adelantar={{ texto: tickets ? 'Adelantar 2,5 h' : 'Adelantar 10 s', onClick: () => sim.adelantar(10) }}
      />
      {tickets && <p className="sim-nota">El reloj corre rápido: cada segundo en pantalla son 15 minutos de la mesa de ayuda.</p>}
    </div>
  );
}
