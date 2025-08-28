/**
 * Audit Provider Component
 * Automatically tracks navigation and provides audit context to child components
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuditLogger } from '@/hooks/useAuditLogger';

interface AuditContextType {
  logNavigation: (section?: string) => void;
  logCreate: (entityType: string, entityName: string, entityId?: string, newValues?: any) => void;
  logUpdate: (entityType: string, entityName: string, entityId: string, oldValues?: any, newValues?: any) => void;
  logDelete: (entityType: string, entityName: string, entityId: string) => void;
  logAuth: (action: string, description: string) => void;
  logSettings: (action: string, section: string, oldValues?: any, newValues?: any) => void;
  logFinancial: (action: string, entityType: string, entityName: string, entityId?: string, amount?: number) => void;
  logHR: (action: string, entityType: string, entityName: string, entityId?: string, metadata?: any) => void;
  logDocument: (action: string, documentType: string, documentName: string, documentId?: string) => void;
  logSystem: (action: string, description: string, metadata?: any) => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};

interface AuditProviderProps {
  children: React.ReactNode;
}

export const AuditProvider: React.FC<AuditProviderProps> = ({ children }) => {
  const location = useLocation();
  const auditLogger = useAuditLogger();

  // Auto-track navigation changes
  useEffect(() => {
    auditLogger.logNavigation();
  }, [location.pathname, auditLogger]);

  const contextValue: AuditContextType = {
    logNavigation: auditLogger.logNavigation,
    logCreate: auditLogger.logCreate,
    logUpdate: auditLogger.logUpdate,
    logDelete: auditLogger.logDelete,
    logAuth: auditLogger.logAuth,
    logSettings: auditLogger.logSettings,
    logFinancial: auditLogger.logFinancial,
    logHR: auditLogger.logHR,
    logDocument: auditLogger.logDocument,
    logSystem: auditLogger.logSystem,
  };

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
};

export default AuditProvider;
