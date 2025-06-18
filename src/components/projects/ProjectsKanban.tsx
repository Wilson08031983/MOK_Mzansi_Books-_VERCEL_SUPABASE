
import React from 'react';
import { 
  Users,
  Calendar,
  DollarSign,
  MoreVertical
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

interface ProjectsKanbanProps {
  projects: Project[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const ProjectsKanban: React.FC<ProjectsKanbanProps> = ({
  projects,
  getStatusColor,
  getPriorityColor
}) => {
  const columns = [
    { id: 'Planning', title: 'Planning', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100 border-blue-200' },
    { id: 'On Hold', title: 'On Hold', color: 'bg-orange-100 border-orange-200' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-100 border-green-200' },
    { id: 'Cancelled', title: 'Cancelled', color: 'bg-red-100 border-red-200' }
  ];

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnProjects = getProjectsByStatus(column.id);
        
        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${column.color} p-4 mb-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnProjects.length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 max-h-screen overflow-y-auto">
              {columnProjects.map((project) => (
                <Card key={project.id} className="glass backdrop-blur-xl bg-white/90 border-white/20 shadow-business hover-lift transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-slate-900">{project.name}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{project.code}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Client */}
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-slate-900 font-medium">{project.client}</span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Progress</span>
                        <span className="text-xs font-medium text-slate-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget:</span>
                      <span className="text-slate-900 font-medium">R{project.budget.toLocaleString()}</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-slate-600">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <span className="text-xs text-slate-500">{project.manager}</span>
                    </div>

                    {/* Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {project.team.slice(0, 3).map((member, index) => (
                          <div 
                            key={index}
                            className="w-6 h-6 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            title={member}
                          >
                            {member.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-medium">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnProjects.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No projects</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsKanban;
