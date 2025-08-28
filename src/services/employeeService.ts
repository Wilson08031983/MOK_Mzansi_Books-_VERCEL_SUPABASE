import { v4 as uuidv4 } from 'uuid';

// Lightweight HR event dispatcher for cross-component updates/notifications
const dispatchHREvent = (detail: any) => {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('hr-updated', { detail }));
    }
  } catch (err) {
    // Non-fatal
    console.warn('[employeeService] Failed to dispatch hr-updated event:', err);
  }
};

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  surname: string;
  contactNumber: string;
  email: string;
  idType: 'ID Number' | 'Passport Number';
  idValue: string;
  dateOfBirth: string;
  employmentType: 'Full Time' | 'Part Time';
  startDate: string;
  endDate?: string;
  paymentCycle: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  salary: number;
  taxPercentage?: number;
  department: string;
  position: string;
  status: 'active' | 'on-leave' | 'terminated';
  location: string;
  
  // Address fields
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  
  // Next of kin
  kinRelationship: string;
  kinName: string;
  kinSurname: string;
  kinContactNumber: string;
  
  // Bank details
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchCode: string;
  
  // Shifts
  dayShift: boolean;
  nightShift: boolean;
  flexibleShift: boolean;
  
  avatar?: string;
}

// EmployeeFormData is used for the form state in AddEmployeeModal
// It omits id, employeeNumber, and status which are generated when saving
export type EmployeeFormData = Omit<Employee, 'id' | 'employeeNumber' | 'status'>;


// Generate employee number based on requirements
export const generateEmployeeNumber = (
  firstName: string,
  surname: string,
  employmentDate: string,
  idNumber: string,
): string => {
  // First 3 letters of first name
  const firstNamePart = firstName.substring(0, 3).toUpperCase();
  
  // First 3 letters of surname
  const surnamePart = surname.substring(0, 3).toUpperCase();
  
  // Date of employment (DDMMYY)
  const dateParts = employmentDate.split('-');
  const day = dateParts[2];
  const month = dateParts[1];
  const year = dateParts[0].substring(2);
  const datePart = `${day}${month}${year}`;
  
  // Last 3 digits of ID/Passport
  const idPart = idNumber.slice(-3);
  
  // Auto-increment number
  const employees = getAllEmployees();
  const count = employees.length + 1;
  const countPart = count.toString().padStart(3, '0');
  
  return `${firstNamePart}${surnamePart}-${datePart}-${idPart}-${countPart}`;
};

export const getAllEmployees = (): Employee[] => {
  const employees = localStorage.getItem('employees');
  const parsedEmployees = employees ? JSON.parse(employees) : [];
  
  // Remove duplicates based on employee ID
  const uniqueEmployees = parsedEmployees.filter((employee: Employee, index: number, self: Employee[]) => 
    index === self.findIndex(e => e.id === employee.id)
  );
  
  return uniqueEmployees;
};

export const addEmployee = (employeeData: EmployeeFormData): Employee => {
  const employees = getAllEmployees();
  
  // Check for potential duplicates based on ID value and email
  const existingEmployee = employees.find(emp => 
    emp.idValue === employeeData.idValue || 
    emp.email === employeeData.email
  );
  
  if (existingEmployee) {
    console.warn('Employee with same ID or email already exists:', existingEmployee);
    throw new Error('Employee with this ID number or email already exists');
  }
  
  const newEmployee: Employee = {
    ...employeeData,
    id: uuidv4(),
    employeeNumber: generateEmployeeNumber(
      employeeData.firstName,
      employeeData.surname,
      employeeData.startDate,
      employeeData.idValue
    ),
    status: 'active'
  };
  
  employees.push(newEmployee);
  localStorage.setItem('employees', JSON.stringify(employees));
  // Notify listeners
  dispatchHREvent({ entity: 'employee', action: 'created', employee: newEmployee });
  
  return newEmployee;
};

export const updateEmployee = (id: string, employeeData: Partial<Employee>): Employee | null => {
  const employees = getAllEmployees();
  const index = employees.findIndex(employee => employee.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const prev = employees[index];
  const updatedEmployee = {
    ...employees[index],
    ...employeeData
  };
  
  employees[index] = updatedEmployee;
  localStorage.setItem('employees', JSON.stringify(employees));
  // Notify listeners (status-specific action if changed)
  const prevStatus = prev.status;
  const newStatus = updatedEmployee.status;
  if (prevStatus !== newStatus) {
    let action = 'status-changed';
    if (newStatus === 'terminated') action = 'terminated';
    if (newStatus === 'on-leave') action = 'on-leave';
    if (newStatus === 'active' && prevStatus === 'on-leave') action = 'returned-from-leave';
    dispatchHREvent({ entity: 'employee', action, employee: updatedEmployee, prevStatus, newStatus });
  } else {
    dispatchHREvent({ entity: 'employee', action: 'updated', employee: updatedEmployee });
  }
  
  return updatedEmployee;
};

export const deleteEmployee = (id: string): boolean => {
  console.log(`🗑️ [employeeService] Starting deleteEmployee for ID: ${id}`);
  
  let employeeToDelete: Employee | undefined;
  
  try {
    const employees = getAllEmployees();
    console.log(`📋 [employeeService] Current employees count: ${employees.length}`);
    
    employeeToDelete = employees.find(emp => emp.id === id);
    
    if (!employeeToDelete) {
      console.error(`❌ [employeeService] Employee with ID ${id} not found in employees list`);
      console.log(`📋 [employeeService] Available employee IDs:`, employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.surname}` })));
      return false;
    }
    
    console.log(`👤 [employeeService] Found employee to delete:`, {
      id: employeeToDelete.id,
      name: `${employeeToDelete.firstName} ${employeeToDelete.surname}`,
      email: employeeToDelete.email,
      position: employeeToDelete.position,
      isRegularUser: employeeToDelete.firstName === 'Regular' && employeeToDelete.surname === 'User'
    });
    
    const filteredEmployees = employees.filter(employee => employee.id !== id);
    
    if (filteredEmployees.length === employees.length) {
      console.error(`❌ [employeeService] No employee was filtered out - ID mismatch issue`);
      return false;
    }
    
    console.log(`📊 [employeeService] Employees after filtering: ${filteredEmployees.length} (removed 1)`);
    
    // Clear all related data for the deleted employee
    // Remove from employees
    localStorage.setItem('employees', JSON.stringify(filteredEmployees));
    
    // Clear payroll data for this employee
    const payrollData = localStorage.getItem('payrollCalculations');
    if (payrollData) {
      const parsedPayroll = JSON.parse(payrollData);
      const filteredPayroll = parsedPayroll.filter((p: any) => p.employeeId !== id);
      localStorage.setItem('payrollCalculations', JSON.stringify(filteredPayroll));
    }
    
    // Clear attendance data for this employee
    const attendanceData = localStorage.getItem('attendanceSummaries');
    if (attendanceData) {
      const parsedAttendance = JSON.parse(attendanceData);
      const filteredAttendance = parsedAttendance.filter((a: any) => a.employeeId !== id);
      localStorage.setItem('attendanceSummaries', JSON.stringify(filteredAttendance));
    }
    
    // Clear employee deductions
    const deductionsData = localStorage.getItem('employeeDeductions');
    if (deductionsData) {
      const parsedDeductions = JSON.parse(deductionsData);
      const filteredDeductions = parsedDeductions.filter((d: any) => d.employeeId !== id);
      localStorage.setItem('employeeDeductions', JSON.stringify(filteredDeductions));
    }
    
    // Clear salary advances
    const advancesData = localStorage.getItem('salaryAdvances');
    if (advancesData) {
      const parsedAdvances = JSON.parse(advancesData);
      const filteredAdvances = parsedAdvances.filter((a: any) => a.employeeId !== id);
      localStorage.setItem('salaryAdvances', JSON.stringify(filteredAdvances));
    }
    
    // Clear EMP201 cache for this employee
    const emp201Cache = localStorage.getItem('emp201Cache');
    if (emp201Cache) {
      const parsedCache = JSON.parse(emp201Cache);
      Object.keys(parsedCache).forEach(key => {
        if (key.includes(id)) {
          delete parsedCache[key];
        }
      });
      localStorage.setItem('emp201Cache', JSON.stringify(parsedCache));
    }
    
    // Clear HR-Accounting cache
    const hrCache = localStorage.getItem('hrAccountingCache');
    if (hrCache) {
      const parsedHRCache = JSON.parse(hrCache);
      if (parsedHRCache[id]) {
        delete parsedHRCache[id];
        localStorage.setItem('hrAccountingCache', JSON.stringify(parsedHRCache));
      }
    }
    
    // If this is the Regular User, also clear user credentials
    if (employeeToDelete && (
      (employeeToDelete.firstName === 'Regular' && employeeToDelete.surname === 'User') ||
      id === '0f043fc8-b140-48ce-ba79-56d47e21725c'
    )) {
      const credentials = localStorage.getItem('userCredentials');
      if (credentials) {
        const parsedCredentials = JSON.parse(credentials);
        // Remove Regular User credentials
        Object.keys(parsedCredentials).forEach(key => {
          const user = parsedCredentials[key];
          if (user.fullName === 'Regular User' || user.email === 'user@mokmzansibooks.com') {
            delete parsedCredentials[key];
          }
        });
        localStorage.setItem('userCredentials', JSON.stringify(parsedCredentials));
      }
      
      console.log('✅ Regular User completely removed from all systems');
    }
    
    console.log(`✅ Employee ${employeeToDelete?.firstName} ${employeeToDelete?.surname} and all related data deleted successfully`);
    // Notify listeners of deletion
    if (employeeToDelete) {
      dispatchHREvent({ entity: 'employee', action: 'deleted', employee: employeeToDelete });
    }
    return true;
  } catch (error) {
    console.error(`💥 [employeeService] Critical error during deleteEmployee operation:`, {
      employeeId: id,
      employeeName: employeeToDelete ? `${employeeToDelete.firstName} ${employeeToDelete.surname}` : 'Unknown',
      isRegularUser: employeeToDelete ? (employeeToDelete.firstName === 'Regular' && employeeToDelete.surname === 'User') : false,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};

export const getEmployeeById = (id: string): Employee | null => {
  const employees = getAllEmployees();
  const employee = employees.find(emp => emp.id === id);
  return employee || null;
};

export const getEmployeesByBirthMonth = (month: number): Employee[] => {
  const employees = getAllEmployees();
  return employees.filter(emp => {
    const birthDate = new Date(emp.dateOfBirth);
    return birthDate.getMonth() + 1 === month;
  });
};

export const getCurrentMonthBirthdays = (): Employee[] => {
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  return getEmployeesByBirthMonth(currentMonth);
};

export const getUpcomingBirthdays = (days: number = 7): Employee[] => {
  const employees = getAllEmployees();
  const today = new Date();
  
  return employees.filter(emp => {
    const birthDate = new Date(emp.dateOfBirth);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    if (thisYearBirthday < today) {
      // Birthday already passed this year, check for next year
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }
    
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= days;
  });
};

// Function to clean up duplicate employees in localStorage
export const cleanupDuplicateEmployees = (): void => {
  try {
    const employees = localStorage.getItem('employees');
    if (!employees) return;
    
    const parsedEmployees = JSON.parse(employees);
    
    // Remove duplicates based on ID first
    let uniqueEmployees = parsedEmployees.filter((employee: Employee, index: number, self: Employee[]) => 
      index === self.findIndex(e => e.id === employee.id)
    );
    
    // Also remove duplicates based on full name and email to catch different IDs with same person
    uniqueEmployees = uniqueEmployees.filter((employee: Employee, index: number, self: Employee[]) => {
      const fullName = `${employee.firstName} ${employee.surname}`.toLowerCase();
      const email = employee.email?.toLowerCase() || '';
      
      return index === self.findIndex(e => {
        const eFullName = `${e.firstName} ${e.surname}`.toLowerCase();
        const eEmail = e.email?.toLowerCase() || '';
        return (fullName === eFullName) || (email && email === eEmail);
      });
    });
    
    // Only update localStorage if duplicates were found
    if (uniqueEmployees.length !== parsedEmployees.length) {
      localStorage.setItem('employees', JSON.stringify(uniqueEmployees));
      console.log(`Removed ${parsedEmployees.length - uniqueEmployees.length} duplicate employee records`);
    }
  } catch (error) {
    console.error('Error cleaning up duplicate employees:', error);
  }
};

// Function to completely reset and reinitialize employees (for fixing duplicate issues)
export const resetAndInitializeEmployees = (): void => {
  try {
    // Clear all existing employees
    localStorage.removeItem('employees');
    // Clear the reset flag to ensure fresh initialization
    sessionStorage.removeItem('employeesReset');
    console.log('Cleared all existing employee data and reset flags');
    
    // Initialize with fresh sample data
    initializeEmployees();
  } catch (error) {
    console.error('Error resetting employees:', error);
  }
};

// Function to force cleanup duplicates immediately
export const forceCleanupDuplicates = (): void => {
  try {
    // Clear the reset flag to force a fresh cleanup
    sessionStorage.removeItem('employeesReset');
    cleanupDuplicateEmployees();
    console.log('Forced duplicate cleanup completed');
  } catch (error) {
    console.error('Error in force cleanup:', error);
  }
};

export const initializeEmployees = (): void => {
  // First clean up any existing duplicates
  cleanupDuplicateEmployees();
  
  const employees = getAllEmployees();
  
  if (employees.length === 0) {
    // Do not seed any default employees here. HR employees should be sourced from Company Team Members
    // via team-employee sync. Leaving empty ensures no static Admin employee appears in HR.
    console.log('initializeEmployees: no employees present; leaving empty. Team Management will sync employees from Team Members.');
  }
};
