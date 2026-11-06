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
    prerenderPublicPages({ siteUrl: (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://fit-pulse-beta-opal.vercel.app').replace(/\/$/, '') }),
  ],
  server: {
    // The API runs separately in development (docker compose or uvicorn); same-origin /api like in production
    proxy: { '/api': process.env.VITE_API_PROXY || 'http://localhost:8000' },
    watch: process.env.VITE_WATCH_POLLING ? { usePolling: true, interval: 300 } : undefined,
  },
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
