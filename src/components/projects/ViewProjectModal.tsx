import React from 'react';
import { X, Users, Calendar, CheckSquare, Tag, DollarSign, FileText } from 'lucide-react';
import { Project, Task, Expense } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Using shared types from types/project.ts

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

const ViewProjectModal: React.FC<ViewProjectModalProps> = ({ 
  project, 
  onClose,
  onEdit
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };
  
  const calculateRemainingBudget = () => {
    return project.budget - project.expenses;
  };

  const calculateTimeRemaining = () => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    
    if (today > endDate) {
      return 'Overdue';
    }
    
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 pt-6 pb-2">
          <div className="flex flex-col">
            <DialogTitle className="text-2xl font-semibold mb-1">
              {project.name}
            </DialogTitle>
            <div className="text-sm text-slate-500">{project.code}</div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="text-mokm-purple-600 border-mokm-purple-200 hover:bg-mokm-purple-50 hover:text-mokm-purple-700 hover:border-mokm-purple-300"
              onClick={() => onEdit(project)}
            >
              <FileText className="h-4 w-4 mr-2 text-mokm-purple-500" />
              Edit Project
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onClose}
              className="border-mokm-blue-200 text-mokm-blue-700 hover:bg-mokm-blue-50 hover:text-mokm-blue-800 hover:border-mokm-blue-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Client</div>
                  <div className="font-medium">{project.client}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">Manager</div>
                  <div className="font-medium">{project.manager}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">Priority</div>
                  <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Start Date</div>
                  <div className="font-medium">{new Date(project.startDate).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">End Date</div>
                  <div className="font-medium">{new Date(project.endDate).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">Time Remaining</div>
                  <div className="font-medium">{calculateTimeRemaining()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-500 mb-1">Progress</div>
                  <div className="flex items-center space-x-2">
                    <Progress value={project.progress} className="flex-1" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Budget & Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-slate-500" />
                Budget & Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Total Budget</div>
                <div className="text-xl font-semibold text-slate-800">{formatCurrency(project.budget)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Expenses to Date</div>
                <div className="text-xl font-semibold text-red-600">{formatCurrency(project.expenses)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Remaining</div>
                <div className={`text-xl font-semibold ${calculateRemainingBudget() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(calculateRemainingBudget())}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Team */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-slate-500" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                      {member.split(' ').map(part => part[0]).join('')}
                    </div>
                    <span className="text-sm font-medium">{member}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-slate-500" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Tasks (if available) */}
          {project.tasks && project.tasks.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-slate-500" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        variant={task.completed ? "secondary" : "outline"} 
                        className={`ml-4 ${task.completed ? "bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 text-white border-none" : "border-mokm-blue-200 text-mokm-blue-700"}`}
                      >
                        {task.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Expenses (if available) */}
          {project.expenseItems && project.expenseItems.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-slate-500" />
                  Expense Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.expenseItems.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{expense.type}</div>
                        <div className="text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</div>
                        {expense.notes && <div className="text-sm italic mt-1">{expense.notes}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                        {expense.receipt && (
                          <Button variant="outline" size="sm" onClick={() => window.open(expense.receipt, '_blank')}>
                            View Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProjectModal;
