import { url } from '../lib/url';
import { useCatalogo } from '../progreso/catalogo-cliente';
import { useParaHoy } from '../progreso/hooks';

export default function ParaHoy() {
  const hoy = useParaHoy();
  const sinCatalogo = useCatalogo() === undefined; // falló la descarga (por ejemplo, sin red y sin primera visita)
  const n = hoy?.total;
  return (
    <div className="hoy">
      <div className="hoy-n" aria-live="polite">
        <strong data-testid="para-hoy">{n ?? '–'}</strong>
        <span>
          {sinCatalogo ? 'sin datos' : n === undefined ? 'cargando' : n === 1 ? 'tarjeta' : 'tarjetas'}
          <br />
          para hoy
        </span>
      </div>
      <a className="btn btn-marca" href={url('repaso/')}>{n === 0 ? 'Ver el repaso' : 'Empezar el repaso'}</a>
    </div>
  );
}
