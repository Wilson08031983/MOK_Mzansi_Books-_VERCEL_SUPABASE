/**
 * Validation Utilities
 * 
 * This module provides utility functions for validating various types of data,
 * including email addresses, phone numbers, VAT numbers, and more.
 */

/**
 * Validate an email address
 * @param email The email address to validate
 * @returns True if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a South African phone number
 * @param phone The phone number to validate
 * @returns True if the phone number is valid
 */
export const isValidSAPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check if it's a valid SA phone number format
  // Formats: +27xxxxxxxxx, 0xxxxxxxxx (10 digits after prefix)
  const phoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate a South African VAT number
 * @param vatNumber The VAT number to validate
 * @returns True if the VAT number is valid
 */
export const isValidVATNumber = (vatNumber: string): boolean => {
  if (!vatNumber) return false;
  
  // Remove spaces
  const cleanVAT = vatNumber.replace(/\s/g, '');
  
  // SA VAT numbers are 10 digits starting with 4
  const vatRegex = /^4[0-9]{9}$/;
  return vatRegex.test(cleanVAT);
};

/**
 * Validate a South African company registration number
 * @param regNumber The registration number to validate
 * @returns True if the registration number is valid
 */
export const isValidCompanyRegNumber = (regNumber: string): boolean => {
  if (!regNumber) return false;
  
  // Remove spaces, slashes, and dashes
  const cleanReg = regNumber.replace(/[\s\/-]/g, '');
  
  // Check for common SA company registration formats
  // YYYY/NNNNNN/NN or NNNNNNNNNN
  const regRegex = /^((19|20)\d{2}\d{6}\d{2}|\d{10})$/;
  return regRegex.test(cleanReg);
};

/**
 * Validate a URL
 * @param url The URL to validate
 * @returns True if the URL is valid
 */
export const isValidURL = (url: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a positive number
 * @param value The value to validate
 * @returns True if the value is a positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate a non-negative number (zero or positive)
 * @param value The value to validate
 * @returns True if the value is a non-negative number
 */
export const isNonNegativeNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate a percentage (0-100)
 * @param value The value to validate
 * @returns True if the value is a valid percentage
 */
export const isValidPercentage = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

/**
 * Validate required fields in an object
 * @param obj The object to validate
 * @param requiredFields Array of required field names
 * @returns Object with isValid flag and array of missing field names
 */
export const validateRequiredFields = (
  obj: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  if (!obj || typeof obj !== 'object') {
    return { isValid: false, missingFields: requiredFields };
  }
  
  const missingFields = requiredFields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Format a phone number for display
 * @param phone The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on SA phone number patterns
  if (digits.startsWith('27') && digits.length === 11) {
    // +27 format
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    // 0xx format
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  
  // Return original if no pattern matches
  return phone;
};
