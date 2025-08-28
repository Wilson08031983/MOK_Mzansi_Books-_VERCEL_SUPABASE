const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/accounting/ExpensesTab.tsx');

try {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the map function beginning and end
  const mapBegins = content.indexOf('filteredExpenses.map(expense => (');
  const mapSection = content.substring(mapBegins, mapBegins + 3000);
  
  // Check if we have a mismatch between React.Fragment opening and closing
  if (mapSection.includes('<React.Fragment key={expense.id}>')) {
    console.log('Found React.Fragment opening tag with key');
    
    // Fix the closing tag to match the opening tag properly
    content = content.replace(
      /(<\/React\.Fragment>\s*\)\))/g,
      '</React.Fragment>\n                    ))'
    );
    
    content = content.replace(
      /<React\.Fragment key={expense\.id}>([\s\S]*?)<\/React\.Fragment>/g,
      (match) => {
        return match;
      }
    );
    
    // Fix line 2670 specifically
    content = content.replace(
      /<\/React\.Fragment>\s*\)\)/g, 
      '</React.Fragment>\n                    ))'
    );
  }
  
  // Check for any remaining currency formatting issues
  content = content.replace(/R\s*(\d+(\.\d+)?)/g, 'formatCurrency($1)');
  
  // Clean up duplicate service references
  content = content.replace(/expenseCategorizationService\.expenseCategorizationService\./g, 'expenseCategorizationService.');
  
  // Write the fixed content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully fixed JSX structure at line 2670 in ExpensesTab.tsx');
} catch (error) {
  console.error('Error fixing JSX structure:', error);
}
