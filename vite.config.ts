import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'node:path'

const plugins = [react(), tailwindcss()]

if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  plugins.push(
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  )
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), '')
    const missingVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter(
      (name) => !env[name],
    )

    if (missingVars.length > 0) {
      throw new Error(
        `[build-config] Missing required env vars for production build: ${missingVars.join(', ')}. ` +
          'Set them in Cloudflare Pages -> Settings -> Environment variables (Production and Preview).',
      )
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')
            ) {
              return 'react-vendor'
            }
            if (id.includes('node_modules/@supabase')) return 'supabase'
            if (id.includes('node_modules/@tanstack/react-query')) return 'query'
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/gsap'))
              return 'motion'
          },
        },
      },
    },
  }
})
