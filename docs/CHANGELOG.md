# CHANGELOG — campus-personal

> Historia permanente. `/cierre` agrega una entrada AL TOPE en cada sesión. Orden descendente estricto, sin excepciones. Nada de versiones duplicadas en otros docs.

kit 3.0.0-rc.6: adopción — piezas settings, hook-arranque, hook-escritura, hook-git-seguro, hook-sensible, cambios-metodo, hooks-lib, candado, scripts, inicio, cierre, githooks, docs, estado, director-obrero

## 2026-11-12 — v1 publicada y cerrada (F6b, F7 y cierre del módulo)

### Added
- v1 publicada en https://jrobilara.github.io/campus-personal/: 24 temas en 6 áreas (284 tarjetas, 131 ejercicios, 61 problemas, 20 casos de guardia, 12 simuladores), cada tema con su informe de verificación en `docs/modulos/v1/verificacion/`.
- `docs/referencia/GUIA-DEL-PROYECTO.md`: guía completa (qué hay, cómo está hecho, procedimiento para cargar temas, áreas y simuladores, metodología, operación). Queda como base de la futura skill del repo para crear/actualizar módulos (ítem v2 del TODO).
- Prueba en vivo del cierre: service worker controlando a los ~43 s de la primera visita (160 archivos precacheados; una corrida justo post-deploy no llegó en 60 s) y búsqueda "varianza" sin red devuelve `variables-y-distribuciones`.
- Test e2e: si falla IndexedDB al registrar un ejercicio, se ve el resultado y el aviso de que no se guardó.

### Changed
- F6b: repo público, Pages y primer deploy; prueba en vivo de portada, temas, "varianza", offline y export/import. El `404.html` sale del precache (rompía la instalación del service worker solo en Pages) y el buscador anda sin red (wasm, filtro y `?ts=` de Pagefind al precache).
- F7 (commits `26ffebe`..`f6be9e8`): revisión de código y UI. Progreso con copia aparte si lo guardado está dañado y lecturas que no pisan escrituras nuevas; repaso que no se traba si falla el guardado, con foco y barra de progreso accesibles; buscador sin repoblar la lista tras vaciar el campo; importación que no se rompe si el archivo no se lee; desborde a 390 px corregido.
- Ejercicios: si el guardado del resultado falla, aviso discreto en lugar de perderlo en silencio (mismo patrón que Repaso).
- Cierre del módulo: SPEC y ficha de v1 en `COMPLETO 2026-11-12`; limpieza de los 6 worktrees `contenido/<area>` (ya mergeados) y sus ramas.

## 2026-11-11 — Nace campus-personal: entrevista, SPEC-0 sellado y montaje

### Added
- SPEC-0 (`docs/modulos/v1/SPEC.md`) sellado y READY: PWA estática en GitHub Pages, 6 áreas, repaso espaciado FSRS, simuladores, ejercicios, casos de guardia y fuentes verificadas.
- Investigaciones: `docs/modulos/v1/investigacion/unlam-planes.md` (planes UNLaM) y `docs/modulos/v1/investigacion/stack-verificado.md` (stack verificado hoy).
- Scaffolding Astro 7 (template minimal) y kit 3.0.0-rc.6 adoptado.
