import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

interface Project {
  id: number;
  name: string;
  client: string;
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
}

const Projects = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // list, grid, kanban
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Website Redesign',
      client: 'ABC Corporation',
      manager: 'John Smith',
      status: 'In Progress',
      priority: 'High',
      progress: 75,
      budget: 25000,
      expenses: 15000,
      startDate: '2025-05-01',
      endDate: '2025-07-15',
      team: ['Sarah Parker', 'Michael Johnson', 'Lisa Williams', 'David Brown'],
      tags: ['Web Development', 'UI/UX'],
      description: 'Complete redesign of corporate website with modern UI/UX',
      code: 'WEB-2025-001'
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
      code: 'MOB-2025-002'
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
      code: 'MKT-2025-003'
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
      team: ['Tom Wilson', 'Jane Smith', 'Mark Davis', 'Carol White'],
      tags: ['Construction', 'Internal'],
      description: 'Complete office space renovation and modernization',
      code: 'REN-2025-004'
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
      expenses: 18000,
      startDate: '2025-01-10',
      endDate: '2025-04-10',
      team: ['Alex Johnson', 'Maria Garcia', 'Steve Brown'],
      tags: ['Product', 'Launch'],
      description: 'New product launch strategy and execution',
      code: 'PRD-2025-005'
    }
  ]);

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
            viewMode={viewMode}
            setViewMode={setViewMode}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {showFilters && (
            <ProjectFilters onClose={() => setShowFilters(false)} />
          )}

          {/* Projects Content */}
          <div className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business rounded-xl p-6 mt-6">
            {viewMode === 'list' && (
              <ProjectsList 
                projects={filteredProjects}
                selectedProjects={selectedProjects}
                setSelectedProjects={setSelectedProjects}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            )}
            
            {viewMode === 'grid' && (
              <ProjectsGrid 
                projects={filteredProjects}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                onEditProject={handleEditProject}
              />
            )}
            
            {viewMode === 'kanban' && (
              <ProjectsKanban 
                projects={filteredProjects}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            )}
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
                  id: projectData.id || Date.now(),
                  name: projectData.name,
                  client: projectData.client,
                  manager: projectData.manager || '',
                  status: (projectData.status || 'Planning') as 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Cancelled',
                  priority: (projectData.priority || 'Medium') as 'High' | 'Medium' | 'Low',
                  progress: projectData.progress || 0,
                  budget: parseFloat(projectData.budget) || 0,
                  expenses: projectData.expenses || 0,
                  startDate: projectData.startDate || '',
                  endDate: projectData.endDate || '',
                  team: projectData.team || [],
                  tags: projectData.tags || [],
                  description: projectData.description || '',
                  code: projectData.code || `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
                };
                
                // Add the new project to the projects array
                setProjects(prevProjects => [...prevProjects, newProject]);
                
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
