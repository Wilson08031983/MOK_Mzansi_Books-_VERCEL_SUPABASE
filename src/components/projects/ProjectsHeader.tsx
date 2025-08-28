
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/hooks/useLocalization';

interface ProjectsHeaderProps {
  onCreateProject: () => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ onCreateProject }) => {
  const { t } = useLocalization();
  return (
    <div className="flex items-center justify-between mb-6 glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 rounded-xl px-4 py-3 shadow-business">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
          {t('projects.title')}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('projects.description')}</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onCreateProject}
          className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('projects.newProjectButton')}
        </Button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
