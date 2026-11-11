// Hito 1: versión provisoria en memoria. El hito 2 la reemplaza por el progreso real (IndexedDB) con la misma firma.
import { useState } from 'react';

export function useEjercicio(_id: string) {
  const [s, set] = useState({ intentos: 0, aciertos: 0 });
  return { ...s, registrar: (ok: boolean) => set((p) => ({ intentos: p.intentos + 1, aciertos: p.aciertos + (ok ? 1 : 0) })) };
}

export type ResultadoCaso = 'bien' | 'regular' | 'mal';
export function useCaso(_id: string) {
  const [s, set] = useState<{ intentos: number; mejor?: ResultadoCaso; ultimo?: ResultadoCaso }>({ intentos: 0 });
  return { ...s, registrar: (r: ResultadoCaso) => set((p) => ({ intentos: p.intentos + 1, mejor: p.mejor ?? r, ultimo: r })) };
}
