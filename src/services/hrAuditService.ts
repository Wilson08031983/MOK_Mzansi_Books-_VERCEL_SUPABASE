import { auditService, type AuditEntry } from './auditService';
import { Employee } from './employeeService';

interface Qualification {
  id: string;
  employeeId: string;
  institute: string;
  startDate: string;
  endDate: string;
  nqfLevel: number;
}

const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem('mokUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id || 'unknown',
        name: user.user_metadata?.full_name || 
              `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
              user.email?.split('@')[0] || 'Unknown User',
        role: user.user_metadata?.role || 'User',
        email: user.email || 'unknown@example.com'
      };
    }
  } catch (error) {
    console.error('Error getting user info for audit log:', error);
  }
  return { id: 'system', name: 'System', role: 'System', email: 'system@example.com' };
};

export const logEmployeeStatusChange = async (
  employee: Employee,
  previousStatus: string,
  newStatus: string
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Employee Status Updated',
    changeType: 'update',
    severity: 'medium',
    page: 'HR Management',
    section: 'Employee Directory',
    entityType: 'employee',
    entityId: employee.id,
    entityName: `${employee.firstName} ${employee.surname}`,
    description: `Updated employee status from ${previousStatus} to ${newStatus}`,
    oldValues: { status: previousStatus },
    newValues: { status: newStatus },
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
  } catch (error) {
    console.error('Failed to log employee status change:', error);
  }
};

export const logQualificationAdded = async (
  qualification: Qualification,
  employee: Employee
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Qualification Added',
    changeType: 'create',
    severity: 'medium',
    page: 'HR Management',
    section: 'Training Management',
    entityType: 'employee_qualification',
    entityId: qualification.id,
    entityName: `${qualification.institute} (${employee.firstName} ${employee.surname})`,
    description: `Added qualification "${qualification.institute}" to employee ${employee.firstName} ${employee.surname}`,
    newValues: { 
      qualificationName: qualification.institute,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      dateAdded: new Date().toISOString()
    },
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
  } catch (error) {
    console.error('Failed to log qualification addition:', error);
  }
};

export const logQualificationDeleted = async (
  qualification: Qualification,
  employee: Employee
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Qualification Deleted',
    changeType: 'delete',
    severity: 'high',
    page: 'HR Management',
    section: 'Training Management',
    entityType: 'employee_qualification',
    entityId: qualification.id,
    entityName: `${qualification.institute} (${employee.firstName} ${employee.surname})`,
    description: `Deleted qualification "${qualification.institute}" from employee ${employee.firstName} ${employee.surname}`,
    oldValues: {
      qualificationName: qualification.institute,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      dateAdded: qualification.startDate
    },
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
  } catch (error) {
    console.error('Failed to log qualification deletion:', error);
  }
};

export const logEmployeeCreated = async (
  employee: Employee
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Employee Created',
    changeType: 'create',
    severity: 'high',
    page: 'HR Management',
    section: 'Employee Directory',
    entityType: 'employee',
    entityId: employee.id,
    entityName: `${employee.firstName} ${employee.surname}`,
    description: `Created new employee: ${employee.firstName} ${employee.surname}`,
    newValues: {
      firstName: employee.firstName,
      surname: employee.surname,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      startDate: employee.startDate
    },
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
  } catch (error) {
    console.error('Failed to log employee creation:', error);
  }
};

export const logEmployeeUpdated = async (
  employee: Employee,
  updatedFields: Partial<Employee>
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};
  
  // Transform changes into oldValues and newValues objects
  Object.entries(updatedFields).forEach(([field, newValue]) => {
    if (employee[field as keyof Employee] !== undefined) oldValues[field] = employee[field as keyof Employee];
    newValues[field] = newValue;
  });
  
  const changedFields = Object.keys(updatedFields).join(', ');
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Employee Updated',
    changeType: 'update',
    severity: 'medium',
    page: 'HR Management',
    section: 'Employee Directory',
    entityType: 'employee',
    entityId: employee.id,
    entityName: `${employee.firstName} ${employee.surname}`,
    description: `Updated employee ${employee.firstName} ${employee.surname}: ${changedFields}`,
    oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined,
    newValues: Object.keys(newValues).length > 0 ? newValues : undefined,
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
  } catch (error) {
    console.error('Failed to log employee update:', error);
  }
};

export const logEmployeeDeleted = async (
  employee: Employee
): Promise<void> => {
  const { id: userId, name: userName, role: userRole } = getCurrentUserInfo();
  
  const auditEntry: Partial<AuditEntry> = {
    category: 'hr',
    action: 'Employee Deleted',
    changeType: 'delete',
    severity: 'high',
    page: 'HR Management',
    section: 'Employee Directory',
    entityType: 'employee',
    entityId: employee.id,
    entityName: `${employee.firstName} ${employee.surname}`,
    description: `Deleted employee: ${employee.firstName} ${employee.surname}`,
    oldValues: {
      firstName: employee.firstName,
      surname: employee.surname,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      startDate: employee.startDate
    },
    userId,
    userName,
    userRole,
    timestamp: new Date().toISOString(),
    immutable: true
  };

  try {
    await auditService.logAudit(auditEntry);
      severity: 'high'
    });
  } catch (error) {
    console.error('Failed to log employee deletion:', error);
    throw error;
  }
};

export default {
  logEmployeeStatusChange,
  logQualificationAdded,
  logQualificationDeleted,
  logEmployeeCreated,
  logEmployeeUpdated,
  logEmployeeDeleted
};
