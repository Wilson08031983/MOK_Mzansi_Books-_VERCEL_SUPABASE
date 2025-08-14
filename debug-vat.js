// Debug script to check VAT calculation issue
// Run this in browser console on the accounting page

console.log('=== VAT DEBUG SCRIPT ===');

// Check localStorage data
const invoices = localStorage.getItem('invoices');
const incomes = localStorage.getItem('incomes');
const expenses = localStorage.getItem('expenses');

console.log('LocalStorage Data:');
console.log('- invoices:', invoices ? JSON.parse(invoices) : null);
console.log('- incomes:', incomes ? JSON.parse(incomes) : null);
console.log('- expenses:', expenses ? JSON.parse(expenses) : null);

// Check if there are any invoices
if (invoices) {
  const parsedInvoices = JSON.parse(invoices);
  console.log(`Found ${parsedInvoices.length} invoices in localStorage`);
  
  parsedInvoices.forEach((invoice, index) => {
    console.log(`Invoice ${index + 1}:`, {
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      status: invoice.status,
      vatAmount: invoice.vatAmount,
      vatTotal: invoice.vatTotal,
      total: invoice.total,
      subtotal: invoice.subtotal
    });
  });
} else {
  console.log('No invoices found in localStorage');
}

// Test VAT calculation manually
const startDate = '2025-07-01';
const endDate = '2025-08-31';

console.log(`Testing VAT calculation for period: ${startDate} to ${endDate}`);

// This would need to be run in browser console where the service is available
console.log('To test VAT calculation, run this in browser console:');
console.log(`
// Import the service (if available globally)
import { calculateVAT201 } from './src/services/vat201Service.ts';
const result = calculateVAT201('${startDate}', '${endDate}');
console.log('VAT Calculation Result:', result);
`);
