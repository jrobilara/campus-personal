// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import pagefind from 'astro-pagefind';
import { AstroPWAIntegration } from '@vite-pwa/astro'; // export NOMBRADO (trampa 3)
import { unified } from '@astrojs/markdown-remark'; // Astro 7 no trae remark por defecto (trampa 1)
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSinKatexError from './src/lib/rehype-sin-katex-error.mjs';
import rehypeKatexSinIndice from './src/lib/rehype-katex-sin-indice.mjs';

export default defineConfig({
  site: 'https://jrobilara.github.io',
  base: '/campus-personal',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    react(),
    pagefind(), // antes de la PWA: el índice tiene que existir al armar el precache
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Campus personal',
        short_name: 'Campus',
        lang: 'es',
        start_url: '/campus-personal/',
        scope: '/campus-personal/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icono.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      includeManifestIcons: false, // los íconos ya entran por globPatterns (svg y png): evita la entrada duplicada del precache
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      generateSW: {
        globPatterns: ['**/*.{html,js,css,svg,png,woff,woff2,json,wasm,pf_meta,pf_index,pf_fragment}'],
        navigateFallback: null,
      },
    }),
  ],
  // CAMPUS_VITE_CACHE: permite correr varios `astro dev` a la vez sin pisarse el caché de Vite (solo desarrollo).
  vite: { cacheDir: process.env.CAMPUS_VITE_CACHE || undefined },
  // Un LaTeX inválido rompe el build: rehype-katex solo deja un <span class="katex-error"> (ver rehype-sin-katex-error.mjs).
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex, rehypeSinKatexError, rehypeKatexSinIndice] }),
  },
});
