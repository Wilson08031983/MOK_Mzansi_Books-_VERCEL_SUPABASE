import { toast } from 'sonner';

// Storage keys for both systems (using actual keys from existing components)
const COMPANY_DETAILS_KEY = 'companyDetails';
const COMPANY_ASSETS_KEY = 'companyAssets';
const GENERAL_SETTINGS_KEY = 'generalSettings';

// Interface for company data structure
interface CompanyData {
  name: string;
  contactName: string;
  contactSurname: string;
  position: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  regNumber: string;
  vatNumber: string;
  taxNumber: string;
  businessType?: string;
  industry?: string;
  physicalAddress?: string;
  mailingAddress?: string;
}

interface GeneralSettings {
  companyInfo: {
    name: string;
    businessType: string;
    industry: string;
    registrationNumber: string;
    vatNumber: string;
    physicalAddress: string;
    mailingAddress: string;
  };
  localization: any;
  displaySettings: any;
}

interface CompanyAssets {
  logo?: string;
  signature?: string;
  stamp?: string;
}

class CompanySettingsSyncService {
  private syncInProgress = false;

  /**
   * Initialize the sync service and set up listeners
   */
  initialize() {
    // Listen for storage changes to sync between tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Perform initial sync on startup
    this.performBidirectionalSync();
  }

  /**
   * Handle storage changes from other tabs/windows
   */
  private handleStorageChange(event: StorageEvent) {
    if (this.syncInProgress) return;

    if (event.key === GENERAL_SETTINGS_KEY || event.key === COMPANY_DETAILS_KEY) {
      this.performBidirectionalSync();
    }
  }

  /**
   * Sync data from Settings to Company page
   */
  syncSettingsToCompany(): void {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const generalSettings = this.getGeneralSettings();
      const companyData = this.getCompanyData();

      if (!generalSettings?.companyInfo) {
        this.syncInProgress = false;
        return;
      }

      const updatedCompanyData: CompanyData = {
        ...companyData,
        name: generalSettings.companyInfo.name || companyData.name,
        regNumber: generalSettings.companyInfo.registrationNumber || companyData.regNumber,
        vatNumber: generalSettings.companyInfo.vatNumber || companyData.vatNumber,
        businessType: generalSettings.companyInfo.businessType || companyData.businessType,
        industry: generalSettings.companyInfo.industry || companyData.industry,
      };

      // Parse physical address into address lines
      if (generalSettings.companyInfo.physicalAddress) {
        const addressParts = this.parseAddress(generalSettings.companyInfo.physicalAddress);
        updatedCompanyData.addressLine1 = addressParts.line1 || companyData.addressLine1;
        updatedCompanyData.addressLine2 = addressParts.line2 || companyData.addressLine2;
        updatedCompanyData.addressLine3 = addressParts.line3 || companyData.addressLine3;
        updatedCompanyData.addressLine4 = addressParts.line4 || companyData.addressLine4;
      }

      this.saveCompanyData(updatedCompanyData);
      console.log('Synced Settings → Company:', updatedCompanyData);
      
    } catch (error) {
      console.error('Error syncing settings to company:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync data from Company page to Settings
   */
  syncCompanyToSettings(): void {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const companyData = this.getCompanyData();
      const generalSettings = this.getGeneralSettings();

      if (!companyData) {
        this.syncInProgress = false;
        return;
      }

      const updatedSettings: GeneralSettings = {
        ...generalSettings,
        companyInfo: {
          ...generalSettings?.companyInfo,
          name: companyData.name || generalSettings?.companyInfo?.name || '',
          registrationNumber: companyData.regNumber || generalSettings?.companyInfo?.registrationNumber || '',
          vatNumber: companyData.vatNumber || generalSettings?.companyInfo?.vatNumber || '',
          businessType: companyData.businessType || generalSettings?.companyInfo?.businessType || '',
          industry: companyData.industry || generalSettings?.companyInfo?.industry || '',
          physicalAddress: this.combineAddress(companyData) || generalSettings?.companyInfo?.physicalAddress || '',
          mailingAddress: generalSettings?.companyInfo?.mailingAddress || ''
        }
      };

      this.saveGeneralSettings(updatedSettings);
      console.log('Synced Company → Settings:', updatedSettings);
      
    } catch (error) {
      console.error('Error syncing company to settings:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform bidirectional sync - sync both ways to ensure consistency
   */
  performBidirectionalSync(): void {
    if (this.syncInProgress) return;

    const companyData = this.getCompanyData();
    const generalSettings = this.getGeneralSettings();

    // Determine which data is more recent or complete
    const companyTimestamp = this.getDataTimestamp(COMPANY_DETAILS_KEY);
    const settingsTimestamp = this.getDataTimestamp(GENERAL_SETTINGS_KEY);

    if (companyTimestamp > settingsTimestamp) {
      this.syncCompanyToSettings();
    } else {
      this.syncSettingsToCompany();
    }
  }

  /**
   * Parse a single address string into multiple lines
   */
  private parseAddress(address: string): { line1: string; line2: string; line3: string; line4: string } {
    if (!address) return { line1: '', line2: '', line3: '', line4: '' };

    const parts = address.split(',').map(part => part.trim());
    
    return {
      line1: parts[0] || '',
      line2: parts[1] || '',
      line3: parts[2] || '',
      line4: parts[3] || ''
    };
  }

  /**
   * Combine address lines into a single address string
   */
  private combineAddress(companyData: CompanyData): string {
    const addressParts = [
      companyData.addressLine1,
      companyData.addressLine2,
      companyData.addressLine3,
      companyData.addressLine4
    ].filter(part => part && part.trim() !== '');

    return addressParts.join(', ');
  }

  /**
   * Get timestamp for data freshness comparison
   */
  private getDataTimestamp(key: string): number {
    const timestampKey = `${key}_timestamp`;
    const timestamp = localStorage.getItem(timestampKey);
    return timestamp ? parseInt(timestamp) : 0;
  }

  /**
   * Set timestamp for data
   */
  private setDataTimestamp(key: string): void {
    const timestampKey = `${key}_timestamp`;
    localStorage.setItem(timestampKey, Date.now().toString());
  }

  /**
   * Get general settings from localStorage
   */
  private getGeneralSettings(): GeneralSettings | null {
    try {
      const settings = localStorage.getItem(GENERAL_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting general settings:', error);
      return null;
    }
  }

  /**
   * Save general settings to localStorage
   */
  private saveGeneralSettings(settings: GeneralSettings): void {
    try {
      localStorage.setItem(GENERAL_SETTINGS_KEY, JSON.stringify(settings));
      this.setDataTimestamp(GENERAL_SETTINGS_KEY);
    } catch (error) {
      console.error('Error saving general settings:', error);
    }
  }

  /**
   * Get company data from localStorage
   */
  private getCompanyData(): CompanyData | null {
    try {
      const data = localStorage.getItem(COMPANY_DETAILS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting company data:', error);
      return null;
    }
  }

  /**
   * Save company data to localStorage
   */
  private saveCompanyData(data: CompanyData): void {
    try {
      localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(data));
      this.setDataTimestamp(COMPANY_DETAILS_KEY);
    } catch (error) {
      console.error('Error saving company data:', error);
    }
  }

  /**
   * Sync company assets (logo, signature, stamp)
   */
  syncCompanyAssets(): void {
    try {
      const assets = this.getCompanyAssets();
      if (assets.logo) {
        // Trigger UI update for logo display
        window.dispatchEvent(new CustomEvent('companyLogoUpdated', { 
          detail: { logo: assets.logo } 
        }));
      }
    } catch (error) {
      console.error('Error syncing company assets:', error);
    }
  }

  /**
   * Get company assets from localStorage
   */
  private getCompanyAssets(): CompanyAssets {
    try {
      const assets = localStorage.getItem(COMPANY_ASSETS_KEY);
      return assets ? JSON.parse(assets) : {};
    } catch (error) {
      console.error('Error getting company assets:', error);
      return {};
    }
  }

  /**
   * Manual sync trigger with user feedback
   */
  manualSync(): void {
    try {
      this.performBidirectionalSync();
      this.syncCompanyAssets();
      toast.success('Company information synchronized successfully!');
    } catch (error) {
      console.error('Manual sync error:', error);
      toast.error('Failed to synchronize company information');
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): { isInProgress: boolean; lastSyncTime: number } {
    return {
      isInProgress: this.syncInProgress,
      lastSyncTime: Math.max(
        this.getDataTimestamp(COMPANY_DETAILS_KEY),
        this.getDataTimestamp(GENERAL_SETTINGS_KEY)
      )
    };
  }
}

// Create and export singleton instance
export const companySettingsSyncService = new CompanySettingsSyncService();

// Note: Auto-initialization disabled to prevent duplicate sync loops with workingCompanySync.
// Initialize explicitly in the rare case this service is used.
// companySettingsSyncService.initialize();

export default companySettingsSyncService;
