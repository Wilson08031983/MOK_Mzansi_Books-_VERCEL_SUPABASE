import { useEffect } from 'react';
import { updateAllActiveProjectsWithAttendanceExpenses } from '@/services/projectAttendanceExpenseService';

/**
 * Hook to automatically sync attendance pay with project expenses
 * This hook should be used in the main application to ensure
 * project expenses are always up-to-date with attendance data
 */
export const useProjectAttendanceSync = () => {
  useEffect(() => {
    // Initial sync when the app loads
    const performInitialSync = () => {
      try {
        updateAllActiveProjectsWithAttendanceExpenses();
        console.log('Initial project attendance sync completed');
      } catch (error) {
        console.error('Error during initial project attendance sync:', error);
      }
    };

    // Perform initial sync
    performInitialSync();

    // Set up periodic sync every 5 minutes (300000ms)
    const syncInterval = setInterval(() => {
      try {
        updateAllActiveProjectsWithAttendanceExpenses();
        console.log('Periodic project attendance sync completed');
      } catch (error) {
        console.error('Error during periodic project attendance sync:', error);
      }
    }, 300000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  // Manual sync function that can be called from components
  const manualSync = () => {
    try {
      updateAllActiveProjectsWithAttendanceExpenses();
      return { success: true, message: 'Project expenses synced successfully' };
    } catch (error) {
      console.error('Error during manual project attendance sync:', error);
      return { success: false, message: 'Failed to sync project expenses' };
    }
  };

  return { manualSync };
};

/**
 * Hook to sync a specific project with attendance expenses
 * Useful when creating or updating individual projects
 */
export const useProjectSync = () => {
  const syncProject = (projectId: number) => {
    try {
      // Get projects from localStorage
      const projectsRaw = localStorage.getItem('projects');
      if (!projectsRaw) return { success: false, message: 'No projects found' };

      const projects = JSON.parse(projectsRaw);
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex === -1) {
        return { success: false, message: 'Project not found' };
      }

      // Update all projects to ensure consistency
      updateAllActiveProjectsWithAttendanceExpenses();
      
      return { success: true, message: 'Project synced successfully' };
    } catch (error) {
      console.error('Error syncing project:', error);
      return { success: false, message: 'Failed to sync project' };
    }
  };

  return { syncProject };
};
