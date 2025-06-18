
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsHeaderProps {
  onCreateProject: () => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ onCreateProject }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
          Projects
        </h1>
        <p className="text-slate-600 mt-2">Manage and track all your projects</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onCreateProject}
          className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
