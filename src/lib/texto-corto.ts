// "Texto corto" de practica.yaml (CONTRATO §8.1): **negrita**, *itálica*, `código`, $fórmula$,
// bloques de código con ``` y párrafos separados por línea en blanco. Sin listas, enlaces ni HTML.
// KaTeX con throwOnError: true: un LaTeX inválido rompe el build.
import katex from 'katex';

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function enLinea(texto: string): string {
  const guardados: string[] = [];
  const guardar = (html: string) => `\u0000${guardados.push(html) - 1}\u0000`;
  let t = texto
    .replace(/`([^`\n]+)`/g, (_, c: string) => guardar(`<code>${escapar(c)}</code>`))
    .replace(/\$([^$\n]+)\$/g, (_, f: string) => guardar(katex.renderToString(f, { throwOnError: true })));
  t = escapar(t)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i: string) => guardados[Number(i)]!);
}

/** Renderiza texto corto a HTML (bloques `<p>` y `<pre><code>`). */
export function textoCorto(fuente: string): string {
  const lineas = fuente.replace(/\r\n?/g, '\n').split('\n');
  const bloques: string[] = [];
  let parrafo: string[] = [];
  let codigo: string[] | null = null;
  const cerrarParrafo = () => {
    if (parrafo.length) bloques.push(`<p>${enLinea(parrafo.join(' '))}</p>`);
    parrafo = [];
  };
  for (const l of lineas) {
    if (/^\s*```/.test(l)) {
      if (codigo) {
        bloques.push(`<pre><code>${escapar(codigo.join('\n'))}</code></pre>`);
        codigo = null;
      } else {
        cerrarParrafo();
        codigo = [];
      }
    } else if (codigo) codigo.push(l);
    else if (l.trim() === '') cerrarParrafo();
    else parrafo.push(l.trim());
  }
  if (codigo) bloques.push(`<pre><code>${escapar(codigo.join('\n'))}</code></pre>`);
  cerrarParrafo();
  return bloques.join('\n');
}

/** Igual que `textoCorto` pero sin envolver en `<p>` si es un solo párrafo (para frentes/opciones en una línea). */
export function textoCortoEnLinea(fuente: string): string {
  const html = textoCorto(fuente);
  const m = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return m && !m[1]!.includes('</p>') ? m[1]! : html;
}
