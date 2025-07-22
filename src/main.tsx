
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeLocalAuth } from '@/services/localAuthService'

// Basic error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason)
})

// Initialize authentication
try {
  console.log('Initializing local authentication...')
  initializeLocalAuth()
} catch (error) {
  console.error('Auth initialization error:', error)
}

// Mount application
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found')
  document.body.innerHTML = '<div style="padding:20px">Root element not found</div>'
} else {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <App />
  )
}
