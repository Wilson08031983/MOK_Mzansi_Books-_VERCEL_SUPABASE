import { Company, CompanyAssets } from '@/types/company';
import { safeLocalStorage, scopedKey } from '@/utils/safeAccess';

// Base keys (will be scoped per user via scopedKey)
const COMPANY_STORAGE_KEY_BASE = 'mokMzansiBooks_company';
const COMPANY_ASSETS_STORAGE_KEY_BASE = 'mokMzansiBooks_company_assets';

// Legacy keys used across the app (kept for backward compatibility during migration)
const LEGACY_COMPANY_DETAILS_KEY = 'companyDetails';
const LEGACY_COMPANY_ASSETS_KEY = 'companyAssets';

/**
 * Get company details (scoped per user). Falls back to legacy keys if not found.
 */
export const getCompany = (): Company | null => {
  try {
    const key = scopedKey(COMPANY_STORAGE_KEY_BASE);
    const fromScoped = safeLocalStorage.getItem<Company | null>(key, null);
    if (fromScoped) return fromScoped;

    // Fallback to legacy location
    const legacyRaw = localStorage.getItem(LEGACY_COMPANY_DETAILS_KEY);
    if (!legacyRaw) return null;
    const legacyParsed = JSON.parse(legacyRaw);
    return legacyParsed as Company;
  } catch (error) {
    console.error('Error getting company details:', error);
    return null;
  }
};

/**
 * Persist company details (writes scoped-first, mirrors to legacy for compatibility)
 */
export const saveCompany = (company: Company): void => {
  try {
    const key = scopedKey(COMPANY_STORAGE_KEY_BASE);
    safeLocalStorage.setItem(key, company);
    // Mirror to legacy until all components are migrated
    try {
      localStorage.setItem(LEGACY_COMPANY_DETAILS_KEY, JSON.stringify(company));
    } catch {}
  } catch (error) {
    console.error('Error saving company details:', error);
  }
};

/**
 * Get company assets (logo, signature, stamp), scoped per user with legacy fallback
 */
export const getCompanyAssets = (): CompanyAssets => {
  try {
    const key = scopedKey(COMPANY_ASSETS_STORAGE_KEY_BASE);
    const fromScoped = safeLocalStorage.getItem<CompanyAssets | null>(key, null);
    if (fromScoped) return fromScoped;

    const legacyRaw = localStorage.getItem(LEGACY_COMPANY_ASSETS_KEY);
    if (!legacyRaw) return {};
    return JSON.parse(legacyRaw) as CompanyAssets;
  } catch (error) {
    console.error('Error getting company assets:', error);
    return {};
  }
};

/**
 * Save company assets (scoped and mirrored to legacy for compatibility)
 */
export const saveCompanyAssets = (assets: CompanyAssets): void => {
  try {
    const key = scopedKey(COMPANY_ASSETS_STORAGE_KEY_BASE);
    safeLocalStorage.setItem(key, assets);
    // Mirror to legacy until migration completes across codebase
    try {
      localStorage.setItem(LEGACY_COMPANY_ASSETS_KEY, JSON.stringify(assets));
    } catch {}
  } catch (error) {
    console.error('Error saving company assets:', error);
  }
};

// Centralized companyId resolver used for data scoping across services
export const getCompanyId = (): string => {
  try {
    // Prefer the typed company record if present
    const company = getCompany();
    if (company && (company as any).id) return (company as any).id as string;

    // Fallback to legacy "companyDetails" used elsewhere in the app
    const detailsRaw = localStorage.getItem(LEGACY_COMPANY_DETAILS_KEY);
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

/**
 * Migration utility: if legacy unscoped keys exist and scoped ones are missing, copy data into scoped keys.
 * Does not delete legacy keys to maintain backward compatibility.
 */
export const migrateLegacyCompanyKeys = (): void => {
  try {
    const scopedCompanyKey = scopedKey(COMPANY_STORAGE_KEY_BASE);
    const scopedAssetsKey = scopedKey(COMPANY_ASSETS_STORAGE_KEY_BASE);

    const hasScopedCompany = !!localStorage.getItem(scopedCompanyKey);
    const hasScopedAssets = !!localStorage.getItem(scopedAssetsKey);

    if (!hasScopedCompany) {
      const legacyCompanyRaw = localStorage.getItem(LEGACY_COMPANY_DETAILS_KEY) || localStorage.getItem(COMPANY_STORAGE_KEY_BASE);
      if (legacyCompanyRaw) {
        try {
          const parsed = JSON.parse(legacyCompanyRaw);
          safeLocalStorage.setItem(scopedCompanyKey, parsed);
        } catch {}
      }
    }

    if (!hasScopedAssets) {
      const legacyAssetsRaw = localStorage.getItem(LEGACY_COMPANY_ASSETS_KEY) || localStorage.getItem(COMPANY_ASSETS_STORAGE_KEY_BASE);
      if (legacyAssetsRaw) {
        try {
          const parsed = JSON.parse(legacyAssetsRaw);
          safeLocalStorage.setItem(scopedAssetsKey, parsed);
        } catch {}
      }
    }
  } catch (e) {
    console.warn('Company keys migration encountered a non-blocking error:', e);
  }
};

export default {
  getCompany,
  saveCompany,
  getCompanyAssets,
  saveCompanyAssets,
  getCompanyId,
  migrateLegacyCompanyKeys,
};
