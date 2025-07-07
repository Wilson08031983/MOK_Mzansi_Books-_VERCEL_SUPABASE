import { v4 as uuidv4 } from 'uuid';

export interface StorageLocation {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  cellphone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_LOCATIONS_KEY = 'mokmzansibooks_storage_locations';

/**
 * Gets all storage locations from localStorage
 */
export const getAllStorageLocations = (): StorageLocation[] => {
  try {
    const storedLocations = localStorage.getItem(STORAGE_LOCATIONS_KEY);
    if (!storedLocations) return [];
    return JSON.parse(storedLocations);
  } catch (error) {
    console.error('Error loading storage locations:', error);
    return [];
  }
};

/**
 * Saves all storage locations to localStorage
 */
const saveStorageLocations = (locations: StorageLocation[]): void => {
  try {
    localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (error) {
    console.error('Error saving storage locations:', error);
  }
};

/**
 * Gets a storage location by ID
 */
export const getStorageLocationById = (id: string): StorageLocation | null => {
  const locations = getAllStorageLocations();
  const location = locations.find(loc => loc.id === id);
  return location || null;
};

/**
 * Adds a new storage location
 */
export const addStorageLocation = (locationData: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>): StorageLocation => {
  const locations = getAllStorageLocations();
  
  const newLocation: StorageLocation = {
    ...locationData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  locations.push(newLocation);
  saveStorageLocations(locations);
  
  return newLocation;
};

/**
 * Updates an existing storage location
 */
export const updateStorageLocation = (id: string, locationData: Partial<Omit<StorageLocation, 'id' | 'createdAt'>>): StorageLocation | null => {
  const locations = getAllStorageLocations();
  const index = locations.findIndex(loc => loc.id === id);
  
  if (index === -1) return null;
  
  const updatedLocation = {
    ...locations[index],
    ...locationData,
    updatedAt: new Date().toISOString()
  };
  
  locations[index] = updatedLocation;
  saveStorageLocations(locations);
  
  return updatedLocation;
};

/**
 * Deletes a storage location
 */
export const deleteStorageLocation = (id: string): boolean => {
  const locations = getAllStorageLocations();
  const filteredLocations = locations.filter(loc => loc.id !== id);
  
  if (filteredLocations.length === locations.length) {
    return false; // Nothing was deleted
  }
  
  saveStorageLocations(filteredLocations);
  return true;
};

// Initialize with sample data if empty
export const initializeStorageLocations = (): void => {
  const locations = getAllStorageLocations();
  if (locations.length === 0) {
    const sampleLocations: Omit<StorageLocation, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Warehouse A',
        location: 'Pretoria Central',
        contactPerson: 'John Smith',
        cellphone: '071 123 4567',
        email: 'warehouseA@mokmzansibooks.com'
      },
      {
        name: 'Store Room',
        location: 'Atteridgeville Office',
        contactPerson: 'Sarah Johnson',
        cellphone: '082 345 6789',
        email: 'storeroom@mokmzansibooks.com'
      }
    ];
    
    sampleLocations.forEach(location => addStorageLocation(location));
  }
};
