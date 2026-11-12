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
        // .pagefind = los wasm del buscador y .pf_filter = su filtro por área: sin ellos el buscador no anda offline.
        // Sin .woff: todo navegador con service worker lee woff2 (KaTeX lo declara primero) y el .woff duplicaba ~300 KB.
        globPatterns: ['**/*.{html,js,css,svg,png,woff2,json,wasm,pagefind,pf_meta,pf_filter,pf_index,pf_fragment}'],
        // 404.html se precachearía como `404/`, una URL que en GitHub Pages responde 404: el precache falla y el service worker nunca se instala.
        // La interfaz lista de Pagefind no se usa (el buscador es propio): fuera del precache.
        globIgnores: ['404.html', 'pagefind/pagefind-*ui*.{js,css}', 'pagefind/pagefind-highlight.js'],
        // pagefind.js pide `pagefind-entry.json?ts=<reloj>` (anti-caché): sin ignorar `ts`, el precache no lo reconoce y sin red el buscador no arranca.
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^ts$/],
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
