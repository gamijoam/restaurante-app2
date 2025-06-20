import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  // --- AÑADIMOS ESTA NUEVA SECCIÓN ---
  // Esto soluciona el error 'global is not defined' de sockjs-client
  define: {
    global: {},
  }
})