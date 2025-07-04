import { v4 as uuidv4 } from 'uuid';
import { UserPermissions } from './permissionService';
import { safeLocalStorage, safeGet, safeArray, safeString } from '@/utils/safeAccess';
import { UserCredentials } from './localAuthService';

export interface InvitedUser {
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  invitedAt: number; // timestamp
  permissions: UserPermissions;
  password?: string;
  isAccepted: boolean;
}

export interface InvitationDetails {
  token: string;
  email: string;
  role: string;
  invitedBy: string;
}

/**
 * Creates a new invitation with a secure token
 */
export const createInvitation = (email: string, role: string, invitedBy: string, permissions: UserPermissions): InvitationDetails => {
  try {
    const token = uuidv4();
    const invitedUsers = getInvitedUsers();
    
    // Store the invitation in localStorage
    invitedUsers[token] = {
      email: safeString(email),
      role: safeString(role),
      token,
      invitedBy: safeString(invitedBy),
      invitedAt: Date.now(),
      permissions,
      isAccepted: false
    };
    
    safeLocalStorage.setItem('invitedUsers', invitedUsers);
    
    return {
      token,
      email: safeString(email),
      role: safeString(role),
      invitedBy: safeString(invitedBy)
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }
};

/**
 * Get all invited users
 */
export const getInvitedUsers = (): Record<string, InvitedUser> => {
  try {
    const stored = safeLocalStorage.getItem('invitedUsers', null);
    return safeGet(stored, {}) as Record<string, InvitedUser>;
  } catch (error) {
    console.error('Error getting invited users:', error);
    return {};
  }
};

/**
 * Validate an invitation token
 */
export const validateInvitationToken = (token: string): { email: string; role: string; permissions: UserPermissions; } | null => {
  const invitedUsers = getInvitedUsers();
  const invitation = invitedUsers[token];
  
  if (!invitation) {
    return null;
  }
  
  if (invitation.isAccepted) {
    return null; // Token already used
  }
  
  // Check if token has expired (24 hours)
  const now = Date.now();
  const expiryTime = invitation.invitedAt + (24 * 60 * 60 * 1000);
  if (now > expiryTime) {
    return null; // Token expired
  }
  
  // Return user info if token is valid
  return {
    email: invitation.email,
    role: invitation.role,
    permissions: invitation.permissions
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
  const userCredentials = safeGet(safeLocalStorage.getItem('userCredentials', null), {}) as Record<string, UserCredentials>;
  const newUserId = uuidv4();
  
  userCredentials[newUserId] = {
    email: invitation.email,
    password: password || 'changeme123', // This should be changed by the user
    role: invitation.role,
    permissions: invitation.permissions,
    user_metadata: {
      first_name: userData.name,
      last_name: userData.surname,
      phone: userData.phoneNumber,
      address: {
        line1: userData.addressLine1,
        line2: userData.addressLine2,
        line3: userData.addressLine3,
        line4: userData.addressLine4
      },
      company_name: 'MOK Mzansi Books'
    }
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
