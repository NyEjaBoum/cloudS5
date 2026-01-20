import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias pour résoudre les problèmes d'import Leaflet
      'leaflet/dist/leaflet.css': 'leaflet/dist/leaflet.css',
    }
  },
  css: {
    preprocessorOptions: {
      // Options CSS si nécessaire
    }
  }
})