import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite acceso desde cualquier IP
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // IP correcta
        changeOrigin: true,
        secure: false,
        // Elimina el bloque configure
      }
    }
  },
  // --- AÑADIMOS ESTA NUEVA SECCIÓN ---
  // Esto soluciona el error 'global is not defined' de sockjs-client
  define: {
    global: {},
  }
})