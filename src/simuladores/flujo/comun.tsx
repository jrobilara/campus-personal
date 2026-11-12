// Piezas comunes de las cuatro vistas de SimFlujo: el bucle de simulación (pausa, reinicio, adelantar),
// la barra de botones y el punto que viaja (motion sobre SVG).
import { useCallback, useRef, useState, type ReactNode, type RefObject } from 'react';
import { motion } from 'motion/react';
import { Boton, Botones, useBucle, useVisible } from '../ui';

export interface MotorBase {
  t: number;
  avanzar(dt: number): void;
}

interface OpcionesSim<M extends MotorBase, L> {
  crear: () => M;
  leer: (m: M) => L;
  /** unidades del motor por segundo simulado (1 = el motor está en segundos) */
  escala?: number;
  /** velocidad del reloj respecto del tiempo real (1 = tiempo real) */
  velocidad?: number;
  /** cada cuántos segundos simulados se refrescan las lecturas */
  cadaSeg?: number;
  alPaso?: (m: M) => void;
}

/** Paso fijo de la simulación: 50 ms de tiempo simulado. */
export const PASO = 0.05;

/**
 * Corre un motor a paso fijo de 50 ms de tiempo simulado, pausable, y se pausa sola cuando el contenedor sale de pantalla.
 * Devuelve el motor vivo, un contador que cambia en cada paso (para redibujar) y las lecturas, que se refrescan más despacio
 * (para no inundar el aria-live).
 */
export function useSimulacion<M extends MotorBase, L>(op: OpcionesSim<M, L>) {
  const { escala = 1, velocidad = 1, cadaSeg = 0.5 } = op;
  const crearRef = useRef(op.crear);
  crearRef.current = op.crear;
  const leerRef = useRef(op.leer);
  leerRef.current = op.leer;
  const alPasoRef = useRef(op.alPaso);
  alPasoRef.current = op.alPaso;

  const motorRef = useRef<M | null>(null);
  if (motorRef.current === null) motorRef.current = op.crear();
  const contenedor = useRef<HTMLDivElement>(null);
  const visible = useVisible(contenedor as RefObject<Element | null>);
  const [pausado, setPausado] = useState(false);
  const [version, setVersion] = useState(0);
  const [lect, setLect] = useState<L>(() => op.leer(motorRef.current!));
  const proxLect = useRef(0);

  const paso = useCallback(
    (dt: number) => {
      const m = motorRef.current!;
      m.avanzar(dt * escala);
      alPasoRef.current?.(m);
      if (m.t >= proxLect.current) {
        setLect(leerRef.current(m));
        proxLect.current = m.t + cadaSeg * escala;
      }
      setVersion((v) => v + 1);
    },
    [escala, cadaSeg],
  );
  useBucle(paso, { pausado, visible, velocidad });

  const reiniciar = useCallback(() => {
    motorRef.current = crearRef.current();
    proxLect.current = 0;
    setLect(leerRef.current(motorRef.current));
    setVersion((v) => v + 1);
  }, []);

  /** Avanza `seg` segundos simulados de golpe (en pasos de 50 ms). */
  const adelantar = useCallback(
    (seg: number) => {
      const m = motorRef.current!;
      const n = Math.round(seg / PASO);
      for (let i = 0; i < n; i++) {
        m.avanzar(PASO * escala);
        alPasoRef.current?.(m);
      }
      proxLect.current = m.t + cadaSeg * escala;
      setLect(leerRef.current(m));
      setVersion((v) => v + 1);
    },
    [escala, cadaSeg],
  );

  const refrescar = useCallback(() => {
    setLect(leerRef.current(motorRef.current!));
    setVersion((v) => v + 1);
  }, []);

  return { motor: motorRef.current!, version, lect, pausado, setPausado, reiniciar, adelantar, refrescar, contenedor };
}

const IconoPausa = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ marginRight: '0.4rem', verticalAlign: '-0.1em' }}>
    <rect x="2" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
    <rect x="7" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
  </svg>
);
const IconoPlay = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ marginRight: '0.4rem', verticalAlign: '-0.1em' }}>
    <path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" />
  </svg>
);

/** Botones comunes: pausar/reanudar, reiniciar y, si corresponde, adelantar. Los hijos van a continuación. */
export function BarraSim({ pausado, onPausa, onReiniciar, adelantar, children }: {
  pausado: boolean;
  onPausa: () => void;
  onReiniciar?: () => void;
  adelantar?: { texto: string; onClick: () => void };
  children?: ReactNode;
}) {
  return (
    <Botones>
      <Boton clave="pausa" onClick={onPausa} titulo={pausado ? 'Reanudar la simulación' : 'Pausar la simulación'}>
        {pausado ? <IconoPlay /> : <IconoPausa />}
        {pausado ? 'Reanudar' : 'Pausar'}
      </Boton>
      {adelantar && <Boton clave="adelantar" onClick={adelantar.onClick} titulo="Avanza el tiempo simulado de golpe">{adelantar.texto}</Boton>}
      {onReiniciar && <Boton clave="reiniciar" onClick={onReiniciar}>Reiniciar</Boton>}
      {children}
    </Botones>
  );
}

/** Punto que viaja: la posición se interpola entre pasos de 50 ms (o salta, con movimiento reducido). */
export function Punto({ x, y, opacidad = 1, r = 4.5, clase, reducido }: { x: number; y: number; opacidad?: number; r?: number; clase: string; reducido: boolean }) {
  return (
    <motion.circle
      r={r} className={clase} initial={false}
      animate={{ cx: x, cy: y, opacity: opacidad }}
      transition={reducido ? { duration: 0 } : { duration: 0.06, ease: 'linear' }}
    />
  );
}
