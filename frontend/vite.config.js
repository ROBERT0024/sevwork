import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite para el frontend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Proxy para evitar problemas de CORS en desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
