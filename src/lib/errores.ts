// Mensajes de error de contenido con el archivo del tema, deducido de la ruta de la página.
import { url } from './url';

/** `/campus-personal/soporte/prioridad-y-sla/` → `src/content/temas/soporte/prioridad-y-sla/tema.mdx` */
export function archivoDeTemaDesdeRuta(pathname: string): string {
  const base = url();
  const ruta = (pathname.startsWith(base) ? pathname.slice(base.length) : pathname).replace(/^\/+|\/+$/g, '');
  if (ruta === 'ejemplo') return 'src/content/temas/ejemplo/media-y-mediana/tema.mdx';
  return `src/content/temas/${ruta}/tema.mdx`;
}

export function errorDeComponente(pathname: string, componente: string, prop: string, mensaje: string): Error {
  return new Error(`[contenido] ${archivoDeTemaDesdeRuta(pathname)} → <${componente}> prop "${prop}": ${mensaje}`);
}
