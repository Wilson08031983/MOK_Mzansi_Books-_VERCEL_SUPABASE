/**
 * Comprehensive Audit Logging Service
 * System-wide audit trail for all critical user actions and system changes
 */

import { 
  User, FileText, Settings, Shield, Plus, Edit, Trash2, Send, Users, 
  DollarSign, Calendar, Building2, Receipt, Briefcase, PackageOpen,
  UserCheck, Calculator, PieChart, Download, Upload, Eye, Lock,
  CheckCircle, XCircle, AlertTriangle, Clock, Database, Mail
} from 'lucide-react';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: string;
  
  // Action context
  category: 'navigation' | 'crud' | 'auth' | 'settings' | 'financial' | 'hr' | 'document' | 'system' | 'inventory';
  action: string; // e.g., "Created Invoice", "Updated Employee", "Changed Theme"
  
  // Location context
  page: string; // e.g., "Invoices", "HR Management", "Settings"
  section?: string; // e.g., "General Tab", "Team Management", "Edit Invoice Modal"
  
  // Entity context
  entityType?: string; // e.g., "invoice", "employee", "client", "setting"
  entityId?: string;
  entityName?: string; // Human readable name/title
  
  // Change details
  changeType: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'send' | 'approve' | 'reject';
  oldValues?: Record<string, any>; // Before state
  newValues?: Record<string, any>; // After state
  
  // Additional context
  description: string; // Human readable description
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Security and integrity
  severity: 'low' | 'medium' | 'high' | 'critical';
  immutable: boolean; // Cannot be modified after creation
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface AuditIcon {
  icon: any;
  color: string;
  bgColor: string;
}

class AuditService {
  private readonly STORAGE_KEY = 'auditLog';
  private readonly MAX_ENTRIES = 2000;
  private readonly CRITICAL_ACTIONS = [
    'delete', 'remove', 'clear', 'reset', 'approve', 'reject', 'send', 'export'
  ];

  /**
   * Get current user information for audit logging
   */
  private getCurrentUser(): { id: string; name: string; role: string } {
    try {
      // Try localStorage first (local auth)
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        const user = JSON.parse(localUser);
        return {
          id: user.id || 'unknown',
          name: user.fullName || user.email?.split('@')[0] || 'Unknown User',
          role: user.role || 'User'
        };
      }

      // Fallback to mokUser
      const mokUser = localStorage.getItem('mokUser');
      if (mokUser) {
        const user = JSON.parse(mokUser);
        const name = user.user_metadata?.full_name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                    user.email?.split('@')[0] || 'Unknown User';
        
        return {
          id: user.id || 'unknown',
          name,
          role: user.user_metadata?.role || 'User'
        };
      }
    } catch (error) {
      console.error('Error getting current user for audit log:', error);
    }
    
    return { id: 'system', name: 'System User', role: 'System' };
  }

  /**
   * Get audit icon and styling based on category and action
   */
  private getAuditIcon(category: string, action: string, changeType: string): AuditIcon {
    // Priority: changeType > action keywords > category
    const actionLower = action.toLowerCase();
    
    // Change type based icons
    if (changeType === 'create' || actionLower.includes('creat') || actionLower.includes('add')) {
      return { icon: Plus, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    if (changeType === 'update' || actionLower.includes('updat') || actionLower.includes('edit') || actionLower.includes('modif')) {
      return { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
    if (changeType === 'delete' || actionLower.includes('delet') || actionLower.includes('remov')) {
      return { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    if (changeType === 'send' || actionLower.includes('sent') || actionLower.includes('email')) {
      return { icon: Send, color: 'text-purple-600', bgColor: 'bg-purple-100' };
    }
    if (changeType === 'export' || actionLower.includes('export') || actionLower.includes('download')) {
      return { icon: Download, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    }
    if (changeType === 'import' || actionLower.includes('import') || actionLower.includes('upload')) {
      return { icon: Upload, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    }
    if (changeType === 'read' || actionLower.includes('view') || actionLower.includes('open')) {
      return { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
    if (actionLower.includes('approv')) {
      return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    if (actionLower.includes('reject') || actionLower.includes('declin')) {
      return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
    }

    // Category based icons
    const categoryMap: Record<string, AuditIcon> = {
      navigation: { icon: Eye, color: 'text-gray-500', bgColor: 'bg-gray-50' },
      crud: { icon: Database, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      auth: { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-100' },
      settings: { icon: Settings, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      financial: { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
      hr: { icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      document: { icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-100' },
      system: { icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100' }
    };

    return categoryMap[category] || { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }

  /**
   * Determine severity based on action and change type
   */
  private getSeverity(changeType: string, action: string, entityType?: string): AuditEntry['severity'] {
    const actionLower = action.toLowerCase();
    
    // Critical actions
    if (this.CRITICAL_ACTIONS.some(critical => actionLower.includes(critical))) {
      return 'critical';
    }
    
    // High severity for sensitive data
    if (entityType && ['user', 'employee', 'setting', 'permission'].includes(entityType)) {
      if (changeType === 'update' || changeType === 'delete') {
        return 'high';
      }
    }
    
    // Medium for financial operations
    if (entityType && ['invoice', 'quotation', 'expense', 'income'].includes(entityType)) {
      return 'medium';
    }
    
    // Low for navigation and reads
    if (changeType === 'read' || actionLower.includes('navigat') || actionLower.includes('view')) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Log a comprehensive audit entry
   */
  public logAudit(params: {
    category: AuditEntry['category'];
    action: string;
    page: string;
    section?: string;
    entityType?: string;
    entityId?: string;
    entityName?: string;
    changeType: AuditEntry['changeType'];
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    description: string;
    metadata?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): void {
    try {
      const user = this.getCurrentUser();
      const severity = params.severity || this.getSeverity(params.changeType, params.action, params.entityType);
      
      const auditEntry: AuditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        
        category: params.category,
        action: params.action,
        
        page: params.page,
        section: params.section,
        
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        
        changeType: params.changeType,
        oldValues: params.oldValues,
        newValues: params.newValues,
        
        description: params.description,
        severity,
        immutable: true,
        
        metadata: {
          ...params.metadata,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      this.saveAuditEntry(auditEntry);
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  }

  /**
   * Save audit entry to localStorage
   */
  private saveAuditEntry(entry: AuditEntry): void {
    try {
      const entries = this.getAuditEntries();
      entries.unshift(entry);
      
      // Enforce rotation: if we exceed the cap, drop oldest items (end of array)
      while (entries.length > this.MAX_ENTRIES) {
        entries.pop();
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
      
      // Notify listeners
      window.dispatchEvent(new CustomEvent('audit-log-updated', { detail: entry }));
    } catch (error) {
      console.error('Error saving audit entry:', error);
    }
  }

  /**
   * Get all audit entries
   */
  public getAuditEntries(): AuditEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored);
        if (Array.isArray(entries)) {
          return entries.filter(entry => 
            entry && typeof entry === 'object' && entry.id && entry.timestamp
          );
        }
      }
    } catch (error) {
      console.error('Error loading audit entries:', error);
    }
    return [];
  }

  /**
   * Get audit entries with display icons
   */
  public getAuditEntriesWithIcons(): (AuditEntry & AuditIcon)[] {
    const entries = this.getAuditEntries();
    
    return entries.map(entry => ({
      ...entry,
      ...this.getAuditIcon(entry.category, entry.action, entry.changeType)
    }));
  }

  /**
   * Filter audit entries
   */
  public filterAuditEntries<T extends AuditEntry>(
    entries: T[],
    filters: {
      searchTerm?: string;
      category?: string;
      severity?: string;
      userId?: string;
      page?: string;
      changeType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): T[] {
    return entries.filter(entry => {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const searchText = `${entry.action} ${entry.description} ${entry.userName} ${entry.page}`.toLowerCase();
        if (!searchText.includes(term)) return false;
      }

      if (filters.category && filters.category !== 'all' && entry.category !== filters.category) {
        return false;
      }

      if (filters.severity && filters.severity !== 'all' && entry.severity !== filters.severity) {
        return false;
      }

      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }

      if (filters.page && filters.page !== 'all' && entry.page !== filters.page) {
        return false;
      }

      if (filters.changeType && filters.changeType !== 'all' && entry.changeType !== filters.changeType) {
        return false;
      }

      if (filters.dateFrom || filters.dateTo) {
        const entryDate = new Date(entry.timestamp);
        if (filters.dateFrom && entryDate < filters.dateFrom) return false;
        if (filters.dateTo && entryDate > filters.dateTo) return false;
      }

      return true;
    });
  }

  /**
   * Export audit log for compliance
   */
  public exportAuditLog(): string {
    const entries = this.getAuditEntries();
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Clear audit log (admin only)
   */
  public clearAuditLog(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.logAudit({
        category: 'system',
        action: 'Audit Log Cleared',
        page: 'System',
        changeType: 'delete',
        description: 'Audit log was cleared by administrator'
      });
    } catch (error) {
      console.error('Error clearing audit log:', error);
    }
  }

  // Convenience methods for common audit scenarios

  public logNavigation(page: string, section?: string): void {
    this.logAudit({
      category: 'navigation',
      action: 'Page Navigation',
      page,
      section,
      changeType: 'read',
      description: `Navigated to ${page}${section ? ` > ${section}` : ''}`
    });
  }

  public logCRUD(action: string, entityType: string, entityId: string, entityName: string, page: string, oldValues?: any, newValues?: any): void {
    const changeType = action.toLowerCase().includes('creat') ? 'create' :
                      action.toLowerCase().includes('updat') ? 'update' :
                      action.toLowerCase().includes('delet') ? 'delete' : 'update';

    this.logAudit({
      category: 'crud',
      action,
      page,
      entityType,
      entityId,
      entityName,
      changeType,
      oldValues,
      newValues,
      description: `${action} ${entityType}: ${entityName}`
    });
  }

  public logAuth(action: string, description: string): void {
    this.logAudit({
      category: 'auth',
      action,
      page: 'Authentication',
      changeType: 'update',
      description
    });
  }

  public logSettings(action: string, page: string, section: string, oldValues?: any, newValues?: any): void {
    this.logAudit({
      category: 'settings',
      action,
      page,
      section,
      changeType: 'update',
      oldValues,
      newValues,
      description: `${action} in ${page} > ${section}`
    });
  }
}

// Export singleton instance
export const auditService = new AuditService();
export default auditService;
