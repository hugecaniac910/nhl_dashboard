import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/nhle-web': {
        target: 'https://api-web.nhle.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nhle-web/, '')
      },
      '/nhle-stats': {
        target: 'https://api.nhle.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nhle-stats/, '')
      }
    }
  }
})