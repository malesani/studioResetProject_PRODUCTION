import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'] // Priorità a .tsx
  },
  server: {
    proxy: {
      '/auth/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/users/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/companies/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/customers/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/products/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/estimates/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/imports/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/projects/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
      '/pjPlanning/api': {
        target: 'http://localhost:4500',
        changeOrigin: true,
      },
    },
  },
})
