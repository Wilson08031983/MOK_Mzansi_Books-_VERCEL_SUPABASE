import { translations } from '../locales/translations';

export type SupportedLanguage = 'en' | 'af' | 'zu' | 'xh';

export interface LocalizationSettings {
  language: SupportedLanguage;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  currency: string;
  firstDayOfWeek: string;
  numberFormat: string;
  measurementUnits: string;
}

class LocalizationService {
  private currentLanguage: SupportedLanguage = 'en';
  private settings: LocalizationSettings = {
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    firstDayOfWeek: 'Monday',
    numberFormat: '1,234.56',
    measurementUnits: 'metric'
  };

  private listeners: ((language: SupportedLanguage, settings: LocalizationSettings) => void)[] = [];

  constructor() {
    this.loadSettings();
    this.setupStorageListener();
  }

  /**
   * Load localization settings from localStorage
   */
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('app.settings.localization');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsed };
        this.currentLanguage = this.settings.language;
      }
    } catch (error) {
      console.error('Error loading localization settings:', error);
    }
  }

  /**
   * Save localization settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('app.settings.localization', JSON.stringify(this.settings));
      // Dispatch storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'app.settings.localization',
        newValue: JSON.stringify(this.settings),
        storageArea: localStorage
      }));
      
      // Log localization change as required
      console.log({
        event: "localization.change",
        language: this.currentLanguage,
        timezone: this.settings.timezone,
        currency: this.settings.currency,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving localization settings:', error);
    }
  }

  /**
   * Setup storage listener for cross-tab synchronization
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'app.settings.localization' && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          this.settings = { ...this.settings, ...newSettings };
          this.currentLanguage = this.settings.language;
          this.notifyListeners();
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    });
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get current localization settings
   */
  getSettings(): LocalizationSettings {
    return { ...this.settings };
  }

  /**
   * Set language and update settings
   */
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    this.settings.language = language;
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update localization settings
   */
  updateSettings(newSettings: Partial<LocalizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.language) {
      this.currentLanguage = newSettings.language;
    }
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Get translated text for current language
   */
  t(key: string, params?: Record<string, string | number>, context?: { page?: string, elementId?: string }): string {
    const keys = key.split('.');
    let translation: any = translations[this.currentLanguage];
    let foundInCurrentLanguage = true;

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        foundInCurrentLanguage = false;
        break;
      }
    }

    // If translation not found in current language, fallback to English
    if (!foundInCurrentLanguage || typeof translation !== 'string') {
      translation = translations.en;
      for (const fallbackKey of keys) {
        if (translation && typeof translation === 'object' && fallbackKey in translation) {
          translation = translation[fallbackKey];
        } else {
          // Log missing translation with context as required
          console.warn('Missing translation key:', {
            key,
            page: context?.page || 'unknown',
            elementId: context?.elementId || 'unknown',
            language: this.currentLanguage,
            fallbackUsed: 'none'
          });
          return key; // Return key if no translation found even in English
        }
      }
      
      // Log that fallback was used
      if (foundInCurrentLanguage === false && typeof translation === 'string') {
        console.warn('Missing translation key:', {
          key,
          page: context?.page || 'unknown', 
          elementId: context?.elementId || 'unknown',
          language: this.currentLanguage,
          fallbackUsed: 'english'
        });
      }
    }

    if (typeof translation !== 'string') {
      console.warn('Missing translation key:', {
        key,
        page: context?.page || 'unknown',
        elementId: context?.elementId || 'unknown', 
        language: this.currentLanguage,
        fallbackUsed: 'none',
        error: 'Translation is not a string'
      });
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return translation;
  }

  /**
   * Subscribe to language changes
   */
  subscribe(listener: (language: SupportedLanguage, settings: LocalizationSettings) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of language/settings change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentLanguage, this.settings);
      } catch (error) {
        console.error('Error in localization listener:', error);
      }
    });
  }

  /**
   * Format date according to current settings with timezone support
   */
  formatDate(date: Date): string {
    const { dateFormat, timezone } = this.settings;
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };

      switch (dateFormat) {
        case 'DD/MM/YYYY':
          return new Intl.DateTimeFormat('en-GB', options).format(date);
        case 'MM/DD/YYYY':
          return new Intl.DateTimeFormat('en-US', options).format(date);
        case 'YYYY-MM-DD':
          // For ISO format, convert to timezone first
          const isoOptions = { timeZone: timezone };
          const parts = new Intl.DateTimeFormat('en-CA', isoOptions).format(date);
          return parts; // en-CA gives YYYY-MM-DD format
        default:
          return new Intl.DateTimeFormat('en-GB', options).format(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * Format time according to current settings with timezone support
   */
  formatTime(date: Date): string {
    const { timeFormat, timezone } = this.settings;
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: timeFormat === '12h'
      };

      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return date.toLocaleTimeString();
    }
  }

  /**
   * Format date and time together with timezone support
   */
  formatDateTime(date: Date): string {
    const { timezone } = this.settings;
    
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: this.settings.timeFormat === '12h'
      };

      return new Intl.DateTimeFormat('en-GB', options).format(date);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return date.toLocaleString();
    }
  }

  /**
   * Get current time in the selected timezone
   */
  getCurrentTime(): Date {
    return new Date();
  }

  /**
   * Get timezone display name
   */
  getTimezoneDisplayName(): string {
    const { timezone } = this.settings;
    
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'long'
      });
      
      const parts = formatter.formatToParts(now);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName');
      return timeZoneName?.value || timezone;
    } catch (error) {
      console.error('Error getting timezone display name:', error);
      return timezone;
    }
  }

  /**
   * Convert date to specific timezone
   */
  convertToTimezone(date: Date, targetTimezone?: string): Date {
    const timezone = targetTimezone || this.settings.timezone;
    
    try {
      // Get the time in the target timezone
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utc);
      
      return targetTime;
    } catch (error) {
      console.error('Error converting timezone:', error);
      return date;
    }
  }

  /**
   * Format currency according to current settings
   */
  formatCurrency(amount: number): string {
    const { currency, language } = this.settings;
    
    try {
      // Map currency to appropriate locale for better formatting
      const localeMap: Record<string, string> = {
        'ZAR': 'en-ZA',
        'USD': 'en-US', 
        'EUR': 'de-DE',
        'GBP': 'en-GB'
      };
      
      const locale = localeMap[currency] || 'en-US';
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Get currency symbol for current settings
   */
  getCurrencySymbol(): string {
    const { currency } = this.settings;
    
    const symbolMap: Record<string, string> = {
      'ZAR': 'R',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    return symbolMap[currency] || currency;
  }

  /**
   * Get currency display name
   */
  getCurrencyDisplayName(): string {
    const { currency } = this.settings;
    
    const nameMap: Record<string, string> = {
      'ZAR': 'South African Rand',
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound'
    };
    
    return nameMap[currency] || currency;
  }

  /**
   * Format number according to current settings
   */
  formatNumber(number: number): string {
    const { numberFormat } = this.settings;
    
    try {
      if (numberFormat === '1,234.56') {
        return new Intl.NumberFormat('en-US').format(number);
      } else if (numberFormat === '1 234,56') {
        return new Intl.NumberFormat('fr-FR').format(number);
      } else {
        return new Intl.NumberFormat().format(number);
      }
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }
}

// Create and export singleton instance
export const localizationService = new LocalizationService();
