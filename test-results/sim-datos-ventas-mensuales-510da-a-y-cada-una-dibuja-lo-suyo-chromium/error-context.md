# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sim-datos.spec.ts >> ventas-mensuales: cambia de vista y cada una dibuja lo suyo
- Location: e2e/sim-datos.spec.ts:121:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('figure.sim').filter({ hasText: /^\s*Ventas\s*Probá/ })

```

# Test source

```ts
  23  |   await expect(lectura(f, 'faltantes')).toHaveText('0');
  24  | });
  25  | 
  26  | test('tickets-sucios: corregir unidades sube la media y marcar outliers encuentra los 2 atípicos', async ({ page }) => {
  27  |   const f = fig(page, 'Tickets');
  28  |   await f.scrollIntoViewIfNeeded();
  29  |   const antes = await numero(f, 'media');
  30  |   await control(f, 'corregir-unidades').check();
  31  |   expect(await numero(f, 'media')).toBeGreaterThan(antes);
  32  |   await control(f, 'quitar-duplicados').check();
  33  |   await control(f, 'quitar-faltantes').check();
  34  |   await control(f, 'marcar-outliers').check();
  35  |   await expect(lectura(f, 'atipicos')).toHaveText('2');
  36  | });
  37  | 
  38  | test('tickets-sucios: las vistas tabla, histograma y caja cambian con los botones', async ({ page }) => {
  39  |   const f = fig(page, 'Tickets');
  40  |   await f.scrollIntoViewIfNeeded();
  41  |   await expect(f.locator('.sd-tabla')).toBeVisible();
  42  |   await expect(f.locator('.sd-tabla tbody tr')).toHaveCount(200);
  43  |   await expect(f.locator('.sd-tabla tr.sd-dup')).toHaveCount(8);
  44  |   await control(f, 'vista-histograma').click();
  45  |   await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  46  |   await expect(f.getByTestId('sd-fuera')).toContainText('2 valores');
  47  |   await control(f, 'vista-caja').click();
  48  |   await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  49  |   await expect(control(f, 'vista-caja')).toHaveAttribute('aria-pressed', 'true');
  50  | });
  51  | 
  52  | test('latencias: la media queda a la derecha de la mediana y con valores extremos sube más de 200 ms', async ({ page }) => {
  53  |   const f = fig(page, 'Latencias');
  54  |   await f.scrollIntoViewIfNeeded();
  55  |   await expect(lectura(f, 'filas')).toHaveText('500');
  56  |   const media = await numero(f, 'media');
  57  |   const mediana = await numero(f, 'mediana');
  58  |   expect(media).toBeGreaterThan(mediana);
  59  |   await control(f, 'extremos').check();
  60  |   await expect(lectura(f, 'filas')).toHaveText('505');
  61  |   expect((await numero(f, 'media')) - media).toBeGreaterThan(200);
  62  |   expect(Math.abs((await numero(f, 'mediana')) - mediana)).toBeLessThan(2);
  63  |   await expect(f.getByTestId('sd-fuera')).toBeVisible();
  64  | });
  65  | 
  66  | test('latencias: el slider de bins cambia la cantidad de barras', async ({ page }) => {
  67  |   const f = fig(page, 'Latencias');
  68  |   await f.scrollIntoViewIfNeeded();
  69  |   const barras = f.locator('[data-testid="sd-grafico"] [aria-label="rect"] rect');
  70  |   await expect(barras).toHaveCount(20);
  71  |   await control(f, 'bins').fill('35');
  72  |   await expect(barras).toHaveCount(35);
  73  |   await control(f, 'vista-caja').click();
  74  |   await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible();
  75  |   await expect(control(f, 'bins')).toHaveCount(0);
  76  | });
  77  | 
  78  | test('anscombe: los cuatro cuartetos dan r = 0,82 y pendiente 0,50', async ({ page }) => {
  79  |   const f = fig(page, 'Anscombe');
  80  |   await f.scrollIntoViewIfNeeded();
  81  |   for (const q of ['I', 'II', 'III', 'IV']) {
  82  |     await control(f, 'cuarteto').selectOption(q);
  83  |     await expect(lectura(f, 'r')).toHaveText('0,82');
  84  |     await expect(lectura(f, 'pendiente')).toHaveText('0,50');
  85  |     await expect(lectura(f, 'media')).toHaveText('7,50');
  86  |     await expect(lectura(f, 'filas')).toHaveText('11');
  87  |   }
  88  | });
  89  | 
  90  | test('anscombe: "ver los cuatro juntos" dibuja los 44 puntos en una grilla de 2 × 2', async ({ page }) => {
  91  |   const f = fig(page, 'Anscombe');
  92  |   await f.scrollIntoViewIfNeeded();
  93  |   await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(11);
  94  |   await control(f, 'cuatro').check();
  95  |   await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(44);
  96  | });
  97  | 
  98  | test('confusora-temperatura: r alto en conjunto y casi nulo dentro de cada franja de temperatura', async ({ page }) => {
  99  |   const f = fig(page, 'Confusora');
  100 |   await f.scrollIntoViewIfNeeded();
  101 |   expect(await numero(f, 'r')).toBeGreaterThan(0.8);
  102 |   await expect(lectura(f, 'r-frio')).toHaveCount(0);
  103 |   await control(f, 'colorear').check();
  104 |   for (const franja of ['frio', 'templado', 'calor']) {
  105 |     expect(Math.abs(await numero(f, `r-${franja}`))).toBeLessThan(0.2);
  106 |   }
  107 |   expect(await numero(f, 'r')).toBeGreaterThan(0.8);
  108 | });
  109 | 
  110 | test('horas-y-notas: agregar un outlier suma un alumno y baja la pendiente', async ({ page }) => {
  111 |   const f = fig(page, 'Horas y notas');
  112 |   await f.scrollIntoViewIfNeeded();
  113 |   await expect(lectura(f, 'filas')).toHaveText('60');
  114 |   const antes = await numero(f, 'pendiente');
  115 |   expect(antes).toBeGreaterThan(0.65);
  116 |   await control(f, 'outlier').check();
  117 |   await expect(lectura(f, 'filas')).toHaveText('61');
  118 |   expect(await numero(f, 'pendiente')).toBeLessThan(antes - 0.1);
  119 | });
  120 | 
  121 | test('ventas-mensuales: cambia de vista y cada una dibuja lo suyo', async ({ page }) => {
  122 |   const f = fig(page, 'Ventas');
> 123 |   await f.scrollIntoViewIfNeeded();
      |           ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 45000ms exceeded.
  124 |   await expect(lectura(f, 'filas')).toHaveText('72');
  125 |   await expect(f.locator('[data-testid="sd-grafico"] svg')).toBeVisible(); // barras
  126 |   await control(f, 'vista-torta').click();
  127 |   await expect(f.locator('.sd-torta-svg circle')).toHaveCount(3);
  128 |   await expect(f.locator('.sd-torta-ref li')).toHaveCount(3);
  129 |   await control(f, 'vista-lineas').click();
  130 |   await expect(f.locator('[data-testid="sd-grafico"] [aria-label="line"] path')).toHaveCount(3);
  131 |   await control(f, 'vista-dispersion').click();
  132 |   await expect(f.locator('[data-testid="sd-grafico"] [aria-label="dot"] circle')).toHaveCount(72);
  133 | });
  134 | 
  135 | test('veredictos: la vista activa muestra su etiqueta y el porqué', async ({ page }) => {
  136 |   const f = fig(page, 'Elegir el gráfico');
  137 |   await f.scrollIntoViewIfNeeded();
  138 |   await expect(f.getByTestId('sd-veredicto')).toContainText('Una torta no muestra');
  139 |   await expect(lectura(f, 'veredicto')).toHaveText('mal');
  140 |   await control(f, 'vista-lineas').click();
  141 |   await expect(lectura(f, 'veredicto')).toHaveText('bien');
  142 |   await expect(f.getByTestId('sd-veredicto')).toContainText('tendencia');
  143 | });
  144 | 
  145 | test('las lecturas son aria-live y usan coma decimal', async ({ page }) => {
  146 |   const f = fig(page, 'Latencias');
  147 |   await f.scrollIntoViewIfNeeded();
  148 |   await expect(f.locator('dl.sim-lecturas')).toHaveAttribute('aria-live', 'polite');
  149 |   expect(await lectura(f, 'media').innerText()).toMatch(/^\d+,\d{2}$/);
  150 | });
  151 | 
```