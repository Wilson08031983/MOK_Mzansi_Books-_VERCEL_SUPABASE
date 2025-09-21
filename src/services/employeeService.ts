import { v4 as uuidv4 } from 'uuid';
import { scopedKey, getCurrentUserId } from '@/utils/safeAccess';

// Storage keys
const EMPLOYEES_KEY_BASE = 'employees';
const LEGACY_EMPLOYEES_KEY = 'employees';

/**
 * Get the storage key for employees, scoped to the current user
 * This ensures each account has its own isolated employee data
 */
export const getEmployeesStorageKey = (): string => {
  return scopedKey(EMPLOYEES_KEY_BASE);
};

// ID document type used in UI
export type IdType = 'ID Number' | 'Passport Number';
// Add stricter enums for employment, pay cycle, and employee status
export type EmploymentType = 'Full Time' | 'Part Time';
export type PaymentCycle = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
export type EmployeeStatus = 'active' | 'on-leave' | 'terminated';

// Migration flag (scoped per account)
const EMPLOYEE_MIGRATION_FLAG_BASE = 'employees_migrated_v1';
const getEmployeeMigrationFlagKey = (): string => scopedKey(EMPLOYEE_MIGRATION_FLAG_BASE);

// Validators
const isValidEmploymentType = (val: any): val is EmploymentType => val === 'Full Time' || val === 'Part Time';
const isValidPaymentCycle = (val: any): val is PaymentCycle => (
  val === 'Daily' || val === 'Weekly' || val === 'Bi-Weekly' || val === 'Monthly'
);
const isValidEmployeeStatus = (val: any): val is EmployeeStatus => (
  val === 'active' || val === 'on-leave' || val === 'terminated'
);

// Generators (local to avoid circular deps)
const generateDefaultIdNumber = (): string => {
  const year = Math.floor(Math.random() * 30) + 70; // 70-99 (1970-1999)
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  const citizenship = Math.floor(Math.random() * 2); // 0 or 1
  const gender = Math.floor(Math.random() * 10);
  return `${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${sequence}0${citizenship}${gender}`;
};

/**
 * Employee interface definition
 */
export interface Employee {
  id: string;
  employeeNumber?: string;
  firstName?: string;
  surname?: string;
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  position?: string;
  department?: string;
  startDate?: string;
  status?: EmployeeStatus;
  location?: string;
  employmentType?: EmploymentType;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  kinName?: string;
  kinSurname?: string;
  kinRelationship?: string;
  kinContactNumber?: string;
  dayShift?: boolean;
  nightShift?: boolean;
  flexibleShift?: boolean;
  accountHolderName?: string;
  salary?: number;
  paymentCycle?: PaymentCycle;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  taxPercentage?: number;
  avatar?: string;
  // Identification fields (used across modals and sync services)
  idType?: IdType;
  idValue?: string;
}

/**
 * Employee form data interface
 */
export interface EmployeeFormData {
  firstName: string;
  surname: string;
  email: string;
  contactNumber: string;
  position: string;
  department: string;
  startDate: string;
  status?: EmployeeStatus;
  location?: string;
  employmentType?: EmploymentType;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  kinName?: string;
  kinSurname?: string;
  kinRelationship?: string;
  kinContactNumber?: string;
  dayShift?: boolean;
  nightShift?: boolean;
  flexibleShift?: boolean;
  accountHolderName?: string;
  salary?: number;
  paymentCycle?: PaymentCycle;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  taxPercentage?: number;
  avatar?: string;
  // Identification fields (required in form)
  idType: IdType;
  idValue: string;
}

// Normalize and migrate data if needed (runs once per account)
const migrateEmployeeDataIfNeeded = (): void => {
  try {
    const flagKey = getEmployeeMigrationFlagKey();
    const alreadyMigrated = localStorage.getItem(flagKey);
    if (alreadyMigrated === 'true') return;

    const key = getEmployeesStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(flagKey, 'true');
      return;
    }

    let parsed: any[];
    try {
      parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(flagKey, 'true');
        return;
      }
    } catch {
      localStorage.setItem(flagKey, 'true');
      return;
    }

    const existingIdValues = new Set<string>();
    parsed.forEach((e) => { if (e && typeof e.idValue === 'string') existingIdValues.add(e.idValue); });

    let changed = false;
    const migrated = parsed.map((emp) => {
      const e = { ...emp } as any;

      // Ensure idType/idValue
      if (!e.idType || (e.idType !== 'ID Number' && e.idType !== 'Passport Number')) {
        e.idType = 'ID Number';
        changed = true;
      }
      if (!e.idValue || typeof e.idValue !== 'string' || e.idValue.trim() === '') {
        // generate unique
        let candidate = generateDefaultIdNumber();
        let guard = 0;
        while (existingIdValues.has(candidate) && guard < 10) {
          candidate = generateDefaultIdNumber();
          guard++;
        }
        e.idValue = candidate;
        existingIdValues.add(candidate);
        changed = true;
      }

      // Coerce enums if present
      if (e.employmentType !== undefined && !isValidEmploymentType(e.employmentType)) {
        e.employmentType = 'Full Time';
        changed = true;
      }
      if (e.paymentCycle !== undefined && !isValidPaymentCycle(e.paymentCycle)) {
        e.paymentCycle = 'Monthly';
        changed = true;
      }
      if (e.status !== undefined && !isValidEmployeeStatus(e.status)) {
        e.status = 'active';
        changed = true;
      }

      return e;
    });

    if (changed) {
      localStorage.setItem(key, JSON.stringify(migrated));
      console.log('[employeeService] Employee data migrated (idType/idValue backfilled and enums normalized)');
    }

    localStorage.setItem(flagKey, 'true');
  } catch (err) {
    // Non-blocking
    console.warn('[employeeService] Migration check failed', err);
  }
};

// Public helper to run migration manually (optional external usage)
export const runEmployeeDataMigration = (): { migrated: boolean } => {
  const beforeFlag = localStorage.getItem(getEmployeeMigrationFlagKey());
  // force-clear the flag to re-run in a controlled way
  try {
    localStorage.removeItem(getEmployeeMigrationFlagKey());
  } catch {}
  migrateEmployeeDataIfNeeded();
  const afterFlag = localStorage.getItem(getEmployeeMigrationFlagKey());
  return { migrated: beforeFlag !== afterFlag };
};

/**
 * Get all employees from localStorage
 */
export const getAllEmployees = (): Employee[] => {
  try {
    // Ensure one-time migration happens before reads
    migrateEmployeeDataIfNeeded();
    const scopedKey = getEmployeesStorageKey();
    const employees = localStorage.getItem(scopedKey);
    return employees ? JSON.parse(employees) : [];
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
};

/**
 * Set all employees in localStorage
 */
export const setAllEmployees = (employees: Employee[]): void => {
  try {
    const scopedKey = getEmployeesStorageKey();
    localStorage.setItem(scopedKey, JSON.stringify(employees));
  } catch (error) {
    console.error('Error setting employees:', error);
  }
};

/**
 * Add a new employee
 */
export const addEmployee = (employeeData: EmployeeFormData): Employee => {
  try {
    const employees = getAllEmployees();
    const newEmployee: Employee = {
      id: uuidv4(),
      employeeNumber: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      ...employeeData
    };
    
    employees.push(newEmployee);
    setAllEmployees(employees);
    
    return newEmployee;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw new Error('Failed to add employee');
  }
};

/**
 * Update an existing employee
 */
export const updateEmployee = (id: string, employeeData: Partial<Employee>): Employee => {
  try {
    const employees = getAllEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index === -1) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    const updatedEmployee = { ...employees[index], ...employeeData };
    employees[index] = updatedEmployee;
    
    setAllEmployees(employees);
    return updatedEmployee;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw new Error('Failed to update employee');
  }
};

/**
 * Delete an employee
 */
export const deleteEmployee = (id: string): boolean => {
  try {
    const employees = getAllEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    
    if (filteredEmployees.length === employees.length) {
      return false; // No employee was deleted
    }
    
    setAllEmployees(filteredEmployees);
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

/**
 * Get an employee by ID
 */
export const getEmployeeById = (id: string): Employee | null => {
  try {
    const employees = getAllEmployees();
    return employees.find(emp => emp.id === id) || null;
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return null;
  }
};

/**
 * Clean up duplicate employees
 */
export const cleanupDuplicateEmployees = (): number => {
  try {
    const employees = getAllEmployees();
    const uniqueEmails = new Set<string>();
    const uniqueEmployees: Employee[] = [];
    let duplicatesRemoved = 0;
    
    employees.forEach(emp => {
      if (emp.email && uniqueEmails.has(emp.email.toLowerCase())) {
        duplicatesRemoved++;
      } else {
        if (emp.email) uniqueEmails.add(emp.email.toLowerCase());
        uniqueEmployees.push(emp);
      }
    });
    
    if (duplicatesRemoved > 0) {
      setAllEmployees(uniqueEmployees);
    }
    
    return duplicatesRemoved;
  } catch (error) {
    console.error('Error cleaning up duplicate employees:', error);
    return 0;
  }
};

/**
 * Reset and initialize employees
 */
export const resetAndInitializeEmployees = (): void => {
  try {
    setAllEmployees([]);
  } catch (error) {
    console.error('Error resetting employees:', error);
  }
};

/**
 * Force cleanup of duplicates
 */
export const forceCleanupDuplicates = (): number => {
  return cleanupDuplicateEmployees();
};

/**
 * Ensures a new account starts with empty employee data
 * This should be called during account creation or when switching accounts
 */
export const initializeEmptyEmployeeData = (): void => {
  try {
    const scopedKey = getEmployeesStorageKey();
    // Set an empty array as the initial employee data for this account
    localStorage.setItem(scopedKey, JSON.stringify([]));
    console.log('[employeeService] Initialized empty employee data for new account');
  } catch (e) {
    console.error('[employeeService] Failed to initialize empty employee data', e);
  }
};
