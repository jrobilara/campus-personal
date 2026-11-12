// SimFlujo, modo "sincrono-vs-asincrono": dos carriles con el mismo flujo de pedidos.
// Arriba: Cliente → A → B (A espera a B). Abajo: Cliente → A → cola → B (A contesta enseguida).
import { useLayoutEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useMenosMovimiento } from '../../lib/tema';
import { Interruptor, Leyenda, Lecturas, Slider, type ItemLectura } from '../ui';
import { num } from '../formato';
import type { PropsSimFlujo } from '../props';
import { BarraSim, Punto, useSimulacion } from './comun';
import { ALTO_SINC, ANCHO_COLA_SINC, ANCHO_SINC, X_A, X_B, X_CLIENTE, X_COLA, Y_ASINC, Y_SINC, puntoAsinc, puntoSinc, type PuntoSinc } from './geometria';
import { MotorSincrono } from './sincrono';

type Props = Extract<PropsSimFlujo, { modo: 'sincrono-vs-asincrono' }>;

const CLASE: Record<PuntoSinc['estado'], string> = {
  pedido: 'sfl-punto', espera: 'sfl-punto espera', respuesta: 'sfl-punto acierto', error: 'sfl-punto rechazo', ack: 'sfl-punto acierto',
};
const RANURAS = 5;

export default function VistaSincrono(props: Props) {
  const [latencia, setLatencia] = useState(props.latenciaServicioB ?? 200);
  const [caido, setCaido] = useState(false);
  const reducido = useMenosMovimiento();

  const sim = useSimulacion({
    velocidad: 0.5,
    crear: () => {
      const m = new MotorSincrono(latencia);
      m.setCaidoB(caido);
      return m;
    },
    leer: (m) => m.lecturas(),
  });
  const { motor, lect } = sim;

  // useLayoutEffect: los parámetros llegan al motor antes de que un botón (p. ej. "Adelantar") lo haga avanzar.
  useLayoutEffect(() => {
    motor.setLatenciaB(latencia);
    motor.setCaidoB(caido);
  }, [latencia, caido, motor]);

  const puntos = [
    ...motor.sinc.map((p) => puntoSinc(p, motor.t)),
    ...motor.asinc.map((a) => puntoAsinc(a, motor.t)),
  ].filter((p): p is PuntoSinc => p !== null);
  // los ids de los dos carriles se repiten: la clave lleva el carril (y)
  const bOcupado = motor.sinc.some((p) => p.resuelto && p.ok && motor.t >= p.tLlegaB && motor.t < p.tLlegaB + p.latB);
  const colaVista = motor.cola.slice(0, RANURAS);
  const xCola = X_COLA + 4;

  const items: ItemLectura[] = [
    { clave: 'espera-cliente-sinc', etiqueta: 'Espera del cliente (síncrono)', valor: num(lect.esperaSinc, 0), unidad: 'ms' },
    { clave: 'espera-cliente-asinc', etiqueta: 'Espera del cliente (asíncrono)', valor: num(lect.esperaAsinc, 0), unidad: 'ms' },
    { clave: 'errores-sinc', etiqueta: 'Errores (síncrono)', valor: String(lect.erroresSinc), tono: lect.erroresSinc > 0 ? 'alerta' : undefined },
    { clave: 'pendientes-asinc', etiqueta: 'Pendientes en la cola (asíncrono)', valor: String(lect.pendientesAsinc), tono: lect.pendientesAsinc > 5 ? 'alerta' : undefined },
  ];

  const nodoA = (y: number) => (
    <g>
      <rect className="sfl-nodo marca" x={X_A - 28} y={y - 17} width="56" height="34" rx="8" />
      <text className="sfl-nodo-t" x={X_A} y={y + 4} textAnchor="middle">A</text>
    </g>
  );
  const nodoB = (y: number, ocupado: boolean) => (
    <g>
      <rect className={`sfl-srv${caido ? ' caido' : ocupado ? ' ocupado' : ''}`} x={X_B - 28} y={y - 17} width="56" height="34" rx="8" />
      <text className="sfl-nodo-t" x={X_B} y={y + 4} textAnchor="middle">B</text>
      {caido && <path className="sfl-cruz" d={`M${X_B - 22} ${y - 12} L${X_B + 22} ${y + 12} M${X_B + 22} ${y - 12} L${X_B - 22} ${y + 12}`} />}
    </g>
  );
  const cliente = (y: number, texto: string, esperando: boolean) => (
    <g>
      <circle className={`sfl-nodo cliente${esperando ? ' esperando' : ''}`} cx={X_CLIENTE} cy={y} r="21" />
      <text className="sfl-nodo-t chico" x={X_CLIENTE} y={y + 4} textAnchor="middle">Cliente</text>
      <text className="sfl-etq" x={X_CLIENTE} y={y + 36} textAnchor="middle">{texto}</text>
    </g>
  );

  return (
    <div className="sim-cuerpo" ref={sim.contenedor}>
      <div className="sim-lienzo">
        <svg viewBox={`0 0 ${ANCHO_SINC} ${ALTO_SINC}`} role="img" aria-label="Diagrama animado con dos carriles: arriba el cliente espera a que A llame a B; abajo A deja el mensaje en una cola y le contesta al cliente enseguida.">
          <rect className="sfl-carril" x="4" y="8" width={ANCHO_SINC - 8} height="116" rx="12" />
          <rect className="sfl-carril" x="4" y="128" width={ANCHO_SINC - 8} height="116" rx="12" />
          <text className="sfl-etq fuerte" x="14" y="24">Síncrono: A espera la respuesta de B</text>
          <text className="sfl-etq fuerte" x="14" y="144">Asíncrono: A deja el mensaje en una cola</text>

          {/* carril síncrono */}
          <path className="sfl-cable" d={`M${X_CLIENTE + 21} ${Y_SINC} L${X_A - 28} ${Y_SINC}`} />
          <path className={`sfl-cable${caido ? ' caido' : ''}`} d={`M${X_A + 28} ${Y_SINC} L${X_B - 28} ${Y_SINC}`} />
          {cliente(Y_SINC, motor.clienteEsperando ? 'esperando…' : 'libre', motor.clienteEsperando)}
          {nodoA(Y_SINC)}
          {nodoB(Y_SINC, bOcupado)}

          {/* carril asíncrono */}
          <path className="sfl-cable" d={`M${X_CLIENTE + 21} ${Y_ASINC} L${X_A - 28} ${Y_ASINC}`} />
          <path className="sfl-cable" d={`M${X_A + 28} ${Y_ASINC} L${X_COLA} ${Y_ASINC}`} />
          <path className={`sfl-cable${caido ? ' caido' : ''}`} d={`M${X_COLA + ANCHO_COLA_SINC} ${Y_ASINC} L${X_B - 28} ${Y_ASINC}`} />
          {cliente(Y_ASINC, 'libre', false)}
          {nodoA(Y_ASINC)}
          <rect className="sfl-marco" x={X_COLA} y={Y_ASINC - 15} width={ANCHO_COLA_SINC} height="30" rx="6" />
          {Array.from({ length: RANURAS }, (_, k) => <rect key={k} className="sfl-ranura" x={xCola + ANCHO_COLA_SINC - 25 - k * 16 + 3} y={Y_ASINC - 7} width="13" height="13" rx="3" />)}
          {colaVista.map((id, k) => (
            <motion.g
              key={id}
              initial={reducido ? false : { x: xCola + ANCHO_COLA_SINC - 25 - k * 16 + 3 - 24, y: Y_ASINC - 7, opacity: 0 }}
              animate={{ x: xCola + ANCHO_COLA_SINC - 25 - k * 16 + 3, y: Y_ASINC - 7, opacity: 1 }}
              transition={reducido ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
            >
              <rect className={`sfl-bloque${caido ? ' fuera' : ''}`} width="13" height="13" rx="3" />
            </motion.g>
          ))}
          <text className="sfl-etq" x={X_COLA + ANCHO_COLA_SINC / 2} y={Y_ASINC + 29} textAnchor="middle">
            cola: {motor.cola.length}{motor.cola.length > RANURAS ? ` (se ven ${RANURAS})` : ''}
          </text>
          {nodoB(Y_ASINC, !!motor.enB)}

          {/* pedidos que viajan */}
          {puntos.map((p) => (
            <Punto key={`${p.y}-${p.id}`} x={p.x} y={p.y} opacidad={p.opacidad} reducido={reducido} clase={CLASE[p.estado]} r={4} />
          ))}
        </svg>
      </div>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: 'Pedido' },
        { color: 'var(--marca)', texto: 'Esperando a B' },
        { color: 'var(--ok)', texto: 'Respuesta o confirmación' },
        { color: 'var(--mal)', texto: 'Error' },
      ]} />

      <Lecturas items={items} />

      <div className="sim-controles">
        <Slider etiqueta="Latencia del servicio B" valor={latencia} min={50} max={3000} log onChange={(v) => setLatencia(Math.round(v))} formato={(v) => `${num(v, 0)} ms`} clave="latencia-b" />
        <Interruptor etiqueta="Servicio B caído" activo={caido} onChange={setCaido} clave="b-caido" />
      </div>

      <BarraSim pausado={sim.pausado} onPausa={() => sim.setPausado(!sim.pausado)} onReiniciar={sim.reiniciar} adelantar={{ texto: 'Adelantar 10 s', onClick: () => sim.adelantar(10) }} />
      <p className="sim-nota">Cámara lenta (la mitad de la velocidad real) para que se vean los saltos. Llega un pedido cada medio segundo.</p>
    </div>
  );
}
