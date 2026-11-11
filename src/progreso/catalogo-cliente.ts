import { url } from '../lib/url';
import type { Catalogo } from './tipos';
import { useEffect, useState } from 'react';

let memo: Promise<Catalogo> | undefined;
export function cargarCatalogo(): Promise<Catalogo> {
  memo ??= fetch(url('catalogo.json')).then((r) => {
    if (!r.ok) throw new Error(`catalogo.json: ${r.status}`);
    return r.json() as Promise<Catalogo>;
  }).catch((e) => { memo = undefined; throw e; });
  return memo;
}

/** `null` mientras carga; `undefined` si falló. */
export function useCatalogo(): Catalogo | null | undefined {
  const [c, setC] = useState<Catalogo | null | undefined>(null);
  useEffect(() => { cargarCatalogo().then(setC, () => setC(undefined)); }, []);
  return c;
}
