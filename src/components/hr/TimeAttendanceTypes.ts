// Shared types for Time & Attendance components

// Overtime rates according to South African labor laws
export enum OvertimeRateType {
  Normal = "Normal", // 1.5x normal wage
  Sunday = "Sunday", // 2x normal wage
  PublicHoliday = "PublicHoliday" // 2x normal wage
}

// Time entry status
export enum TimeEntryStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}

// Time entry type
export enum TimeEntryType {
  Regular = "regular",
  Overtime = "overtime",
  Weekend = "weekend",
  PublicHoliday = "publicHoliday"
}

// Time entry interface
export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  employeePosition: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM format
  clockOut: string; // HH:MM format
  totalHours: number; // Calculated total hours
  regularHours: number; // Regular working hours
  overtimeHours: number; // Overtime hours
  overtimeRate: OvertimeRateType; // Type of overtime rate
  isNightShift: boolean; // Whether this is a night shift (18:00-06:00)
  nightShiftHours: number; // Hours worked during night shift
  nightShiftAllowancePercentage: number; // Night shift allowance percentage
  status: TimeEntryStatus;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  type: TimeEntryType;
  isLeave: boolean; // Whether this entry is a leave day
  leaveType?: string; // Type of leave if isLeave is true
}

// Weekly timesheet interface
export interface WeeklyTimesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string; // YYYY-MM-DD of the Monday
  weekEndDate: string; // YYYY-MM-DD of the Sunday
  timeEntries: TimeEntry[];
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalNightShiftHours: number;
  status: TimeEntryStatus;
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  notes?: string;
}

// Employee attendance summary
export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  currentMonthRegularHours: number;
  currentMonthOvertimeHours: number;
  currentMonthNightShiftHours: number;
  currentWeekOvertimeHours: number; // For tracking weekly overtime limit (10 hours)
  currentDayOvertimeHours: number; // For tracking daily overtime limit (3 hours)
  attendanceRate: number; // Percentage of scheduled days attended
  punctualityRate: number; // Percentage of on-time arrivals
  leaveHoursTaken: number; // Hours taken as leave
  isExemptFromOvertimeRules: boolean; // For employees earning above threshold
}

// Helper function to check if an employee is exempt from overtime rules
export const isExemptFromOvertimeRules = (annualSalary: number): boolean => {
  // Current threshold is R241,110.59 per annum according to CCMA
  const overtimeExemptionThreshold = 241110.59;
  return annualSalary > overtimeExemptionThreshold;
};

// Helper function to calculate overtime pay
export const calculateOvertimePay = (
  hourlyRate: number,
  overtimeHours: number,
  overtimeRateType: OvertimeRateType
): number => {
  let multiplier = 1.5; // Default for normal overtime
  
  if (overtimeRateType === OvertimeRateType.Sunday || 
      overtimeRateType === OvertimeRateType.PublicHoliday) {
    multiplier = 2.0; // Double pay for Sundays and public holidays
  }
  
  return hourlyRate * multiplier * overtimeHours;
};

// Helper function to calculate night shift allowance
export const calculateNightShiftAllowance = (
  hourlyRate: number,
  nightShiftHours: number,
  allowancePercentage: number = 10 // Default 10%
): number => {
  return hourlyRate * (allowancePercentage / 100) * nightShiftHours;
};

// Helper function to check if a time is within night shift hours (18:00-06:00)
export const isNightShiftTime = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0], 10);
  return hour >= 18 || hour < 6;
};

// Helper function to calculate night shift hours in a time entry
export const calculateNightShiftHours = (clockIn: string, clockOut: string): number => {
  const inHour = parseInt(clockIn.split(':')[0], 10);
  const inMinute = parseInt(clockIn.split(':')[1], 10);
  const outHour = parseInt(clockOut.split(':')[0], 10);
  const outMinute = parseInt(clockOut.split(':')[1], 10);
  
  // Convert to 24-hour time points for calculation
  const inTimePoint = inHour + inMinute / 60;
  let outTimePoint = outHour + outMinute / 60;
  
  // Handle overnight shifts
  if (outTimePoint < inTimePoint) {
    outTimePoint += 24;
  }
  
  let nightHours = 0;
  
  // Check night hours from start time
  if (inTimePoint >= 18) {
    // Start time is after 18:00
    nightHours += Math.min(outTimePoint, 24) - inTimePoint;
  } else if (inTimePoint < 6) {
    // Start time is before 06:00
    nightHours += Math.min(outTimePoint, 6) - inTimePoint;
  }
  
  // Check if end time extends into night hours
  if (outTimePoint > 24) {
    // End time is after midnight
    nightHours += Math.min(outTimePoint - 24, 6);
  } else if (outTimePoint >= 18) {
    // End time is after 18:00
    nightHours += outTimePoint - Math.max(inTimePoint, 18);
  }
  
  return Math.max(0, nightHours);
};