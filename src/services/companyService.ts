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

export default {
  getCompany,
  getCompanyAssets
};
