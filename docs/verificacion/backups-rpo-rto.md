# Verificación F4 — backups-rpo-rto

- **Tema:** servidores/backups-rpo-rto
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO (ronda 2 sobre a7a54c4: solo queda abierto H8, menor)

Alcance: `tema.mdx`, `practica.yaml` y las filas de `FUENTES-servidores.md`. NIST SP 800-34 Rev. 1 se descargó de nvlpubs.nist.gov y se leyó con `pdftotext` (149 páginas PDF; la numeración impresa va 14 páginas por detrás de la del PDF). *Data Backup Options* (US-CERT, 2012) se leyó del PDF. La guía #StopRansomware se leyó con WebFetch.

Puntos que marcó el autor como no verificados:
- **"Aislar antes de restaurar" (CISA):** confirmado. La guía dice, en Detection and Analysis: "Determine which systems were impacted, and immediately isolate them", y agrega que solo se apaga el equipo si no se puede desconectar (porque se pierde evidencia volátil). El primer paso del caso es correcto. Ver H4 por lo que el camino bueno omite.
- **Regla 3-2-1 y nota 1:** confirmado en el PDF (ver filas 6 y 7).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | MTD: tiempo total de interrupción que acepta el dueño del sistema | NIST SP 800-34r1 | §3.2.1 | ⚠️ | Texto correcto, pero está en la p. impresa 17, no en la 16. Ver H1. |
| 2 | RTO: máximo que un recurso puede estar caído antes de impacto inaceptable; normalmente menor que el MTD | NIST SP 800-34r1 | §3.2.1 | ⚠️ | "the RTO must normally be shorter than the MTD" ✓; página 17 (H1). |
| 3 | RPO: punto al que se recuperan los datos con la copia más reciente; no es parte del MTD | NIST SP 800-34r1 | §3.2.1 | ⚠️ | "Unlike RTO, RPO is not considered as part of MTD" ✓; página 17 (H1). |
| 4 | Pérdida entre 0 y f horas con respaldos cada f; hasta 2f si el último no sirve | derivada | — | ✅ | Marcada como cuenta derivada en el texto. |
| 5 | Tiempo de restauración = datos / velocidad, cota inferior del RTO | derivada | — | ✅ | |
| 6 | Regla 3-2-1: 3 copias (1 original + 2 respaldos), 2 tipos de medios, 1 fuera del sitio | Ruggiero y Heckathorn, *Data Backup Options* (US-CERT 2012) | introducción | ✅ | "3 – Keep 3 copies of any important file: 1 primary and 2 backups. 2 – ... 2 different media types ... 1 – Store 1 copy offsite". |
| 7 | La regla se atribuye a Peter Krogh, *The DAM Book* 2.ª ed., O'Reilly 2009 | idem | nota 1 | ✅ | Nota 1: "Krogh, Peter. The DAM Book ... 2nd Edition, p. 207. O'Reilly Media, 2009." |
| 8 | Ransomware busca respaldos accesibles; recomendar offline y cifrados; verificar disponibilidad e integridad | CISA #StopRansomware Guide | Parte 1 | ✅ | "Maintain offline, encrypted backups"; "many ransomware variants attempt to find and subsequently delete or encrypt accessible backups"; "regularly test the availability and integrity of backups". |
| 9 | Recuperar desde respaldos offline y cifrados cuidando no reinfectar | CISA #StopRansomware Guide | Parte 2 | ✅ | "restore data from offline, encrypted backups"; "Take care not to re-infect clean systems during recovery". |
| 10 | Política de backup: frecuencia y alcance, ubicación, rotación, transporte afuera; guardar afuera es buena práctica; considerar el mismo desastre | NIST SP 800-34r1 | §3.4.2, p. 21 | ✅ | Texto y página correctos ("Geographic area: ... affected by the same disaster"). |
| 11 | Probar respaldos con regularidad (la nota habla de cintas) | NIST SP 800-34r1 | nota 25, p. 21 | ✅ | "Backup tapes should be tested regularly ... retrieved without errors". |
| 12 | Las pruebas del plan suelen centrarse en recuperación y backups | NIST SP 800-34r1 | §3.5.1 | ⚠️ | "Tests often focus on recovery and backup operations": está en la p. 28, no en la 27. Ver H1. |
| 13 | rsync: `-a`, `-n`, `-c`, `--delete`, `--link-dest` | rsync(1) | opciones | ✅ | `--help` local 3.2.7 y página oficial coinciden. |
| 14 | `--delete` es espejo sin historial | derivada | --delete | ✅ | Consecuencia lógica, marcada así. |
| 15 | Bloque bash de rsync (simulacro, `--link-dest`, restauración de prueba, verificación `-anc -v`) | rsync(1) | — | ✅ | Sintaxis válida; `--link-dest` con ruta absoluta correcta. |
| 16 | `pg_dump` saca foto consistente sin bloquear lecturas/escrituras (salvo locks exclusivos); `-Fc` + `pg_restore` | PostgreSQL docs | §25.1 y §25.1.3 | ✅ | "snapshot of the database at the time pg_dump began running"; `pg_dump -Fc` y `pg_restore -d` están en §25.1.3 (el tema cita §25.1 en general). |
| 17 | Timer `OnCalendar=*-*-* 02:00:00` y `Persistent=true` | systemd.timer(5) | OnCalendar=, Persistent= | ✅ | El ejemplo omite el `respaldo.service` que el timer activa (el man lo exige); no se afirma otra cosa. |
| 18 | e-rpo-real-viernes = 15,5 h; e-rpo-sin-probar = 39,5 h | derivada | — | ✅ | Python: 17,5−2 = 15,5; 24+15,5 = 39,5. |
| 19 | e-tiempo-restauracion = 2,5 h | derivada | — | ✅ | 900 000 MB / 100 MB/s = 9000 s = 2,5 h. Errores comunes 9000 y 9 correctos. |
| 20 | e-espacio-respaldo = 2600 GB | derivada | — | ✅ | 4·500 + 4·6·25 = 2600. |
| 21 | e-espacio-respaldo, error común `2650` ("7 incrementales por semana") | — | `erroresComunes` | ❌ | Con 7 incrementales daría 4·(500+7·25) = 2700. Ver H2. |
| 22 | e-cumple-321 (no cumple: ninguna copia fuera del sitio) | CISA backup | intro | ✅ | Ver nota en H5 sobre los tipos de medios. |
| 23 | e-vf-backup-exito = falso | NIST | nota 25 | ✅ | |
| 24 | Ojo: copia siempre conectada también se cifra | CISA ransomware | Parte 1 | ✅ | |
| 25 | Consigna 1 del simulador `respaldo` (23 h → RPO real 23,0; 4 h cumple) | SIMULADORES.md §2.10 | — | ✅ | Coincide con el contrato. |
| 26 | Consigna 2: "Apagá 'respaldo probado'" | SIMULADORES.md §2.10 | — | ⚠️ | El componente ya se monta con `respaldoProbado={false}`. Ver H3. |
| 27 | RTO real = tiempo caído mientras se restaura | SIMULADORES.md §2.10 | — | ✅ | El contrato lista `rto-real-horas` sin otra definición; el pedido del autor al director queda abierto hasta ver el simulador real. |
| 28 | Caso c-ransomware-viernes: aislar, restaurar en lugar de prueba, informar RPO real | CISA ransomware | Partes 1 y 2 | ⚠️ | Primer paso correcto. El camino "bien" omite pasos que la guía pide. Ver H4. |
| 29 | 11 tarjetas | ver filas | — | ⚠️ | Correctas. Ver H5 (atomicidad y valor). |
| 30 | Plagio | fuentes | — | ✅ | Paráfrasis propia; las definiciones de NIST están reformuladas. |
| 31 | Estilo | GUIA-ESTILO | — | ✅ | |

## Hallazgos abiertos

**H1** — `tema.mdx`: `<Cita f="nist-800-34" loc="§3.2.1, p. 16" />` (apertura de Formal, definiciones de MTD/RTO/RPO) y `<Cita ... loc="§3.5.1, p. 27" />` (cierre del párrafo de pruebas); frontmatter `fuentes[nist-800-34].ubicacion`; `FUENTES-servidores.md` filas 1-3 y 12.
- Qué está mal: las definiciones de MTD, RTO y RPO están en la p. impresa 17 (PDF p. 31); la sección 3.2.1 empieza en la 16. La frase "Tests often focus on recovery and backup operations" está en la p. 28 (PDF p. 42), no en la 27. Las citas de §3.4.2 y nota 25 (p. 21) sí son correctas.
- Qué dice la fuente: NIST SP 800-34 Rev. 1, §3.2.1, p. 17 ("Maximum Tolerable Downtime (MTD). The MTD represents the total amount of time ..."); §3.5.1, p. 28.
- Corrección propuesta: `loc="§3.2.1, p. 17"`, `loc="§3.5.1, p. 28"`, y actualizar `ubicacion` y FUENTES.

**H2** — `practica.yaml` → `ejercicios[e-espacio-respaldo].erroresComunes[1]` (`valor: 2650`).
- Qué está mal: la explicación dice "Sumaste 7 incrementales por semana", pero eso da 4·(500 + 7·25) = 2700 GB. 2650 equivale a 26 incrementales, que no corresponde a ningún error descripto.
- Qué dice la fuente: aritmética (verificada con Python).
- Corrección propuesta: `valor: 2700`.

**H3** — `tema.mdx`, segundo `<SimSerieTemporal ... respaldoProbado={false}>` y su `consigna` ("Apagá 'respaldo probado' y mirá ...").
- Qué está mal: el simulador arranca con el toggle ya apagado, así que la consigna pide una acción que ya está hecha. El lector no ve el contraste que la consigna quiere mostrar.
- Qué dice la fuente: `SIMULADORES.md` §2.10: `respaldoProbado` es un toggle (por defecto `true`); apagarlo hace saltar la pérdida un respaldo hacia atrás (suma `frecuenciaHoras`).
- Corrección propuesta: dejar `respaldoProbado` en su default (o `true`) y mantener "Apagá ...", o cambiar la consigna a "Prendé y apagá 'respaldo probado' y compará el RPO real".

**H4** — `practica.yaml` → `casos[c-ransomware-viernes]`, camino `primer-paso → mirar-copias → validar-restore → final-bien`.
- Qué está mal: el aislamiento inicial es correcto, pero el desenlace `bien` termina con "El servidor vuelve con 22 días de atraso" sin pasar por reconstruir o limpiar el servidor ni por notificar. El camino `regular` ("restauro el USB directo sobre el servidor") y el `bien` terminan, en la práctica, en el mismo servidor posiblemente comprometido; la diferencia solo es la prueba previa. Además, pedir "los archivos recientes que tengan en sus PC" a cada área puede reintroducir archivos infectados.
- Qué dice la fuente: CISA #StopRansomware Guide, Parte 2: tomar imagen del sistema y memoria de una muestra de equipos afectados (Containment and Eradication), reconstruir los sistemas "using pre-configured standard images, if possible", "Take care not to re-infect clean systems during recovery", y "Report the incident to ... CISA, your local FBI field office". Sobre pagar, la página no da guía; el caso lo marca `mal` por falta de garantías, lo cual es razonable pero no está respaldado por esa página.
- Corrección propuesta: agregar un nodo entre `validar-restore` y `final-bien` (reinstalar o limpiar el servidor y recién entonces restaurar; avisar al responsable de seguridad o denunciar), mover "restauro directo sin revisar" al desenlace `mal` o aclarar la diferencia, y acotar la recolección de archivos de PCs a "después de revisarlos". Cambiar el respaldo de la afirmación sobre el rescate a una fuente que lo diga (la propia guía completa de CISA/FBI) o suavizar la consecuencia.

**H5** (menor, no bloquea) — `practica.yaml`, tarjetas y ejercicio.
- `t-321-numeros` ("¿qué significa cada número?") es de tipo lista (3 elementos): la guía de estilo pide una tarjeta por elemento o una pregunta puntual (por ejemplo "¿cuántas copias fuera del sitio pide la regla 3-2-1?").
- `t-321-origen` es trivia de atribución con dorso de dos ideas; la propia nota dice que es práctica difundida, no norma. Conviene reemplazarla por una de aplicación.
- Definiciones: hay 4 tarjetas de definición/"qué mide" (`t-rpo`, `t-rto`, `t-rto-contra-mtd`, `t-321-numeros`) frente a un máximo de 2 por tema.
- `e-cumple-321`: el disco externo y el NAS son ambos discos; la pregunta no aclara si cuentan como dos medios. Agregar "(un HDD externo y un NAS con discos)" o cambiar uno por cinta/nube para que la única razón del "no" sea la falta de copia fuera del sitio. La opción 3 ("exactamente cuatro copias") no es un distractor plausible.

## Re-verificación (cierre de F4) — diff 6b629de..a78c34f

Revisé solo lo que cambió. `npm run build` en Node 24: verde. Releí la guía #StopRansomware de CISA con el orden de su Ransomware Response Checklist y la página de CERT.ar.

| Hallazgo | Estado | Verificación |
|---|---|---|
| H1 (páginas de NIST) | CERRADO (a78c34f) | Citas en p. 17 (§3.2.1) y p. 28 (§3.5.1); coinciden con el PDF (`pdftotext`, numeración impresa). No quedan "p. 16"/"p. 27" en el tema ni en FUENTES (grep). |
| H2 (`erroresComunes` 2650) | CERRADO (a78c34f) | `2700` = 4·(500 + 7·25) (Python). |
| H3 (consigna "Apagá respaldo probado") | CERRADO (a78c34f) | Se quitó `respaldoProbado={false}`; el default del contrato es `true`, así que apagar el toggle ahora es una acción real. |
| H4 (caso de ransomware) | REABIERTO | El nuevo camino (aislar sin apagar → imagen y memoria + avisar internamente → reconstruir desde imagen limpia → restaurar en carpeta de prueba → informar y reportar → `final-bien`) sigue casi todo el checklist de CISA, pero el reporte externo queda al final. Ver H6. Lo demás está respaldado: "immediately isolate them"; apagar solo si no se puede desconectar (se pierden rastros volátiles); "Take a system image and memory capture of a sample of affected devices"; "Rebuild systems ... pre-configured standard images"; "Reconnect systems and restore data from offline, encrypted backups"; "Consult federal law enforcement ... regarding possible decryptors". La página de CERT.ar (argentina.gob.ar, ruta Jefatura de Gabinete > Centro Nacional de Ciberseguridad > CERT.ar) existe, es oficial y trae "Reportar un incidente" ("Formulario destinado al reporte público de un incidente o posible ciberataque") y `reportes@cert.ar`. |
| H5 (tarjetas y `e-cumple-321`) | CERRADO (a78c34f) con un hallazgo nuevo (H7) | `t-321-numeros` y `t-321-origen` reemplazadas; solo quedan 2 tarjetas de definición; `e-cumple-321` ahora es correcta (disco + cinta = 2 medios, 3 copias, ninguna fuera del sitio; distractor "tres tipos" plausible y explicado). La tarjeta nueva `t-321-falta-uno` es ambigua (H7). |

**Hallazgos nuevos y abiertos**

**H6** — `practica.yaml` → `casos[c-ransomware-viernes]`, nodos `tomar-evidencia` y `validar-restore` y `leccion`; relacionado con el reabierto H4.
- Qué está mal: en la guía de CISA el orden es Detection and Analysis (aislar) → Reporting and Notification → Containment and Eradication (imagen y memoria, reconstruir) → Recovery (restaurar). El caso y la lección ("aislar, guardar evidencia, reconstruir limpio, restaurar y reportar") ponen el reporte externo (CERT.ar) al final, después de restaurar, y contradicen al propio Formal ("Cuando ya pasó", que sí lo ubica segundo). Además, el nodo `tomar-evidencia` hace el aviso interno y la imagen/memoria en una sola opción; CISA condiciona la imagen/memoria ("If no initial mitigation actions appear possible") y el Formal no lo dice. Y la consecuencia de `final-pagar` dice que la guía recomienda consultar "antes" a las fuerzas de seguridad: la guía lo ubica en Containment and Eradication y aclara que no es una alternativa a pagar ni una pauta sobre pagar.
- Qué dice la fuente: CISA #StopRansomware Guide, Ransomware Response Checklist (orden indicado arriba).
- Corrección propuesta: mover el reporte (a la dirección y a CERT.ar) al nodo `tomar-evidencia` (después de aislar y antes de reconstruir), dejar en `validar-restore` solo informar el RPO real, y reescribir la lección como "aislar, reportar, guardar evidencia, reconstruir limpio y restaurar". Cambiar "consultar antes" por "consultar a las fuerzas de seguridad por posibles descifradores". Aclarar en el Formal que la imagen/memoria es condicional.

**H7** — `practica.yaml` → `tarjetas[t-321-falta-uno]`.
- Qué está mal: la pregunta ("¿qué número de la regla 3-2-1 te falta cumplir?") tiene dos respuestas correctas: el original y dos copias están en discos (falta el 2, dos tipos de medios) y todo está en la misma sala (falta el 1, fuera del sitio). El dorso admite ambas ("El 1 ...; los discos tampoco son dos tipos de medios"), incumple "respuesta única" de la guía.
- Qué dice la fuente: *Data Backup Options*, intro: "2 different media types" y "1 copy offsite".
- Corrección propuesta: dejar una sola carencia, por ejemplo "original en el servidor (disco), una copia en cintas en la misma sala y otra en el NAS de la misma sala; ¿qué número te falta?" (respuesta: el 1), o preguntar "¿por qué no cumple la regla?" con la respuesta de ambas condiciones.

**H8** (menor) — `tema.mdx` frontmatter `fuentes[cert-ar].autor` ("Dirección Nacional de Ciberseguridad, Argentina").
- Qué está mal: la página consultada no nombra a la Dirección Nacional de Ciberseguridad; la ruta y el encabezado son Jefatura de Gabinete de Ministros / Centro Nacional de Ciberseguridad / CERT.ar. Además, la página dice que CERT.ar gestiona los incidentes del Sector Público Nacional; el formulario es de "reporte público", así que sirve, pero conviene aclararlo para una pyme.
- Corrección propuesta: `autor: Jefatura de Gabinete de Ministros, Centro Nacional de Ciberseguridad (CERT.ar)` y una frase aclarando que el formulario admite reportes públicos.

Hallazgos abiertos: H4 (reabierto, se resuelve con H6), H6, H7, H8.

## Cierre ronda 2 — diff 65908e2..a7a54c4

`npm run build` en Node 24: verde. Releí el Ransomware Response Checklist de CISA (orden de la ronda anterior) y la página de CERT.ar.

| Hallazgo | Estado | Verificación |
|---|---|---|
| H4 / H6 (orden del caso, lección y Formal) | CERRADO (a7a54c4) | El caso ahora sigue a CISA: aislar sin apagar (Detection and Analysis) → nodo `reportar` (aviso interno y CERT.ar; Reporting and Notification) → `tomar-evidencia` (imagen y memoria de una muestra; Containment and Eradication) → reconstruir desde imagen limpia → restaurar en carpeta de prueba (Recovery). La lección dice "aislar, reportar, guardar evidencia, reconstruir limpio y restaurar", igual que el Formal. El Formal aclara que la imagen/memoria es condicional ("If no initial mitigation actions appear possible"); la aclaración "es decir, cuando va a haber que investigar" es interpretación razonable. Se quitó la afirmación sobre consultar a las fuerzas de seguridad "antes" y la de pagar queda solo como "esa guía no da una pauta", que es lo que dice la guía. `final-sin-reporte` (regular) está definido y es alcanzable. |
| H7 (`t-321-falta-uno`) | CERRADO (a7a54c4) | Original en disco, copia en cintas y copia en NAS, ambas en la misma sala: tres copias y dos medios (disco y cinta); solo falta el 1. Respuesta única. |
| H8 (autor de CERT.ar y alcance) | REABIERTO (parcial, menor) | El autor ahora es "Jefatura de Gabinete de Ministros, Centro Nacional de Ciberseguridad (CERT.ar)", que coincide con la página y sus migas de pan. Pero la frase nueva "el formulario es de reporte público, así que también le sirve a una pyme" va más allá de la fuente: la página dice que CERT.ar gestiona los incidentes del Sector Público Nacional, describe el formulario como "destinado al reporte público de un incidente o posible ciberataque" y no aclara si organizaciones privadas pueden usarlo. |

**H8** — `tema.mdx`, Formal "Cuando ya pasó" (frase "así que también le sirve a una pyme") y `FUENTES-servidores.md` fila 19.
- Qué está mal: se presenta como hecho una inferencia. La fuente no dice que una empresa privada pueda o deba reportar por ese formulario.
- Qué dice la fuente: CERT.ar, "Somos el Equipo de Respuesta ante Emergencias Informáticas nacional"; alcance: "gestión técnico-administrativa de los incidentes de seguridad informática en el Sector Público Nacional"; formulario "destinado al reporte público de un incidente o posible ciberataque".
- Corrección propuesta: "su gestión técnica alcanza al Sector Público Nacional; el formulario se describe como de reporte público, y la página no aclara si lo puede usar una organización privada". En el caso, que el servidor sea de "la administración" no dice cuál es el sector: si se quiere mantener el paso "reporto al CERT.ar", conviene aclarar que la organización es del sector público o escribir "reporto al CERT.ar o a la autoridad que corresponda".

Hallazgos abiertos: H8.
