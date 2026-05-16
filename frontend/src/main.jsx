import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import queryClient from './utils/queryClient'
import './i18n'
import './index.css'

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
