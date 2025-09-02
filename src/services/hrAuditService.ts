import { auditService } from './auditService';
import { Employee } from './employeeService';

interface Qualification {
  id: string;
  employeeId: string;
  institute: string;
  startDate: string;
  endDate: string;
  nqfLevel: number;
}

export const logEmployeeStatusChange = async (
  employee: Employee,
  previousStatus: string,
  newStatus: string
): Promise<void> => {
  try {
    auditService.logAudit({
      category: 'hr',
      action: 'Employee Status Updated',
      page: 'HR Management',
      section: 'Employee Directory',
      entityType: 'employee',
      entityId: employee.id,
      entityName: `${employee.firstName} ${employee.surname}`,
      changeType: 'update',
      oldValues: { status: previousStatus },
      newValues: { status: newStatus },
      description: `Updated employee status from ${previousStatus} to ${newStatus}`,
      severity: 'medium'
    });
  } catch (error) {
    console.error('Failed to log employee status change:', error);
  }
};

export const logQualificationAdded = async (
  qualification: Qualification,
  employee: Employee
): Promise<void> => {
  try {
    auditService.logAudit({
      category: 'hr',
      action: 'Qualification Added',
      page: 'HR Management',
      section: 'Training Management',
      entityType: 'employee_qualification',
      entityId: qualification.id,
      entityName: `${qualification.institute} (${employee.firstName} ${employee.surname})`,
      changeType: 'create',
      newValues: {
        qualificationName: qualification.institute,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.surname}`,
        dateAdded: new Date().toISOString()
      },
      description: `Added qualification "${qualification.institute}" to employee ${employee.firstName} ${employee.surname}`,
      severity: 'medium'
    });
  } catch (error) {
    console.error('Failed to log qualification addition:', error);
  }
};

export const logQualificationDeleted = async (
  qualification: Qualification,
  employee: Employee
): Promise<void> => {
  try {
    auditService.logAudit({
      category: 'hr',
      action: 'Qualification Deleted',
      page: 'HR Management',
      section: 'Training Management',
      entityType: 'employee_qualification',
      entityId: qualification.id,
      entityName: `${qualification.institute} (${employee.firstName} ${employee.surname})`,
      changeType: 'delete',
      oldValues: {
        qualificationName: qualification.institute,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.surname}`,
        dateAdded: qualification.startDate
      },
      description: `Deleted qualification "${qualification.institute}" from employee ${employee.firstName} ${employee.surname}`,
      severity: 'high'
    });
  } catch (error) {
    console.error('Failed to log qualification deletion:', error);
  }
};

export const logEmployeeCreated = async (
  employee: Employee
): Promise<void> => {
  try {
    auditService.logAudit({
      category: 'hr',
      action: 'Employee Created',
      page: 'HR Management',
      section: 'Employee Directory',
      entityType: 'employee',
      entityId: employee.id,
      entityName: `${employee.firstName} ${employee.surname}`,
      changeType: 'create',
      newValues: {
        firstName: employee.firstName,
        surname: employee.surname,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        employmentType: employee.employmentType,
        startDate: employee.startDate
      },
      description: `Created new employee: ${employee.firstName} ${employee.surname}`,
      severity: 'high'
    });
  } catch (error) {
    console.error('Failed to log employee creation:', error);
  }
};

export const logEmployeeUpdated = async (
  employee: Employee,
  updatedFields: Partial<Employee>
): Promise<void> => {
  try {
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    Object.entries(updatedFields).forEach(([field, newValue]) => {
      if (employee[field as keyof Employee] !== undefined) oldValues[field] = employee[field as keyof Employee];
      newValues[field] = newValue as unknown;
    });

    const changedFields = Object.keys(updatedFields).join(', ');

    auditService.logAudit({
      category: 'hr',
      action: 'Employee Updated',
      page: 'HR Management',
      section: 'Employee Directory',
      entityType: 'employee',
      entityId: employee.id,
      entityName: `${employee.firstName} ${employee.surname}`,
      changeType: 'update',
      oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined,
      newValues: Object.keys(newValues).length > 0 ? newValues : undefined,
      description: `Updated employee ${employee.firstName} ${employee.surname}: ${changedFields}`,
      severity: 'medium'
    });
  } catch (error) {
    console.error('Failed to log employee update:', error);
  }
};

export const logEmployeeDeleted = async (
  employee: Employee
): Promise<void> => {
  try {
    auditService.logAudit({
      category: 'hr',
      action: 'Employee Deleted',
      page: 'HR Management',
      section: 'Employee Directory',
      entityType: 'employee',
      entityId: employee.id,
      entityName: `${employee.firstName} ${employee.surname}`,
      changeType: 'delete',
      oldValues: {
        firstName: employee.firstName,
        surname: employee.surname,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        employmentType: employee.employmentType,
        startDate: employee.startDate
      },
      description: `Deleted employee: ${employee.firstName} ${employee.surname}`,
      severity: 'high'
    });
  } catch (error) {
    console.error('Failed to log employee deletion:', error);
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
