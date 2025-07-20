// Shared project types for the application

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  receipt?: string;
  receiptType?: string;
  receiptName?: string;
  notes?: string;
}

export interface ProjectEmployee {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  position: string;
  department: string;
  monthlySalary: number;
  assignedDate: string;
  role?: string; // Role in the project (e.g., 'Lead Developer', 'Designer')
  allocation: number; // Percentage allocation to project (0-100)
}

export interface TaskTemplate {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Project {
  id: number;
  name: string;
  client: string;
  clientId?: string;
  manager: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Cancelled' | 'Not Started' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  budget: number;
  expenses: number;
  startDate: string;
  endDate: string;
  team: string[]; // Keep for backward compatibility
  assignedEmployees?: ProjectEmployee[]; // New employee assignments
  tags: string[];
  description: string;
  code: string;
  tasks?: Task[];
  expenseItems?: Expense[];
  salaryExpenses?: number; // Calculated salary expenses for assigned employees
  totalProjectExpenses?: number; // Total expenses including salaries and other expenses
  [key: string]: unknown; // For dynamic property access
}
