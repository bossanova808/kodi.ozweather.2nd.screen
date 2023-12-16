// vite.config.js
import legacy from '@vitejs/plugin-legacy'

export default {
  // base: '/deploy.kodidash',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 9'],
    }),
  ],
}
