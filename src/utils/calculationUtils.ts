/**
 * Calculation Utilities
 * 
 * This module provides utility functions for financial calculations,
 * including line item amounts, VAT, subtotals, and currency formatting.
 */

// Line item interface
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  markupPercent?: number;
  discount?: number;
}

/**
 * Calculate the amount for a line item
 * @param quantity The quantity
 * @param rate The rate (unit price)
 * @param markupPercent Optional markup percentage
 * @param discount Optional discount amount
 * @returns The calculated amount
 */
export const calculateLineItemAmount = (
  quantity: number,
  rate: number,
  markupPercent: number = 0,
  discount: number = 0
): number => {
  // Convert inputs to numbers and handle invalid values
  const qty = Number(quantity) || 0;
  const unitRate = Number(rate) || 0;
  const markup = Number(markupPercent) || 0;
  const disc = Number(discount) || 0;
  
  // Calculate gross amount with markup
  const rateWithMarkup = unitRate + (unitRate * markup / 100);
  const grossAmount = qty * rateWithMarkup;
  
  // Apply discount
  const finalAmount = grossAmount - disc;
  
  // Ensure we don't return negative amounts
  return Math.max(0, finalAmount);
};

/**
 * Calculate subtotal from line items
 * @param items Array of line items
 * @returns The calculated subtotal
 */
export const calculateSubtotal = (items: LineItem[]): number => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((sum, item) => {
    const amount = Number(item.amount) || 0;
    return sum + amount;
  }, 0);
};

/**
 * Calculate VAT amount
 * @param subtotal The subtotal amount
 * @param vatRate The VAT rate (percentage)
 * @returns The calculated VAT amount
 */
export const calculateVAT = (subtotal: number, vatRate: number = 15): number => {
  const rate = Number(vatRate) || 0;
  return subtotal * (rate / 100);
};

/**
 * Calculate grand total
 * @param subtotal The subtotal amount
 * @param vatAmount The VAT amount
 * @returns The calculated grand total
 */
export const calculateGrandTotal = (subtotal: number, vatAmount: number): number => {
  return subtotal + vatAmount;
};

/**
 * Format currency as ZAR
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  const num = Number(amount) || 0;
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Format currency without currency symbol
 * @param amount The amount to format
 * @returns Formatted number string
 */
export const formatNumber = (amount: number): string => {
  const num = Number(amount) || 0;
  
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Calculate totals for a collection of line items
 * @param items Array of line items
 * @param vatRate The VAT rate (percentage)
 * @returns Object with subtotal, vatAmount, and grandTotal
 */
export const calculateTotals = (
  items: LineItem[],
  vatRate: number = 15
): {
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
} => {
  const subtotal = calculateSubtotal(items);
  const vatAmount = calculateVAT(subtotal, vatRate);
  const grandTotal = calculateGrandTotal(subtotal, vatAmount);
  
  return {
    subtotal,
    vatAmount,
    grandTotal
  };
};

/**
 * Recalculate all line item amounts and totals
 * @param items Array of line items
 * @param vatRate The VAT rate (percentage)
 * @returns Object with updated items and totals
 */
export const recalculateAll = (
  items: LineItem[],
  vatRate: number = 15
): {
  items: LineItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
} => {
  if (!items || !Array.isArray(items)) {
    return {
      items: [],
      subtotal: 0,
      vatAmount: 0,
      grandTotal: 0
    };
  }
  
  // Recalculate each line item amount
  const updatedItems = items.map(item => ({
    ...item,
    amount: calculateLineItemAmount(
      item.quantity,
      item.rate,
      item.markupPercent,
      item.discount
    )
  }));
  
  // Calculate totals
  const { subtotal, vatAmount, grandTotal } = calculateTotals(updatedItems, vatRate);
  
  return {
    items: updatedItems,
    subtotal,
    vatAmount,
    grandTotal
  };
};
