# FUENTES — Soporte técnico
- Escritor: F3-soporte · Fecha: 2026-11-11

> **Cómo accedí a las fuentes.** Todas las páginas web las descargué el 2026-11-11 (HTTP directo) y las leí como texto; los PDF (glosario de PeopleCert, Recomendación X.200) los leí con `pdftotext`. No tuve acceso a ningún libro pago de ITIL 4. Todo lo de ITIL sale de (a) el glosario del temario oficial de PeopleCert, que reproduce las definiciones de *ITIL Foundation, ITIL 4 Edition* (AXELOS/TSO, 2019) con su nota al pie, y (b) la documentación pública de Atlassian y PagerDuty, que es **interpretación del proveedor** y se rotula así en el texto de los temas cuando importa.
>
> Ubicaciones de página del PDF de PeopleCert: se refieren a la numeración "Page N of 20" del propio documento (glosario = §8, pp. 14-16).

## itil-incidente-problema-cambio

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Incidente = interrupción no planificada de un servicio o falla de un componente que aún no lo afectó. | Formal, §Las definiciones; tarjeta t-incidente-definicion | peoplecert-glosario | §8 Glossary, p. 15, "Incident" (nota al pie: ITIL Foundation ITIL 4 Edition, TSO 2019) | Leí el PDF con pdftotext; la definición coincide palabra por palabra en sentido. |
| 2 | Gestión de incidentes = minimizar el impacto negativo restaurando la operación normal lo antes posible. | Formal, §Las definiciones; tarjeta t-incidente-objetivo | peoplecert-glosario | §8, p. 15, "Incident Management" | Ídem. |
| 3 | Atlassian define "incidente" como lo que requiere respuesta de emergencia y dice que quienes siguen ITIL lo llaman *major incident*. (Rotulado como interpretación del proveedor.) | Formal, Nota | atlassian-incidentes | Sección "What is incident management?", segundo párrafo | Leí la página. |
| 4 | Problema = causa o causa potencial de uno o más incidentes. | Formal; tarjeta t-problema-definicion | peoplecert-glosario | §8, p. 16, "Problem" | Leí el PDF. |
| 5 | Gestión de problemas = reducir probabilidad e impacto de incidentes identificando causas reales y potenciales y manejando soluciones temporales y errores conocidos. | Formal | peoplecert-glosario | §8, p. 16, "Problem Management" | Leí el PDF. |
| 6 | Error conocido = problema con causa raíz documentada y *workaround*; se guarda en una base de errores conocidos. Una solución temporal reduce el impacto sin eliminar la causa. | Formal; tarjeta t-error-conocido | atlassian-problemas | Sección "The problem management process" (pasos "Create a known error record" y "Create a workaround") | Leí la página; Atlassian cita la definición de ITIL entre comillas. |
| 7 | Un rollback puede terminar el incidente, pero el problema subyacente sigue. | Formal; tarjeta t-rollback-no-cierra-problema; caso c-actualizacion-viernes-sin-registro | atlassian-problemas | Sección "Problem management vs. incident management" | Leí la página. |
| 8 | Cambio = agregar, modificar o quitar algo que pueda afectar servicios, directa o indirectamente. | Formal; tarjeta t-cambio-definicion | atlassian-cambios | Sección "What is IT change management" | Leí la página. No tengo el texto del libro de ITIL 4: es la definición tal como la reproduce Atlassian. |
| 9 | Tres tipos de cambio: estándar (bajo riesgo, repetido, preaprobado), normal (sin procedimiento preaprobado; a veces CAB) y de emergencia (por falla o amenaza; trámite corto). | Formal; tarjetas t-cambio-estandar y t-cambio-emergencia; ejercicio e-tipo-de-cambio | atlassian-cambios | Sección "Types of changes" | Leí la página. |
| 10 | El CAB evalúa riesgos y aprueba cambios; puede ser cuello de botella y se tiende a reservarlo a los de alto riesgo. | Formal (tipo normal) y e-tipo-de-cambio | atlassian-cambios | Secciones "Normal changes" y "What is a change advisory board (CAB)?" | Leí la página. |
| 11 | ITIL 4 Foundation (2019) llamó *change control* a la práctica: asegurar que los riesgos se evalúen, autorizar cambios y manejar un calendario de cambios. | Formal | peoplecert-glosario | §8, p. 14, "Change Control" | Leí el PDF. |
| 12 | AXELOS renombró la práctica a *change enablement* porque "control" se leía como frenar equipos. | Formal; tarjeta t-change-enablement | atlassian-cambios | Sección "Defining change management" | Leí la página; es el relato de Atlassian sobre una decisión de AXELOS, sin el comunicado original. |
| 13 | Solicitud de servicio = pedido formal de un usuario de algo (acceso, reseteo de clave, información); no es falla; se maneja como flujo aparte. | Formal; tarjeta t-solicitud-vs-incidente | atlassian-solicitudes | Secciones "What is service request management?" y "Service request management vs incident management" | Leí la página. |
| 14 | ITIL 4 organiza su guía en 34 prácticas, que reemplazan a los "procesos" de versiones anteriores. | Formal, §Prácticas, no procesos | atlassian-itil4 | Sección "ITIL 4 practices" | Leí la página. |
| 15 | En 2023 se actualizaron las primeras cinco prácticas (incidentes, problemas, solicitudes, monitoreo y eventos, service desk); para incidentes se recomienda mirar desde el consumidor del servicio y no esconderse detrás del SLA. | Formal, §Prácticas | peoplecert-practicas-2023 | Secciones "What's new with the practices?" y "Chapter 8" | Leí el artículo (autor: Adam Griffith, ITIL Architect de PeopleCert). |
| 16 | Cuando un cambio provoca una interrupción, se analiza con incidentes y problemas. | Formal, §Cómo se conectan | atlassian-problemas | Sección "Problem management and change management" | Leí la página. |
| 17 | Atlassian recomienda categorizar cada incidente para detectar tendencias que alimenten la gestión de problemas. | Formal, §Cómo se conectan | atlassian-incidentes | "Steps in the IT incident management process", paso "Categorize" | Leí la página. |
| 18 | Un incidente se resuelve cuando el servicio vuelve a su estado esperado, e incluye solo las tareas para mitigar y restaurar. | Ejercicio e-vf-incidente-requiere-causa | atlassian-incidentes | Sección "What is incident management?", tercer párrafo | Leí la página. |
| 19 | La tabla "Cómo se conectan" (qué pregunta responde cada cosa y cuándo se da por terminada) es una síntesis de las filas 1 a 13. | Formal, tabla | peoplecert-glosario; atlassian-problemas; atlassian-cambios | Ver filas 1-13 | Síntesis propia; el criterio "problema cerrado = eliminado" sale de la sección "The problem management process" de atlassian-problemas. |
| 20 | Estados del simulador `incidente-itil`: típicos de una herramienta, no normativos de ITIL. | Intuición, Ojo | (SIMULADORES.md §2.9) | Nota fija del diagrama del simulador | Está en el contrato de simuladores; coincide con la aclaración de ITIL 4 que figura en atlassian-itil4 (prácticas, no pasos fijos). |
| 21 | Ejercicio e-que-registro-falta: ante una causa sin identificar con 8 incidentes repetidos corresponde abrir un problema. | Ejercicio | atlassian-problemas | Sección "The problem management process" | Aplicación de la definición de problema (fila 4). |
| 22 | Ejercicio e-horas-persona-perdidas: 3 × 12 × 40 = 1440 min = 24 h-persona. | Ejercicio | (cálculo propio) | n/a | Calculado con Python: 3·12·40 = 1440; 1440/60 = 24,0. |
| 23 | Caso c-impresora-fiscal-tercera-vez: cerrar el incidente, abrir el problema y gestionar el arreglo como cambio planificado con plan de vuelta atrás. | Caso | atlassian-problemas; atlassian-cambios | Filas 6, 7, 9 | Aplicación de lo anterior; los datos del caso son inventados. |
| 24 | Caso c-actualizacion-viernes-sin-registro: ante una falla justo después de un cambio, revertir como cambio de emergencia y registrar. | Caso | atlassian-cambios | Sección "Types of changes", "Emergency changes" | Aplicación de la fila 9; la práctica de "revisar qué se tocó último" está respaldada en el tema troubleshooting (google-sre-troubleshooting, "What touched it last"). |
| 25 | Tarjetas t-cambio-emergencia, t-cambio-estandar, t-change-enablement, t-solicitud-vs-incidente: ver filas 9, 12, 13. | Tarjetas | atlassian-cambios; atlassian-solicitudes | Ver filas | Ídem. |
| 26 | Problemas p-tabla-itil-propia y p-buscar-repetidos: tareas guiadas por las secciones indicadas. | Problemas | peoplecert-glosario; atlassian-problemas | §8, pp. 14-16; "The problem management process" | Leí ambas secciones para confirmar que dan material para la tarea. |

### Fuentes del tema
- `peoplecert-glosario`: PeopleCert, *PeopleCert DevOps Fundamentals, Syllabus*, v01.0, septiembre 2019, §8 Glossary. Acceso: PDF público en peoplecert.org. Reproduce definiciones de AXELOS, *ITIL Foundation, ITIL 4 Edition* (TSO, 2019), con nota al pie.
- `peoplecert-practicas-2023`: Adam Griffith (PeopleCert), "ITIL 4 Management Practices 2023". Acceso: página pública.
- `atlassian-incidentes`, `atlassian-problemas`, `atlassian-cambios`, `atlassian-solicitudes`, `atlassian-itil4`: guías públicas de ITSM de Atlassian (proveedor). Acceso: páginas públicas. Son documentación de un proveedor que cita a ITIL: **no son el texto de ITIL**.

### Números y datos inventados para ejemplos
- "3 caídas, 12 personas, 40 minutos" (impresora fiscal), "8 tickets del CRM", "9 sucursales", los identificadores INC/PRB/CHG del bloque YAML: todos ilustrativos.

## troubleshooting-metodico

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | El diagnóstico se modela como método hipotético-deductivo: observar, proponer causas, probarlas e iterar hasta la raíz. | Formal, §El método; tarjeta t-hipotetico-deductivo | google-sre-troubleshooting | cap. 12, "Theory" | Leí el capítulo. |
| 2 | Un buen reporte dice qué se esperaba, qué pasó y, si se puede, cómo reproducirlo; conviene abrir ticket aun si llega por chat. | Formal; tarjeta t-reporte-util | google-sre-troubleshooting | cap. 12, "Problem Report" | Leí el capítulo. |
| 3 | Triage: ajustar la respuesta al impacto; en una caída grande lo primero es que funcione como pueda y preservar evidencia (logs). | Formal; tarjeta t-estabilizar-primero | google-sre-troubleshooting | cap. 12, "Triage" | Leí el capítulo. |
| 4 | "Qué se tocó por última vez" es un buen punto de partida: los sistemas estables se rompen por cambios de configuración o de carga. | Formal; tarjeta t-que-toque-ultimo | google-sre-troubleshooting | cap. 12, "Diagnose", subsección "What touched it last" | Leí el capítulo. |
| 5 | Probar primero lo más probable y de menor riesgo; cuidado con factores que confunden; anotar ideas y resultados. | Formal | google-sre-troubleshooting | cap. 12, "Test and Treat" | Leí el capítulo. |
| 6 | Trampas: síntomas irrelevantes, teorías improbables, correlación vs. causalidad; "caballos antes que cebras". | Formal; tarjeta t-caballos-cebras | google-sre-troubleshooting | cap. 12, "Common Pitfalls" | Leí el capítulo. |
| 7 | Una regla de firewall por IP origen puede hacer fallar tu ping aunque desde el servidor de aplicaciones ande. | Formal; tarjeta t-confusion-firewall | google-sre-troubleshooting | cap. 12, "Test and Treat" (viñeta sobre factores de confusión) | Leí el capítulo. |
| 8 | Para ubicar la zona: recorrer de un extremo al otro o, en sistemas grandes, bisección (partir en dos, descartar una mitad, repetir). | Formal; tarjeta t-biseccion-ocho-tramos | google-sre-troubleshooting | cap. 12, "Diagnose", "Simplify and reduce" | Leí el capítulo. |
| 9 | Con n tramos, una sola falla y prueba confiable, el máximo de pruebas por bisección es ⌈log₂ n⌉ (3 para 8; 6 para 50). | Formal; ejercicio e-biseccion-cincuenta-tramos | (cálculo propio, método de google-sre-troubleshooting) | n/a | Derivación propia; verificada con Python: ceil(log2 8)=3, ceil(log2 50)=6, ceil(log2 32)=5. Coincide con `minimo-teorico` = 3 del simulador (SIMULADORES.md §2.11). |
| 10 | OSI tiene siete capas, numeradas de 7 (aplicación) a 1 (física). | Formal, §El modelo de capas | itu-x200 | §6.1.2 | Leí el PDF de la Rec. X.200 (47 páginas); el texto de ISO/IEC 7498-1:1994 es idéntico, según el prólogo de la propia recomendación. |
| 11 | Capa física: activa, mantiene y desactiva las conexiones físicas para transmitir bits. | Formal, tabla; tarjeta t-capa-fisica-sintoma | itu-x200 | §7.7.2 | Leí el PDF. |
| 12 | Capa de enlace de datos: ofrece conexiones de enlace y detecta (y puede corregir) errores de la capa física. | Formal, tabla | itu-x200 | §7.6.2 | Leí el PDF. |
| 13 | Capa de red: independiza a las capas superiores del ruteo y el relevo. | Formal, tabla; tarjeta t-capa-ruteo | itu-x200 | §7.5.2 | Leí el PDF. |
| 14 | Capa de transporte: transferencia de datos transparente y confiable de punta a punta. | Formal, tabla | itu-x200 | §7.4.2 | Leí el PDF. |
| 15 | La columna "Qué mirás en la oficina" (cable, MAC, IP, puertos, DNS) es mi asociación didáctica, no texto de la norma. | Formal, tabla | (propia) | n/a | Los ejemplos de protocolos de aplicación (SMTP, DNS) sí están en rfc1122 (fila 16). |
| 16 | TCP/IP tiene cuatro capas (enlace, internet, transporte, aplicación); la de aplicación junta presentación y aplicación de OSI; DNS y SMTP son protocolos de aplicación. | Formal | rfc1122 | §1.1.3 "Internet Protocol Suite" | Leí el RFC. |
| 17 | Si una capa funciona, se puede suponer que las inferiores también (conclusión razonable, no prueba). | Formal; ejercicio e-vf-ping-ok-prueba-todo | ciscopress-tshoot | Sección "The Top-Down Troubleshooting Approach" (incluye el ejemplo de fragmentación) | Leí el capítulo de muestra. |
| 18 | Tres enfoques: top-down (buscar la capa más alta que funciona; requiere acceso al software del cliente), bottom-up (sirve con hardware viejo; lento en redes grandes) y divide y conquista (arrancar en la capa de red con ping/trace; si responde, subir; si no, bajar). | Formal; tarjeta t-dividir-y-conquistar-red | ciscopress-tshoot | Secciones "Structured Troubleshooting Approaches", "The Top-Down", "The Bottom-Up" y "The Divide-and-Conquer Troubleshooting Approach" | Leí el capítulo de muestra (cap. 1 del libro de Ranjbar, Cisco Press 2015). |
| 19 | Ping responde por IP pero no por nombre: sospechar de la resolución de nombres (DNS). | Formal; tarjeta t-ping-ip-pero-no-nombre; ejercicio e-ping-ok-dns-falla | ciscopress-tshoot; dig-man | "The Divide-and-Conquer Troubleshooting Approach" (ping exitoso implica capas bajas funcionales); dig(1) DESCRIPTION | Inferencia propia apoyada en ambas fuentes; la lógica es el ejemplo de divide y conquista. |
| 20 | Comparar equipos que andan contra los que no andan achica el campo ("spot the differences"). | Ejercicio e-primera-prueba-dos-puestos | ciscopress-tshoot | Lista de enfoques en "Structured Troubleshooting Approaches" | Leí el capítulo de muestra. |
| 21 | El manual de ping recomienda usarlo para aislar fallas de cerca a lejos: primero la máquina local, después gateways y hosts más lejanos. | Formal, §Comandos | ping-man | Texto que acompaña a la opción `-W` en la página de manual | Leí la página. |
| 22 | ping manda ICMP ECHO_REQUEST y espera ECHO_REPLY; `-c count` limita la cantidad de paquetes. | Formal; tarjeta t-ping-mensaje | ping-man | DESCRIPTION y OPTIONS (`-c`) | Leí la página (iputils 20240117, Ubuntu 24.04). |
| 23 | `ip route show` lista las rutas. `ip address show` muestra las direcciones. | Formal, §Comandos | iproute2-route | ip-route(8) "ip route show"; ip-address(8) "ip address show" | Leí las dos páginas de man7.org. |
| 24 | dig consulta servidores DNS; si no se le indica uno, prueba los de /etc/resolv.conf; `+short` da respuesta abreviada. | Formal, §Comandos | dig-man | DESCRIPTION y opción +short | Leí la página (Ubuntu 24.04). |
| 25 | Caso c-no-anda-internet-oficina: medir alcance, dividir con ping por IP y por nombre, dig contra el DNS de la oficina y uno público, solución temporal por DHCP, avisar. | Caso | ciscopress-tshoot; google-sre-troubleshooting | Filas 3, 18, 19 | Aplicación; los datos del caso son inventados. |
| 26 | Problemas p-ping-por-capas-en-tu-pc y p-sre-cap12-incidente-propio: tareas guiadas por las secciones indicadas. | Problemas | ping-man; google-sre-troubleshooting | Ver ubicaciones en practica.yaml | Leí ambas secciones. |

### Fuentes del tema
- `google-sre-troubleshooting`: Beyer et al. (eds.), *Site Reliability Engineering*, O'Reilly, 2016, cap. 12 (Chris Jones). Acceso: versión web libre en sre.google (CC BY-NC-ND 4.0).
- `itu-x200`: UIT-T X.200 (07/94), PDF de acceso libre en itu.int. Es el texto de ISO/IEC 7498-1, que es de pago; no lo leí.
- `rfc1122`: IETF, RFC 1122 (oct. 1989), rfc-editor.org.
- `ciscopress-tshoot`: Amir Ranjbar, *Troubleshooting and Maintaining Cisco IP Networks (TSHOOT) Foundation Learning Guide*, Cisco Press, 2015. Acceso: solo el capítulo de muestra gratuito publicado en ciscopress.com; no vi el libro completo.
- `ping-man`, `dig-man`, `iproute2-route`: páginas de manual (Ubuntu manpages y man7.org). Acceso: públicas.

### Números y datos inventados para ejemplos
- "11 tickets", "30 puestos", la IP del gateway 192.168.1.1 y los tiempos del caso son ilustrativos. 1.1.1.1 se usa solo como ejemplo de IP pública.

## prioridad-y-sla

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Una matriz de prioridad rankea los incidentes por impacto y urgencia; la combinación indica cuáles atender primero. | Formal; tarjeta t-prioridad-dos-factores | pagerduty-matriz | Sección "What is the incident priority matrix?" | Leí la página (documento de un proveedor). |
| 2 | Impacto y urgencia pesan igual en la asignación de prioridad. | Formal | pagerduty-matriz | Sección "Assigning incident impact" | Leí la página. |
| 3 | La gestión se enfoca en el impacto, no en el orden en que llegan los problemas. | Formal; tarjeta t-orden-de-llegada; ejercicio e-quien-va-primero | pagerduty-matriz | Sección "Incident urgency and impact" | Leí la página. |
| 4 | El impacto se evalúa por efecto en el negocio, cantidad de personas, SLA aplicables e implicaciones financieras, de seguridad y de cumplimiento. | Formal; tarjeta t-impacto-que-mide | atlassian-incidentes | "Steps in the IT incident management process", paso "Prioritize" | Leí la página. |
| 5 | Criterios de urgencia: criticidad, sensibilidad al tiempo, propagación y visibilidad. | Formal; tarjeta t-urgencia-que-mide | pagerduty-matriz | Tabla de la sección "Incident urgency and impact" | Leí la página. |
| 6 | Estas matrices son recomendaciones de alto nivel que cada organización adapta a sus SLA. | Formal, Ojo; tarjeta t-matriz-no-universal | pagerduty-matriz | Nota inicial ("These are high-level recommendations") | Leí la página. |
| 7 | La matriz 3×3 con P1-P5 es de ejemplo (la misma del simulador): (A,A)=P1, (A,M)=(M,A)=P2, (A,B)=(M,M)=(B,A)=P3, (M,B)=(B,M)=P4, (B,B)=P5. | Formal, tabla; tarjeta t-p1-matriz-ejemplo | (SIMULADORES.md §2.12) | Definición de la matriz del simulador | La verifiqué contra el contrato de simuladores. También aparece idéntica como ejemplo en IT Process Wiki (`itprocessmaps-prioridad`, "Incident Priority Matrix"), que es un wiki de consultora con licencia CC y definiciones parciales de AXELOS: sirve de "para ver más", no respalda el dato. **No es una tabla oficial de ITIL.** |
| 8 | Niveles de severidad (SEV) con número menor = más urgente; si hay duda, asumir el más alto y discutirlo después. | Formal; tarjeta t-sev-duda | pagerduty-severidad | Introducción y "Always Assume The Worst" | Leí la página; se aclara en el texto que es regla de una empresa. |
| 9 | SLA (ITIL) = acuerdo escrito entre el proveedor de TI y el negocio con objetivos y responsabilidades clave del servicio. | Formal; tarjeta t-sla-itil | peoplecert-glosario | §8, p. 16, "Service Level Agreement" | Leí el PDF. |
| 10 | SLI = medida cuantitativa de un aspecto del servicio (latencia, tasa de error, disponibilidad). | Formal; tarjeta t-sli-definicion | google-sre-slo | cap. 4, "Indicators" | Leí el capítulo. |
| 11 | SLO = valor objetivo para un SLI. SLA = contrato con consecuencias; la prueba es preguntar qué pasa si no se cumple. | Formal; tarjeta t-slo-vs-sla | google-sre-slo | cap. 4, "Objectives" y "Agreements" | Leí el capítulo. |
| 12 | Un SLA puede fijar, además de la disponibilidad, tiempos de respuesta al usuario. | Formal | atlassian-slo | Sección "Service level agreement (SLA)" | Leí la página. |
| 13 | Los valores de SLA del simulador (P1: 15 min de respuesta, 240 de resolución) son ilustrativos. | Formal | (SIMULADORES.md §2.12) | `slas` por defecto | Contrato de simuladores. |
| 14 | ITIL 4 recomienda mirar el incidente desde el usuario y no esconderse detrás del SLA. | Formal; tarjeta t-sla-no-es-satisfaccion; ejercicio e-vf-sla-cumplido-satisfecho | peoplecert-practicas-2023 | "Chapter 8: Recommendations for succeeding in the practice" | Leí el artículo. |
| 15 | La disponibilidad se calcula con el tiempo caído sobre un período; fórmula A = (T_total − T_caído)/T_total × 100 %. | Formal, Formula; ejercicio e-disponibilidad-del-mes | google-sre-disponibilidad | Apéndice A, primer párrafo | Leí el apéndice; la fórmula es la forma explícita de esa definición. |
| 16 | Caída permitida por mes: 99 % = 7,2 h; 99,5 % = 3,6 h; 99,9 % = 43,2 min; 99,95 % = 21,6 min; 99,99 % = 4,32 min. | Formal, tabla; tarjeta t-downtime-99-9; ejercicios e-minutos-permitidos-99-95 y e-disponibilidad-del-mes | google-sre-disponibilidad | Apéndice A, Table 1-1, columna "per month" | Leí la tabla y recalculé con Python (0,001·43200 = 43,2; 0,0005·43200 = 21,6; 0,00005·43200 = 4,32). |
| 17 | Dos caídas de 25 y 70 min dan 99,78 % mensual y rompen un 99,9 %. | Formal; ejercicio e-disponibilidad-del-mes | (cálculo propio) | n/a | Python: 1 − 95/43200 = 0,997801 → 99,78 %. |
| 18 | Ejercicio e-espera-facturacion-fifo: facturación arranca a los 50 min (20+30) y se pasa 35 min del objetivo de 15. | Ejercicio | (cálculo propio) | n/a | Python: 20+30 = 50; 50−15 = 35. Los tiempos y el objetivo de 15 min son inventados. |
| 19 | Si llegan más tickets de los que el equipo cierra, la cola crece y se rompen los SLA aunque todos trabajen bien. | Intuición, Ojo | (razonamiento propio; lo muestra SimFlujo modo=cola) | n/a | No lo respalda una fuente externa: es consecuencia aritmética de llegada mayor que capacidad. |
| 20 | Caso c-lunes-gerente-enojado y ejercicio e-quien-va-primero: priorizar por impacto y urgencia, y comunicar al que espera. | Caso y ejercicio | pagerduty-matriz; atlassian-comunicacion (en el tema 4) | Filas 1-3 | Aplicación; en algunas organizaciones se define una urgencia mayor para usuarios VIP (IT Process Wiki, "Incident Urgency"); acá no se asume. |
| 21 | Problemas p-tabla-downtime-propio y p-armar-matriz: tareas guiadas por las secciones indicadas. | Problemas | google-sre-disponibilidad; pagerduty-matriz | Apéndice A; "Incident urgency and impact" | Leí ambas. |

### Fuentes del tema
- `pagerduty-matriz`, `pagerduty-severidad`: PagerDuty (proveedor). La guía de *incident response* de PagerDuty es documentación abierta; el artículo de la matriz es de su sitio comercial. Son interpretación del proveedor, no ITIL.
- `atlassian-incidentes`, `atlassian-slo`: Atlassian (proveedor).
- `peoplecert-glosario`, `peoplecert-practicas-2023`: PeopleCert (ver el tema 1).
- `google-sre-slo` (cap. 4) y `google-sre-disponibilidad` (Apéndice A): Beyer et al., *Site Reliability Engineering*, O'Reilly, 2016; versión web libre.
- `itprocessmaps-prioridad`: IT Process Wiki (para ver más, no respalda datos).

### Números y datos inventados para ejemplos
- Los seis tickets del lunes, los tiempos de atención (20, 30, 45 min), el objetivo de 15 min, los 25 y 70 min de caída, la oferta de "99,95 %" del cliente: ilustrativos. Las matrices y los SLA son de ejemplo.

## comunicacion-kb-postmortem

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Un incidente se desordena cuando quien lo atiende se concentra solo en lo técnico: se comunica mal y no se usa bien al resto. | Formal, §Comunicar | google-sre-incidentes | cap. 14, "The Anatomy of an Unmanaged Incident" | Leí el capítulo. |
| 2 | Roles separados: solo el equipo de operaciones modifica el sistema; otra persona comunica con actualizaciones periódicas. | Formal; tarjeta t-rol-comunicacion | google-sre-incidentes | cap. 14, "Recursive Separation of Responsibilities" (roles Operational Work y Communication) | Leí el capítulo. |
| 3 | Cinco públicos: equipo que responde, soporte de primera línea, directivos, empleados, clientes externos. | Formal | atlassian-comunicacion | "Tailor alerts and communications to the right audience" | Leí la página. |
| 4 | No pasar más de una hora sin actualizar en incidentes que siguen afectando; decir siempre cuándo viene la próxima; preparar plantillas. | Formal; tarjeta t-actualizacion-cada-hora; ejercicio e-mensaje-durante-caida | atlassian-comunicacion | Mismas secciones ("Tailor…" y "Set up templates for incident and outage communication") | Leí la página. Es recomendación del proveedor. |
| 5 | Mantener informados a los usuarios reduce la reacción negativa. | Formal; caso c-usuaria-enojada-sin-novedades | atlassian-comunicacion | "Why incident communication matters" | Leí la página. |
| 6 | Evitar "outage" salvo que haya sido caída total; hablar de incidente o degradación. | Formal; tarjeta t-palabra-outage | pagerduty-postmortem | Sección "Postmortem", paso del mensaje externo | Leí la página. Regla de una empresa. |
| 7 | Ante la duda sobre avisar públicamente, avisar. | Formal | pagerduty-durante | "Steps for Incident Commander" ("If in doubt, post it out") | Leí la página. |
| 8 | La plantilla de mensaje (qué sabemos, qué hacemos, qué podés hacer, próxima actualización) está armada por mí con los elementos de las filas 4 y 5. | Formal, bloque `text` | atlassian-comunicacion | "Prepping for incident communication" | Plantilla propia y ilustrativa. |
| 9 | ITIL 4 incluye la práctica de gestión del conocimiento: mantener y mejorar el uso eficaz de la información y el conocimiento de la organización. | Formal, §Base de conocimiento | peoplecert-glosario | §8, p. 15, "Knowledge Management" | Leí el PDF. |
| 10 | Lo más valioso para documentar: incidentes comunes con muchos tickets y problemas recurrentes. | Formal | atlassian-conocimiento | "The knowledge management process in IT", paso "Knowledge identification" | Leí la página. |
| 11 | KCS tiene cuatro prácticas en el ciclo de resolución: capturar, estructurar, reutilizar y mejorar. | Formal; tarjetas t-kcs-capturar y t-kcs-flag-it-or-fix-it; ejercicio e-cuando-documentar | kcs-v6 | "The Solve Loop", Prácticas 1-4 | Leí la página (KCS v6 Practices Guide). Solo leí el Solve Loop, no la guía completa. |
| 12 | Reutilizar = buscar en la base al empezar y durante el ticket; mejorar = quien usa un artículo lo revisa (corrige si tiene licencia, si no, marca). | Formal | kcs-v6 | Prácticas 3 y 4 | Ídem. |
| 13 | El artículo de ejemplo (síntoma con palabras del usuario, entorno, causa, solución) sigue la plantilla simple de KCS. | Formal, bloque markdown | kcs-v6 | Prácticas 1 y 2 | Ejemplo propio y ilustrativo (los 90 días son inventados). |
| 14 | Los portales de autoservicio desvían tickets antes de que lleguen a la cola. | Formal; ejercicio e-horas-liberadas-con-kb | atlassian-conocimiento | "Knowledge sharing and distribution" y "Knowledge application and evolution" | Leí la página. |
| 15 | Post-mortem = registro escrito de un incidente con impacto, acciones, causas raíz y acciones de seguimiento. | Formal, §Post-mortem; tarjeta t-postmortem-definicion | google-sre-postmortem | cap. 15, introducción | Leí el capítulo. |
| 16 | Objetivos: documentar, entender las causas que contribuyeron y dejar acciones preventivas efectivas. Disparadores típicos: caída visible por encima de un umbral, pérdida de datos, intervención de guardia. Definir los criterios antes. | Formal; tarjeta t-criterios-antes | google-sre-postmortem | cap. 15, "Google's Postmortem Philosophy" | Leí el capítulo. |
| 17 | Sin culpables: asumir buenas intenciones; no se puede "arreglar" a las personas pero sí los sistemas y procesos. | Formal; tarjetas t-blameless-supuesto y t-arreglar-sistemas-no-personas | google-sre-postmortem | cap. 15, "Google's Postmortem Philosophy" | Leí el capítulo. |
| 18 | La cultura blameless nació en la salud y la aviación. | Formal | google-sre-postmortem | cap. 15, "Google's Postmortem Philosophy" | Leí el capítulo. |
| 19 | En una cultura de castigo la gente no reporta problemas por miedo. | Formal; tarjeta t-castigo-oculta-problemas | google-sre-postmortem | cap. 15, "Best Practice: Avoid Blame and Keep It Constructive" | Leí el capítulo. |
| 20 | Criterios de un buen post-mortem: preguntar qué y no quién; acciones sobre el sistema; responsable, prioridad y estado final verificable; sin lenguaje cargado; publicación rápida y amplia. | Formal; tarjeta t-accion-verificable; casos | google-sre-workbook-pm | cap. 10, "Bad Postmortem" (ítems Key action item characteristics, Counterproductive finger pointing, Animated language, Missing ownership, Delayed publication) y "Good Postmortem" (Measurability, Blamelessness, Promptness) | Leí el capítulo. |
| 21 | Un post-mortem sin acciones posteriores es indistinguible de no tener post-mortem (cita atribuida a Ben Treynor Sloss en el libro). | Tarjeta t-postmortem-sin-accion | google-sre-workbook-pm | cap. 10, recuadro "Note" dentro de "Bad Postmortem" | Leí el capítulo; es una paráfrasis. |
| 22 | PagerDuty: un único responsable del post-mortem, que empieza por la línea de tiempo; se anotan quiénes respondieron (IC y escriba). | Formal; ejercicio e-vf-blameless-sin-nombres | pagerduty-postmortem | "Owner Responsibilities" y "Postmortem" | Leí la página. |
| 23 | Blameless no impide nombrar roles: lo que evita es juzgar. | Formal; ejercicio e-vf-blameless-sin-nombres | pagerduty-postmortem; google-sre-workbook-pm | Filas 20 y 22 | Interpretación propia combinando ambas. |
| 24 | La tabla "con culpable / sin culpable" es ilustrativa; el patrón (reformular desde el sistema) sigue los ejemplos del Workbook. | Formal, tabla | google-sre-workbook-pm | cap. 10, "Model and Enforce Blameless Behavior" | Ejemplos propios. |
| 25 | Ejercicio e-horas-liberadas-con-kb: 40·6 = 240 min = 4 h; 70 % = 2,8 h. | Ejercicio | (cálculo propio) | n/a | Python: 40·6 = 240; 240/60 = 4; 4·0,7 = 2,8. Los datos son inventados. |
| 26 | Casos c-usuaria-enojada-sin-novedades y c-postmortem-quien-fue. | Casos | atlassian-comunicacion; google-sre-workbook-pm | Filas 4, 5, 20 | Aplicación; todo es ficticio. |
| 27 | Problemas p-articulo-kb-reseteo y p-postmortem-propio: tareas guiadas por las secciones indicadas. | Problemas | kcs-v6; google-sre-workbook-pm | Prácticas 1-2; cap. 10 "Bad/Good Postmortem" | Leí ambas. |

### Fuentes del tema
- `google-sre-incidentes` (cap. 14), `google-sre-postmortem` (cap. 15): Beyer et al., *Site Reliability Engineering*, O'Reilly, 2016; web libre.
- `google-sre-workbook-pm`: Beyer et al. (eds.), *The Site Reliability Workbook*, O'Reilly, 2018, cap. 10; web libre. No verifiqué la lista de editores del libro: figura en el tema solo el equipo autor del capítulo.
- `pagerduty-postmortem`, `pagerduty-durante`: PagerDuty Incident Response Guide (documentación abierta del proveedor).
- `atlassian-comunicacion`, `atlassian-conocimiento`: Atlassian (proveedor).
- `kcs-v6`: Consortium for Service Innovation, *KCS v6 Practices Guide*, página "The Solve Loop".
- `peoplecert-glosario`: ver el tema 1.

### Números y datos inventados para ejemplos
- "40 reseteos por semana, 6 minutos cada uno, 70 % de autoservicio", "caída de 2 horas", "alerta a los 25 minutos", el compañero "Martín" (ficticio) y las fechas de las acciones: todos ilustrativos.

## Simuladores usados
- `SimMaquinaEstados preset="incidente-itil"` (tema 1)
- `SimGrafo grafo="cadena-red" modo="buscar-falla"` (tema 2)
- `SimMatrizPrioridad tickets="mesa-lunes"` y `SimFlujo modo="cola" etiquetas="tickets" slaMinutos={240}` (tema 3)
- `SimFlujo modo="cola" etiquetas="tickets" kb={true}` (tema 4)
- Los simuladores aún pueden verse como "en construcción" mientras F2 los termina; las props validan en el build.

## Lo que no pude verificar
- **Texto original de ITIL 4**: no tuve acceso al libro *ITIL Foundation: ITIL 4 Edition* ni a las guías de práctica. Incidente, problema, gestión de incidentes y de problemas, control de cambios, SLA y gestión del conocimiento los leí en el glosario del temario de PeopleCert (que cita al libro). La definición de *change* ("agregar, modificar o quitar…"), la de *service request*, la de *known error*, los tres tipos de cambio y el renombre a *change enablement* los leí solo en las guías de Atlassian, que dicen reproducir a ITIL pero no son el texto de AXELOS.
- La **matriz impacto × urgencia con P1-P5 y los plazos** no es oficial de ITIL: es un ejemplo del simulador (idéntico al de IT Process Wiki). El tema lo dice explícitamente.
- **ISO/IEC 7498-1** es de pago; usé la Recomendación UIT-T X.200, que declara texto idéntico.
- **Cloudflare Learning Center** devolvió 403 a descargas automáticas y no lo usé. `traceroute(8)` no pude descargarlo, así que el tema habla de `ping`, `dig` e `ip` solamente (más el término "trace" que menciona Cisco Press).
- **Cisco Press (Ranjbar)**: solo el capítulo de muestra gratuito.
- **KCS**: solo la página "The Solve Loop" de la guía v6, no la guía entera.
- No usé NIST SP 800-61 (no la abrí): el ciclo de respuesta y las lecciones aprendidas se respaldan con el libro de SRE y PagerDuty.
- Lo que se dice sobre cómo hablar con un usuario enojado se apoya en las recomendaciones de Atlassian y del libro de SRE sobre comunicación de incidentes; no encontré una fuente abierta académica sobre atención de usuarios enojados, así que no afirmo nada más específico.

## Libros que conviene pedirle al dueño
- AXELOS, *ITIL Foundation: ITIL 4 Edition* (TSO, 2019): definiciones oficiales de incidente, problema, cambio, solicitud de servicio, prácticas; sería la fuente para reemplazar las citas a Atlassian.
- Guías de práctica de ITIL 4 (AXELOS/PeopleCert): *Incident Management*, *Problem Management*, *Change Enablement*, *Service Request Management*, *Service Desk*, *Service Level Management* y *Knowledge Management* (las primeras cinco en su revisión 2023).
- AXELOS, *ITIL 4: Create, Deliver and Support* (TSO, 2020): prioridad, service desk y soporte a usuarios.
- Tanenbaum, Feamster y Wetherall, *Computer Networks* (6.ª ed., 2021): modelo OSI contra TCP/IP, para citar la parte de capas desde un libro de cátedra.
- Ranjbar, *Troubleshooting and Maintaining Cisco IP Networks (TSHOOT) Foundation Learning Guide* (Cisco Press, 2015) completo: tengo solo el capítulo 1.
- Limoncelli, Chalup y Hogan, *The Practice of System and Network Administration* (3.ª ed., 2016): mesa de ayuda, troubleshooting y post-mortems. No lo consulté; es candidato.

## Pedidos al director
- Prerrequisitos entre temas de mi área (`soporte/itil-incidente-problema-cambio`, `soporte/prioridad-y-sla`) existen en mi worktree, así que el modo estricto no marca nada de soporte. El estricto sí marca las otras áreas (0 temas), como se esperaba.
- Las fuentes de Atlassian y PagerDuty las clasifiqué como `doc-oficial` (documentación pública del proveedor), siguiendo el encargo; si F4 prefiere tratarlas como blog, habría que cambiar su tipo a `blog` con `verMas: true` y reemplazar esas citas por PeopleCert o SRE donde exista. Los datos que dependen solo de Atlassian están listados arriba en "Lo que no pude verificar".
- IT Process Wiki entra como `tipo: blog` con `verMas: true` (wiki de consultora con licencia CC), solo para ver más.
- No hizo falta pedir simuladores nuevos. El simulador `incidente-itil` no tiene un evento "pedir cambio de emergencia"; el tema 1 usa los eventos "es recurrente" y "pedir cambio" tal como están en el contrato.
- Los temas 2 y 4 llegan a unas 1.450 y 1.530 palabras de cuerpo (con bloques de código y tablas), por encima del objetivo de 1.500 en el segundo; los bloques de código y las tablas son lo que más pesa.
