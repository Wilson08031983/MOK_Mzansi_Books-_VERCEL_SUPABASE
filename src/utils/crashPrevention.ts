import { safeExecute, safeGet, safeString } from './safeAccess';

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior (logging to console)
    event.preventDefault();
    
    // You can add custom error reporting here
    reportError('Unhandled Promise Rejection', event.reason);
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Report the error
    reportError('Global JavaScript Error', event.error);
  });

  // Handle React errors (if using React 18+)
  if (typeof window !== 'undefined' && 'reportError' in window) {
    const originalReportError = window.reportError;
    window.reportError = (error: any) => {
      console.error('React error reported:', error);
      reportError('React Error', error);
      return originalReportError.call(window, error);
    };
  }
};

/**
 * Error reporting function - can be extended to send to external services
 */
const reportError = (type: string, error: any) => {
  const errorInfo = {
    type,
    message: safeString(error?.message || error),
    stack: safeString(error?.stack),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console for development
  console.group(`🚨 ${type}`);
  console.error('Error Info:', errorInfo);
  console.groupEnd();

  // Store in localStorage for debugging (keep last 10 errors)
  safeExecute(() => {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.unshift(errorInfo);
    if (errors.length > 10) errors.pop();
    localStorage.setItem('app_errors', JSON.stringify(errors));
  });

  // TODO: Send to external error reporting service
  // Example: Sentry, LogRocket, etc.
};

/**
 * Safe component wrapper to prevent crashes
 */
export const withCrashPrevention = <T extends (...args: any[]) => any>(
  fn: T,
  fallback?: any
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.then === 'function') {
        return result.catch((error: any) => {
          console.error('Async function error:', error);
          reportError('Async Function Error', error);
          return fallback;
        });
      }
      
      return result;
    } catch (error) {
      console.error('Function execution error:', error);
      reportError('Function Execution Error', error);
      return fallback;
    }
  }) as T;
};

/**
 * Safe API call wrapper
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    reportError('API Call Error', error);
    return fallback;
  }
};

/**
 * Safe event handler wrapper
 */
export const safeEventHandler = <T extends Event>(
  handler: (event: T) => void
) => {
  return (event: T) => {
    safeExecute(() => handler(event));
  };
};

/**
 * Safe state updater for React
 */
export const safeStateUpdate = <T>(
  setter: (value: T | ((prev: T) => T)) => void,
  value: T | ((prev: T) => T)
) => {
  safeExecute(() => setter(value));
};

/**
 * Memory usage monitor
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };
    
    console.log('Memory usage:', usage);
    
    // Warn if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      console.warn('High memory usage detected:', usage);
      reportError('High Memory Usage', usage);
    }
    
    return usage;
  }
  return null;
};

/**
 * Performance monitor
 */
export const monitorPerformance = () => {
  if ('getEntriesByType' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: 0,
        firstContentfulPaint: 0
      };
      
      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = Math.round(entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = Math.round(entry.startTime);
        }
      });
      
      console.log('Performance metrics:', metrics);
      
      // Warn if performance is poor
      if (metrics.loadComplete > 3000) {
        console.warn('Slow page load detected:', metrics);
        reportError('Slow Page Load', metrics);
      }
      
      return metrics;
    }
  }
  return null;
};

/**
 * Get stored error logs for debugging
 */
export const getErrorLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('app_errors') || '[]');
  } catch {
    return [];
  }
};

/**
 * Clear error logs
 */
export const clearErrorLogs = () => {
  safeExecute(() => localStorage.removeItem('app_errors'));
};

export default {
  setupGlobalErrorHandlers,
  withCrashPrevention,
  safeApiCall,
  safeEventHandler,
  safeStateUpdate,
  monitorMemoryUsage,
  monitorPerformance,
  getErrorLogs,
  clearErrorLogs
};