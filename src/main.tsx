
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeLocalAuth } from '@/services/localAuthService'
import { ThemeProvider } from '@/components/theme-provider'

// Basic error handlers with null checks
window.addEventListener('error', (event) => {
  if (event.error) {
    console.error('Global error:', event.error)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    console.error('Unhandled rejection:', event.reason)
  }
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  )
}
