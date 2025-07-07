// Inventory Item Type Definitions

export interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  stockLevel: number;
  minimumStockLevel: number;
  price: number;
  costPrice: number;
  markup: number;
  category: string;
  expiryDate: string | null;
  receiveDate: string;
  supplier: string;
  batchNo: string;
  lastUpdated: string;
  location: string;
  status: string;
  notes?: string;
  image?: string;
}

export interface StockHistoryEntry {
  id: string;
  inventoryItemId: string;
  date: string;
  type: 'received' | 'sold' | 'damaged' | 'expired' | 'adjusted' | 'returned';
  quantity: number;
  notes: string;
  performedBy: string;
}

// Types of stock status
export const STOCK_STATUS = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  EXPIRED: 'Expired',
  DAMAGED: 'Damaged'
} as const;

export type StockStatus = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

// Stock categories
export const STOCK_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Health',
  'Stationery',
  'Food & Beverages',
  'Office Supplies',
  'Cleaning',
  'Hardware',
  'Tools',
  'Other'
] as const;

export type StockCategory = typeof STOCK_CATEGORIES[number];

// Helper functions to calculate stock status based on levels and dates
export const calculateStockStatus = (item: InventoryItem): StockStatus => {
  if (item.stockLevel <= 0) {
    return STOCK_STATUS.OUT_OF_STOCK;
  }
  
  if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
    return STOCK_STATUS.EXPIRED;
  }
  
  if (item.stockLevel <= item.minimumStockLevel) {
    return STOCK_STATUS.LOW_STOCK;
  }
  
  return STOCK_STATUS.IN_STOCK;
};
