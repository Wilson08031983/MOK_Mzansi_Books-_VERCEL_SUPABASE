// Utility functions for projects
import { Project, Task } from '@/types/project';

/**
 * Calculate the derived status of a project based on its tasks and deadlines
 * @param project The project object
 * @returns The derived status
 */
export const calculateProjectStatus = (project: Project): string => {
  if (!project.tasks || project.tasks.length === 0) {
    // No tasks - use manual status or default to Planning
    return project.status || 'Planning';
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(task => task.completed).length;
  const isAnyTaskStarted = completedTasks > 0 || project.tasks.some(task => !task.completed && new Date(task.startDate || '') <= new Date());
  
  // Check if project is overdue
  const endDate = new Date(project.endDate);
  const today = new Date();
  const isOverdue = endDate < today;
  
  // Determine status based on task completion and deadlines
  if (completedTasks === totalTasks) {
    return 'Completed';
  } else if (isOverdue && completedTasks < totalTasks) {
    return 'Overdue';
  } else if (!isAnyTaskStarted) {
    return 'Not Started';
  } else if (completedTasks > 0 && completedTasks < totalTasks) {
    return 'In Progress';
  }
  
  // Fallback to current status or Planning
  return project.status || 'Planning';
};

/**
 * Calculate the progress percentage of a project based on completed tasks
 * @param project The project object
 * @returns Progress percentage (0-100)
 */
export const calculateProjectProgress = (project: Project): number => {
  if (!project.tasks || project.tasks.length === 0) {
    return 0;
  }
  
  const completedTasks = project.tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / project.tasks.length) * 100);
};
