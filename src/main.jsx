import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
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
