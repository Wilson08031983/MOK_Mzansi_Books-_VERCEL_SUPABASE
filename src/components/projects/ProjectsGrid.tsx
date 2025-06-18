
import React from 'react';
import { 
  Eye, 
  Edit, 
  MoreVertical, 
  Users,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface ProjectsGridProps {
  projects: Project[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  getStatusColor,
  getPriorityColor
}) => {
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
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
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
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
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
  );
};

export default ProjectsGrid;
