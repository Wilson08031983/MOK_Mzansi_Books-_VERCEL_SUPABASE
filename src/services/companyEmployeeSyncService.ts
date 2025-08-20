import { getAllEmployees, updateEmployee, addEmployee, Employee } from './employeeService';
import { getAllTeamMembers } from './localAuthService';

// Interface for company details
interface CompanyDetails {
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  ownerName: string;
  ownerSurname: string;
  ownerPosition: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
}

/**
 * Service to synchronize company owner details with HR Management employee records
 */

// Get company details from localStorage
const getCompanyDetails = (): CompanyDetails | null => {
  try {
    const companyData = localStorage.getItem('companyDetails');
    if (companyData) {
      return JSON.parse(companyData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving company details:', error);
    return null;
  }
};

// Save company details to localStorage
const saveCompanyDetails = (details: CompanyDetails): void => {
  try {
    localStorage.setItem('companyDetails', JSON.stringify(details));
  } catch (error) {
    console.error('Error saving company details:', error);
  }
};

// Find the admin/owner employee record
const findOwnerEmployeeRecord = (): Employee | null => {
  const employees = getAllEmployees();
  const teamMembers = getAllTeamMembers();
  
  // Find the admin user from team members (usually the first admin)
  const adminUser = teamMembers.find(member => 
    member.email === 'admin@mokmzansibooks.com' || 
    member.isAdmin === true
  );
  
  if (adminUser) {
    // Find corresponding employee record
    const employeeRecord = employees.find(emp => 
      emp.email.toLowerCase() === adminUser.email.toLowerCase()
    );
    return employeeRecord || null;
  }
  
  // Fallback: find any employee with admin email
  return employees.find(emp => 
    emp.email === 'admin@mokmzansibooks.com'
  ) || null;
};

// Sync company details to employee record
export const syncCompanyDetailsToEmployee = (): {
  success: boolean;
  message: string;
  updatedEmployee?: Employee;
} => {
  try {
    const companyDetails = getCompanyDetails();
    console.log('Sync Debug - Company Details:', companyDetails);
    
    if (!companyDetails) {
      console.log('Sync Debug - No company details found');
      return {
        success: false,
        message: 'No company details found to sync'
      };
    }

    let ownerEmployee = findOwnerEmployeeRecord();
    console.log('Sync Debug - Found owner employee:', ownerEmployee);
    
    if (!ownerEmployee) {
      console.log('Sync Debug - Creating new employee record');
      // Create new employee record for the company owner
      const newEmployeeData = {
        firstName: companyDetails.ownerName,
        surname: companyDetails.ownerSurname,
        email: companyDetails.email,
        contactNumber: companyDetails.phone,
        position: companyDetails.ownerPosition,
        department: getPositionDepartment(companyDetails.ownerPosition),
        salary: getPositionSalary(companyDetails.ownerPosition),
        
        // Address information
        addressLine1: companyDetails.addressLine1,
        addressLine2: companyDetails.addressLine2 || '',
        addressLine3: companyDetails.addressLine3 || '',
        addressLine4: companyDetails.addressLine4 || '',
        
        // Default values
        idType: 'ID Number' as const,
        idValue: generateDefaultIdNumber(),
        dateOfBirth: '1980-01-01',
        employmentType: 'Full Time' as const,
        startDate: new Date().toISOString().split('T')[0],
        paymentCycle: 'Monthly' as const,
        taxPercentage: 25,
        location: 'Head Office',
        
        // Next of kin defaults
        kinRelationship: 'Spouse',
        kinName: 'Emergency',
        kinSurname: 'Contact',
        kinContactNumber: '000 000 0000',
        
        // Bank details defaults
        bankName: 'Standard Bank',
        accountHolderName: `${companyDetails.ownerName} ${companyDetails.ownerSurname}`,
        accountNumber: '000000000',
        branchCode: '051001',
        
        // Shifts
        dayShift: true,
        nightShift: false,
        flexibleShift: false,
      };

      ownerEmployee = addEmployee(newEmployeeData);
      
      return {
        success: true,
        message: 'Company owner added as new employee record',
        updatedEmployee: ownerEmployee
      };
    } else {
      // Update existing employee record
      const updatedData = {
        firstName: companyDetails.ownerName,
        surname: companyDetails.ownerSurname,
        email: companyDetails.email,
        contactNumber: companyDetails.phone,
        position: companyDetails.ownerPosition,
        department: getPositionDepartment(companyDetails.ownerPosition),
        
        // Address information
        addressLine1: companyDetails.addressLine1,
        addressLine2: companyDetails.addressLine2 || ownerEmployee.addressLine2,
        addressLine3: companyDetails.addressLine3 || ownerEmployee.addressLine3,
        addressLine4: companyDetails.addressLine4 || ownerEmployee.addressLine4,
      };

      const updatedEmployee = updateEmployee(ownerEmployee.id, updatedData);
      
      if (updatedEmployee) {
        return {
          success: true,
          message: 'Company owner employee record updated successfully',
          updatedEmployee
        };
      } else {
        return {
          success: false,
          message: 'Failed to update employee record'
        };
      }
    }
  } catch (error) {
    console.error('Error syncing company details to employee:', error);
    return {
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Sync employee record back to company details
export const syncEmployeeToCompanyDetails = (employee: Employee): {
  success: boolean;
  message: string;
} => {
  try {
    const currentCompanyDetails = getCompanyDetails();
    
    const updatedCompanyDetails: CompanyDetails = {
      companyName: currentCompanyDetails?.companyName || 'Morwa Moabelo (PTY) Ltd',
      email: employee.email,
      phone: employee.contactNumber,
      website: currentCompanyDetails?.website || 'www.mokmzansibooks.com',
      ownerName: employee.firstName,
      ownerSurname: employee.surname,
      ownerPosition: employee.position,
      addressLine1: employee.addressLine1,
      addressLine2: employee.addressLine2,
      addressLine3: employee.addressLine3,
      addressLine4: employee.addressLine4,
    };

    saveCompanyDetails(updatedCompanyDetails);
    
    return {
      success: true,
      message: 'Company details updated from employee record'
    };
  } catch (error) {
    console.error('Error syncing employee to company details:', error);
    return {
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get department based on position
const getPositionDepartment = (position: string): string => {
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes('ceo') || positionLower.includes('chief executive')) {
    return 'Executive';
  } else if (positionLower.includes('manager')) {
    return 'Management';
  } else if (positionLower.includes('director')) {
    return 'Executive';
  } else if (positionLower.includes('founder')) {
    return 'Executive';
  } else if (positionLower.includes('bookkeeper') || positionLower.includes('accountant')) {
    return 'Finance';
  } else {
    return 'General';
  }
};

// Get salary based on position
const getPositionSalary = (position: string): number => {
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes('ceo') || positionLower.includes('chief executive')) {
    return 150000;
  } else if (positionLower.includes('founder')) {
    return 200000;
  } else if (positionLower.includes('director')) {
    return 120000;
  } else if (positionLower.includes('manager')) {
    return 80000;
  } else if (positionLower.includes('bookkeeper') || positionLower.includes('accountant')) {
    return 45000;
  } else {
    return 50000; // Default for owner/admin
  }
};

// Generate a default ID number (for demo purposes)
const generateDefaultIdNumber = (): string => {
  const year = Math.floor(Math.random() * 30) + 70; // 70-99 (1970-1999)
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  const citizenship = Math.floor(Math.random() * 2); // 0 or 1
  const gender = Math.floor(Math.random() * 10);
  
  return `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${sequence}0${citizenship}${gender}`;
};

// Initialize company details if they don't exist
export const initializeCompanyDetails = (): void => {
  const existingDetails = getCompanyDetails();
  
  if (!existingDetails) {
    const defaultCompanyDetails: CompanyDetails = {
      companyName: 'Morwa Moabelo (PTY) Ltd',
      email: 'admin@mokmzansibooks.com',
      phone: '+27 64 550 4029',
      website: 'www.mokmzansibooks.com',
      ownerName: 'Admin',
      ownerSurname: 'User',
      ownerPosition: 'CEO',
      addressLine1: '81 Monokane Street',
      addressLine2: 'Soshanguve',
      addressLine3: 'Pretoria, Gauteng',
      addressLine4: '0152, South Africa',
    };
    
    saveCompanyDetails(defaultCompanyDetails);
    console.log('DEBUG: Initialized default company details');
  } else {
    console.log('DEBUG: Company details already exist, not overwriting:', existingDetails);
  }
};

// Auto-sync function to be called when company details or employee records change
export const autoSyncCompanyEmployee = (): void => {
  try {
    // Initialize company details if needed
    initializeCompanyDetails();
    
    // Sync company details to employee record
    const syncResult = syncCompanyDetailsToEmployee();
    
    if (syncResult.success) {
      console.log('Auto-sync completed:', syncResult.message);
    } else {
      console.warn('Auto-sync warning:', syncResult.message);
    }
  } catch (error) {
    console.error('Auto-sync error:', error);
  }
};

export const companyEmployeeSyncService = {
  syncCompanyDetailsToEmployee,
  syncEmployeeToCompanyDetails,
  initializeCompanyDetails,
  autoSyncCompanyEmployee,
  getCompanyDetails,
  saveCompanyDetails
};
