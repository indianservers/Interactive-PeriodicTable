import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx?v=20260908-3'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// The installed app uses a cache-first worker. Local development gets a
// versioned registration so an older worker can update once, after which the
// worker bypasses caching for Vite traffic (see sw.js).
const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname)

if ('serviceWorker' in navigator && !isLocalDevelopment) {
  window.addEventListener('load', () => {
    let refreshing = false

    const notifyUpdate = registration => {
      const waitingWorker = registration.waiting
      if (!waitingWorker) return
      window.dispatchEvent(new CustomEvent('app-service-worker-update', {
        detail: {
          refresh: () => waitingWorker.postMessage({ type: 'SKIP_WAITING' }),
        },
      }))
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          notifyUpdate(registration)
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          if (!installingWorker) return
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate(registration)
            }
          })
        })
      })
      .catch(() => {})
  })
}
