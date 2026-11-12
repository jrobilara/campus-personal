// Isla del simulador SimFlujo (SIMULADORES.md §2.8): pedidos y mensajes que viajan entre piezas. Cuatro modos.
// La lógica vive en src/simuladores/flujo/*.ts (pura); cada modo tiene su vista en flujo/Vista*.tsx.
import type { PropsSimFlujo } from './props';
import VistaBalanceador from './flujo/VistaBalanceador';
import VistaCadena from './flujo/VistaCadena';
import VistaCola from './flujo/VistaCola';
import VistaSincrono from './flujo/VistaSincrono';

export default function SimFlujo(props: PropsSimFlujo) {
  switch (props.modo) {
    case 'balanceador': return <VistaBalanceador {...props} />;
    case 'cola': return <VistaCola {...props} />;
    case 'sincrono-vs-asincrono': return <VistaSincrono {...props} />;
    case 'cadena': return <VistaCadena {...props} />;
  }
}
