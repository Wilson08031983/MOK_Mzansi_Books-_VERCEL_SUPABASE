/**
 * South African Labor Service
 * 
 * This service provides functionality for managing South African labor regulations,
 * including working hours, leave entitlements, and other HR-related calculations.
 */

// Types for labor regulations
export interface WorkingHoursRegulation {
  maxWeeklyHours: number;
  maxDailyHours5Day: number;
  maxDailyHours6Day: number;
  standardHours: string[];
  overtimeRate: number;
  sundayOvertimeRate: number;
}

export interface NightShiftRegulation {
  hours: string;
  compensationOptions: string[];
  compensationRate: number;
  transportRequired: boolean;
  medicalExamRequired: boolean;
  overtimeRate: number;
}

export interface LeaveEntitlement {
  type: string;
  days: number;
  description: string;
  paid: boolean;
}

// Initialize the SA Labor service
export const initialize = (): boolean => {
  try {
    console.log('SA Labor service initialized');
    return true;
  } catch (error) {
    console.error('Error initializing SA Labor service:', error);
    return false;
  }
};

/**
 * Get day shift working hours regulations
 * @returns Working hours regulations
 */
export const getDayShiftRegulations = (): WorkingHoursRegulation => {
  return {
    maxWeeklyHours: 45,
    maxDailyHours5Day: 9,
    maxDailyHours6Day: 8,
    standardHours: ['08:00-17:00', '09:00-17:00'],
    overtimeRate: 1.5,
    sundayOvertimeRate: 2.0
  };
};

/**
 * Get night shift regulations
 * @returns Night shift regulations
 */
export const getNightShiftRegulations = (): NightShiftRegulation => {
  return {
    hours: '18:00-06:00',
    compensationOptions: ['Shift allowance (typically 10%)', 'Reduced hours'],
    compensationRate: 1.1, // 10% night shift allowance
    transportRequired: true,
    medicalExamRequired: true,
    overtimeRate: 1.5
  };
};

/**
 * Get leave entitlements
 * @returns Array of leave entitlements
 */
export const getLeaveEntitlements = (): LeaveEntitlement[] => {
  return [
    {
      type: 'Annual Leave',
      days: 21, // 15 working days for 5-day work week
      description: '21 consecutive days (15 working days for 5-day work week)',
      paid: true
    },
    {
      type: 'Sick Leave',
      days: 30,
      description: '30 days per 36-month cycle (typically 26 days for first 6 months)',
      paid: true
    },
    {
      type: 'Family Responsibility Leave',
      days: 3,
      description: '3 paid days per year',
      paid: true
    },
    {
      type: 'Maternity Leave',
      days: 120, // 4 months
      description: 'Minimum 4 months',
      paid: false // UIF pays, not employer
    },
    {
      type: 'Parental Leave',
      days: 10,
      description: 'Minimum 10 days per year',
      paid: false // UIF pays, not employer
    },
    {
      type: 'Adoption Leave',
      days: 10,
      description: 'For parents adopting a child under 2 years',
      paid: false // UIF pays, not employer
    },
    {
      type: 'Commissioning Parental Leave',
      days: 10,
      description: 'For commissioning parents in a surrogate motherhood agreement',
      paid: false // UIF pays, not employer
    },
    {
      type: 'Unpaid Leave',
      days: 0,
      description: 'At employer discretion',
      paid: false
    },
    {
      type: 'Bereavement Leave',
      days: 3,
      description: 'Usually taken from Family Responsibility Leave',
      paid: true
    },
    {
      type: 'Religious Leave',
      days: 0,
      description: 'At employer discretion or from annual leave',
      paid: false
    },
    {
      type: 'Compensatory Leave',
      days: 0,
      description: 'Time off in lieu of overtime worked',
      paid: true
    },
    {
      type: 'Jury Leave',
      days: 0,
      description: 'As required by court summons',
      paid: true
    }
  ];
};

/**
 * Calculate overtime pay
 * @param hours Number of overtime hours
 * @param hourlyRate Regular hourly rate
 * @param isSunday Whether the overtime is on a Sunday or public holiday
 * @returns Overtime pay amount
 */
export const calculateOvertimePay = (
  hours: number,
  hourlyRate: number,
  isSunday: boolean = false
): number => {
  const regulations = getDayShiftRegulations();
  const rate = isSunday ? regulations.sundayOvertimeRate : regulations.overtimeRate;
  return hours * hourlyRate * rate;
};

/**
 * Calculate night shift allowance
 * @param hours Number of night shift hours
 * @param hourlyRate Regular hourly rate
 * @returns Night shift allowance amount
 */
export const calculateNightShiftAllowance = (
  hours: number,
  hourlyRate: number
): number => {
  const regulations = getNightShiftRegulations();
  return hours * hourlyRate * (regulations.compensationRate - 1);
};

/**
 * Check if an employee is eligible for leave
 * @param employeeStartDate Date the employee started working
 * @param leaveType Type of leave
 * @returns Boolean indicating eligibility
 */
export const isEligibleForLeave = (
  employeeStartDate: Date,
  leaveType: string
): boolean => {
  const today = new Date();
  const employmentDuration = today.getTime() - employeeStartDate.getTime();
  const employmentDays = Math.floor(employmentDuration / (1000 * 60 * 60 * 24));
  
  switch (leaveType) {
    case 'Annual Leave':
      return employmentDays >= 30; // Eligible after 1 month
    case 'Sick Leave':
      return true; // Always eligible, but pro-rated
    case 'Family Responsibility Leave':
      return employmentDays >= 120; // Eligible after 4 months
    case 'Maternity Leave':
      return true; // Always eligible
    default:
      return true;
  }
};
