import { getAllEmployees } from './employeeService';

/**
 * Generate realistic attendance hours for all sample employees
 * This updates the attendance summaries with random but realistic work hours
 */

interface AttendanceSummary {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  year: number;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  leaveHours: number;
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  lateArrivals: number;
  earlyDepartures: number;
  overtimeStatus: 'exempt' | 'eligible' | 'capped';
  attendanceRate: number;
}

function getRandomHours(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getDepartmentByPosition(position: string): string {
  const departmentMap: { [key: string]: string } = {
    'Director': 'Executive',
    'Manager': 'Management',
    'Accountant': 'Finance',
    'HR Officer': 'Human Resources',
    'Technician': 'IT',
    'Sales Rep': 'Sales',
    'Sales Representative': 'Sales',
    'Operations Manager': 'Operations'
  };
  return departmentMap[position] || 'General';
}

export function generateRandomAttendanceHours(): { success: boolean; employeesUpdated: number; errors: string[] } {
  console.log('📊 Generating random attendance hours for sample employees...');
  
  const results = {
    success: true,
    employeesUpdated: 0,
    errors: [] as string[]
  };
  
  try {
    const employees = getAllEmployees();
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Get existing attendance summaries
    const existingAttendanceSummaries = JSON.parse(localStorage.getItem('attendanceSummaries') || '[]');
    
    // Filter out employees we don't want to show (Regular User)
    const employeesToProcess = employees.filter(emp => {
      const isDefaultRegularUser = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com' ||
                                  (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
      return !isDefaultRegularUser && emp.status === 'active';
    });
    
    console.log(`📋 Processing ${employeesToProcess.length} employees for ${currentMonth} ${currentYear}`);
    
    employeesToProcess.forEach((employee, index) => {
      try {
        const employeeName = `${employee.firstName} ${employee.surname}`;
        const department = getDepartmentByPosition(employee.position || 'General');
        
        // Find existing attendance summary for this employee and month
        const existingIndex = existingAttendanceSummaries.findIndex((summary: any) => 
          summary.employeeId === employee.id && 
          summary.month === currentMonth && 
          summary.year === currentYear
        );
        
        // Generate realistic hours based on position and work patterns
        let regularHours: number;
        let overtimeHours: number;
        let nightShiftHours: number;
        let leaveHours: number;
        let overtimeStatus: 'exempt' | 'eligible' | 'capped';
        
        // Base hours calculation (assuming ~22 working days per month)
        const workingDays = 22;
        const standardDailyHours = 8;
        const baseMonthlyHours = workingDays * standardDailyHours; // 176 hours
        
        // Position-based hour generation
        switch (employee.position) {
          case 'Director':
          case 'Manager':
          case 'Operations Manager':
            // Management: Higher hours, more overtime, exempt status
            regularHours = getRandomHours(160, 180);
            overtimeHours = getRandomHours(10, 25);
            nightShiftHours = getRandomHours(0, 5);
            leaveHours = getRandomHours(0, 16); // 0-2 days
            overtimeStatus = 'exempt';
            break;
            
          case 'Accountant':
            // Finance: Standard hours with some overtime during busy periods
            regularHours = getRandomHours(170, 176);
            overtimeHours = getRandomHours(5, 15);
            nightShiftHours = getRandomHours(0, 2);
            leaveHours = getRandomHours(0, 24); // 0-3 days
            overtimeStatus = 'eligible';
            break;
            
          case 'HR Officer':
            // HR: Standard business hours, minimal overtime
            regularHours = getRandomHours(168, 176);
            overtimeHours = getRandomHours(2, 8);
            nightShiftHours = 0;
            leaveHours = getRandomHours(0, 16); // 0-2 days
            overtimeStatus = 'eligible';
            break;
            
          case 'Technician':
            // IT: Some night shifts, variable overtime
            regularHours = getRandomHours(160, 176);
            overtimeHours = getRandomHours(8, 20);
            nightShiftHours = getRandomHours(5, 15);
            leaveHours = getRandomHours(0, 24); // 0-3 days
            overtimeStatus = 'eligible';
            break;
            
          case 'Sales Rep':
          case 'Sales Representative':
            // Sales: Variable hours, some weekend work
            regularHours = getRandomHours(165, 180);
            overtimeHours = getRandomHours(3, 12);
            nightShiftHours = getRandomHours(0, 3);
            leaveHours = getRandomHours(0, 32); // 0-4 days
            overtimeStatus = 'eligible';
            break;
            
          default:
            // Default: Standard hours
            regularHours = getRandomHours(168, 176);
            overtimeHours = getRandomHours(0, 10);
            nightShiftHours = getRandomHours(0, 5);
            leaveHours = getRandomHours(0, 24);
            overtimeStatus = 'eligible';
        }
        
        // Calculate attendance metrics
        const totalHoursWorked = regularHours + overtimeHours + nightShiftHours;
        const daysPresent = Math.round(totalHoursWorked / 8);
        const daysAbsent = Math.max(0, workingDays - daysPresent - Math.round(leaveHours / 8));
        const attendanceRate = Math.round((daysPresent / workingDays) * 100);
        const lateArrivals = Math.floor(Math.random() * 3); // 0-2 late arrivals
        const earlyDepartures = Math.floor(Math.random() * 2); // 0-1 early departures
        
        const attendanceSummary: AttendanceSummary = {
          id: existingIndex >= 0 ? existingAttendanceSummaries[existingIndex].id : crypto.randomUUID(),
          employeeId: employee.id,
          employeeName,
          department,
          month: currentMonth,
          year: currentYear,
          regularHours,
          overtimeHours,
          nightShiftHours,
          leaveHours,
          totalWorkingDays: workingDays,
          daysPresent,
          daysAbsent,
          lateArrivals,
          earlyDepartures,
          overtimeStatus,
          attendanceRate
        };
        
        if (existingIndex >= 0) {
          // Update existing summary
          existingAttendanceSummaries[existingIndex] = attendanceSummary;
          console.log(`✅ Updated attendance summary for ${employeeName}: ${regularHours}h regular, ${overtimeHours}h overtime, ${nightShiftHours}h night shift`);
        } else {
          // Add new summary
          existingAttendanceSummaries.push(attendanceSummary);
          console.log(`✅ Created attendance summary for ${employeeName}: ${regularHours}h regular, ${overtimeHours}h overtime, ${nightShiftHours}h night shift`);
        }
        
        results.employeesUpdated++;
        
      } catch (error) {
        const errorMsg = `Failed to generate attendance hours for ${employee.firstName} ${employee.surname}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    });
    
    // Save updated attendance summaries
    localStorage.setItem('attendanceSummaries', JSON.stringify(existingAttendanceSummaries));
    
    if (results.errors.length > 0) {
      results.success = false;
    }
    
    console.log('🎉 Attendance hours generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Employees updated: ${results.employeesUpdated}`);
    console.log(`   - Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors encountered:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Critical error generating attendance hours:', error);
    results.success = false;
    results.errors.push(`Critical error: ${error}`);
  }
  
  return results;
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).generateRandomAttendanceHours = generateRandomAttendanceHours;
}
