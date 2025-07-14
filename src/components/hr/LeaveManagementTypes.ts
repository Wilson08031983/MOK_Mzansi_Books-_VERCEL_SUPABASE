// Shared types for Leave Management components

// South African public holidays for leave calculations
export const SouthAfricanPublicHolidays2025 = [
  "2025-01-01", // New Year's Day
  "2025-03-21", // Human Rights Day
  "2025-04-18", // Good Friday
  "2025-04-21", // Family Day
  "2025-04-27", // Freedom Day
  "2025-05-01", // Workers' Day
  "2025-06-16", // Youth Day
  "2025-08-09", // National Women's Day
  "2025-09-24", // Heritage Day
  "2025-12-16", // Day of Reconciliation
  "2025-12-25", // Christmas Day
  "2025-12-26"  // Day of Goodwill
];

// Definition of public holidays for calendar display
export interface PublicHoliday {
  date: string;
  name: string;
  description?: string;
}

// Detailed public holidays with names and descriptions
export const SouthAfricanPublicHolidaysDetailed: PublicHoliday[] = [
  { date: "2025-01-01", name: "New Year's Day", description: "Beginning of the calendar year" },
  { date: "2025-03-21", name: "Human Rights Day", description: "Commemorates the Sharpeville massacre" },
  { date: "2025-04-18", name: "Good Friday", description: "Christian holiday" },
  { date: "2025-04-21", name: "Family Day", description: "Easter Monday" },
  { date: "2025-04-27", name: "Freedom Day", description: "First democratic elections in 1994" },
  { date: "2025-05-01", name: "Workers' Day", description: "International Workers' Day" },
  { date: "2025-06-16", name: "Youth Day", description: "Commemoration of Soweto Uprising" },
  { date: "2025-08-09", name: "National Women's Day", description: "Women's march to Union Buildings in 1956" },
  { date: "2025-09-24", name: "Heritage Day", description: "Celebration of South African heritage" },
  { date: "2025-12-16", name: "Day of Reconciliation", description: "Promoting reconciliation and unity" },
  { date: "2025-12-25", name: "Christmas Day", description: "Christian holiday" },
  { date: "2025-12-26", name: "Day of Goodwill", description: "Boxing Day" }
];

// Get public holiday info with additional metadata
export interface PublicHolidayInfo extends PublicHoliday {
  isToday: boolean;
  isSoon: boolean; // Within 7 days
  formattedDate: string;
  daysUntil: number;
}

// Get next upcoming public holiday
export const getNextPublicHoliday = (): PublicHolidayInfo | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Check if today is a holiday
  const todayHoliday = SouthAfricanPublicHolidaysDetailed.find(holiday => holiday.date === todayStr);
  if (todayHoliday) {
    return {
      ...todayHoliday,
      isToday: true,
      isSoon: true,
      daysUntil: 0,
      formattedDate: formatDate(new Date(todayHoliday.date))
    };
  }
  
  // Find upcoming holiday
  const upcoming = SouthAfricanPublicHolidaysDetailed.find(holiday => holiday.date > todayStr);
  
  if (upcoming) {
    const holidayDate = new Date(upcoming.date);
    const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...upcoming,
      isToday: false,
      isSoon: daysUntil <= 7,
      daysUntil,
      formattedDate: formatDate(holidayDate)
    };
  }
  
  return null;
};

// Format date as DD/MM/YYYY
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Leave types enum for consistency
export enum LeaveTypes {
  Annual = "Annual Leave",
  Sick = "Sick Leave",
  FamilyResponsibility = "Family Responsibility Leave",
  Maternity = "Maternity Leave",
  Parental = "Parental Leave",
  Bereavement = "Bereavement Leave", 
  Religious = "Religious Leave",
  Study = "Study Leave",
  Unpaid = "Unpaid Leave",
  Adoption = "Adoption Leave",
  CommissioningParental = "Commissioning Parental Leave",
  Jury = "Jury Service",
  Compensatory = "Compensatory Leave"
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  employeePosition: string;
  leaveType: LeaveTypes; // Using LeaveTypes enum for type safety
  startDate: string;
  endDate: string;
  days: number; // Working days (excluding weekends and holidays)
  calendarDays?: number; // Total calendar days including weekends/holidays
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  rejectedReason?: string;
  // Fields for handling leave requests that exceed balance
  exceedsBalance?: boolean; 
  overageAmount?: number; // Number of days exceeding balance
  isPaid?: boolean; // Whether the leave is paid or unpaid
  approvedBy?: string; // Manager/HR who approved the request
}

// Define a standard leave balance structure
export interface LeaveBalanceItem {
  total: number;
  used: number;
  remaining: number;
  accrued?: number;
  status?: 'active' | 'inactive' | 'pending';
  startDate?: string;
  endDate?: string;
}

// Define an unpaid leave balance structure
export interface UnpaidLeaveBalance {
  days: number;
  instances?: number; // Number of times unpaid leave was taken
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  
  // Standard leave types according to BCEA
  annual: LeaveBalanceItem;          // 15 working days per year (21 calendar days)
  sick: LeaveBalanceItem;            // 30 days over 3-year cycle (10 days per year)
  familyResponsibility: LeaveBalanceItem;  // 3 days per 12-month cycle
  maternity: LeaveBalanceItem;       // 4 months (unpaid)
  parental: LeaveBalanceItem;        // 10 consecutive days
  
  // Additional leave types
  adoption: LeaveBalanceItem;        // Similar to maternity leave
  commissioning: LeaveBalanceItem;   // Commissioning parental leave
  bereavement: LeaveBalanceItem;     // Usually deducted from family responsibility
  religious: LeaveBalanceItem;       // Religious observance, typically from annual leave
  study: LeaveBalanceItem;           // Study or examination leave
  unpaid: UnpaidLeaveBalance;        // Track unpaid leave days separately
  
  // Status trackers
  onMaternityLeave?: boolean;        // Whether employee is currently on maternity leave
  jobReserved?: boolean;             // Whether job is reserved during maternity leave
  
  // Leave accrual tracking
  lastLeaveAccrualDate?: string;     // Date of last leave accrual calculation
  
  // Employment information for leave accrual calculations
  employmentStartDate: string;       // YYYY-MM-DD format
  employmentLengthMonths: number;    // Number of months employed
  leaveAnniversaryDate?: string;     // Date when leave cycle renews
}

// Helper function to check if a date is a public holiday
export const isPublicHoliday = (date: string): boolean => {
  return SouthAfricanPublicHolidays2025.includes(date);
};

// Calculate business days excluding public holidays
export const calculateBusinessDaysExcludingHolidays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const currentDate = new Date(startDate);
  
  // Loop through each day
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Count only weekdays (Monday to Friday) that are not public holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isPublicHoliday(dateString)) {
      count++;
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
};

// Initialize standard leave balance for a new employee
export const initializeLeaveBalance = (
  employee: {
    id: string;
    firstName: string;
    surname: string;
    department: string;
  },
  employmentDate: string
): LeaveBalance => {
  const startDate = new Date(employmentDate);
  const today = new Date();
  const monthsEmployed = (today.getFullYear() - startDate.getFullYear()) * 12 +
                         (today.getMonth() - startDate.getMonth());
  
  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.surname}`,
    department: employee.department,
    annual: {
      total: 15, // SA standard: 15 working days per year for 5-day work week
      used: 0,
      remaining: 15,
      accrued: 0 // This will track monthly accrual of 1.25 days
    },
    sick: {
      total: 30, // SA standard: 30 days in a 3-year cycle
      used: 0,
      remaining: 30
    },
    familyResponsibility: {
      total: 3, // SA standard: 3 days per year
      used: 0,
      remaining: 3
    },
    maternity: {
      total: 0, // 4 months unpaid per BCEA
      used: 0,
      remaining: 0
    },
    parental: {
      total: 10, // 10 days per BCEA
      used: 0,
      remaining: 10
    },
    bereavement: {
      total: 0, // Typically covered under family responsibility
      used: 0,
      remaining: 0
    },
    religious: {
      total: 0, // Typically unpaid or from annual leave
      used: 0,
      remaining: 0
    },
    study: {
      total: 0, // Typically unpaid or company policy
      used: 0,
      remaining: 0
    },
    adoption: {
      total: 0,
      used: 0,
      remaining: 0
    },
    commissioning: {
      total: 0,
      used: 0,
      remaining: 0
    },
    employmentStartDate: employmentDate,
    employmentLengthMonths: monthsEmployed,
    onMaternityLeave: false,
    jobReserved: false,
    unpaid: { days: 0 },
  };
};
