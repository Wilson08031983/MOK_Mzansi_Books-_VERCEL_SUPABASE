
export const formatCurrency = (value: number | string, currency = 'ZAR'): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return 'R 0.00';
  }
  
  return new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency, 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(numericValue);
};

export const formatNumber = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-ZA').format(numericValue);
};

export const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: format === 'short' ? 'short' : 'long', 
      day: 'numeric' 
    };
    
    if (format === 'long' || format === 'full') {
      options.weekday = format === 'full' ? 'long' : undefined;
    }
    
    return new Intl.DateTimeFormat('en-ZA', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
