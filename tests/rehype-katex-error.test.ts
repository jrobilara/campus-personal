// rehype-katex no tira error con LaTeX inválido (deja <span class="katex-error">): este plugin rompe el build.
import { describe, expect, it } from 'vitest';
import rehypeSinKatexError from '../src/lib/rehype-sin-katex-error.mjs';

const el = (tag: string, className: string[] | undefined, children: unknown[] = [], extra: Record<string, unknown> = {}) => ({ type: 'element', tagName: tag, properties: { ...(className ? { className } : {}), ...extra }, children });
const texto = (value: string) => ({ type: 'text', value });

describe('rehypeSinKatexError', () => {
  const pasar = rehypeSinKatexError();
  it('deja pasar un árbol con fórmulas bien renderizadas', () => {
    const arbol = { type: 'root', children: [el('span', ['katex'], [el('span', ['katex-html'], [texto('x')])])] };
    expect(() => pasar(arbol, { path: 'a.mdx' })).not.toThrow();
  });
  it('rompe con el archivo, la fórmula y el motivo de KaTeX', () => {
    const roto = el('span', ['katex-error'], [texto('\\frac{x')], { title: 'ParseError: KaTeX parse error: Unexpected end of input' });
    const arbol = { type: 'root', children: [el('p', undefined, [texto('hola '), el('em', undefined, [roto])])] };
    expect(() => pasar(arbol, { path: `${process.cwd()}/src/content/temas/soporte/x/tema.mdx` })).toThrow(
      /\[contenido\] src\/content\/temas\/soporte\/x\/tema\.mdx → fórmula inválida "\\frac\{x": ParseError/,
    );
  });
});
