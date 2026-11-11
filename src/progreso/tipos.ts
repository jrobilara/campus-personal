// Forma del catálogo que publica /catalogo.json y que consumen las islas y las métricas.
export interface CatalogoArea { id: string; nombre: string; orden: number; color: string; colorOscuro: string; exigeCasoDeGuardia: boolean }
export interface CatalogoTema { id: string; area: string; titulo: string; orden: number }
export interface CatalogoTarjeta { id: string; tema: string; area: string; frenteHtml: string; dorsoHtml: string }
export interface CatalogoPieza { id: string; tema: string; area: string }
export interface Catalogo {
  areas: CatalogoArea[];
  temas: CatalogoTema[];
  /** en orden: área, tema y posición en practica.yaml */
  tarjetas: CatalogoTarjeta[];
  ejercicios: CatalogoPieza[];
  casos: CatalogoPieza[];
}
