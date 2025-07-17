// Automated calculations for South African labor law compliance
// Based on the Basic Conditions of Employment Act (BCEA) and related regulations

import { OvertimeRateType, TimeEntryType } from './TimeAttendanceTypes';
import { 
  isPublicHoliday, 
  isSunday, 
  isSaturday, 
  getPublicHolidayName 
} from './SouthAfricanHolidays';

export interface TimeCalculationResult {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  overtimeRate: OvertimeRateType;
  entryType: TimeEntryType;
  isNightShift: boolean;
  breakdown: {
    regularPay: number;
    overtimePay: number;
    nightShiftAllowance: number;
    totalPay: number;
  };
  warnings: string[];
}

export interface CalculationInput {
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut: string; // HH:MM
  hourlyRate?: number; // Optional for pay calculations
  nightShiftAllowancePercentage?: number; // Default 10%
}

// Standard working hours per day (8 hours)
const STANDARD_WORKING_HOURS = 8;

// Night shift hours definition (18:00 to 06:00)
const NIGHT_SHIFT_START = 18;
const NIGHT_SHIFT_END = 6;

// Calculate total hours worked
function calculateTotalHours(clockIn: string, clockOut: string): number {
  const [inHour, inMinute] = clockIn.split(':').map(Number);
  const [outHour, outMinute] = clockOut.split(':').map(Number);
  
  let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  
  // Handle overnight shifts
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Add 24 hours in minutes
  }
  
  return totalMinutes / 60;
}

// Calculate night shift hours (18:00-06:00)
function calculateNightShiftHours(clockIn: string, clockOut: string): number {
  const [inHour, inMinute] = clockIn.split(':').map(Number);
  const [outHour, outMinute] = clockOut.split(':').map(Number);
  
  const inTimeDecimal = inHour + inMinute / 60;
  let outTimeDecimal = outHour + outMinute / 60;
  
  // Handle overnight shifts
  if (outTimeDecimal < inTimeDecimal) {
    outTimeDecimal += 24;
  }
  
  let nightHours = 0;
  
  // Case 1: Shift starts during night hours (18:00-24:00)
  if (inTimeDecimal >= NIGHT_SHIFT_START) {
    const endOfNightShift = Math.min(outTimeDecimal, 24);
    nightHours += endOfNightShift - inTimeDecimal;
  }
  
  // Case 2: Shift starts before 06:00 (early morning night hours)
  if (inTimeDecimal < NIGHT_SHIFT_END) {
    const endOfEarlyNight = Math.min(outTimeDecimal, NIGHT_SHIFT_END);
    nightHours += endOfEarlyNight - inTimeDecimal;
  }
  
  // Case 3: Overnight shift extends into next day's night hours (00:00-06:00)
  if (outTimeDecimal > 24) {
    const nextDayEnd = Math.min(outTimeDecimal - 24, NIGHT_SHIFT_END);
    nightHours += Math.max(0, nextDayEnd);
  }
  
  // Case 4: Shift ends during night hours (18:00-24:00) but starts earlier
  if (inTimeDecimal < NIGHT_SHIFT_START && outTimeDecimal >= NIGHT_SHIFT_START && outTimeDecimal <= 24) {
    nightHours += outTimeDecimal - NIGHT_SHIFT_START;
  }
  
  return Math.max(0, nightHours);
}

// Determine overtime rate based on date and day of week
function determineOvertimeRate(date: string): OvertimeRateType {
  if (isPublicHoliday(date)) {
    return OvertimeRateType.PublicHoliday; // 2x rate
  }
  
  if (isSunday(date)) {
    return OvertimeRateType.Sunday; // 2x rate
  }
  
  return OvertimeRateType.Normal; // 1.5x rate
}

// Determine entry type based on date and hours
function determineEntryType(date: string, totalHours: number): TimeEntryType {
  if (isPublicHoliday(date)) {
    return TimeEntryType.PublicHoliday;
  }
  
  if (isSaturday(date) || isSunday(date)) {
    return TimeEntryType.Weekend;
  }
  
  if (totalHours > STANDARD_WORKING_HOURS) {
    return TimeEntryType.Overtime;
  }
  
  return TimeEntryType.Regular;
}

// Calculate pay breakdown
function calculatePayBreakdown(
  regularHours: number,
  overtimeHours: number,
  nightShiftHours: number,
  overtimeRate: OvertimeRateType,
  hourlyRate: number,
  nightShiftAllowancePercentage: number
) {
  // Regular pay
  const regularPay = regularHours * hourlyRate;
  
  // Overtime pay with appropriate multiplier
  let overtimeMultiplier = 1.5; // Default for normal overtime
  if (overtimeRate === OvertimeRateType.Sunday || overtimeRate === OvertimeRateType.PublicHoliday) {
    overtimeMultiplier = 2.0;
  }
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  
  // Night shift allowance
  const nightShiftAllowance = nightShiftHours * hourlyRate * (nightShiftAllowancePercentage / 100);
  
  // Total pay
  const totalPay = regularPay + overtimePay + nightShiftAllowance;
  
  return {
    regularPay: parseFloat(regularPay.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    nightShiftAllowance: parseFloat(nightShiftAllowance.toFixed(2)),
    totalPay: parseFloat(totalPay.toFixed(2))
  };
}

// Generate warnings based on calculations
function generateWarnings(
  date: string,
  totalHours: number,
  overtimeHours: number,
  nightShiftHours: number,
  entryType: TimeEntryType
): string[] {
  const warnings: string[] = [];
  
  // Check for excessive daily hours
  if (totalHours > 12) {
    warnings.push('Daily working hours exceed 12 hours - may violate BCEA regulations');
  }
  
  // Check for overtime on weekends
  if ((isSaturday(date) || isSunday(date)) && overtimeHours > 0) {
    warnings.push('Weekend work detected - ensure proper authorization and compensation');
  }
  
  // Check for public holiday work
  if (isPublicHoliday(date)) {
    const holidayName = getPublicHolidayName(date);
    warnings.push(`Work on public holiday (${holidayName}) - double pay rate applied`);
  }
  
  // Check for night shift hours
  if (nightShiftHours > 0) {
    warnings.push(`Night shift hours detected (${nightShiftHours.toFixed(1)}h) - allowance applied`);
  }
  
  // Check for Sunday work
  if (isSunday(date) && totalHours > 0) {
    warnings.push('Sunday work - double pay rate applied as per BCEA');
  }
  
  return warnings;
}

// Main calculation function
export function calculateTimeEntry(input: CalculationInput): TimeCalculationResult {
  const { date, clockIn, clockOut, hourlyRate = 0, nightShiftAllowancePercentage = 10 } = input;
  
  // Calculate basic hours
  const totalHours = calculateTotalHours(clockIn, clockOut);
  const nightShiftHours = calculateNightShiftHours(clockIn, clockOut);
  
  // Determine if this is a night shift (any hours between 18:00-06:00)
  const isNightShift = nightShiftHours > 0;
  
  // Calculate regular and overtime hours
  let regularHours = Math.min(totalHours, STANDARD_WORKING_HOURS);
  let overtimeHours = Math.max(0, totalHours - STANDARD_WORKING_HOURS);
  
  // Special handling for weekends and public holidays
  if (isPublicHoliday(date) || isSunday(date)) {
    // All hours on public holidays and Sundays are considered overtime (double pay)
    regularHours = 0;
    overtimeHours = totalHours;
  } else if (isSaturday(date)) {
    // Saturday work: first 8 hours at normal rate, rest at overtime rate
    regularHours = Math.min(totalHours, STANDARD_WORKING_HOURS);
    overtimeHours = Math.max(0, totalHours - STANDARD_WORKING_HOURS);
  }
  
  // Determine overtime rate and entry type
  const overtimeRate = determineOvertimeRate(date);
  const entryType = determineEntryType(date, totalHours);
  
  // Calculate pay breakdown
  const breakdown = calculatePayBreakdown(
    regularHours,
    overtimeHours,
    nightShiftHours,
    overtimeRate,
    hourlyRate,
    nightShiftAllowancePercentage
  );
  
  // Generate warnings
  const warnings = generateWarnings(date, totalHours, overtimeHours, nightShiftHours, entryType);
  
  return {
    totalHours: parseFloat(totalHours.toFixed(2)),
    regularHours: parseFloat(regularHours.toFixed(2)),
    overtimeHours: parseFloat(overtimeHours.toFixed(2)),
    nightShiftHours: parseFloat(nightShiftHours.toFixed(2)),
    overtimeRate,
    entryType,
    isNightShift,
    breakdown,
    warnings
  };
}

// Helper function to format hours for display
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

// Helper function to format currency for display
export function formatCurrency(amount: number): string {
  return `R${amount.toFixed(2)}`;
}