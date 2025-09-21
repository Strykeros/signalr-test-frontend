import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
      server: {
    https: {
      key: fs.readFileSync('C:\\Windows\\System32\\localhost-key.pem'),
      cert: fs.readFileSync('C:\\Windows\\System32\\localhost.pem'),
    },
    host: 'localhost',
    port: 5173,
  },
})
