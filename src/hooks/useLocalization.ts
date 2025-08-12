import { useState, useEffect } from 'react';
import { localizationService, SupportedLanguage, LocalizationSettings } from '../services/localizationService';

export const useLocalization = () => {
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
    });

    return unsubscribe;
  }, []);

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

  const formatTime = (date: Date) => {
    return localizationService.formatTime(date);
  };

  const formatDateTime = (date: Date) => {
    return localizationService.formatDateTime(date);
  };

  const getCurrentTime = () => {
    return localizationService.getCurrentTime();
  };

  const getTimezoneDisplayName = () => {
    return localizationService.getTimezoneDisplayName();
  };

  const convertToTimezone = (date: Date, targetTimezone?: string) => {
    return localizationService.convertToTimezone(date, targetTimezone);
  };

  const getCurrencySymbol = () => {
    return localizationService.getCurrencySymbol();
  };

  const getCurrencyDisplayName = () => {
    return localizationService.getCurrencyDisplayName();
  };

  return {
    currentLanguage,
    settings,
    t,
    changeLanguage,
    updateSettings,
    formatDate,
    formatCurrency,
    formatNumber,
    formatTime,
    formatDateTime,
    getCurrentTime,
    getTimezoneDisplayName,
    convertToTimezone,
    getCurrencySymbol,
    getCurrencyDisplayName
  };
};
