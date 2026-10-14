import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Aravalli Agri-Tech',
        short_name: 'AravalliFarm',
        description: 'AI-powered agri-tech and watershed intelligence for Southern Rajasthan',
        theme_color: '#1A6B2A',
        background_color: '#F9FAFB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 1800 } },
          },
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },

  build: {
    // Raise warning threshold to silence advisory (we're splitting anyway)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded first, cached longest
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Charting — Recharts + D3 deps (~220 kB raw)
          'vendor-charts': ['recharts'],

          // Mapping — Leaflet + react-leaflet (~170 kB raw)
          'vendor-map': ['leaflet', 'react-leaflet'],

          // Icons — lucide-react tree-shakes well but still worth isolating
          'vendor-icons': ['lucide-react'],

          // i18n context + hooks (tiny, but frequently updated)
          'app-core': [
            './src/context/LangContext.jsx',
            './src/context/CartContext.jsx',
            './src/hooks/useSpeech.js',
            './src/hooks/useApi.js',
          ],

          // Layout shell — header, nav, footer (stable, cache well)
          'app-layout': [
            './src/components/layout/TopBar.jsx',
            './src/components/layout/Header.jsx',
            './src/components/layout/MainNav.jsx',
            './src/components/layout/BottomTabs.jsx',
            './src/components/layout/Footer.jsx',
          ],
        },
      },
    },
  },
})
