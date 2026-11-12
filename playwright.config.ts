import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL permite apuntar a un servidor ya levantado (por ejemplo `astro dev` en otro puerto) y no arrancar el build.
const externo = process.env.E2E_BASE_URL;
const base = externo ?? 'http://localhost:4321/campus-personal/';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: { baseURL: base, trace: 'retain-on-failure', locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externo
    ? undefined
    : {
        command: 'CAMPUS_INCLUIR_EJEMPLO=1 npm run build && npx astro preview --port 4321 --ignore-lock',
        url: 'http://localhost:4321/campus-personal/',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
