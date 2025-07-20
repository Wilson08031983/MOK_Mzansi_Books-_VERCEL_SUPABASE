import { v4 as uuidv4 } from 'uuid';
import { getAllTeamMembers } from './localAuthService';
import { Employee, getAllEmployees, addEmployee } from './employeeService';

// Type for team member from getAllTeamMembers
type TeamMember = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isAdmin: boolean;
};

/**
 * Service to synchronize team members from Company page to HR Management employees
 */

// Convert team member to employee format
const convertTeamMemberToEmployee = (teamMember: TeamMember): Omit<Employee, 'id' | 'employeeNumber' | 'status'> => {
  // Extract names from fullName or use email as fallback
  const fullName = teamMember.fullName || teamMember.email.split('@')[0];
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Unknown';
  const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

  // Generate default values based on role
  const roleBasedDefaults = getRoleBasedDefaults(teamMember.role);

  return {
    firstName,
    surname,
    email: teamMember.email,
    contactNumber: '000 000 0000', // Default since team members don't have phone in this structure
    idType: 'ID Number' as const,
    idValue: generateDefaultIdNumber(),
    dateOfBirth: '1990-01-01', // Default birth date
    employmentType: 'Full Time' as const,
    startDate: new Date().toISOString().split('T')[0], // Today's date
    paymentCycle: 'Monthly' as const,
    salary: roleBasedDefaults.salary,
    taxPercentage: 25, // Default tax percentage
    department: roleBasedDefaults.department,
    position: roleBasedDefaults.position,
    location: 'Head Office',
    
    // Address fields (defaults)
    addressLine1: '123 Business Street',
    addressLine2: 'Business District',
    addressLine3: 'Johannesburg, Gauteng',
    addressLine4: '2000, South Africa',
    
    // Next of kin (defaults)
    kinRelationship: 'Spouse',
    kinName: 'Emergency',
    kinSurname: 'Contact',
    kinContactNumber: '000 000 0000',
    
    // Bank details (defaults)
    bankName: 'Standard Bank',
    accountHolderName: `${firstName} ${surname}`,
    accountNumber: '000000000',
    branchCode: '051001',
    
    // Shifts (default to day shift)
    dayShift: true,
    nightShift: false,
    flexibleShift: false,
    
    avatar: undefined
  };
};

// Get role-based defaults for salary, department, and position
const getRoleBasedDefaults = (role: string) => {
  const roleDefaults = {
    'CEO': {
      salary: 150000,
      department: 'Executive',
      position: 'Chief Executive Officer'
    },
    'Manager': {
      salary: 80000,
      department: 'Management',
      position: 'Manager'
    },
    'Director': {
      salary: 120000,
      department: 'Executive',
      position: 'Director'
    },
    'Founder': {
      salary: 200000,
      department: 'Executive',
      position: 'Founder'
    },
    'Bookkeeper': {
      salary: 45000,
      department: 'Finance',
      position: 'Bookkeeper'
    },
    'Staff': {
      salary: 35000,
      department: 'General',
      position: 'Staff Member'
    }
  };

  return roleDefaults[role as keyof typeof roleDefaults] || roleDefaults['Staff'];
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

// Check if team member already exists as employee
const isTeamMemberSynced = (teamMember: TeamMember, employees: Employee[]): boolean => {
  return employees.some(emp => emp.email.toLowerCase() === teamMember.email.toLowerCase());
};

// Sync team members to employees
export const syncTeamMembersToEmployees = (): {
  success: boolean;
  syncedCount: number;
  skippedCount: number;
  errors: string[];
} => {
  try {
    const teamMembers = getAllTeamMembers();
    const existingEmployees = getAllEmployees();
    
    let syncedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    teamMembers.forEach(teamMember => {
      try {
        // Skip if already synced
        if (isTeamMemberSynced(teamMember, existingEmployees)) {
          skippedCount++;
          return;
        }

        // Convert and add as employee
        const employeeData = convertTeamMemberToEmployee(teamMember);
        addEmployee(employeeData);
        syncedCount++;
        
        console.log(`Synced team member ${teamMember.email} to employees`);
      } catch (error) {
        const errorMessage = `Failed to sync ${teamMember.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    });

    return {
      success: errors.length === 0,
      syncedCount,
      skippedCount,
      errors
    };
  } catch (error) {
    console.error('Error during team member sync:', error);
    return {
      success: false,
      syncedCount: 0,
      skippedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown sync error']
    };
  }
};

// Get sync status - check which team members are not yet synced
export const getSyncStatus = (): {
  totalTeamMembers: number;
  syncedMembers: number;
  unsyncedMembers: string[];
} => {
  const teamMembers = getAllTeamMembers();
  const employees = getAllEmployees();
  
  const unsyncedMembers: string[] = [];
  
  teamMembers.forEach(teamMember => {
    if (!isTeamMemberSynced(teamMember, employees)) {
      unsyncedMembers.push(teamMember.email);
    }
  });

  return {
    totalTeamMembers: teamMembers.length,
    syncedMembers: teamMembers.length - unsyncedMembers.length,
    unsyncedMembers
  };
};

// Update employee when team member is updated
export const updateEmployeeFromTeamMember = (teamMemberEmail: string): boolean => {
  try {
    const teamMembers = getAllTeamMembers();
    const teamMember = teamMembers.find(tm => tm.email.toLowerCase() === teamMemberEmail.toLowerCase());
    
    if (!teamMember) {
      console.warn(`Team member with email ${teamMemberEmail} not found`);
      return false;
    }

    const employees = getAllEmployees();
    const employeeIndex = employees.findIndex(emp => emp.email.toLowerCase() === teamMemberEmail.toLowerCase());
    
    if (employeeIndex === -1) {
      console.warn(`Employee with email ${teamMemberEmail} not found`);
      return false;
    }

    // Update employee with team member data
    const roleDefaults = getRoleBasedDefaults(teamMember.role);
    const fullName = teamMember.fullName || teamMember.email.split('@')[0];
    const nameParts = fullName.split(' ');
    
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      firstName: nameParts[0] || employees[employeeIndex].firstName,
      surname: nameParts.length > 1 ? nameParts.slice(1).join(' ') : employees[employeeIndex].surname,
      email: teamMember.email,
      salary: roleDefaults.salary,
      department: roleDefaults.department,
      position: roleDefaults.position,
      contactNumber: employees[employeeIndex].contactNumber // Keep existing phone number
    };

    // Save updated employees
    localStorage.setItem('employees', JSON.stringify(employees));
    
    console.log(`Updated employee ${teamMemberEmail} from team member data`);
    return true;
  } catch (error) {
    console.error(`Error updating employee from team member:`, error);
    return false;
  }
};

// Function to specifically sync default users (admin and regular user)
export const syncDefaultUsers = (): {
  success: boolean;
  syncedCount: number;
  errors: string[];
} => {
  try {
    const teamMembers = getAllTeamMembers();
    const existingEmployees = getAllEmployees();
    
    let syncedCount = 0;
    const errors: string[] = [];

    // Find the default admin and regular user
    const defaultUsers = teamMembers.filter(member => 
      member.email === 'admin@mokmzansibooks.com' || 
      member.email === 'user@mokmzansibooks.com'
    );

    defaultUsers.forEach(defaultUser => {
      try {
        // Skip if already synced
        if (isTeamMemberSynced(defaultUser, existingEmployees)) {
          return;
        }

        // Convert and add as employee
        const employeeData = convertTeamMemberToEmployee(defaultUser);
        addEmployee(employeeData);
        syncedCount++;
        
        console.log(`Synced default user ${defaultUser.email} to employees`);
      } catch (error) {
        const errorMessage = `Failed to sync default user ${defaultUser.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    });

    return {
      success: errors.length === 0,
      syncedCount,
      errors
    };
  } catch (error) {
    console.error('Error during default user sync:', error);
    return {
      success: false,
      syncedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown sync error']
    };
  }
};

export const teamEmployeeSyncService = {
  syncTeamMembersToEmployees,
  getSyncStatus,
  updateEmployeeFromTeamMember,
  syncDefaultUsers
};
