import { url } from '../lib/url';
// Hito 1: provisorio. El hito 2 lo conecta al progreso.
export default function ParaHoy() {
  return (
    <div className="hoy">
      <a className="btn btn-marca" href={url('repaso/')}>Empezar el repaso</a>
    </div>
  );
}
