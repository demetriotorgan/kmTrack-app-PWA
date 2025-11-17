import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png'
      ],

      manifest: {
        name: 'App Offline React',
        short_name: 'AppOffline',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#007bff',
        icons: [
          // Ícones removidos para evitar warnings (adicione depois se quiser)
        ]
      },

      devOptions: {
        enabled: true, // permite testar o PWA em modo dev
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          // ==============================
          // 1) ROTAS DO REACT (OK)
          // ==============================
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          // ==============================
          // 2) ASSETS (OK)
          // ==============================
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          // ==============================
          // 3) GOOGLE FONTS (OK)
          // ==============================
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },

          // ==========================================
          // 4) SUA API → NADA CACHEADO / NetworkOnly
          // ==========================================
          // GET /listar-viagens
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/listar-viagens'),
            handler: 'NetworkOnly',
            method: 'GET',
            options: {
              cacheName: 'api-read-network-only'
            },
          },

          // POST /salvar-viagem
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/salvar-viagem'),
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              cacheName: 'api-write-network-only'
            },
          },

          // PUT /editar-viagem
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/editar-viagem'),
            handler: 'NetworkOnly',
            method: 'PUT',
            options: {
              cacheName: 'api-write-network-only'
            },
          },
        ],
      },
    }),
  ],

  build: {
    outDir: 'dist',
  },

  server: {
    historyApiFallback: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173
    }
  }
})
