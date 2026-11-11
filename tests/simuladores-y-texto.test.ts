import { describe, expect, it } from 'vitest';
import { validarPropsSimulador } from '../src/simuladores/props';
import { textoCorto, textoCortoEnLinea } from '../src/lib/texto-corto';

describe('props de simuladores (Zod)', () => {
  it('las props del ejemplo validan', () => {
    const p = validarPropsSimulador('SimDatos', { consigna: 'Probá.', dataset: 'latencias', vistas: ['histograma', 'caja'] });
    expect(p.dataset).toBe('latencias');
  });
  it('un dataset inválido tira error con archivo, simulador y prop', () => {
    expect(() => validarPropsSimulador('SimDatos', { consigna: 'x', dataset: 'xx', vistas: ['caja'] }, 'src/content/temas/a/b/tema.mdx')).toThrow(
      /src\/content\/temas\/a\/b\/tema\.mdx → <SimDatos> prop "dataset"/,
    );
  });
  it('consigna obligatoria y prop desconocida rechazada', () => {
    expect(() => validarPropsSimulador('SimBayes', {})).toThrow(/prop "consigna"/);
    expect(() => validarPropsSimulador('SimBayes', { consigna: 'x', inventada: 1 })).toThrow(/inventada/);
  });
  it('uniones por modo', () => {
    expect(() => validarPropsSimulador('SimFuncion', { consigna: 'x', modo: 'descenso', funcion: 'seno' })).toThrow(/funcion/);
    expect(validarPropsSimulador('SimFuncion', { consigna: 'x', modo: 'tangente', funcion: 'seno' }).modo).toBe('tangente');
    expect(() => validarPropsSimulador('SimGrafo', { consigna: 'x', grafo: 'red-ciudad', modo: 'buscar-falla' })).toThrow(/modo/);
  });
});

describe('texto corto', () => {
  it('negrita, itálica y código', () => {
    expect(textoCorto('Una **negrita**, una *itálica* y `código`.')).toBe(
      '<p>Una <strong>negrita</strong>, una <em>itálica</em> y <code>código</code>.</p>',
    );
  });
  it('fórmula en línea con KaTeX', () => {
    expect(textoCorto('Vale $x^2$.')).toContain('class="katex"');
  });
  it('línea en blanco = párrafo nuevo; bloque de código escapado', () => {
    const h = textoCorto('Uno\n\nDos\n\n```sql\nSELECT a < b;\n```');
    expect(h).toContain('<p>Uno</p>\n<p>Dos</p>');
    expect(h).toContain('<pre><code>SELECT a &lt; b;</code></pre>');
  });
  it('escapa HTML', () => {
    expect(textoCortoEnLinea('a <b> & c')).toBe('a &lt;b&gt; &amp; c');
  });
  it('LaTeX inválido tira error', () => {
    expect(() => textoCorto('Mal $\\frac{1$.')).toThrow();
  });
});
