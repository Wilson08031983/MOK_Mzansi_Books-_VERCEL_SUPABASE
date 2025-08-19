/**
 * Activity Logging Service
 * Centralized service for tracking all user activities across the application
 */

import { User, FileText, Settings, Shield, Plus, Edit, Trash2, Send, Users, DollarSign, Calendar } from 'lucide-react';

export interface ActivityEntry {
  id: string;
  type: 'user' | 'document' | 'settings' | 'security' | 'system' | 'financial' | 'task' | 'project';
  action: string;
  user: string;
  userId: string;
  timestamp: string; // ISO string
  details: string;
  entityType?: string; // e.g., 'invoice', 'quotation', 'client', 'task'
  entityId?: string;
  metadata?: Record<string, any>; // Additional context data
}

export interface ActivityIcon {
  icon: any; // Lucide icon component
  color: string; // Tailwind gradient classes
}

class ActivityService {
  private readonly STORAGE_KEY = 'activityLog';
  private readonly MAX_ACTIVITIES = 1000; // Limit to prevent localStorage bloat

  /**
   * Get activity icon and color based on type and action
   */
  private getActivityIcon(type: string, action: string): ActivityIcon {
    // Map activity types to appropriate icons and colors
    const iconMap: Record<string, ActivityIcon> = {
      user: { icon: User, color: 'from-mokm-blue-500 to-mokm-purple-500' },
      document: { icon: FileText, color: 'from-mokm-orange-500 to-mokm-pink-500' },
      settings: { icon: Settings, color: 'from-mokm-purple-500 to-mokm-blue-500' },
      security: { icon: Shield, color: 'from-mokm-pink-500 to-mokm-orange-500' },
      financial: { icon: DollarSign, color: 'from-mokm-green-500 to-mokm-blue-500' },
      task: { icon: Calendar, color: 'from-mokm-yellow-500 to-mokm-orange-500' },
      project: { icon: Users, color: 'from-mokm-indigo-500 to-mokm-purple-500' },
      system: { icon: Settings, color: 'from-mokm-gray-500 to-mokm-slate-500' }
    };

    // Special cases based on action keywords
    if (action.toLowerCase().includes('creat')) {
      return { icon: Plus, color: 'from-mokm-green-500 to-mokm-blue-500' };
    }
    if (action.toLowerCase().includes('updat') || action.toLowerCase().includes('edit')) {
      return { icon: Edit, color: 'from-mokm-yellow-500 to-mokm-orange-500' };
    }
    if (action.toLowerCase().includes('delet') || action.toLowerCase().includes('remov')) {
      return { icon: Trash2, color: 'from-mokm-red-500 to-mokm-pink-500' };
    }
    if (action.toLowerCase().includes('sent') || action.toLowerCase().includes('send')) {
      return { icon: Send, color: 'from-mokm-blue-500 to-mokm-indigo-500' };
    }

    return iconMap[type] || { icon: FileText, color: 'from-mokm-gray-500 to-mokm-slate-500' };
  }

  /**
   * Get current user information for activity logging
   */
  private getCurrentUser(): { name: string; id: string } {
    try {
      const user = localStorage.getItem('mokUser');
      if (user) {
        const parsedUser = JSON.parse(user);
        const name = parsedUser.user_metadata?.full_name || 
                    `${parsedUser.user_metadata?.first_name || ''} ${parsedUser.user_metadata?.last_name || ''}`.trim() ||
                    parsedUser.email?.split('@')[0] || 'Unknown User';
        
        return {
          name,
          id: parsedUser.id || 'unknown'
        };
      }
    } catch (error) {
      console.error('Error getting current user for activity log:', error);
    }
    
    return { name: 'System User', id: 'system' };
  }

  /**
   * Log a new activity
   */
  public logActivity(
    type: ActivityEntry['type'],
    action: string,
    details: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ): void {
    try {
      const user = this.getCurrentUser();
      
      const activity: ActivityEntry = {
        id: crypto.randomUUID(),
        type,
        action,
        user: user.name,
        userId: user.id,
        timestamp: new Date().toISOString(),
        details,
        entityType,
        entityId,
        metadata
      };

      this.saveActivity(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging should be non-blocking
    }
  }

  /**
   * Save activity to localStorage with size management
   */
  private saveActivity(activity: ActivityEntry): void {
    try {
      const activities = this.getActivities();
      
      // Add new activity to the beginning
      activities.unshift(activity);
      
      // Limit the number of activities to prevent localStorage bloat
      if (activities.length > this.MAX_ACTIVITIES) {
        activities.splice(this.MAX_ACTIVITIES);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
      
      // Notify listeners that activities have been updated
      try {
        window.dispatchEvent(new CustomEvent('activity-log-updated'));
      } catch {}
    } catch (error) {
      console.error('Error saving activity to localStorage:', error);
      
      // If storage is full, try to clear some space
      try {
        const activities = this.getActivities();
        const reducedActivities = activities.slice(0, Math.floor(this.MAX_ACTIVITIES / 2));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedActivities));
        
        // Try to save the new activity again
        reducedActivities.unshift(activity);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedActivities));
        
        // Notify listeners that activities have been updated after retry
        try {
          window.dispatchEvent(new CustomEvent('activity-log-updated'));
        } catch {}
      } catch (retryError) {
        console.error('Error retrying activity save:', retryError);
      }
    }
  }

  /**
   * Get all activities from localStorage
   */
  public getActivities(): ActivityEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const activities = JSON.parse(stored);
        // Ensure it's an array and validate structure
        if (Array.isArray(activities)) {
          return activities.filter(activity => 
            activity &&
            typeof activity === 'object' &&
            activity.id &&
            activity.type &&
            activity.action &&
            activity.timestamp
          );
        }
      }
    } catch (error) {
      console.error('Error loading activities from localStorage:', error);
    }
    
    return [];
  }

  /**
   * Get activities with enhanced display information
   */
  public getActivitiesWithIcons(): (ActivityEntry & ActivityIcon)[] {
    const activities = this.getActivities();
    
    return activities.map(activity => ({
      ...activity,
      ...this.getActivityIcon(activity.type, activity.action)
    }));
  }

  /**
   * Filter activities by various criteria
   */
  public filterActivities<T extends ActivityEntry>(
    activities: T[],
    filters: {
      searchTerm?: string;
      type?: string;
      userId?: string;
      entityType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): T[] {
    return activities.filter(activity => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const searchableText = `${activity.action} ${activity.details} ${activity.user}`.toLowerCase();
        if (!searchableText.includes(term)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && filters.type !== 'all' && activity.type !== filters.type) {
        return false;
      }

      // User filter
      if (filters.userId && activity.userId !== filters.userId) {
        return false;
      }

      // Entity type filter
      if (filters.entityType && activity.entityType !== filters.entityType) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const activityDate = new Date(activity.timestamp);
        if (filters.dateFrom && activityDate < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && activityDate > filters.dateTo) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Clear all activities (for admin use)
   */
  public clearActivities(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.logActivity('system', 'Activity log cleared', 'All activities were cleared by administrator');
      
      // Also notify listeners about the clear action explicitly
      try {
        window.dispatchEvent(new CustomEvent('activity-log-updated'));
      } catch {}
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  }

  /**
   * Export activities as JSON
   */
  public exportActivities(): string {
    const activities = this.getActivities();
    return JSON.stringify(activities, null, 2);
  }

  // Convenience methods for common activity types

  public logUserAction(action: string, details: string, metadata?: Record<string, any>): void {
    this.logActivity('user', action, details, undefined, undefined, metadata);
  }

  public logDocumentAction(action: string, details: string, entityType: string, entityId?: string, metadata?: Record<string, any>): void {
    this.logActivity('document', action, details, entityType, entityId, metadata);
  }

  public logSecurityAction(action: string, details: string, metadata?: Record<string, any>): void {
    this.logActivity('security', action, details, undefined, undefined, metadata);
  }

  public logSettingsAction(action: string, details: string, metadata?: Record<string, any>): void {
    this.logActivity('settings', action, details, undefined, undefined, metadata);
  }

  public logFinancialAction(action: string, details: string, entityType: string, entityId?: string, metadata?: Record<string, any>): void {
    this.logActivity('financial', action, details, entityType, entityId, metadata);
  }

  public logTaskAction(action: string, details: string, entityId?: string, metadata?: Record<string, any>): void {
    this.logActivity('task', action, details, 'task', entityId, metadata);
  }

  public logProjectAction(action: string, details: string, entityId?: string, metadata?: Record<string, any>): void {
    this.logActivity('project', action, details, 'project', entityId, metadata);
  }
}

// Export singleton instance
export const activityService = new ActivityService();

export default activityService;