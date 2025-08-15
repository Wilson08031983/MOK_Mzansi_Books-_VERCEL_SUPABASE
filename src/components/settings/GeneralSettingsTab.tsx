import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Building2, Upload, Save, X, ShieldAlert, RefreshCw, Monitor } from 'lucide-react';
import TimezoneDisplay from '@/components/common/TimezoneDisplay';
import { toast } from 'sonner';
import { workingCompanySync } from '@/services/workingCompanySync';
import { verifyAdminPermission, initializeLocalAuth, resetAuthState } from '@/services/localAuthService';
import { useLocalization } from '@/hooks/useLocalization';
import { localizationService } from '@/services/localizationService';
import AuthModal from '../company/AuthModal';
import { useTheme } from 'next-themes';

const GeneralSettingsTab = () => {
  const { t, currentLanguage, settings, changeLanguage, updateSettings, getCurrencySymbol, getCurrencyDisplayName } = useLocalization();
  const { theme, setTheme } = useTheme();
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'MOKMzansiBooks',
    businessType: 'Software Company',
    industry: 'Technology',
    registrationNumber: 'REG123456789',
    vatNumber: 'VAT987654321',
    physicalAddress: '123 Business Street, Cape Town, 8001',
    mailingAddress: 'PO Box 123, Cape Town, 8000'
  });

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ isInProgress: false, lastSyncTime: 0 });

  // Banner notification state for localization changes
  const [banner, setBanner] = useState<{ message: string; language: string; timezone: string; currency: string } | null>(null);
  const [previousSettings, setPreviousSettings] = useState<{ language: string; timezone: string; currency: string } | null>(null);

  // Initialize local auth system on component mount
  useEffect(() => {
    resetAuthState();
    initializeLocalAuth();
  }, []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('generalSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.companyInfo) {
            setCompanyInfo(prev => ({
              ...prev,
              ...settings.companyInfo
            }));
          }
        }

        // Load company logo from assets
        const savedAssets = localStorage.getItem('companyAssets');
        if (savedAssets) {
          const assets = JSON.parse(savedAssets);
          // Check for logo in different possible formats
          if (assets.Logo && assets.Logo.dataUrl) {
            setCompanyLogo(assets.Logo.dataUrl);
          } else if (assets.logo) {
            setCompanyLogo(assets.logo);
          }
        }
        
        // Update sync status
        setSyncStatus(workingCompanySync.getSyncStatus());
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
    
    // Set up periodic sync status updates
    const statusInterval = setInterval(() => {
      setSyncStatus(workingCompanySync.getSyncStatus());
    }, 1000);

    // Listen for sync events
    const handleSyncSuccess = () => {
      toast.success('Company information synchronized successfully!');
      setSyncStatus(workingCompanySync.getSyncStatus());
    };

    const handleSyncError = () => {
      toast.error('Failed to synchronize company information');
    };

    // Listen for logo updates from Company page
    const handleLogoUpdate = (event: any) => {
      if (event.detail && event.detail.logo) {
        setCompanyLogo(event.detail.logo);
        toast.success('Company logo synchronized from Company page!');
      }
    };

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'companyAssets' && event.newValue) {
        try {
          const assets = JSON.parse(event.newValue);
          if (assets.Logo && assets.Logo.dataUrl) {
            setCompanyLogo(assets.Logo.dataUrl);
            toast.success('Company logo synchronized!');
          }
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('syncSuccess', handleSyncSuccess);
    window.addEventListener('syncError', handleSyncError);
    window.addEventListener('companyLogoUpdated', handleLogoUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('syncSuccess', handleSyncSuccess);
      window.removeEventListener('syncError', handleSyncError);
      window.removeEventListener('companyLogoUpdated', handleLogoUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-save and sync when company info changes
  useEffect(() => {
    const saveSettings = () => {
      try {
        const settings = {
          companyInfo,
          localization: {}, // Keep existing structure
          displaySettings: {} // Keep existing structure
        };
        localStorage.setItem('generalSettings', JSON.stringify(settings));
        localStorage.setItem('generalSettings_timestamp', Date.now().toString());
        
        // Trigger sync to company page
        setTimeout(() => {
          workingCompanySync.syncSettingsToCompany();
        }, 500);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [companyInfo]);

  // Function to handle authentication with the modal
  const handleAuthenticate = async (email: string, password: string): Promise<boolean> => {
    try {
      const hasPermission = await verifyAdminPermission(email, password);
      
      if (hasPermission) {
        setIsEditing(true);
        setIsAuthModalOpen(false);
        toast.success('Authentication successful. You can now edit company settings.');
        return true;
      } else {
        toast.error('Authentication failed. You do not have admin privileges.');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An error occurred during authentication.');
      return false;
    }
  };
  
  // Start edit mode only after authentication
  const handleStartEdit = () => {
    setIsAuthModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const settings = {
        companyInfo,
        localization: {}, // Keep existing structure
        displaySettings: {} // Keep existing structure
      };
      localStorage.setItem('generalSettings', JSON.stringify(settings));
      localStorage.setItem('generalSettings_timestamp', Date.now().toString());
      
      // Save company logo if changed
      if (companyLogo) {
        // Load existing assets to preserve other assets
        const existingAssets = localStorage.getItem('companyAssets');
        let assets = existingAssets ? JSON.parse(existingAssets) : {};
        
        // Update logo in the format expected by Company page
        assets.Logo = {
          name: 'company-logo.png',
          dataUrl: companyLogo,
          lastModified: Date.now(),
          width: 200,
          height: 200,
          aspectRatio: 1
        };
        
        localStorage.setItem('companyAssets', JSON.stringify(assets));
      }
      
      // Trigger sync to company page
      setTimeout(() => {
        workingCompanySync.syncSettingsToCompany();
      }, 500);
      
      setIsEditing(false);
      toast.success('Company settings saved and synchronized successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleCancel = () => {
    // Reload settings from localStorage to revert changes
    const savedSettings = localStorage.getItem('generalSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.companyInfo) {
        setCompanyInfo(settings.companyInfo);
      }
    }
    setIsEditing(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCompanyLogo(result);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSync = () => {
    workingCompanySync.manualSync();
    setSyncStatus(workingCompanySync.getSyncStatus());
  };

  // Localization change handlers
  const onLanguageChange = (language: string) => {
    setPreviousSettings({ 
      language: currentLanguage, 
      timezone: settings.timezone, 
      currency: settings.currency 
    });
    changeLanguage(language as any);
    showBanner(language, settings.timezone, settings.currency);
  };

  const onTimezoneChange = (timezone: string) => {
    setPreviousSettings({ 
      language: currentLanguage, 
      timezone: settings.timezone, 
      currency: settings.currency 
    });
    updateSettings({ timezone });
    showBanner(currentLanguage, timezone, settings.currency);
  };

  const onCurrencyChange = (currency: string) => {
    setPreviousSettings({ 
      language: currentLanguage, 
      timezone: settings.timezone, 
      currency: settings.currency 
    });
    updateSettings({ currency });
    console.log("Localization: currency format changed — no FX conversion performed.");
    showBanner(currentLanguage, settings.timezone, currency);
  };

  const showBanner = (language: string, timezone: string, currency: string) => {
    const message = `Language: ${getLanguageDisplayName(language)} | Time zone: ${timezone} | Currency: ${currency} — applied`;
    setBanner({ message, language, timezone, currency });
    
    // Auto-hide banner after 5 seconds
    setTimeout(() => {
      setBanner(null);
    }, 5000);
  };

  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      'en': 'English',
      'af': 'Afrikaans', 
      'zu': 'Zulu',
      'xh': 'Xhosa'
    };
    return names[lang] || lang;
  };

  const handleUndo = () => {
    if (previousSettings) {
      changeLanguage(previousSettings.language as any);
      updateSettings({ 
        timezone: previousSettings.timezone, 
        currency: previousSettings.currency 
      });
      setBanner(null);
      setPreviousSettings(null);
      toast.success('Localization settings reverted');
    }
  };

  const handleManualRefresh = () => {
    // Force refresh the localization by re-initializing
    window.location.reload();
  };

  // Localization settings are now managed by the localization service
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    dashboardLayout: 'cards',
    defaultView: 'grid',
    listDensity: 'comfortable',
    navigationStyle: 'sidebar'
  });

  useEffect(() => {
    // keep local state in sync with global theme
    if (theme && (theme === 'light' || theme === 'dark' || theme === 'system')) {
      setDisplaySettings((prev) => ({ ...prev, theme: theme === 'system' ? 'auto' : theme }));
    }
  }, [theme]);

  const handleThemeChange = (value: string) => {
    setDisplaySettings({ ...displaySettings, theme: value });
    const mapped = value === 'auto' ? 'system' : value; // next-themes expects 'system'
    setTheme(mapped as 'light' | 'dark' | 'system');
    try {
      const saved = localStorage.getItem('generalSettings');
      const existing = saved ? JSON.parse(saved) : {};
      const updated = {
        ...existing,
        displaySettings: {
          ...(existing.displaySettings || {}),
          theme: value,
        },
      };
      localStorage.setItem('generalSettings', JSON.stringify(updated));
      localStorage.setItem('generalSettings_timestamp', Date.now().toString());
    } catch (e) {
      console.error('Failed to persist theme setting', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-sf-pro">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              {t('settings.companyInformation')}
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleStartEdit} variant="outline" size="sm">
                  <ShieldAlert className="h-4 w-4 mr-1" />
                  Edit (Admin)
                </Button>
              )}
              <Button
                onClick={handleManualSync}
                disabled={syncStatus.isInProgress}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                {syncStatus.isInProgress ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Sync</span>
              </Button>
            </div>
          </CardTitle>
          {syncStatus.lastSyncTime > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Last synced: {new Date(syncStatus.lastSyncTime).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">{t('settings.companyName')}</Label>
              <Input
                id="companyName"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="businessType">{t('settings.businessType')}</Label>
              <Input
                id="businessType"
                value={companyInfo.businessType}
                onChange={(e) => setCompanyInfo({...companyInfo, businessType: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="industry">{t('settings.industry')}</Label>
              <Input
                id="industry"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="registrationNumber">{t('settings.registrationNumber')}</Label>
              <Input
                id="registrationNumber"
                value={companyInfo.registrationNumber}
                onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., 2023/123456/07"
              />
            </div>
            <div>
              <Label htmlFor="vatNumber">{t('settings.vatNumber')}</Label>
              <Input
                id="vatNumber"
                value={companyInfo.vatNumber}
                onChange={(e) => setCompanyInfo({...companyInfo, vatNumber: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., 4123456789"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('settings.companyLogo')}</label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-mokm-orange-200 to-mokm-purple-200 rounded-lg flex items-center justify-center overflow-hidden">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-mokm-purple-600" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label htmlFor="physicalAddress">{t('settings.physicalAddress')}</Label>
              <Input
                id="physicalAddress"
                value={companyInfo.physicalAddress}
                onChange={(e) => setCompanyInfo({...companyInfo, physicalAddress: e.target.value})}
                disabled={!isEditing}
                placeholder="Full physical address with postal code"
              />
            </div>
            <div>
              <Label htmlFor="mailingAddress">{t('settings.mailingAddress')}</Label>
              <Input
                id="mailingAddress"
                value={companyInfo.mailingAddress}
                onChange={(e) => setCompanyInfo({...companyInfo, mailingAddress: e.target.value})}
                disabled={!isEditing}
                placeholder="Mailing address if different from physical"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Globe className="h-5 w-5 mr-2" />
            {t('settings.localization')}
          </CardTitle>
        </CardHeader>
        {banner && (
          <div className="mx-6 mt-2 mb-0 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 flex items-center justify-between">
            <span>{banner.message}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleUndo}>Undo</Button>
              <Button size="sm" variant="outline" onClick={handleManualRefresh}>Refresh</Button>
            </div>
          </div>
        )}
        <CardContent className="space-y-4">
          {/* Current Timezone Display */}
          <div className="bg-slate-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-700">Current Time</h4>
                <p className="text-sm text-slate-500">Live time in your selected timezone</p>
                <p className="text-xs text-slate-400 mt-1">Changes to timezone will update all date/time displays instantly</p>
              </div>
              <div className="text-right">
                <TimezoneDisplay format="full" className="mb-1" />
                <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                  🌍 Timezone: {settings.timezone || 'UTC'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">{t('settings.defaultLanguage')}</Label>
              <select
                id="language"
                className="w-full p-2 border rounded-lg"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">{t('settings.timezone')}</Label>
              <select
                id="timezone"
                className="w-full p-2 border rounded-lg"
                value={settings.timezone}
                onChange={(e) => onTimezoneChange(e.target.value)}
              >
                <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <Label htmlFor="currency">{t('settings.currency')}</Label>
              <select
                id="currency"
                className="w-full p-2 border rounded-lg"
                value={settings.currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
              >
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
              <div className="mt-2 text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                💰 Current: {getCurrencySymbol()} {getCurrencyDisplayName()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <Monitor className="h-5 w-5 mr-2" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                className="w-full p-2 border rounded-lg"
                value={displaySettings.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <select
                id="fontSize"
                className="w-full p-2 border rounded-lg"
                value={displaySettings.fontSize}
                onChange={(e) => setDisplaySettings({...displaySettings, fontSize: e.target.value})}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Admin Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
      />
    </div>
  );
};

export default GeneralSettingsTab;
