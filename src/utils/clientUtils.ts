/**
 * Client Utilities
 * 
 * This module provides utility functions for working with client data,
 * including formatting addresses, display names, and contact information.
 */

import * as localStorageService from '../services/localStorageService';

// Client interface
export interface Client {
  id: string;
  name?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  vatNumber?: string;
  regNumber?: string;
  contactPerson?: string;
  
  // Billing address fields
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  
  // Shipping address fields
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  
  // Legacy address fields
  address?: string;
  billingAddress?: string;
  shippingAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  
  // Other fields
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Format a client's address with priority-based fallbacks
 * @param client The client object
 * @param addressType The type of address to format ('billing' or 'shipping')
 * @returns Formatted address string
 */
export const formatAddress = (client: Client, addressType: 'billing' | 'shipping' = 'billing'): string => {
  if (!client) return '';
  
  // Priority 1: Use structured address fields (billingStreet, billingCity, etc.)
  const prefix = addressType === 'billing' ? 'billing' : 'shipping';
  const street = client[`${prefix}Street` as keyof Client] as string;
  const city = client[`${prefix}City` as keyof Client] as string;
  const state = client[`${prefix}State` as keyof Client] as string;
  const postal = client[`${prefix}Postal` as keyof Client] as string;
  const country = client[`${prefix}Country` as keyof Client] as string;
  
  if (street || city || state || postal) {
    const parts = [];
    if (street) parts.push(street);
    
    const cityStatePostal = [city, state, postal].filter(Boolean).join(', ');
    if (cityStatePostal) parts.push(cityStatePostal);
    
    if (country) parts.push(country);
    
    return parts.join('\n');
  }
  
  // Priority 2: Use legacy address fields (billingAddress, shippingAddress, address)
  if (addressType === 'billing' && client.billingAddress) {
    return client.billingAddress;
  }
  
  if (addressType === 'shipping' && client.shippingAddress) {
    return client.shippingAddress;
  }
  
  if (client.address) {
    return client.address;
  }
  
  // Priority 3: Use individual address line fields
  const addressLines = [
    client.addressLine1,
    client.addressLine2,
    client.addressLine3,
    client.addressLine4
  ].filter(Boolean);
  
  if (addressLines.length > 0) {
    return addressLines.join('\n');
  }
  
  return '';
};

/**
 * Get a client's display name with priority-based fallbacks
 * @param client The client object
 * @returns Display name string
 */
export const getDisplayName = (client: Client): string => {
  if (!client) return '';
  
  // Priority 1: Company name
  if (client.companyName) {
    return client.companyName;
  }
  
  // Priority 2: Full name (name field)
  if (client.name) {
    return client.name;
  }
  
  // Priority 3: First name + last name
  if (client.firstName || client.lastName) {
    return [client.firstName, client.lastName].filter(Boolean).join(' ');
  }
  
  // Priority 4: Contact person
  if (client.contactPerson) {
    return client.contactPerson;
  }
  
  // Priority 5: Email (fallback)
  if (client.email) {
    return client.email;
  }
  
  return 'Unnamed Client';
};

/**
 * Get a client's contact information
 * @param client The client object
 * @returns Object with email and phone properties
 */
export const getContactInfo = (client: Client): { email: string; phone: string } => {
  if (!client) return { email: '', phone: '' };
  
  const email = client.email || '';
  
  // Use mobile if available, otherwise use phone
  const phone = client.mobile || client.phone || '';
  
  return { email, phone };
};

/**
 * Get a client by ID from localStorage
 * @param clientId The client ID
 * @returns Client object or null if not found
 */
export const getClientById = (clientId: string): Client | null => {
  if (!clientId) return null;
  
  // Get clients from localStorage
  const clients = localStorageService.getItem<Client[]>('clients', []);
  
  // Find client by ID
  const client = clients.find(c => c.id === clientId);
  
  return client || null;
};

/**
 * Format client data for PDF generation
 * @param client The client object
 * @returns Formatted client data for PDF
 */
export const formatClientForPdf = (client: Client): {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  vatNumber: string;
  regNumber: string;
} => {
  if (!client) {
    return {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      vatNumber: '',
      regNumber: ''
    };
  }
  
  const displayName = getDisplayName(client);
  const contactInfo = getContactInfo(client);
  const address = formatAddress(client, 'billing');
  
  // Determine contact person (if different from name)
  let contactPerson = '';
  if (client.contactPerson && client.companyName && client.contactPerson !== client.companyName) {
    contactPerson = client.contactPerson;
  }
  
  return {
    name: displayName,
    contactPerson,
    email: contactInfo.email,
    phone: contactInfo.phone,
    address,
    vatNumber: client.vatNumber || '',
    regNumber: client.regNumber || ''
  };
};
