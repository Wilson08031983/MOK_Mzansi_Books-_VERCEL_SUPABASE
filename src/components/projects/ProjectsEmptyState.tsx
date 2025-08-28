
import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/hooks/useLocalization';

interface ProjectsEmptyStateProps {
  onCreateProject: () => void;
}

const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = ({ onCreateProject }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center py-12 glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business rounded-xl">
      <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
        <Calendar className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-500">{t('projects.grid.empty')}</h3>
      <div className="mt-6">
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

export default ProjectsEmptyState;
