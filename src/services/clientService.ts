import { v4 as uuidv4 } from 'uuid';
import { safeLocalStorage, safeGet, safeArray, safeString } from '@/utils/safeAccess';

export interface Client {
  id: string;
  clientType: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  websiteNotApplicable: boolean;
  taxNumber: string;
  registrationNumber: string;
  vatNumber: string;
  vatNumberNotApplicable: boolean;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostal: string;
  billingCountry: string;
  sameAsBilling: boolean;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  shippingCountry: string;
  paymentTerms: string;
  currency: string;
  creditLimit: string;
  discountRate: string;
  preferredPaymentMethod: string;
  notes: string;
  tags: string;
  referralSource: string;
  avatar: string;
  status: string;
  type: string;
  totalValue: number;
  lastActivity: string;
  createdAt?: string;
}

export type ClientFormData = Omit<Client, 'id' | 'avatar' | 'status' | 'type' | 'totalValue' | 'lastActivity'> & {
  clientType: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  websiteNotApplicable?: boolean;
  taxNumber: string;
  registrationNumber: string;
  vatNumber: string;
  vatNumberNotApplicable?: boolean;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostal: string;
  billingCountry: string;
  sameAsBilling: boolean;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  shippingCountry: string;
  paymentTerms: string;
  currency: string;
  creditLimit: string;
  discountRate: string;
  preferredPaymentMethod: string;
  notes: string;
  tags: string;
  referralSource: string;
}

// Get all clients from localStorage
export function getClients(): Client[] {
  try {
    const clientsData = safeLocalStorage.getItem('clients', null);
    return safeArray(clientsData) as Client[];
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
}

// Get client by ID
export function getClientById(id: string): Client | undefined {
  const clients = getClients();
  return clients.find((client: Client) => client.id === id);
}

// Save all clients to localStorage
export function saveClients(clients: Client[]): void {
  try {
    safeLocalStorage.setItem('clients', clients);
  } catch (error) {
    console.error('Error saving clients:', error);
  }
}

// Add a new client
export function addClient(clientData: ClientFormData): Client {
  const clients = getClients();
  
  // Generate avatar from name
  const generateAvatar = (name: string): string => {
    const nameParts = name.split(' ');
    const avatar = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
    return avatar;
  }
  
  // Create new client object
  const newClient: Client = {
    id: uuidv4(),
    ...clientData,
    status: 'Active',
    type: clientData.clientType === 'individual' ? 'Individual' : 'Business',
    totalValue: 0,
    lastActivity: new Date().toISOString(),
    avatar: generateAvatar(clientData.contactPerson)
  };
  
  // Add to list and save
  clients.push(newClient);
  saveClients(clients);
  
  return newClient;
}

// Update an existing client
export function updateClient(id: string, clientData: Partial<Client>): Client | null {
  const clients = getClients();
  const index = clients.findIndex((client: Client) => client.id === id);
  
  if (index !== -1) {
    clients[index] = { ...clients[index], ...clientData };
    saveClients(clients);
    return clients[index];
  }
  
  return null;
}

// Delete a client
export function deleteClient(id: string): boolean {
  const clients = getClients();
  const updatedClients = clients.filter((client: Client) => client.id !== id);
  
  if (updatedClients.length === clients.length) return false;
  
  saveClients(updatedClients);
  return true;
}

// Delete multiple clients
export function deleteClients(ids: string[]): boolean {
  const clients = getClients();
  const updatedClients = clients.filter(client => !ids.includes(client.id));
  
  saveClients(updatedClients);
  return true;
}

// Initialize clients in localStorage if it doesn't exist
export const initializeClients = (): Client[] => {
  let clients = getClients();
  
  if (clients.length === 0) {
    const sampleClients: Client[] = [
      {
        id: uuidv4(),
        clientType: 'business',
        companyName: 'Tech Solutions Ltd',
        contactPerson: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '+27 11 123 4567',
        website: 'https://techsolutions.com',
        websiteNotApplicable: false,
        taxNumber: '1234567890',
        registrationNumber: 'REG123456',
        vatNumber: 'VAT4567890',
        vatNumberNotApplicable: false,
        billingStreet: '123 Main Street',
        billingCity: 'Johannesburg',
        billingState: 'Gauteng',
        billingPostal: '2000',
        billingCountry: 'South Africa',
        sameAsBilling: true,
        shippingStreet: '123 Main Street',
        shippingCity: 'Johannesburg',
        shippingState: 'Gauteng',
        shippingPostal: '2000',
        shippingCountry: 'South Africa',
        paymentTerms: '30',
        currency: 'ZAR',
        creditLimit: '50000',
        discountRate: '0',
        preferredPaymentMethod: 'bank_transfer',
        notes: 'Long-term client since 2020',
        tags: 'tech,software,premium',
        referralSource: 'Website',
        createdAt: new Date('2024-01-01').toISOString(),
        lastActivity: new Date('2024-01-15').toISOString(),
        status: 'active',
        type: 'Business',
        totalValue: 45000,
        avatar: 'JS'
      },
      {
        id: uuidv4(),
        clientType: 'business',
        companyName: 'Creative Agency',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@creative.com',
        phone: '+27 21 987 6543',
        website: 'https://creativeagency.com',
        websiteNotApplicable: false,
        taxNumber: '0987654321',
        registrationNumber: 'REG654321',
        vatNumber: 'VAT7654321',
        vatNumberNotApplicable: false,
        billingStreet: '456 Oak Avenue',
        billingCity: 'Cape Town',
        billingState: 'Western Cape',
        billingPostal: '8001',
        billingCountry: 'South Africa',
        sameAsBilling: true,
        shippingStreet: '456 Oak Avenue',
        shippingCity: 'Cape Town',
        shippingState: 'Western Cape',
        shippingPostal: '8001',
        shippingCountry: 'South Africa',
        paymentTerms: '30',
        currency: 'ZAR',
        creditLimit: '40000',
        discountRate: '5',
        preferredPaymentMethod: 'credit_card',
        notes: 'Prefers digital invoices',
        tags: 'design,creative,marketing',
        referralSource: 'Referral',
        createdAt: new Date('2024-01-02').toISOString(),
        lastActivity: new Date('2024-01-14').toISOString(),
        status: 'active',
        type: 'Business',
        totalValue: 32000,
        avatar: 'SJ'
      },
      {
        id: uuidv4(),
        clientType: 'individual',
        companyName: '',
        contactPerson: 'Michael Chen',
        email: 'michael@email.com',
        phone: '+27 31 555 0123',
        website: '',
        websiteNotApplicable: true,
        taxNumber: '5678901234',
        registrationNumber: '',
        vatNumber: '',
        vatNumberNotApplicable: true,
        billingStreet: '789 Pine Road',
        billingCity: 'Durban',
        billingState: 'KwaZulu-Natal',
        billingPostal: '4001',
        billingCountry: 'South Africa',
        sameAsBilling: false,
        shippingStreet: '987 Palm Lane',
        shippingCity: 'Durban',
        shippingState: 'KwaZulu-Natal',
        shippingPostal: '4001',
        shippingCountry: 'South Africa',
        paymentTerms: '15',
        currency: 'ZAR',
        creditLimit: '20000',
        discountRate: '0',
        preferredPaymentMethod: 'bank_transfer',
        notes: 'Requires printed invoices',
        tags: 'individual,priority',
        referralSource: 'Google Search',
        createdAt: new Date('2024-01-05').toISOString(),
        lastActivity: new Date('2024-01-10').toISOString(),
        status: 'overdue',
        type: 'Individual',
        totalValue: 15000,
        avatar: 'MC'
      },
      {
        id: uuidv4(),
        clientType: 'government',
        companyName: 'Government Dept',
        contactPerson: 'Emily Brown',
        email: 'emily@gov.za',
        phone: '+27 12 444 5555',
        website: 'https://gov.za/dept',
        websiteNotApplicable: false,
        taxNumber: '2345678901',
        registrationNumber: 'GOV123456',
        vatNumber: 'VATGOV123',
        vatNumberNotApplicable: false,
        billingStreet: '1 Government Avenue',
        billingCity: 'Pretoria',
        billingState: 'Gauteng',
        billingPostal: '0001',
        billingCountry: 'South Africa',
        sameAsBilling: true,
        shippingStreet: '1 Government Avenue',
        shippingCity: 'Pretoria',
        shippingState: 'Gauteng',
        shippingPostal: '0001',
        shippingCountry: 'South Africa',
        paymentTerms: '60',
        currency: 'ZAR',
        creditLimit: '100000',
        discountRate: '0',
        preferredPaymentMethod: 'bank_transfer',
        notes: 'Requires PO number on all invoices',
        tags: 'government,tender',
        referralSource: 'Tender Process',
        createdAt: new Date('2023-12-15').toISOString(),
        lastActivity: new Date('2024-01-08').toISOString(),
        status: 'inactive',
        type: 'Government',
        totalValue: 78000,
        avatar: 'EB'
      }
    ];
    
    saveClients(sampleClients);
    clients = sampleClients;
  }
  
  return clients;
};

// Client email invitation service
export interface ClientInvitationTemplate {
  subject: string;
  body: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
}

// Create invitation template
export const createInvitationTemplate = (clientId: string): ClientInvitationTemplate | undefined => {
  const client = getClientById(clientId);
  
  if (!client) return undefined;
  
  // Get company details from localStorage
  let companyName = 'Our Company';
  let contactPerson = 'Account Manager';
  
  try {
    const companyDetails = safeLocalStorage.getItem('companyDetails', null);
    if (companyDetails) {
      const company = safeGet(companyDetails, {});
      companyName = safeString(company.name) || companyName;
      contactPerson = safeString(company.contactPerson) || contactPerson;
    }
  } catch (error) {
    console.error('Error parsing company details:', error);
  }
  
  // Create template
  return {
    subject: `Welcome to ${companyName} - Your New Account`,
    body: `
Dear ${client.contactPerson},

Thank you for choosing ${companyName} for your business needs.

We have created an account for you in our client portal. Here, you can:
- View your invoices and statements
- Download receipts
- Update your contact information
- Request quotations
- Track your orders

Please let me know if you have any questions or need assistance.

Best regards,
${contactPerson}
${companyName}
    `,
    clientId: client.id,
    clientName: client.contactPerson,
    clientEmail: client.email
  };
};

export default {
  getClients,
  saveClients,
  addClient,
  getClientById,
  updateClient,
  deleteClient,
  deleteClients,
  initializeClients,
  createInvitationTemplate
};
