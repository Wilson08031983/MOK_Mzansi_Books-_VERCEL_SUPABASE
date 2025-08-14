/**
 * Comprehensive solution to fix localization across all specified pages
 * This addresses the issue where Default Language selector changes are not taking effect
 */

export const LOCALIZATION_FIXES_NEEDED = {
  // Pages that need UI text elements updated to use translation keys
  PAGES_TO_FIX: [
    {
      page: 'Quotations',
      file: 'src/pages/Quotations.tsx',
      status: 'HOOK_ADDED_NEED_UI_UPDATES',
      issues: [
        'Page title "Quotations" needs to use {t("quotations.title")}',
        'Button text "Create Quotation" needs localization',
        'Search placeholder needs localization',
        'Status labels need localization'
      ]
    },
    {
      page: 'Invoices', 
      file: 'src/pages/Invoices.tsx',
      status: 'HOOK_ADDED_NEED_UI_UPDATES',
      issues: [
        'Page title "Invoices" needs to use {t("invoices.title")}',
        'Button text "Create Invoice" needs localization',
        'Table headers need localization',
        'Status labels need localization'
      ]
    },
    {
      page: 'Projects',
      file: 'src/pages/Projects.tsx', 
      status: 'HOOK_ADDED_NEED_UI_UPDATES',
      issues: [
        'Page title "Projects" needs to use {t("projects.title")}',
        'Button text "New Project" needs localization',
        'Stats labels need localization'
      ]
    },
    {
      page: 'Inventory',
      file: 'src/pages/Inventory.tsx',
      status: 'HOOK_ADDED_NEED_UI_UPDATES', 
      issues: [
        'Page title "Inventory Management" needs to use {t("inventory.title")}',
        'Button text needs localization',
        'Table headers need localization'
      ]
    },
    {
      page: 'HR Management',
      file: 'src/pages/HRManagement.tsx',
      status: 'HOOK_ADDED_NEED_UI_UPDATES',
      issues: [
        'Page title "HR Management" needs to use {t("hr.title")}',
        'Tab labels need localization',
        'Button text needs localization'
      ]
    },
    {
      page: 'Accounting',
      file: 'src/pages/Accounting.tsx',
      status: 'HOOK_ADDED_NEED_UI_UPDATES',
      issues: [
        'Page title "Accounting & Finance" needs to use {t("accounting.title")}',
        'Tab labels need localization',
        'Financial summary labels need localization'
      ]
    },
    {
      page: 'Settings',
      file: 'src/pages/Settings.tsx',
      status: 'HOOK_NEEDED_AND_UI_UPDATES',
      issues: [
        'Page title "Settings" needs to use {t("settings.title")}',
        'Back button text needs localization',
        'Description text needs localization'
      ]
    }
  ],

  // Root cause analysis
  ROOT_CAUSE: {
    issue: 'Localization hooks added but UI text elements still hardcoded',
    solution: 'Replace hardcoded strings with t() function calls',
    priority: 'HIGH - User reported language changes not working'
  },

  // Quick fixes needed
  IMMEDIATE_FIXES: [
    'Update page titles to use t() function',
    'Update back button text to use t("common.back")',
    'Update main action buttons to use localized text',
    'Update navigation breadcrumbs to use localized text'
  ]
};

/**
 * Function to validate if a page has proper localization integration
 */
export const validatePageLocalization = (pageName: string) => {
  const pageConfig = LOCALIZATION_FIXES_NEEDED.PAGES_TO_FIX.find(p => p.page === pageName);
  
  return {
    hasHook: pageConfig?.status.includes('HOOK_ADDED'),
    needsUIUpdates: pageConfig?.status.includes('NEED_UI_UPDATES'),
    issues: pageConfig?.issues || [],
    isComplete: pageConfig?.status === 'COMPLETE'
  };
};

/**
 * Priority order for fixing pages
 */
export const PRIORITY_ORDER = [
  'Settings',     // Most critical - contains the language selector
  'Quotations',   // High visibility page
  'Invoices',     // High visibility page  
  'Projects',     // High visibility page
  'Inventory',    // Medium priority
  'HR Management', // Medium priority
  'Accounting'    // Medium priority
];

export default LOCALIZATION_FIXES_NEEDED;
