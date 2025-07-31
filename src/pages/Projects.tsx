import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/project';
import { calculateProjectSalaryExpenses } from '@/services/projectEmployeeService';
import ExpenseProjectSyncService from '@/services/expenseProjectSyncService';
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
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

import DashboardBackground from '@/components/dashboard/DashboardBackground';
import DashboardSidebarOverlay from '@/components/dashboard/DashboardSidebarOverlay';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsStats from '@/components/projects/ProjectsStats';
import ProjectsSearchAndFilters from '@/components/projects/ProjectsSearchAndFilters';
import ProjectsList from '@/components/projects/ProjectsList';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectsKanban from '@/components/projects/ProjectsKanban';
import ProjectsEmptyState from '@/components/projects/ProjectsEmptyState';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import ProjectFilters from '@/components/projects/ProjectFilters';

// Using shared Project type from types/project.ts

const Projects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([]);

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
      totalProjectExpenses: 12000
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
      totalProjectExpenses: 18000
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
      totalProjectExpenses: 14800
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
      totalProjectExpenses: 25000
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
      totalProjectExpenses: 8000
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
    const endDate = new Date(p.endDate);
    const today = new Date();
    return endDate < today && p.status !== 'Completed';
  }).length;
  
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalExpenses = projects.reduce((sum, p) => sum + p.expenses, 0);
  const totalProfit = totalBudget - totalExpenses;
  
  // Handler for updating a project after editing
  const handleEditProject = (updatedProject: Project) => {
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
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'endDate':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Toggle sort order
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative overflow-hidden">
      <DashboardBackground />
      
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-0 relative z-10">
        <div className="flex items-center h-20 px-8">
          <Link to="/dashboard" className="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <main className="p-8">
          <ProjectsHeader onCreateProject={() => setShowCreateModal(true)} />
          
          <ProjectsStats projects={projects} />

          <ProjectsSearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            handleSort={handleSort}
            selectedProjects={selectedProjects}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {showFilters && (
            <ProjectFilters onClose={() => setShowFilters(false)} />
          )}

          {/* Projects Content */}
          <div className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business rounded-xl p-6 mt-6">
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
                  startDate: typeof projectData.startDate === 'string' ? projectData.startDate : '',
                  endDate: typeof projectData.endDate === 'string' ? projectData.endDate : '',
                  team: Array.isArray(projectData.team) ? projectData.team : [],
                  tags: Array.isArray(projectData.tags) ? projectData.tags : [],
                  description: typeof projectData.description === 'string' ? projectData.description : '',
                  code: typeof projectData.code === 'string' ? projectData.code : `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
                };
                
                // Add the new project to the projects array
                const updatedProjects = [...projects, newProject];
                setProjects(updatedProjects);
                
                // Store in localStorage
                try {
                  localStorage.setItem('projects', JSON.stringify(updatedProjects));
                } catch (error) {
                  console.error('Error saving new project to localStorage:', error);
                }
                
                setShowCreateModal(false);
                
                // Show success notification (if you have a notification system)
                // toast.success('Project created successfully');
              }}
            />
          )}
        </main>
      </div>

      <DashboardSidebarOverlay 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};

export default Projects;
