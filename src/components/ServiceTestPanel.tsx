import React, { useEffect, useState } from 'react';
import { initializeServices, getServiceStatus, areServicesReady } from '../services/serviceRegistry';
import mockEmailService from '../services/mockEmailService';
import * as localStorageService from '../services/localStorageService';
import * as pdfGenerationService from '../services/pdfGenerationService';
import * as saLaborService from '../services/saLaborService';
import * as barcodeScannerService from '../services/barcodeScannerService';
import * as thermalPrinterService from '../services/thermalPrinterService';
import { formatClientForPdf } from '../utils/clientUtils';
import { formatCompanyForPdf } from '../utils/companyUtils';
import { calculateTotals, formatCurrency } from '../utils/calculationUtils';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
}

const ServiceTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overallSuccess, setOverallSuccess] = useState<boolean | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    const testResults: TestResult[] = [];
    let allSuccess = true;

    try {
      // Step 1: Initialize all services
      testResults.push({ name: 'Initializing Services', success: true, message: 'Starting initialization...' });
      
      try {
        await initializeServices();
        const servicesReady = areServicesReady();
        const status = getServiceStatus();
        
        if (servicesReady) {
          testResults.push({ 
            name: 'Service Initialization', 
            success: true, 
            message: 'All required services initialized successfully' 
          });
        } else {
          const failedServices = Object.entries(status)
            .filter(([_, s]) => !s.initialized && s.error)
            .map(([name, s]) => `${name}: ${s.error}`)
            .join(', ');
          
          testResults.push({ 
            name: 'Service Initialization', 
            success: false, 
            message: `Some services failed to initialize: ${failedServices}` 
          });
          allSuccess = false;
        }
      } catch (error) {
        testResults.push({ 
          name: 'Service Initialization', 
          success: false, 
          message: `Error initializing services: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      // Step 2: Test local storage service
      try {
        const testKey = 'serviceTest_' + Date.now();
        const testValue = { test: true, timestamp: Date.now() };
        
        await localStorageService.setItem(testKey, testValue);
        const retrieved = await localStorageService.getItem(testKey);
        await localStorageService.removeItem(testKey);
        
        const storageSuccess = retrieved && retrieved.test === true;
        testResults.push({ 
          name: 'Local Storage Service', 
          success: storageSuccess, 
          message: storageSuccess 
            ? 'Local storage service working correctly' 
            : 'Local storage service failed' 
        });
        
        if (!storageSuccess) allSuccess = false;
      } catch (error) {
        testResults.push({ 
          name: 'Local Storage Service', 
          success: false, 
          message: `Local storage service error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      // Step 3: Test mock email service
      try {
        const emailSuccess = await mockEmailService.sendConfirmationEmail({
          to: 'test@example.com',
          subject: 'Service Test',
          html: '<p>This is a test email</p>'
        });
        
        const sentEmails = mockEmailService.getSentEmails();
        const emailsExist = sentEmails && sentEmails.length > 0;
        
        testResults.push({ 
          name: 'Mock Email Service', 
          success: emailSuccess && emailsExist, 
          message: emailSuccess && emailsExist
            ? 'Mock email service working correctly'
            : 'Mock email service failed' 
        });
        
        if (!emailSuccess || !emailsExist) allSuccess = false;
      } catch (error) {
        testResults.push({ 
          name: 'Mock Email Service', 
          success: false, 
          message: `Mock email service error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      // Step 4: Test PDF generation service
      try {
        // Just test the function existence and basic operation
        const pdfSuccess = typeof pdfGenerationService.generatePDF === 'function' &&
                           typeof pdfGenerationService.generateInvoicePDF === 'function';
        
        testResults.push({ 
          name: 'PDF Generation Service', 
          success: pdfSuccess, 
          message: pdfSuccess
            ? 'PDF generation service functions available'
            : 'PDF generation service functions missing' 
        });
        
        if (!pdfSuccess) allSuccess = false;
      } catch (error) {
        testResults.push({ 
          name: 'PDF Generation Service', 
          success: false, 
          message: `PDF generation service error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      // Step 5: Test SA Labor service
      try {
        const laborConstants = saLaborService.LABOR_CONSTANTS;
        const laborSuccess = laborConstants && 
                            typeof laborConstants.MAX_WEEKLY_HOURS === 'number' &&
                            typeof saLaborService.calculateOvertimeRate === 'function';
        
        testResults.push({ 
          name: 'SA Labor Service', 
          success: laborSuccess, 
          message: laborSuccess
            ? 'SA Labor service functions available'
            : 'SA Labor service functions missing' 
        });
        
        if (!laborSuccess) allSuccess = false;
      } catch (error) {
        testResults.push({ 
          name: 'SA Labor Service', 
          success: false, 
          message: `SA Labor service error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      // Step 6: Test utility functions
      try {
        // Test client utils
        const clientFormatSuccess = typeof formatClientForPdf === 'function';
        
        // Test company utils
        const companyFormatSuccess = typeof formatCompanyForPdf === 'function';
        
        // Test calculation utils
        const calcSuccess = typeof calculateTotals === 'function' && 
                           typeof formatCurrency === 'function' &&
                           formatCurrency(1234.56) === 'R 1 234,56';
        
        const utilsSuccess = clientFormatSuccess && companyFormatSuccess && calcSuccess;
        
        testResults.push({ 
          name: 'Utility Functions', 
          success: utilsSuccess, 
          message: utilsSuccess
            ? 'Utility functions working correctly'
            : 'Some utility functions failed' 
        });
        
        if (!utilsSuccess) allSuccess = false;
      } catch (error) {
        testResults.push({ 
          name: 'Utility Functions', 
          success: false, 
          message: `Utility functions error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
        allSuccess = false;
      }
      
      setOverallSuccess(allSuccess);
    } catch (error) {
      testResults.push({ 
        name: 'Overall Test', 
        success: false, 
        message: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setOverallSuccess(false);
    } finally {
      setResults(testResults);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Local Services Test Panel</h2>
          <p className="text-gray-600 mt-2">
            This panel tests the initialization and functionality of all local services.
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Test Results</h3>
              {overallSuccess !== null && (
                <p className={`mt-1 ${overallSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {overallSuccess ? '✅ All tests passed!' : '❌ Some tests failed'}
                </p>
              )}
            </div>
            <button
              onClick={runTests}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Running tests...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {result.success ? '✓' : '✗'}
                    </div>
                    <div className="ml-3">
                      <h4 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.name}
                      </h4>
                      <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceTestPanel;
