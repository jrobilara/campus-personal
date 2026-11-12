// KaTeX para los renders propios (texto corto de practica.yaml y <Formula>). Igual que con rehype-katex (rehype-katex-sin-indice.mjs),
// el bloque MathML oculto —que repite la fórmula y trae el LaTeX fuente— se excluye del índice de Pagefind
// para que buscar "frac" o "zzz" no devuelva temas por culpa de las fórmulas.
import katex from 'katex';

export function renderKatex(tex: string, opciones: katex.KatexOptions = {}): string {
  return katex
    .renderToString(tex, { throwOnError: true, ...opciones })
    .replace('<span class="katex-mathml">', '<span class="katex-mathml" data-pagefind-ignore="all">');
}
