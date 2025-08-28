const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/accounting/ExpensesTab.tsx');

try {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check for specific issues
  console.log('Looking for JSX structure issues to fix...');
  
  // Fix the map function and fragment structure at line 2670
  content = content.replace(
    /<\/>\s*\)\)/g,
    '</React.Fragment>\n                    ))'
  );
  
  // Fix categorizeExpense references and clean up duplications
  content = content.replace(/expenseCategorizationService\.expenseCategorizationService\./g, 'expenseCategorizationService.');
  
  // Replace any remaining hardcoded currency symbols with dynamic formatting
  content = content.replace(/R\s*(\d+(\.\d+)?)/g, 'formatCurrency($1)');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully fixed remaining JSX structure issues in ExpensesTab.tsx');
} catch (error) {
  console.error('Error fixing JSX structure:', error);
}
