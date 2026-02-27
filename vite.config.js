import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nhle-web': {
        target: 'https://api-web.nhle.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nhle-web/, '')
      },
      '/api/nhle-stats': {
        target: 'https://api.nhle.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nhle-stats/, '')
      }
    }
  }
})