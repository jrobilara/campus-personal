// Hooks de las islas de práctica: leen y escriben el progreso real.
import { registrarCaso, registrarEjercicio, useProgreso } from './store';

export type ResultadoCaso = 'bien' | 'regular' | 'mal';

export function useEjercicio(id: string) {
  const p = useProgreso();
  const e = p?.ejercicios[id];
  return { intentos: e?.intentos ?? 0, aciertos: e?.aciertos ?? 0, registrar: (ok: boolean) => void registrarEjercicio(id, ok) };
}

export function useCaso(id: string) {
  const p = useProgreso();
  const c = p?.casos[id];
  return {
    intentos: c?.intentos ?? 0,
    mejor: c?.mejorResultado as ResultadoCaso | undefined,
    ultimo: c?.ultimoResultado as ResultadoCaso | undefined,
    registrar: (r: ResultadoCaso) => void registrarCaso(id, r),
  };
}
