// Isla mínima del hito 0: cada simulador real (hito 3) reemplaza esto sin cambiar las props.
interface Props {
  nombre: string;
  props: Record<string, unknown>;
}
export default function EnConstruccion({ nombre }: Props) {
  return (
    <div className="sim-en-construccion" role="status">
      Simulador en construcción ({nombre})
    </div>
  );
}
