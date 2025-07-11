/**
 * Sales related type definitions
 */

export interface SalesItem {
  id: string;
  name: string;
  title?: string; // Some items might use title instead of name
  price: number;
  quantity: number;
  image?: string;
  barcode?: string;
  inventoryId?: string;
}
