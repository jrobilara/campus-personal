import { useId, useRef, useState } from 'react';
import { corregirNumerico, type Tolerancia } from '../lib/correccion';
import { useEjercicio } from '../progreso/uso';

interface Comun { id: string; enunciadoHtml: string }
export type PropsEjercicio = Comun &
  (
    | { tipo: 'numerico'; respuesta: number; tolerancia: Tolerancia; unidad: string; explicacionHtml: string; erroresComunes: { valor: number; explicacionHtml: string }[] }
    | { tipo: 'opcion-multiple'; opciones: { textoHtml: string; correcta: boolean; explicacionHtml: string }[] }
    | { tipo: 'verdadero-falso'; respuesta: boolean; justificacionHtml: string }
  );

const Html = ({ html, bloque = true }: { html: string; bloque?: boolean }) =>
  bloque ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;

const ETIQUETA = { numerico: 'Numérico', 'opcion-multiple': 'Opción múltiple', 'verdadero-falso': 'Verdadero o falso' } as const;

export default function Ejercicio(props: PropsEjercicio) {
  const { id, enunciadoHtml } = props;
  const { intentos, aciertos, registrar } = useEjercicio(id);
  const uid = useId();
  const [entrada, setEntrada] = useState('');
  const [elegida, setElegida] = useState<number | null>(null);
  const [hecho, setHecho] = useState<null | { ok: boolean; html: string; extra?: string }>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const reiniciar = () => { setHecho(null); setEntrada(''); setElegida(null); setError(''); setTimeout(() => inputRef.current?.focus(), 0); };

  function corregirNum(e: { preventDefault(): void }) {
    e.preventDefault();
    if (props.tipo !== 'numerico') return;
    const r = corregirNumerico(entrada, props);
    if (r.estado === 'invalido') { setError('Escribí un número, con coma o con punto (por ejemplo 12,5).'); return; }
    setError('');
    const ok = r.estado === 'ok';
    registrar(ok);
    const especifica = r.estado === 'error' && r.errorComun !== undefined ? props.erroresComunes[r.errorComun]!.explicacionHtml : null;
    setHecho({ ok, html: especifica ?? props.explicacionHtml, extra: especifica ? props.explicacionHtml : undefined });
  }
  function corregirOM(e: { preventDefault(): void }) {
    e.preventDefault();
    if (props.tipo !== 'opcion-multiple' || elegida === null) return;
    const o = props.opciones[elegida]!;
    registrar(o.correcta);
    const correcta = props.opciones.find((x) => x.correcta)!;
    setHecho({ ok: o.correcta, html: o.explicacionHtml, extra: o.correcta ? undefined : correcta.explicacionHtml });
  }
  function responderVF(v: boolean) {
    if (props.tipo !== 'verdadero-falso') return;
    const ok = v === props.respuesta;
    registrar(ok);
    setHecho({ ok, html: props.justificacionHtml });
  }

  return (
    <article className="ejercicio" data-tipo={props.tipo} id={id.split('#')[1]}>
      <div className="ejercicio-tipo"><span>Ejercicio · {ETIQUETA[props.tipo]}</span></div>
      <div className="enunciado"><Html html={enunciadoHtml} /></div>

      {props.tipo === 'numerico' && (
        <form onSubmit={corregirNum} noValidate>
          <div className="entrada-num">
            <label htmlFor={`${uid}-n`}>Tu respuesta</label>
            <span className="campo">
              <input ref={inputRef} id={`${uid}-n`} inputMode="decimal" autoComplete="off" value={entrada} disabled={!!hecho}
                onChange={(e) => { setEntrada(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? `${uid}-e` : undefined} />
              {props.unidad && <span className="unidad">{props.unidad}</span>}
            </span>
            {!hecho && <button className="btn btn-marca" type="submit">Corregir</button>}
            {error && <p id={`${uid}-e`} className="error-campo" role="alert">{error}</p>}
          </div>
        </form>
      )}

      {props.tipo === 'opcion-multiple' && (
        <form onSubmit={corregirOM}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="solo-lectores">Elegí una opción</legend>
            <div className="opciones">
              {props.opciones.map((o, i) => {
                const marca = hecho ? (o.correcta ? 'correcta' : elegida === i ? 'incorrecta' : '') : '';
                return (
                  <label key={i} className={`opcion ${marca}`}>
                    <input type="radio" name={uid} checked={elegida === i} disabled={!!hecho} onChange={() => setElegida(i)} />
                    <Html html={o.textoHtml} />
                  </label>
                );
              })}
            </div>
          </fieldset>
          {!hecho && <button className="btn btn-marca" type="submit" disabled={elegida === null}>Corregir</button>}
        </form>
      )}

      {props.tipo === 'verdadero-falso' && !hecho && (
        <div className="vf">
          <button type="button" className="btn" onClick={() => responderVF(true)}>Verdadero</button>
          <button type="button" className="btn" onClick={() => responderVF(false)}>Falso</button>
        </div>
      )}

      <div role="status" aria-live="polite">
        {hecho && (
          <div className={`resultado ${hecho.ok ? 'ok' : 'mal'}`} data-testid="resultado-ejercicio" data-ok={hecho.ok}>
            <strong className="veredicto">{hecho.ok ? 'Bien' : props.tipo === 'opcion-multiple' || props.tipo === 'verdadero-falso' ? 'No era esa' : 'No da'}</strong>
            <Html html={hecho.html} />
            {hecho.extra && <div className="por-opcion"><strong>La cuenta correcta</strong><Html html={hecho.extra} /></div>}
          </div>
        )}
      </div>

      <div className="ejercicio-pie">
        <span data-testid="intentos">Intentos: {intentos} · Aciertos: {aciertos}</span>
        {hecho && <button type="button" className="btn btn-chico" onClick={reiniciar}>Probar de nuevo</button>}
      </div>
    </article>
  );
}
