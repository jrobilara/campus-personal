# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sim-funcion.spec.ts >> descenso >> con pasos acumulados, los números de los pasos no se pisan entre sí
- Location: e2e/sim-funcion.spec.ts:88:3

# Error details

```
Error: Channel closed
```

```
Error: locator.scrollIntoViewIfNeeded: Target page, context or browser has been closed
Call log:
  - waiting for locator('figure.sim').filter({ has: locator('.sim-titulo').filter({ hasText: /^Tasa en la parábola$/ }) })
    - waiting for "http://127.0.0.1:4405/campus-personal/ejemplo/simuladores/" navigation to finish...
    - navigated to "http://127.0.0.1:4405/campus-personal/ejemplo/simuladores/"
    - locator resolved to visible <figure class="sim" data-testid="sim-funcion" data-simulador="SimFuncion" data-astro-source-loc="11:74" data-astro-source-file="/home/juan/Escritorio/Proyectos/campus-personal/src/components/mdx/SimMarco.astro">…</figure>

```

```
Error: browserContext._wrapApiCall: Target page, context or browser has been closed
```