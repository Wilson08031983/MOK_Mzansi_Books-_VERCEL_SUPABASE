/**
 * Barcode Scanner Service
 * 
 * This service provides functionality for scanning barcodes using
 * the device camera or external barcode scanner hardware.
 * Based on the Html5Qrcode library.
 */

import { auditService } from './auditService';

// Types for barcode scanner
export interface ScannerConfig {
  fps: number;
  qrbox: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

export interface ScanResult {
  code: string;
  format: string;
  timestamp: Date;
}

// Store for scanned codes
const scannedCodes: ScanResult[] = [];

// Initialize the barcode scanner service
export const initialize = (): boolean => {
  try {
    // Check if we're in a browser environment with camera access
    const hasMediaDevices = typeof navigator !== 'undefined' && 
      navigator.mediaDevices && 
      typeof navigator.mediaDevices.getUserMedia === 'function';
    
    if (!hasMediaDevices) {
      console.warn('Barcode scanner service initialized with limited functionality (no camera access)');
      return true; // Still return true as the service can work with manual input
    }
    
    console.log('Barcode scanner service initialized with camera access');
    return true;
  } catch (error) {
    console.error('Error initializing barcode scanner service:', error);
    return false;
  }
};

/**
 * Get default scanner configuration
 * @returns Default scanner configuration
 */
export const getDefaultConfig = (): ScannerConfig => {
  return {
    fps: 10,
    qrbox: 250,
    aspectRatio: 1.0,
    disableFlip: false
  };
};

/**
 * Check if camera access is available
 * @returns Promise resolving to boolean indicating camera availability
 */
export const checkCameraAccess = async (): Promise<boolean> => {
  try {
    // Check if we're in a browser environment with camera access
    if (typeof navigator === 'undefined' || 
        !navigator.mediaDevices || 
        typeof navigator.mediaDevices.getUserMedia !== 'function') {
      return false;
    }
    
    // Try to access the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Stop all tracks to release the camera
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Camera access check failed:', error);
    return false;
  }
};

/**
 * Get available cameras
 * @returns Promise resolving to array of camera devices
 */
export const getAvailableCameras = async (): Promise<MediaDeviceInfo[]> => {
  try {
    // Check if we're in a browser environment with camera access
    if (typeof navigator === 'undefined' || 
        !navigator.mediaDevices || 
        typeof navigator.mediaDevices.enumerateDevices !== 'function') {
      return [];
    }
    
    // Get all media devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter for video input devices (cameras)
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error getting available cameras:', error);
    return [];
  }
};

/**
 * Play a beep sound for successful scan
 */
export const playBeepSound = (): void => {
  try {
    // Create an audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('AudioContext not supported, cannot play beep sound');
      return;
    }
    
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 1800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    
    // Stop after 100ms
    setTimeout(() => {
      oscillator.stop();
    }, 100);
  } catch (error) {
    console.error('Error playing beep sound:', error);
  }
};

/**
 * Add a scanned code to history
 * @param code The scanned barcode
 * @param format The barcode format
 */
export const addScannedCode = (code: string, format: string, context: string = 'inventory'): void => {
  const result: ScanResult = {
    code,
    format,
    timestamp: new Date()
  };
  
  scannedCodes.push(result);
  
  // Keep only the last 100 scans
  if (scannedCodes.length > 100) {
    scannedCodes.shift();
  }

  // Log the barcode scan to audit log
  try {
    auditService.logAudit({
      category: 'inventory',
      action: 'Barcode Scanned',
      page: 'Inventory',
      section: 'Barcode Scanner',
      entityType: 'barcode',
      entityId: code,
      changeType: 'read',
      description: `Scanned ${format} barcode: ${code}`,
      metadata: {
        format,
        context,
        timestamp: result.timestamp.toISOString()
      },
      severity: 'low'
    });
  } catch (e) {
    console.error('Failed to log barcode scan:', e);
  }
};

/**
 * Get scanned code history
 * @returns Array of scan results
 */
export const getScannedCodes = (): ScanResult[] => {
  return [...scannedCodes];
};

/**
 * Clear scanned code history
 */
export const clearScannedCodes = (): void => {
  scannedCodes.length = 0;
  console.log('Cleared scanned code history');
};

/**
 * Parse product information from barcode
 * @param code The scanned barcode
 * @returns Product information object or null if not found
 */
export const parseProductFromBarcode = (code: string): { id: string; name: string; price: number } | null => {
  // In a real implementation, this would look up the product in a database
  // For now, we'll simulate with some hardcoded values
  
  // Example format: MOK-{productId}-{checkDigit}
  if (code.startsWith('MOK-')) {
    const parts = code.split('-');
    if (parts.length === 3) {
      const productId = parts[1];
      
      // Simulate product lookup
      const products: Record<string, { name: string; price: number }> = {
        '1001': { name: 'Book: Business Management', price: 299.99 },
        '1002': { name: 'Book: Accounting Principles', price: 349.99 },
        '1003': { name: 'Book: Marketing Strategies', price: 249.99 },
        '1004': { name: 'Book: HR Management', price: 279.99 },
        '1005': { name: 'Book: Project Management', price: 329.99 },
        '2001': { name: 'Stationery: Notebook', price: 49.99 },
        '2002': { name: 'Stationery: Pen Set', price: 29.99 },
        '2003': { name: 'Stationery: Desk Organizer', price: 79.99 }
      };
      
      if (productId in products) {
        return {
          id: productId,
          name: products[productId].name,
          price: products[productId].price
        };
      }
    }
  }
  
  return null;
};
