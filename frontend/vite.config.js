import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'localhost',
      '3430-60-48-36-110.ngrok-free.app'
    ],
  }
})