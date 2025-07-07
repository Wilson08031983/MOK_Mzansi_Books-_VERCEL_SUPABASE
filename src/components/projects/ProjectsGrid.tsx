import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  MoreVertical, 
  Filter, 
  AlertTriangle,
  Check,
  CheckCircle2,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { Project } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ViewProjectModal from './ViewProjectModal';
import EditProjectModal from './EditProjectModal';

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
  // Use projectToCancel state to track which project is being cancelled
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  // Dialog state is derived from whether projectToCancel is set
  const isCancelDialogOpen = !!projectToDelete;
  
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

  // Set the project to cancel and open the confirmation dialog
  const handleCancelProject = (project: Project) => {
    // Set the project to cancel which will open the dialog
    setProjectToDelete(project);
  };
  
  const confirmCancelProject = () => {
    if (projectToDelete && onEditProject) {
      // We already have the full project object, no need to find it
      // Mark the project as cancelled
      const cancelledProject = { ...projectToDelete, status: 'Cancelled' as Project['status'] };
      
      // Call the onEditProject handler to update the project in the parent component
      onEditProject(cancelledProject);
      
      // Add a visual confirmation toast or alert here
      alert(`Project "${projectToDelete.name}" has been cancelled.`);
    }
    
    // Reset the projectToDelete state which will close the dialog
    setProjectToDelete(null);
  };
  
  // Handler to close cancel dialog without cancelling project
  const closeCancelDialog = () => {
    setProjectToDelete(null);
  };
  
  return (
    <div className="space-y-4">

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
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-mokm-blue-100">
                    <DropdownMenuItem 
                      onSelect={() => setViewingProject(project)} 
                      className="cursor-pointer text-mokm-blue-600 hover:text-mokm-blue-700 focus:text-mokm-blue-700 hover:bg-mokm-blue-50 focus:bg-mokm-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2 text-mokm-blue-500" />
                      <span className="text-mokm-blue-700">View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => setEditingProject(project)} 
                      className="cursor-pointer text-mokm-purple-600 hover:text-mokm-purple-700 focus:text-mokm-purple-700 hover:bg-mokm-purple-50 focus:bg-mokm-purple-50"
                    >
                      <Edit className="h-4 w-4 mr-2 text-mokm-purple-500" />
                      <span className="text-mokm-purple-700">Edit Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        console.log('Delete menu item clicked');
                        handleCancelProject(project);
                      }} 
                      className="cursor-pointer text-mokm-pink-600 hover:text-mokm-pink-700 focus:text-mokm-pink-700 hover:bg-mokm-pink-50 focus:bg-mokm-pink-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-mokm-pink-500" />
                      <span className="text-mokm-pink-700">Cancel Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {project.tags && project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-mokm-blue-100 text-mokm-blue-700 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Client:</p>
                    <p className="font-medium text-slate-700">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Manager:</p>
                    <p className="font-medium text-slate-700">{project.manager}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Start:</p>
                    <p className="font-medium text-slate-700">
                      {new Date(project.startDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">End:</p>
                    <p className="font-medium text-slate-700">
                      {new Date(project.endDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'In Progress' ? 'bg-green-500' :
                      project.status === 'Completed' ? 'bg-blue-500' :
                      project.status === 'On Hold' ? 'bg-yellow-500' :
                      project.status === 'Cancelled' ? 'bg-red-500' :
                      project.status === 'Planning' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      project.status === 'In Progress' ? 'text-green-700' :
                      project.status === 'Completed' ? 'text-blue-700' :
                      project.status === 'On Hold' ? 'text-yellow-700' :
                      project.status === 'Cancelled' ? 'text-red-700' :
                      project.status === 'Planning' ? 'text-purple-700' :
                      'text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Project Progress</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${
                        project.progress >= 100 ? 'text-green-600' :
                        project.progress >= 70 ? 'text-emerald-600' :
                        project.progress >= 40 ? 'text-amber-600' :
                        'text-orange-600'
                      }`}>
                        {project.progress}%
                      </span>
                      {project.progress >= 100 && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                    </div>
                  </div>
                  <Progress
                    value={project.progress}
                    className="h-2 bg-slate-200"
                    style={{
                      backgroundSize: '1rem 1rem',
                      backgroundImage: project.progress < 100 ? 
                        'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)' : 
                        'none'
                    }}
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{project.tasks?.length ? `${project.tasks.filter(task => task.completed).length}/${project.tasks.length} Tasks` : 'No tasks'}</span>
                    {project.tasks?.length > 0 && (
                      <span className="italic">
                        Updated automatically
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Budget and Expenses Row */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-slate-500">Budget</p>
                    <p className="font-semibold text-mokm-blue-700">
                      R{project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Expenses</p>
                    <p className="font-semibold text-mokm-pink-600">
                      R{project.expenses ? project.expenses.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
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
      </div>
    
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

      {/* Custom Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={closeCancelDialog}
          />
          
          {/* Dialog */}
          <div className="relative bg-white/95 backdrop-blur-sm border border-mokm-blue-100 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-mokm-blue-900 mb-2">
                Cancel {projectToDelete.name}?
              </h2>
              <p className="text-sm text-mokm-blue-600">
                This action will mark the project as cancelled and cannot be easily undone.
                All associated data will be retained but the project will no longer appear in active projects.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeCancelDialog}
                className="px-4 py-2 border border-mokm-blue-200 text-mokm-blue-700 rounded-md hover:bg-mokm-blue-50 hover:text-mokm-blue-800 hover:border-mokm-blue-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelProject}
                className="px-4 py-2 bg-gradient-to-r from-mokm-pink-500 to-mokm-orange-500 hover:from-mokm-pink-600 hover:to-mokm-orange-600 text-white rounded-md transition-colors font-medium"
              >
                Cancel Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsGrid;
