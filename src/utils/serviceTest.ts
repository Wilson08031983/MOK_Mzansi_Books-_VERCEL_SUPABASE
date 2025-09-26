/**
 * Service Test Utility
 * 
 * This utility provides functions to test the initialization and functionality
 * of all local services to ensure they are working correctly.
 */

import { initializeServices, getServiceStatus, areServicesReady } from '@/services/serviceRegistry';
import mockEmailService from '@/services/mockEmailService';
import * as localStorageService from '@/services/localStorageService';
import * as pdfGenerationService from '@/services/pdfGenerationService';
import * as barcodeScannerService from '@/services/barcodeScannerService';
import * as saLaborService from '@/services/saLaborService';
import * as thermalPrinterService from '@/services/thermalPrinterService';
import { formatClientForPdf } from '@/utils/clientUtils';
import { formatCompanyForPdf } from '@/utils/companyUtils';
import { calculateTotals, formatCurrency } from '@/utils/calculationUtils';

/**
 * Run a comprehensive test of all local services
 * @returns Promise resolving to a test report
 */
export const testAllServices = async (): Promise<{
  success: boolean;
  results: Record<string, { success: boolean; message: string }>;
}> => {
  console.log('🧪 Starting comprehensive service test...');
  
  const results: Record<string, { success: boolean; message: string }> = {};
  let overallSuccess = true;
  
  try {
    // Step 1: Initialize all services
    console.log('Step 1: Initializing all services...');
    await initializeServices();
    
    // Step 2: Check service status
    console.log('Step 2: Checking service status...');
    const status = getServiceStatus();
    const servicesReady = areServicesReady();
    
    results.initialization = {
      success: servicesReady,
      message: servicesReady 
        ? 'All required services initialized successfully' 
        : 'Some services failed to initialize'
    };
    
    if (!servicesReady) {
      overallSuccess = false;
      console.error('❌ Some services failed to initialize:', 
        Object.entries(status)
          .filter(([_, s]) => !s.initialized && s.error)
          .map(([name, s]) => `${name}: ${s.error}`)
          .join(', ')
      );
    }
    
    // Step 3: Test local storage service
    console.log('Step 3: Testing local storage service...');
    try {
      const testKey = 'serviceTest_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      const setOk = localStorageService.setItem(testKey, testValue);
      const retrieved = localStorageService.getItem<typeof testValue>(testKey, { test: false, timestamp: 0 });
      const removeOk = localStorageService.removeItem(testKey);
      
      const storageSuccess = setOk && removeOk && retrieved && retrieved.test === true;
      results.localStorage = {
        success: storageSuccess,
        message: storageSuccess 
          ? 'Local storage service working correctly' 
          : 'Local storage service failed'
      };
      
      if (!storageSuccess) overallSuccess = false;
    } catch (error) {
      results.localStorage = {
        success: false,
        message: `Local storage service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      overallSuccess = false;
    }
    
    // Step 4: Test mock email service
    console.log('Step 4: Testing mock email service...');
    try {
      const emailSuccess = await mockEmailService.sendInvitationEmail({
        to: 'test@example.com',
        inviterName: 'Service Test',
        email: 'test@example.com',
        role: 'test-user',
        invitationLink: 'https://test.example.com/invite'
      });
      
      const sentEmails = mockEmailService.getSentEmails();
      const emailsExist = sentEmails && sentEmails.length > 0;
      
      results.email = {
        success: emailSuccess && emailsExist,
        message: emailSuccess && emailsExist
          ? 'Mock email service working correctly'
          : 'Mock email service failed'
      };
      
      if (!emailSuccess || !emailsExist) overallSuccess = false;
    } catch (error) {
      results.email = {
        success: false,
        message: `Mock email service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      overallSuccess = false;
    }
    
    // Step 5: Test PDF generation service
    console.log('Step 5: Testing PDF generation service...');
    try {
      // Verify function availability
      const pdfSuccess = typeof pdfGenerationService.generateInvoicePdf === 'function' &&
                         typeof pdfGenerationService.generateQuotationPDF === 'function';
      
      results.pdf = {
        success: pdfSuccess,
        message: pdfSuccess
          ? 'PDF generation service functions available'
          : 'PDF generation service functions missing'
      };
      
      if (!pdfSuccess) overallSuccess = false;
    } catch (error) {
      results.pdf = {
        success: false,
        message: `PDF generation service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      overallSuccess = false;
    }
    
    // Step 6: Test SA Labor service
    console.log('Step 6: Testing SA Labor service...');
    try {
      const laborRegs = saLaborService.getDayShiftRegulations();
      const laborSuccess = !!laborRegs && 
                          typeof laborRegs.maxWeeklyHours === 'number' &&
                          typeof saLaborService.calculateOvertimePay === 'function';
      
      results.labor = {
        success: laborSuccess,
        message: laborSuccess
          ? 'SA Labor service functions available'
          : 'SA Labor service functions missing'
      };
      
      if (!laborSuccess) overallSuccess = false;
    } catch (error) {
      results.labor = {
        success: false,
        message: `SA Labor service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      overallSuccess = false;
    }
    
    // Step 7: Test utility functions
    console.log('Step 7: Testing utility functions...');
    try {
      // Test client utils
      const clientFormatSuccess = typeof formatClientForPdf === 'function';
      
      // Test company utils
      const companyFormatSuccess = typeof formatCompanyForPdf === 'function';
      
      // Test calculation utils
      const calcSuccess = typeof calculateTotals === 'function' && 
                         typeof formatCurrency === 'function' &&
                         typeof formatCurrency(1234.56) === 'string';
      
      const utilsSuccess = clientFormatSuccess && companyFormatSuccess && calcSuccess;
      
      results.utils = {
        success: utilsSuccess,
        message: utilsSuccess
          ? 'Utility functions working correctly'
          : 'Some utility functions failed'
      };
      
      if (!utilsSuccess) overallSuccess = false;
    } catch (error) {
      results.utils = {
        success: false,
        message: `Utility functions error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      overallSuccess = false;
    }
    
    console.log('🏁 Service test completed:', overallSuccess ? '✅ SUCCESS' : '❌ FAILED');
    return {
      success: overallSuccess,
      results
    };
    
  } catch (error) {
    console.error('❌ Service test failed with error:', error);
    return {
      success: false,
      results: {
        error: {
          success: false,
          message: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    };
  }
};

/**
 * Run the service test and log results to console
 */
export const runServiceTest = async (): Promise<void> => {
  const testResults = await testAllServices();
  
  console.log('==== SERVICE TEST RESULTS ====');
  console.log(`Overall: ${testResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  Object.entries(testResults.results).forEach(([service, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${service}: ${result.message}`);
  });
  
  console.log('=============================');
};

export default {
  testAllServices,
  runServiceTest
};
