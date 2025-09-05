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

/**
 * Africa/Johannesburg timezone helpers (no DST in ZA).
 */
const ZA_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2, no DST

/**
 * Check if a date is invalid or a sentinel far-future date (e.g., >= 2099)
 */
export const isSentinelDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return true;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return true;
  const year = d.getUTCFullYear();
  return year >= 2099;
};

/**
 * Compute the UTC timestamp corresponding to 23:59:59.999 of the same calendar day
 * in Africa/Johannesburg for a given date/time.
 *
 * Implementation detail:
 * - Shift the instant by +02:00 to read ZA calendar components via UTC getters
 * - Build the local end-of-day at 23:59:59.999 using those components
 * - Convert back to UTC by subtracting the fixed offset (02:00)
 */
export const endOfDayZAToUTC = (date: Date | string): Date => {
  const dt = typeof date === 'string' ? new Date(date) : date;
  const shifted = new Date(dt.getTime() + ZA_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth(); // 0-indexed
  const d = shifted.getUTCDate();
  const endLocalMs = Date.UTC(y, m, d, 23, 59, 59, 999);
  return new Date(endLocalMs - ZA_OFFSET_MS);
};

/**
 * Compute remaining whole days until end-of-day in ZA timezone.
 * Uses Math.ceil to count partial days as a full day per product requirement.
 * Returns null when the end date is invalid or sentinel.
 */
export const daysRemainingZA = (
  endDate: Date | string | null | undefined,
  now: Date = new Date()
): number | null => {
  if (!endDate) return null;
  if (isSentinelDate(endDate)) return null;
  const end = endOfDayZAToUTC(endDate);
  const diffMs = end.getTime() - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.ceil(diffMs / dayMs);
};

/**
 * Whether to show the "days left" line per requirements.
 * True only when we have a non-sentinel endDate and daysRemaining >= 1.
 */
export const shouldShowDaysLeft = (
  endDate: Date | string | null | undefined,
  now: Date = new Date()
): boolean => {
  const days = daysRemainingZA(endDate, now);
  return typeof days === 'number' && days >= 1;
};
