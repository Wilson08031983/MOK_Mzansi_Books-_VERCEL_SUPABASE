import { v4 as uuidv4 } from 'uuid';
import { InventoryItem, StockHistoryEntry, calculateStockStatus } from '@/types/inventory';
import { auditService } from '@/services/auditService';

const INVENTORY_STORAGE_KEY = 'inventoryItems';
const STOCK_HISTORY_STORAGE_KEY = 'stockHistory';

// Internal helper to safely dispatch browser events
const dispatchInventoryEvent = (detail: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail }));
    }
  } catch {}
};

// Get all inventory items from localStorage
export const getAllInventoryItems = (): InventoryItem[] => {
  const items = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!items) return [];
  return JSON.parse(items);
};

// Get a single inventory item by ID
export const getInventoryItemById = (id: string): InventoryItem | null => {
  const items = getAllInventoryItems();
  const item = items.find(item => item.id === id);
  return item || null;
};

// Get inventory item by barcode
export const getInventoryItemByBarcode = (barcode: string): InventoryItem | null => {
  const items = getAllInventoryItems();
  const item = items.find(item => item.barcode === barcode);
  return item || null;
};

// Save inventory items to localStorage
export const saveInventoryItems = (items: InventoryItem[]): void => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
};

// Add a new inventory item
export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>): InventoryItem => {
  const items = getAllInventoryItems();
  
  // Check if barcode already exists
  const existingItem = items.find(i => i.barcode === item.barcode);
  if (existingItem) {
    throw new Error('An item with this barcode already exists');
  }
  
  const newItem: InventoryItem = {
    ...item,
    id: `INV-${String(items.length + 1).padStart(3, '0')}`,
    lastUpdated: new Date().toISOString(),
    status: calculateStockStatus({
      ...item,
      id: '',
      lastUpdated: '',
      status: ''
    } as InventoryItem)
  };
  
  const updatedItems = [...items, newItem];
  saveInventoryItems(updatedItems);
  
  // Create history entry for new stock
  addStockHistoryEntry({
    inventoryItemId: newItem.id,
    date: newItem.receiveDate,
    type: 'received',
    quantity: newItem.stockLevel,
    notes: `Initial stock entry`,
    performedBy: 'Current User'
  });
  
  // Audit: inventory item created
  try {
    auditService.logCRUD(
      'Created Inventory Item',
      'inventoryItem',
      newItem.id,
      newItem.name,
      'Inventory',
      undefined,
      newItem
    );
  } catch (e) {
    console.error('Audit log failed for addInventoryItem:', e);
  }

  // Notify listeners
  dispatchInventoryEvent({ entity: 'item', action: 'created', item: newItem });
  if (newItem.status === 'Low Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'low-stock', item: newItem });
  }
  if (newItem.status === 'Out of Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'out-of-stock', item: newItem });
  }

  return newItem;
};

// Update an existing inventory item
export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem | null => {
  const items = getAllInventoryItems();
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return null;
  }
  
  // If stock level changed, create history entry
  const originalItem = items[itemIndex];
  if (updates.stockLevel !== undefined && updates.stockLevel !== originalItem.stockLevel) {
    const changeAmount = updates.stockLevel - originalItem.stockLevel;
    addStockHistoryEntry({
      inventoryItemId: id,
      date: new Date().toISOString(),
      type: changeAmount > 0 ? 'received' : 'adjusted',
      quantity: Math.abs(changeAmount),
      notes: updates.notes || `Stock level adjusted from ${originalItem.stockLevel} to ${updates.stockLevel}`,
      performedBy: 'Current User'
    });
    // Audit: stock level adjusted/received
    try {
      auditService.logAudit({
        category: 'crud',
        action: changeAmount > 0 ? 'Received Stock' : 'Adjusted Stock',
        page: 'Inventory',
        entityType: 'inventoryItem',
        entityId: id,
        entityName: originalItem.name,
        changeType: 'update',
        oldValues: { stockLevel: originalItem.stockLevel },
        newValues: { stockLevel: updates.stockLevel },
        description: `${changeAmount > 0 ? 'Received' : 'Adjusted'} ${Math.abs(changeAmount)} units for ${originalItem.name}`,
        metadata: { changeAmount }
      });
    } catch (e) {
      console.error('Audit log failed for stock adjustment in updateInventoryItem:', e);
    }
  }
  
  // Update the item
  const updatedItem = {
    ...items[itemIndex],
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  
  // Recalculate status based on new values
  updatedItem.status = calculateStockStatus(updatedItem);
  
  const updatedItems = [...items];
  updatedItems[itemIndex] = updatedItem;
  
  saveInventoryItems(updatedItems);
  
  // Audit: inventory item updated (general)
  try {
    auditService.logCRUD(
      'Updated Inventory Item',
      'inventoryItem',
      updatedItem.id,
      updatedItem.name,
      'Inventory',
      originalItem,
      updatedItem
    );
  } catch (e) {
    console.error('Audit log failed for updateInventoryItem:', e);
  }
  // Notify listeners about generic update
  dispatchInventoryEvent({ entity: 'item', action: 'updated', item: updatedItem });
  // Also notify when status crosses thresholds
  if (updatedItem.status === 'Low Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'low-stock', item: updatedItem });
  }
  if (updatedItem.status === 'Out of Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'out-of-stock', item: updatedItem });
  }
  return updatedItem;
};

// Delete an inventory item
export const deleteInventoryItem = (id: string): boolean => {
  const items = getAllInventoryItems();
  const toDelete = items.find(item => item.id === id) || null;
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length === items.length) {
    return false; // Item not found
  }
  
  saveInventoryItems(filteredItems);
  // Audit: inventory item deleted
  try {
    auditService.logCRUD(
      'Deleted Inventory Item',
      'inventoryItem',
      id,
      toDelete?.name || 'Unknown Item',
      'Inventory',
      toDelete || undefined,
      undefined
    );
  } catch (e) {
    console.error('Audit log failed for deleteInventoryItem:', e);
  }
  // Notify listeners
  dispatchInventoryEvent({ entity: 'item', action: 'deleted', itemId: id });
  return true;
};

// Mark inventory as damaged
export const markItemAsDamaged = (id: string, quantity: number, reason: string, notes: string, actionTaken: string = 'write-off', location: string = ''): InventoryItem | null => {
  const items = getAllInventoryItems();
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return null;
  }
  
  // Validation to prevent subtracting more than available
  if (quantity > item.stockLevel) {
    throw new Error('Cannot mark more than available stock as damaged.');
  }
  
  const updatedItem = { 
    ...item, 
    stockLevel: item.stockLevel - quantity,
    lastUpdated: new Date().toISOString()
  };
  
  // Update status based on remaining stock
  updatedItem.status = calculateStockStatus(updatedItem);
  
  // If all stock is damaged, mark item status as Damaged
  if (updatedItem.stockLevel === 0) {
    updatedItem.status = 'Damaged';
  }
  
  // Save the updated item to localStorage
  const updatedItems = getAllInventoryItems().map(i => 
    i.id === id ? updatedItem : i
  );
  saveInventoryItems(updatedItems);
  
  // Create history entry with detailed information
  addStockHistoryEntry({
    inventoryItemId: id,
    date: new Date().toISOString(),
    type: 'damaged',
    quantity,
    notes: `${reason}${notes ? `: ${notes}` : ''} (Action: ${actionTaken}, Location: ${location || 'Not specified'})`,
    performedBy: 'Current User'
  });
  
  // Audit: item marked as damaged
  try {
    auditService.logAudit({
      category: 'crud',
      action: 'Marked Item as Damaged',
      page: 'Inventory',
      entityType: 'inventoryItem',
      entityId: id,
      entityName: item.name,
      changeType: 'update',
      oldValues: { stockLevel: item.stockLevel },
      newValues: { stockLevel: updatedItem.stockLevel },
      description: `Marked ${quantity} units of ${item.name} as damaged. Reason: ${reason}.`,
      metadata: { quantity, reason, notes, actionTaken, location }
    });
  } catch (e) {
    console.error('Audit log failed for markItemAsDamaged:', e);
  }
  // Notify listeners
  dispatchInventoryEvent({ entity: 'item', action: 'damaged', item: updatedItem, quantity, reason });
  if (updatedItem.status === 'Low Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'low-stock', item: updatedItem });
  }
  if (updatedItem.status === 'Out of Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'out-of-stock', item: updatedItem });
  }
  
  return updatedItem;
};

// Mark inventory as expired
export const markItemAsExpired = (id: string, quantity: number, reason: string, notes: string, actionTaken: string = 'write-off', location: string = ''): InventoryItem | null => {
  const items = getAllInventoryItems();
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return null;
  }
  
  // Validation to prevent subtracting more than available
  if (quantity > item.stockLevel) {
    throw new Error('Cannot mark more than available stock as expired.');
  }
  
  const updatedItem = { 
    ...item, 
    stockLevel: item.stockLevel - quantity,
    lastUpdated: new Date().toISOString()
  };
  
  // Update status based on remaining stock
  updatedItem.status = calculateStockStatus(updatedItem);
  
  // If all stock is expired, mark item status as Expired
  if (updatedItem.stockLevel === 0) {
    updatedItem.status = 'Expired';
  }
  
  // Save the updated item to localStorage
  const updatedItems = getAllInventoryItems().map(i => 
    i.id === id ? updatedItem : i
  );
  saveInventoryItems(updatedItems);
  
  // Create history entry with detailed information
  addStockHistoryEntry({
    inventoryItemId: id,
    date: new Date().toISOString(),
    type: 'expired',
    quantity,
    notes: `${reason}${notes ? `: ${notes}` : ''} (Action: ${actionTaken}, Location: ${location || 'Not specified'})`,
    performedBy: 'Current User'
  });
  
  // Audit: item marked as expired
  try {
    auditService.logAudit({
      category: 'crud',
      action: 'Marked Item as Expired',
      page: 'Inventory',
      entityType: 'inventoryItem',
      entityId: id,
      entityName: item.name,
      changeType: 'update',
      oldValues: { stockLevel: item.stockLevel },
      newValues: { stockLevel: updatedItem.stockLevel },
      description: `Marked ${quantity} units of ${item.name} as expired. Reason: ${reason}.`,
      metadata: { quantity, reason, notes, actionTaken, location }
    });
  } catch (e) {
    console.error('Audit log failed for markItemAsExpired:', e);
  }
  // Notify listeners
  dispatchInventoryEvent({ entity: 'item', action: 'expired', item: updatedItem, quantity, reason });
  if (updatedItem.status === 'Low Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'low-stock', item: updatedItem });
  }
  if (updatedItem.status === 'Out of Stock') {
    dispatchInventoryEvent({ entity: 'item', action: 'out-of-stock', item: updatedItem });
  }
  
  return updatedItem;
};

// Stock History Functions
export const getAllStockHistory = (): StockHistoryEntry[] => {
  const history = localStorage.getItem(STOCK_HISTORY_STORAGE_KEY);
  if (!history) return [];
  return JSON.parse(history);
};

export const getItemStockHistory = (itemId: string): StockHistoryEntry[] => {
  const history = getAllStockHistory();
  return history.filter(entry => entry.inventoryItemId === itemId);
};

export const saveStockHistory = (history: StockHistoryEntry[]): void => {
  localStorage.setItem(STOCK_HISTORY_STORAGE_KEY, JSON.stringify(history));
};

export const addStockHistoryEntry = (entry: Omit<StockHistoryEntry, 'id'>): StockHistoryEntry => {
  const history = getAllStockHistory();
  
  const newEntry: StockHistoryEntry = {
    ...entry,
    id: uuidv4()
  };
  
  const updatedHistory = [...history, newEntry];
  saveStockHistory(updatedHistory);
  
  return newEntry;
};

// Populate initial sample inventory data if none exists
export const initializeInventoryData = (): void => {
  const existingItems = getAllInventoryItems();
  
  if (existingItems.length === 0) {
    const sampleItems: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>[] = [
      { 
        name: 'Laptop HP ProBook', 
        barcode: '8901234567890', 
        stockLevel: 12, 
        minimumStockLevel: 5,
        price: 10999.99,
        costPrice: 8500.00,
        markup: 29.41, 
        category: 'Electronics',
        expiryDate: null,
        receiveDate: '2025-05-30',
        batchNo: 'B001',
        supplier: 'HP South Africa',
        location: 'Warehouse A',
        notes: 'High-end business laptops with 16GB RAM'
      },
      { 
        name: 'Office Chair - Ergonomic', 
        barcode: '8901234567891', 
        stockLevel: 25, 
        minimumStockLevel: 10,
        price: 1899.99,
        costPrice: 1200.00,
        markup: 58.33, 
        category: 'Furniture',
        expiryDate: null,
        receiveDate: '2025-05-28',
        batchNo: 'B002',
        supplier: 'Office Solutions Ltd',
        location: 'Warehouse B',
        notes: 'Adjustable height with lumbar support'
      },
      { 
        name: 'Hand Sanitizer 500ml', 
        barcode: '8901234567892', 
        stockLevel: 130, 
        minimumStockLevel: 50,
        price: 89.99,
        costPrice: 45.00,
        markup: 100, 
        category: 'Health',
        expiryDate: '2026-04-15',
        receiveDate: '2025-06-01',
        batchNo: 'B003',
        supplier: 'MediClean SA',
        location: 'Warehouse A',
        notes: '70% alcohol content'
      },
      { 
        name: 'Premium Paper A4 (500 sheets)', 
        barcode: '8901234567893', 
        stockLevel: 45, 
        minimumStockLevel: 50,
        price: 149.99,
        costPrice: 90.00,
        markup: 66.66, 
        category: 'Stationery',
        expiryDate: null,
        receiveDate: '2025-05-20',
        batchNo: 'B004',
        supplier: 'Paper Corp',
        location: 'Warehouse A',
        notes: '80gsm premium white paper'
      },
      { 
        name: 'Milk 1L', 
        barcode: '8901234567894', 
        stockLevel: 52, 
        minimumStockLevel: 20,
        price: 24.99,
        costPrice: 18.00,
        markup: 38.83, 
        category: 'Food & Beverages',
        expiryDate: '2025-07-15',
        receiveDate: '2025-06-02',
        batchNo: 'B005',
        supplier: 'Fresh Farms',
        location: 'Store Room',
        notes: 'Long-life UHT milk'
      }
    ];
    
    sampleItems.forEach(item => {
      addInventoryItem(item);
    });
  }
};
