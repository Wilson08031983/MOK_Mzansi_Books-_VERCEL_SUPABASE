import { getAllEmployees } from './employeeService';

/**
 * Clean up all sample employees and related data from localStorage
 * This removes sample employees, their time entries, attendance summaries, and allowances
 */

export function cleanupAllSampleData(): { success: boolean; employeesRemoved: number; errors: string[] } {
  console.log('🧹 Starting cleanup of all sample employees and related data...');
  
  const results = {
    success: true,
    employeesRemoved: 0,
    errors: [] as string[]
  };
  
  try {
    // Get all employees
    const allEmployees = getAllEmployees();
    
    // Identify sample employees (exclude Admin User ONLY)
    const sampleEmployees = allEmployees.filter(emp => {
      const isAdminUser = (emp.email || '').toLowerCase() === 'admin@mokmzansibooks.com' ||
                         (emp.firstName?.trim() === 'Admin' && emp.surname?.trim() === 'User');
      
      return !isAdminUser;
    });
    
    console.log(`📋 Found ${sampleEmployees.length} sample employees to remove`);
    
    // Get sample employee IDs for cleanup
    const sampleEmployeeIds = sampleEmployees.map(emp => emp.id);
    
    // 1. Remove sample employees from employees list
    const remainingEmployees = allEmployees.filter(emp => {
      const isAdminUser = (emp.email || '').toLowerCase() === 'admin@mokmzansibooks.com' ||
                         (emp.firstName?.trim() === 'Admin' && emp.surname?.trim() === 'User');
      return isAdminUser;
    });
    
    localStorage.setItem('employees', JSON.stringify(remainingEmployees));
    results.employeesRemoved = sampleEmployees.length;
    console.log(`✅ Removed ${sampleEmployees.length} sample employees`);
    
    // 2. Clean up time entries
    const existingTimeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const filteredTimeEntries = existingTimeEntries.filter((entry: any) => 
      !sampleEmployeeIds.includes(entry.employeeId)
    );
    localStorage.setItem('timeEntries', JSON.stringify(filteredTimeEntries));
    console.log(`✅ Cleaned up time entries (removed ${existingTimeEntries.length - filteredTimeEntries.length} entries)`);
    
    // 3. Clean up attendance summaries
    const existingAttendanceSummaries = JSON.parse(localStorage.getItem('attendanceSummaries') || '[]');
    const filteredAttendanceSummaries = existingAttendanceSummaries.filter((summary: any) => 
      !sampleEmployeeIds.includes(summary.employeeId)
    );
    localStorage.setItem('attendanceSummaries', JSON.stringify(filteredAttendanceSummaries));
    console.log(`✅ Cleaned up attendance summaries (removed ${existingAttendanceSummaries.length - filteredAttendanceSummaries.length} summaries)`);
    
    // 4. Clean up allowances
    const existingAllowances = JSON.parse(localStorage.getItem('allowances') || '[]');
    const filteredAllowances = existingAllowances.filter((allowance: any) => 
      !sampleEmployeeIds.includes(allowance.employeeId)
    );
    localStorage.setItem('allowances', JSON.stringify(filteredAllowances));
    console.log(`✅ Cleaned up allowances (removed ${existingAllowances.length - filteredAllowances.length} allowances)`);
    
    // 5. Clean up weekly timesheets
    const existingTimesheets = JSON.parse(localStorage.getItem('weeklyTimesheets') || '[]');
    const filteredTimesheets = existingTimesheets.filter((timesheet: any) => 
      !sampleEmployeeIds.includes(timesheet.employeeId)
    );
    localStorage.setItem('weeklyTimesheets', JSON.stringify(filteredTimesheets));
    console.log(`✅ Cleaned up weekly timesheets (removed ${existingTimesheets.length - filteredTimesheets.length} timesheets)`);
    
    // 6. Clean up payroll data
    const existingPayrollData = JSON.parse(localStorage.getItem('payrollData') || '[]');
    const filteredPayrollData = existingPayrollData.filter((payroll: any) => 
      !sampleEmployeeIds.includes(payroll.employeeId)
    );
    localStorage.setItem('payrollData', JSON.stringify(filteredPayrollData));
    console.log(`✅ Cleaned up payroll data (removed ${existingPayrollData.length - filteredPayrollData.length} payroll records)`);
    
    // 7. Clean up aggregated payroll calculations (global key)
    const existingPayrollCalculations = JSON.parse(localStorage.getItem('payrollCalculations') || '[]');
    if (Array.isArray(existingPayrollCalculations)) {
      const filteredPayrollCalculations = existingPayrollCalculations.filter((calc: any) => 
        !sampleEmployeeIds.includes(calc.employeeId)
      );
      localStorage.setItem('payrollCalculations', JSON.stringify(filteredPayrollCalculations));
      console.log(`✅ Cleaned up payrollCalculations (removed ${existingPayrollCalculations.length - filteredPayrollCalculations.length} records)`);
    }
    
    // 8. Clean up period-specific payroll calculations keys: payroll_calculations_<period>
    const keysToUpdate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      if (key.startsWith('payroll_calculations_')) {
        keysToUpdate.push(key);
      }
    }
    keysToUpdate.forEach(key => {
      try {
        const raw = localStorage.getItem(key) || '[]';
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((calc: any) => !sampleEmployeeIds.includes(calc.employeeId));
          localStorage.setItem(key, JSON.stringify(filtered));
          console.log(`✅ Cleaned up ${key} (removed ${parsed.length - filtered.length} records)`);
        }
      } catch (e) {
        console.warn(`⚠️ Skipped malformed key ${key} during payroll cleanup`, e);
      }
    });
    
    console.log('🎉 Sample data cleanup completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Sample employees removed: ${results.employeesRemoved}`);
    console.log(`   - Remaining employees: ${remainingEmployees.length}`);
    
  } catch (error) {
    console.error('❌ Critical error during sample data cleanup:', error);
    results.success = false;
    results.errors.push(`Critical error: ${error}`);
  }
  
  return results;
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).cleanupAllSampleData = cleanupAllSampleData;
}
