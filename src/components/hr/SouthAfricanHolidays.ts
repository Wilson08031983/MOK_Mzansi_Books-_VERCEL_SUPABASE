// South African Public Holidays for 2025
// Based on the Public Holidays Act, 1994 (Act No. 36 of 1994)

export interface PublicHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  isFixed: boolean; // true for fixed dates, false for calculated dates
}

// Fixed public holidays for South Africa
const fixedHolidays2025: PublicHoliday[] = [
  { date: '2025-01-01', name: 'New Year\'s Day', isFixed: true },
  { date: '2025-03-21', name: 'Human Rights Day', isFixed: true },
  { date: '2025-04-27', name: 'Freedom Day', isFixed: true },
  { date: '2025-05-01', name: 'Workers\' Day', isFixed: true },
  { date: '2025-06-16', name: 'Youth Day', isFixed: true },
  { date: '2025-08-09', name: 'National Women\'s Day', isFixed: true },
  { date: '2025-09-24', name: 'Heritage Day', isFixed: true },
  { date: '2025-12-16', name: 'Day of Reconciliation', isFixed: true },
  { date: '2025-12-25', name: 'Christmas Day', isFixed: true },
  { date: '2025-12-26', name: 'Day of Goodwill', isFixed: true }
];

// Calculate Easter-based holidays for 2025
function calculateEasterDate(year: number): Date {
  // Using the algorithm for calculating Easter Sunday
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Calculate variable holidays for 2025
function getVariableHolidays2025(): PublicHoliday[] {
  const easter = calculateEasterDate(2025);
  
  // Good Friday (2 days before Easter)
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  
  // Family Day (Monday after Easter)
  const familyDay = new Date(easter);
  familyDay.setDate(easter.getDate() + 1);
  
  return [
    { date: formatDate(goodFriday), name: 'Good Friday', isFixed: false },
    { date: formatDate(familyDay), name: 'Family Day', isFixed: false }
  ];
}

// Get all South African public holidays for 2025
export function getSouthAfricanHolidays2025(): PublicHoliday[] {
  return [...fixedHolidays2025, ...getVariableHolidays2025()]
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Check if a given date is a South African public holiday
export function isPublicHoliday(date: string): boolean {
  const holidays = getSouthAfricanHolidays2025();
  return holidays.some(holiday => holiday.date === date);
}

// Get the name of the public holiday for a given date
export function getPublicHolidayName(date: string): string | null {
  const holidays = getSouthAfricanHolidays2025();
  const holiday = holidays.find(holiday => holiday.date === date);
  return holiday ? holiday.name : null;
}

// Check if a date falls on a weekend (Saturday or Sunday)
export function isWeekend(date: string): boolean {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
}

// Get the day of the week for a given date
export function getDayOfWeek(date: string): number {
  const dateObj = new Date(date + 'T00:00:00');
  return dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

// Check if a date is a Sunday
export function isSunday(date: string): boolean {
  return getDayOfWeek(date) === 0;
}

// Check if a date is a Saturday
export function isSaturday(date: string): boolean {
  return getDayOfWeek(date) === 6;
}