# Verificación F4: Troubleshooting metódico, capas OSI y dividir para encontrar

- **Tema:** `soporte/troubleshooting-metodico`
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO

**Método.** Abrí el capítulo 12 del libro de SRE de Google (sre.google), el PDF de la Recomendación UIT-T X.200 (47 páginas, con `pdftotext`), el RFC 1122, el capítulo de muestra de Cisco Press y las páginas de manual de `ping` y `dig` (Ubuntu 24.04). Recalculé las cuentas de bisección con Python sin mirar las del autor. Contrasté el simulador con `SIMULADORES.md` §2.11. No hay frases copiadas: las fuentes están en inglés y el texto es paráfrasis propia.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | El diagnóstico se modela como método hipotético-deductivo: observar, proponer causas, probarlas, repetir hasta la raíz (tarjeta `t-hipotetico-deductivo`) | google-sre-troubleshooting | cap. 12, "Theory" | ✅ | "application of the hypothetico-deductive method". |
| 2 | Un buen reporte dice qué se esperaba, qué pasó y cómo reproducirlo; conviene registrar todo en un ticket aun si llega por chat (tarjeta `t-reporte-util`) | google-sre-troubleshooting | "Problem Report" | ✅ | "open a bug for every issue, even those received via email or instant messaging". |
| 3 | Triage: respuesta acorde al impacto; en una caída grande lo primero es que funcione como pueda, preservando logs (tarjeta `t-estabilizar-primero`) | google-sre-troubleshooting | "Triage" | ✅ | "Stopping the bleeding should be your first priority" y preservar evidencia. |
| 4 | "Qué se tocó por última vez" es buen punto de partida; los sistemas estables se rompen por cambios de configuración o carga (tarjeta `t-que-toque-ultimo`) | google-sre-troubleshooting | "What touched it last" | ✅ | |
| 5 | Probar primero lo más probable y de menor riesgo; cuidado con factores que confunden; anotar ideas y resultados | google-sre-troubleshooting | "Test and Treat" | ✅ | |
| 6 | Trampas: síntomas irrelevantes, teorías improbables, correlación vs. causalidad; "caballos antes que cebras" (tarjeta `t-caballos-cebras`) | google-sre-troubleshooting | "Common Pitfalls" | ✅ | El libro atribuye la frase a la formación médica. |
| 7 | Una regla de firewall por IP origen puede hacer fallar tu ping aunque ande desde el servidor de aplicación (tarjeta `t-confusion-firewall`) | google-sre-troubleshooting | "Test and Treat", confounding factors | ✅ | Ejemplo casi igual en el libro. |
| 8 | Para ubicar la zona: recorrer de un extremo al otro o, en sistemas enormes, bisección (partir en dos, descartar una mitad, repetir) | google-sre-troubleshooting | "Simplify and reduce" | ✅ | El libro lo dice dentro de "Dividing and conquering". |
| 9 | Con n tramos, una falla y prueba confiable, el máximo de pruebas es ⌈log₂ n⌉: 3 para 8, 6 para 50 | cálculo propio | n/a | ✅ | Python: ⌈log₂ 8⌉ = 3, ⌈log₂ 50⌉ = ⌈5,64⌉ = 6; la secuencia 50, 25, 13, 7, 4, 2, 1 son 6 particiones. La fórmula no está en el libro y el texto la presenta como cuenta propia. |
| 10 | Analogía de la tira de luces: con 64 bombitas, 6 pruebas | cálculo propio | n/a | ✅ | ⌈log₂ 64⌉ = 6. |
| 11 | Simulador: mínimo teórico = 3 para la cadena de 8 tramos | SIMULADORES.md §2.11 | `buscar-falla` | ✅ | `minimo-teorico` = ⌈log₂ 8⌉ = 3. |
| 12 | OSI: siete capas, de 7 (aplicación) a 1 (física); X.200 = ISO/IEC 7498-1 | itu-x200 | §6.1.2; portada | ✅ | La portada dice que el texto es idéntico a ISO/IEC 7498-1. |
| 13 | Capa física: activa, mantiene y desactiva conexiones físicas para transmitir bits | itu-x200 | §7.7.2 | ✅ | |
| 14 | Enlace de datos: ofrece conexiones de enlace y detecta (y puede corregir) errores de la capa física | itu-x200 | §7.6.2 | ✅ | §7.6.2.1 y §7.6.2.2. |
| 15 | Red: aísla de los detalles de ruteo y relevo | itu-x200 | §7.5.2 | ✅ | El texto dice "capas de arriba"; X.200 habla de las entidades de transporte. Equivalente a este nivel. |
| 16 | Transporte: transferencia de datos transparente y confiable de punta a punta | itu-x200 | §7.4.2 | ⚠️ | §7.4.2.1 dice "transparente" y relevada del cómo se logra una transferencia confiable y económica; §7.4.2.3 "end-to-end significance". Aceptable, sin hallazgo. |
| 17 | La columna "Qué mirás en la oficina" es asociación didáctica | (propia) | n/a | ✅ | Declarado en la tabla de fuentes del autor. |
| 18 | TCP/IP tiene cuatro capas; la de aplicación junta presentación y aplicación de OSI; SMTP y DNS son de aplicación | rfc1122 | §1.1.3 | ✅ | El RFC usa casi esos términos. |
| 19 | Si una capa funciona, se asume que las inferiores también; no prueba todo (ejemplo de fragmentación) | ciscopress-tshoot | "The Top-Down Troubleshooting Approach" | ✅ | El libro lo dice con TCP al puerto 80 y paquetes fragmentados. La ejercicio V/F lo extiende a un ping común; es correcto. |
| 20 | Tres enfoques: top-down (requiere acceso al software del cliente), bottom-up (hardware viejo; lento en redes grandes), divide y conquista | ciscopress-tshoot | "Structured Troubleshooting Approaches" y subsecciones | ✅ | |
| 21 | Divide y conquista: arrancar en la capa de red con ping; si responde, subir; si no, bajar (tarjeta `t-dividir-y-conquistar-red`) | ciscopress-tshoot | "The Divide-and-Conquer Troubleshooting Approach" | ✅ | |
| 22 | El manual de ping recomienda aislar fallas de cerca a lejos: local, luego gateways | ping-man | pasaje "When using ping for fault isolation" | ✅ | El pasaje está después de `-W` en la página; el `loc` "OPTIONS, -W" es aproximado. |
| 23 | ping manda ICMP `ECHO_REQUEST` y espera `ECHO_REPLY`; `-c` limita paquetes (tarjeta `t-ping-mensaje`) | ping-man | DESCRIPTION; `-c` | ⚠️ | La página dice `ECHO_RESPONSE`; `ECHO_REPLY` es el nombre estándar de ICMP, así que el dato es correcto. Sugerencia opcional: decir "respuesta de eco". |
| 24 | `ip route show` lista rutas; `ip address show` muestra direcciones | iproute2-route | ip-route(8), ip-address(8) | ✅ | Comandos válidos en Debian/Ubuntu. |
| 25 | `dig` consulta servidores DNS, empezando por `/etc/resolv.conf`; `+short` abrevia | dig-man | DESCRIPTION; `+short` | ✅ | |
| 26 | Ping a IP responde pero a nombre no: sospechar DNS (tarjeta, ejercicio `e-ping-ok-dns-falla`) | ciscopress-tshoot; dig-man | divide y conquista | ✅ | Inferencia propia rotulada, coherente con las fuentes. La fuente de la tarjeta `ciscopress-tshoot` no menciona DNS, pero el razonamiento es el de capas. |
| 27 | Ejercicio `e-biseccion-cincuenta-tramos`: respuesta 6; errores comunes 5, 50, 25 | cálculo | Python | ✅ | 5 es el redondeo hacia abajo de 5,64; 50 es el recorrido lineal. |
| 28 | Ejercicio `e-primera-prueba-dos-puestos`: comparar los 2 puestos con uno que anda | ciscopress-tshoot | "Structured Troubleshooting Approaches" (compare configurations) | ✅ | Una sola correcta; distractores plausibles con explicación. |
| 29 | Caso `c-no-anda-internet-oficina`: medir alcance, ping por IP y por nombre, `dig` contra el DNS de la oficina y uno público, mitigar cambiando el DNS por DHCP, avisar, documentar | ciscopress-tshoot; google-sre-troubleshooting | divide y conquista; triage | ✅ | Decisión buena según las fuentes. Opciones malas tentadoras (reiniciar router, culpar al proveedor sin pruebas) presentes. No inventa técnicas. |
| 30 | Tarjetas (12): atómicas, una respuesta, ≤ 2 definiciones | GUIA-ESTILO §4 | | ✅ | `t-capa-fisica-sintoma` asocia luz de enlace con capa 1: razonable y rotulado como asociación. |
| 31 | Problemas `p-ping-por-capas-en-tu-pc`, `p-sre-cap12-incidente-propio` | ping-man; google-sre-troubleshooting | | ✅ | Ejecutables con terminal propia. |
| 32 | Orden caso real → intuición → formal, voseo, largo | GUIA-ESTILO §1-2 | | ✅ | ≈ 1450 palabras sin bloques de código, dentro del tope de 1500. Las dos analogías mapean estructura (descartar mitad de sospechas). |

**Afirmaciones revisadas: 32.**

## Hallazgos abiertos

ninguno.

Notas no bloqueantes (ya en la tabla): filas 16 y 23. La fila 23 es una sugerencia de redacción, no un error de contenido.
