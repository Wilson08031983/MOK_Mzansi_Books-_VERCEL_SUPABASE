import { v4 as uuidv4 } from 'uuid';

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
  taxPercentage: number;
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
  
  return newEmployee;
};

export const updateEmployee = (id: string, employeeData: Partial<Employee>): Employee | null => {
  const employees = getAllEmployees();
  const index = employees.findIndex(employee => employee.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedEmployee = {
    ...employees[index],
    ...employeeData
  };
  
  employees[index] = updatedEmployee;
  localStorage.setItem('employees', JSON.stringify(employees));
  
  return updatedEmployee;
};

export const deleteEmployee = (id: string): boolean => {
  const employees = getAllEmployees();
  const filteredEmployees = employees.filter(employee => employee.id !== id);
  
  if (filteredEmployees.length === employees.length) {
    return false;
  }
  
  localStorage.setItem('employees', JSON.stringify(filteredEmployees));
  return true;
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
    const sampleEmployees: EmployeeFormData[] = [
      {
        firstName: 'John',
        surname: 'Smith',
        contactNumber: '071 123 4567',
        email: 'john.smith@mokmzansibooks.com',
        idType: 'ID Number',
        idValue: '8501015800087',
        dateOfBirth: '1985-01-01',
        employmentType: 'Full Time',
        startDate: '2023-01-15',
        paymentCycle: 'Monthly',
        salary: 25000,
        taxPercentage: 18,
        department: 'IT',
        position: 'Software Developer',
        location: 'Pretoria Office',
        addressLine1: '123 Main Street',
        addressLine2: 'Sunnyside',
        addressLine3: 'Pretoria',
        addressLine4: '0002',
        kinRelationship: 'Spouse',
        kinName: 'Jane',
        kinSurname: 'Smith',
        kinContactNumber: '071 987 6543',
        bankName: 'Standard Bank',
        accountHolderName: 'John Smith',
        accountNumber: '123456789',
        branchCode: '051001',
        dayShift: true,
        nightShift: false,
        flexibleShift: false
      },
      {
        firstName: 'Sarah',
        surname: 'Johnson',
        contactNumber: '082 456 7890',
        email: 'sarah.johnson@mokmzansibooks.com',
        idType: 'ID Number',
        idValue: '9003125800088',
        dateOfBirth: '1990-03-12',
        employmentType: 'Full Time',
        startDate: '2023-03-01',
        paymentCycle: 'Monthly',
        salary: 22000,
        taxPercentage: 18,
        department: 'Finance',
        position: 'Accountant',
        location: 'Pretoria Office',
        addressLine1: '456 Oak Avenue',
        addressLine2: 'Hatfield',
        addressLine3: 'Pretoria',
        addressLine4: '0028',
        kinRelationship: 'Parent',
        kinName: 'Michael',
        kinSurname: 'Johnson',
        kinContactNumber: '083 111 2222',
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
        contactNumber: '073 789 0123',
        email: 'david.williams@mokmzansibooks.com',
        idType: 'ID Number',
        idValue: '8807205800089',
        dateOfBirth: '1988-07-20',
        employmentType: 'Full Time',
        startDate: '2022-11-01',
        paymentCycle: 'Monthly',
        salary: 28000,
        taxPercentage: 20,
        department: 'Sales',
        position: 'Sales Manager',
        location: 'Johannesburg Office',
        addressLine1: '789 Pine Street',
        addressLine2: 'Sandton',
        addressLine3: 'Johannesburg',
        addressLine4: '2196',
        kinRelationship: 'Sibling',
        kinName: 'Lisa',
        kinSurname: 'Williams',
        kinContactNumber: '074 333 4444',
        bankName: 'ABSA',
        accountHolderName: 'David Williams',
        accountNumber: '456789123',
        branchCode: '632005',
        dayShift: true,
        nightShift: false,
        flexibleShift: true
      },
      {
        firstName: 'Maria',
        surname: 'Garcia',
        contactNumber: '084 567 8901',
        email: 'maria.garcia@mokmzansibooks.com',
        idType: 'ID Number',
        idValue: '9205155800090',
        dateOfBirth: '1992-05-15',
        employmentType: 'Part Time',
        startDate: '2023-06-01',
        paymentCycle: 'Monthly',
        salary: 15000,
        taxPercentage: 15,
        department: 'HR',
        position: 'HR Assistant',
        location: 'Pretoria Office',
        addressLine1: '321 Elm Road',
        addressLine2: 'Brooklyn',
        addressLine3: 'Pretoria',
        addressLine4: '0181',
        kinRelationship: 'Parent',
        kinName: 'Carlos',
        kinSurname: 'Garcia',
        kinContactNumber: '085 555 6666',
        bankName: 'Nedbank',
        accountHolderName: 'Maria Garcia',
        accountNumber: '789123456',
        branchCode: '198765',
        dayShift: false,
        nightShift: false,
        flexibleShift: true
      },
      {
        firstName: 'Thabo',
        surname: 'Mthembu',
        contactNumber: '076 234 5678',
        email: 'thabo.mthembu@mokmzansibooks.com',
        idType: 'ID Number',
        idValue: '8609105800091',
        dateOfBirth: '1986-09-10',
        employmentType: 'Full Time',
        startDate: '2022-08-15',
        paymentCycle: 'Monthly',
        salary: 32000,
        taxPercentage: 25,
        department: 'Operations',
        position: 'Operations Manager',
        location: 'Cape Town Office',
        addressLine1: '654 Beach Road',
        addressLine2: 'Sea Point',
        addressLine3: 'Cape Town',
        addressLine4: '8005',
        kinRelationship: 'Spouse',
        kinName: 'Nomsa',
        kinSurname: 'Mthembu',
        kinContactNumber: '077 777 8888',
        bankName: 'Capitec',
        accountHolderName: 'Thabo Mthembu',
        accountNumber: '147258369',
        branchCode: '470010',
        dayShift: true,
        nightShift: true,
        flexibleShift: true
      }
    ];

    // Add each sample employee
    sampleEmployees.forEach(employeeData => {
      addEmployee(employeeData);
    });

    console.log('Sample employees initialized successfully');
  }
};
