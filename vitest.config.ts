import { defineConfig } from 'vitest/config';

// Sin getViteConfig de Astro (no está probado con Astro 7): la lógica testeable vive en módulos puros.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
