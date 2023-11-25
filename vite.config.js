// vite.config.js
// vite.config.js
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 9'],
    }),
  ],
}
