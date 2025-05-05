import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Recomendado para debug em produção
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://furia-bot-zlix.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api no backend
      }
    }
  },
  preview: { // Configuração específica para 'vite preview'
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://furia-bot-zlix.vercel.app',
        changeOrigin: true
      }
    }
  }
})