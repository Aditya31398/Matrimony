import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import queryClient from './utils/queryClient'
import './i18n'
import './index.css'

// After a new deploy, an open tab still runs the old build and its page chunks no
// longer exist on the server — reload once to pick up the current version.
window.addEventListener('vite:preloadError', () => {
  const last = Number(sessionStorage.getItem('reloaded-for-update') || 0)
  if (Date.now() - last < 10_000) return   // don't loop if the file is genuinely missing
  sessionStorage.setItem('reloaded-for-update', String(Date.now()))
  window.location.reload()
})

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          {React.createElement(
            React.lazy(() =>
              import('@tanstack/react-query-devtools').then((m) => ({
                default: m.ReactQueryDevtools,
              }))
            ),
            { initialIsOpen: false }
          )}
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>
)
