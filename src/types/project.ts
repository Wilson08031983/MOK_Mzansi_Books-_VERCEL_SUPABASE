// Shared project types for the application

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  // Optional proof of completion
  proofImage?: string; // base64 data URL
  proofImageType?: string; // MIME type, e.g., image/png
  proofImageName?: string; // original file name
  proofSnippet?: string; // short description / notes about the completed task
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
  expenses_list?: Expense[]; // Detailed list of all expenses including attendance pay
  salaryExpenses?: number; // Calculated salary expenses for assigned employees
  totalProjectExpenses?: number; // Total expenses including salaries and other expenses
  // Project type: 'timeline' projects have start/end dates and milestones; 'ongoing' are continuous entities like shops/markets
  projectType?: 'timeline' | 'ongoing';
  [key: string]: unknown; // For dynamic property access
}
