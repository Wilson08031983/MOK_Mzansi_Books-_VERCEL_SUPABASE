// Permission service to handle role-based access control for pages
// This service manages page permissions for different user roles

import { v4 as uuidv4 } from 'uuid';
import {
  FileText,
  Users,
  Receipt,
  Building2,
  UserCheck,
  Calculator,
  Briefcase,
  PackageOpen,
  PieChart,
  Settings,
  BarChart3
} from 'lucide-react';

export interface PagePermission {
  read: boolean;
  write: boolean;
}

export interface UserPermissions {
  [page: string]: PagePermission;
}

// List of pages that can be managed with permissions
export const pagesToManage = [
  { name: 'My Company', icon: Building2 },
  { name: 'Clients', icon: Users },
  { name: 'Quotations', icon: Receipt },
  { name: 'Invoices', icon: FileText },
  { name: 'Projects', icon: Briefcase },
  { name: 'Inventory', icon: PackageOpen },
  { name: 'HR Management', icon: UserCheck },
  { name: 'Accounting', icon: Calculator },
  { name: 'Reports', icon: PieChart },
  { name: 'Settings', icon: Settings }
];

// Available pages that can have permissions assigned
export const PERMISSION_PAGES = pagesToManage.map(page => page.name);

// Pages that should never be accessible to non-admin users
export const ADMIN_ONLY_PAGES = ['Settings'];

// Pages that should always be accessible to all users
export const ALWAYS_ACCESSIBLE_PAGES = ['Dashboard'];

// Default page permissions (no access)
export const getDefaultPermissions = (): UserPermissions => {
  const permissions: UserPermissions = {};
  
  // Set default permissions (no access) for all permission pages
  PERMISSION_PAGES.forEach(page => {
    permissions[page] = { read: false, write: false };
  });
  
  // Always accessible pages
  ALWAYS_ACCESSIBLE_PAGES.forEach(page => {
    permissions[page] = { read: true, write: true };
  });
  
  return permissions;
};

// Get default admin permissions (full access to everything)
export const getAdminPermissions = (): UserPermissions => {
  const permissions: UserPermissions = {};
  
  // Admin users have full access to all permission pages
  PERMISSION_PAGES.forEach(page => {
    permissions[page] = { read: true, write: true };
  });
  
  // Admin-only pages
  ADMIN_ONLY_PAGES.forEach(page => {
    permissions[page] = { read: true, write: true };
  });
  
  // Always accessible pages
  ALWAYS_ACCESSIBLE_PAGES.forEach(page => {
    permissions[page] = { read: true, write: true };
  });
  
  return permissions;
};

// Store user permissions in localStorage
export const saveUserPermissions = (userId: string, permissions: UserPermissions): void => {
  try {
    // Get existing permissions from localStorage or initialize empty object
    const storedPermissions = localStorage.getItem('userPermissions') || '{}';
    const allPermissions = JSON.parse(storedPermissions);
    
    // Update permissions for this user
    allPermissions[userId] = permissions;
    
    // Save back to localStorage
    localStorage.setItem('userPermissions', JSON.stringify(allPermissions));
  } catch (error) {
    console.error('Error saving user permissions:', error);
  }
};

// Get user permissions from localStorage
export const getUserPermissions = (userId: string): UserPermissions => {
  try {
    // Get stored permissions
    const storedPermissions = localStorage.getItem('userPermissions');
    if (!storedPermissions) {
      return getDefaultPermissions();
    }
    
    const allPermissions = JSON.parse(storedPermissions);
    return allPermissions[userId] || getDefaultPermissions();
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return getDefaultPermissions();
  }
};

// Check if a user has read permission for a specific page
export const hasReadPermission = (userId: string, pageName: string): boolean => {
  // Always allow access to pages that should always be accessible
  if (ALWAYS_ACCESSIBLE_PAGES.includes(pageName)) {
    return true;
  }
  
  // Get user permissions
  const permissions = getUserPermissions(userId);
  
  // Check if user has read permission for the page
  return permissions[pageName]?.read === true;
};

// Check if a user has write permission for a specific page
export const hasWritePermission = (userId: string, pageName: string): boolean => {
  // Get user permissions
  const permissions = getUserPermissions(userId);
  
  // Check if user has write permission for the page
  return permissions[pageName]?.write === true;
};

// Check if a given role is an admin role
export const isAdminRole = (role: string): boolean => {
  const ADMIN_ROLES = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];
  return ADMIN_ROLES.includes(role);
};
