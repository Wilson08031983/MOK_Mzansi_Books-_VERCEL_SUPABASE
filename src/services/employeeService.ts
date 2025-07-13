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
  return employees ? JSON.parse(employees) : [];
};

export const addEmployee = (employeeData: EmployeeFormData): Employee => {
  const employees = getAllEmployees();
  
  const newEmployee: Employee = {
    ...employeeData,
    id: uuidv4(),
    status: 'active',
    employeeNumber: generateEmployeeNumber(
      employeeData.firstName,
      employeeData.surname,
      employeeData.startDate,
      employeeData.idValue
    )
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
