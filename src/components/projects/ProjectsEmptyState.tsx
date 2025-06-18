
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsEmptyStateProps {
  onCreateProject: () => void;
}

const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = ({ onCreateProject }) => {
  return (
    <div className="text-center py-12 glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business rounded-xl">
      <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
        <Calendar className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-500">No projects found</h3>
      <p className="mt-1 text-slate-400">
        Create a new project or adjust your filters to see projects
      </p>
      <div className="mt-6">
        <Button 
          onClick={onCreateProject}
          className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectsEmptyState;
