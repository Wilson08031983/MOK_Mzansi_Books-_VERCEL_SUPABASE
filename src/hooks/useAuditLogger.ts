/**
 * Audit Logger Hook
 * Provides easy-to-use audit logging functions for React components
 */

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { auditService } from '@/services/auditService';

export const useAuditLogger = () => {
  const location = useLocation();

  // Get current page name from pathname
  const getCurrentPage = useCallback(() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/company') return 'My Company';
    if (path === '/clients') return 'Clients';
    if (path === '/quotations') return 'Quotations';
    if (path === '/invoices') return 'Invoices';
    if (path === '/projects') return 'Projects';
    if (path === '/inventory') return 'Inventory';
    if (path === '/hr') return 'HR Management';
    if (path === '/accounting') return 'Accounting';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    
    // Extract page name from path
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : 'Unknown';
  }, [location.pathname]);

  // Navigation logging
  const logNavigation = useCallback((section?: string) => {
    auditService.logNavigation(getCurrentPage(), section);
  }, [getCurrentPage]);

  // CRUD operations logging
  const logCreate = useCallback((entityType: string, entityName: string, entityId?: string, newValues?: any) => {
    auditService.logCRUD(
      `Created ${entityType}`,
      entityType,
      entityId || 'new',
      entityName,
      getCurrentPage(),
      undefined,
      newValues
    );
  }, [getCurrentPage]);

  const logUpdate = useCallback((entityType: string, entityName: string, entityId: string, oldValues?: any, newValues?: any) => {
    auditService.logCRUD(
      `Updated ${entityType}`,
      entityType,
      entityId,
      entityName,
      getCurrentPage(),
      oldValues,
      newValues
    );
  }, [getCurrentPage]);

  const logDelete = useCallback((entityType: string, entityName: string, entityId: string) => {
    auditService.logCRUD(
      `Deleted ${entityType}`,
      entityType,
      entityId,
      entityName,
      getCurrentPage()
    );
  }, [getCurrentPage]);

  // Authentication logging
  const logAuth = useCallback((action: string, description: string) => {
    auditService.logAuth(action, description);
  }, []);

  // Settings logging
  const logSettings = useCallback((action: string, section: string, oldValues?: any, newValues?: any) => {
    auditService.logSettings(action, getCurrentPage(), section, oldValues, newValues);
  }, [getCurrentPage]);

  // Financial operations logging
  const logFinancial = useCallback((action: string, entityType: string, entityName: string, entityId?: string, amount?: number) => {
    auditService.logAudit({
      category: 'financial',
      action,
      page: getCurrentPage(),
      entityType,
      entityId: entityId || 'new',
      entityName,
      changeType: action.toLowerCase().includes('creat') ? 'create' :
                  action.toLowerCase().includes('updat') ? 'update' :
                  action.toLowerCase().includes('delet') ? 'delete' :
                  action.toLowerCase().includes('send') ? 'send' : 'update',
      description: `${action} ${entityType}: ${entityName}${amount ? ` (Amount: ${amount})` : ''}`,
      metadata: { amount }
    });
  }, [getCurrentPage]);

  // HR operations logging
  const logHR = useCallback((action: string, entityType: string, entityName: string, entityId?: string, metadata?: any) => {
    auditService.logAudit({
      category: 'hr',
      action,
      page: getCurrentPage(),
      entityType,
      entityId: entityId || 'new',
      entityName,
      changeType: action.toLowerCase().includes('creat') ? 'create' :
                  action.toLowerCase().includes('updat') ? 'update' :
                  action.toLowerCase().includes('delet') ? 'delete' : 'update',
      description: `${action} ${entityType}: ${entityName}`,
      metadata
    });
  }, [getCurrentPage]);

  // Document operations logging
  const logDocument = useCallback((action: string, documentType: string, documentName: string, documentId?: string) => {
    auditService.logAudit({
      category: 'document',
      action,
      page: getCurrentPage(),
      entityType: documentType,
      entityId: documentId || 'new',
      entityName: documentName,
      changeType: action.toLowerCase().includes('upload') ? 'import' :
                  action.toLowerCase().includes('download') ? 'export' :
                  action.toLowerCase().includes('delet') ? 'delete' :
                  action.toLowerCase().includes('view') ? 'read' : 'update',
      description: `${action} ${documentType}: ${documentName}`
    });
  }, [getCurrentPage]);

  // System operations logging
  const logSystem = useCallback((action: string, description: string, metadata?: any) => {
    auditService.logAudit({
      category: 'system',
      action,
      page: getCurrentPage(),
      changeType: 'update',
      description,
      metadata
    });
  }, [getCurrentPage]);

  // Generic audit logging with full control
  const logAudit = useCallback((params: {
    category: 'navigation' | 'crud' | 'auth' | 'settings' | 'financial' | 'hr' | 'document' | 'system';
    action: string;
    section?: string;
    entityType?: string;
    entityId?: string;
    entityName?: string;
    changeType: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'send' | 'approve' | 'reject';
    oldValues?: any;
    newValues?: any;
    description: string;
    metadata?: any;
  }) => {
    auditService.logAudit({
      ...params,
      page: getCurrentPage()
    });
  }, [getCurrentPage]);

  return {
    logNavigation,
    logCreate,
    logUpdate,
    logDelete,
    logAuth,
    logSettings,
    logFinancial,
    logHR,
    logDocument,
    logSystem,
    logAudit,
    getCurrentPage
  };
};

export default useAuditLogger;
