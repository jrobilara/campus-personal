# v1 — campus-personal
- Estado: COMPLETO 2026-11-12
- director: no
- Próximo paso: v2: construir con el Arquitecto (Modo B, spec delta sellado) la skill del repo para crear/actualizar módulos, basada en docs/referencia/GUIA-DEL-PROYECTO.md; probarla sumando temas a un área existente

## Qué es
Primer módulo (SPEC-0) del campus personal de repaso: PWA estática con 6 áreas y unos 20 temas, con repaso espaciado, simuladores, ejercicios, casos de guardia y fuentes verificadas. Pedido del 2026-11-11.

## Fase y próximo paso
v1 terminado y publicado en https://jrobilara.github.io/campus-personal/ (F1 a F7 hechas, probado en vivo).

## Tareas
- [x] F1 Plan: esquema Zod, plantilla de tema, guía de estilo, plan de simuladores, formato del JSON de progreso
- [x] F2 App: esqueleto, componentes, panel, buscador, PWA, tema, tests, CI
- [x] F3 Contenido: 6 áreas × 3-4 temas
- [x] F4 Verificación: un informe por tema
- [x] F5 Correcciones
- [x] F6 Publicar: repo público, Pages, prueba en el sitio vivo
- [x] F7 Revisión de código y de UI

## Decisiones cerradas
- Sitio estático PWA en GitHub Pages, repo público (confirmado 2026-11-11). Sin login.
- Solo español. Sin cuentas ni multi-tenant.
- La sesión del Arquitecto dirige a los subagentes; Opus medio planifica, Sonnet alto ejecuta.

## Pendientes y "te espera"
- El dueño veta la lista de temas al volver (sigue abierto en `docs/TODO.md`).
