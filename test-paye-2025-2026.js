// Test PAYE calculation with 2025-2026 tax brackets
// Example from user: R50,000/month should = R12,738.91 PAYE

// 2025-2026 Tax Brackets
const PAYE_BRACKETS = [
  { min: 0, max: 19758, rate: 0.18, baseAmount: 0 },
  { min: 19758.42, max: 30875, rate: 0.26, baseAmount: 3556.50 },
  { min: 30875.01, max: 42733.33, rate: 0.31, baseAmount: 6446.83 },
  { min: 42733.34, max: 56083.33, rate: 0.36, baseAmount: 10122.92 },
  { min: 56083.34, max: 71491.67, rate: 0.39, baseAmount: 14928.92 },
  { min: 71491.68, max: 151416.67, rate: 0.41, baseAmount: 20938.17 },
  { min: 151416.68, max: Infinity, rate: 0.45, baseAmount: 53707.42 }
];

function calculatePAYE(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  
  console.log(`\n🧮 Testing PAYE calculation for R${taxableIncome.toFixed(2)}`);
  
  // Find the appropriate tax bracket
  let applicableBracket = null;
  for (const bracket of PAYE_BRACKETS) {
    if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
      applicableBracket = bracket;
      break;
    }
  }
  
  if (!applicableBracket) {
    console.error(`❌ No tax bracket found for income: R${taxableIncome.toFixed(2)}`);
    return 0;
  }
  
  // Calculate tax using the 2025-2026 formula: baseAmount + rate × (income - bracket.min)
  const excessIncome = taxableIncome - applicableBracket.min;
  const tax = applicableBracket.baseAmount + (applicableBracket.rate * excessIncome);
  
  console.log(`📊 Tax bracket: R${applicableBracket.min.toFixed(2)} - R${applicableBracket.max === Infinity ? '∞' : applicableBracket.max.toFixed(2)}`);
  console.log(`📊 Base amount: R${applicableBracket.baseAmount.toFixed(2)}`);
  console.log(`📊 Excess income: R${excessIncome.toFixed(2)} (R${taxableIncome.toFixed(2)} - R${applicableBracket.min.toFixed(2)})`);
  console.log(`📊 Tax on excess: R${excessIncome.toFixed(2)} × ${(applicableBracket.rate * 100).toFixed(0)}% = R${(applicableBracket.rate * excessIncome).toFixed(2)}`);
  console.log(`✅ Total PAYE: R${applicableBracket.baseAmount.toFixed(2)} + R${(applicableBracket.rate * excessIncome).toFixed(2)} = R${tax.toFixed(2)}`);
  
  return Math.round(tax * 100) / 100;
}

// Test cases
console.log('=== PAYE 2025-2026 Tax Bracket Tests ===');

// User's example: R50,000 should = R12,738.91
const result50k = calculatePAYE(50000);
console.log(`\n🎯 Expected: R12,738.91`);
console.log(`🎯 Calculated: R${result50k.toFixed(2)}`);
console.log(`🎯 Match: ${Math.abs(result50k - 12738.91) < 0.01 ? '✅ PASS' : '❌ FAIL'}`);

// Test current Admin User taxable income: R51,693.30
const resultAdmin = calculatePAYE(51693.30);
console.log(`\n📋 Admin User (R51,693.30): R${resultAdmin.toFixed(2)}`);

// Test other brackets
console.log('\n=== Additional Test Cases ===');
calculatePAYE(15000);  // First bracket
calculatePAYE(25000);  // Second bracket
calculatePAYE(35000);  // Third bracket
calculatePAYE(80000);  // Fifth bracket
calculatePAYE(200000); // Highest bracket
