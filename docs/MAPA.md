# MAPA — campus-personal

> Cómo se conecta, en una pantalla (tope 5.000 bytes). La arquitectura a fondo va a `referencia/ARCHITECTURE.md`; acá se apunta.

## Por dentro

```mermaid
flowchart LR
  C[(src/content: áreas y temas en MDX, validados con Zod)] --> B[Build de Astro + Pagefind]
  B --> S[Sitio estático PWA en GitHub Pages]
  S --> N[(Navegador: progreso FSRS en IndexedDB)]
  N <--> J[Exportar/importar JSON]
```

## Con otras apps
Ninguna. No hay backend ni servicios externos; solo GitHub Pages sirve los archivos.
