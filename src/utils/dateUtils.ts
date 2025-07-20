/**
 * Date Utilities
 * 
 * This module provides utility functions for date formatting and manipulation,
 * including formatting dates for display and calculating date differences.
 */

/**
 * Format a date as a string in the format DD/MM/YYYY
 * @param date The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format a date as a string in the format YYYY-MM-DD
 * @param date The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export const formatDateISO = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date with time as a string in the format DD/MM/YYYY HH:MM
 * @param date The date to format (Date object or ISO string)
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Calculate the number of days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of days between the dates
 */
export const daysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Reset hours to midnight to get full days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Add days to a date
 * @param date The date to add days to
 * @param days The number of days to add
 * @returns New date with days added
 */
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Check if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  // Reset hours to midnight for comparison
  dateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Get the current date as a string in the format DD/MM/YYYY
 * @returns Current date string
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

/**
 * Get the current date as a string in the format YYYY-MM-DD
 * @returns Current date string in ISO format
 */
export const getCurrentDateISO = (): string => {
  return formatDateISO(new Date());
};
