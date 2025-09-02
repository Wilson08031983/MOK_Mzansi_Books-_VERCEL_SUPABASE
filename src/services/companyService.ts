import { Company, CompanyAssets } from '@/types/company';

const COMPANY_STORAGE_KEY = 'mokMzansiBooks_company';
const COMPANY_ASSETS_STORAGE_KEY = 'mokMzansiBooks_company_assets';

/**
 * Get company details from localStorage
 */
export const getCompany = (): Company | null => {
  try {
    const companyJson = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!companyJson) return null;
    return JSON.parse(companyJson);
  } catch (error) {
    console.error('Error getting company details:', error);
    return null;
  }
};

/**
 * Get company assets (logo, signature, stamp) from localStorage
 */
export const getCompanyAssets = (): CompanyAssets => {
  try {
    const assetsJson = localStorage.getItem(COMPANY_ASSETS_STORAGE_KEY);
    if (!assetsJson) return {};
    return JSON.parse(assetsJson);
  } catch (error) {
    console.error('Error getting company assets:', error);
    return {};
  }
};

// Centralized companyId resolver used for data scoping across services
export const getCompanyId = (): string => {
  try {
    // Prefer the typed company record if present
    const company = getCompany();
    if (company && company.id) return company.id;

    // Fallback to "companyDetails" used elsewhere in the app
    const detailsRaw = localStorage.getItem('companyDetails');
    if (detailsRaw) {
      const parsed = JSON.parse(detailsRaw);
      const name: string | undefined = parsed?.companyName || parsed?.name;
      if (typeof name === 'string' && name.trim().length > 0) {
        return `company_${name.replace(/\s+/g, '_').toLowerCase()}`;
      }
    }
  } catch (error) {
    console.error('Error resolving company id:', error);
  }
  // Safe fallback
  return 'current-company-id';
};

export default {
  getCompany,
  getCompanyAssets,
  getCompanyId
};
