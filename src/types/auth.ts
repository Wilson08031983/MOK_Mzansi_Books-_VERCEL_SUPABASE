export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  surname: string;
  position: string;
  passwordHash: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  ownerUserId: string;
  contactEmail: string;
  registrationNumber?: string;
  vatNumber?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  purpose: 'email_verification' | 'password_reset';
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  event: 'send_attempt' | 'delivered' | 'bounced' | 'opened' | 'clicked';
  userId: string;
  companyId: string;
  templateId: string;
  postmarkMessageId?: string;
  status: 'success' | 'error' | 'pending';
  meta: Record<string, any>;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  event: string;
  userId?: string;
  companyId?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  resultCount?: number;
  meta: Record<string, any>;
  timestamp: string;
}

export interface SignupRequest {
  firstName: string;
  surname: string;
  companyName: string;
  email: string;
  position: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  companyId?: string;
  error?: string;
}

export interface VerificationRequest {
  token: string;
  userId: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}
