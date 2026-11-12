# Verificación F4 — analisis-datos/elegir-el-grafico

- **Tema:** analisis-datos/elegir-el-grafico
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificado en 75bc28a)
- **Veredicto de la primera pasada (f3ad672):** APROBADO

Archivos revisados: `src/content/temas/analisis-datos/elegir-el-grafico/tema.mdx` y `practica.yaml` (commit b885f09).
Método: capítulos 5, 6, 10, 13 y 17 de Wilke descargados en crudo; EMC §3.2.5 leído en el PDF local (pp. 99-100); cálculos rehechos con Python; búsqueda de secuencias de 6 palabras iguales a las fuentes.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Cada pregunta tiene su gráfico natural: barras (cantidades), histograma/caja (distribuciones), torta/barras (proporciones), dispersión (x-y), líneas si x es tiempo | wilke | cap. 5, §5.1-§5.4 | ✅ | §5.1 barras/puntos; §5.2 histogramas y cajas; §5.3 tortas o barras; §5.4 dispersión y "when the x axis represents time… line graphs". |
| 2 | Tarjeta t-pregunta-decide | wilke | cap. 5 | ✅ | |
| 3 | La barra empieza en cero porque su largo es el valor; si no, exagera diferencias | wilke | cap. 17, §17.1 | ✅ | "Bars on a linear scale should always start at 0"; ejemplo Hawái. |
| 4 | Tarjeta t-barras-cero; ejercicios e-vf-barra-recortada | wilke | cap. 17 | ✅ | |
| 5 | Sin orden natural, ordenar barras por valor | wilke | cap. 6, §6.1 | ✅ | "If the bars represent unordered categories, order them by ascending or descending data values". |
| 6 | Etiquetas largas → barras horizontales | wilke | cap. 6, §6.1 | ✅ | |
| 7 | Tarjetas t-orden-barras, t-etiquetas-largas; ejercicio e-barras-sucursales | wilke | cap. 6 | ✅ | Distractores bien explicados. |
| 8 | El gráfico de puntos tolera eje sin cero | wilke | cap. 6, §6.3 | ✅ | "bars… need to start at zero… we can indicate amounts by placing dots". |
| 9 | Tarjeta t-puntos-sin-cero | wilke | §6.3 | ✅ | |
| 10 | La línea resalta el orden entre puntos vecinos | wilke | cap. 13, §13.1 | ✅ | |
| 11 | Con varias series, etiquetar directo en vez de leyenda | wilke | cap. 13, §13.2 | ✅ | Fig. 13.7. |
| 12 | Área rellena bajo la línea exige eje en cero | wilke | cap. 13, §13.1 | ✅ | "only valid if the y axis starts at zero". |
| 13 | Tarjetas t-linea-tiempo, t-etiqueta-directa | wilke | §5.4, §13.2 | ⚠️ | t-linea-tiempo dice "otra cantidad ordenada que solo crece": §5.4 dice "strictly increasing quantity", pero el cap. 13 generaliza a "whenever the data points have a natural order". No es error; es más restrictivo que la fuente. |
| 14 | La torta funciona con fracciones simples y pocas porciones | wilke | cap. 10, §10.1 | ✅ | "emphasize simple fractions… very small datasets". Bundestag verificado. |
| 15 | La torta falla para comparar rebanadas parecidas y entre años (cinco empresas) | wilke | cap. 10, §10.2 | ✅ | Fig. 10.4. |
| 16 | Tarjetas t-torta-cuando, t-torta-falla; e-vf-torta-nunca | wilke | §10.1, §10.2 | ✅ | |
| 17 | Se juzgan mejor distancias que áreas; la torta achica las diferencias respecto de las barras | wilke | cap. 17, §17.3 | ✅ | Condados de Rhode Island, Fig. 17.11-17.12. |
| 18 | Tarjeta t-distancia-vs-area | wilke | §17.3 | ✅ | |
| 19 | Ángulo de rebanada = 360° × p | wilke | §17.3 | ✅ | Ángulo y área proporcionales al valor. |
| 20 | Ejemplo de texto: 34,7 % y 32 % → ~125° y ~115°, diferencia ~10° | cálculo | — | ✅ | 124,9° y 115,2°. Números ilustrativos, el texto lo dice. |
| 21 | Exploración (técnica) vs presentación (simple, centrada en el mensaje) | emc-ds | cap. 3 §3.2.5, pp. 99-100 | ✅ | PDF pp. 119-120. |
| 22 | Tarjeta t-explorar-vs-presentar; problema p-emc-presentacion (pp. 99-101) | emc-ds | ídem | ✅ | |
| 23 | Veredictos del simulador: barras regular (72 barras), líneas bien, torta mal, dispersión regular | wilke | §5.1, §5.4, §13.1-13.2, §10.2 | ✅ | Cada `porque` lleva su cita y las citas existen. "72 barras" = 24 × 3, correcto. Es criterio de diseño, y el `<Ojo>` lo dice. |
| 24 | Tabla Formal, fila "cómo cambia en el tiempo": no usar torta ni barras apiladas con muchos períodos | wilke | §10.2, §10.3 | ✅ | Wilke "normalmente no recomienda" secuencias de barras apiladas (§10.2) y las acepta con dos segmentos (§10.3). Compatible. |
| 25 | e-barra-truncada = 2 (tol. 0,05); error común 1,1 | cálculo | — | ✅ | (110−90)/(100−90) = 2,0; 110/100 = 1,1. |
| 26 | e-angulo-rebanada = 124,8 (tol. 0,1); error común 34,7 | cálculo | — | ✅ | 520/1500·360 = 124,8; Sur 115,2 y Centro 120 verificados. |
| 27 | e-grafico-para-24-meses: opción correcta (líneas) y explicaciones de 3 distractores | wilke | cap. 13 | ✅ | |
| 28 | Problemas p-wilke-directorio, p-wilke-torta-barras | wilke | cap. 5 §5.1-5.4; cap. 10 §10.1-10.2 | ✅ | URLs devuelven 200; hacibles con datos propios. |
| 29 | Plagio | todas | — | ✅ | 0 secuencias de 6 palabras iguales en el cuerpo ni en el YAML (solo título del libro EMC). |
| 30 | Estilo: orden y voz | GUIA-ESTILO | — | ✅ | ≈ 850 palabras; caso real termina en tensión. 2 de 6 ejercicios son V/F (máximo 1 de cada 3). |
| 31 | `minutos: 15` y `emc-ds` con `ubicacion` "§3.2.3 y §3.2.5, pp. 88 y 99-100" | GUIA-ESTILO; EMC | frontmatter | ⚠️ | Ver H1 y H2. |

Piezas revisadas: 31 filas (11 tarjetas, 6 ejercicios, 3 problemas y el cuerpo; sin casos, el área no los exige).

## Hallazgos abiertos

Ninguno bloqueante. Dos menores:

**H1 — Ubicación sobrante en el frontmatter (baja).**
- Archivo/campo: `tema.mdx`, `fuentes[1].ubicacion` (emc-ds): "cap. 3, §3.2.3 y §3.2.5, pp. 88 y 99-100".
- Qué está mal: §3.2.3 (p. 88, tabla de funciones R para graficar una variable) no respalda ninguna afirmación del tema; el propio FUENTES dice que no se cita.
- Corrección propuesta: "cap. 3, §3.2.5, pp. 99-100".

**H2 — `minutos` no cuadra con la fórmula de la guía (baja).**
- Archivo/campo: `tema.mdx`, `minutos: 15`.
- Guía §2: ≈ 850/200 = 4,3 + 2 (1 simulador) + 6 ejercicios = 12,3 → 10.
- Corrección propuesta: `minutos: 10`, o justificarlo.

## Re-verificación (cierre de F4) — commit 75bc28a

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H1 — ubicación EMC sobrante | CERRADO (75bc28a) | Frontmatter ahora "cap. 3, §3.2.5, pp. 99-100". |
| H2 — `minutos` | CERRADO (75bc28a) | `minutos: 10`, igual que la fórmula de la guía. |
| Nota de la fila 13 (tarjeta t-linea-tiempo) | CERRADA (75bc28a) | El dorso ahora dice "el tiempo u otra cantidad con un orden natural, como una dosis". Wilke cap. 13: "appropriate whenever the data points have a natural order", con la curva dosis-respuesta como ejemplo. |

Hallazgos abiertos: ninguno.
