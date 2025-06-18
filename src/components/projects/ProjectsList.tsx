
import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Users,
  Calendar,
  DollarSign 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Project {
  id: number;
  name: string;
  client: string;
  manager: string;
  status: string;
  priority: string;
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

interface ProjectsListProps {
  projects: Project[];
  selectedProjects: number[];
  setSelectedProjects: (projects: number[]) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  selectedProjects,
  setSelectedProjects,
  getStatusColor,
  getPriorityColor
}) => {
  const handleSelectProject = (projectId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4">
              <input
                type="checkbox"
                checked={selectedProjects.length === projects.length && projects.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300"
              />
            </th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Project Name</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Client</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Manager</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Timeline</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Progress</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Budget</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleSelectProject(project.id)}
                  className="rounded border-slate-300"
                />
              </td>
              <td className="py-4 px-4">
                <div>
                  <div className="font-medium text-slate-900">{project.name}</div>
                  <div className="text-sm text-slate-500">{project.code}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-slate-900">{project.client}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-slate-900">{project.manager}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm">
                  <div className="flex items-center text-slate-600 mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(project.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600">{project.progress}%</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm">
                  <div className="text-slate-900 font-medium">R{project.budget.toLocaleString()}</div>
                  <div className="text-slate-500">Spent: R{project.expenses.toLocaleString()}</div>
                  <div className={`text-xs ${project.budget - project.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Remaining: R{(project.budget - project.expenses).toLocaleString()}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-slate-600">No projects found</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
