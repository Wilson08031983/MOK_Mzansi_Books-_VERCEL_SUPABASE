import { v4 as uuidv4 } from 'uuid';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  category: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

const SUPPLIERS_KEY = 'mokmzansibooks_suppliers';

/**
 * Gets all suppliers from localStorage
 */
export const getAllSuppliers = (): Supplier[] => {
  try {
    const storedSuppliers = localStorage.getItem(SUPPLIERS_KEY);
    if (!storedSuppliers) return [];
    return JSON.parse(storedSuppliers);
  } catch (error) {
    console.error('Error loading suppliers:', error);
    return [];
  }
};

/**
 * Saves all suppliers to localStorage
 */
const saveSuppliers = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
  } catch (error) {
    console.error('Error saving suppliers:', error);
  }
};

/**
 * Gets a supplier by ID
 */
export const getSupplierById = (id: string): Supplier | null => {
  const suppliers = getAllSuppliers();
  const supplier = suppliers.find(sup => sup.id === id);
  return supplier || null;
};

/**
 * Gets all supplier categories (unique)
 */
export const getAllSupplierCategories = (): string[] => {
  const suppliers = getAllSuppliers();
  const categories = suppliers.map(sup => sup.category);
  return Array.from(new Set(categories));
};

/**
 * Adds a new supplier
 */
export const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier => {
  const suppliers = getAllSuppliers();
  
  const newSupplier: Supplier = {
    ...supplierData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  suppliers.push(newSupplier);
  saveSuppliers(suppliers);
  
  return newSupplier;
};

/**
 * Updates an existing supplier
 */
export const updateSupplier = (id: string, supplierData: Partial<Omit<Supplier, 'id' | 'createdAt'>>): Supplier | null => {
  const suppliers = getAllSuppliers();
  const index = suppliers.findIndex(sup => sup.id === id);
  
  if (index === -1) return null;
  
  const updatedSupplier = {
    ...suppliers[index],
    ...supplierData,
    updatedAt: new Date().toISOString()
  };
  
  suppliers[index] = updatedSupplier;
  saveSuppliers(suppliers);
  
  return updatedSupplier;
};

/**
 * Deletes a supplier
 */
export const deleteSupplier = (id: string): boolean => {
  const suppliers = getAllSuppliers();
  const filteredSuppliers = suppliers.filter(sup => sup.id !== id);
  
  if (filteredSuppliers.length === suppliers.length) {
    return false; // Nothing was deleted
  }
  
  saveSuppliers(filteredSuppliers);
  return true;
};

/**
 * Get suppliers by category
 */
export const getSuppliersByCategory = (category: string): Supplier[] => {
  const suppliers = getAllSuppliers();
  return suppliers.filter(sup => sup.category === category);
};

// Initialize with sample data if empty
export const initializeSuppliers = (): void => {
  const suppliers = getAllSuppliers();
  if (suppliers.length === 0) {
    const sampleSuppliers: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'HP South Africa',
        contactPerson: 'Michael Brown',
        phoneNumber: '011 123 4567',
        email: 'sales@hpsa.co.za',
        category: 'Electronics',
        address: '123 Tech Park, Sandton, Gauteng 2196'
      },
      {
        name: 'Office Solutions Ltd',
        contactPerson: 'Thabo Mahlangu',
        phoneNumber: '012 456 7890',
        email: 'info@officesolutions.co.za',
        category: 'Furniture',
        address: '45 Business Avenue, Pretoria West, Gauteng 0183'
      },
      {
        name: 'MediClean SA',
        contactPerson: 'Linda Nkosi',
        phoneNumber: '010 765 4321',
        email: 'orders@mediclean.co.za',
        category: 'Health',
        address: '78 Sanitary Street, Germiston, Gauteng 1401'
      }
    ];
    
    sampleSuppliers.forEach(supplier => addSupplier(supplier));
  }
};
