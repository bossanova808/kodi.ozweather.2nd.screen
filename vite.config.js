// vite.config.js
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

export default {
  // base: '/deploy.kodidash',
    build: {
      manifest: true,
    },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 9'],
    }),
   VitePWA({
     registerType: 'autoUpdate',
     devOptions: {
        enabled: true
      },
      manifest: {
          // caches the assets/icons mentioned (assets/* includes all the assets present in your src/ directory)
            includeAssets: ["images/kodi.svg", "images/weather-icons/svg/*", "assets/*"],
            name: 'Kodi Dash',
            short_name: 'Kodi Dash',
            start_url: '/?fullscreen=true',
            background_color: '#000000',
            theme_color: '#000000',
            display: "fullscreen",
            icons: [
              {
                src: '/images/kodi.svg',
                sizes: 'any',
                type: 'image/svg'
              },
            ]
      },
      workbox: {
        // defining cached files formats
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      }
   }),
  ],
}
