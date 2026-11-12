# Handoff — campus-personal

> Foto de dónde quedamos. `/cierre` lo SOBREESCRIBE ENTERO: acá no se apila historia (eso es el CHANGELOG). Tope 5.000 bytes, secciones fijas y en este orden. Si no entra: el detalle va al CHANGELOG, las trampas a `referencia/trampas.md` y los pendientes al TODO.

## Estado
- Rama · entorno: main · local; el sitio está publicado en GitHub Pages (`https://jrobilara.github.io/campus-personal/`)
- Accesos temporales a producción: ninguno
- Producción: v1 TERMINADA y publicada (módulo `COMPLETO 2026-11-12`). 24 temas en 6 áreas, verificados. Chequeo completo verde: astro check 0 errores, 381 unit, 174 e2e. Probado en vivo: portada, temas, "varianza", offline y export/import.

## Próximo paso
Próxima sesión: construir con el Arquitecto (Modo B, spec delta sellado) la skill del repo para crear/actualizar módulos con la metodología v1, basada en docs/referencia/GUIA-DEL-PROYECTO.md (sección 'Hacia una skill de módulos'). Probarla de punta a punta sumando temas o contenido nuevo a un área existente.

Dónde empezar a leer, en este orden: 1) `docs/referencia/GUIA-DEL-PROYECTO.md` (todo el proyecto y el procedimiento P0-P8; sección 7 = insumo de la skill); 2) `docs/TODO.md` (ítems v2, incluida la skill); 3) `docs/modulos/v1/README.md` (ficha, manual del módulo cerrado).

## Bloqueos
- ninguno

## Te espera
- Decidir el precache del HTML: pasarlo a runtime caching bajaría a la mitad la primera instalación del service worker, pero se pierde el offline de los temas no visitados (está en el TODO).
- Vetar o ajustar la lista de temas de v1 (SPEC-0, "Temas de v1"), sigue abierto en el TODO.

## En curso
- nada: v1 cerrada. El SPEC de v1 quedó `COMPLETO`; `ready --pendientes` no lista nada.

## Contexto
- Metodología: director que no construye, Opus medio planifica y Sonnet alto ejecuta; el verificador es siempre distinto del autor; cero hallazgos abiertos para dar un tema por terminado.
- Repo público `jrobilara/campus-personal`; `gh` autenticado con `repo` y `workflow`. Push a `main` despliega solo.
- Un proceso pesado por vez (build y Playwright juntos dan exit 137). Node 24 con nvm.
- Trampas del stack: `docs/modulos/v1/investigacion/stack-verificado.md` y `docs/referencia/trampas.md`.
