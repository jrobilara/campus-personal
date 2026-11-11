// Hooks que combinan catálogo + progreso + reloj para las islas de portada, panel y repaso.
import { useEffect, useMemo, useState } from 'react';
import { useCatalogo } from './catalogo-cliente';
import { useProgreso } from './store';
import { contarParaHoy, construirCola } from './repaso';
import { calcularPanel, type Panel } from './metricas';
import { leerAjustes } from './ajustes';

/** Reloj que se actualiza cada `ms` (para que las tarjetas en aprendizaje vuelvan a su hora). */
export function useAhora(ms = 30_000): Date {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), ms); return () => clearInterval(t); }, [ms]);
  return ahora;
}

export function useParaHoy() {
  const cat = useCatalogo();
  const p = useProgreso();
  const ahora = useAhora();
  return useMemo(() => {
    if (!cat || !p) return null;
    const cola = construirCola(cat, p, ahora, leerAjustes().nuevasPorDia);
    return { total: contarParaHoy(cola), vencidas: cola.vencidas.length + cola.masTarde.length, nuevas: cola.nuevas.length };
  }, [cat, p, ahora]);
}

export function usePanel(): { panel: Panel | null; catalogo: ReturnType<typeof useCatalogo> } {
  const cat = useCatalogo();
  const p = useProgreso();
  const ahora = useAhora(60_000);
  const [panel, setPanel] = useState<Panel | null>(null);
  useEffect(() => {
    if (!cat || !p) return;
    let vivo = true;
    calcularPanel(cat, p, ahora, leerAjustes().nuevasPorDia).then((x) => vivo && setPanel(x));
    return () => { vivo = false; };
  }, [cat, p, ahora]);
  return { panel, catalogo: cat };
}
