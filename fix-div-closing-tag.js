const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/accounting/ExpensesTab.tsx');

try {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the specific section where the missing closing tag might be
  let section = content.substring(content.indexOf('<td colSpan={viewMode === \'bank_statement\' ? 12 : 9} className="p-0">'), 
                                 content.indexOf('</td>', content.indexOf('<td colSpan={viewMode === \'bank_statement\' ? 12 : 9} className="p-0">')));
  
  // Count opening and closing div tags in this section
  const openingDivs = (section.match(/<div/g) || []).length;
  const closingDivs = (section.match(/<\/div>/g) || []).length;
  
  console.log(`Found ${openingDivs} opening divs and ${closingDivs} closing divs in the section`);
  
  // Fix the missing div tags by ensuring all divs are properly closed
  const fixedContent = content.replace(
    /<div className="glass backdrop-blur-sm bg-slate-900\/40 p-4 border-t border-b border-white\/10">([\s\S]*?)<\/td>/g,
    (match) => {
      // Count opening and closing divs in the match
      const openDivs = (match.match(/<div/g) || []).length;
      const closeDivs = (match.match(/<\/div>/g) || []).length;
      const missingDivs = openDivs - closeDivs;
      
      if (missingDivs > 0) {
        // Add missing closing div tags
        let result = match;
        for (let i = 0; i < missingDivs; i++) {
          // Insert closing divs before the </td>
          result = result.replace('</td>', '</div></td>');
        }
        return result;
      }
      return match;
    }
  );
  
  // Write the fixed content back
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('Successfully fixed missing div closing tags in ExpensesTab.tsx');
} catch (error) {
  console.error('Error fixing JSX structure:', error);
}
