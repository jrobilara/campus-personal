// Modelo puro de SimDistribucion (SIMULADORES.md §2.3): momentos, probabilidades de intervalo, dominios y valores por defecto.
import { cdfNormal, pdfNormal, pmfBinomial, pmfPoisson } from '../estadistica/matematica';

export type Distribucion = 'binomial' | 'poisson' | 'normal' | 'exponencial' | 'uniforme';
export const DISTRIBUCIONES: Distribucion[] = ['binomial', 'poisson', 'normal', 'exponencial', 'uniforme'];
export const NOMBRE_DISTRIBUCION: Record<Distribucion, string> = {
  binomial: 'Binomial', poisson: 'Poisson', normal: 'Normal', exponencial: 'Exponencial', uniforme: 'Uniforme',
};

/** Parámetros de todas las distribuciones a la vez (λ se guarda aparte para Poisson y exponencial). */
export interface Par {
  n: number; p: number; lambdaPoisson: number; lambdaExp: number; mu: number; sigma: number; a: number; b: number;
}
/** Lo que llega por la prop `parametros`. */
export interface ParametrosProp {
  n?: number; p?: number; lambda?: number; mu?: number; sigma?: number; a?: number; b?: number;
}

export const POR_DEFECTO: Par = { n: 10, p: 0.5, lambdaPoisson: 4, lambdaExp: 1, mu: 0, sigma: 1, a: 0, b: 1 };

/** Parte de los valores por defecto; `lambda` se asigna a la distribución inicial. */
export function parametrosIniciales(dist: Distribucion, prop?: ParametrosProp): Par {
  const par = { ...POR_DEFECTO };
  if (!prop) return par;
  if (prop.n !== undefined) par.n = prop.n;
  if (prop.p !== undefined) par.p = prop.p;
  if (prop.mu !== undefined) par.mu = prop.mu;
  if (prop.sigma !== undefined) par.sigma = prop.sigma;
  if (prop.a !== undefined) par.a = prop.a;
  if (prop.b !== undefined) par.b = prop.b;
  if (prop.lambda !== undefined) {
    if (dist === 'exponencial') par.lambdaExp = prop.lambda; else par.lambdaPoisson = prop.lambda;
  }
  if (par.b <= par.a) par.b = par.a + 1;
  return par;
}

export const esDiscreta = (d: Distribucion) => d === 'binomial' || d === 'poisson';

export interface Momentos { media: number; varianza: number; desvio: number }

export function momentos(d: Distribucion, par: Par): Momentos {
  let media: number, varianza: number;
  switch (d) {
    case 'binomial': media = par.n * par.p; varianza = par.n * par.p * (1 - par.p); break;
    case 'poisson': media = par.lambdaPoisson; varianza = par.lambdaPoisson; break;
    case 'normal': media = par.mu; varianza = par.sigma * par.sigma; break;
    case 'exponencial': media = 1 / par.lambdaExp; varianza = 1 / (par.lambdaExp * par.lambdaExp); break;
    case 'uniforme': media = (par.a + par.b) / 2; varianza = ((par.b - par.a) ** 2) / 12; break;
  }
  return { media, varianza, desvio: Math.sqrt(varianza) };
}

/** Último valor del soporte que se dibuja para la Poisson (cola despreciable más allá). */
export function kMaxPoisson(lambda: number): number {
  return Math.ceil(lambda + 5 * Math.sqrt(lambda) + 5);
}

/** Valores enteros del soporte dibujado de una distribución discreta. */
export function soporteDiscreto(d: Distribucion, par: Par): number[] {
  const hasta = d === 'binomial' ? par.n : kMaxPoisson(par.lambdaPoisson);
  return Array.from({ length: hasta + 1 }, (_, k) => k);
}

export function pmf(d: Distribucion, par: Par, k: number): number {
  return d === 'binomial' ? pmfBinomial(par.n, par.p, k) : pmfPoisson(par.lambdaPoisson, k);
}

/** Densidad de las continuas. */
export function densidad(d: Distribucion, par: Par, x: number): number {
  switch (d) {
    case 'normal': return pdfNormal(x, par.mu, par.sigma);
    case 'exponencial': return x < 0 ? 0 : par.lambdaExp * Math.exp(-par.lambdaExp * x);
    case 'uniforme': return x >= par.a && x <= par.b ? 1 / (par.b - par.a) : 0;
    default: return 0;
  }
}

/** Función de distribución acumulada de las continuas. */
export function cdf(d: Distribucion, par: Par, x: number): number {
  switch (d) {
    case 'normal': return cdfNormal(x, par.mu, par.sigma);
    case 'exponencial': return x <= 0 ? 0 : 1 - Math.exp(-par.lambdaExp * x);
    case 'uniforme': return x <= par.a ? 0 : x >= par.b ? 1 : (x - par.a) / (par.b - par.a);
    default: return 0;
  }
}

/**
 * P(desde ≤ X ≤ hasta). Discretas: suma de la pmf entre desde y hasta, ambos incluidos.
 * Continuas: integral de la densidad con la cdf.
 */
export function probIntervalo(d: Distribucion, par: Par, desde: number, hasta: number): number {
  const lo = Math.min(desde, hasta), hi = Math.max(desde, hasta);
  if (esDiscreta(d)) {
    let s = 0;
    for (let k = Math.max(0, Math.ceil(lo - 1e-9)); k <= Math.floor(hi + 1e-9); k++) {
      if (d === 'binomial' && k > par.n) break;
      s += pmf(d, par, k);
    }
    return Math.min(1, s);
  }
  return Math.max(0, cdf(d, par, hi) - cdf(d, par, lo));
}

/** Aproximación normal con corrección por continuidad de P(desde ≤ X ≤ hasta) para las discretas. */
export function probIntervaloAproxNormal(d: Distribucion, par: Par, desde: number, hasta: number): number {
  const { media, desvio } = momentos(d, par);
  if (desvio < 1e-9) return desde <= media && media <= hasta ? 1 : 0;
  const lo = Math.min(desde, hasta), hi = Math.max(desde, hasta);
  return Math.max(0, cdfNormal(hi + 0.5, media, desvio) - cdfNormal(lo - 0.5, media, desvio));
}

/** Dominio del eje x: fijo para la normal (así se nota cómo se aplana al subir σ), escalado para el resto. */
export function dominio(d: Distribucion, par: Par): [number, number] {
  switch (d) {
    case 'binomial': return [-0.5, par.n + 0.5];
    case 'poisson': return [-0.5, kMaxPoisson(par.lambdaPoisson) + 0.5];
    case 'normal': {
      const mitad = Math.max(8, 2 * Math.ceil((Math.abs(par.mu) + 3.6 * par.sigma) / 2));
      return [-mitad, mitad];
    }
    case 'exponencial': return [0, 6 / par.lambdaExp];
    case 'uniforme': {
      const w = par.b - par.a;
      return [par.a - w * 0.5, par.b + w * 0.5];
    }
  }
}

/** Altura máxima del eje y. */
export function techoY(d: Distribucion, par: Par): number {
  switch (d) {
    case 'binomial': case 'poisson': {
      let m = 0;
      for (const k of soporteDiscreto(d, par)) m = Math.max(m, pmf(d, par, k));
      return Math.min(1, m * 1.18);
    }
    case 'normal': return Math.max(0.45, (0.3989423 / par.sigma) * 1.1);
    case 'exponencial': return par.lambdaExp * 1.12;
    case 'uniforme': return 1.25 / (par.b - par.a);
  }
}

/** Rango y paso de los sliders desde/hasta. */
export function rangoIntervalo(d: Distribucion, par: Par): { min: number; max: number; paso: number } {
  if (esDiscreta(d)) {
    const s = soporteDiscreto(d, par);
    return { min: 0, max: s[s.length - 1]!, paso: 1 };
  }
  const [min, max] = dominio(d, par);
  const ancho = max - min;
  const buenos = [1, 0.5, 0.25, 0.2, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.0025, 0.002, 0.001, 0.0005, 0.0002, 0.0001];
  const paso = buenos.find((p) => p <= ancho / 200) ?? 0.0001;
  return { min, max, paso };
}

const redondearA = (x: number, paso: number) => Math.round(x / paso) * paso;
const sinRuido = (x: number) => Number(x.toPrecision(12));

/** Intervalo inicial: media ± desvío, dentro del rango de los sliders. */
export function intervaloInicial(d: Distribucion, par: Par): [number, number] {
  const { media, desvio } = momentos(d, par);
  const { min, max, paso } = rangoIntervalo(d, par);
  const lim = (x: number) => sinRuido(Math.min(max, Math.max(min, redondearA(x, paso))));
  let desde = lim(media - desvio), hasta = lim(media + desvio);
  if (d === 'exponencial' || d === 'uniforme') desde = lim(Math.max(media - desvio, d === 'uniforme' ? par.a : 0));
  if (hasta <= desde) hasta = lim(desde + paso);
  return [desde, hasta];
}

export const sinRuidoNumerico = sinRuido;
