
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

type TaskItem = {
  id: number | string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
};

interface TaskListProps {
  tasks: TaskItem[];
  onAddTaskClick?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTaskClick }) => {
  const { t } = useLocalization();
  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 dark:border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-slate-900 dark:text-slate-100 font-sf-pro">{t('settings.notifications.taskReminders')}</span>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-mokm-purple-100 hover:text-mokm-purple-600 transition-colors"
            onClick={onAddTaskClick}
            aria-label={t('common.add')}
            title={t('common.add')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-300 font-sf-pro text-lg">{t('common.noData')}</p>
            <p className="text-sm text-slate-400 dark:text-slate-400 mt-2 font-sf-pro">{t('settings.notifications.upcomingTaskNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className={`p-4 rounded-xl border border-white/10 dark:border-white/10 hover:border-mokm-purple-300/40 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 animate-fade-in delay-${index * 100}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-sf-pro">{task.title}</p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{task.dueDate}</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
