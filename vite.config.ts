import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'FocusTrack - Study Tracker & Daily Planner',
          short_name: 'FocusTrack',
          description: 'Modern study tracker with Google Sign-In, Firestore cloud sync, dynamic folders, 5-time daily Salah tracker, and live stopwatch.',
          lang: 'en',
          dir: 'ltr',
          theme_color: '#0a0b10',
          background_color: '#0a0b10',
          display: 'standalone',
          orientation: 'portrait',
          categories: ['education', 'productivity'],
          prefer_related_applications: false,
          start_url: '/',
          scope: '/',
          shortcuts: [
            {
              name: 'Focus Timer',
              short_name: 'Timer',
              description: 'Open stopwatch & study focus dial',
              url: '/?shortcut=timer',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: '5-Time Salah',
              short_name: 'Salah',
              description: 'Log today prayer checklist & times',
              url: '/?shortcut=salah',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Study Folders',
              short_name: 'Folders',
              description: 'Browse subjects, chapters & tasks',
              url: '/?shortcut=folders',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
