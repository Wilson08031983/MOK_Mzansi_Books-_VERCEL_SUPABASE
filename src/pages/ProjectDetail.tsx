import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { useLocalization } from '@/hooks/useLocalization';
import {
  Calendar,
  CheckSquare,
  CreditCard,
  Edit,
  PlusCircle,
  Clock,
  ChevronLeft,
  DollarSign,
  Trash2
} from 'lucide-react';

// Project type definition - using shared types with extensions for local needs
import { Task as BaseTask } from '@/types/project';
import { activityService } from '@/services/activityService';

// Extend the shared Task type with additional fields needed for this component
interface TaskDetail extends Omit<BaseTask, 'name' | 'startDate' | 'endDate' | 'completed'> {
  title: string; // Instead of name from the base Task
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  dueDate?: string;
}

// PettyCash type remains local since it's specific to this component
interface PettyCash {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  taskId?: string;
}

// Extended project interface with additional fields needed for this component
interface ProjectDetailModel {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  tasks: TaskDetail[];
  pettyCash: PettyCash[];
  teamMembers: { id: string; name: string }[];
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatDate } = useLocalization();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'financials'>('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPettyCashModal, setShowPettyCashModal] = useState(false);
  
  // Sample project data - in a real app this would be fetched from an API
  const [project, setProject] = useState<ProjectDetailModel>({
     id: id as string,
     name: 'Website Redesign',
     client: 'ABC Corporation',
     status: 'active',
     progress: 75,
     startDate: '2025-05-01',
     endDate: '2025-07-15',
     budget: 25000,
     spent: 15000,
     tasks: [
       {
         id: '1',
         title: 'Design homepage mockup',
         status: 'completed',
         assignedTo: 'Sarah Parker',
         dueDate: '2025-05-10'
       },
       {
         id: '2',
         title: 'Develop navigation components',
         status: 'completed',
         assignedTo: 'Michael Johnson',
         dueDate: '2025-05-20'
       },
       {
         id: '3',
         title: 'Implement responsive design',
         status: 'in-progress',
         assignedTo: 'Lisa Williams',
         dueDate: '2025-06-05'
       },
       {
         id: '4',
         title: 'Content migration',
         status: 'pending',
         assignedTo: 'David Brown',
         dueDate: '2025-06-15'
       },
       {
         id: '5',
         title: 'SEO optimization',
         status: 'pending',
         assignedTo: 'Sarah Parker',
         dueDate: '2025-06-30'
       }
     ],
     pettyCash: [
       {
         id: '1',
         amount: 250,
         description: 'Design software subscription',
         date: '2025-05-05',
         status: 'approved'
       },
       {
         id: '2',
         amount: 75,
         description: 'Team lunch meeting',
         date: '2025-05-15',
         status: 'approved',
         taskId: '2'
       },
       {
         id: '3',
         amount: 150,
         description: 'External hard drive purchase',
         date: '2025-05-25',
         status: 'pending'
       }
     ],
     teamMembers: [
       { id: '1', name: 'Sarah Parker' },
       { id: '2', name: 'Michael Johnson' },
       { id: '3', name: 'Lisa Williams' },
       { id: '4', name: 'David Brown' }
     ]
   });

  // New task state
  const [newTask, setNewTask] = useState<Omit<TaskDetail, 'id'>>({
    title: '',
    description: '',
    status: 'pending',
    assignedTo: '',
    dueDate: ''
  });

  // New petty cash state
  const [newPettyCash, setNewPettyCash] = useState<Omit<PettyCash, 'id'>>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    taskId: ''
  });

  // Calculate project stats
  const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = project.tasks.length;
  
  // Safe calculation for percentages with proper type checking
  const budgetNum = typeof project.budget === 'number' ? project.budget : 0;
  const spentNum = typeof project.spent === 'number' ? project.spent : 0;
  const spentPercentage = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success border-success/30';
      case 'completed':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'on-hold':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/40 text-muted-foreground border-border';
    }
  };

  // Function to get task status badge color
  const getTaskStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/30';
      case 'in-progress':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted/40 text-muted-foreground border-border';
    }
  };

  // Add new task
  const addTask = () => {
    if (!newTask.title) {
      alert('Task title is required');
      return;
    }

    const newTaskWithId = {
      ...newTask,
      id: Math.random().toString(36).substring(2, 11)
    };

    // Log activity for task creation
    try {
      activityService.logTaskAction(
        'Task created',
        `Task '${newTaskWithId.title}' added to project ${project.name}`,
        newTaskWithId.id,
        {
          projectId: project.id,
          projectName: project.name,
          assignedTo: newTaskWithId.assignedTo,
          dueDate: newTaskWithId.dueDate,
          status: newTaskWithId.status
        }
      );
    } catch (err) {
      console.warn('Activity logging failed (task create):', err);
    }

    setProject({
      ...project,
      tasks: [...project.tasks, newTaskWithId]
    });

    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      assignedTo: '',
      dueDate: ''
    });

    setShowTaskModal(false);
  };

  // Add new petty cash
  const addPettyCash = () => {
    if (!newPettyCash.amount || !newPettyCash.description) {
      alert('Amount and description are required');
      return;
    }

    const newPettyCashWithId = {
      ...newPettyCash,
      id: Math.random().toString(36).substring(2, 11)
    };

    // Log activity for petty cash addition
    try {
      activityService.logFinancialAction(
        'Petty cash added',
        `Petty cash added to project ${project.name}`,
        'pettyCash',
        newPettyCashWithId.id,
        {
          projectId: project.id,
          projectName: project.name,
          amount: newPettyCashWithId.amount,
          description: newPettyCashWithId.description,
          date: newPettyCashWithId.date,
          taskId: newPettyCashWithId.taskId
        }
      );
    } catch (e) {
      console.warn('Activity logging failed (petty cash add):', e);
    }

    setProject({
      ...project,
      pettyCash: [...project.pettyCash, newPettyCashWithId]
    });

    setNewPettyCash({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      taskId: ''
    });

    setShowPettyCashModal(false);
  };

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    const existing = project.tasks.find(task => task.id === taskId);

    setProject({
      ...project,
      tasks: project.tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    });

    // Log activity for task status change
    try {
      activityService.logTaskAction(
        'Task status updated',
        `Task '${existing?.title || taskId}' status changed from ${existing?.status} to ${newStatus} in project ${project.name}`,
        taskId,
        {
          projectId: project.id,
          projectName: project.name,
          previousStatus: existing?.status,
          newStatus,
          assignedTo: existing?.assignedTo
        }
      );
    } catch (err) {
      console.warn('Activity logging failed (task status):', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Back link and header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/projects" className="text-muted-foreground hover:text-foreground mr-3 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Client: {project.client}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${getStatusBadgeColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <Link
            to={`/projects/${id}/edit`}
            className="glass border border-border text-foreground px-4 py-2 rounded-lg hover:bg-accent/10 flex items-center space-x-1 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Project</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="glass-soft rounded-lg shadow-sm">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'financials'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                }`}
              >
                Financials
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Project stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="font-medium text-foreground">{project.progress}%</div>
                  </div>
                  <div className="mt-2 w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(new Date(project.startDate))} - {formatDate(new Date(project.endDate))}</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Budget</div>
                  <div className="text-xl font-bold text-foreground">R{project.budget.toLocaleString()}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>R{project.spent.toLocaleString()} spent ({spentPercentage}%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Tasks</div>
                  <div className="text-xl font-bold text-foreground">{completedTasks}/{totalTasks} Completed</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CheckSquare className="h-4 w-4" />
                      <span>{completionRate}% completion rate</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Team members */}
              <div className="glass border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Team Members</h3>
                  <button className="text-primary text-sm flex items-center hover:text-primary/80 transition-colors">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>Add Member</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {project.teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-md transition-colors">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-foreground">{member.name}</div>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-foreground">Project Tasks</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-1 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
              </div>
              
              <div className="glass border border-border rounded-lg">
                <div className="divide-y divide-border">
                  {project.tasks.length > 0 ? (
                    project.tasks.map(task => (
                      <div key={task.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="mr-3">
                              <input
                                type="checkbox"
                                checked={task.status === 'completed'}
                                onChange={() => updateTaskStatus(
                                  task.id,
                                  task.status === 'completed' ? 'in-progress' : 'completed'
                                )}
                                className="rounded text-primary focus:ring-primary h-5 w-5"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                              )}
                              <div className="flex flex-wrap items-center mt-2 space-x-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-full border transition-colors ${getTaskStatusBadgeColor(task.status)}`}>
                                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                                {task.assignedTo && (
                                  <span className="text-muted-foreground">
                                    Assigned to: {task.assignedTo}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className="text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Due: {formatDate(new Date(task.dueDate))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <CheckSquare className="h-12 w-12 mx-auto text-muted" />
                      <h3 className="mt-2 text-lg font-medium text-foreground">No tasks yet</h3>
                      <p className="mt-1">Add your first task to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-foreground">Petty Cash & Expenses</h2>
                <button
                  onClick={() => setShowPettyCashModal(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-1 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Petty Cash</span>
                </button>
              </div>
              
              <div className="glass border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                      <div className="text-xl font-bold text-foreground">R{project.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                      <div className="text-xl font-bold text-foreground">R{project.spent.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Budget Utilization</span>
                      <span className="font-medium text-foreground">{spentPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${spentPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {project.pettyCash.length > 0 ? (
                    project.pettyCash.map(item => (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">R{item.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                            <div className="flex items-center mt-2 space-x-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full border transition-colors ${
                                item.status === 'approved' 
                                  ? 'bg-success/20 text-success border-success/30' 
                                  : item.status === 'rejected'
                                    ? 'bg-destructive/20 text-destructive border-destructive/30'
                                    : 'bg-warning/20 text-warning border-warning/30'
                              }`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                              <span className="text-muted-foreground">
                                Date: {formatDate(new Date(item.date))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto text-muted" />
                      <h3 className="mt-2 text-lg font-medium text-foreground">No petty cash records</h3>
                      <p className="mt-1">Add your first petty cash record</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-soft rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-medium mb-4 text-foreground">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent h-20 transition-colors"
                    placeholder="Enter task description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Assigned To
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  >
                    <option value="">Select team member</option>
                    {project.teamMembers.map(member => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value as 'pending' | 'in-progress' | 'completed'})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addTask}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 border border-border text-foreground py-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Petty Cash Modal */}
        {showPettyCashModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-soft rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-medium mb-4 text-foreground">Add Petty Cash</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Amount (R)
                  </label>
                  <input
                    type="number"
                    value={newPettyCash.amount}
                    onChange={(e) => setNewPettyCash({...newPettyCash, amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={newPettyCash.description}
                    onChange={(e) => setNewPettyCash({...newPettyCash, description: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent h-20 transition-colors"
                    placeholder="Enter description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newPettyCash.date}
                    onChange={(e) => setNewPettyCash({...newPettyCash, date: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Related Task (Optional)
                  </label>
                  <select
                    value={newPettyCash.taskId}
                    onChange={(e) => setNewPettyCash({...newPettyCash, taskId: e.target.value})}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  >
                    <option value="">Select task</option>
                    {project.tasks.map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addPettyCash}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Petty Cash
                </button>
                <button
                  onClick={() => setShowPettyCashModal(false)}
                  className="flex-1 border border-border text-foreground py-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
