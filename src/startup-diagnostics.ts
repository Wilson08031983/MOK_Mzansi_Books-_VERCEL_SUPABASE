/**
 * Startup Diagnostics Tool
 * 
 * This module provides functions to diagnose and potentially fix startup issues,
 * particularly focusing on the white screen problem.
 */

// Record key timestamps to measure initialization timing
const timestamps: Record<string, number> = {
  scriptStart: Date.now(),
};

/**
 * Log a timestamped checkpoint with error handling
 */
export const logCheckpoint = (name: string): void => {
  try {
    timestamps[name] = Date.now();
    const timeSinceStart = timestamps[name] - timestamps.scriptStart;
    console.log(`[${name}] ${timeSinceStart}ms since startup`);
  } catch (e) {
    // Fail silently but attempt to record the error
    try {
      console.error('Failed to log checkpoint:', e);
    } catch {}
  }
};

/**
 * Initialize the diagnostic script and check for previous errors
 */
export const initDiagnostics = (): void => {
  logCheckpoint('diagnostics_init');

  // Listen for key React errors
  window.addEventListener('error', (event) => {
    try {
      recordStartupError('global_error', event.error || event.message);
    } catch {}
  });

  // Check for cached errors
  const previousErrors = getStartupErrors();
  if (previousErrors && previousErrors.length > 0) {
    console.warn('Previous startup errors found:', previousErrors);
    
    // If errors have been occurring repeatedly, attempt recovery
    if (previousErrors.length >= 3) {
      attemptRecovery();
    }
  }
};

/**
 * Record a startup error for diagnostic purposes
 */
export const recordStartupError = (stage: string, error: any): void => {
  try {
    const errors = getStartupErrors();
    errors.push({
      timestamp: new Date().toISOString(),
      stage,
      message: error?.message || String(error),
      stack: error?.stack || '',
      url: window.location.href
    });
    
    // Keep only last 5 errors
    if (errors.length > 5) errors.shift();
    
    localStorage.setItem('mok_startup_errors', JSON.stringify(errors));
  } catch {}
};

/**
 * Get previously recorded startup errors
 */
export const getStartupErrors = (): Array<any> => {
  try {
    const errors = localStorage.getItem('mok_startup_errors');
    return errors ? JSON.parse(errors) : [];
  } catch {
    return [];
  }
};

/**
 * Attempt to recover from persistent startup issues
 */
export const attemptRecovery = (): void => {
  try {
    console.log('Attempting recovery from persistent startup issues');
    
    // Reset potential problematic settings
    const resetItems = [
      'mokResetErrorBoundary', 
      'app.settings.localization', 
      'mokAuthProvider'
    ];
    
    resetItems.forEach(key => {
      try {
        // Don't completely remove localization, just reset currency
        if (key === 'app.settings.localization') {
          try {
            const settings = JSON.parse(localStorage.getItem(key) || '{}');
            settings.currency = 'ZAR'; // Reset to default currency
            localStorage.setItem(key, JSON.stringify(settings));
          } catch {
            // If parsing fails, reset completely
            localStorage.setItem(key, '{"language":"en","dateFormat":"DD/MM/YYYY","timeFormat":"24h","timezone":"Africa/Johannesburg","currency":"ZAR","firstDayOfWeek":"Monday","numberFormat":"1,234.56","measurementUnits":"metric"}');
          }
        } else {
          localStorage.removeItem(key);
        }
      } catch {}
    });
    
    // Set flag to indicate recovery was attempted
    localStorage.setItem('mok_recovery_attempted', Date.now().toString());
    
    // Clear startup errors since we're attempting recovery
    localStorage.removeItem('mok_startup_errors');
    
    // Reload the page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch {}
};

/**
 * Check if application providers initialized successfully
 */
export const checkProviders = (): void => {
  logCheckpoint('checking_providers');
  
  // Check localization provider
  try {
    const localizationSettings = localStorage.getItem('app.settings.localization');
    if (!localizationSettings) {
      console.warn('Localization settings not found, may need initialization');
    }
  } catch {}
  
  // Check auth provider
  try {
    const authProvider = localStorage.getItem('mokAuthProvider');
    if (!authProvider) {
      console.warn('Auth provider not specified, will use default');
    }
  } catch {}
};

// Initialize diagnostics
initDiagnostics();
