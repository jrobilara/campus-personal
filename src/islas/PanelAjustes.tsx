import { useEffect, useRef, useState } from 'react';
import { useCatalogo } from '../progreso/catalogo-cliente';
import { guardarAjustes, leerAjustes, type TemaPreferido } from '../progreso/ajustes';
import {
  analizarImport, confirmarImport, contarHuerfanos, deshacerImportacion, exportarProgreso, hayCopiaPrevia, limpiarHuerfanos,
  reiniciarProgreso, type ResumenImport,
} from '../progreso/importar';
import { almacenIdb, avisarCambioExterno, leerProgreso, mutar, useProgreso } from '../progreso/store';
import type { ProgresoV1 } from '../progreso/esquema';

const fmtFecha = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : 'sin fecha');

export default function PanelAjustes() {
  const cat = useCatalogo();
  const progreso = useProgreso();
  const [ajustes, setAjustes] = useState(() => leerAjustes());
  const [nuevas, setNuevas] = useState(String(ajustes.nuevasPorDia));
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'mal' | 'info'; texto: string } | null>(null);
  const [pendiente, setPendiente] = useState<{ progreso: ProgresoV1; resumen: ResumenImport; actual: { tarjetas: number; dias: number } } | null>(null);
  const [hayCopia, setHayCopia] = useState(false);
  const [textoReiniciar, setTextoReiniciar] = useState('');
  const [confirmaHuerfanos, setConfirmaHuerfanos] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);

  useEffect(() => { void hayCopiaPrevia(almacenIdb).then(setHayCopia); }, [progreso]);
  const huerfanos = cat && progreso ? contarHuerfanos(progreso, cat) : 0;

  const cambiarTema = (tema: TemaPreferido) => setAjustes(guardarAjustes({ tema }));
  const cambiarNuevas = (v: string) => {
    setNuevas(v);
    const n = Number(v);
    if (v.trim() !== '' && Number.isInteger(n) && n >= 0 && n <= 50) setAjustes(guardarAjustes({ nuevasPorDia: n }));
  };
  const nuevasInvalido = nuevas.trim() === '' || !Number.isInteger(Number(nuevas)) || Number(nuevas) < 0 || Number(nuevas) > 50;

  async function exportar() {
    const p = await leerProgreso();
    const { nombre, texto } = exportarProgreso(p, new Date());
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMensaje({ tipo: 'ok', texto: `Exportaste tu progreso en ${nombre}.` });
  }

  async function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setPendiente(null);
    const texto = await f.text();
    const a = analizarImport(texto, cat ?? undefined);
    if (!a.ok) { setMensaje({ tipo: 'mal', texto: `No importé nada y tu progreso sigue igual. ${a.error}` }); return; }
    const actual = await leerProgreso();
    setMensaje(null);
    setPendiente({ progreso: a.progreso, resumen: a.resumen, actual: { tarjetas: Object.keys(actual.tarjetas).length, dias: Object.keys(actual.diasDeEstudio).length } });
  }
  async function confirmar() {
    if (!pendiente) return;
    await confirmarImport(pendiente.progreso, almacenIdb);
    await avisarCambioExterno();
    setPendiente(null);
    setMensaje({ tipo: 'ok', texto: 'Listo: importé el progreso. Si te equivocaste de archivo, podés deshacer la importación.' });
  }
  async function deshacer() {
    const ok = await deshacerImportacion(almacenIdb);
    await avisarCambioExterno();
    setMensaje(ok ? { tipo: 'ok', texto: 'Volví a tu progreso de antes de importar.' } : { tipo: 'info', texto: 'No hay nada que deshacer.' });
  }
  async function limpiar() {
    if (!cat) return;
    await mutar((p) => limpiarHuerfanos(p, cat));
    setConfirmaHuerfanos(false);
    setMensaje({ tipo: 'ok', texto: 'Borré los elementos de temas que ya no existen.' });
  }
  async function reiniciar() {
    await reiniciarProgreso(almacenIdb);
    await avisarCambioExterno();
    setTextoReiniciar('');
    setMensaje({ tipo: 'ok', texto: 'Reinicié tu progreso. Tus ajustes quedaron como estaban.' });
  }

  return (
    <div className="ajustes">
      <div role="status" aria-live="polite">
        {mensaje && <div className={`aviso ${mensaje.tipo}`} data-testid="mensaje-ajustes"><p style={{ whiteSpace: 'pre-line' }}>{mensaje.texto}</p></div>}
      </div>

      <section className="bloque" aria-labelledby="tema-t">
        <h2 id="tema-t">Tema</h2>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="solo-lectores">Tema de colores</legend>
          <div className="segmentos" role="radiogroup">
            {([['claro', 'Claro'], ['oscuro', 'Oscuro'], ['sistema', 'Del sistema']] as const).map(([v, t]) => (
              <label key={v}><input type="radio" name="tema" value={v} checked={ajustes.tema === v} onChange={() => cambiarTema(v)} /><span>{t}</span></label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="bloque" aria-labelledby="nuevas-t">
        <h2 id="nuevas-t">Tarjetas nuevas por día</h2>
        <p className="meta">Cuántas tarjetas que nunca viste entran al repaso cada día (de 0 a 50). Más es más carga.</p>
        <label className="fila-acciones" style={{ marginTop: 0 }}>
          <input className="campo-simple" type="number" inputMode="numeric" min={0} max={50} value={nuevas} onChange={(e) => cambiarNuevas(e.target.value)} aria-invalid={nuevasInvalido} />
          <span>por día</span>
        </label>
        {nuevasInvalido && <p className="error-campo" role="alert">Poné un número entero de 0 a 50.</p>}
      </section>

      <section className="bloque" aria-labelledby="pasar-t">
        <h2 id="pasar-t">Pasar el progreso a otro dispositivo</h2>
        <p className="meta">Exportá un archivo y abrilo en el otro dispositivo con “Importar progreso”. Importar reemplaza el progreso que tengas ahí.</p>
        <div className="fila-acciones">
          <button type="button" className="btn btn-marca" onClick={exportar}>Exportar progreso</button>
          <button type="button" className="btn" onClick={() => archivo.current?.click()}>Importar progreso</button>
          <input ref={archivo} className="archivo-oculto" type="file" accept="application/json,.json" onChange={elegirArchivo} data-testid="archivo-importar" aria-label="Archivo de progreso a importar" tabIndex={-1} />
          {hayCopia && <button type="button" className="btn" onClick={deshacer}>Deshacer la importación</button>}
        </div>
        {pendiente && (
          <div className="aviso info" data-testid="confirmar-importacion" role="alertdialog" aria-label="Confirmar importación">
            <p>
              Vas a reemplazar tu progreso actual ({pendiente.actual.tarjetas} tarjetas, {pendiente.actual.dias} días) por el del archivo
              ({pendiente.resumen.tarjetas} tarjetas, {pendiente.resumen.dias} días, exportado el {fmtFecha(pendiente.resumen.exportadoEn)}). ¿Seguir?
            </p>
            {pendiente.resumen.huerfanos > 0 && <p>{pendiente.resumen.huerfanos} elementos son de temas que ya no existen: se guardan, pero no cuentan.</p>}
            <div className="fila-acciones">
              <button type="button" className="btn btn-marca" onClick={confirmar}>Reemplazar mi progreso</button>
              <button type="button" className="btn" onClick={() => setPendiente(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>

      {huerfanos > 0 && (
        <section className="bloque" aria-labelledby="huer-t">
          <h2 id="huer-t">Elementos huérfanos</h2>
          <p className="meta">Tenés {huerfanos} elementos de temas que ya no existen. No cuentan en el panel ni entran al repaso.</p>
          <div className="fila-acciones">
            {confirmaHuerfanos ? (
              <>
                <button type="button" className="btn btn-peligro" onClick={limpiar}>Sí, borrarlos</button>
                <button type="button" className="btn" onClick={() => setConfirmaHuerfanos(false)}>Cancelar</button>
              </>
            ) : (
              <button type="button" className="btn" onClick={() => setConfirmaHuerfanos(true)}>Limpiar elementos huérfanos</button>
            )}
          </div>
        </section>
      )}

      <section className="bloque" aria-labelledby="reini-t">
        <h2 id="reini-t">Reiniciar progreso</h2>
        <p className="meta">Borra tus tarjetas, ejercicios, casos y días de estudio de este navegador. No se puede deshacer: exportá antes si querés guardar una copia. Para confirmar, escribí <code>REINICIAR</code>.</p>
        <div className="fila-acciones">
          <input className="campo-simple" style={{ width: '11rem' }} value={textoReiniciar} onChange={(e) => setTextoReiniciar(e.target.value)} aria-label="Escribí REINICIAR para confirmar" autoComplete="off" />
          <button type="button" className="btn btn-peligro" disabled={textoReiniciar !== 'REINICIAR'} onClick={reiniciar}>Reiniciar progreso</button>
        </div>
      </section>
    </div>
  );
}
