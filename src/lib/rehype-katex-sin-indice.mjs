// rehype-katex genera cada fórmula dos veces: el HTML visible y un <span class="katex-mathml"> con MathML (que incluye
// <annotation> con el LaTeX fuente). Pagefind indexa los dos y las fórmulas ensucian el buscador con "frac", "operatorname", etc.
// Este plugin va DESPUÉS de rehype-katex y marca el bloque MathML con data-pagefind-ignore para que no entre al índice.
export default function rehypeKatexSinIndice() {
  return (arbol) => {
    const visitar = (nodo) => {
      const clases = nodo?.properties?.className;
      if (nodo?.type === 'element' && Array.isArray(clases) && clases.includes('katex-mathml')) {
        nodo.properties.dataPagefindIgnore = 'all';
        return;
      }
      (nodo?.children ?? []).forEach(visitar);
    };
    visitar(arbol);
  };
}
