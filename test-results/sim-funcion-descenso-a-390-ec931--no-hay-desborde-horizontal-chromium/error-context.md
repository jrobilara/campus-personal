# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sim-funcion.spec.ts >> descenso a 390 px >> ningún rótulo del gráfico queda cortado y no hay desborde horizontal
- Location: e2e/sim-funcion.spec.ts:108:3

# Error details

```
Error: Channel closed
```

```
Error: locator.scrollIntoViewIfNeeded: Target page, context or browser has been closed
Call log:
  - waiting for locator('figure.sim').filter({ has: locator('.sim-titulo').filter({ hasText: /^Descenso$/ }) })

```

```
Error: browserContext._wrapApiCall: Target page, context or browser has been closed
```