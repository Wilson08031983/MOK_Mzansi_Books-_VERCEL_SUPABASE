import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '@/hooks/useLocalization';
import { Project } from '@/types/project';
import { calculateProjectSalaryExpenses } from '@/services/projectEmployeeService';
import ExpenseProjectSyncService from '@/services/expenseProjectSyncService';
import useAuditLogger from '@/hooks/useAuditLogger';
import { 
  Search, 
  Plus, 
  Calendar, 
  CheckSquare, 
  Users, 
  Clock, 
  MoreVertical, 
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  Tag,
  Grid3X3,
  List,
  Kanban,
  DollarSign,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsStats from '@/components/projects/ProjectsStats';
import ProjectsSearchAndFilters from '@/components/projects/ProjectsSearchAndFilters';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectsKanban from '@/components/projects/ProjectsKanban';
import ProjectsEmptyState from '@/components/projects/ProjectsEmptyState';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ErrorBoundary from '@/components/ErrorBoundary';
import { addNotification, getNotifications, NotificationItem } from '@/services/notificationService';

// Using shared Project type from types/project.ts

const Projects = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Always using grid view as per request
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { t, formatDateTime, getTimezoneDisplayName, formatCurrency, settings } = useLocalization();
  const [projects, setProjects] = useState<Project[]>([]);
  const { logCreate, logUpdate, logDelete, logAudit } = useAuditLogger();

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('projects.title')} - MOK Mzansi Books`;
  }, [t]);

  // Initialize sync service
  const syncService = ExpenseProjectSyncService.getInstance();

  // Subscribe to sync service updates
  useEffect(() => {
    const handleSyncUpdate = () => {
      console.log('Projects: Received sync update, refreshing project data');
      // Reload projects from localStorage to get updated expense totals
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const parsed = JSON.parse(storedProjects);
          setProjects(parsed);
        } catch (error) {
          console.error('Error parsing updated projects:', error);
        }
      }
    };

    syncService.subscribe(handleSyncUpdate);
  }, [syncService]);

  // Listen for projects-updated events to refresh and notify with de-duplication
  useEffect(() => {
    const handleProjectsUpdated = (evt: Event) => {
      try {
        const e = evt as CustomEvent;
        const detail = (e && e.detail) || {};
        const action: string = detail.action || '';
        const project: any = detail.project;
        const projectId: string | number | undefined = detail.projectId;
        const name = project?.name || `Project ${projectId ?? ''}`.trim();

        // Refresh projects list from localStorage
        const updated = JSON.parse(localStorage.getItem('projects') || '[]');
        setProjects(Array.isArray(updated) ? updated : []);

        // Build notification content
        let title = '';
        let message = '';
        if (action === 'created') {
          title = `Project Created: ${name}`;
          message = `${project?.client ? `Client: ${project.client}. ` : ''}Code: ${project?.code ?? ''}`.trim();
        } else if (action === 'updated' || action === 'edited') {
          title = `Project Updated: ${name}`;
          message = `${project?.client ? `Client: ${project.client}. ` : ''}Progress: ${project?.progress ?? 0}%`;
        } else if (action === 'deleted') {
          title = `Project Deleted: ${name}`;
          message = `${project?.client ? `Client: ${project.client}` : ''}`.trim();
        } else if (action === 'status-changed') {
          title = `Project Status: ${name}`;
          message = `Status changed to ${String(detail.status || project?.status || '').toUpperCase()}`;
        } else {
          return;
        }

        // De-duplicate within 5 minutes by same title+message and type 'system'
        const existing: NotificationItem[] = getNotifications();
        const windowMs = 5 * 60 * 1000;
        const threshold = Date.now() - windowMs;
        const dup = existing.some(n => {
          const ts = new Date(n.date).getTime();
          return n.title === title && n.message === message && (n.type === 'system') && !isNaN(ts) && ts >= threshold;
        });
        if (!dup) {
          addNotification({ title, message, type: 'system' });
        }

        // Audit logging
        try {
          if (action === 'created' && project) {
            logCreate('Project', name, String(project.id), project);
          } else if ((action === 'updated' || action === 'edited') && project) {
            // If previous values provided (e.g., status change detection), include minimal old/new hints
            const oldVals = detail.previousStatus ? { status: detail.previousStatus } : undefined;
            const newVals = project ? { status: project.status, progress: project.progress } : undefined;
            logUpdate('Project', name, String(project.id), oldVals, newVals);
          } else if (action === 'deleted') {
            const idStr = project?.id ?? projectId ?? '';
            logDelete('Project', name, String(idStr));
          } else if (action === 'status-changed') {
            const prevStatus = detail.previousStatus || 'Unknown';
            const newStatus = detail.status || project?.status || 'Unknown';
            const isCancelled = String(newStatus).toLowerCase() === 'cancelled';
            logAudit({
              category: 'crud',
              action: isCancelled ? 'Cancelled Project' : 'Changed Project Status',
              entityType: 'Project',
              entityId: String(project?.id ?? projectId ?? ''),
              entityName: name,
              changeType: isCancelled ? 'delete' : 'update',
              oldValues: { status: prevStatus },
              newValues: { status: newStatus },
              description: `${name}: ${prevStatus} -> ${newStatus}`
            });
          }
        } catch (logErr) {
          console.warn('Projects audit logging failed:', logErr);
        }
      } catch (err) {
        console.warn('Failed handling projects-updated event:', err);
      }
    };

    window.addEventListener('projects-updated', handleProjectsUpdated as EventListener);
    return () => window.removeEventListener('projects-updated', handleProjectsUpdated as EventListener);
  }, []);

  // Initialize projects with sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      client: 'ABC Corporation',
      manager: 'John Smith',
      status: 'In Progress',
      priority: 'High',
      progress: 75,
      budget: 25000,
      expenses: 12000,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      team: ['John Smith', 'Sarah Connor'],
      tags: ['Web Development', 'UI/UX'],
      description: 'Complete redesign of corporate website with modern UI/UX',
      code: 'WEB-2025-001',
      salaryExpenses: 0,
      totalProjectExpenses: 12000,
      projectType: 'timeline'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      client: 'Tech Solutions',
      manager: 'Sarah Connor',
      status: 'Planning',
      priority: 'Medium',
      progress: 40,
      budget: 50000,
      expenses: 18000,
      startDate: '2025-04-15',
      endDate: '2025-08-30',
      team: ['Mike Johnson', 'Lisa Anderson'],
      tags: ['Mobile', 'React Native'],
      description: 'Native mobile application for iOS and Android platforms',
      code: 'MOB-2025-002',
      salaryExpenses: 0,
      totalProjectExpenses: 18000,
      projectType: 'timeline'
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      client: 'Global Retail',
      manager: 'David Lee',
      status: 'Completed',
      priority: 'High',
      progress: 100,
      budget: 15000,
      expenses: 14800,
      startDate: '2025-03-10',
      endDate: '2025-05-20',
      team: ['Emma Brown', 'James Wilson', 'Anna Taylor'],
      tags: ['Marketing', 'Digital'],
      description: 'Comprehensive digital marketing campaign',
      code: 'MKT-2025-003',
      salaryExpenses: 0,
      totalProjectExpenses: 14800,
      projectType: 'timeline'
    },
    {
      id: 4,
      name: 'Office Renovation',
      client: 'MOK Internal',
      manager: 'Robert Chen',
      status: 'On Hold',
      priority: 'Low',
      progress: 35,
      budget: 75000,
      expenses: 25000,
      startDate: '2025-02-15',
      endDate: '2025-06-15',
      team: ['Robert Chen'],
      tags: ['Construction', 'Internal'],
      description: 'Renovation of office space and facilities',
      code: 'REN-2025-004',
      salaryExpenses: 0,
      totalProjectExpenses: 25000,
      projectType: 'timeline'
    },
    {
      id: 5,
      name: 'Product Launch',
      client: 'Innovate Inc.',
      manager: 'Lisa Park',
      status: 'Cancelled',
      priority: 'Medium',
      progress: 60,
      budget: 30000,
      expenses: 8000,
      startDate: '2025-01-20',
      endDate: '2025-04-30',
      team: ['Lisa Park'],
      tags: ['Product', 'Launch'],
      description: 'Launch of new product line with marketing support',
      code: 'PRD-2025-005',
      salaryExpenses: 0,
      totalProjectExpenses: 8000,
      projectType: 'timeline'
    }
    ];

    // Load projects from localStorage or use sample data
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects);
        // Ensure all projects have the new salary expense fields and sync expense totals
        const updatedProjects = parsed.map((project: Project) => {
          const salaryExpenses = project.salaryExpenses || calculateProjectSalaryExpenses(project);
          // Get actual expense totals from sync service
          const expenseTotals = syncService.getProjectExpenseSummary(project.id);
          return {
            ...project,
            salaryExpenses,
            totalProjectExpenses: expenseTotals.totalExpenses + salaryExpenses,
            expenses: expenseTotals.totalExpenses // Update the expenses field with actual assigned expenses
          };
        });
        setProjects(updatedProjects);
        
        // Save updated projects back to localStorage
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        console.log('Projects: Updated project expense totals from sync service');
      } catch (error) {
        console.error('Error parsing stored projects:', error);
        setProjects(sampleProjects);
        // Save sample projects to localStorage as fallback
        localStorage.setItem('projects', JSON.stringify(sampleProjects));
      }
    } else {
      setProjects(sampleProjects);
      // Save sample projects to localStorage for first time users
      localStorage.setItem('projects', JSON.stringify(sampleProjects));
      console.log('Projects: Saved sample projects to localStorage');
    }
    
    // Update all project expenses to ensure sync
    syncService.updateAllProjectExpenses();
  }, []);

  // Calculate summary statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const overdueProjects = projects.filter(p => {
    if (p.projectType === 'ongoing') return false;
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    const today = new Date();
    return endDate < today && p.status !== 'Completed';
  }).length;
  
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalExpenses = projects.reduce((sum, p) => sum + p.expenses, 0);
  const totalProfit = totalBudget - totalExpenses;
  
  // Handler for updating a project after editing
  const handleEditProject = (updatedProject: Project) => {
    const previous = projects.find(p => p.id === updatedProject.id);
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    // Store updated projects in localStorage
    try {
      localStorage.setItem('projects', JSON.stringify(
        projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      ));
      // Notify other modules (e.g., Performance) that projects changed
      window.dispatchEvent(new Event('projectsUpdated'));
      // Dispatch custom event for notifications
      try {
        if (typeof window !== 'undefined') {
          const action = previous && previous.status !== updatedProject.status ? 'status-changed' : 'updated';
          const detail = previous && previous.status !== updatedProject.status
            ? { action, project: updatedProject, status: updatedProject.status, previousStatus: previous.status }
            : { action, project: updatedProject };
          window.dispatchEvent(new CustomEvent('projects-updated', { detail }));
        }
      } catch {}
    } catch (error) {
      console.error('Error saving updated project to localStorage:', error);
    }
  };

  // Handler for updating a project (used for employee assignments and other updates)
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      );
      
      // Store updated projects in localStorage
      try {
        localStorage.setItem('projects', JSON.stringify(updated));
        // Broadcast change for listeners (Performance tab)
        window.dispatchEvent(new Event('projectsUpdated'));
        // Dispatch custom event for notifications
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('projects-updated', {
              detail: { action: 'updated', project: updatedProject }
            }));
          }
        } catch {}
      } catch (error) {
        console.error('Error saving updated project to localStorage:', error);
      }
      
      return updated;
    });
  };

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

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'client':
          comparison = a.client.localeCompare(b.client);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'startDate':
          {
            const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.POSITIVE_INFINITY;
            const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.POSITIVE_INFINITY;
            comparison = aTime - bTime;
          }
          break;
        case 'endDate':
          {
            const aTime = a.endDate ? new Date(a.endDate).getTime() : Number.POSITIVE_INFINITY;
            const bTime = b.endDate ? new Date(b.endDate).getTime() : Number.POSITIVE_INFINITY;
            comparison = aTime - bTime;
          }
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Toggle sort order
  const handleSort = (column: string) => {
    // Compute next sort state
    const nextSortBy = sortBy === column ? sortBy : column;
    const nextSortOrder = sortBy === column ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';

    // Apply state updates
    if (sortBy === column) {
      setSortOrder(nextSortOrder);
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }

    // Audit log (non-blocking)
    try {
      logAudit({
        category: 'system',
        action: 'Sort Projects',
        changeType: 'read',
        description: `Sorted by ${nextSortBy} (${nextSortOrder})`,
        metadata: { sortBy: nextSortBy, sortOrder: nextSortOrder }
      });
    } catch (err) {
      console.warn('Projects audit logging (sort) failed:', err);
    }
  };

  // UI interaction audit helpers
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    try {
      logAudit({
        category: 'system',
        action: 'Search Projects',
        changeType: 'read',
        description: `Search term: ${term && term.trim() ? term : '(cleared)'}`,
        metadata: { searchTerm: term }
      });
    } catch (err) {
      console.warn('Projects audit logging (search) failed:', err);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    try {
      logAudit({
        category: 'system',
        action: 'Filter Projects',
        changeType: 'read',
        description: `Status filter: ${status}`,
        metadata: { status }
      });
    } catch (err) {
      console.warn('Projects audit logging (status filter) failed:', err);
    }
  };

  const handleToggleFilters = () => {
    const next = !showFilters;
    setShowFilters(next);
    try {
      logAudit({
        category: 'system',
        action: 'Toggle Filters Panel',
        changeType: 'read',
        description: `Filters panel ${next ? 'opened' : 'closed'}`,
        metadata: { open: next }
      });
    } catch (err) {
      console.warn('Projects audit logging (toggle filters) failed:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    try {
      logAudit({
        category: 'system',
        action: 'Open Create Project Modal',
        changeType: 'read',
        description: 'Opened create project modal'
      });
    } catch (err) {
      console.warn('Projects audit logging (open create modal) failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black flex relative overflow-hidden">
      <DashboardBackground />

      <div className="flex-1 relative z-10">
        <div className="flex items-center h-20 px-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium glass backdrop-blur-md bg-slate-100/80 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 shadow-business hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors animate-fade-in"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.backToDashboard')}
          </Link>
        </div>

        <main className="p-8">
          <ProjectsHeader onCreateProject={handleOpenCreateModal} />
          
          <ProjectsStats projects={projects} />

          <ProjectsSearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilterChange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            handleSort={handleSort}
            selectedProjects={selectedProjects}
            showFilters={showFilters}
            setShowFilters={handleToggleFilters}
          />

          {showFilters && (
            <ProjectFilters onClose={() => setShowFilters(false)} />
          )}

          {/* Projects Content */}
          <div className="glass backdrop-blur-md bg-white/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 shadow-business rounded-xl p-6 mt-6">
            <ProjectsGrid 
              projects={filteredProjects}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              onEditProject={handleEditProject}
              onUpdateProject={handleUpdateProject}
            />
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <ProjectsEmptyState onCreateProject={() => setShowCreateModal(true)} />
          )}

          {/* Create Project Modal */}
          {showCreateModal && (
            <ErrorBoundary>
              <CreateProjectModal 
                onClose={() => setShowCreateModal(false)}
                onSubmit={(projectData) => {
                console.log('New project:', projectData);
                
                // Create a new project with the correct type
                const newProject: Project = {
                  id: typeof projectData.id === 'number' ? projectData.id : Date.now(),
                  name: typeof projectData.name === 'string' ? projectData.name : '',
                  client: typeof projectData.client === 'string' ? projectData.client : '',
                  manager: typeof projectData.manager === 'string' ? projectData.manager : '',
                  status: (typeof projectData.status === 'string' ? projectData.status : 'Planning') as 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Cancelled' | 'Not Started' | 'Overdue',
                  priority: (typeof projectData.priority === 'string' ? projectData.priority : 'Medium') as 'High' | 'Medium' | 'Low',
                  progress: typeof projectData.progress === 'number' ? projectData.progress : 0,
                  budget: typeof projectData.budget === 'string' ? parseFloat(projectData.budget) || 0 : 0,
                  expenses: typeof projectData.expenses === 'number' ? projectData.expenses : 0,
                  startDate: projectData.projectType === 'timeline' && typeof projectData.startDate === 'string' ? projectData.startDate : '',
                  endDate: projectData.projectType === 'timeline' && typeof projectData.endDate === 'string' ? projectData.endDate : '',
                  team: Array.isArray(projectData.team) ? projectData.team : [],
                  tags: Array.isArray(projectData.tags) ? projectData.tags : [],
                  description: typeof projectData.description === 'string' ? projectData.description : '',
                  code: typeof projectData.code === 'string' ? projectData.code : `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
                  projectType: (projectData as any).projectType === 'ongoing' ? 'ongoing' : 'timeline'
                };
                
                // Add the new project to the projects array
                const updatedProjects = [...projects, newProject];
                setProjects(updatedProjects);
                
                // Store in localStorage
                try {
                  localStorage.setItem('projects', JSON.stringify(updatedProjects));
                  // Broadcast that projects list has changed
                  window.dispatchEvent(new Event('projectsUpdated'));
                  // Dispatch custom event for notifications
                  try {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('projects-updated', {
                        detail: { action: 'created', project: newProject }
                      }));
                    }
                  } catch {}
                } catch (error) {
                  console.error('Error saving new project to localStorage:', error);
                }
                
                setShowCreateModal(false);
                
                // Show success notification (if you have a notification system)
                // toast.success('Project created successfully');
              }}
              />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

export default Projects;
