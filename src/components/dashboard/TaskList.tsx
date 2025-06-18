
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

type TaskItem = {
  id: number | string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
};

interface TaskListProps {
  tasks: TaskItem[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-slate-900 font-sf-pro">Upcoming Tasks</span>
          <Button variant="ghost" size="sm" className="hover:bg-mokm-purple-100 hover:text-mokm-purple-600 transition-colors">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-sf-pro text-lg">No upcoming tasks</p>
            <p className="text-sm text-slate-400 mt-2 font-sf-pro">Your tasks will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className={`p-4 rounded-xl border border-white/20 hover:border-mokm-purple-300/50 hover:bg-white/20 transition-all duration-300 animate-fade-in delay-${index * 100}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900 font-sf-pro">{task.title}</p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700' :
                    task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700' :
                    'bg-gradient-to-r from-green-100 to-green-200 text-green-700'
                  } font-sf-pro`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center mt-3 text-xs text-slate-500 font-sf-pro">
                  <Calendar className="h-3 w-3 mr-2" />
                  Due: {task.dueDate}
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
