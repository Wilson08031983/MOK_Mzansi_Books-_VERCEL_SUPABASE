
import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  MoreVertical, 
  Users,
  Calendar,
  DollarSign,
  Clock,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ViewProjectModal from './ViewProjectModal';
import EditProjectModal from './EditProjectModal';

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
  receipt?: string; // URL or base64 of the uploaded file
  notes?: string;
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

interface ProjectsGridProps {
  projects: Project[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  onEditProject?: (updatedProject: Project) => void;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  getStatusColor,
  getPriorityColor,
  onEditProject
}) => {
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleEditProject = (project: Project) => {
    setViewingProject(null); // Close view modal if open
    setEditingProject(project);
  };
  
  const handleSaveProject = (updatedProject: Project) => {
    if (onEditProject) {
      onEditProject(updatedProject);
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: number) => {
    setDeleteProjectId(projectId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteProject = () => {
    if (deleteProjectId && onEditProject) {
      // Find the project to be deleted
      const projectToDelete = projects.find(p => p.id === deleteProjectId);
      if (projectToDelete) {
        // Mark the project as deleted - in a real app, you might want to remove it entirely
        // Here we're using the onEditProject handler to update it with a 'deleted' status
        const deletedProject = { ...projectToDelete, status: 'Cancelled' as Project['status'] };
        
        // Call the onEditProject handler to update the project in the parent component
        onEditProject(deletedProject);
        
        // Log for debugging
        console.log('Project marked as cancelled:', deletedProject);
      } else {
        console.error('Project not found with ID:', deleteProjectId);
      }
    } else {
      console.error('Missing deleteProjectId or onEditProject handler');
    }
    
    // Close the dialog and reset state
    setIsDeleteDialogOpen(false);
    setDeleteProjectId(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business hover-lift transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-slate-900">{project.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{project.code}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-mokm-purple-400 to-mokm-blue-500 text-white border-none hover:from-mokm-purple-500 hover:to-mokm-blue-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-sm border-mokm-blue-100">
                  <DropdownMenuItem onClick={() => setViewingProject(project)} className="cursor-pointer hover:bg-gradient-to-r hover:from-mokm-blue-50 hover:to-mokm-purple-50 focus:bg-gradient-to-r focus:from-mokm-blue-50 focus:to-mokm-purple-50">
                    <Eye className="mr-2 h-4 w-4 text-mokm-blue-500" />
                    <span className="text-mokm-blue-700">View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditProject(project)} className="cursor-pointer hover:bg-gradient-to-r hover:from-mokm-blue-50 hover:to-mokm-purple-50 focus:bg-gradient-to-r focus:from-mokm-blue-50 focus:to-mokm-purple-50">
                    <Edit className="mr-2 h-4 w-4 text-mokm-purple-500" />
                    <span className="text-mokm-purple-700">Edit Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="cursor-pointer text-mokm-pink-600 hover:text-mokm-pink-700 focus:text-mokm-pink-700 hover:bg-mokm-pink-50 focus:bg-mokm-pink-50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Client and Manager */}
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Client:</span>
                <span className="ml-1 text-slate-900 font-medium">{project.client}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Manager:</span>
                <span className="ml-1 text-slate-900 font-medium">{project.manager}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Start:</span>
                <span className="ml-1 text-slate-900">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">End:</span>
                <span className="ml-1 text-slate-900">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Progress</span>
                <span className="text-sm font-medium text-slate-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Budget:</span>
                <span className="text-slate-900 font-medium">R{project.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Expenses:</span>
                <span className="text-slate-900 font-medium">R{project.expenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Remaining:</span>
                <span className={`font-medium ${project.budget - project.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R{(project.budget - project.expenses).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
            </div>

            {/* Team */}
            <div>
              <span className="text-sm text-slate-600">Team ({project.team.length}):</span>
              <div className="flex items-center space-x-1 mt-1">
                {project.team.slice(0, 3).map((member, index) => (
                  <div 
                    key={index}
                    className="w-8 h-8 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  >
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {project.team.length > 3 && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-medium">
                    +{project.team.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-mokm-blue-600 border-mokm-blue-200 hover:bg-mokm-blue-50 hover:text-mokm-blue-700 hover:border-mokm-blue-300"
                onClick={() => setViewingProject(project)}
              >
                <Eye className="h-4 w-4 mr-2 text-mokm-blue-500" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-mokm-purple-600 border-mokm-purple-200 hover:bg-mokm-purple-50 hover:text-mokm-purple-700 hover:border-mokm-purple-300"
                onClick={() => setEditingProject(project)}
              >
                <Edit className="h-4 w-4 mr-2 text-mokm-purple-500" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {projects.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-slate-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-slate-600">No projects found</p>
        </div>
      )}
    
      {/* View Project Modal */}
      {viewingProject && (
        <ViewProjectModal 
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={handleEditProject}
        />
      )}
      
      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveProject}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-mokm-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-mokm-blue-900">Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription className="text-mokm-blue-600">
              This action will mark the project as cancelled and cannot be easily undone.
              All associated data will be retained but the project will no longer appear in active projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-mokm-blue-200 text-mokm-blue-700 hover:bg-mokm-blue-50 hover:text-mokm-blue-800 hover:border-mokm-blue-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-gradient-to-r from-mokm-pink-500 to-mokm-orange-500 hover:from-mokm-pink-600 hover:to-mokm-orange-600 text-white border-none"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsGrid;
