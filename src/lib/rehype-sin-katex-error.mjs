// rehype-katex no tira error con LaTeX inválido: deja un <span class="katex-error"> y sigue (verificado con rehype-katex 7.0.1,
// la opción throwOnError se ignora). Este plugin va DESPUÉS de rehype-katex y rompe el build con el archivo y el mensaje de KaTeX.
export default function rehypeSinKatexError() {
  return (arbol, archivo) => {
    const visitar = (nodo) => {
      const clases = nodo?.properties?.className;
      if (nodo?.type === 'element' && Array.isArray(clases) && clases.includes('katex-error')) {
        const tex = (nodo.children ?? []).map((c) => c.value ?? '').join('');
        const motivo = nodo.properties.title ?? 'LaTeX inválido';
        const ruta = String(archivo?.path ?? 'tema.mdx').replace(`${process.cwd()}/`, '');
        throw new Error(`[contenido] ${ruta} → fórmula inválida "${tex}": ${motivo}`);
      }
      (nodo?.children ?? []).forEach(visitar);
    };
    visitar(arbol);
  };
}
