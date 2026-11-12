import { useEffect, useRef, useState } from 'react';
import { url } from '../lib/url';

interface Resultado { url: string; titulo: string; area: string; extracto: string }
interface Pagefind {
  options(o: Record<string, unknown>): Promise<void>;
  init(): Promise<void>;
  filters(): Promise<Record<string, Record<string, number>>>;
  search(q: string, o?: { filters?: Record<string, string> }): Promise<{ results: { data(): Promise<{ url: string; excerpt: string; meta: Record<string, string> }> }[] }>;
}

let cargado: Promise<Pagefind> | undefined;
/** Carga el índice de Pagefind construido (no existe en `npm run dev`). */
function cargarPagefind(): Promise<Pagefind> {
  cargado ??= (async () => {
    const pf = (await import(/* @vite-ignore */ url('pagefind/pagefind.js'))) as Pagefind;
    await pf.options({ baseUrl: import.meta.env.BASE_URL });
    await pf.init();
    return pf;
  })().catch((e) => { cargado = undefined; throw e; });
  return cargado;
}

export default function Buscador() {
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get('q') ?? '');
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [res, setRes] = useState<Resultado[] | null>(null);
  const [estado, setEstado] = useState<'listo' | 'buscando' | 'sin-indice'>('listo');
  const pedido = useRef(0);

  useEffect(() => {
    cargarPagefind().then((pf) => pf.filters()).then((f) => setAreas(Object.keys(f.area ?? {}).sort()), () => setEstado('sin-indice'));
  }, []);

  useEffect(() => {
    const texto = q.trim();
    const mio = ++pedido.current; // también al vaciar: una búsqueda en vuelo no tiene que repoblar la lista de un campo ya vacío
    if (!texto) { setRes(null); setEstado((e) => (e === 'buscando' ? 'listo' : e)); return; }
    const t = setTimeout(async () => {
      setEstado('buscando');
      try {
        const pf = await cargarPagefind();
        const r = await pf.search(texto, area ? { filters: { area } } : undefined);
        const datos = await Promise.all(r.results.slice(0, 10).map((x) => x.data()));
        if (mio !== pedido.current) return;
        setRes(datos.map((d) => ({ url: d.url, titulo: d.meta.title ?? d.url, area: d.meta.area ?? '', extracto: d.excerpt })));
        setEstado('listo');
      } catch {
        if (mio === pedido.current) setEstado('sin-indice');
      }
    }, 150);
    return () => clearTimeout(t);
  }, [q, area]);

  return (
    <div className="buscador">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="buscador-campo">
        <label className="solo-lectores" htmlFor="q">Buscar en los temas, tarjetas y ejercicios</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Por ejemplo: varianza" autoComplete="off" autoFocus />
        {areas.length > 0 && (
          <>
            <label className="solo-lectores" htmlFor="area">Filtrar por área</label>
            <select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas las áreas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </>
        )}
      </form>

      <div aria-live="polite">
        {estado === 'sin-indice' && (
          <div className="aviso info" data-testid="buscador-sin-indice">
            <p>El buscador funciona en el sitio construido (<code>npm run build &amp;&amp; npm run preview</code>). Si ya lo estás usando acá, recargá la página.</p>
          </div>
        )}
        {res && res.length === 0 && estado === 'listo' && (
          <div className="vacio" style={{ marginTop: '1.2rem' }}>
            <h2>No encontré nada para “{q.trim()}”</h2>
            <p>Probá con otra palabra, en singular o sin tildes.</p>
          </div>
        )}
        {res && res.length > 0 && (
          <>
            <p className="meta" style={{ marginTop: '1rem' }} data-testid="buscador-cantidad">{res.length} {res.length === 1 ? 'resultado' : 'resultados'}</p>
            <ul className="resultados" data-testid="resultados">
              {res.map((r) => (
                <li key={r.url} className="resultado-busqueda">
                  {r.area && <span className="area-etiqueta">{r.area}</span>}
                  <h3><a href={r.url}>{r.titulo}</a></h3>
                  <p dangerouslySetInnerHTML={{ __html: r.extracto }} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
