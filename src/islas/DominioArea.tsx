import { usePanel } from '../progreso/hooks';

/** Medidor de dominio (0-100) de un área, con su número al lado. */
export default function DominioArea({ areaId }: { areaId: string }) {
  const { panel } = usePanel();
  const a = panel?.areas.find((x) => x.id === areaId);
  return (
    <>
      <span className="medidor" role="img" aria-label={a ? `Dominio ${a.dominio} de 100` : 'Dominio sin calcular'}>
        <i style={{ ['--valor' as string]: `${a?.dominio ?? 0}%` }} />
      </span>
      <span data-testid={`dominio-${areaId}`} style={{ fontVariantNumeric: 'tabular-nums', minWidth: '2.4rem', textAlign: 'right' }}>{a ? `${a.dominio} %` : '–'}</span>
    </>
  );
}
