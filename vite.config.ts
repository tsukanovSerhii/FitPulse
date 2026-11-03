/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { preloadFonts } from './build/preloadFontsPlugin.ts'
import { preloadRoutes } from './build/preloadRoutePlugin.ts'
import { serviceWorker } from './build/serviceWorkerPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serviceWorker(),
    preloadFonts(['oswald-cyrillic-wght', 'manrope-cyrillic-wght']),
    preloadRoutes({
      '/welcome': 'src/pages/landing/LandingPage.tsx',
      '/login': 'src/pages/login/LoginPage.tsx',
      '/register': 'src/pages/register/RegisterPage.tsx',
      '/privacy': 'src/pages/legal/PrivacyPage.tsx',
      '/terms': 'src/pages/legal/TermsPage.tsx',
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/shared/testing/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
