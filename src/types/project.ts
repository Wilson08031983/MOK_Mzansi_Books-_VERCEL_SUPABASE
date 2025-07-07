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
  team: string[];
  tags: string[];
  description: string;
  code: string;
  tasks?: Task[];
  expenseItems?: Expense[];
  [key: string]: unknown; // For dynamic property access
}
