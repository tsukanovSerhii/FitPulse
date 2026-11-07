/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { preloadFonts } from './build/preloadFontsPlugin.ts'
import { preloadRoutes } from './build/preloadRoutePlugin.ts'
import { serviceWorker } from './build/serviceWorkerPlugin.ts'
import { prerenderPublicPages } from './build/prerenderPlugin.ts'

// Error reports name the build they come from
process.env.VITE_APP_VERSION ??= process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || new Date().toISOString().slice(0, 10)

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
    prerenderPublicPages({ siteUrl: (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://fitpulse-web-7fbg.onrender.com').replace(/\/$/, '') }),
  ],
  // The app API: another container in Docker, port 3000 locally
  server: { host: true, proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:3000' } },
  // e2e tests run against the production build with the real API behind the same proxy
  preview: { proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:3000' } },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/shared/testing/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
