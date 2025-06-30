export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  vatNumber?: string;
  email: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  logo?: string;
  signature?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranchCode?: string;
  swiftCode?: string;
  currency?: string;
  taxRate?: number;
  invoiceTerms?: string;
  invoiceNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyAssets {
  logo?: string;
  signature?: string;
  stamp?: string;
}
