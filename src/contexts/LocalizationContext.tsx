import React, { createContext, useContext, useEffect, useState } from 'react';
import { localizationService, SupportedLanguage, LocalizationSettings } from '../services/localizationService';

interface LocalizationContextType {
  currentLanguage: SupportedLanguage;
  settings: LocalizationSettings;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (language: SupportedLanguage) => void;
  updateSettings: (newSettings: Partial<LocalizationSettings>) => void;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (number: number) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    localizationService.getCurrentLanguage()
  );
  const [settings, setSettings] = useState<LocalizationSettings>(
    localizationService.getSettings()
  );

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = localizationService.subscribe((language, newSettings) => {
      setCurrentLanguage(language);
      setSettings(newSettings);
      
      // Update document language attribute for accessibility
      document.documentElement.lang = language;
      
      // Update document title with localized text
      const titleKey = 'nav.dashboard'; // Default title
      document.title = localizationService.t(titleKey) + ' - MOK Mzansi Books';
    });

    // Set initial document language
    document.documentElement.lang = currentLanguage;

    return unsubscribe;
  }, [currentLanguage]);

  const t = (key: string, params?: Record<string, string | number>) => {
    return localizationService.t(key, params);
  };

  const changeLanguage = (language: SupportedLanguage) => {
    localizationService.setLanguage(language);
  };

  const updateSettings = (newSettings: Partial<LocalizationSettings>) => {
    localizationService.updateSettings(newSettings);
  };

  const formatDate = (date: Date) => {
    return localizationService.formatDate(date);
  };

  const formatCurrency = (amount: number) => {
    return localizationService.formatCurrency(amount);
  };

  const formatNumber = (number: number) => {
    return localizationService.formatNumber(number);
  };

  const contextValue: LocalizationContextType = {
    currentLanguage,
    settings,
    t,
    changeLanguage,
    updateSettings,
    formatDate,
    formatCurrency,
    formatNumber
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationContext = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalizationContext must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationProvider;
