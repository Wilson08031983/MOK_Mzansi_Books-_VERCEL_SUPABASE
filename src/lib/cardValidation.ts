// Card validation utilities for PayStack integration

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Luhn algorithm for card number validation
export const validateCardNumber = (cardNumber: string): ValidationResult => {
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, error: 'Card number must be between 13 and 19 digits' };
  }

  let sum = 0;
  let alternate = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cleanNumber.charAt(i), 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  const isValid = sum % 10 === 0;
  return {
    isValid,
    error: isValid ? undefined : 'Invalid card number'
  };
};

// Validate expiry date
export const validateExpiryDate = (month: string, year: string): ValidationResult => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);
  
  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    return { isValid: false, error: 'Invalid expiry month' };
  }
  
  if (isNaN(expYear) || expYear < currentYear) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  if (expYear === currentYear && expMonth < currentMonth) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  return { isValid: true };
};

// Validate CVV
export const validateCVV = (cvv: string, cardType?: string): ValidationResult => {
  const cleanCVV = cvv.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (cleanCVV.length < 3 || cleanCVV.length > 4) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }
  
  // American Express cards have 4-digit CVV
  if (cardType === 'amex' && cleanCVV.length !== 4) {
    return { isValid: false, error: 'American Express CVV must be 4 digits' };
  }
  
  // Most other cards have 3-digit CVV
  if (cardType !== 'amex' && cleanCVV.length !== 3) {
    return { isValid: false, error: 'CVV must be 3 digits' };
  }
  
  return { isValid: true };
};

// Validate cardholder name
export const validateCardholderName = (name: string): ValidationResult => {
  const cleanName = name.trim();
  
  if (cleanName.length < 2) {
    return { isValid: false, error: 'Cardholder name is required' };
  }
  
  if (cleanName.length > 50) {
    return { isValid: false, error: 'Cardholder name is too long' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(cleanName)) {
    return { isValid: false, error: 'Cardholder name contains invalid characters' };
  }
  
  return { isValid: true };
};

// Detect card type based on card number
export const detectCardType = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  // Visa
  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(cleanNumber)) {
    return 'amex';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(cleanNumber)) {
    return 'discover';
  }
  
  return 'unknown';
};

// Format card number with spaces
export const formatCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const cardType = detectCardType(cleanNumber);
  
  if (cardType === 'amex') {
    // American Express: 4-6-5 format
    return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  } else {
    // Most cards: 4-4-4-4 format
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
};

// Format expiry date
export const formatExpiryDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length >= 2) {
    return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
  }
  
  return cleanValue;
};

// Validate all card details
export const validateAllCardDetails = (cardDetails: CardDetails): ValidationResult => {
  const cardNumberValidation = validateCardNumber(cardDetails.cardNumber);
  if (!cardNumberValidation.isValid) {
    return cardNumberValidation;
  }
  
  const expiryValidation = validateExpiryDate(cardDetails.expiryMonth, cardDetails.expiryYear);
  if (!expiryValidation.isValid) {
    return expiryValidation;
  }
  
  const cardType = detectCardType(cardDetails.cardNumber);
  const cvvValidation = validateCVV(cardDetails.cvv, cardType);
  if (!cvvValidation.isValid) {
    return cvvValidation;
  }
  
  const nameValidation = validateCardholderName(cardDetails.cardholderName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  return { isValid: true };
};

// Sanitize card data for security
export const sanitizeCardData = (cardDetails: CardDetails): CardDetails => {
  return {
    cardNumber: cardDetails.cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, ''),
    expiryMonth: cardDetails.expiryMonth.replace(/\D/g, ''),
    expiryYear: cardDetails.expiryYear.replace(/\D/g, ''),
    cvv: cardDetails.cvv.replace(/\D/g, ''),
    cardholderName: cardDetails.cardholderName.trim().toUpperCase()
  };
};