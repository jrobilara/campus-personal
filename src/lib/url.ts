// Une BASE_URL (que con trailingSlash:'always' ya termina en "/") con una ruta sin barra inicial.
// Prohibido concatenar BASE_URL a mano (trampa 8).
export function url(ruta = ''): string {
  const base = import.meta.env.BASE_URL;
  return (base.endsWith('/') ? base : base + '/') + ruta.replace(/^\/+/, '');
}
