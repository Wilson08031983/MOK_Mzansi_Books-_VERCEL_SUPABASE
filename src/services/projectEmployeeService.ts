import { Project, ProjectEmployee } from '@/types/project';
import { Employee, getAllEmployees } from '@/services/employeeService';

/**
 * Service for managing employee assignments to projects and calculating salary expenses
 */

/**
 * Calculate the total salary expense for a project based on assigned employees
 * @param project - The project to calculate expenses for
 * @returns Total salary expense for the project duration
 */
export const calculateProjectSalaryExpenses = (project: Project): number => {
  if (!project.assignedEmployees || project.assignedEmployees.length === 0) {
    return 0;
  }

  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  
  // Calculate project duration in months
  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth()) + 
                     (endDate.getDate() >= startDate.getDate() ? 1 : 0);
  
  const projectDurationMonths = Math.max(1, monthsDiff); // At least 1 month

  let totalSalaryExpense = 0;

  project.assignedEmployees.forEach(employee => {
    // Calculate salary based on allocation percentage
    const monthlySalaryForProject = (employee.monthlySalary * employee.allocation) / 100;
    const totalSalaryForDuration = monthlySalaryForProject * projectDurationMonths;
    totalSalaryExpense += totalSalaryForDuration;
  });

  return Math.round(totalSalaryExpense);
};

/**
 * Assign an employee to a project
 * @param projectId - ID of the project
 * @param employeeId - ID of the employee to assign
 * @param role - Role of the employee in the project
 * @param allocation - Percentage allocation (0-100)
 * @returns Updated project with the employee assigned
 */
export const assignEmployeeToProject = (
  project: Project,
  employeeId: string,
  role: string = '',
  allocation: number = 100
): Project => {
  const employees = getAllEmployees();
  const employee = employees.find(emp => emp.id === employeeId);
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  if (!project.assignedEmployees) {
    project.assignedEmployees = [];
  }

  // Check if employee is already assigned
  const existingAssignment = project.assignedEmployees.find(
    assigned => assigned.employeeId === employeeId
  );

  if (existingAssignment) {
    throw new Error('Employee is already assigned to this project');
  }

  const projectEmployee: ProjectEmployee = {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.surname}`,
    employeeNumber: employee.employeeNumber,
    position: employee.position,
    department: employee.department,
    monthlySalary: employee.salary,
    assignedDate: new Date().toISOString().split('T')[0],
    role: role,
    allocation: Math.min(100, Math.max(0, allocation)) // Ensure allocation is between 0-100
  };

  project.assignedEmployees.push(projectEmployee);

  // Update team array for backward compatibility
  if (!project.team.includes(projectEmployee.employeeName)) {
    project.team.push(projectEmployee.employeeName);
  }

  // Recalculate salary expenses
  project.salaryExpenses = calculateProjectSalaryExpenses(project);
  project.totalProjectExpenses = (project.expenses || 0) + (project.salaryExpenses || 0);

  return project;
};

/**
 * Remove an employee from a project
 * @param project - The project to remove employee from
 * @param employeeId - ID of the employee to remove
 * @returns Updated project with the employee removed
 */
export const removeEmployeeFromProject = (project: Project, employeeId: string): Project => {
  if (!project.assignedEmployees) {
    return project;
  }

  const employeeToRemove = project.assignedEmployees.find(
    assigned => assigned.employeeId === employeeId
  );

  if (!employeeToRemove) {
    throw new Error('Employee is not assigned to this project');
  }

  // Remove from assignedEmployees
  project.assignedEmployees = project.assignedEmployees.filter(
    assigned => assigned.employeeId !== employeeId
  );

  // Remove from team array for backward compatibility
  project.team = project.team.filter(name => name !== employeeToRemove.employeeName);

  // Recalculate salary expenses
  project.salaryExpenses = calculateProjectSalaryExpenses(project);
  project.totalProjectExpenses = (project.expenses || 0) + (project.salaryExpenses || 0);

  return project;
};

/**
 * Update an employee's assignment in a project
 * @param project - The project to update
 * @param employeeId - ID of the employee to update
 * @param updates - Updates to apply to the assignment
 * @returns Updated project
 */
export const updateEmployeeAssignment = (
  project: Project,
  employeeId: string,
  updates: Partial<Pick<ProjectEmployee, 'role' | 'allocation'>>
): Project => {
  if (!project.assignedEmployees) {
    throw new Error('No employees assigned to this project');
  }

  const employeeIndex = project.assignedEmployees.findIndex(
    assigned => assigned.employeeId === employeeId
  );

  if (employeeIndex === -1) {
    throw new Error('Employee is not assigned to this project');
  }

  // Update the assignment
  if (updates.role !== undefined) {
    project.assignedEmployees[employeeIndex].role = updates.role;
  }

  if (updates.allocation !== undefined) {
    project.assignedEmployees[employeeIndex].allocation = Math.min(100, Math.max(0, updates.allocation));
  }

  // Recalculate salary expenses
  project.salaryExpenses = calculateProjectSalaryExpenses(project);
  project.totalProjectExpenses = (project.expenses || 0) + (project.salaryExpenses || 0);

  return project;
};

/**
 * Get available employees for assignment to a project
 * @param project - The project to check against
 * @returns List of employees not yet assigned to the project
 */
export const getAvailableEmployeesForProject = (project: Project): Employee[] => {
  const allEmployees = getAllEmployees();
  const assignedEmployeeIds = project.assignedEmployees?.map(assigned => assigned.employeeId) || [];
  
  return allEmployees.filter(employee => 
    employee.status === 'active' && 
    !assignedEmployeeIds.includes(employee.id)
  );
};

/**
 * Get project assignments for a specific employee
 * @param employeeId - ID of the employee
 * @param projects - List of all projects
 * @returns List of projects the employee is assigned to
 */
export const getEmployeeProjectAssignments = (employeeId: string, projects: Project[]): Project[] => {
  return projects.filter(project => 
    project.assignedEmployees?.some(assigned => assigned.employeeId === employeeId)
  );
};

/**
 * Calculate total salary allocation for an employee across all projects
 * @param employeeId - ID of the employee
 * @param projects - List of all projects
 * @returns Total allocation percentage across all projects
 */
export const calculateEmployeeTotalAllocation = (employeeId: string, projects: Project[]): number => {
  const activeProjects = projects.filter(project => 
    project.status !== 'Completed' && 
    project.status !== 'Cancelled' &&
    project.assignedEmployees?.some(assigned => assigned.employeeId === employeeId)
  );

  return activeProjects.reduce((total, project) => {
    const assignment = project.assignedEmployees?.find(assigned => assigned.employeeId === employeeId);
    return total + (assignment?.allocation || 0);
  }, 0);
};
