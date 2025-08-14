
import { localizationService } from '../services/localizationService';

export const formatCurrency = (value: number | string, currency?: string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    const settings = localizationService.getSettings();
    const symbol = localizationService.getCurrencySymbol();
    return `${symbol} 0.00`;
  }
  
  // Use localization service for consistent formatting
  return localizationService.formatCurrency(numericValue);
};

export const formatNumber = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0';
  }
  
  // Use localization service for consistent formatting
  return localizationService.formatNumber(numericValue);
};

export const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Use localization service for timezone-aware formatting
    if (format === 'short' || format === 'medium') {
      return localizationService.formatDate(date);
    }
    
    // For long and full formats, enhance with localized options
    const settings = localizationService.getSettings();
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: settings.timezone,
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    if (format === 'full') {
      options.weekday = 'long';
    }
    
    // Map currency to appropriate locale for better formatting
    const localeMap: Record<string, string> = {
      'ZAR': 'en-ZA',
      'USD': 'en-US', 
      'EUR': 'de-DE',
      'GBP': 'en-GB'
    };
    
    const locale = localeMap[settings.currency] || 'en-US';
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback to localization service
    try {
      return localizationService.formatDate(new Date(dateString));
    } catch (fallbackError) {
      console.error('Fallback date formatting failed:', fallbackError);
      return dateString;
    }
  }
};
