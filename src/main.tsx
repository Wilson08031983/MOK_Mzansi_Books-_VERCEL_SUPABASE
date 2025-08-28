
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeLocalAuth } from '@/services/localAuthService'
import { ThemeProvider } from '@/components/theme-provider'
import { initFontSize } from '@/services/fontSizeService'
// Import startup diagnostics
import { logCheckpoint, checkProviders, recordStartupError } from './startup-diagnostics'

// Record that main.tsx is starting to execute
logCheckpoint('main_start')

// Enhanced error handlers with diagnostic recording
window.addEventListener('error', (event) => {
  if (event.error) {
    console.error('Global error:', event.error)
    recordStartupError('global_error', event.error)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    console.error('Unhandled rejection:', event.reason)
    recordStartupError('unhandled_rejection', event.reason)
  }
})

// Check if providers are properly initialized
checkProviders()

// Record before font size init
logCheckpoint('before_font_size_init')

// Initialize font size settings on app startup
try {
  initFontSize()
  logCheckpoint('font_size_initialized')
} catch (error) {
  console.error('Font size initialization error:', error)
  recordStartupError('font_size_init', error)
}

// Record before auth init
logCheckpoint('before_auth_init')

// Initialize authentication
try {
  console.log('[main.tsx] Script loaded. Initializing local authentication...')
  initializeLocalAuth()
  logCheckpoint('auth_initialized')
} catch (error) {
  console.error('Auth initialization error:', error)
  recordStartupError('auth_init', error)
}

// Mount application
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found')
  document.body.innerHTML = '<div style="padding:20px">Root element not found</div>'
} else {
  logCheckpoint('before_react_mount')
  
  // Add fallback UI in case of mounting issues
  const fallbackUI = document.createElement('div')
  fallbackUI.id = 'fallback-ui'
  fallbackUI.style.cssText = 'display:none; position:fixed; inset:0; background:white; z-index:9999; padding:20px; font-family:sans-serif;'
  fallbackUI.innerHTML = `
    <h2>Loading MOK Mzansi Books...</h2>
    <p>If this message persists for more than 10 seconds, please try:</p>
    <ul>
      <li><button id="retry-button">Retry Loading</button></li>
      <li><button id="reset-button">Reset Settings</button></li>
    </ul>
  `
  document.body.appendChild(fallbackUI)
  
  // Show fallback UI after timeout if app doesn't load
  const fallbackTimer = setTimeout(() => {
    fallbackUI.style.display = 'block'
    recordStartupError('fallback_displayed', 'App failed to load within timeout')
  }, 10000)
  
  // Add button event listeners
  document.getElementById('retry-button')?.addEventListener('click', () => {
    window.location.reload()
  })
  
  document.getElementById('reset-button')?.addEventListener('click', () => {
    // Reset key settings
    localStorage.setItem('app.settings.localization', JSON.stringify({
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      firstDayOfWeek: 'Monday',
      numberFormat: '1,234.56',
      measurementUnits: 'metric'
    }))
    localStorage.removeItem('mokAuthProvider')
    localStorage.setItem('mokResetErrorBoundary', 'true')
    window.location.reload()
  })
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('[main.tsx] Mounting React application...')
    logCheckpoint('react_mount_start')
    
    root.render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
      </ThemeProvider>
    )
    
    // Clear fallback UI timer and hide element since mount succeeded
    clearTimeout(fallbackTimer)
    fallbackUI.style.display = 'none'
    
    console.log('[main.tsx] React application mounted.')
    logCheckpoint('react_mount_complete')
    
    // Create a MutationObserver to detect if the app actually rendered content
    const observer = new MutationObserver((mutations) => {
      // If we detect content in the app-root div, clear the fallback
      const appRoot = document.querySelector('.app-root')
      if (appRoot && appRoot.children.length > 0) {
        clearTimeout(fallbackTimer)
        fallbackUI.style.display = 'none'
        observer.disconnect()
        logCheckpoint('content_detected')
      }
    })
    
    // Start observing app-root
    const appRoot = document.querySelector('.app-root')
    if (appRoot) {
      observer.observe(appRoot, { childList: true, subtree: true })
    }
  } catch (error) {
    console.error('Failed to mount React application:', error)
    recordStartupError('react_mount_failed', error)
    // Display fallback UI immediately
    clearTimeout(fallbackTimer)
    fallbackUI.style.display = 'block'
  }
}
