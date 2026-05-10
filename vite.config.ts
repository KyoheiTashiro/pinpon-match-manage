import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pinpon-match-manage/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['og-image.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: '卓ログ',
        short_name: '卓ログ',
        description: '卓球の対戦結果を管理',
        start_url: '/pinpon-match-manage/',
        scope: '/pinpon-match-manage/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1d4ed8',
        lang: 'ja',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
      devOptions: { enabled: true },
    }),
  ],
});
