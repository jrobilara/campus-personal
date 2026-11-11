// Ajustes del dispositivo: localStorage (no viajan en el export). Todo con try/catch: puede no estar disponible.
export type TemaPreferido = 'claro' | 'oscuro' | 'sistema';
export interface Ajustes { tema: TemaPreferido; nuevasPorDia: number }
export const AJUSTES_POR_DEFECTO: Ajustes = { tema: 'sistema', nuevasPorDia: 10 };
const CLAVE = 'campus:ajustes';

export function leerAjustes(): Ajustes {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Partial<Ajustes>;
    const tema = crudo.tema === 'claro' || crudo.tema === 'oscuro' || crudo.tema === 'sistema' ? crudo.tema : AJUSTES_POR_DEFECTO.tema;
    const n = Number(crudo.nuevasPorDia);
    const nuevasPorDia = Number.isInteger(n) && n >= 0 && n <= 50 ? n : AJUSTES_POR_DEFECTO.nuevasPorDia;
    return { tema, nuevasPorDia };
  } catch {
    return { ...AJUSTES_POR_DEFECTO };
  }
}
export function guardarAjustes(parcial: Partial<Ajustes>): Ajustes {
  const nuevo = { ...leerAjustes(), ...parcial };
  try { localStorage.setItem(CLAVE, JSON.stringify(nuevo)); } catch { /* sin almacenamiento: queda solo en memoria */ }
  window.dispatchEvent(new Event('campus:ajustes'));
  return nuevo;
}
