import { v4 as uuidv4 } from 'uuid';
import { auditService } from './auditService';

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

// Internal helper to safely dispatch browser events for inventory updates
const dispatchInventoryEvent = (detail: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail }));
    }
  } catch {}
};

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
  
  // Log audit entry
  try {
    auditService.logAudit({
      category: 'crud',
      action: 'Added Storage Location',
      page: 'Inventory',
      section: 'Storage Locations',
      entityType: 'storageLocation',
      entityId: newLocation.id,
      entityName: newLocation.name,
      changeType: 'create',
      newValues: newLocation,
      description: `Added new storage location: ${newLocation.name} (${newLocation.location})`,
      metadata: {
        location: newLocation.location,
        contact: newLocation.contactPerson,
        email: newLocation.email
      }
    });
  } catch (e) {
    console.error('Failed to log storage location creation:', e);
  }
  
  // Notify listeners that a new storage location was added
  dispatchInventoryEvent({ entity: 'storage', action: 'created', storage: newLocation });
  
  return newLocation;
};

/**
 * Updates an existing storage location
 */
export const updateStorageLocation = (id: string, locationData: Partial<Omit<StorageLocation, 'id' | 'createdAt'>>): StorageLocation | null => {
  const locations = getAllStorageLocations();
  const index = locations.findIndex(loc => loc.id === id);
  
  if (index === -1) return null;
  
  const oldLocation = { ...locations[index] };
  const updatedLocation = {
    ...oldLocation,
    ...locationData,
    updatedAt: new Date().toISOString()
  };
  
  locations[index] = updatedLocation;
  saveStorageLocations(locations);
  
  // Log audit entry
  try {
    const changes: Record<string, { old: any; new: any }> = {};
    
    // Track changed fields
    (Object.keys(locationData) as Array<keyof typeof locationData>).forEach(key => {
      if (JSON.stringify(oldLocation[key]) !== JSON.stringify(updatedLocation[key])) {
        changes[key] = {
          old: oldLocation[key],
          new: updatedLocation[key]
        };
      }
    });
    
    if (Object.keys(changes).length > 0) {
      auditService.logAudit({
        category: 'crud',
        action: 'Updated Storage Location',
        page: 'Inventory',
        section: 'Storage Locations',
        entityType: 'storageLocation',
        entityId: updatedLocation.id,
        entityName: updatedLocation.name,
        changeType: 'update',
        oldValues: oldLocation,
        newValues: updatedLocation,
        description: `Updated storage location: ${updatedLocation.name}`,
        metadata: {
          changes,
          location: updatedLocation.location,
          contact: updatedLocation.contactPerson
        }
      });
    }
  } catch (e) {
    console.error('Failed to log storage location update:', e);
  }
  
  // Notify listeners that a storage location was updated
  dispatchInventoryEvent({ entity: 'storage', action: 'updated', storage: updatedLocation });
  
  return updatedLocation;
};

/**
 * Deletes a storage location
 */
export const deleteStorageLocation = (id: string): boolean => {
  const locations = getAllStorageLocations();
  const locationToDelete = locations.find(loc => loc.id === id);
  
  if (!locationToDelete) {
    return false; // Nothing to delete
  }
  
  const filteredLocations = locations.filter(loc => loc.id !== id);
  saveStorageLocations(filteredLocations);
  
  // Log audit entry
  try {
    auditService.logAudit({
      category: 'crud',
      action: 'Deleted Storage Location',
      page: 'Inventory',
      section: 'Storage Locations',
      entityType: 'storageLocation',
      entityId: locationToDelete.id,
      entityName: locationToDelete.name,
      changeType: 'delete',
      oldValues: locationToDelete,
      description: `Deleted storage location: ${locationToDelete.name} (${locationToDelete.location})`,
      metadata: {
        location: locationToDelete.location,
        contact: locationToDelete.contactPerson,
        email: locationToDelete.email
      },
      severity: 'high' // Deletion is a high-severity action
    });
  } catch (e) {
    console.error('Failed to log storage location deletion:', e);
  }
  
  // Notify listeners that a storage location was deleted
  dispatchInventoryEvent({ entity: 'storage', action: 'deleted', storageId: id });
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
