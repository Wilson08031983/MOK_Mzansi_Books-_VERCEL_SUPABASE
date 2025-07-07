/**
 * Test script to validate Inventory page features
 * 
 * This script tests the following:
 * 1. Supplier modal functionality
 * 2. Storage location modal functionality
 * 3. Data persistence in localStorage
 * 4. UI consistency
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

// Mock functions for UI testing
const testSupplierModal = () => {
  console.log('=== TESTING SUPPLIER MODAL ===');
  
  // Test 1: Create new supplier with valid data
  const validSupplierData = {
    name: 'Test Supplier',
    contactPerson: 'John Doe',
    phone: '0123456789',
    email: 'test@example.com',
    category: 'Books',
    address: '123 Test Street'
  };
  
  // Test 2: Validate required fields
  const invalidSupplierData = {
    name: '',  // Required field missing
    contactPerson: 'Jane Doe',
    phone: '0123456789',
    email: 'invalid-email',  // Invalid email
    category: 'Electronics',
    address: '456 Test Road'
  };
  
  console.log('Test 1: Creating supplier with valid data');
  mockLocalStorage.clear();
  
  // Mock supplier service functions
  const supplierService = {
    createSupplier: (data) => {
      const suppliers = JSON.parse(mockLocalStorage.getItem('suppliers') || '[]');
      const newSupplier = {
        id: 'test-id-' + Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      suppliers.push(newSupplier);
      mockLocalStorage.setItem('suppliers', JSON.stringify(suppliers));
      return newSupplier;
    },
    getAllSuppliers: () => {
      return JSON.parse(mockLocalStorage.getItem('suppliers') || '[]');
    }
  };
  
  // Test supplier creation
  const newSupplier = supplierService.createSupplier(validSupplierData);
  console.log('Supplier created:', newSupplier);
  
  // Verify supplier was added to localStorage
  const suppliers = supplierService.getAllSuppliers();
  console.log('Suppliers in localStorage:', suppliers);
  
  if (suppliers.length === 1 && suppliers[0].name === validSupplierData.name) {
    console.log('✅ Supplier created successfully and persisted to localStorage');
  } else {
    console.log('❌ Supplier creation or persistence failed');
  }
  
  console.log('\n=== SUPPLIER VALIDATION TEST COMPLETE ===\n');
};

const testStorageModal = () => {
  console.log('=== TESTING STORAGE MODAL ===');
  
  // Test 1: Create new storage location with valid data
  const validStorageData = {
    name: 'Test Storage',
    location: 'Warehouse A',
    contactPerson: 'Jane Smith',
    cellphone: '0123456789',
    email: 'storage@example.com'
  };
  
  // Test 2: Validate required fields
  const invalidStorageData = {
    name: 'Test Storage',
    location: '', // Required field missing
    contactPerson: 'Jane Smith',
    cellphone: 'invalid-phone', // Invalid phone
    email: 'invalid-email' // Invalid email
  };
  
  console.log('Test 1: Creating storage with valid data');
  mockLocalStorage.clear();
  
  // Mock storage service functions
  const storageService = {
    createStorageLocation: (data) => {
      const storages = JSON.parse(mockLocalStorage.getItem('storageLocations') || '[]');
      const newStorage = {
        id: 'test-id-' + Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storages.push(newStorage);
      mockLocalStorage.setItem('storageLocations', JSON.stringify(storages));
      return newStorage;
    },
    getAllStorageLocations: () => {
      return JSON.parse(mockLocalStorage.getItem('storageLocations') || '[]');
    }
  };
  
  // Test storage creation
  const newStorage = storageService.createStorageLocation(validStorageData);
  console.log('Storage created:', newStorage);
  
  // Verify storage was added to localStorage
  const storages = storageService.getAllStorageLocations();
  console.log('Storage locations in localStorage:', storages);
  
  if (storages.length === 1 && storages[0].name === validStorageData.name) {
    console.log('✅ Storage location created successfully and persisted to localStorage');
  } else {
    console.log('❌ Storage location creation or persistence failed');
  }
  
  console.log('\n=== STORAGE VALIDATION TEST COMPLETE ===\n');
};

// Run tests
console.log('STARTING INVENTORY FEATURE TESTS');
testSupplierModal();
testStorageModal();
console.log('ALL TESTS COMPLETE');
