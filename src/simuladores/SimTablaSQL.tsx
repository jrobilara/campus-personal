// Isla del simulador SimTablaSQL (SIMULADORES.md). Stub del kit: la implementación real reemplaza este archivo sin cambiar las props.
import EnConstruccion from './EnConstruccion';
import type { PropsSimTablaSQL } from './props';

export default function SimTablaSQL(props: PropsSimTablaSQL) {
  return <EnConstruccion nombre="SimTablaSQL" props={props as Record<string, unknown>} />;
}
