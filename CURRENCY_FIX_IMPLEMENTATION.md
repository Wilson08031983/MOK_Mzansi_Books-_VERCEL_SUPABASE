# Currency Selector Fix - Implementation Guide
## Issue: Currency changes to USD but doesn't propagate to all pages

### 🔍 **ROOT CAUSE ANALYSIS**

The currency selector in Settings page is working correctly, but the currency changes aren't propagating to all pages because:

1. **Hardcoded Currency Values**: Many pages still use hardcoded 'ZAR' or 'R' formatting
2. **Missing Dynamic Currency Integration**: Pages not using `settings.currency` from localization
3. **Inconsistent Currency Formatting**: Some pages use old `financialSummaryService.formatCurrency()` instead of dynamic `formatCurrency()`

### 🎯 **PAGES REQUIRING CURRENCY FIXES**

#### **Pages with Currency Display Issues:**
- ❌ **Dashboard Page** - Has syntax errors, needs currency integration
- ❌ **Company Page** - Needs currency display integration
- ❌ **Clients Page** - Needs currency formatting for client values
- ❌ **Quotations Page** - Needs currency formatting for quotation amounts
- ✅ **Invoices Page** - Partially fixed, some hardcoded values remain
- ❌ **Projects Page** - Needs currency formatting for project values
- ❌ **Inventory Page** - Needs currency formatting for item prices
- ❌ **HR Management Page** - Needs currency formatting for salary/payroll
- ✅ **Accounting Page** - Partially fixed, some hardcoded values remain
- ✅ **Settings Page** - Currency selector working correctly

### 🛠️ **IMPLEMENTATION STRATEGY**

#### **Step 1: Ensure All Pages Use Dynamic Currency**
Each page needs to:
1. Import `useLocalization` hook with `formatCurrency` and `settings`
2. Replace hardcoded currency values with `settings.currency`
3. Replace hardcoded formatting with `formatCurrency(amount)`

#### **Step 2: Required Code Pattern for Each Page**
```tsx
// Import useLocalization hook
import { useLocalization } from '../hooks/useLocalization';

// In component
const { formatCurrency, settings } = useLocalization();

// Replace hardcoded currency
// OLD: currency: 'ZAR'
// NEW: currency: settings.currency

// Replace hardcoded formatting
// OLD: `R ${amount.toFixed(2)}`
// NEW: formatCurrency(amount)

// Replace service formatting
// OLD: financialSummaryService.formatCurrency(amount)
// NEW: formatCurrency(amount)
```

### 🔧 **SPECIFIC FIXES NEEDED**

#### **Dashboard Page**
- Fix existing syntax errors first
- Add currency formatting for financial widgets
- Use `formatCurrency()` for all monetary displays

#### **Company Page**
- Add currency formatting for company financial data
- Use `settings.currency` for any currency-related displays

#### **Clients Page**
- Add currency formatting for client total values
- Use `formatCurrency()` for outstanding amounts

#### **Quotations Page**
- Add currency formatting for quotation amounts
- Use `settings.currency` for quotation currency field
- Update amount filters to use dynamic currency

#### **Projects Page**
- Add currency formatting for project budgets/costs
- Use `formatCurrency()` for project financial data

#### **Inventory Page**
- Add currency formatting for item prices
- Use `formatCurrency()` for cost/price displays

#### **HR Management Page**
- Add currency formatting for salary/payroll data
- Use `formatCurrency()` for employee compensation

### 🧪 **TESTING PLAN**

#### **Test Scenario: Currency Propagation**
1. Navigate to Settings → General → Currency
2. Change currency from ZAR to USD
3. Navigate to each page and verify:
   - All monetary values show in USD format ($X,XXX.XX)
   - No hardcoded 'R' symbols remain
   - Currency formatting matches selected currency locale

#### **Expected Results After Fix:**
- **Settings**: USD selected, indicator shows "💰 Current: $ US Dollar"
- **Dashboard**: All financial widgets show USD formatting
- **Company**: Company financial data in USD
- **Clients**: Client values in USD format
- **Quotations**: Quotation amounts in USD
- **Invoices**: All invoice amounts in USD
- **Projects**: Project costs in USD
- **Inventory**: Item prices in USD
- **HR Management**: Salary data in USD
- **Accounting**: All financial summaries in USD

### 📋 **IMPLEMENTATION CHECKLIST**

- [ ] Fix Dashboard page syntax errors
- [ ] Add currency integration to Dashboard page
- [ ] Add currency formatting to Company page
- [ ] Add currency formatting to Clients page
- [ ] Add currency formatting to Quotations page
- [ ] Complete currency integration in Invoices page
- [ ] Add currency formatting to Projects page
- [ ] Add currency formatting to Inventory page
- [ ] Add currency formatting to HR Management page
- [ ] Complete currency integration in Accounting page
- [ ] Test currency selector changes across all pages
- [ ] Verify currency persistence across browser sessions
- [ ] Test different currency formats (ZAR, USD, EUR, GBP)

### 🚀 **PRIORITY ACTIONS**

1. **High Priority**: Fix remaining hardcoded currency in Accounting and Invoices pages
2. **Medium Priority**: Add currency integration to Dashboard, Clients, Quotations pages
3. **Low Priority**: Add currency formatting to Company, Projects, Inventory, HR pages

This comprehensive fix will ensure the currency selector in Settings page properly propagates changes to all specified pages in the MOK Mzansi Books application.
