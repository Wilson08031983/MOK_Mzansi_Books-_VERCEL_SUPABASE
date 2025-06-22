import { v4 as uuidv4 } from 'uuid';

export interface InvitedUser {
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  invitedAt: number; // timestamp
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
export const createInvitation = (email: string, role: string, invitedBy: string): InvitationDetails => {
  const token = uuidv4();
  const invitedUsers = getInvitedUsers();
  
  // Store the invitation in localStorage
  invitedUsers[token] = {
    email,
    role,
    token,
    invitedBy,
    invitedAt: Date.now(),
    isAccepted: false
  };
  
  localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
  
  return {
    token,
    email,
    role,
    invitedBy
  };
};

/**
 * Get all invited users
 */
export const getInvitedUsers = (): Record<string, InvitedUser> => {
  const stored = localStorage.getItem('invitedUsers');
  return stored ? JSON.parse(stored) : {};
};

/**
 * Validate an invitation token
 */
export const validateInvitationToken = (token: string): InvitedUser | null => {
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
  
  return invitation;
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
}): boolean => {
  const invitedUsers = getInvitedUsers();
  const invitation = invitedUsers[token];
  
  if (!invitation || invitation.isAccepted) {
    return false;
  }
  
  // Update invitation
  invitation.isAccepted = true;
  localStorage.setItem('invitedUsers', JSON.stringify(invitedUsers));
  
  // Add the complete user to localStorage userCredentials
  const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
  const newUserId = uuidv4();
  
  userCredentials[newUserId] = {
    email: invitation.email,
    password: invitation.password || 'changeme123', // This should be changed by the user
    role: invitation.role,
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
  
  localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
  
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
