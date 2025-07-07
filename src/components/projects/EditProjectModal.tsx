import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, CheckSquare, Tag, DollarSign, FileText, Clock,
  User, Check, ChevronsUpDown, Loader2, Trash2, Upload, Eye, X
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllTeamMembers } from '@/services/localAuthService';

interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  receipt?: string; // JSON string with file data or base64 of the uploaded file
  receiptType?: string; // MIME type of the receipt file
  receiptName?: string; // Original filename of the receipt
  notes?: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  tasks: Task[];
}

interface Project {
  id: number;
  name: string;
  client: string;
  clientId?: string;
  manager: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Cancelled';
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
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
}

// Expense types list
const EXPENSE_TYPES = [
  'Rent',
  'Maintenance & Repairs',
  'Travel & Transportation',
  'Office Equipment',
  'Meals & Entertainment',
  'Motor Vehicle Repairs',
  'Tool and Machinery Hire',
  'Tool and Machinery Purchase',
  'Other Fees',
  'Material',
  'Other'
];

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project: initialProject, 
  onClose, 
  onSave 
}) => {
  // State for the project
  const [project, setProject] = useState<Project>({...initialProject});
  
  const [expensesTotal, setExpensesTotal] = useState<number>(0);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [teamMembers, setTeamMembers] = useState<{id: string; email: string; fullName: string; role: string; isAdmin: boolean}[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isTemplateSaveModalOpen, setIsTemplateSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Initialize tasks and expenses arrays if they don't exist
  useEffect(() => {
    if (!project.tasks) {
      setProject(prev => ({...prev, tasks: []}));
    }
    if (!project.expenseItems) {
      setProject(prev => ({...prev, expenseItems: []}));
    }
  }, [project]);

  useEffect(() => {
    // Load task templates from localStorage
    try {
      const storedTemplates = localStorage.getItem('taskTemplates');
      if (storedTemplates) {
        setTaskTemplates(JSON.parse(storedTemplates));
      }
    } catch (e) {
      console.error('Error loading task templates:', e);
    }

    // Load team members
    const members = getAllTeamMembers();
    setTeamMembers(members);

    // Load available tags from localStorage
    try {
      const storedTags = localStorage.getItem('projectTags');
      if (storedTags) {
        setAvailableTags(JSON.parse(storedTags));
      } else {
        // Default tags if none are found
        const defaultTags = ['UI/UX', 'Development', 'Marketing', 'Finance', 'Legal', 'Research', 'Design', 'Testing'];
        setAvailableTags(defaultTags);
        localStorage.setItem('projectTags', JSON.stringify(defaultTags));
      }
    } catch (e) {
      console.error('Error loading project tags:', e);
    }
  }, []); 

  useEffect(() => {
    // Calculate progress based on completed tasks
    if (project.tasks && project.tasks.length > 0) {
      const completedCount = project.tasks.filter(task => task.completed).length;
      const progress = Math.round((completedCount / project.tasks.length) * 100);
      setProject(prev => ({...prev, progress}));
    }
  }, [project.tasks]);

  
  // Calculate total expenses
  useEffect(() => {
    if (project.expenseItems && project.expenseItems.length > 0) {
      const total = project.expenseItems.reduce((sum, item) => sum + item.amount, 0);
      setProject(prev => ({...prev, expenses: total}));
    }
  }, [project.expenseItems]);

  // Handle save button click
  const handleCancel = () => {
    onClose();
  };

  // Function to update project properties directly
  const onProjectChange = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject(prevProject => ({
      ...prevProject,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Update the project with the current team members selection
    const updatedProject: Project = {
      ...project,
      team: selectedTeam
    };
    
    onSave(updatedProject);
    onClose();
  };

  // Task functions
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      completed: false
    };
    
    setProject(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask]
    }));
  };

  const removeTask = (taskId: string) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks?.filter(task => task.id !== taskId)
    }));
  };

  const updateTask = (taskId: string, field: keyof Task, value: string | boolean | number) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks?.map(task => 
        task.id === taskId ? {...task, [field]: value} : task
      )
    }));
  };

  // Save current tasks as a template
  const saveTaskTemplate = () => {
    if (!templateName.trim() || !project.tasks || project.tasks.length === 0) return;
    
    const newTemplate: TaskTemplate = {
      id: Date.now().toString(),
      name: templateName,
      tasks: [...project.tasks]
    };
    
    const updatedTemplates = [...taskTemplates, newTemplate];
    setTaskTemplates(updatedTemplates);
    localStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates));
    
    setTemplateName('');
    setIsTemplateSaveModalOpen(false);
  };

  // Load a task template
  const loadTaskTemplate = (templateId: string) => {
    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      // Clone the tasks to ensure new IDs
      const clonedTasks = template.tasks.map(task => ({
        ...task,
        id: Date.now() + Math.random().toString(),
        completed: false // Reset completion status
      }));
      
      setProject(prev => ({...prev, tasks: clonedTasks}));
    }
    setSelectedTemplate('');
  };

  // Expense functions
  const addExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      type: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    
    setProject(prev => ({
      ...prev,
      expenseItems: [...(prev.expenseItems || []), newExpense]
    }));
  };

  const removeExpense = (expenseId: string) => {
    setProject(prev => ({
      ...prev,
      expenseItems: prev.expenseItems?.filter(expense => expense.id !== expenseId)
    }));
  };

  const updateExpense = (expenseId: string, field: keyof Expense, value: string | number) => {
    setProject(prev => ({
      ...prev,
      expenseItems: prev.expenseItems?.map(expense => 
        expense.id === expenseId ? {...expense, [field]: value} : expense
      )
    }));
  };
  
  // State to track file upload loading state
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file upload with loading state and error handling
  const handleFileUpload = (expenseId: string, file: File) => {
    // Reset error state
    setUploadError(null);
    // Set loading state for this specific expense
    setUploadingFileId(expenseId);
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      setUploadingFileId(null);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // Store file type along with content
      const fileData = {
        content: reader.result as string,
        type: file.type,
        name: file.name,
        size: file.size
      };
      
      // Store as JSON string
      updateExpense(expenseId, 'receipt', JSON.stringify(fileData));
      
      // Update file type in a new field for easier access
      updateExpense(expenseId, 'receiptType', file.type);
      updateExpense(expenseId, 'receiptName', file.name);
      
      // Clear loading state
      setUploadingFileId(null);
    };
    
    reader.onerror = () => {
      setUploadError('Failed to read file');
      setUploadingFileId(null);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Helper function to get file preview URL
  const getFilePreviewUrl = (receipt: string): string => {
    try {
      const fileData = JSON.parse(receipt);
      return fileData.content;
    } catch (e) {
      // For backward compatibility with old data format
      return receipt;
    }
  };
  
  // Helper function to get file type
  const getFileType = (receipt: string): string => {
    try {
      const fileData = JSON.parse(receipt);
      return fileData.type || '';
    } catch (e) {
      // For backward compatibility
      return receipt.startsWith('data:image/') ? 'image' : 'application/pdf';
    }
  };
  
  // Helper function to get file name
  const getFileName = (receipt: string): string => {
    try {
      const fileData = JSON.parse(receipt);
      return fileData.name || 'receipt';
    } catch (e) {
      // For backward compatibility
      return 'receipt';
    }
  };
  
  // Handle file deletion
  const handleFileDelete = (expenseId: string) => {
    // Update expense with empty receipt
    updateExpense(expenseId, 'receipt', '');
    updateExpense(expenseId, 'receiptType', '');
    updateExpense(expenseId, 'receiptName', '');
  };

  // Calculate time remaining for a task
  const calculateTaskTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    
    if (today > end) {
      return { timeString: 'Overdue', isOverdue: true };
    }
    
    const diffTime = Math.abs(end.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let timeString = '';
    
    if (diffDays < 30) {
      timeString = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      timeString = `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);
      timeString = `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    }
    
    return { timeString, isOverdue: false };
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10">
          <DialogTitle className="text-2xl font-semibold">Edit Project</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="team">Team & Tags</TabsTrigger>
          </TabsList>
          
          {/* Project Details Tab */}
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input 
                    id="name" 
                    value={project.name}
                    onChange={(e) => setProject({...project, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Project Code</Label>
                  <Input 
                    id="code" 
                    value={project.code}
                    onChange={(e) => setProject({...project, code: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input 
                    id="client" 
                    value={project.client}
                    onChange={(e) => setProject({...project, client: e.target.value})}
                    disabled // Assuming client should not be changed once set
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Project Manager</Label>
                  <Input 
                    id="manager" 
                    value={project.manager}
                    onChange={(e) => setProject({...project, manager: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    value={project.startDate}
                    onChange={(e) => setProject({...project, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    value={project.endDate}
                    onChange={(e) => setProject({...project, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={project.status} 
                    onValueChange={(value) => setProject({...project, status: value as Project['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={project.priority} 
                    onValueChange={(value) => setProject({...project, priority: value as Project['priority']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (ZAR)</Label>
                  <Input 
                    id="budget" 
                    type="number"
                    value={project.budget}
                    onChange={(e) => setProject({...project, budget: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenses">Expenses (ZAR)</Label>
                  <Input 
                    id="expenses" 
                    type="number"
                    value={project.expenses}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={project.description}
                  onChange={(e) => setProject({...project, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progress">Progress</Label>
                <div className="flex items-center space-x-2">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <p className="text-xs text-slate-500">Progress is automatically calculated based on completed tasks</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Tasks</h3>
                <div className="flex space-x-2">
                  {taskTemplates.length > 0 && (
                    <Select value={selectedTemplate} onValueChange={(value) => {
                      setSelectedTemplate(value);
                      loadTaskTemplate(value);
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Load Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTemplateSaveModalOpen(true)}
                    disabled={!project.tasks || project.tasks.length === 0}
                  >
                    Save as Template
                  </Button>
                  
                  <Button onClick={addTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
              
              {/* Tasks list */}
              <div className="space-y-4">
                {project.tasks?.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-slate-500">No tasks yet. Add a task to get started.</p>
                  </div>
                ) : (
                  project.tasks?.map((task, index) => {
                    const { timeString, isOverdue } = calculateTaskTimeRemaining(task.endDate);
                    return (
                      <Card key={task.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="absolute top-3 right-3">
                            <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                            <div className="md:col-span-2">
                              <Label htmlFor={`task-name-${task.id}`}>Task Name</Label>
                              <Input
                                id={`task-name-${task.id}`}
                                value={task.name}
                                onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                                placeholder="Enter task name"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`task-start-${task.id}`}>Start Date</Label>
                              <Input
                                id={`task-start-${task.id}`}
                                type="date"
                                value={task.startDate}
                                onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`task-end-${task.id}`}>End Date</Label>
                              <Input
                                id={`task-end-${task.id}`}
                                type="date"
                                value={task.endDate}
                                onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                              />
                            </div>
                            
                            <div className="flex flex-col">
                              <Label>Time Remaining</Label>
                              <div className={`flex items-center mt-2 ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">{timeString}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-end">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`task-completed-${task.id}`}
                                  checked={task.completed}
                                  onCheckedChange={(checked) => updateTask(task.id, 'completed', Boolean(checked))}
                                />
                                <Label htmlFor={`task-completed-${task.id}`}>Mark as Complete</Label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Save as Template Modal */}
            {isTemplateSaveModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Save Tasks as Template</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsTemplateSaveModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveTaskTemplate}>Save Template</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Expenses</h3>
                <Button onClick={addExpense}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
              
              {/* Expenses list */}
              <div className="space-y-4">
                {project.expenseItems?.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-slate-500">No expenses yet. Add an expense to get started.</p>
                  </div>
                ) : (
                  project.expenseItems?.map((expense, index) => (
                    <Card key={expense.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                          <div>
                            <Label htmlFor={`expense-type-${expense.id}`}>Expense Type</Label>
                            <Select 
                              value={expense.type} 
                              onValueChange={(value) => updateExpense(expense.id, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select expense type" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPENSE_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`expense-amount-${expense.id}`}>Amount (ZAR)</Label>
                            <Input
                              id={`expense-amount-${expense.id}`}
                              type="text"
                              value={expense.amount > 0 ? expense.amount : ''}
                              onChange={(e) => {
                                const value = e.target.value.trim() === '' ? 0 : parseFloat(e.target.value) || 0;
                                updateExpense(expense.id, 'amount', value);
                              }}
                              placeholder="Enter amount"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`expense-date-${expense.id}`}>Date</Label>
                            <Input
                              id={`expense-date-${expense.id}`}
                              type="date"
                              value={expense.date}
                              onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`expense-receipt-${expense.id}`}>Receipt/Invoice</Label>
                            <div className="flex flex-col space-y-2 mt-2">
                              <Input
                                id={`expense-receipt-${expense.id}`}
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(expense.id, e.target.files[0]);
                                  }
                                }}
                              />
                              
                              {/* File upload UI */}
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => document.getElementById(`expense-receipt-${expense.id}`)?.click()}
                                  disabled={uploadingFileId === expense.id}
                                >
                                  {uploadingFileId === expense.id ? (
                                    <>
                                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                
                                {/* File size limit info */}
                                <span className="text-xs text-slate-500">Max 5MB</span>
                              </div>
                              
                              {/* Upload error message */}
                              {uploadError && uploadingFileId === expense.id && (
                                <div className="text-sm text-red-500">{uploadError}</div>
                              )}
                              
                              {/* File preview area */}
                              {expense.receipt && (
                                <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                                  <div className="flex items-center">
                                    {/* File icon based on type */}
                                    {getFileType(expense.receipt).includes('image') ? (
                                      <img 
                                        src={getFilePreviewUrl(expense.receipt)} 
                                        alt="Receipt preview" 
                                        className="h-8 w-8 object-cover rounded-sm mr-2" 
                                      />
                                    ) : (
                                      <FileText className="h-8 w-8 text-blue-500 mr-2" />
                                    )}
                                    
                                    {/* File name and size */}
                                    <div className="text-sm truncate max-w-[150px]" title={getFileName(expense.receipt)}>
                                      {getFileName(expense.receipt)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-1">
                                    {/* View button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-mokm-blue-600 border-mokm-blue-200 hover:bg-mokm-blue-50 hover:text-mokm-blue-700 hover:border-mokm-blue-300"
                                      onClick={() => window.open(getFilePreviewUrl(expense.receipt), '_blank')}
                                    >
                                      <Eye className="h-4 w-4 mr-2 text-mokm-blue-500" />
                                      View
                                    </Button>
                                    
                                    {/* Delete button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-mokm-pink-600 hover:bg-mokm-pink-50 hover:text-mokm-pink-700 border-mokm-pink-200 hover:border-mokm-pink-300"
                                      onClick={() => handleFileDelete(expense.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label htmlFor={`expense-notes-${expense.id}`}>Notes</Label>
                          <Textarea
                            id={`expense-notes-${expense.id}`}
                            value={expense.notes || ''}
                            onChange={(e) => updateExpense(expense.id, 'notes', e.target.value)}
                            placeholder="Enter any additional notes"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              {project.expenseItems && project.expenseItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Total Expenses</div>
                    <div className="text-xl font-semibold">
                      R{project.expenseItems.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Team & Tags Tab */}
          <TabsContent value="team">
            <div className="space-y-6">
              {/* Team Members Section */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Team Members</h3>
                <p className="text-sm text-slate-500 mb-4">Select team members who will work on this project.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between border rounded-lg p-3 ${selectedTeam.includes(member.email) ? 'bg-slate-100 border-slate-400' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 h-10 w-10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-sm text-slate-500">{member.email} • {member.role}</p>
                        </div>
                      </div>
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedTeam.includes(member.email)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const newTeam = [...selectedTeam, member.email];
                            setSelectedTeam(newTeam);
                            onProjectChange('team', newTeam);
                          } else {
                            const newTeam = selectedTeam.filter(email => email !== member.email);
                            setSelectedTeam(newTeam);
                            onProjectChange('team', newTeam);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {teamMembers.length === 0 && (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-slate-500">No team members available.</p>
                    <p className="text-sm text-slate-400">Add team members in the Company settings.</p>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-2">Project Tags</h3>
                <p className="text-sm text-slate-500 mb-4">Add tags to categorize this project.</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project?.tags?.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-100 text-slate-800 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => {
                          const newTags = project.tags?.filter(t => t !== tag) || [];
                          onProjectChange('tags', newTags);
                        }}
                        className="h-4 w-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center hover:bg-slate-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(!project?.tags || project.tags.length === 0) && (
                    <p className="text-sm text-slate-400">No tags added yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={newTag}
                    onValueChange={(value) => setNewTag(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags
                        .filter(tag => !project?.tags?.includes(tag))
                        .map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="sm"
                    variant="outline"
                    className="text-mokm-purple-600 border-mokm-purple-200 hover:bg-mokm-purple-50 hover:text-mokm-purple-700 hover:border-mokm-purple-300"
                    onClick={() => {
                      if (newTag && !project?.tags?.includes(newTag)) {
                        const newTags = [...(project?.tags || []), newTag];
                        onProjectChange('tags', newTags);
                        setNewTag('');
                      }
                    }}
                    disabled={!newTag || (project?.tags?.includes(newTag) || false)}
                  >
                    <Plus className="h-4 w-4 mr-1 text-mokm-purple-500" />
                    Add Tag
                  </Button>
                </div>

                <div className="mt-4">
                  <Label htmlFor="custom-tag">Create Custom Tag</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="custom-tag"
                      placeholder="Enter a custom tag" 
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      size="sm"
                      variant="outline"
                      className="bg-gradient-to-r from-mokm-purple-400 to-mokm-blue-500 text-white border-none hover:from-mokm-purple-500 hover:to-mokm-blue-600"
                      onClick={() => {
                        if (newTag && !project?.tags?.includes(newTag)) {
                          // Add to available tags if not already there
                          if (!availableTags.includes(newTag)) {
                            const newAvailableTags = [...availableTags, newTag];
                            setAvailableTags(newAvailableTags);
                            localStorage.setItem('projectTags', JSON.stringify(newAvailableTags));
                          }
                          // Add to project tags
                          const newTags = [...(project?.tags || []), newTag];
                          onProjectChange('tags', newTags);
                          setNewTag('');
                        }
                      }}
                      disabled={!newTag || (project?.tags?.includes(newTag) || false)}
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Create & Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sticky bottom-0 bg-white pt-4">
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="border-mokm-blue-200 text-mokm-blue-700 hover:bg-mokm-blue-50 hover:text-mokm-blue-800 hover:border-mokm-blue-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 text-white border-none hover:from-mokm-blue-600 hover:to-mokm-purple-600"
            >
              Save Project
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
