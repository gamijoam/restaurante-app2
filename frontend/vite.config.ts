import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite acceso desde cualquier IP (IPv4 e IPv6)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // --- AÑADIMOS ESTA NUEVA SECCIÓN ---
  // Esto soluciona el error 'global is not defined' de sockjs-client
  define: {
    global: {},
  },
  // Configuración para manejar rutas SPA
  preview: {
    port: 5173,
    host: true
  }
})