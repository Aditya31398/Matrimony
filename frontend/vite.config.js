import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import iconSubset from './scripts/iconSubset.js'

export default defineConfig({
  plugins: [react(), iconSubset()],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: app deploys don't force re-downloading libraries
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'axios'],
          motion: ['framer-motion'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
