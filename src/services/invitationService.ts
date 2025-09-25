import { v4 as uuidv4 } from 'uuid';
import { UserPermissions } from './permissionService';
import { safeLocalStorage, safeString } from '@/utils/safeAccess';
import { UserCredentials } from './resetLocalAuth';

export interface InvitedUser {
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  invitedAt: number; // timestamp
  permissions: UserPermissions;
  password?: string;
  isAccepted: boolean;
  companyId: string; // Company-scoped isolation
  expiresAt: number; // Explicit expiry timestamp
}

export interface InvitationDetails {
  token: string;
  email: string;
  role: string;
  invitedBy: string;
  companyId: string;
  expiresAt: number;
}

/**
 * Creates a new invitation with a secure token and company scope
 */
export const createInvitation = (email: string, role: string, invitedBy: string, permissions: UserPermissions, companyId: string): InvitationDetails => {
  try {
    const token = uuidv4();
    const invitedUsers = getInvitedUsers();
    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days expiry
    
    // Check if email already has pending invitation for this company
    const existingInvitation = Object.values(invitedUsers).find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.companyId === companyId && 
      !user.isAccepted && 
      user.expiresAt > now
    );
    
    if (existingInvitation) {
      throw new Error('User already has a pending invitation for this company');
    }
    
    // Store the invitation in localStorage
    invitedUsers[token] = {
      email: safeString(email),
      role: safeString(role),
      token,
      invitedBy: safeString(invitedBy),
      invitedAt: now,
      expiresAt,
      permissions,
      isAccepted: false,
      companyId: safeString(companyId)
    };
    
    safeLocalStorage.setItem('invitedUsers', invitedUsers);
    
    return {
      token,
      email: safeString(email),
      role: safeString(role),
      invitedBy: safeString(invitedBy),
      companyId: safeString(companyId),
      expiresAt
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
};

/**
 * Get all invited users
 */
export const getInvitedUsers = (): Record<string, InvitedUser> => {
  try {
    return safeLocalStorage.getItem<Record<string, InvitedUser>>('invitedUsers', {});
  } catch (error) {
    console.error('Error getting invited users:', error);
    return {};
  }
};

/**
 * Validate an invitation token with company scope
 */
export const validateInvitationToken = (token: string): { email: string; role: string; permissions: UserPermissions; companyId: string; } | null => {
  const invitedUsers = getInvitedUsers();
  const invitation = invitedUsers[token];
  
  if (!invitation) {
    return null;
  }
  
  if (invitation.isAccepted) {
    return null; // Token already used
  }
  
  // Check if token has expired (7 days)
  const now = Date.now();
  if (now > invitation.expiresAt) {
    return null; // Token expired
  }
  
  // Return user info if token is valid
  return {
    email: invitation.email,
    role: invitation.role,
    permissions: invitation.permissions,
    companyId: invitation.companyId
  };
};

/**
 * Complete an invitation by marking it as accepted
 */
export const completeInvitation = (token: string, userData: {
  name: string;
  surname: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  companyId: string;
}, password?: string): boolean => {
  const invitedUsers = getInvitedUsers();
  const invitation = invitedUsers[token];
  
  if (!invitation || invitation.isAccepted) {
    return false;
  }
  
  // Update invitation
  invitation.isAccepted = true;
  safeLocalStorage.setItem('invitedUsers', invitedUsers);
  
  // Add the complete user to localStorage userCredentials
  const userCredentials = safeLocalStorage.getItem<Record<string, UserCredentials>>('userCredentials', {});
  const newUserId = uuidv4();
  
  // Validate company scope
  if (invitation.companyId !== userData.companyId) {
    return false; // Cross-company invitation attempt
  }
  
  userCredentials[newUserId] = {
    email: invitation.email,
    password: password || 'changeme123', // This should be changed by the user
    role: invitation.role,
    permissions: invitation.permissions,
    fullName: `${userData.name} ${userData.surname}`.trim()
  };
  
  safeLocalStorage.setItem('userCredentials', userCredentials);
  
  return true;
};

/**
 * Generate an invitation link for the current host
 */
export const generateInvitationLink = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invited-signup?token=${token}`;
};

/**
 * Get pending invitations count
 */
export const getPendingInvitationsCount = (): number => {
  const invitedUsers = getInvitedUsers();
  return Object.values(invitedUsers).filter(user => !user.isAccepted).length;
};
