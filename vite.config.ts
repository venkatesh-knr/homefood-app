/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Local dev and most hosts serve from "/". GitHub Pages serves this repo from
// "/homefood-app/" instead, so the deploy workflow sets VITE_BASE_PATH — see
// .github/workflows/deploy.yml. react-router's basename and the invite-link
// builder in lib/people.ts both read import.meta.env.BASE_URL, which Vite
// derives from this automatically.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      workbox: {
        // The demo home's code and sample catalogue (~220 KB) are loaded only when someone opens the demo, so they are not pre-cached;
        // like the catalogue photos (public/dish-photos, ~7 MB in all) they are kept the first time they are used.
        globIgnores: ['**/catalogue-*.js', '**/demoData-*.js', '**/fakeClient-*.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/tour/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tour-photos', expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 180 } },
          },
          {
            urlPattern: ({ url }) => /\/assets\/(catalogue|demoData|fakeClient)-[^/]+\.js$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'demo-code', expiration: { maxEntries: 6 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/dish-photos/'),
            handler: 'CacheFirst',
            options: { cacheName: 'dish-photos', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
        ],
      },
      manifest: {
        name: 'HomeFood',
        short_name: 'HomeFood',
        description: "Plan your family's meals together",
        theme_color: '#E08A00',
        background_color: '#FFF8EE',
        display: 'standalone',
        id: base,
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
