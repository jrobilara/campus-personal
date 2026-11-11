import { useCatalogo } from '../progreso/catalogo-cliente';
import { useProgreso } from '../progreso/store';

export default function AvanceTema({ temaId }: { temaId: string }) {
  const cat = useCatalogo();
  const p = useProgreso();
  if (!cat || !p) return <div className="paso-progreso" aria-hidden="true" />;
  const t = cat.tarjetas.filter((x) => x.tema === temaId);
  const e = cat.ejercicios.filter((x) => x.tema === temaId);
  const vistas = t.filter((x) => p.tarjetas[x.id]).length;
  const bien = e.filter((x) => p.ejercicios[x.id]?.ultimoResultado === 'acierto').length;
  const pct = t.length ? Math.round((vistas / t.length) * 100) : 0;
  if (vistas === 0 && bien === 0) return <div className="paso-progreso"><span>Sin empezar</span></div>;
  return (
    <div className="paso-progreso">
      <span className="medidor" role="img" aria-label={`${pct} % de las tarjetas vistas`}><i style={{ ['--valor' as string]: `${pct}%` }} /></span>
      <span>{vistas} de {t.length} tarjetas · {bien} de {e.length} ejercicios bien</span>
    </div>
  );
}
