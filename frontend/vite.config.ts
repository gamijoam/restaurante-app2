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
        timeout: 30000, // Timeout de 30 segundos
      }
    },
    // Optimizaciones para desarrollo
    hmr: {
      overlay: false, // Deshabilitar overlay de errores para mejor rendimiento
    },
    // Configuración para mejorar el rendimiento
    watch: {
      usePolling: false, // Usar eventos del sistema en lugar de polling
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
  },
  // Optimizaciones de build
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})