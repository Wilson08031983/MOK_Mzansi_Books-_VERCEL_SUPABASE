import { getAllEmployees, Employee } from './employeeService';

/**
 * Generate Time & Attendance entries for all employees for today's date
 * This ensures all employees show up in the Daily Entries view
 */

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  shiftType: 'day' | 'night' | 'flexible' | 'weekend';
  status: 'present' | 'absent' | 'late' | 'early';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  notes?: string;
  overtimeHours?: number;
  breakTime?: number;
}

function getRandomTime(startHour: number, endHour: number): string {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function calculateHoursWorked(clockIn: string, clockOut: string): number {
  const [inHour, inMinute] = clockIn.split(':').map(Number);
  const [outHour, outMinute] = clockOut.split(':').map(Number);
  
  const inTime = inHour + inMinute / 60;
  let outTime = outHour + outMinute / 60;
  
  // Handle overnight shifts
  if (outTime < inTime) {
    outTime += 24;
  }
  
  return Math.round((outTime - inTime) * 100) / 100;
}

export function generateTodayTimeEntriesForAllEmployees(): { success: boolean; entriesCreated: number; errors: string[] } {
  console.log('🕐 Generating today\'s time entries for all employees...');
  
  const results = {
    success: true,
    entriesCreated: 0,
    errors: [] as string[]
  };
  
  try {
    const employees = getAllEmployees();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get existing time entries
    const existingTimeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    // Filter out employees we don't want to show (Regular User)
    const employeesToProcess = employees.filter(emp => {
      const isDefaultRegularUser = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com' ||
                                  (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
      return !isDefaultRegularUser && emp.status === 'active';
    });
    
    console.log(`📋 Processing ${employeesToProcess.length} employees for ${todayStr}`);
    
    employeesToProcess.forEach((employee, index) => {
      try {
        // Check if entry already exists for today
        const existingEntry = existingTimeEntries.find((entry: any) => 
          entry.employeeId === employee.id && entry.date === todayStr
        );
        
        if (existingEntry) {
          console.log(`⏭️ Time entry already exists for ${employee.firstName} ${employee.surname} on ${todayStr}`);
          return;
        }
        
        let clockIn: string, clockOut: string, shiftType: string, status: string;
        
        // Determine shift type and times based on employee preferences and position
        if (employee.nightShift && Math.random() > 0.6) {
          // Night shift
          shiftType = 'night';
          clockIn = getRandomTime(22, 23);
          clockOut = getRandomTime(6, 8);
          status = 'present';
        } else if (employee.flexibleShift && Math.random() > 0.4) {
          // Flexible shift
          shiftType = 'flexible';
          clockIn = getRandomTime(7, 10);
          const clockInHour = parseInt(clockIn.split(':')[0]);
          clockOut = getRandomTime(clockInHour + 8, clockInHour + 10);
          status = 'present';
        } else {
          // Day shift (including weekend work)
          const isWeekend = today.getDay() === 0 || today.getDay() === 6;
          if (isWeekend && Math.random() > 0.3) {
            shiftType = 'weekend';
            clockIn = getRandomTime(8, 10);
            clockOut = getRandomTime(14, 17);
            status = 'present';
          } else if (isWeekend) {
            // Some employees don't work weekends
            console.log(`📅 ${employee.firstName} ${employee.surname} not scheduled for weekend work`);
            return;
          } else {
            shiftType = 'day';
            clockIn = getRandomTime(8, 9);
            clockOut = getRandomTime(17, 18);
            status = Math.random() > 0.05 ? 'present' : 'late'; // 5% chance of being late
          }
        }
        
        const hoursWorked = calculateHoursWorked(clockIn, clockOut);
        const overtimeHours = hoursWorked > 8 ? hoursWorked - 8 : 0;
        
        const timeEntry: TimeEntry = {
          id: crypto.randomUUID(),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.surname}`,
          date: todayStr,
          clockIn,
          clockOut,
          hoursWorked,
          shiftType: shiftType as any,
          status: status as any,
          approvalStatus: 'approved', // Auto-approve for sample data
          notes: `${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)} shift - ${employee.position}`,
          overtimeHours: overtimeHours > 0 ? Math.round(overtimeHours * 100) / 100 : undefined,
          breakTime: 30 // 30 minutes break
        };
        
        existingTimeEntries.push(timeEntry);
        results.entriesCreated++;
        
        console.log(`✅ Created time entry for ${employee.firstName} ${employee.surname}: ${clockIn}-${clockOut} (${hoursWorked}h, ${shiftType})`);
        
      } catch (error) {
        const errorMsg = `Failed to create time entry for ${employee.firstName} ${employee.surname}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    });
    
    // Save updated time entries
    localStorage.setItem('timeEntries', JSON.stringify(existingTimeEntries));
    
    if (results.errors.length > 0) {
      results.success = false;
    }
    
    console.log('🎉 Today\'s time entries generation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Entries created: ${results.entriesCreated}`);
    console.log(`   - Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors encountered:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Critical error generating today\'s time entries:', error);
    results.success = false;
    results.errors.push(`Critical error: ${error}`);
  }
  
  return results;
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).generateTodayTimeEntriesForAllEmployees = generateTodayTimeEntriesForAllEmployees;
}
