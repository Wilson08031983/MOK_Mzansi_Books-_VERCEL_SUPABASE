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

// Helper: ensure we generate a unique ID number (avoid collisions in demo data)
const generateUniqueIdNumber = (): string => {
  const employees = getAllEmployees();
  let attempts = 0;
  let generated: string;
  do {
    generated = generateDefaultIdNumber();
    attempts++;
    // Safety cap to avoid infinite loops
    if (attempts > 10) break;
  } while (employees.some(e => e.idValue === generated));
  return generated;
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

    // Prefer to match existing employee by the company email first to avoid duplicate creation
    const normalizedEmail = companyDetails.email?.toLowerCase();
    const employees = getAllEmployees();
    let ownerEmployee = employees.find(emp => emp.email.toLowerCase() === normalizedEmail) || findOwnerEmployeeRecord();
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
        idValue: generateUniqueIdNumber(),
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

      try {
        ownerEmployee = addEmployee(newEmployeeData);
        return {
          success: true,
          message: 'Company owner added as new employee record',
          updatedEmployee: ownerEmployee
        };
      } catch (err) {
        // Graceful fallback: if duplicate error, update existing by email instead of failing
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg && errMsg.toLowerCase().includes('already exists')) {
          const existing = employees.find(emp => emp.email.toLowerCase() === normalizedEmail);
          if (existing) {
            const updatedEmployee = updateEmployee(existing.id, {
              firstName: companyDetails.ownerName,
              surname: companyDetails.ownerSurname,
              email: companyDetails.email,
              contactNumber: companyDetails.phone,
              position: companyDetails.ownerPosition,
              department: getPositionDepartment(companyDetails.ownerPosition),
              addressLine1: companyDetails.addressLine1,
              addressLine2: companyDetails.addressLine2 || existing.addressLine2,
              addressLine3: companyDetails.addressLine3 || existing.addressLine3,
              addressLine4: companyDetails.addressLine4 || existing.addressLine4,
            });
            if (updatedEmployee) {
              return {
                success: true,
                message: 'Existing owner employee found; details updated',
                updatedEmployee
              };
            }
          }
        }
        // If not a duplicate scenario, rethrow
        throw err;
      }
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
  // Guard against undefined/null positions
  const positionLower = (position || '').toLowerCase();
  
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
  // Basic salary ranges based on position
  const positionLower = (position || '').toLowerCase();
  
  if (positionLower.includes('ceo') || positionLower.includes('chief executive')) {
    return 150000;
  } else if (positionLower.includes('director')) {
    return 120000;
  } else if (positionLower.includes('founder')) {
    return 200000;
  } else if (positionLower.includes('manager')) {
    return 80000;
  } else if (positionLower.includes('bookkeeper') || positionLower.includes('accountant')) {
    return 45000;
  } else {
    return 35000;
  }
};

const generateDefaultIdNumber = (): string => {
  // Generate a synthetic SA ID-like number (YYMMDDSSSSCCG)
  const year = Math.floor(Math.random() * 30) + 70; // 70-99 (1970-1999)
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  const citizenship = Math.floor(Math.random() * 2); // 0 or 1
  const gender = Math.floor(Math.random() * 10);
  
  return `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${sequence}0${citizenship}${gender}`;
};

export const initializeCompanyDetails = (): void => {
  try {
    const existing = getCompanyDetails();
    if (!existing) {
      const defaults: CompanyDetails = {
        companyName: 'Morwa Moabelo (PTY) Ltd',
        email: 'admin@mokmzansibooks.com',
        phone: '+27 000 000 0000',
        website: 'www.mokmzansibooks.com',
        ownerName: 'System',
        ownerSurname: 'Admin',
        ownerPosition: 'Administrator',
        addressLine1: '123 Business Street',
        addressLine2: 'Business District',
        addressLine3: 'Johannesburg, Gauteng',
        addressLine4: '2000, South Africa'
      };
      saveCompanyDetails(defaults);
    }
  } catch (error) {
    console.error('Error initializing company details:', error);
  }
};

export const autoSyncCompanyEmployee = (): void => {
  try {
    const result = syncCompanyDetailsToEmployee();
    console.log('Auto-sync result:', result);
  } catch (error) {
    console.error('Auto-sync failed:', error);
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
