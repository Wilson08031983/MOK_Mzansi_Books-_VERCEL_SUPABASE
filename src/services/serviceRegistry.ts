import { localAuthService } from './localAuthService';
import mockEmailService from './mockEmailService';
import * as localStorageService from './localStorageService';
import * as pdfGenerationService from './pdfGenerationService';
import * as saLaborService from './saLaborService';
import * as barcodeScannerService from './barcodeScannerService';
import * as thermalPrinterService from './thermalPrinterService';

// Define service status interface
export interface ServiceStatus {
  initialized: boolean;
  error: string | null;
  name: string;
}

// Service status registry
const serviceStatus: Record<string, ServiceStatus> = {
  localAuth: { initialized: false, error: null, name: 'Local Authentication' },
  mockEmail: { initialized: false, error: null, name: 'Mock Email Service' },
  localStorage: { initialized: false, error: null, name: 'Local Storage Service' },
  pdfGeneration: { initialized: false, error: null, name: 'PDF Generation Service' },
  saLabor: { initialized: false, error: null, name: 'SA Labor Laws Service' },
  barcodeScanner: { initialized: false, error: null, name: 'Barcode Scanner Service' },
  thermalPrinter: { initialized: false, error: null, name: 'Thermal Printer Service' }
};

/**
 * Initialize all local services
 * @returns Promise that resolves when all services are initialized
 */
export const initializeServices = async (): Promise<boolean> => {
  try {
    console.log('Initializing local services...');
    
    // Initialize local auth service
    try {
      // Only initialize local auth in dev or when explicitly enabled
      if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOCAL_AUTH === 'true') {
        localAuthService.initializeLocalAuth();
        serviceStatus.localAuth.initialized = true;
        console.log('Local auth service initialized:', true);
      } else {
        console.log('Local auth service initialization skipped in production');
      }
    } catch (error) {
      serviceStatus.localAuth.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize local auth service:', error);
    }
    
    // Initialize mock email service
    try {
      const emailInitialized = mockEmailService.initialize();
      serviceStatus.mockEmail.initialized = emailInitialized;
      console.log('Mock email service initialized:', emailInitialized);
    } catch (error) {
      serviceStatus.mockEmail.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize mock email service:', error);
    }
    
    // Initialize local storage service
    try {
      const storageInitialized = localStorageService.initialize();
      serviceStatus.localStorage.initialized = storageInitialized;
      console.log('Local storage service initialized:', storageInitialized);
    } catch (error) {
      serviceStatus.localStorage.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize local storage service:', error);
    }
    
    // Initialize PDF generation service
    try {
      const pdfInitialized = pdfGenerationService.initialize();
      serviceStatus.pdfGeneration.initialized = pdfInitialized;
      console.log('PDF generation service initialized:', pdfInitialized);
    } catch (error) {
      serviceStatus.pdfGeneration.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize PDF generation service:', error);
    }
    
    // Initialize SA labor service
    try {
      const laborInitialized = saLaborService.initialize();
      serviceStatus.saLabor.initialized = laborInitialized;
      console.log('SA labor service initialized:', laborInitialized);
    } catch (error) {
      serviceStatus.saLabor.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize SA labor service:', error);
    }
    
    // Initialize barcode scanner service
    try {
      const barcodeInitialized = barcodeScannerService.initialize();
      serviceStatus.barcodeScanner.initialized = barcodeInitialized;
      console.log('Barcode scanner service initialized:', barcodeInitialized);
    } catch (error) {
      serviceStatus.barcodeScanner.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize barcode scanner service:', error);
    }
    
    // Initialize thermal printer service
    try {
      const printerInitialized = thermalPrinterService.initialize();
      serviceStatus.thermalPrinter.initialized = printerInitialized;
      console.log('Thermal printer service initialized:', printerInitialized);
    } catch (error) {
      serviceStatus.thermalPrinter.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize thermal printer service:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing services:', error);
    return false;
  }
};

/**
 * Get the status of all services
 * @returns Record of service statuses
 */
export const getServiceStatus = (): Record<string, ServiceStatus> => {
  return { ...serviceStatus };
};

/**
 * Check if all services are ready
 * @returns boolean indicating if all services are initialized
 */
export const areServicesReady = (): boolean => {
  return Object.values(serviceStatus).every(status => status.initialized);
};
