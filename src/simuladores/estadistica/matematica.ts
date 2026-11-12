// Matemática de probabilidad para SimDistribucion y SimInferencia: módulo puro (sin React ni DOM).
// erf/cdf normal con error < 1e-12 (serie de términos positivos + fracción continua para la cola),
// funciones gamma/beta incompletas para la t de Student, pmf discretas y cuantiles por bisección.

const SQRT_PI = Math.sqrt(Math.PI);

/** erf(x): serie convergente de términos positivos (estable, sin cancelación) y saturada en |x| > 6. */
export function erf(x: number): number {
  if (Number.isNaN(x)) return NaN;
  const ax = Math.abs(x);
  if (ax > 6) return Math.sign(x);
  if (ax > 2.5) return Math.sign(x) * (1 - erfcCola(ax));
  let termino = ax;
  let suma = ax;
  for (let n = 1; n < 200; n++) {
    termino *= (2 * ax * ax) / (2 * n + 1);
    suma += termino;
    if (termino < suma * 1e-17) break;
  }
  return Math.sign(x) * ((2 / SQRT_PI) * Math.exp(-ax * ax) * suma);
}

/** erfc(x) para x ≥ 2 por fracción continua (precisa en la cola). */
function erfcCola(x: number): number {
  let t = x;
  for (let k = 120; k >= 1; k--) t = x + k / 2 / t;
  return Math.exp(-x * x) / SQRT_PI / t;
}

/** erfc(x) = 1 − erf(x), precisa también para x grande. */
export function erfc(x: number): number {
  if (x >= 2.5) return erfcCola(x);
  if (x <= -2.5) return 2 - erfcCola(-x);
  return 1 - erf(x);
}

/** Función de distribución de la normal N(mu, sigma). */
export function cdfNormal(x: number, mu = 0, sigma = 1): number {
  if (sigma <= 0) return x < mu ? 0 : 1;
  return 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2));
}
export function pdfNormal(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
/** Cuantil de la normal estándar (bisección sobre la cdf). */
export function cuantilNormal(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -40, hi = 40;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (cdfNormal(m) < p) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

const COEF_LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];
/** ln Γ(x) (Lanczos, x > 0). */
export function lnGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const z = x - 1;
  let a = 0.99999999999980993;
  const t = z + 7.5;
  for (let i = 0; i < 8; i++) a += COEF_LANCZOS[i]! / (z + i + 1);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

export function lnFactorial(n: number): number {
  return lnGamma(n + 1);
}

/** Probabilidad de la binomial P(X = k). */
export function pmfBinomial(n: number, p: number, k: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  const lnC = lnFactorial(n) - lnFactorial(k) - lnFactorial(n - k);
  return Math.exp(lnC + k * Math.log(p) + (n - k) * Math.log1p(-p));
}

/** Probabilidad de la Poisson P(X = k). */
export function pmfPoisson(lambda: number, k: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - lnFactorial(k));
}

/** Beta incompleta regularizada I_x(a, b) (fracción continua de Lentz). */
export function betaIncompleta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnFront = lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log1p(-x);
  const fc = (xx: number, aa: number, bb: number) => {
    const TINY = 1e-300;
    let c = 1, d = 1 - ((aa + bb) * xx) / (aa + 1);
    if (Math.abs(d) < TINY) d = TINY;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let num = (m * (bb - m) * xx) / ((aa + m2 - 1) * (aa + m2));
      d = 1 + num * d; if (Math.abs(d) < TINY) d = TINY;
      c = 1 + num / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d; h *= d * c;
      num = (-(aa + m) * (aa + bb + m) * xx) / ((aa + m2) * (aa + m2 + 1));
      d = 1 + num * d; if (Math.abs(d) < TINY) d = TINY;
      c = 1 + num / c; if (Math.abs(c) < TINY) c = TINY;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < 1e-15) break;
    }
    return h;
  };
  if (x < (a + 1) / (a + b + 2)) return (Math.exp(lnFront) * fc(x, a, b)) / a;
  return 1 - (Math.exp(lnFront) * fc(1 - x, b, a)) / b;
}

/** Función de distribución de la t de Student con `gl` grados de libertad. */
export function cdfT(t: number, gl: number): number {
  const x = gl / (gl + t * t);
  const cola = 0.5 * betaIncompleta(x, gl / 2, 0.5);
  return t > 0 ? 1 - cola : cola;
}

/** Cuantil de la t de Student (bisección). */
export function cuantilT(p: number, gl: number): number {
  if (p === 0.5) return 0;
  if (p < 0.5) return -cuantilT(1 - p, gl);
  let lo = 0, hi = 10;
  while (cdfT(hi, gl) < p && hi < 1e7) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (cdfT(m, gl) < p) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}
