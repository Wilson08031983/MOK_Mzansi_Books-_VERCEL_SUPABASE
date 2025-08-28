/**
 * Test Audit Log Functionality
 * Creates sample audit entries to demonstrate the comprehensive logging system
 */

import { auditService } from '@/services/auditService';

export const generateSampleAuditEntries = () => {
  console.log('🔍 Generating sample audit entries...');

  // Navigation entries
  auditService.logNavigation('Dashboard');
  auditService.logNavigation('Invoices', 'Create Invoice');
  auditService.logNavigation('Settings', 'General Tab');

  // CRUD operations
  auditService.logCRUD(
    'Created Invoice',
    'invoice',
    'INV-001',
    'Invoice for ABC Company',
    'Invoices',
    undefined,
    { amount: 1500, client: 'ABC Company', status: 'draft' }
  );

  auditService.logCRUD(
    'Updated Client',
    'client',
    'CLI-001',
    'XYZ Corporation',
    'Clients',
    { name: 'XYZ Corp', email: 'old@xyz.com' },
    { name: 'XYZ Corporation', email: 'new@xyz.com' }
  );

  auditService.logCRUD(
    'Deleted Expense',
    'expense',
    'EXP-001',
    'Office Supplies',
    'Accounting',
    { amount: 250, category: 'supplies' }
  );

  // Authentication events
  auditService.logAuth('User Login', 'User successfully logged in');
  auditService.logAuth('Password Changed', 'User changed their password');
  auditService.logAuth('Failed Login Attempt', 'Invalid credentials provided');

  // Settings changes
  auditService.logSettings(
    'Updated Company Details',
    'Settings',
    'General Tab',
    { companyName: 'Old Company Name' },
    { companyName: 'MOK Mzansi Books' }
  );

  auditService.logSettings(
    'Changed Theme',
    'Settings',
    'Appearance',
    { theme: 'light' },
    { theme: 'dark' }
  );

  // Financial operations
  auditService.logAudit({
    category: 'financial',
    action: 'Generated VAT Return',
    page: 'Accounting',
    section: 'Tax Management',
    entityType: 'vat_return',
    entityId: 'VAT-2024-Q1',
    entityName: 'Q1 2024 VAT Return',
    changeType: 'create',
    description: 'Generated VAT return for Q1 2024',
    metadata: { period: 'Q1 2024', totalVAT: 2500 }
  });

  auditService.logAudit({
    category: 'financial',
    action: 'Sent Invoice',
    page: 'Invoices',
    entityType: 'invoice',
    entityId: 'INV-002',
    entityName: 'Invoice for DEF Ltd',
    changeType: 'send',
    description: 'Invoice sent to client via email',
    metadata: { recipient: 'billing@def.com', amount: 3200 }
  });

  // HR operations
  auditService.logAudit({
    category: 'hr',
    action: 'Added Employee',
    page: 'HR Management',
    section: 'Employee Management',
    entityType: 'employee',
    entityId: 'EMP-001',
    entityName: 'John Smith',
    changeType: 'create',
    description: 'New employee added to payroll system',
    newValues: {
      name: 'John Smith',
      position: 'Accountant',
      salary: 45000,
      startDate: '2024-01-15'
    }
  });

  auditService.logAudit({
    category: 'hr',
    action: 'Processed Payroll',
    page: 'HR Management',
    section: 'Payroll',
    entityType: 'payroll',
    entityId: 'PAY-2024-01',
    entityName: 'January 2024 Payroll',
    changeType: 'create',
    description: 'Monthly payroll processed for all employees',
    metadata: { month: 'January 2024', employeeCount: 5, totalAmount: 225000 }
  });

  // Document operations
  auditService.logAudit({
    category: 'document',
    action: 'Uploaded Bank Statement',
    page: 'Accounting',
    section: 'Bank Reconciliation',
    entityType: 'bank_statement',
    entityId: 'BS-2024-01',
    entityName: 'January 2024 Bank Statement',
    changeType: 'import',
    description: 'Bank statement uploaded for reconciliation',
    metadata: { fileSize: '2.5MB', format: 'PDF' }
  });

  auditService.logAudit({
    category: 'document',
    action: 'Downloaded Report',
    page: 'Reports',
    entityType: 'report',
    entityId: 'RPT-001',
    entityName: 'Financial Summary Report',
    changeType: 'export',
    description: 'Financial summary report downloaded as PDF',
    metadata: { format: 'PDF', period: 'Q4 2023' }
  });

  // System operations
  auditService.logAudit({
    category: 'system',
    action: 'Database Backup',
    page: 'System',
    changeType: 'create',
    description: 'Automated database backup completed successfully',
    metadata: { backupSize: '150MB', duration: '2.3 seconds' }
  });

  auditService.logAudit({
    category: 'system',
    action: 'Cache Cleared',
    page: 'System',
    changeType: 'delete',
    description: 'System cache cleared by administrator',
    metadata: { cacheSize: '45MB', reason: 'Performance optimization' }
  });

  // Critical security events
  auditService.logAudit({
    category: 'auth',
    action: 'Admin Permission Granted',
    page: 'Settings',
    section: 'User Management',
    entityType: 'user',
    entityId: 'USR-002',
    entityName: 'Jane Doe',
    changeType: 'update',
    description: 'Admin permissions granted to user',
    oldValues: { role: 'Staff' },
    newValues: { role: 'Manager' }
  });

  console.log('✅ Sample audit entries generated successfully!');
  console.log('📊 Navigate to Company > Activity Log to view the comprehensive audit trail');
};

// Function to clear audit log for testing
export const clearAuditLog = () => {
  auditService.clearAuditLog();
  console.log('🗑️ Audit log cleared');
};

// Function to export audit log
export const exportAuditLog = () => {
  const data = auditService.exportAuditLog();
  console.log('📤 Audit log exported:', data);
  return data;
};
