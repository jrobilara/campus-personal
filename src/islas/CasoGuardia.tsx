import { useEffect, useRef, useState } from 'react';
import { useCaso, type ResultadoCaso } from '../progreso/uso';

type Opcion = { textoHtml: string; va: string; consecuenciaHtml: string };
type Nodo =
  | { id: string; tipo: 'decision'; textoHtml: string; opciones: Opcion[] }
  | { id: string; tipo: 'desenlace'; resultado: ResultadoCaso; textoHtml: string };
export interface PropsCaso {
  id: string;
  titulo: string;
  rolHtml: string;
  contextoHtml: string;
  inicio: string;
  nodos: Nodo[];
  leccionHtml: string;
}

const Html = ({ html, bloque = true }: { html: string; bloque?: boolean }) =>
  bloque ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
const TITULO_RESULTADO: Record<ResultadoCaso, string> = { bien: 'Salió bien', regular: 'Salió a medias', mal: 'Salió mal' };

export default function CasoGuardia({ id, titulo, rolHtml, contextoHtml, inicio, nodos, leccionHtml }: PropsCaso) {
  const { intentos, mejor, ultimo, registrar } = useCaso(id);
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const [actual, setActual] = useState(inicio);
  const [pasos, setPasos] = useState<{ opcion: Opcion }[]>([]);
  const [pendiente, setPendiente] = useState<Opcion | null>(null);
  const nodo = porId.get(actual)!;
  const registrado = useRef<string | null>(null);
  const foco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodo.tipo === 'desenlace' && registrado.current !== `${pasos.length}`) {
      registrado.current = `${pasos.length}`;
      registrar(nodo.resultado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual]);

  const elegir = (o: Opcion) => setPendiente(o);
  const seguir = () => {
    if (!pendiente) return;
    setPasos((p) => [...p, { opcion: pendiente }]);
    setActual(pendiente.va);
    setPendiente(null);
    setTimeout(() => foco.current?.focus(), 0);
  };
  const reiniciar = () => { setActual(inicio); setPasos([]); setPendiente(null); registrado.current = null; setTimeout(() => foco.current?.focus(), 0); };

  return (
    <article className="caso" id={id.split('#')[1]} data-testid="caso-guardia">
      <div className="caso-cab">
        <h4>{titulo}</h4>
        <div className="rol"><Html html={rolHtml} bloque={false} /></div>
      </div>
      <div className="caso-cuerpo">
        <div className="caso-contexto"><Html html={contextoHtml} /></div>

        {pasos.length > 0 && (
          <ol className="linea-tiempo" aria-label="Lo que hiciste hasta ahora">
            {pasos.map((p, i) => (
              <li key={i}>
                <span className="eleccion"><Html html={p.opcion.textoHtml} bloque={false} /></span>
                <span className="efecto"><Html html={p.opcion.consecuenciaHtml} bloque={false} /></span>
              </li>
            ))}
          </ol>
        )}

        <div ref={foco} tabIndex={-1} style={{ outline: 'none' }} aria-live="polite">
          {pendiente ? (
            <>
              <div className="consecuencia" data-testid="consecuencia">
                <Html html={pendiente.consecuenciaHtml} />
              </div>
              <button type="button" className="btn btn-marca" onClick={seguir}>Seguir</button>
            </>
          ) : nodo.tipo === 'decision' ? (
            <div className="decision">
              <div className="decision-texto"><Html html={nodo.textoHtml} /></div>
              <div className="decision-opciones">
                {nodo.opciones.map((o, i) => (
                  <button key={i} type="button" onClick={() => elegir(o)}><Html html={o.textoHtml} bloque={false} /></button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`desenlace ${nodo.resultado}`} data-testid="desenlace" data-resultado={nodo.resultado}>
              <h5>{TITULO_RESULTADO[nodo.resultado]}</h5>
              <Html html={nodo.textoHtml} />
              <div className="leccion"><strong>Lo que te llevás</strong><Html html={leccionHtml} /></div>
              <p style={{ margin: '0.9rem 0 0' }}><button type="button" className="btn" onClick={reiniciar}>Probar otro camino</button></p>
            </div>
          )}
        </div>

        <p className="caso-pie">
          <span data-testid="intentos-caso">Intentos: {intentos}</span>
          {mejor && <span>Mejor resultado: {mejor}</span>}
          {ultimo && <span>Último: {ultimo}</span>}
        </p>
      </div>
    </article>
  );
}
