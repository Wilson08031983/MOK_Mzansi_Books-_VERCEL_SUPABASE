// Working Company Settings Synchronization Service
// This service provides bidirectional sync between Settings General tab and Company Details page

interface CompanyDetailsData {
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  ownerName?: string;
  ownerSurname?: string;
  ownerPosition?: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  regNumber?: string;
  vatNumber?: string;
  lastUpdated: string;
}

interface GeneralSettingsData {
  companyInfo: {
    name: string;
    businessType: string;
    industry: string;
    registrationNumber: string;
    vatNumber: string;
    physicalAddress: string;
    mailingAddress: string;
  };
  localization?: any;
  displaySettings?: any;
}

interface CompanyAssetsData {
  logo?: string;
  Logo?: {
    name: string;
    dataUrl: string;
    lastModified: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
  };
  signature?: string;
  stamp?: string;
  [key: string]: any;
}

class WorkingCompanySync {
  private isUpdating = false;
  private lastSyncTime = 0;
  // Loop guard to avoid reacting to our own recent writes
  private lastWriteKey: string | null = null;
  private lastWriteTime = 0;
  private initialized = false;
  private lastHandledTime = 0;

  /**
   * Initialize sync listeners
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    // Listen for storage changes across tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Perform initial sync
    this.syncBothWays();
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange(event: StorageEvent) {
    if (this.isUpdating) return;
    
    // Ignore storage events caused by our own recent writes (extended debounce window)
    const key = event.key;
    if (key && this.lastWriteKey === key && Date.now() - this.lastWriteTime < 1500) {
      return;
    }

    // Only react to companyDetails updates to avoid storms from in-progress General Settings edits
    if (event.key === 'companyDetails' && event.newValue) {
      // Throttle reactions to at most once per second
      const now = Date.now();
      if (now - this.lastHandledTime < 1000) return;
      this.lastHandledTime = now;

      // Longer delay to prevent rapid successive syncs
      setTimeout(() => {
        if (!this.isUpdating) {
          this.syncBothWays();
        }
      }, 300);
    }
  }

  /**
   * Sync from Company Details to Settings
   */
  syncCompanyToSettings() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const companyDetails = this.getCompanyDetails();
      if (!companyDetails) {
        this.isUpdating = false;
        return;
      }

      const currentSettings = this.getGeneralSettings() || { companyInfo: {} };
      
      // Update settings with company data (with type safety)
      const currentCompanyInfo = currentSettings.companyInfo || {};
      const updatedSettings: GeneralSettingsData = {
        ...currentSettings,
        companyInfo: {
          ...currentCompanyInfo,
          name: companyDetails.companyName || (currentCompanyInfo && 'name' in currentCompanyInfo ? String(currentCompanyInfo.name) : ''),
          registrationNumber: companyDetails.regNumber || (currentCompanyInfo && 'registrationNumber' in currentCompanyInfo ? String(currentCompanyInfo.registrationNumber) : ''),
          vatNumber: companyDetails.vatNumber || (currentCompanyInfo && 'vatNumber' in currentCompanyInfo ? String(currentCompanyInfo.vatNumber) : ''),
          physicalAddress: this.combineAddress(companyDetails) || (currentCompanyInfo && 'physicalAddress' in currentCompanyInfo ? String(currentCompanyInfo.physicalAddress) : ''),
          businessType: (currentCompanyInfo && 'businessType' in currentCompanyInfo ? String(currentCompanyInfo.businessType) : 'Software Company'),
          industry: (currentCompanyInfo && 'industry' in currentCompanyInfo ? String(currentCompanyInfo.industry) : 'Technology'),
          mailingAddress: (currentCompanyInfo && 'mailingAddress' in currentCompanyInfo ? String(currentCompanyInfo.mailingAddress) : '')
        }
      };

      localStorage.setItem('generalSettings', JSON.stringify(updatedSettings));
      // Ensure timestamp is updated to prevent repeated company->settings syncs
      localStorage.setItem('generalSettings_timestamp', Date.now().toString());
      // Mark last write for loop guard
      this.lastWriteKey = 'generalSettings';
      this.lastWriteTime = Date.now();
      console.log('✅ Synced Company → Settings:', updatedSettings.companyInfo);
      
    } catch (error) {
      console.error('❌ Error syncing Company → Settings:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Sync from Settings to Company Details
   */
  syncSettingsToCompany(): void {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const settings = this.getGeneralSettings();
      if (!settings || !settings.companyInfo) {
        console.warn('⚠️ No settings data found for sync');
        this.isUpdating = false;
        return;
      }

      const companyDetails = this.getCompanyDetails() || {} as CompanyDetailsData;
      const addressParts = this.parseAddress(settings.companyInfo.physicalAddress);
      
      // Update company details with settings data (with type safety)
      const updatedCompanyDetails = {
        ...companyDetails,
        companyName: (settings.companyInfo && 'name' in settings.companyInfo) ? settings.companyInfo.name : '',
        regNumber: (settings.companyInfo && 'registrationNumber' in settings.companyInfo) ? settings.companyInfo.registrationNumber : '',
        vatNumber: (settings.companyInfo && 'vatNumber' in settings.companyInfo) ? settings.companyInfo.vatNumber : '',
        addressLine1: addressParts.line1 || companyDetails.addressLine1 || '',
        addressLine2: addressParts.line2 || companyDetails.addressLine2 || '',
        addressLine3: addressParts.line3 || companyDetails.addressLine3 || '',
        addressLine4: addressParts.line4 || companyDetails.addressLine4 || '',
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('companyDetails', JSON.stringify(updatedCompanyDetails));
      localStorage.setItem('companyDetails_timestamp', Date.now().toString());
      // Sync company logo from settings to company assets
      const settingsAssets = this.getCompanyAssets();
      if (settingsAssets && (settingsAssets.Logo || settingsAssets.logo)) {
        // Ensure logo is in the correct format for Company page
        if (settingsAssets.logo && !settingsAssets.Logo) {
          settingsAssets.Logo = {
            name: 'company-logo.png',
            dataUrl: settingsAssets.logo,
            lastModified: Date.now(),
            width: 200,
            height: 200,
            aspectRatio: 1
          };
          delete settingsAssets.logo; // Remove old format
        }
        localStorage.setItem('companyAssets', JSON.stringify(settingsAssets));
      }
      // Mark last write for loop guard
      this.lastWriteKey = 'companyDetails';
      this.lastWriteTime = Date.now();
      
      console.log('✅ Synced Settings → Company:', updatedCompanyDetails);
      this.dispatchSyncSuccess();
      
    } catch (error) {
      console.error('❌ Error syncing Settings → Company:', error);
      this.dispatchSyncError();
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Sync both ways intelligently
   */
  syncBothWays() {
    if (this.isUpdating) return;

    const companyDetails = this.getCompanyDetails();
    const settings = this.getGeneralSettings();

    // If company details exist but settings don't, sync company → settings
    if (companyDetails && !settings?.companyInfo) {
      this.syncCompanyToSettings();
      return;
    }

    // If settings exist but company details don't, sync settings → company
    if (settings?.companyInfo && !companyDetails) {
      this.syncSettingsToCompany();
      return;
    }

    // If both exist, sync based on last updated time
    if (companyDetails && settings?.companyInfo) {
      const companyTime = new Date(companyDetails.lastUpdated || 0).getTime();
      const settingsTime = this.getSettingsTimestamp();
      
      if (companyTime > settingsTime) {
        this.syncCompanyToSettings();
      } else {
        this.syncSettingsToCompany();
      }
    }
  }

  /**
   * Manual sync with user feedback
   */
  manualSync() {
    try {
      this.syncBothWays();
      // Show success message
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('syncSuccess', { 
          detail: { message: 'Company information synchronized successfully!' }
        }));
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('syncError', { 
          detail: { message: 'Failed to synchronize company information' }
        }));
      }
    }
  }

  /**
   * Parse address string into components
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
   * Combine address lines into single string
   */
  private combineAddress(company: CompanyDetailsData): string {
    const parts = [
      company.addressLine1,
      company.addressLine2,
      company.addressLine3,
      company.addressLine4
    ].filter(part => part && part.trim() !== '');

    return parts.join(', ');
  }

  /**
   * Get company details from localStorage
   */
  private getCompanyDetails(): CompanyDetailsData | null {
    try {
      const data = localStorage.getItem('companyDetails');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting company details:', error);
      return null;
    }
  }

  /**
   * Get general settings from localStorage
   */
  private getGeneralSettings(): GeneralSettingsData | null {
    try {
      const data = localStorage.getItem('generalSettings');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting general settings:', error);
      return null;
    }
  }

  /**
   * Get settings timestamp
   */
  private getSettingsTimestamp(): number {
    try {
      const timestamp = localStorage.getItem('generalSettings_timestamp');
      return timestamp ? parseInt(timestamp) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Sync company assets (logo, signature, stamp)
   */
  syncAssets() {
    try {
      const assets = this.getCompanyAssets();
      if (assets.logo) {
        // Trigger logo update event
        window.dispatchEvent(new CustomEvent('companyLogoUpdated', { 
          detail: { logo: assets.logo } 
        }));
      }
    } catch (error) {
      console.error('Error syncing assets:', error);
    }
  }

  /**
   * Get company assets
   */
  private getCompanyAssets(): CompanyAssetsData {
    try {
      const data = localStorage.getItem('companyAssets');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting company assets:', error);
      return {};
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return {
      isInProgress: this.isUpdating,
      lastSyncTime: this.lastSyncTime
    };
  }

  /**
   * Dispatch sync success event
   */
  private dispatchSyncSuccess() {
    this.lastSyncTime = Date.now();
    window.dispatchEvent(new CustomEvent('syncSuccess', {
      detail: { timestamp: this.lastSyncTime }
    }));
  }

  /**
   * Dispatch sync error event
   */
  private dispatchSyncError() {
    window.dispatchEvent(new CustomEvent('syncError', {
      detail: { timestamp: Date.now() }
    }));
  }
}

// Create and export singleton
export const workingCompanySync = new WorkingCompanySync();

// Auto-initialize with HMR-safe global guard
if (typeof window !== 'undefined') {
  const w = window as any;
  if (!w.__workingCompanySyncInitialized) {
    workingCompanySync.init();
    w.__workingCompanySyncInitialized = true;
  }
}

export default workingCompanySync;
