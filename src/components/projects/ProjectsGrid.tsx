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
import { useLocalization } from '@/hooks/useLocalization';
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
import useAuditLogger from '@/hooks/useAuditLogger';
import AuthVerificationModal from '@/components/company/AuthVerificationModal';

interface ProjectsGridProps {
  projects: Project[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  onEditProject?: (updatedProject: Project) => void;
  onUpdateProject?: (updatedProject: Project) => void;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  getStatusColor,
  getPriorityColor,
  onEditProject,
  onUpdateProject
}) => {
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  // Use projectToCancel state to track which project is being cancelled
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  // Dialog state is derived from whether projectToCancel is set
  const isCancelDialogOpen = !!projectToDelete;
  // Dialog opens when projectToDelete is set
  
  const { formatCurrency, t } = useLocalization();
  const { logAudit } = useAuditLogger();

  // Admin auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | { type: 'edit' | 'cancel'; project: Project }>(null);
  
  const handleEditProject = (project: Project) => {
    // Require admin verification before opening edit modal
    setPendingAction({ type: 'edit', project });
    setIsAuthModalOpen(true);
  };
  
  const handleSaveProject = (updatedProject: Project) => {
    if (onEditProject) {
      onEditProject(updatedProject);
    }
    setEditingProject(null);
  };

  // Set the project to cancel and open the admin verification modal first
  const handleCancelProject = (project: Project) => {
    setPendingAction({ type: 'cancel', project });
    setIsAuthModalOpen(true);
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

  // When admin verification succeeds, perform the pending action
  const handleAuthVerified = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'edit') {
      setViewingProject(null); // Close view modal if open
      setEditingProject(pendingAction.project);
    } else if (pendingAction.type === 'cancel') {
      // After verification, open the existing cancel confirmation dialog
      setProjectToDelete(pendingAction.project);
    }
    setPendingAction(null);
    setIsAuthModalOpen(false);
  };
  
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="glass backdrop-blur-md bg-white/90 dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business hover:shadow-business-lg hover-lift transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">{project.name}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{project.code}</p>
                  {project.projectType === 'ongoing' && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="glass backdrop-blur-sm bg-white/70 dark:bg-white/5 border border-white/10 text-emerald-700 dark:text-emerald-300 text-xs">
                        {t('projects.statusLabels.ongoing')}
                      </Badge>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gradient-to-r from-mokm-purple-400 to-mokm-blue-500 text-white border-none hover:from-mokm-purple-500 hover:to-mokm-blue-600">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass backdrop-blur-md bg-white/95 dark:bg-black/30 border border-slate-200 dark:border-white/10">
                    <DropdownMenuItem 
                      onSelect={() => {
                        try {
                          logAudit({
                            category: 'crud',
                            action: 'Viewed Project',
                            entityType: 'Project',
                            entityId: String(project.id),
                            entityName: project.name,
                            changeType: 'read',
                            description: `Viewed project ${project.name} (${project.code})`
                          });
                        } catch {}
                        setViewingProject(project);
                      }} 
                      className="cursor-pointer text-mokm-blue-300 hover:text-mokm-blue-200 focus:text-mokm-blue-200 hover:bg-white/10 focus:bg-white/10"
                    >
                      <Eye className="h-4 w-4 mr-2 text-mokm-blue-400" />
                      <span className="text-mokm-blue-200">{t('projects.actionLabels.viewDetails')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => handleEditProject(project)} 
                      className="cursor-pointer text-mokm-purple-300 hover:text-mokm-purple-200 focus:text-mokm-purple-200 hover:bg-white/10 focus:bg-white/10"
                    >
                      <Edit className="h-4 w-4 mr-2 text-mokm-purple-400" />
                      <span className="text-mokm-purple-200">{t('projects.actionLabels.editProject')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        handleCancelProject(project);
                      }} 
                      className="cursor-pointer text-mokm-pink-300 hover:text-mokm-pink-200 focus:text-mokm-pink-200 hover:bg-white/10 focus:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-mokm-pink-400" />
                      <span className="text-mokm-pink-200">{t('projects.actionLabels.cancelProject')}</span>
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
                      <Badge key={index} variant="secondary" className="glass backdrop-blur-sm bg-white/70 dark:bg-white/5 border border-white/10 text-slate-700 dark:text-slate-200 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-300">{t('projects.grid.client')}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-300">{t('projects.grid.manager')}</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{project.manager}</p>
                  </div>
                </div>
                
                {project.projectType !== 'ongoing' ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-300">{t('projects.grid.start')}</p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-300">{t('projects.grid.end')}</p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-300">{t('projects.schedule')}:</p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{t('projects.ongoing')}</p>
                    </div>
                  </div>
                )}
                
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
                      'text-slate-700 dark:text-slate-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-300">{t('projects.grid.projectProgress')}</span>
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
                    className="h-2 bg-slate-200 dark:bg-white/10"
                    style={{
                      backgroundSize: '1rem 1rem',
                      backgroundImage: project.progress < 100 ? 
                        'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)' : 
                        'none'
                    }}
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>{project.tasks?.length ? `${project.tasks.filter(task => task.completed).length}/${project.tasks.length} ${t('projects.grid.tasksLabel')}` : t('projects.grid.noTasks')}</span>
                    {project.tasks?.length > 0 && (
                      <span className="italic">
                        {t('projects.grid.updatedAutomatically')}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Budget and Expenses Row */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{t('projects.grid.budget')}</p>
                    <p className="font-semibold text-mokm-blue-600 dark:text-mokm-blue-400">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-300">{t('projects.grid.expenses')}</p>
                    <p className="font-semibold text-mokm-pink-600 dark:text-mokm-pink-400">
                      {formatCurrency(project.expenses || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 glass backdrop-blur-md bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10"
                  onClick={() => {
                    try {
                      logAudit({
                        category: 'crud',
                        action: 'Viewed Project',
                        entityType: 'Project',
                        entityId: String(project.id),
                        entityName: project.name,
                        changeType: 'read',
                        description: `Viewed project ${project.name} (${project.code})`
                      });
                    } catch {}
                    setViewingProject(project);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2 text-mokm-blue-400" />
                  {t('projects.actionLabels.view')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 glass backdrop-blur-md bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10"
                  onClick={() => handleEditProject(project)}
                >
                  <Edit className="h-4 w-4 mr-2 text-mokm-purple-400" />
                  {t('projects.actionLabels.edit')}
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
            <p className="text-slate-600">{t('projects.grid.empty')}</p>
          </div>
        )}
      </div>
    
      {/* View Project Modal */}
      {viewingProject && (
        <ViewProjectModal 
          project={viewingProject}
          allProjects={projects}
          onClose={() => setViewingProject(null)}
          onEdit={handleEditProject}
          onUpdate={(updatedProject) => {
            if (onUpdateProject) {
              onUpdateProject(updatedProject);
            }
            setViewingProject(updatedProject); // Update the viewing project state
          }}
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
                {t('projects.dialog.cancelTitle', { name: projectToDelete.name })}
              </h2>
              <p className="text-sm text-mokm-blue-600">
                {t('projects.dialog.cancelDescription')}
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeCancelDialog}
                className="px-4 py-2 border border-mokm-blue-200 text-mokm-blue-700 rounded-md hover:bg-mokm-blue-50 hover:text-mokm-blue-800 hover:border-mokm-blue-300 transition-colors"
              >
                {t('projects.dialog.cancel')}
              </button>
              <button
                onClick={confirmCancelProject}
                className="px-4 py-2 bg-gradient-to-r from-mokm-pink-500 to-mokm-orange-500 hover:from-mokm-pink-600 hover:to-mokm-orange-600 text-white rounded-md transition-colors font-medium"
              >
                {t('projects.dialog.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerified={handleAuthVerified}
        actionType={pendingAction?.type === 'cancel' ? 'delete' : 'update'}
        targetEntityName="project"
        adminScope="extended"
      />
    </div>
  );
};

export default ProjectsGrid;
