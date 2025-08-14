/**
 * Service to clean up stuck toast notifications and replace them with proper status indicators
 * Specifically targets the "Syncing PAYE values from Accounting..." stuck spinner
 */

import { toast } from 'sonner';

class StuckToastCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isCleanupActive = false;

  /**
   * Initialize cleanup service to remove stuck PAYE sync toasts
   */
  initialize() {
    if (this.isCleanupActive) return;
    
    this.isCleanupActive = true;
    console.log('🧹 [StuckToastCleanup] Initializing cleanup service for stuck PAYE sync toasts');
    
    // Immediate cleanup
    this.performCleanup();
    
    // Set up periodic cleanup every 5 seconds
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5000);
  }

  /**
   * Stop the cleanup service
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isCleanupActive = false;
    console.log('🛑 [StuckToastCleanup] Cleanup service stopped');
  }

  /**
   * Perform cleanup of stuck toasts
   */
  private performCleanup() {
    try {
      // Dismiss any existing toasts that might be stuck
      toast.dismiss();
      
      // Clear any localStorage entries that might be causing stuck states
      const keysToCheck = [
        'toast_paye_sync',
        'accounting_sync_status',
        'hr_accounting_sync_loading'
      ];
      
      keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            // If it's a loading state older than 30 seconds, clear it
            if (data.status === 'loading' && data.timestamp) {
              const age = Date.now() - new Date(data.timestamp).getTime();
              if (age > 30000) { // 30 seconds
                localStorage.removeItem(key);
                console.log(`🧹 [StuckToastCleanup] Cleared stuck loading state: ${key}`);
              }
            }
          } catch (e) {
            // If it's not valid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      });
      
      // Check for DOM elements that might be stuck spinners
      this.cleanupStuckSpinners();
      
    } catch (error) {
      console.error('❌ [StuckToastCleanup] Error during cleanup:', error);
    }
  }

  /**
   * Clean up stuck spinner elements in the DOM
   */
  private cleanupStuckSpinners() {
    try {
      // Look for elements with text containing "Syncing PAYE"
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.textContent?.includes('Syncing PAYE values from Accounting')) {
          console.log('🧹 [StuckToastCleanup] Found stuck PAYE sync element, removing:', element);
          element.remove();
        }
      });
      
      // Look for toast containers with stuck content
      const toastContainers = document.querySelectorAll('[data-sonner-toaster]');
      toastContainers.forEach(container => {
        const toasts = container.querySelectorAll('[data-sonner-toast]');
        toasts.forEach(toast => {
          if (toast.textContent?.includes('Syncing PAYE') || 
              toast.textContent?.includes('Syncing') && toast.textContent?.includes('Accounting')) {
            console.log('🧹 [StuckToastCleanup] Removing stuck toast:', toast);
            toast.remove();
          }
        });
      });
      
    } catch (error) {
      console.error('❌ [StuckToastCleanup] Error cleaning up spinners:', error);
    }
  }

  /**
   * Force cleanup and show proper status
   */
  forceCleanupAndShowStatus() {
    console.log('🔧 [StuckToastCleanup] Force cleanup requested');
    
    // Dismiss all toasts
    toast.dismiss();
    
    // Perform cleanup
    this.performCleanup();
    
    // Show proper status message
    toast.success('PAYE/UIF sync cleaned up', {
      description: 'Use the "Refresh from HR" button to update values manually.',
      duration: 3000
    });
  }

  /**
   * Check if there are any stuck sync states
   */
  hasStuckSyncStates(): boolean {
    try {
      // Check localStorage for stuck states
      const stuckKeys = [
        'toast_paye_sync',
        'accounting_sync_status',
        'hr_accounting_sync_loading'
      ];
      
      for (const key of stuckKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            if (data.status === 'loading' || data.status === 'syncing') {
              return true;
            }
          } catch (e) {
            // Invalid JSON might indicate a stuck state
            return true;
          }
        }
      }
      
      // Check DOM for stuck elements
      const stuckElements = document.querySelectorAll('*');
      for (const element of stuckElements) {
        if (element.textContent?.includes('Syncing PAYE values from Accounting')) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ [StuckToastCleanup] Error checking stuck states:', error);
      return false;
    }
  }
}

export const stuckToastCleanupService = new StuckToastCleanupService();
