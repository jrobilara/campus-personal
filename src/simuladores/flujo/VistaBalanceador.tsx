// SimFlujo, modo "balanceador": clientes → balanceador → (caché) → servidores, con una barra de cola por servidor.
import { useLayoutEffect, useState } from 'react';
import { useMenosMovimiento } from '../../lib/tema';
import { Boton, Interruptor, Leyenda, Lecturas, Selector, Slider, type ItemLectura } from '../ui';
import { num } from '../formato';
import type { PropsSimFlujo } from '../props';
import { MotorBalanceador, type Algoritmo, type ParamsBalanceador } from './balanceador';
import { BarraSim, Punto, useSimulacion } from './comun';
import { layoutBalanceador, puntosBalanceador, rutaAServidor, type LayoutBalanceador } from './geometria';

type Props = Extract<PropsSimFlujo, { modo: 'balanceador' }>;

const ALGORITMOS: { valor: Algoritmo; texto: string }[] = [
  { valor: 'round-robin', texto: 'Round robin (por turnos)' },
  { valor: 'menos-conexiones', texto: 'Menos conexiones' },
  { valor: 'aleatorio', texto: 'Aleatorio' },
];

const d = (ruta: { x: number; y: number }[]) => ruta.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

export default function VistaBalanceador(props: Props) {
  const capacidad = props.capacidadPorServidor ?? 10;
  const [servidores, setServidores] = useState(props.servidores ?? 3);
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>(props.algoritmo ?? 'round-robin');
  const [tasa, setTasa] = useState(props.tasaLlegada ?? 20);
  const [lento, setLento] = useState(props.servidorLento ?? false);
  const [cache, setCache] = useState(props.cache ?? false);
  const [acierto, setAcierto] = useState(props.aciertoCache ?? 0.5);
  const reducido = useMenosMovimiento();

  const params: ParamsBalanceador = {
    servidores, algoritmo, tasaLlegada: tasa, capacidadPorServidor: capacidad, servidorLento: lento, cacheActiva: cache, aciertoCache: acierto,
  };
  const sim = useSimulacion({
    crear: () => new MotorBalanceador(params, props.semilla ?? 42),
    leer: (m) => ({ ...m.lecturas(), enCola: m.servidores.reduce((a, s) => a + s.cola.length, 0) }),
  });
  const { motor, lect } = sim;

  // useLayoutEffect: los parámetros llegan al motor antes de que un botón (p. ej. "Adelantar") lo haga avanzar.
  useLayoutEffect(() => {
    motor.setParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servidores, algoritmo, tasa, lento, cache, acierto, motor]);

  const l: LayoutBalanceador = layoutBalanceador(motor.servidores.length);
  const puntos = puntosBalanceador(motor.recientes, motor.t, l, cache);
  const capTotal = (servidores - motor.caidos) * capacidad;
  // con caché, a los servidores solo llegan los pedidos que la caché no resuelve
  const tasaAServidores = cache ? tasa * (1 - acierto) : tasa;
  const saturado = tasaAServidores > capTotal;

  const items: ItemLectura[] = [
    { clave: 'utilizacion', etiqueta: 'Utilización', valor: num(lect.utilizacion * 100, 0), unidad: '%', tono: lect.utilizacion >= 0.9 ? 'alerta' : undefined },
    { clave: 'latencia-p50', etiqueta: 'Latencia p50', valor: num(lect.p50, 0), unidad: 'ms' },
    { clave: 'latencia-p95', etiqueta: 'Latencia p95', valor: num(lect.p95, 0), unidad: 'ms', tono: lect.p95 > 1000 ? 'alerta' : undefined },
    { clave: 'rechazados', etiqueta: 'Rechazados', valor: String(lect.rechazados), tono: lect.rechazados > 0 ? 'alerta' : undefined },
    { clave: 'en-cola', etiqueta: 'En cola (todos)', valor: String(lect.enCola) },
  ];
  if (cache) items.splice(4, 0, { clave: 'aciertos-cache', etiqueta: 'Aciertos de caché', valor: lect.aciertosCache == null ? '—' : num(lect.aciertosCache * 100, 0), unidad: '%', tono: 'buena' });

  const maxTasa = Math.max(100, Math.ceil(tasa / 10) * 10);

  return (
    <div className="sim-cuerpo" ref={sim.contenedor}>
      <div className="sim-lienzo">
        <svg viewBox={`0 0 ${l.ancho} ${l.alto}`} role="img" aria-label={`Diagrama animado: los clientes mandan pedidos al balanceador, que los reparte entre ${servidores} servidores${cache ? ' pasando antes por una caché' : ''}.`}>
          {/* conexiones */}
          <path className="sfl-cable" d={`M${l.xCliente + 12} ${l.cy} L${l.xLbIzq} ${l.cy}`} />
          {cache && <path className="sfl-cable" d={`M${l.xLbDer} ${l.cy} L${l.xCacheIzq} ${l.cy}`} />}
          {motor.servidores.map((s, i) => (
            <path key={`c${i}`} className={`sfl-cable${s.arriba ? '' : ' caido'}`} d={d(rutaAServidor(l, i, cache).slice(cache ? 4 : 2))} />
          ))}

          {/* clientes */}
          <g aria-hidden="true">
            {[-14, 0, 14].map((dy) => <circle key={dy} className="sfl-cliente" cx={l.xCliente - 4} cy={l.cy + dy} r="7" />)}
          </g>
          <text className="sfl-etq" x={l.xCliente - 4} y={l.cy + 34} textAnchor="middle">Clientes</text>

          {/* balanceador */}
          <rect className="sfl-nodo marca" x={l.xLbIzq} y={l.cy - 32} width={l.xLbDer - l.xLbIzq} height="64" rx="10" />
          <text className="sfl-nodo-t" x={(l.xLbIzq + l.xLbDer) / 2} y={l.cy + 4} textAnchor="middle">LB</text>
          <text className="sfl-etq" x={(l.xLbIzq + l.xLbDer) / 2} y={l.cy + 46} textAnchor="middle">Balanceador</text>

          {/* caché */}
          {cache && (
            <g>
              <rect className="sfl-nodo cache" x={l.xCacheIzq} y={l.cy - 26} width={l.xCacheDer - l.xCacheIzq} height="52" rx="10" />
              <text className="sfl-nodo-t" x={(l.xCacheIzq + l.xCacheDer) / 2} y={l.cy + 1} textAnchor="middle">Caché</text>
              <text className="sfl-etq" x={(l.xCacheIzq + l.xCacheDer) / 2} y={l.cy + 15} textAnchor="middle">{num(acierto * 100, 0)} %</text>
            </g>
          )}

          {/* servidores y sus colas */}
          {motor.servidores.map((s, i) => {
            const y = l.ys[i]!;
            const carga = s.cola.length;
            const lleno = Math.min(1, carga / 30);
            return (
              <g key={i}>
                <rect className={`sfl-srv${!s.arriba ? ' caido' : s.enServicio ? ' ocupado' : ''}`} x={l.xSrv} y={y - 17} width={l.anchoSrv} height="34" rx="8" />
                <text className="sfl-nodo-t chico" x={l.xSrv + l.anchoSrv / 2} y={y - 2} textAnchor="middle">Servidor {i + 1}</text>
                <text className="sfl-etq" x={l.xSrv + l.anchoSrv / 2} y={y + 11} textAnchor="middle">
                  {!s.arriba ? 'caído' : s.enServicio ? 'atendiendo' : 'libre'}
                </text>
                {lento && i === 0 && s.arriba && (
                  <g>
                    <rect className="sfl-insignia" x={l.xSrv + l.anchoSrv - 22} y={y - 24} width="26" height="14" rx="7" />
                    <text className="sfl-etq insignia" x={l.xSrv + l.anchoSrv - 9} y={y - 14} textAnchor="middle">½×</text>
                  </g>
                )}
                {!s.arriba && <path className="sfl-cruz" d={`M${l.xSrv + 6} ${y - 11} L${l.xSrv + l.anchoSrv - 6} ${y + 11} M${l.xSrv + l.anchoSrv - 6} ${y - 11} L${l.xSrv + 6} ${y + 11}`} />}
                <text className="sfl-etq" x={l.xCola} y={y - 8}>cola {carga}</text>
                <rect className="sfl-barra-fondo" x={l.xCola} y={y - 4} width={l.anchoCola} height="9" rx="4.5" />
                <rect className={`sfl-barra${carga >= 15 ? ' alerta' : ''}`} x={l.xCola} y={y - 4} width={Math.max(carga > 0 ? 5 : 0, lleno * l.anchoCola)} height="9" rx="4.5" />
              </g>
            );
          })}

          {/* pedidos que viajan */}
          <g>
            {puntos.map((p) => (
              <Punto key={p.id} x={p.x} y={p.y} opacidad={p.opacidad} reducido={reducido} clase={`sfl-punto${p.estado === 'acierto' ? ' acierto' : p.estado === 'rechazo' ? ' rechazo' : ''}`} />
            ))}
          </g>
        </svg>
      </div>

      <p className={`sim-nota sfl-capacidad${saturado ? ' alerta' : ''}`}>
        Llegan {num(tasa, 0)} pedidos/s{cache ? ` (a los servidores pasan ${num(tasaAServidores, 0)} después de la caché)` : ''} y los {servidores - motor.caidos} servidores en pie atienden {num(capTotal, 0)} en total ({num(capacidad, 0)} cada uno).
        {saturado ? ' Entra más de lo que sale: las colas van a crecer.' : ''}
      </p>

      <Leyenda items={[
        { color: 'var(--color-area)', texto: 'Pedido en camino' },
        ...(cache ? [{ color: 'var(--ok)', texto: 'Acierto de caché' }] : []),
        { color: 'var(--mal)', texto: 'Rechazado' },
      ]} />

      <Lecturas items={items} />

      <div className="sim-controles">
        <Slider etiqueta="Pedidos que llegan" valor={tasa} min={1} max={maxTasa} paso={1} onChange={setTasa} formato={(v) => `${num(v, 0)} /s`} clave="tasa-llegada" />
        <Slider etiqueta="Servidores" valor={servidores} min={1} max={8} paso={1} onChange={setServidores} clave="servidores" />
        <Selector etiqueta="Algoritmo de reparto" valor={algoritmo} opciones={ALGORITMOS} onChange={setAlgoritmo} clave="algoritmo" />
        {cache && <Slider etiqueta="Aciertos de la caché" valor={acierto} min={0} max={0.95} paso={0.05} onChange={setAcierto} formato={(v) => `${num(v * 100, 0)} %`} clave="acierto-cache" />}
        <Interruptor etiqueta="Un servidor lento (mitad de velocidad)" activo={lento} onChange={setLento} clave="servidor-lento" />
        <Interruptor etiqueta="Poner una caché delante" activo={cache} onChange={setCache} clave="cache" />
      </div>

      <BarraSim
        pausado={sim.pausado} onPausa={() => sim.setPausado(!sim.pausado)} onReiniciar={sim.reiniciar}
        adelantar={{ texto: 'Adelantar 10 s', onClick: () => sim.adelantar(10) }}
      >
        <Boton clave="tirar-servidor" onClick={() => { motor.tirarServidor(); sim.refrescar(); }} deshabilitado={motor.caidos >= motor.servidores.length}>Tirar un servidor</Boton>
        <Boton clave="levantar-servidores" onClick={() => { motor.levantarTodos(); sim.refrescar(); }} deshabilitado={motor.caidos === 0}>Levantar los caídos</Boton>
      </BarraSim>
    </div>
  );
}
