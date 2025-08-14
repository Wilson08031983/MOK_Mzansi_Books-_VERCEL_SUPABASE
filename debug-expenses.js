// Debug script to check expenses in localStorage
console.log('=== DEBUGGING EXPENSES FOR VAT 201 ===');

// Check expenses
const expensesStr = localStorage.getItem('expenses');
console.log('Raw expenses data:', expensesStr ? expensesStr.substring(0, 200) + '...' : 'null');

if (expensesStr) {
  const expenses = JSON.parse(expensesStr);
  console.log(`\nTotal expenses found: ${expenses.length}`);
  
  expenses.forEach((exp, i) => {
    console.log(`\nExpense ${i+1}:`, {
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      hasReceipt: exp.hasReceipt,
      receipt: exp.receipt ? 'HAS FILE' : 'NO FILE',
      description: exp.description?.substring(0, 50) + '...',
      source: exp.source
    });
  });
} else {
  console.log('No expenses found in localStorage');
}

// Check manual expenses
const manualExpensesStr = localStorage.getItem('manual_expenses');
console.log('\n=== MANUAL EXPENSES ===');
console.log('Raw manual expenses data:', manualExpensesStr ? manualExpensesStr.substring(0, 200) + '...' : 'null');

if (manualExpensesStr) {
  const manualExpenses = JSON.parse(manualExpensesStr);
  console.log(`\nTotal manual expenses found: ${manualExpenses.length}`);
  
  manualExpenses.forEach((exp, i) => {
    console.log(`\nManual Expense ${i+1}:`, {
      id: exp.id,
      date: exp.date,
      amount: exp.amount,
      hasReceipt: exp.hasReceipt,
      receipt: exp.receipt ? 'HAS FILE' : 'NO FILE',
      description: exp.description?.substring(0, 50) + '...',
      source: exp.source
    });
  });
} else {
  console.log('No manual expenses found in localStorage');
}

// Check OCR receipt data
console.log('\n=== OCR RECEIPT DATA ===');
const ocrReceiptsStr = localStorage.getItem('slip_ocr_receipts');
console.log('Raw OCR receipts data:', ocrReceiptsStr ? ocrReceiptsStr.substring(0, 200) + '...' : 'null');

if (ocrReceiptsStr) {
  const ocrReceipts = JSON.parse(ocrReceiptsStr);
  console.log(`\nTotal OCR receipts found: ${ocrReceipts.length}`);
  
  ocrReceipts.forEach((receipt, i) => {
    console.log(`\nOCR Receipt ${i+1}:`, {
      id: receipt.id,
      expenseId: receipt.expenseId,
      extractedAmount: receipt.extractedAmount,
      vatAmount: receipt.vatAmount,
      status: receipt.status
    });
  });
} else {
  console.log('No OCR receipts found in localStorage');
}

// Check current VAT period
console.log('\n=== VAT PERIOD CHECK ===');
const currentDate = new Date();
console.log('Current date:', currentDate.toISOString());
console.log('VAT period Jul-Aug 2025: 2025-07-01 to 2025-08-31');

// Check if any expenses fall in the period
if (expensesStr) {
  const expenses = JSON.parse(expensesStr);
  const inPeriod = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= new Date('2025-07-01') && expDate <= new Date('2025-08-31');
  });
  console.log(`Expenses in Jul-Aug 2025 period: ${inPeriod.length}`);
  inPeriod.forEach(exp => {
    console.log(`- ${exp.id}: ${exp.date}, Amount: ${exp.amount}, HasReceipt: ${exp.hasReceipt}`);
  });
}

if (manualExpensesStr) {
  const manualExpenses = JSON.parse(manualExpensesStr);
  const inPeriod = manualExpenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= new Date('2025-07-01') && expDate <= new Date('2025-08-31');
  });
  console.log(`Manual expenses in Jul-Aug 2025 period: ${inPeriod.length}`);
  inPeriod.forEach(exp => {
    console.log(`- ${exp.id}: ${exp.date}, Amount: ${exp.amount}, HasReceipt: ${exp.hasReceipt}`);
  });
}

console.log('=== DEBUG COMPLETE ===');
