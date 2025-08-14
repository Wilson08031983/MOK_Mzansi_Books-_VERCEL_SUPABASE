import { addEmployee, Employee, EmployeeFormData } from './employeeService';

/**
 * Sample Data Generator Service
 * Creates sample employees with realistic Time & Attendance and Allowance data
 */

export interface SampleEmployeeData extends EmployeeFormData {
  position: string;
  department: string;
  salary: number;
}

// Sample employee data with different positions
const sampleEmployeesData: SampleEmployeeData[] = [
  {
    firstName: 'Sarah',
    surname: 'Johnson',
    contactNumber: '071 234 5678',
    email: 'sarah.johnson@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '9001155800088',
    dateOfBirth: '1990-01-15',
    employmentType: 'Full Time',
    startDate: '2023-03-01',
    paymentCycle: 'Monthly',
    salary: 65000,
    department: 'Management',
    position: 'Manager',
    location: 'Johannesburg Office',
    addressLine1: '456 Oak Street',
    addressLine2: 'Sandton',
    addressLine3: 'Johannesburg',
    addressLine4: '2196',
    kinRelationship: 'Spouse',
    kinName: 'Michael',
    kinSurname: 'Johnson',
    kinContactNumber: '071 345 6789',
    bankName: 'FNB',
    accountHolderName: 'Sarah Johnson',
    accountNumber: '987654321',
    branchCode: '250655',
    dayShift: true,
    nightShift: false,
    flexibleShift: false
  },
  {
    firstName: 'David',
    surname: 'Williams',
    contactNumber: '082 345 6789',
    email: 'david.williams@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '8505125800089',
    dateOfBirth: '1985-05-12',
    employmentType: 'Full Time',
    startDate: '2023-02-15',
    paymentCycle: 'Monthly',
    salary: 55000,
    department: 'Finance',
    position: 'Accountant',
    location: 'Cape Town Office',
    addressLine1: '789 Pine Avenue',
    addressLine2: 'Green Point',
    addressLine3: 'Cape Town',
    addressLine4: '8005',
    kinRelationship: 'Mother',
    kinName: 'Mary',
    kinSurname: 'Williams',
    kinContactNumber: '082 456 7890',
    bankName: 'ABSA',
    accountHolderName: 'David Williams',
    accountNumber: '456789123',
    branchCode: '632005',
    dayShift: true,
    nightShift: false,
    flexibleShift: false
  },
  {
    firstName: 'Lisa',
    surname: 'Brown',
    contactNumber: '083 456 7890',
    email: 'lisa.brown@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '9203085800090',
    dateOfBirth: '1992-03-08',
    employmentType: 'Full Time',
    startDate: '2023-04-10',
    paymentCycle: 'Monthly',
    salary: 48000,
    department: 'Human Resources',
    position: 'HR Officer',
    location: 'Pretoria Office',
    addressLine1: '321 Maple Road',
    addressLine2: 'Hatfield',
    addressLine3: 'Pretoria',
    addressLine4: '0028',
    kinRelationship: 'Father',
    kinName: 'Robert',
    kinSurname: 'Brown',
    kinContactNumber: '083 567 8901',
    bankName: 'Nedbank',
    accountHolderName: 'Lisa Brown',
    accountNumber: '789123456',
    branchCode: '198765',
    dayShift: true,
    nightShift: false,
    flexibleShift: true
  },
  {
    firstName: 'James',
    surname: 'Davis',
    contactNumber: '084 567 8901',
    email: 'james.davis@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '8807195800091',
    dateOfBirth: '1988-07-19',
    employmentType: 'Full Time',
    startDate: '2023-01-20',
    paymentCycle: 'Monthly',
    salary: 42000,
    department: 'IT',
    position: 'Technician',
    location: 'Durban Office',
    addressLine1: '654 Cedar Lane',
    addressLine2: 'Umhlanga',
    addressLine3: 'Durban',
    addressLine4: '4319',
    kinRelationship: 'Sister',
    kinName: 'Jennifer',
    kinSurname: 'Davis',
    kinContactNumber: '084 678 9012',
    bankName: 'Capitec',
    accountHolderName: 'James Davis',
    accountNumber: '123789456',
    branchCode: '470010',
    dayShift: false,
    nightShift: true,
    flexibleShift: false
  },
  {
    firstName: 'Michelle',
    surname: 'Wilson',
    contactNumber: '085 678 9012',
    email: 'michelle.wilson@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '9411225800092',
    dateOfBirth: '1994-11-22',
    employmentType: 'Full Time',
    startDate: '2023-05-05',
    paymentCycle: 'Monthly',
    salary: 38000,
    department: 'Sales',
    position: 'Sales Representative',
    location: 'Port Elizabeth Office',
    addressLine1: '987 Birch Street',
    addressLine2: 'Summerstrand',
    addressLine3: 'Port Elizabeth',
    addressLine4: '6001',
    kinRelationship: 'Brother',
    kinName: 'Mark',
    kinSurname: 'Wilson',
    kinContactNumber: '085 789 0123',
    bankName: 'Standard Bank',
    accountHolderName: 'Michelle Wilson',
    accountNumber: '654321987',
    branchCode: '051001',
    dayShift: true,
    nightShift: false,
    flexibleShift: true
  },
  {
    firstName: 'Thomas',
    surname: 'Anderson',
    contactNumber: '086 789 0123',
    email: 'thomas.anderson@mokmzansibooks.com',
    idType: 'ID Number',
    idValue: '8609145800093',
    dateOfBirth: '1986-09-14',
    employmentType: 'Full Time',
    startDate: '2023-06-01',
    paymentCycle: 'Monthly',
    salary: 52000,
    department: 'Operations',
    position: 'Operations Manager',
    location: 'Bloemfontein Office',
    addressLine1: '147 Willow Avenue',
    addressLine2: 'Westdene',
    addressLine3: 'Bloemfontein',
    addressLine4: '9301',
    kinRelationship: 'Wife',
    kinName: 'Emma',
    kinSurname: 'Anderson',
    kinContactNumber: '086 890 1234',
    bankName: 'FNB',
    accountHolderName: 'Thomas Anderson',
    accountNumber: '321654987',
    branchCode: '250655',
    dayShift: true,
    nightShift: false,
    flexibleShift: false
  }
];

// Utility functions
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomTime(startHour: number, endHour: number): string {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Generate Time & Attendance data
export function generateTimeAttendanceForEmployee(employee: Employee): void {
  try {
    const attendanceSummaries = JSON.parse(localStorage.getItem('attendanceSummaries') || '[]');
    
    // Check if attendance already exists
    const existingAttendance = attendanceSummaries.find((att: any) => att.employeeId === employee.id);
    if (existingAttendance) {
      console.log(`⏭️ Attendance already exists for ${employee.firstName} ${employee.surname}`);
      return;
    }
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    let regularHours = 0;
    let overtimeHours = 0;
    let nightShiftHours = 0;
    let daysWorked = 0;
    
    const attendanceRecords = [];
    
    // Generate attendance for each day of the month
    for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      // Skip weekends for most employees (80% chance)
      if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.2) {
        continue;
      }
      
      // 90% attendance rate
      if (Math.random() > 0.9) {
        attendanceRecords.push({
          date: date.toISOString().split('T')[0],
          status: 'absent',
          clockIn: null,
          clockOut: null,
          hoursWorked: 0,
          shiftType: 'day'
        });
        continue;
      }
      
      let clockIn: string, clockOut: string, hoursWorked: number, shiftType: string;
      
      // Determine shift type based on employee preferences
      if (employee.nightShift && Math.random() > 0.7) {
        // Night shift
        shiftType = 'night';
        clockIn = getRandomTime(22, 23);
        clockOut = getRandomTime(6, 8);
        hoursWorked = 8 + Math.random() * 2; // 8-10 hours
        nightShiftHours += hoursWorked;
      } else if (employee.flexibleShift && Math.random() > 0.5) {
        // Flexible shift
        shiftType = 'flexible';
        clockIn = getRandomTime(7, 10);
        const clockInHour = parseInt(clockIn.split(':')[0]);
        clockOut = getRandomTime(clockInHour + 8, clockInHour + 10);
        hoursWorked = 8 + Math.random() * 1.5; // 8-9.5 hours
        regularHours += Math.min(hoursWorked, 8);
        if (hoursWorked > 8) {
          overtimeHours += hoursWorked - 8;
        }
      } else {
        // Day shift
        shiftType = 'day';
        clockIn = getRandomTime(8, 9);
        clockOut = getRandomTime(17, 18);
        hoursWorked = 8 + Math.random() * 1; // 8-9 hours
        regularHours += Math.min(hoursWorked, 8);
        if (hoursWorked > 8) {
          overtimeHours += hoursWorked - 8;
        }
      }
      
      daysWorked++;
      
      attendanceRecords.push({
        date: date.toISOString().split('T')[0],
        status: 'present',
        clockIn,
        clockOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        shiftType
      });
    }
    
    const attendanceSummary = {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      period: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      nightShiftHours: Math.round(nightShiftHours * 100) / 100,
      daysWorked,
      totalDays: attendanceRecords.length,
      attendanceRate: Math.round((daysWorked / attendanceRecords.length) * 100),
      records: attendanceRecords
    };
    
    attendanceSummaries.push(attendanceSummary);
    localStorage.setItem('attendanceSummaries', JSON.stringify(attendanceSummaries));
    
    console.log(`✅ Generated attendance for ${employee.firstName} ${employee.surname}: ${daysWorked} days, ${regularHours.toFixed(1)}h regular, ${overtimeHours.toFixed(1)}h overtime`);
  } catch (error) {
    console.error(`❌ Error generating attendance for ${employee.firstName} ${employee.surname}:`, error);
  }
}

// Generate Allowances data
export function generateAllowancesForEmployee(employee: Employee): void {
  try {
    const allowances = JSON.parse(localStorage.getItem('allowances') || '[]');
    
    // Check if allowances already exist
    const existingAllowances = allowances.filter((all: any) => all.employeeId === employee.id);
    if (existingAllowances.length > 0) {
      console.log(`⏭️ Allowances already exist for ${employee.firstName} ${employee.surname}`);
      return;
    }
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Define allowance types based on position and salary
    const allowanceTypes = [];
    
    // Base allowances for all employees
    allowanceTypes.push({
      type: 'Transport Allowance',
      amount: Math.floor(Math.random() * 2000) + 1000, // R1000-R3000
      frequency: 'monthly'
    });
    
    // Position-based allowances
    if (['Manager', 'Operations Manager'].includes(employee.position)) {
      allowanceTypes.push(
        {
          type: 'Management Allowance',
          amount: Math.floor(Math.random() * 3000) + 2000, // R2000-R5000
          frequency: 'monthly'
        },
        {
          type: 'Cell Phone Allowance',
          amount: Math.floor(Math.random() * 500) + 500, // R500-R1000
          frequency: 'monthly'
        }
      );
    }
    
    if (employee.salary > 50000) {
      allowanceTypes.push({
        type: 'Housing Allowance',
        amount: Math.floor(Math.random() * 5000) + 3000, // R3000-R8000
        frequency: 'monthly'
      });
    }
    
    if (['Sales Representative'].includes(employee.position)) {
      allowanceTypes.push({
        type: 'Commission Allowance',
        amount: Math.floor(Math.random() * 4000) + 1000, // R1000-R5000
        frequency: 'monthly'
      });
    }
    
    if (employee.nightShift) {
      allowanceTypes.push({
        type: 'Night Shift Allowance',
        amount: Math.floor(Math.random() * 1500) + 500, // R500-R2000
        frequency: 'monthly'
      });
    }
    
    // Add meal allowance for everyone
    allowanceTypes.push({
      type: 'Meal Allowance',
      amount: Math.floor(Math.random() * 800) + 400, // R400-R1200
      frequency: 'monthly'
    });
    
    // Create allowance records
    allowanceTypes.forEach(allowanceType => {
      const allowanceRecord = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.surname}`,
        allowanceType: allowanceType.type,
        amount: allowanceType.amount,
        frequency: allowanceType.frequency,
        month: currentMonth,
        year: currentYear,
        status: 'active',
        dateCreated: today.toISOString(),
        description: `${allowanceType.type} for ${employee.firstName} ${employee.surname} - ${employee.position}`
      };
      
      allowances.push(allowanceRecord);
    });
    
    localStorage.setItem('allowances', JSON.stringify(allowances));
    
    const totalAllowances = allowanceTypes.reduce((sum, all) => sum + all.amount, 0);
    console.log(`✅ Generated ${allowanceTypes.length} allowances for ${employee.firstName} ${employee.surname}: Total R${totalAllowances.toLocaleString()}`);
  } catch (error) {
    console.error(`❌ Error generating allowances for ${employee.firstName} ${employee.surname}:`, error);
  }
}

// Main function to create all sample employees with data
export function createSampleEmployeesWithData(): { success: boolean; employeesCreated: number; errors: string[] } {
  console.log('🚀 Starting sample employee creation with Time & Attendance and Allowances...');
  
  const results = {
    success: true,
    employeesCreated: 0,
    errors: [] as string[]
  };
  
  sampleEmployeesData.forEach((employeeData, index) => {
    try {
      console.log(`👤 Creating employee ${index + 1}/${sampleEmployeesData.length}: ${employeeData.firstName} ${employeeData.surname}`);
      
      // Create employee
      const employee = addEmployee(employeeData);
      results.employeesCreated++;
      
      console.log(`✅ Created: ${employee.firstName} ${employee.surname} (${employee.position})`);
      
      // Generate Time & Attendance
      generateTimeAttendanceForEmployee(employee);
      
      // Generate Allowances
      generateAllowancesForEmployee(employee);
      
    } catch (error) {
      const errorMsg = `Failed to create ${employeeData.firstName} ${employeeData.surname}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }
  });
  
  if (results.errors.length > 0) {
    results.success = false;
  }
  
  console.log('🎉 Sample employee creation completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Employees created: ${results.employeesCreated}`);
  console.log(`   - Errors: ${results.errors.length}`);
  console.log(`   - Time & Attendance records generated for all employees`);
  console.log(`   - Allowances assigned to all employees`);
  
  if (results.errors.length > 0) {
    console.log('❌ Errors encountered:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('🔄 Please refresh the HR Management page to see the new data');
  
  return results;
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).createSampleEmployeesWithData = createSampleEmployeesWithData;
  (window as any).generateTimeAttendanceForEmployee = generateTimeAttendanceForEmployee;
  (window as any).generateAllowancesForEmployee = generateAllowancesForEmployee;
}
