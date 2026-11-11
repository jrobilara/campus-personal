import { useEffect, useMemo, useRef, useState } from 'react';
import { url } from '../lib/url';
import { useCatalogo } from '../progreso/catalogo-cliente';
import { calificarTarjeta, useProgreso } from '../progreso/store';
import { construirCola } from '../progreso/repaso';
import { crearPlanificador, intervalosPrevistos, type Nota, type Planificador } from '../progreso/fsrs';
import { leerAjustes } from '../progreso/ajustes';
import { useAhora } from '../progreso/hooks';

const BOTONES: { nota: Nota; texto: string; clase: string }[] = [
  { nota: 1, texto: 'Otra vez', clase: 'n1' },
  { nota: 2, texto: 'Difícil', clase: 'n2' },
  { nota: 3, texto: 'Bien', clase: 'n3' },
  { nota: 4, texto: 'Fácil', clase: 'n4' },
];

export default function Repaso() {
  const cat = useCatalogo();
  const p = useProgreso();
  const ahora = useAhora(15_000);
  const [plan, setPlan] = useState<Planificador | null>(null);
  const [mostrada, setMostrada] = useState(false);
  const [hechas, setHechas] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [filtro] = useState(() => {
    const q = new URLSearchParams(location.search);
    return { tema: q.get('tema') ?? undefined, area: q.get('area') ?? undefined };
  });
  const botonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { void crearPlanificador().then(setPlan); }, []);

  const cola = useMemo(
    () => (cat && p ? construirCola(cat, p, ahora, leerAjustes().nuevasPorDia, filtro) : null),
    [cat, p, ahora, filtro],
  );
  const actual = cola ? (cola.vencidas[0] ?? cola.nuevas[0]) : undefined;
  const restantes = cola ? cola.vencidas.length + cola.nuevas.length : 0;
  const intervalos = useMemo(() => (plan && p && actual ? intervalosPrevistos(plan, p, actual.id, ahora) : null), [plan, p, actual, ahora]);

  const calificar = async (nota: Nota) => {
    if (!actual || ocupado) return;
    setOcupado(true);
    await calificarTarjeta(actual.id, nota);
    setHechas((h) => h + 1);
    setMostrada(false);
    setOcupado(false);
  };

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey || !actual) return;
      if (e.key === ' ' && !mostrada) { e.preventDefault(); setMostrada(true); }
      else if (mostrada && ['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); void calificar(Number(e.key) as Nota); }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  if (cat === undefined) return <div className="aviso mal" role="alert"><p>No pude cargar el catálogo de tarjetas. Si estás sin conexión, abrí el sitio una vez con internet para que quede guardado.</p></div>;
  if (!cat || !p || !cola) return <p className="meta" aria-busy="true">Cargando tus tarjetas…</p>;

  const area = actual ? cat.areas.find((a) => a.id === actual.area) : undefined;
  const tema = actual ? cat.temas.find((t) => t.id === actual.tema) : undefined;
  const filtroTema = filtro.tema ? cat.temas.find((t) => t.id === filtro.tema) : undefined;
  const filtroArea = filtro.area ? cat.areas.find((a) => a.id === filtro.area) : undefined;
  const total = hechas + restantes;

  return (
    <div className="repaso">
      {(filtroTema || filtroArea) && (
        <p className="meta">Repasando solo: <strong>{filtroTema?.titulo ?? filtroArea?.nombre}</strong> · <a href={url('repaso/')}>Ver todo lo de hoy</a></p>
      )}
      <div className="repaso-avance" aria-label={`Llevás ${hechas} de ${total}`}>
        <span className="medidor"><i style={{ ['--valor' as string]: `${total ? (hechas / total) * 100 : 0}%` }} /></span>
        <span data-testid="repaso-restantes">{restantes === 0 ? 'Terminaste' : `Faltan ${restantes}`}</span>
      </div>

      {actual ? (
        <article className="tarjeta-repaso" style={{ ['--area-claro' as string]: area?.color, ['--area-oscuro' as string]: area?.colorOscuro }} data-testid="tarjeta-repaso" data-id={actual.id}>
          <p className="tarjeta-origen">{area?.nombre} · {tema?.titulo}</p>
          <div className="tarjeta-frente" dangerouslySetInnerHTML={{ __html: actual.frenteHtml }} />
          {mostrada ? (
            <>
              <div className="tarjeta-dorso" data-testid="dorso" dangerouslySetInnerHTML={{ __html: actual.dorsoHtml }} />
              <p className="meta" style={{ margin: '1.2rem 0 0.5rem' }}>¿Qué tan bien te salió?</p>
              <div className="notas">
                {BOTONES.map((b) => (
                  <button key={b.nota} type="button" className={`nota-btn ${b.clase}`} onClick={() => calificar(b.nota)} disabled={ocupado} data-nota={b.nota}>
                    <span>{b.texto}</span>
                    <small>{intervalos?.[b.nota] ?? ''}</small>
                    <kbd>{b.nota}</kbd>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button ref={botonRef} type="button" className="btn btn-marca mostrar" onClick={() => setMostrada(true)} autoFocus>
              Mostrar respuesta <kbd>espacio</kbd>
            </button>
          )}
        </article>
      ) : (
        <div className="vacio" data-testid="repaso-fin">
          <h2>{hechas > 0 ? `Listo: repasaste ${hechas} ${hechas === 1 ? 'tarjeta' : 'tarjetas'}` : 'No hay nada para repasar ahora'}</h2>
          {cola.masTarde.length > 0 && <p>Te quedan {cola.masTarde.length} para más tarde hoy: van a aparecer acá cuando les toque.</p>}
          {cola.nuevasFuera > 0 && <p>Hay {cola.nuevasFuera} tarjetas nuevas más. Entran mañana, o subí el límite diario en Ajustes.</p>}
          {cola.masTarde.length === 0 && cola.nuevasFuera === 0 && <p>Las próximas vencen otro día. Mientras tanto, leé un tema o resolvé ejercicios.</p>}
          <p style={{ marginTop: '1.2rem', display: 'flex', gap: '.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-marca" href={url('progreso/')}>Ver tu progreso</a>
            <a className="btn" href={url('')}>Ir al inicio</a>
          </p>
        </div>
      )}
    </div>
  );
}
