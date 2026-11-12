# Verificación F4 — escalabilidad-balanceo-cache

- **Tema:** arquitecturas/escalabilidad-balanceo-cache
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO tras la re-verificación del commit 2294204 (H1–H4 cerrados). Veredicto inicial (aaa7ad0): OBSERVADO.

Método: fuentes abiertas con `curl` sobre el HTML original y convertidas a texto con títulos. NGINX: leí `load_balancing.html` y `ngx_http_upstream_module.html`. No pude ejecutar `nginx -t` (no hay nginx instalado y el usuario no tiene permiso sobre el socket de Docker), así que la configuración se contrastó con la documentación directiva por directiva. Números recalculados con Python.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Vertical = más capacidad a un recurso (cargas no divisibles); horizontal = más instancias, resiliencia y capacidad (cargas divisibles) | azure-escalado | "Choose a scaling strategy" | ✅ | Título exacto y contenido fiel. |
| 2 | Evitar sesión en el servidor (externalizarla) y la afinidad de cliente | azure-escalado | "Design application to scale" | ✅ | Título exacto; "Eliminate server-side session state" y "Eliminate client affinity". |
| 3 | Evitar singletons cuello de botella | azure-escalado | "Design infrastructure to scale" | ✅ | "Avoid singletons". |
| 4 | N ≥ ⌈λ/(μ·ρ_obj)⌉; 600/(50·0,7) → 18 | cálculo | — | ✅ | Python: 17,14 → 18. Con 17 la utilización sería 70,6 %; con 18, 66,7 %. |
| 5 | El autoscaling tarda en completarse; la guía recomienda un colchón y probar las demoras | azure-escalado | "Configure scaling" | ⚠️ | "Use a buffer" está en "Configure scaling" (para picos); "It takes time for scaling to complete, so test the effects" está en "Test scaling". El "así que" causal es inferencia. Ver H1. |
| 6 | Si un clúster cae y el otro recibe +20 %, puede no absorberlo | sre-cascadas | "Server Overload" | ✅ | El ejemplo es 1.000 → 1.200 QPS en el clúster A; título exacto. |
| 7 | NGINX: round-robin por defecto; `least_conn` (ayuda con pedidos largos); `ip_hash` (mismo cliente, mismo servidor salvo caída); `weight`; `max_fails`/`fail_timeout` | nginx-balanceo | "Load balancing methods", "Health checks" | ✅ | Ambos títulos existen. Cada afirmación coincide con la página. |
| 8 | Configuración NGINX de ejemplo (`upstream` con `least_conn`, `weight=2`, `max_fails=3 fail_timeout=30s`, `proxy_pass http://tienda`) | nginx-balanceo; ngx_http_upstream_module | `server` params, `least_conn`, `weight` | ✅ | Todas las directivas y parámetros existen y están bien ubicados; `least_conn` admite pesos ("in the recent versions"). El ejemplo no lleva el bloque `http {}` (válido si va en `conf.d`). No ejecutado: ver método. |
| 9 | Un algoritmo mal elegido puede fijar clientes en una instancia | azure-escalado | "Review your load balancing algorithm" | ✅ | Es un ítem en negrita dentro de "Design application to scale"; el nombre es exacto. |
| 10 | Dos réplicas independientes de 99,9 % dan 99,9999 % | aws-disponibilidad | "Calculating availability with redundant components" | ✅ | Título exacto; Python: 1 − 0,001² = 0,999999. La salvedad "siempre que las que quedan puedan con la carga" es correcta. |
| 11 | Cache-aside: mirar la caché, en miss leer la base, guardar y devolver; al escribir, base primero e invalidar | azure-cache-aside | "Solution" | ✅ | Coincide. |
| 12 | Invalidar antes de escribir permite recargar el valor viejo | azure-cache-aside | "Example" (nota sobre el orden) | ✅ | La nota está en "Example". |
| 13 | Cache-aside no garantiza consistencia; TTL ni corto ni largo; caché local privada puede desincronizarse | azure-cache-aside | "Problems and considerations" | ✅ | "Consistency", "Lifetime of cached data", "Local caching". |
| 14 | λ_base = λ(1−h); h = 0,8 → una quinta parte | cálculo | — | ✅ | Python: 20/100. |
| 15 | Caché fría: sobredimensionar, subir la carga de a poco, cachés de latencia y no de capacidad | sre-cascadas | "Slow Startup and Cold Caching" | ✅ | Título exacto (encabezado de nivel 1). |
| 16 | Load shedding y degradación elegante | sre-cascadas | "Load Shedding and Graceful Degradation" | ✅ | Título exacto. |
| 17 | Código Python del cache-aside | azure-cache-aside | "Example" | ✅ | Sintaxis válida (`ast.parse`); orden correcto (base, luego invalidar). |
| 18 | Lecturas de simuladores (λ > servidores × capacidad ⇒ colas crecen; caché 80 % baja la utilización; servidor lento: menos-conexiones tiene p95 menor) | SIMULADORES.md §2.8 | contrato | ✅ | Props válidos contra el contrato (`servidores`, `algoritmo`, `tasaLlegada`, `capacidadPorServidor`, `cache`, `aciertoCache`, `servidorLento`). Falta contrastar con el simulador real. Ver H3. |
| 19 | e-servidores-necesarios: 18 | cálculo | — | ✅ | Errores comunes 12 y 17 correctos. |
| 20 | e-carga-base-con-cache: 90 | cálculo | — | ✅ | 600 × 0,15 = 90; error 510 correcto; tolerancia 1. |
| 21 | e-servidor-lento: `least_conn` es la mejor respuesta | nginx-balanceo | "Least connected load balancing" | ✅ | La página lo justifica ("some of the requests take longer"). Distractores bien explicados. |
| 22 | e-vf-cache-consistente (falso) | azure-cache-aside | "Consistency" | ✅ | Correcto. |
| 23 | Tarjetas (11): atomicidad y claridad | varias | — | ⚠️ | t-max-fails-fail-timeout: compuesta y con "seguidas" impreciso. Ver H2. El resto OK (t-carga-base-acierto = 20 ✅). |
| 24 | Caso c-hot-sale-pico: decisión buena (sumar instancias con margen antes del pico, precalentar caché, subir peso de a poco) | azure-escalado, sre-cascadas | "Configure scaling"; "Slow Startup and Cold Caching" | ✅ | Es práctica documentada; opciones malas tentadoras (confiar en el autoscaler, reiniciar, TTL de 24 h); hay desenlaces regular. Los tiempos cierran: 23:55 + 4 min = 23:59. |
| 25 | p-nginx-tres-backends / p-cache-aside-python | nginx-balanceo; azure-cache-aside | — | ⚠️ | Ver H4 para el reparto con `curl` secuencial. |
| 26 | Plagio | todas | — | ✅ | Solo coinciden títulos y la configuración de ejemplo (propia). |
| 27 | Estilo | GUIA-ESTILO | — | ✅ | CasoReal 125, Intuición 307, Formal 635 palabras (cuerpo 1067). |

## Hallazgos abiertos

**H1** — `src/content/temas/arquitecturas/escalabilidad-balanceo-cache/tema.mdx`, Formal, "Cuántos servidores hacen falta": "el escalado automático tarda en completarse, así que la guía de Azure recomienda un colchón de capacidad libre para los picos y probar el efecto de esas demoras<Cita f="azure-escalado" loc="Configure scaling" />"; la tarjeta `t-autoscaler-tarda` en `practica.yaml` repite el nexo causal. Qué está mal: el "así que" no está en la fuente y las dos ideas están en secciones distintas. Qué dice la fuente: "Use a buffer" (bajo "Configure scaling") recomienda capacidad libre "para manejar picos inesperados"; "It takes time for scaling to complete, so test the effects of scaling delays" está en "Test scaling". Corrección: dos citas ("Configure scaling" para el colchón, "Test scaling" para la demora) y reformular el nexo como conclusión propia ("como el escalado automático tarda, un colchón tiene sentido").

Respuesta del autor: corregido: dos citas ("Configure scaling" y "Test scaling") y el nexo marcado como conclusión propia; tarjeta partida en `t-colchon-capacidad` y `t-escalado-demora`.

Re-verificación F4: **CERRADO** (2294204). Dos citas ("Configure scaling" para el colchón, "Test scaling" para la demora) y el nexo queda como conclusión propia ("En criollo"); tarjetas `t-colchon-capacidad` y `t-escalado-demora` atómicas y fieles a "Use a buffer" y "It takes time for scaling to complete, so test the effects of scaling delays".

**H2** — `escalabilidad-balanceo-cache/practica.yaml`, tarjeta `t-max-fails-fail-timeout`. Qué está mal: (a) dos ideas en una tarjeta (GUIA-ESTILO §4 regla 1); (b) "fallas seguidas": la guía de balanceo de nginx dice "consecutive unsuccessful attempts", pero la referencia del módulo upstream dice "unsuccessful attempts … in the duration set by fail_timeout" (sin "consecutivas"), y `fail_timeout` cumple dos roles: la ventana de conteo y el tiempo que el servidor queda como no disponible (por defecto 10 s; `max_fails` por defecto 1). Corrección: dos tarjetas, o un dorso exacto ("`max_fails` es cuántos intentos fallidos dentro de la ventana de `fail_timeout` marcan al servidor como no disponible, y `fail_timeout` también es cuánto dura ese estado").

Respuesta del autor: corregido: dos tarjetas con la formulación exacta de `max_fails` y de `fail_timeout`, y el texto del tema ajustado.

Re-verificación F4: **CERRADO** (2294204). Texto y tarjetas conforme a la referencia de `ngx_http_upstream_module` (intentos fallidos dentro de la duración de `fail_timeout`; `fail_timeout` es también el período como no disponible); sin "seguidas"; dos tarjetas.

**H3** — `escalabilidad-balanceo-cache/tema.mdx`, Intuición, segundo `<SimFlujo>`: pasa `servidorLento={true}` y la consigna dice "Activá 'servidor lento'". Con el valor inicial en `true` el toggle ya está activado. Corrección: quitar `servidorLento={true}` o cambiar la consigna a "Con 'servidor lento' activado, compará…". Menor.

Respuesta del autor: corregido: se quitó `servidorLento={true}`.

Re-verificación F4: **CERRADO** (2294204). Se quitó `servidorLento={true}`; la consigna "Activá 'servidor lento'" ahora es coherente.

**H4** — `escalabilidad-balanceo-cache/practica.yaml`, problema `p-nginx-tres-backends`. Qué está mal (expectativa): con `curl` uno por vez no hay conexiones simultáneas, así que `least_conn` se comporta como round-robin y el alumno no va a ver diferencia. Qué dice la fuente: `least_conn` actúa "cuando algunos pedidos tardan más" (nginx-balanceo, "Least connected load balancing"). Corrección: pedir pedidos concurrentes (`xargs -P`/`ab`) y que uno de los backends demore (por ejemplo con un `sleep`), o avisar que con pedidos secuenciales el reparto es igual. Menor.


Respuesta del autor: corregido: el problema pide pedidos concurrentes y un backend que demore, y avisa que en secuencial least_conn reparte igual.

Re-verificación F4: **CERRADO** (2294204). El problema pide pedidos concurrentes y un backend lento, y avisa que en secuencial `least_conn` reparte como round-robin (cierto: con empate nginx cae en round-robin ponderado).