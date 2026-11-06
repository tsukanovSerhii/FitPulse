/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// In Docker the admin API is another container; locally it listens on 3001
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true, host: true, proxy: { '/api': apiTarget } },
  preview: { port: 4174 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
})
