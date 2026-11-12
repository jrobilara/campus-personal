// Isla del simulador SimFuncion (SIMULADORES.md §2.1): tres modos (tangente, descenso, señal) sobre Mafs.
import ModoDescenso from './funcion/ModoDescenso';
import ModoSenal from './funcion/ModoSenal';
import ModoTangente from './funcion/ModoTangente';
import type { PropsSimFuncion } from './props';

export default function SimFuncion(props: PropsSimFuncion) {
  switch (props.modo) {
    case 'tangente':
      return <ModoTangente funcion={props.funcion} x0={props.x0} mostrarSecante={props.mostrarSecante} rango={props.rango} />;
    case 'descenso':
      return <ModoDescenso funcion={props.funcion} x0={props.x0} tasa={props.tasa} pasosMax={props.pasosMax} />;
    case 'senal':
      return (
        <ModoSenal
          componentes={props.componentes} ruido={props.ruido} muestreo={props.muestreo}
          frecuenciaMuestreo={props.frecuenciaMuestreo} filtro={props.filtro} semilla={props.semilla}
        />
      );
  }
}
