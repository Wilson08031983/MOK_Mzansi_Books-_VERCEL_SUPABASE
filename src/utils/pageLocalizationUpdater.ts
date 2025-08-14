/**
 * Utility to systematically update all pages with localization
 * This ensures the Default Language selector affects all specified pages
 */

export const PAGE_LOCALIZATION_CONFIG = {
  // Pages that need localization updates
  PAGES_TO_UPDATE: [
    'Dashboard',
    'Company', 
    'Clients',
    'Quotations',
    'Invoices', 
    'Projects',
    'Inventory',
    'HRManagement',
    'Accounting',
    'Settings'
  ],
  
  // Common text elements to localize
  COMMON_ELEMENTS: {
    // Navigation
    'Dashboard': 'nav.dashboard',
    'My Company': 'nav.company', 
    'Clients': 'nav.clients',
    'Quotations': 'nav.quotations',
    'Invoices': 'nav.invoices',
    'Projects': 'nav.projects', 
    'Inventory': 'nav.inventory',
    'HR Management': 'nav.hr',
    'Accounting': 'nav.accounting',
    'Settings': 'nav.settings',
    
    // Common actions
    'Save': 'common.save',
    'Cancel': 'common.cancel',
    'Edit': 'common.edit',
    'Delete': 'common.delete',
    'Add': 'common.add',
    'Search': 'common.search',
    'Filter': 'common.filter',
    'Export': 'common.export',
    'Loading...': 'common.loading',
    'No data available': 'common.noData'
  }
};

export const getLocalizedPageTitle = (pageKey: string): string => {
  const titleMap: Record<string, string> = {
    'Dashboard': 'dashboard.title',
    'Company': 'company.title', 
    'Clients': 'clients.title',
    'Quotations': 'quotations.title',
    'Invoices': 'invoices.title',
    'Projects': 'projects.title',
    'Inventory': 'inventory.title',
    'HRManagement': 'hr.title',
    'Accounting': 'accounting.title',
    'Settings': 'settings.title'
  };
  
  return titleMap[pageKey] || pageKey.toLowerCase() + '.title';
};
