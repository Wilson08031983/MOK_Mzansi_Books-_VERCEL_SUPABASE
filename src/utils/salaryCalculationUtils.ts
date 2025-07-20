/**
 * Salary Calculation Utilities
 * Handles all calculations related to employee compensation based on hours worked.
 */

import { Employee } from '@/services/employeeService';
import { formatCurrency } from '@/components/hr/AutomatedCalculations';

export interface AttendanceData {
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  leaveHours: number;
}

export interface SalaryCalculationResult {
  baseHourlyRate: number;
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  leavePay: number;
  totalGrossSalary: number;
  // Additional breakdown fields
  formattedRegularPay: string;
  formattedOvertimePay: string;
  formattedNightShiftPay: string;
  formattedLeavePay: string;
  formattedTotalGrossSalary: string;
}

/**
 * Calculate salary breakdown based on attendance data and base salary
 * @param baseSalary - The employee's monthly base salary
 * @param attendanceData - Hours data from time & attendance
 * @returns Complete salary calculation result
 */
export const calculateSalaryFromAttendance = (
  baseSalary: number,
  attendanceData: AttendanceData
): SalaryCalculationResult => {
  // Standard month has 160 working hours (8 hours x 20 days)
  const baseHourlyRate = baseSalary / 160;
  
  // Calculate each component according to rates
  const regularPay = attendanceData.regularHours * baseHourlyRate;
  const overtimePay = attendanceData.overtimeHours * (baseHourlyRate * 1.5); // 1.5x for overtime
  const nightShiftPay = attendanceData.nightShiftHours * (baseHourlyRate * 1.25); // 1.25x for night shift
  const leavePay = attendanceData.leaveHours * baseHourlyRate; // Regular rate for leave
  
  // Calculate total gross
  const totalGrossSalary = regularPay + overtimePay + nightShiftPay + leavePay;
  
  // Format currency values
  return {
    baseHourlyRate,
    regularPay,
    overtimePay,
    nightShiftPay,
    leavePay,
    totalGrossSalary,
    // Formatted values for display
    formattedRegularPay: formatCurrency(regularPay),
    formattedOvertimePay: formatCurrency(overtimePay),
    formattedNightShiftPay: formatCurrency(nightShiftPay),
    formattedLeavePay: formatCurrency(leavePay),
    formattedTotalGrossSalary: formatCurrency(totalGrossSalary)
  };
};

/**
 * Retrieves the latest attendance data for a specific employee
 * @param employeeId - The ID of the employee
 * @returns Attendance data or null if not found
 */
export const getEmployeeAttendanceData = (employeeId: string): AttendanceData | null => {
  try {
    // Get attendance data from localStorage
    const attendanceRecords = localStorage.getItem('attendanceRecords');
    if (!attendanceRecords) return null;
    
    const parsedRecords = JSON.parse(attendanceRecords);
    
    // Find the record for this employee
    const employeeRecord = Array.isArray(parsedRecords) 
      ? parsedRecords.find((record: any) => record.employeeId === employeeId)
      : null;
      
    if (!employeeRecord) return null;
    
    // Map to our expected format
    return {
      employeeId,
      regularHours: parseFloat(employeeRecord.hoursWorked || 0),
      overtimeHours: parseFloat(employeeRecord.overtimeHours || 0),
      nightShiftHours: parseFloat(employeeRecord.nightShiftHours || 0),
      leaveHours: parseFloat(employeeRecord.leaveHours || 0)
    };
  } catch (error) {
    console.error('Error retrieving attendance data:', error);
    return null;
  }
};

/**
 * Get the latest attendance summary data for all employees
 * Used for synchronized calculations
 */
export const getAllAttendanceSummaries = (): Record<string, AttendanceData> => {
  try {
    const attendanceSummaries = localStorage.getItem('attendanceSummaries');
    if (!attendanceSummaries) return {};
    
    const parsedSummaries = JSON.parse(attendanceSummaries);
    if (!Array.isArray(parsedSummaries)) return {};
    
    // Convert array to record for easy lookup
    return parsedSummaries.reduce((acc, summary: any) => {
      if (summary.employeeId) {
        acc[summary.employeeId] = {
          employeeId: summary.employeeId,
          regularHours: parseFloat(summary.regularHours || 0),
          overtimeHours: parseFloat(summary.overtimeHours || 0),
          nightShiftHours: parseFloat(summary.nightShiftHours || 0),
          leaveHours: parseFloat(summary.leaveHours || 0)
        };
      }
      return acc;
    }, {} as Record<string, AttendanceData>);
  } catch (error) {
    console.error('Error retrieving attendance summaries:', error);
    return {};
  }
};
