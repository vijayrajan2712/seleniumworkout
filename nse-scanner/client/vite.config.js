import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:4100',
      '/ws': {
        target: 'ws://localhost:4100',
        ws: true,
      },
    },
  },
})
