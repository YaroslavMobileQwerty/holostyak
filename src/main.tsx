import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { queryClient } from './lib/queryClient'
import { ErrorBoundary } from '@/monitoring/ErrorBoundary'
import { SoundProvider } from '@/sound/SoundProvider'
import App from './App.tsx'
import './monitoring/sentry'
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/playfair-display/index.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import './index.css'

if (import.meta.env.PROD) {
  const s = document.createElement('script')
  s.defer = true
  s.dataset.domain = 'tote.holostyak.ua'
  s.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(s)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SoundProvider>
            <Toaster position="top-center" richColors />
            <App />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </SoundProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
